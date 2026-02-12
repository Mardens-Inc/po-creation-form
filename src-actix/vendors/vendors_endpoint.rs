use crate::auth::auth_middleware::validator;
use crate::auth::jwt_data::Claims;
use crate::events::broadcaster::{Broadcaster, SSEEvent};
use actix_web::web::Json;
use actix_web::{delete, get, post, put, web, HttpMessage, HttpRequest, HttpResponse, Responder, Result};
use actix_web_httpauth::middleware::HttpAuthentication;
use serde_json::json;

use super::vendors_data::{
    CreateVendorRequest, UpdateVendorRequest, VendorStatus, VendorWithRelations,
};
use super::vendors_db;

#[get("")]
pub async fn get_vendors() -> Result<impl Responder> {
    let vendors = vendors_db::get_all_vendors()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let mut result: Vec<VendorWithRelations> = Vec::new();
    for vendor in vendors {
        let vendor_id = vendor.id.unwrap_or(0);
        let contacts = vendors_db::get_contacts_by_vendor_id(vendor_id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        let ship_locations = vendors_db::get_ship_locations_by_vendor_id(vendor_id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        result.push(VendorWithRelations::from_vendor(vendor, contacts, ship_locations));
    }

    Ok(HttpResponse::Ok().json(result))
}

#[get("/{id}")]
pub async fn get_vendor(path: web::Path<u32>) -> Result<impl Responder> {
    let id = path.into_inner();
    let vendor = vendors_db::get_vendor_by_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    match vendor {
        Some(vendor) => {
            let contacts = vendors_db::get_contacts_by_vendor_id(id)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;
            let ship_locations = vendors_db::get_ship_locations_by_vendor_id(id)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;
            Ok(HttpResponse::Ok().json(VendorWithRelations::from_vendor(vendor, contacts, ship_locations)))
        }
        None => Ok(HttpResponse::NotFound().json(json!({
            "error": "Vendor not found",
        }))),
    }
}

#[post("")]
pub async fn create_vendor(
    req: HttpRequest,
    body: Json<CreateVendorRequest>,
    broadcaster: web::Data<Broadcaster>,
) -> Result<impl Responder> {
    let claims = req.extensions().get::<Claims>().cloned();
    let created_by = match claims {
        None => {
            return Ok(HttpResponse::Unauthorized().json(json!({
                "error": "Unauthorized",
            })))
        }
        Some(claims) => claims.sub as u32,
    };

    let body = body.into_inner();
    let pool = crate::app_db::get_or_init_pool()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let mut transaction = pool
        .begin()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let vendor_id = vendors_db::insert_vendor_with_transaction(
        &mut transaction,
        &body.name,
        &body.code,
        VendorStatus::Active,
        created_by,
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;

    for contact in &body.contacts {
        vendors_db::insert_contact_with_transaction(
            &mut transaction,
            vendor_id,
            &contact.first_name,
            &contact.last_name,
            &contact.email,
            &contact.phone,
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    }

    for location in &body.ship_locations {
        vendors_db::insert_ship_location_with_transaction(
            &mut transaction,
            vendor_id,
            &location.address,
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    }

    transaction
        .commit()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Fetch the created vendor with relations
    let vendor = vendors_db::get_vendor_by_id(vendor_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let contacts = vendors_db::get_contacts_by_vendor_id(vendor_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let ship_locations = vendors_db::get_ship_locations_by_vendor_id(vendor_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    match vendor {
        Some(vendor) => {
            broadcaster.send(SSEEvent::Vendors);
            Ok(HttpResponse::Ok().json(VendorWithRelations::from_vendor(
                vendor,
                contacts,
                ship_locations,
            )))
        }
        None => Ok(HttpResponse::InternalServerError().json(json!({
            "error": "Failed to retrieve created vendor",
        }))),
    }
}

#[put("/{id}")]
pub async fn update_vendor(
    path: web::Path<u32>,
    body: Json<UpdateVendorRequest>,
    broadcaster: web::Data<Broadcaster>,
) -> Result<impl Responder> {
    let id = path.into_inner();
    let body = body.into_inner();

    // Verify vendor exists
    let existing = vendors_db::get_vendor_by_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    if existing.is_none() {
        return Ok(HttpResponse::NotFound().json(json!({
            "error": "Vendor not found",
        })));
    }

    let pool = crate::app_db::get_or_init_pool()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let mut transaction = pool
        .begin()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    vendors_db::update_vendor_with_transaction(
        &mut transaction,
        id,
        body.name.as_deref(),
        body.code.as_deref(),
        body.status,
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;

    // Replace contacts if provided
    if let Some(contacts) = &body.contacts {
        vendors_db::delete_contacts_by_vendor_id_with_transaction(&mut transaction, id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        for contact in contacts {
            vendors_db::insert_contact_with_transaction(
                &mut transaction,
                id,
                &contact.first_name,
                &contact.last_name,
                &contact.email,
                &contact.phone,
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        }
    }

    // Replace ship locations if provided
    if let Some(locations) = &body.ship_locations {
        vendors_db::delete_ship_locations_by_vendor_id_with_transaction(&mut transaction, id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        for location in locations {
            vendors_db::insert_ship_location_with_transaction(
                &mut transaction,
                id,
                &location.address,
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        }
    }

    transaction
        .commit()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Fetch updated vendor with relations
    let vendor = vendors_db::get_vendor_by_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let contacts = vendors_db::get_contacts_by_vendor_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let ship_locations = vendors_db::get_ship_locations_by_vendor_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    match vendor {
        Some(vendor) => {
            broadcaster.send(SSEEvent::Vendors);
            Ok(HttpResponse::Ok().json(VendorWithRelations::from_vendor(
                vendor,
                contacts,
                ship_locations,
            )))
        }
        None => Ok(HttpResponse::InternalServerError().json(json!({
            "error": "Failed to retrieve updated vendor",
        }))),
    }
}

#[delete("/{id}")]
pub async fn delete_vendor(path: web::Path<u32>, broadcaster: web::Data<Broadcaster>) -> Result<impl Responder> {
    let id = path.into_inner();

    let existing = vendors_db::get_vendor_by_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    if existing.is_none() {
        return Ok(HttpResponse::NotFound().json(json!({
            "error": "Vendor not found",
        })));
    }

    vendors_db::delete_vendor(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    broadcaster.send(SSEEvent::Vendors);

    Ok(HttpResponse::Ok().json(json!({
        "message": "Vendor deleted successfully",
    })))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    let auth = HttpAuthentication::bearer(validator);
    cfg.service(
        web::scope("/vendors")
            .wrap(auth)
            .service(get_vendors)
            .service(get_vendor)
            .service(create_vendor)
            .service(update_vendor)
            .service(delete_vendor)
            .default_service(web::to(|| async {
                HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
            })),
    );
}

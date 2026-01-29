use crate::auth::auth_middleware::validator;
use crate::auth::jwt_data::Claims;
use actix_web::web::{Bytes, Json, Query};
use actix_web::{delete, get, post, put, web, HttpMessage, HttpRequest, HttpResponse, Responder, Result};
use actix_web_httpauth::middleware::HttpAuthentication;
use serde_json::json;

use super::purchase_orders_data::{
    CreatePurchaseOrderRequest, FileUploadQuery, PurchaseOrderResponse, UpdatePurchaseOrderRequest,
};
use super::purchase_orders_db;

const UPLOAD_DIR: &str = env!("PO_UPLOAD_DIR");

// ── Helper ────────────────────────────────────────────────────────────────────

async fn build_po_response(po_id: u32) -> Result<Option<PurchaseOrderResponse>> {
    let po = purchase_orders_db::get_po_by_id(po_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    match po {
        Some(po) => {
            let vendor_name = purchase_orders_db::get_vendor_name(po.vendor_id)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;
            let buyer_name = purchase_orders_db::get_buyer_name(po.buyer_id)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;
            let files = purchase_orders_db::get_files_by_po_id(po_id)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;
            Ok(Some(PurchaseOrderResponse::from_po(
                po,
                vendor_name,
                buyer_name,
                files,
            )))
        }
        None => Ok(None),
    }
}

// ── PO CRUD Endpoints ────────────────────────────────────────────────────────

#[get("")]
pub async fn get_purchase_orders() -> Result<impl Responder> {
    let pos = purchase_orders_db::get_all_pos()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let mut result: Vec<PurchaseOrderResponse> = Vec::new();
    for po in pos {
        let po_id = po.id.unwrap_or(0);
        let vendor_name = purchase_orders_db::get_vendor_name(po.vendor_id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        let buyer_name = purchase_orders_db::get_buyer_name(po.buyer_id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        let files = purchase_orders_db::get_files_by_po_id(po_id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        result.push(PurchaseOrderResponse::from_po(
            po,
            vendor_name,
            buyer_name,
            files,
        ));
    }

    Ok(HttpResponse::Ok().json(result))
}

#[get("/{id}")]
pub async fn get_purchase_order(path: web::Path<u32>) -> Result<impl Responder> {
    let id = path.into_inner();
    match build_po_response(id).await? {
        Some(response) => Ok(HttpResponse::Ok().json(response)),
        None => Ok(HttpResponse::NotFound().json(json!({
            "error": "Purchase order not found",
        }))),
    }
}

#[post("")]
pub async fn create_purchase_order(
    req: HttpRequest,
    body: Json<CreatePurchaseOrderRequest>,
) -> Result<impl Responder> {
    let claims = req.extensions().get::<Claims>().cloned();
    let buyer_id = match claims {
        None => {
            return Ok(HttpResponse::Unauthorized().json(json!({
                "error": "Unauthorized",
            })))
        }
        Some(claims) => claims.sub as u32,
    };

    let body = body.into_inner();
    let pool = crate::app_db::create_pool()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let mut transaction = pool
        .begin()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let po_id = purchase_orders_db::insert_po_with_transaction(
        &mut transaction,
        &body.po_number,
        body.vendor_id,
        buyer_id,
        &body.description,
        body.order_date,
        body.ship_date,
        body.cancel_date,
        body.shipping_notes.as_deref(),
        &body.terms,
        &body.ship_to_address,
        body.fob_type,
        &body.fob_point,
        body.notes.as_deref(),
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;

    transaction
        .commit()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    pool.close().await;

    match build_po_response(po_id).await? {
        Some(response) => Ok(HttpResponse::Ok().json(response)),
        None => Ok(HttpResponse::InternalServerError().json(json!({
            "error": "Failed to retrieve created purchase order",
        }))),
    }
}

#[put("/{id}")]
pub async fn update_purchase_order(
    path: web::Path<u32>,
    body: Json<UpdatePurchaseOrderRequest>,
) -> Result<impl Responder> {
    let id = path.into_inner();
    let body = body.into_inner();

    let existing = purchase_orders_db::get_po_by_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    if existing.is_none() {
        return Ok(HttpResponse::NotFound().json(json!({
            "error": "Purchase order not found",
        })));
    }

    let pool = crate::app_db::create_pool()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let mut transaction = pool
        .begin()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    purchase_orders_db::update_po_with_transaction(
        &mut transaction,
        id,
        body.po_number.as_deref(),
        body.vendor_id,
        body.status,
        body.description.as_deref(),
        body.order_date,
        body.ship_date,
        body.cancel_date,
        body.shipping_notes.as_deref(),
        body.terms.as_deref(),
        body.ship_to_address.as_deref(),
        body.fob_type,
        body.fob_point.as_deref(),
        body.notes.as_deref(),
        body.total_amount,
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;

    transaction
        .commit()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    pool.close().await;

    match build_po_response(id).await? {
        Some(response) => Ok(HttpResponse::Ok().json(response)),
        None => Ok(HttpResponse::InternalServerError().json(json!({
            "error": "Failed to retrieve updated purchase order",
        }))),
    }
}

#[delete("/{id}")]
pub async fn delete_purchase_order(path: web::Path<u32>) -> Result<impl Responder> {
    let id = path.into_inner();

    let existing = purchase_orders_db::get_po_by_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    if existing.is_none() {
        return Ok(HttpResponse::NotFound().json(json!({
            "error": "Purchase order not found",
        })));
    }

    // Clean up files from disk before deleting
    let files = purchase_orders_db::get_files_by_po_id(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    for file in &files {
        let _ = tokio::fs::remove_file(&file.disk_path).await;
    }
    // Also try removing the PO directory
    let po_dir = format!("{}/{}", UPLOAD_DIR, id);
    let _ = tokio::fs::remove_dir(&po_dir).await;

    purchase_orders_db::delete_po(id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(json!({
        "message": "Purchase order deleted successfully",
    })))
}

// ── File Endpoints ────────────────────────────────────────────────────────────

#[post("/{po_id}/files")]
pub async fn upload_file(
    req: HttpRequest,
    path: web::Path<u32>,
    query: Query<FileUploadQuery>,
    body: Bytes,
) -> Result<impl Responder> {
    let claims = req.extensions().get::<Claims>().cloned();
    let uploaded_by = match claims {
        None => {
            return Ok(HttpResponse::Unauthorized().json(json!({
                "error": "Unauthorized",
            })))
        }
        Some(claims) => claims.sub as u32,
    };

    let po_id = path.into_inner();
    let query = query.into_inner();

    // Verify PO exists
    let existing = purchase_orders_db::get_po_by_id(po_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    if existing.is_none() {
        return Ok(HttpResponse::NotFound().json(json!({
            "error": "Purchase order not found",
        })));
    }

    // Create directory and write file
    let po_dir = format!("{}/{}", UPLOAD_DIR, po_id);
    tokio::fs::create_dir_all(&po_dir)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let file_uuid = uuid::Uuid::new_v4();
    let disk_filename = format!("{}_{}", file_uuid, query.filename);
    let disk_path = format!("{}/{}", po_dir, disk_filename);

    tokio::fs::write(&disk_path, &body)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Insert DB record
    let pool = crate::app_db::create_pool()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let mut transaction = pool
        .begin()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let file_id = purchase_orders_db::insert_po_file_with_transaction(
        &mut transaction,
        po_id,
        &query.filename,
        query.asset_type,
        &disk_path,
        uploaded_by,
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;

    transaction
        .commit()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    pool.close().await;

    let file = purchase_orders_db::get_file_by_id(file_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(file))
}

#[get("/{po_id}/files")]
pub async fn list_files(path: web::Path<u32>) -> Result<impl Responder> {
    let po_id = path.into_inner();

    let existing = purchase_orders_db::get_po_by_id(po_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    if existing.is_none() {
        return Ok(HttpResponse::NotFound().json(json!({
            "error": "Purchase order not found",
        })));
    }

    let files = purchase_orders_db::get_files_by_po_id(po_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(files))
}

#[get("/{po_id}/files/{file_id}")]
pub async fn download_file(path: web::Path<(u32, u32)>) -> Result<impl Responder> {
    let (po_id, file_id) = path.into_inner();

    let file = purchase_orders_db::get_file_by_id(file_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    match file {
        Some(file) if file.po_id == po_id => {
            let bytes = tokio::fs::read(&file.disk_path)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;

            Ok(HttpResponse::Ok()
                .insert_header((
                    "Content-Disposition",
                    format!("attachment; filename=\"{}\"", file.filename),
                ))
                .body(bytes))
        }
        _ => Ok(HttpResponse::NotFound().json(json!({
            "error": "File not found",
        }))),
    }
}

#[delete("/{po_id}/files/{file_id}")]
pub async fn delete_file_endpoint(path: web::Path<(u32, u32)>) -> Result<impl Responder> {
    let (po_id, file_id) = path.into_inner();

    let file = purchase_orders_db::get_file_by_id(file_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    match file {
        Some(file) if file.po_id == po_id => {
            // Remove from disk
            let _ = tokio::fs::remove_file(&file.disk_path).await;

            // Remove from DB
            purchase_orders_db::delete_file(file_id)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;

            Ok(HttpResponse::Ok().json(json!({
                "message": "File deleted successfully",
            })))
        }
        _ => Ok(HttpResponse::NotFound().json(json!({
            "error": "File not found",
        }))),
    }
}

// ── Configure ─────────────────────────────────────────────────────────────────

pub fn configure(cfg: &mut web::ServiceConfig) {
    let auth = HttpAuthentication::bearer(validator);
    cfg.service(
        web::scope("/purchase-orders")
            .wrap(auth)
            .service(get_purchase_orders)
            .service(get_purchase_order)
            .service(create_purchase_order)
            .service(update_purchase_order)
            .service(delete_purchase_order)
            .service(upload_file)
            .service(list_files)
            .service(download_file)
            .service(delete_file_endpoint)
            .default_service(web::to(|| async {
                HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
            })),
    );
}

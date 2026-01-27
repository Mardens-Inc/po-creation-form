use actix_web::{get, web, HttpResponse, Responder, Result};
use serde_json::json;

use super::data_db;

#[get("/department")]
pub async fn get_departments() -> Result<impl Responder> {
    let departments = data_db::get_all_departments()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(departments))
}

#[get("/category/{department_id}")]
pub async fn get_categories(path: web::Path<u32>) -> Result<impl Responder> {
    let department_id = path.into_inner();
    let categories = data_db::get_categories_by_department(department_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(categories))
}

#[get("/subcategory/{category_id}")]
pub async fn get_subcategories(path: web::Path<u32>) -> Result<impl Responder> {
    let category_id = path.into_inner();
    let subcategories = data_db::get_subcategories_by_category(category_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(subcategories))
}

#[get("/season")]
pub async fn get_seasons() -> Result<impl Responder> {
    let seasons = data_db::get_all_seasons()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(seasons))
}

pub fn configure(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(
        actix_web::web::scope("/data")
            .service(get_departments)
            .service(get_categories)
            .service(get_subcategories)
            .service(get_seasons)
            .default_service(actix_web::web::to(|| async {
                HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
            })),
    );
}

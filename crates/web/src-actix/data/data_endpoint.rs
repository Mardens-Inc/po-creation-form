use actix_web::{get, HttpResponse, Responder, Result};
use serde_json::json;

#[get("/department")]
pub async fn get_departments() -> Result<impl Responder> {
    Ok(HttpResponse::Ok().finish())
}

#[get("/category")]
pub async fn get_categories() -> Result<impl Responder> {
    Ok(HttpResponse::Ok().finish())
}
#[get("/sub-category")]
pub async fn get_subcategories() -> Result<impl Responder> {
    Ok(HttpResponse::Ok().finish())
}

#[get("/season")]
pub async fn get_seasons() -> Result<impl Responder> {
    Ok(HttpResponse::Ok().finish())
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

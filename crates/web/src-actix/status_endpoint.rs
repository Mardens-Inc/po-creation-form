use actix_web::{get, HttpResponse, Responder, Result};
use serde_json::json;

#[get("/health")]
pub async fn get_health_status() -> Result<impl Responder> {

	Ok(HttpResponse::Ok().finish())
}

pub fn configure(cfg: &mut actix_web::web::ServiceConfig) {
	cfg.service(
		actix_web::web::scope("/status")
			.service(get_health_status)
			.default_service(actix_web::web::to(|| async {
				HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
			})),
	);
}
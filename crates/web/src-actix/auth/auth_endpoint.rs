use actix_web::{get, HttpResponse, Responder, Result};
use serde_json::json;
use crate::auth::users_data::User;

#[get("/users")]
pub async fn get_users() -> Result<impl Responder> {
	let users = User::get_users().await.map_err(actix_web::error::ErrorInternalServerError)?;
	Ok(HttpResponse::Ok().json(users))
}

pub fn configure(cfg: &mut actix_web::web::ServiceConfig) {
	cfg.service(
		actix_web::web::scope("/auth")
			.default_service(actix_web::web::to(|| async {
				HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
			})),
	);
}
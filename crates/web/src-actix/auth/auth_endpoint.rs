use crate::auth::auth_endpoint_data::UserRegistrationBody;
use crate::auth::users_data::User;
use actix_web::web::Json;
use actix_web::{get, post, HttpResponse, Responder, Result};
use serde_json::json;

#[get("/users")]
pub async fn get_users() -> Result<impl Responder> {
    let users = User::get_users()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(users))
}

#[post("/register")]
pub async fn register_user(body: Json<UserRegistrationBody>) -> Result<impl Responder> {
    let user: User = body.into_inner().into();
    Ok(HttpResponse::Ok().json(json!({
        "message": format!("User {} created successfully", user.email),
        "user": user
    })))
}

pub fn configure(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(
        actix_web::web::scope("/auth")
            .service(get_users)
            .service(register_user)
            .default_service(actix_web::web::to(|| async {
                HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
            })),
    );
}

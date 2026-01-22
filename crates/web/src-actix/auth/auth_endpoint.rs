use crate::auth::auth_endpoint_data::{ConfirmEmailBody, UserRegistrationBody};
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
    let mut user: User = body.into_inner().into();
    user.register()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(json!({
        "message": "User registration request was successful. Please check your email for further instructions.",
    })))
}

#[post("/confirm-email")]
pub async fn confirm_email(body: Json<ConfirmEmailBody>) -> Result<impl Responder> {
    let body = body.into_inner();
    let token = body.token.as_str();
    let email = body.email.as_str();
    User::confirm_email(token, email).await.map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().finish())
}

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

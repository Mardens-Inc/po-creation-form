use crate::auth::auth_endpoint_data::{ConfirmEmailBody, LoginRequestBody, UserRegistrationBody};
use crate::auth::auth_middleware::validator;
use crate::auth::jwt_data::Claims;
use crate::auth::users_data::User;
use actix_web::web::Json;
use actix_web::{get, post, web, HttpMessage, HttpRequest, HttpResponse, Responder, Result};
use actix_web_httpauth::middleware::HttpAuthentication;
use serde_json::json;

#[get("/users")]
pub async fn get_users() -> Result<impl Responder> {
    let users = User::get_users()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(users))
}


#[post("/login")]
pub async fn login(body: Json<LoginRequestBody>) -> Result<impl Responder> {
    let body = body.into_inner();
    let email = body.email.as_str();
    let password = body.password.as_str();
    let response = User::login(email, password).await.map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(response))
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

#[get("/me")]
pub async fn get_current_user(req: HttpRequest) -> Result<impl Responder> {
    let claims = req.extensions().get::<Claims>().cloned();
    match claims {
        None => Ok(HttpResponse::Unauthorized().json(json!({
            "error": "Unauthorized".to_string(),
        }))),
        Some(claims) => Ok(HttpResponse::Ok().json(json!({
            "user": claims.sub,
        }))),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    let auth = HttpAuthentication::bearer(validator);
    cfg.service(
        web::scope("/auth")
            .service(get_users)
            .service(login)
            .service(register_user)
            .service(web::scope("").wrap(auth).service(get_current_user))
            .default_service(web::to(|| async {
                HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
            })),
    );
}

use crate::auth::auth_middleware::validator;
use crate::auth::users_data::RequestExt;
use actix_web::{get, post, HttpRequest, HttpResponse, Responder, Result};
use actix_web::web::Query;
use actix_web_httpauth::middleware::HttpAuthentication;
use serde::Deserialize;
use serde_json::json;

#[get("/link-qrcode.svg")]
pub async fn get_link_qrcode(req: HttpRequest) -> Result<impl Responder> {
    let user = req.get_user().await?;

    let qrcode = user
        .get_link_qrcode()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok()
        .content_type("image/svg+xml")
        .body(qrcode))
}

#[post("/enable")]
pub async fn enable_mfa(req: HttpRequest) -> Result<impl Responder> {
    let mut user = req.get_user().await?;
    user.enable_mfa().await.map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().finish())
}

#[post("/disable")]
pub async fn disable_mfa(req: HttpRequest) -> Result<impl Responder> {
    let mut user = req.get_user().await?;
    user.disable_mfa().await.map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().finish())
}

#[derive(Deserialize)]
struct VerifyCodeQuery{
    code: String
}

#[post("/verify-code")]
pub async fn verify_code(query: Query<VerifyCodeQuery>, req: HttpRequest) -> Result<impl Responder> {
    let user = req.get_user().await?;
    user.verify_code(query.code.as_str()).map_err(actix_web::error::ErrorBadRequest)?;
    Ok(HttpResponse::Ok().finish())
}

pub fn configure(cfg: &mut actix_web::web::ServiceConfig) {
    let auth = HttpAuthentication::bearer(validator);
    cfg.service(
        actix_web::web::scope("/mfa")
            .wrap(auth)
            .service(get_link_qrcode)
            .service(disable_mfa)
            .service(verify_code)
            .default_service(actix_web::web::to(|| async {
                HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
            })),
    );
}

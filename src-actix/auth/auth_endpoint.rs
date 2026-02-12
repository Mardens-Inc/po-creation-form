use crate::auth::auth_endpoint_data::{ConfirmEmailBody, LoginRequestBody, RequestPasswordResetBody, ResetPasswordBody, UpdateUserBody, UserRegistrationBody};
use crate::auth::auth_middleware::validator;
use crate::auth::mfa;
use crate::auth::users_data::{RequestExt, User};
use crate::auth::{users_db};
use crate::events::broadcaster::{Broadcaster, SSEEvent};
use actix_web::web::Json;
use actix_web::{delete, get, post, put, web, HttpRequest, HttpResponse, Responder, Result};
use actix_web_httpauth::middleware::HttpAuthentication;
use log::error;
use serde_json::json;

#[get("/users")]
pub async fn get_users(req: HttpRequest) -> Result<impl Responder> {
    User::require_admin(&req).await?;
    let users = User::get_users()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(users))
}

#[put("/users/{id}")]
pub async fn update_user(req: HttpRequest, path: web::Path<u32>, body: Json<UpdateUserBody>, broadcaster: web::Data<Broadcaster>) -> Result<impl Responder> {
    User::require_admin(&req).await?;
    let user_id = path.into_inner();
    let body = body.into_inner();

    let mut user = User::get_user_by_id(user_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("User not found"))?;

    if let Some(first_name) = body.first_name {
        user.first_name = first_name;
    }
    if let Some(last_name) = body.last_name {
        user.last_name = last_name;
    }
    if let Some(email) = body.email {
        user.email = email;
    }
    if let Some(role) = body.role {
        user.role = role;
    }

    users_db::update_user(user)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    broadcaster.send(SSEEvent::Users);

    Ok(HttpResponse::Ok().json(json!({ "message": "User updated successfully" })))
}

#[delete("/users/{id}")]
pub async fn delete_user(req: HttpRequest, path: web::Path<u32>, broadcaster: web::Data<Broadcaster>) -> Result<impl Responder> {
    let admin = User::require_admin(&req).await?;
    let user_id = path.into_inner();

    if admin.id() .map_err(actix_web::error::ErrorInternalServerError)? == user_id {
        return Err(actix_web::error::ErrorBadRequest("Cannot delete yourself"));
    }

    // Verify the target user exists
    User::get_user_by_id(user_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("User not found"))?;

    users_db::delete_user(user_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    broadcaster.send(SSEEvent::Users);

    Ok(HttpResponse::Ok().json(json!({ "message": "User deleted successfully" })))
}

#[post("/users/{id}/force-password-reset")]
pub async fn force_password_reset(req: HttpRequest, path: web::Path<u32>, broadcaster: web::Data<Broadcaster>) -> Result<impl Responder> {
    User::require_admin(&req).await?;
    let user_id = path.into_inner();

    let mut user = User::get_user_by_id(user_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("User not found"))?;

    user.needs_password_reset = true;
    users_db::update_user(user.clone())
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Trigger a password reset email
    if let Err(e) = User::request_password_reset(&user.email).await {
        error!("Failed to send password reset email during force reset: {e}");
    }

    broadcaster.send(SSEEvent::Users);

    Ok(HttpResponse::Ok().json(json!({ "message": "Password reset forced successfully" })))
}

#[post("/users/{id}/disable-mfa")]
pub async fn disable_mfa(req: HttpRequest, path: web::Path<u32>, broadcaster: web::Data<Broadcaster>) -> Result<impl Responder> {
    User::require_admin(&req).await?;
    let user_id = path.into_inner();

    let mut user = User::get_user_by_id(user_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("User not found"))?;

    user.mfa_enabled = false;
    user.mfa_secret = None;
    user.has_validated_mfa = false;
    users_db::update_user(user)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    broadcaster.send(SSEEvent::Users);

    Ok(HttpResponse::Ok().json(json!({ "message": "MFA disabled successfully" })))
}

#[post("/login")]
pub async fn login(req: HttpRequest, body: Json<LoginRequestBody>) -> Result<impl Responder> {
    let body = body.into_inner();
    let email = body.email.as_str();
    let password = body.password.as_str();
    let client_ip = User::get_client_ip(&req);
    match User::login(email, password, client_ip.as_deref()).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(e) if e.to_string().contains("Password reset required") => {
            Ok(HttpResponse::Forbidden().json(json!({
                "error": "password_reset_required",
                "message": "Password reset required. Please reset your password."
            })))
        }
        Err(e) => Err(actix_web::error::ErrorInternalServerError(e)),
    }
}

#[post("/register")]
pub async fn register_user(body: Json<UserRegistrationBody>) -> Result<impl Responder> {
    let mut user: User = body.into_inner().into();
    if let Err(e) = user.register().await {
        // Cleanup on failure
        async fn cleanup(email: String) {
            let Ok(pool) = crate::app_db::get_or_init_pool().await else {
                error!("Failed to create pool for cleanup");
                return;
            };
            let Ok(mut transaction) = pool.begin().await else {
                error!("Failed to begin transaction for cleanup");
                return;
            };
            if let Err(e) =
                User::drop_unconfirmed_user_by_email_with_transaction(&mut transaction, &email)
                    .await
            {
                error!("Failed to drop unconfirmed user during cleanup: {e}");
                return;
            }
            if let Err(e) = crate::auth::registration_db::remove_request_by_email_with_transaction(
                &mut transaction,
                &email,
            )
            .await
            {
                error!("Failed to remove registration request during cleanup: {e}");
                return;
            }
            if let Err(e) = transaction.commit().await {
                error!("Failed to commit cleanup transaction: {e}");
                return;
            }
        }

        cleanup(user.email.clone()).await;
        return Err(actix_web::error::ErrorInternalServerError(e));
    }
    Ok(HttpResponse::Ok().json(json!({
        "message": "User registration request was successful. Please check your email for further instructions.",
    })))
}

#[post("/confirm-email")]
pub async fn confirm_email(body: Json<ConfirmEmailBody>) -> Result<impl Responder> {
    let body = body.into_inner();
    let token = body.token.as_str();
    let email = body.email.as_str();
    User::confirm_email(email, token)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().finish())
}

#[post("/request-password-reset")]
pub async fn request_password_reset(body: Json<RequestPasswordResetBody>) -> Result<impl Responder> {
    let body = body.into_inner();
    if let Err(e) = User::request_password_reset(&body.email).await {
        error!("Password reset request error: {e}");
    }
    // Always return success to prevent email enumeration
    Ok(HttpResponse::Ok().json(json!({
        "message": "If an account with that email exists, a password reset link has been sent."
    })))
}

#[post("/reset-password")]
pub async fn reset_password(body: Json<ResetPasswordBody>) -> Result<impl Responder> {
    let body = body.into_inner();
    User::reset_password(&body.email, &body.token, &body.password)
        .await
        .map_err(actix_web::error::ErrorBadRequest)?;
    Ok(HttpResponse::Ok().json(json!({
        "message": "Password has been reset successfully."
    })))
}

#[get("/me")]
pub async fn get_current_user(req: HttpRequest) -> Result<impl Responder> {
    let mut user = req.get_user().await?;
    let client_ip = User::get_client_ip(&req);
    if user.mfa_enabled
        && user.has_validated_mfa
        && let Some(ref current_ip) = client_ip
        && user.last_ip.as_deref() != Some(current_ip.as_str())
    {
        user.requires_mfa_verification = true;
    }
    Ok(HttpResponse::Ok().json(user))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    let auth = HttpAuthentication::bearer(validator);
    cfg.service(
        web::scope("/auth")
            .service(login)
            .service(register_user)
            .service(confirm_email)
            .service(request_password_reset)
            .service(reset_password)
            .configure(mfa::configure)
            .service(
                web::scope("")
                    .wrap(auth)
                    .service(get_current_user)
                    .service(get_users)
                    .service(update_user)
                    .service(delete_user)
                    .service(force_password_reset)
                    .service(disable_mfa),
            )
            .default_service(web::to(|| async {
                HttpResponse::NotFound().json(json!({
                    "error": "API endpoint not found".to_string(),
                }))
            })),
    );
}

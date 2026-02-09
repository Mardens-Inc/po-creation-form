use crate::auth::auth_service::generate_jwt_token;
use crate::auth::jwt_data::{AuthResponse, Claims};
use crate::auth::user_role::UserRole;
use crate::auth::users_db;
use actix_web::{HttpMessage, HttpRequest};
use anyhow::{anyhow, Result};
use log::{debug, error, info, trace};
use obsidian_scheduler::timer_trait::Timer;
use serde::{Deserialize, Serialize};
use sqlx::MySqlTransaction;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct User {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<u32>,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub role: UserRole,
    pub has_confirmed_email: bool,
    pub needs_password_reset: bool,
    #[serde(skip_serializing)]
    pub mfa_secret: Option<String>,
    pub mfa_enabled: bool,
    pub has_validated_mfa: bool,
    #[serde(skip_serializing)]
    pub last_ip: Option<String>,
    #[sqlx(skip)]
    #[serde(default)]
    pub requires_mfa_verification: bool,
}

impl PartialEq for User {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

impl User {
    pub async fn get_users() -> Result<Vec<User>> {
        users_db::get_users().await
    }

    pub fn id(&self) -> Result<u32> {
        self.id
            .ok_or(anyhow!("User with email {} not found", self.email))
    }

    pub async fn get_user_by_id(uid: u32) -> Result<Option<Self>> {
        Ok(users_db::get_user_by_id(uid).await?)
    }

    pub async fn drop_unconfirmed_user_by_email_with_transaction<'a>(
        transaction: &mut MySqlTransaction<'a>,
        email: &str,
    ) -> Result<()> {
        sqlx::query("DELETE FROM users WHERE email = ? AND has_confirmed_email = 0")
            .bind(email)
            .execute(&mut **transaction)
            .await?;
        Ok(())
    }

    pub async fn register(&mut self) -> Result<u32> {
        debug!("Starting registration for user: {}", self.email);
        trace!(
            "User details: first_name={}, last_name={}, role={:?}",
            self.first_name, self.last_name, self.role
        );

        let password = self.password.clone();
        let hashed_password = tokio::task::spawn_blocking(move || {
            bcrypt::hash(password, bcrypt::DEFAULT_COST)
        })
        .await??;
        trace!("Password hashed successfully");

        let pool = crate::app_db::get_or_init_pool().await?;
        let mut transaction = pool.begin().await?;
        trace!("Database transaction started");

        let user_id =
            users_db::register_with_transaction(&mut transaction, self, hashed_password.as_str())
                .await?;
        debug!("User registered with ID: {}", user_id);

        let token = uuid::Uuid::new_v4().to_string();
        trace!("Generated registration token: {}", token);

        crate::auth::registration_db::insert_request_with_transaction(
            &mut transaction,
            self.email.as_str(),
            token.as_str(),
            user_id,
        )
        .await?;
        trace!("Registration request inserted");

        // Submit and clean up the transaction
        transaction.commit().await?;
        debug!("Database transaction committed for user ID: {}", user_id);

        let email_service = crate::auth::email_service::EmailService::new()?;
        debug!("Sending confirmation email to: {}", self.email);
        email_service
            .send_confirmation_email(
                self.email.as_str(),
                token.as_str(),
                self.first_name.as_str(),
            )
            .await?;
        debug!("Confirmation email sent to: {}", self.email);

        // Start a 1-hour timer to clean up the request
        debug!("Starting 1-hour cleanup timer for user ID: {}", user_id);
        let timer = obsidian_scheduler::callback::CallbackTimer::new(
            move |handler| {
                let user_id = user_id;
                async move {
                    debug!("Cleanup timer triggered for user ID: {}", user_id);
                    let pool = crate::app_db::get_or_init_pool().await?;
                    let mut transaction = pool.begin().await?;
                    trace!("Cleanup transaction started for user ID: {}", user_id);

                    users_db::delete_user_with_transaction(&mut transaction, user_id).await?;
                    trace!("User deleted in cleanup: {}", user_id);

                    if let Err(e) = crate::auth::registration_db::remove_request_with_transaction(
                        &mut transaction,
                        user_id,
                    )
                    .await
                    {
                        error!("Failed to cleanup expired registration request: {e}")
                    } else {
                        debug!("Registration request cleaned up for user ID: {}", user_id);
                        // Stop the timer from repeating
                        handler.stop();
                        trace!("Cleanup timer stopped for user ID: {}", user_id);
                    }

                    transaction.commit().await?;
                    debug!("Cleanup transaction committed for user ID: {}", user_id);
                    Ok(())
                }
            },
            Duration::from_hours(1),
        );
        timer.start().await?;
        trace!("Cleanup timer started successfully");

        debug!(
            "Registration completed successfully for user: {} (ID: {})",
            self.email, user_id
        );
        Ok(user_id)
    }

    pub async fn confirm_email(email: &str, token: &str) -> Result<()> {
        crate::auth::registration_db::confirm_request(email, token).await?;
        Ok(())
    }

    pub async fn request_password_reset(email: &str) -> Result<()> {
        let pool = crate::app_db::get_or_init_pool().await?;
        let mut transaction = pool.begin().await?;

        let user = match users_db::get_user_by_email_with_transaction(&mut transaction, email).await? {
            Some(user) => user,
            None => {
                // Return Ok to prevent email enumeration
                debug!("Password reset requested for non-existent email: {}", email);
                transaction.commit().await?;
                return Ok(());
            }
        };

        let user_id = user.id()?;

        // Remove any existing reset requests for this email
        crate::auth::password_reset_db::remove_request_by_email_with_transaction(&mut transaction, email).await?;

        let token = uuid::Uuid::new_v4().to_string();
        trace!("Generated password reset token for user: {}", email);

        crate::auth::password_reset_db::insert_request_with_transaction(
            &mut transaction,
            email,
            token.as_str(),
            user_id,
        )
        .await?;

        transaction.commit().await?;

        let email_service = crate::auth::email_service::EmailService::new()?;
        email_service
            .send_reset_password_email(email, token.as_str(), user.first_name.as_str())
            .await?;
        debug!("Password reset email sent to: {}", email);

        // Start a 1-hour timer to clean up the request
        let email_owned = email.to_string();
        let timer = obsidian_scheduler::callback::CallbackTimer::new(
            move |handler| {
                let email_owned = email_owned.clone();
                async move {
                    debug!("Password reset cleanup timer triggered for: {}", email_owned);
                    let pool = crate::app_db::get_or_init_pool().await?;
                    let mut transaction = pool.begin().await?;

                    crate::auth::password_reset_db::remove_request_by_email_with_transaction(
                        &mut transaction,
                        &email_owned,
                    )
                    .await?;

                    transaction.commit().await?;
                    handler.stop();
                    debug!("Password reset request cleaned up for: {}", email_owned);
                    Ok(())
                }
            },
            Duration::from_hours(1),
        );
        timer.start().await?;

        Ok(())
    }

    pub async fn reset_password(email: &str, token: &str, new_password: &str) -> Result<()> {
        let pool = crate::app_db::get_or_init_pool().await?;
        let mut transaction = pool.begin().await?;

        let (request_id, user_id) = crate::auth::password_reset_db::get_request_from_token_with_transaction(
            &mut transaction,
            token,
            email,
        )
        .await?
        .ok_or_else(|| anyhow!("Invalid or expired reset token"))?;

        let password = new_password.to_string();
        let hashed_password = tokio::task::spawn_blocking(move || {
            bcrypt::hash(password, bcrypt::DEFAULT_COST)
        })
        .await??;

        users_db::update_password_with_transaction(&mut transaction, user_id, &hashed_password).await?;
        crate::auth::password_reset_db::remove_request_with_transaction(&mut transaction, request_id).await?;

        transaction.commit().await?;
        info!("Password reset successfully for user: {}", email);
        Ok(())
    }

    pub fn get_client_ip(req: &HttpRequest) -> Option<String> {
        req.connection_info()
            .realip_remote_addr()
            .map(|s| s.to_string())
    }

    pub async fn login(email: &str, password: &str, client_ip: Option<&str>) -> Result<AuthResponse> {
        let mut transaction = crate::app_db::get_or_init_pool().await?.begin().await?;
        let user: User =
            match users_db::get_user_by_email_with_transaction(&mut transaction, email).await? {
                Some(user) => user,
                None => {
                    return Err(anyhow!(
                        "User with email {} not found",
                        email.replace("\n", "")
                    ));
                }
            };

        if !user.validate_password(password).await? {
            return Err(anyhow!("Invalid password"));
        }

        if !user.has_confirmed_email {
            return Err(anyhow!("Email not confirmed"));
        }

        if user.needs_password_reset {
            return Err(anyhow!("Password reset required"));
        }

        info!("User logged in: {} (ID: {:?})", user.email, user.id);

        let token = generate_jwt_token(user.id()?, &user.email)
            .map_err(|e| anyhow!("Failed to generate JWT token: {e}"))?;

        users_db::update_last_online_with_transaction(&mut transaction, user.id()?).await?;

        // Update last_ip unless MFA is enabled+validated and IP differs (forces re-verification)
        if let Some(ip) = client_ip {
            let should_update_ip = !user.mfa_enabled
                || !user.has_validated_mfa
                || user.last_ip.is_none()
                || user.last_ip.as_deref() == Some(ip);
            if should_update_ip {
                users_db::update_last_ip_with_transaction(&mut transaction, user.id()?, ip).await?;
            }
        }

        transaction.commit().await?;

        Ok(AuthResponse {
            token,
            token_type: "Bearer".to_string(),
        })
    }

    pub async fn validate_password(&self, password: &str) -> Result<bool> {
        let password = password.to_string();
        let hash = self.password.clone();
        let result = tokio::task::spawn_blocking(move || {
            bcrypt::verify(password, &hash)
        })
        .await??;
        Ok(result)
    }
    pub async fn get_user_from_request(req: &actix_web::HttpRequest) -> Result<User> {
        let claims = req
            .extensions()
            .get::<Claims>()
            .cloned()
            .ok_or_else(|| anyhow!("Unauthorized"))?;

        users_db::get_user_by_id(claims.sub as u32)
            .await?
            .ok_or_else(|| anyhow!("User not found"))
    }
}

pub trait RequestExt {
    async fn get_user(&self) -> actix_web::Result<User>;
}
impl RequestExt for actix_web::HttpRequest {
    async fn get_user(&self) -> actix_web::Result<User> {
        User::get_user_from_request(self)
            .await
            .map_err(actix_web::error::ErrorUnauthorized)
    }
}

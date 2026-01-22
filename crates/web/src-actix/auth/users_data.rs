use crate::auth::auth_service::generate_jwt_token;
use crate::auth::jwt_data::AuthResponse;
use crate::auth::user_role::UserRole;
use crate::auth::users_db;
use anyhow::{anyhow, Result};
use log::{error, info};
use obsidian_scheduler::timer_trait::Timer;
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct User {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<u32>,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
    pub role: UserRole,
}

impl PartialEq for User {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

impl User {
    pub async fn get_users() -> Result<Vec<User>> {
        crate::auth::users_db::get_users().await
    }

    pub fn id(&self) -> Result<u32> {
        self.id
            .ok_or(anyhow!("User with email {} not found", self.email))
    }

    pub async fn get_user_by_id(uid: u32) -> Result<Option<Self>> {
        Ok(crate::auth::users_db::get_user_by_id(uid).await?)
    }

    pub async fn register(&mut self) -> Result<u32> {
        let hashed_password = bcrypt::hash(&self.password, bcrypt::DEFAULT_COST)?;
        let pool = crate::app_db::create_pool().await?;
        let mut transaction = pool.begin().await?;

        let user_id = crate::auth::users_db::register_with_transaction(
            &mut transaction,
            self,
            hashed_password.as_str(),
        )
        .await?;
        let token = uuid::Uuid::new_v4().to_string();
        crate::auth::registration_db::insert_request_with_transaction(
            &mut transaction,
            self.email.as_str(),
            token.as_str(),
            user_id,
        )
        .await?;

        // Submit and clean up the transaction
        transaction.commit().await?;
        pool.close().await;

        let email_service = crate::auth::email_service::EmailService::new()?;
        email_service
            .send_confirmation_email(
                self.email.as_str(),
                token.as_str(),
                self.first_name.as_str(),
            )
            .await?;

        // Start a 1-hour timer to clean up the request
        let timer = obsidian_scheduler::callback::CallbackTimer::new(
            move |handler| {
                let user_id = user_id;
                async move {
                    if let Err(e) = crate::auth::registration_db::remove_request(user_id).await {
                        error!("Failed to cleanup expired registration request: {e}")
                    } else {
                        // Stop the timer from repeating
                        handler.stop();
                    }
                    Ok(())
                }
            },
            Duration::from_hours(1),
        );
        timer.start().await?;

        Ok(user_id)
    }

    pub async fn confirm_email(email: &str, token: &str) -> Result<()> {
        crate::auth::registration_db::confirm_request(email, token).await?;
        Ok(())
    }

    pub async fn login(email: &str, password: &str) -> Result<AuthResponse> {
        let user: User =
            match users_db::get_user_by_email(  email).await? {
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

        info!("User logged in: {} (ID: {:?})", user.email, user.id);

        let token = generate_jwt_token(user.id()?, &user.email)
            .map_err(|e| anyhow!("Failed to generate JWT token: {e}"))?;

        Ok(AuthResponse { token, token_type: "Bearer".to_string() })
    }

    pub async fn validate_password(&self, password: &str) -> Result<bool> {
        Ok(bcrypt::verify(password, &self.password)?)
    }
}

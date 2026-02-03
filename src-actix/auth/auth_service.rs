use anyhow::Result;
use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use log::info;
use std::sync::RwLock;
use crate::auth::jwt_data::Claims;

/// Holds current and previous JWT secrets for seamless rotation.
/// Previous secret is kept to validate tokens issued before rotation.
struct JwtSecrets {
    current: String,
    previous: Option<String>,
}

impl JwtSecrets {
    fn new() -> Self {
        Self {
            current: generate_random_secret(),
            previous: None,
        }
    }

    fn rotate(&mut self) {
        self.previous = Some(std::mem::replace(&mut self.current, generate_random_secret()));
        info!("JWT secret rotated successfully");
    }
}

/// Generate a cryptographically random secret using UUID v4
fn generate_random_secret() -> String {
    format!("{}{}", uuid::Uuid::new_v4(), uuid::Uuid::new_v4())
}

static JWT_SECRETS: RwLock<Option<JwtSecrets>> = RwLock::new(None);

/// Initialize the JWT secret system. Must be called at startup.
pub fn init_jwt_secrets() {
    let mut secrets = JWT_SECRETS.write().unwrap();
    *secrets = Some(JwtSecrets::new());
    info!("JWT secrets initialized");
}

/// Rotate the JWT secret. Called by the scheduler every 30 days.
pub fn rotate_jwt_secret() {
    let mut secrets = JWT_SECRETS.write().unwrap();
    if let Some(ref mut s) = *secrets {
        s.rotate();
    }
}

/// Start the JWT secret rotation scheduler (30-day interval)
pub fn start_jwt_rotation_scheduler() {
    use obsidian_scheduler::callback::CallbackTimer;
    use obsidian_scheduler::timer_trait::Timer;
    use std::time::Duration;

    // 30 days in seconds
    const THIRTY_DAYS_SECS: u64 = 30 * 24 * 60 * 60;

    let timer = CallbackTimer::new(
        async |_timer_handle| {
            rotate_jwt_secret();
            Ok(())
        },
        Duration::from_secs(THIRTY_DAYS_SECS),
    );

    // Spawn the timer in a background task
    tokio::spawn(async move {
        let _ = timer.start().await;
    });

    info!("JWT secret rotation scheduler started (30-day interval)");
}

pub fn generate_jwt_token(user_id: u32, email: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::days(30))
        .expect("Time went backwards")
        .timestamp();

    let claims = Claims {
        sub: user_id as u64,
        email: email.to_owned(),
        exp: expiration,
        iat: Utc::now().timestamp(),
    };

    let secrets = JWT_SECRETS.read().unwrap();
    let secret = secrets
        .as_ref()
        .map(|s| s.current.as_str())
        .expect("JWT secrets not initialized. Call init_jwt_secrets() first.");

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

pub fn validate_jwt_token(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let secrets = JWT_SECRETS.read().unwrap();
    let secrets_ref = secrets
        .as_ref()
        .expect("JWT secrets not initialized. Call init_jwt_secrets() first.");

    // Try current secret first
    let current_result = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secrets_ref.current.as_bytes()),
        &Validation::default(),
    );

    if let Ok(token_data) = current_result {
        return Ok(token_data.claims);
    }

    // If current fails and we have a previous secret, try that
    if let Some(ref previous) = secrets_ref.previous {
        let previous_result = decode::<Claims>(
            token,
            &DecodingKey::from_secret(previous.as_bytes()),
            &Validation::default(),
        );

        if let Ok(token_data) = previous_result {
            return Ok(token_data.claims);
        }
    }

    // Return the original error from current secret attempt
    current_result.map(|t| t.claims)
}
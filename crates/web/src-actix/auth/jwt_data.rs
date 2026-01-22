use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: u64,       // User ID
    pub email: String,  // User email
    pub exp: i64,       // Expiration time
    pub iat: i64,       // Issued at
}

/// Authentication response with token
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub token_type: String,
}
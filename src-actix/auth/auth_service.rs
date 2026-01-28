use anyhow::Result;
use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use crate::auth::jwt_data::Claims;

const JWT_SECRET: &str = env!("JWT_SECRET");
const HASH_SALT: &str = env!("HASH_SALT");

pub fn generate_jwt_token(user_id: u32, email: &str) -> Result<String, jsonwebtoken::errors::Error> {
	let expiration = Utc::now()
		.checked_add_signed(chrono::Duration::days(30))
		.expect("Time went backwards")
		.timestamp();

	let claims = Claims{
		sub: user_id as u64,
		email: email.to_owned(),
		exp: expiration,
		iat: Utc::now().timestamp(),
	};


	encode(
		&Header::default(),
		&claims,
		&EncodingKey::from_secret(JWT_SECRET.as_bytes()),
	)
}

pub fn validate_jwt_token(token: &str)->Result<Claims, jsonwebtoken::errors::Error>
{
	let token_data = decode::<Claims>(
		token,
		&DecodingKey::from_secret(JWT_SECRET.as_bytes()),
		&Validation::default(),
	)?;

	Ok(token_data.claims)
}
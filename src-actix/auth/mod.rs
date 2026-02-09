mod users_db;
mod users_data;
mod user_role;
mod auth_endpoint;
mod auth_endpoint_data;
pub(crate) mod jwt_data;
pub(crate) mod auth_service;
pub(crate) mod auth_middleware;
mod registration_db;
mod password_reset_db;
mod email_service;
mod mfa;

use sqlx::MySqlTransaction;
pub use auth_endpoint::configure;

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> anyhow::Result<()> {
	users_db::initialize_table(transaction).await?;
	registration_db::initialize_table(transaction).await?;
	password_reset_db::initialize_table(transaction).await?;
	Ok(())
}
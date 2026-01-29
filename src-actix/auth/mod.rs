mod users_db;
mod users_data;
mod user_role;
mod auth_endpoint;
mod auth_endpoint_data;
pub(crate) mod jwt_data;
mod auth_service;
pub(crate) mod auth_middleware;
mod registration_db;
mod email_service;

use sqlx::MySqlTransaction;
pub use auth_endpoint::configure;

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> anyhow::Result<()> {
	users_db::initialize_table(transaction).await?;
	registration_db::initialize_table(transaction).await?;
	Ok(())
}
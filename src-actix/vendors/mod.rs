mod vendors_data;
mod vendors_db;
mod vendors_endpoint;

use sqlx::MySqlTransaction;
pub use vendors_endpoint::configure;

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> anyhow::Result<()> {
    vendors_db::initialize_table(transaction).await?;
    Ok(())
}

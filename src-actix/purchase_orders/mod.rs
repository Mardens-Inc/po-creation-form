mod manifest_parser;
mod purchase_orders_data;
mod purchase_orders_db;
mod purchase_orders_endpoint;

use sqlx::MySqlTransaction;
pub use purchase_orders_endpoint::configure;

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> anyhow::Result<()> {
    purchase_orders_db::initialize_table(transaction).await?;
    Ok(())
}

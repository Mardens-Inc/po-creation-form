use crate::{auth, data, vendors};
use anyhow::Result;
use sqlx::mysql::{MySqlConnectOptions, MySqlPoolOptions};
use sqlx::{ConnectOptions, MySqlPool};

pub async fn create_pool() -> Result<MySqlPool> {
    // The mysql connection string.
    // For example, `mysql://root:password@localhost:3306/po_tracker`
    let connection_string = env!("MYSQL_CONNECTION_STRING");

    let connection_options = connection_string
        .parse::<MySqlConnectOptions>()?
        .log_statements(log::LevelFilter::Trace);
    let pool_options = MySqlPoolOptions::new()
        .max_connections(50)
        .min_connections(5)
        .idle_timeout(std::time::Duration::from_secs(3));

    let connection = pool_options.connect_with(connection_options).await?;
    Ok(connection)
}

/// Initialize database tables if they don't exist yet.
pub async fn initialize_database() -> Result<()> {
    let pool = create_pool().await?;
    let mut transaction = pool.begin().await?;

	// ======   List tables here    ======
	auth::initialize_table(&mut transaction).await?;
    data::initialize_table(&mut transaction).await?;
    vendors::initialize_table(&mut transaction).await?;

	// ======   End of list         ======

    transaction.commit().await?;
    pool.close().await;
    Ok(())
}

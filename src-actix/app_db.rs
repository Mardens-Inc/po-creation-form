use crate::{auth, data, purchase_orders, vendors};
use anyhow::Result;
use std::sync::OnceLock;
use sqlx::mysql::{MySqlConnectOptions, MySqlPoolOptions};
use sqlx::{ConnectOptions, MySqlPool};

/// Global connection pool singleton
static POOL: OnceLock<MySqlPool> = OnceLock::new();

/// Initialize the global connection pool. Must be called at startup.
pub async fn init_pool() -> Result<()> {
    let connection_string = std::env::var("MYSQL_CONNECTION_STRING")
        .expect("MYSQL_CONNECTION_STRING must be set");

    let connection_options = connection_string
        .parse::<MySqlConnectOptions>()?
        .log_statements(log::LevelFilter::Trace);
    let pool_options = MySqlPoolOptions::new()
        .max_connections(50)
        .min_connections(5)
        .idle_timeout(std::time::Duration::from_secs(60));

    let pool = pool_options.connect_with(connection_options).await?;
    POOL.set(pool)
        .map_err(|_| anyhow::anyhow!("Pool already initialized"))?;
    Ok(())
}

/// Get a reference to the global connection pool.
pub fn get_pool() -> &'static MySqlPool {
    POOL.get().expect("Database pool not initialized. Call init_pool() first.")
}

/// Creates a new pool connection (legacy function for compatibility).
/// Prefer using get_pool() for better performance.
pub async fn create_pool() -> Result<MySqlPool> {
    // Return a clone of the pool if initialized, otherwise create a new one
    if let Some(pool) = POOL.get() {
        return Ok(pool.clone());
    }

    // Fallback: create a new pool (for backwards compatibility during transition)
    let connection_string = std::env::var("MYSQL_CONNECTION_STRING")
        .expect("MYSQL_CONNECTION_STRING must be set");

    let connection_options = connection_string
        .parse::<MySqlConnectOptions>()?
        .log_statements(log::LevelFilter::Trace);
    let pool_options = MySqlPoolOptions::new()
        .max_connections(50)
        .min_connections(5)
        .idle_timeout(std::time::Duration::from_secs(60));

    let connection = pool_options.connect_with(connection_options).await?;
    Ok(connection)
}

/// Initialize database tables if they don't exist yet.
pub async fn initialize_database() -> Result<()> {
    // Initialize the global pool first
    init_pool().await?;

    let pool = get_pool();
    let mut transaction = pool.begin().await?;

	// ======   List tables here    ======
	auth::initialize_table(&mut transaction).await?;
    data::initialize_table(&mut transaction).await?;
    vendors::initialize_table(&mut transaction).await?;
    purchase_orders::initialize_table(&mut transaction).await?;

	// ======   End of list         ======

    transaction.commit().await?;
    Ok(())
}

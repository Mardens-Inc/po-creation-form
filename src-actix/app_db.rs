use crate::{auth, data, purchase_orders, vendors};
use anyhow::Result;
use sqlx::mysql::{MySqlConnectOptions, MySqlPoolOptions};
use sqlx::{ConnectOptions, Connection, MySqlPool};
use std::sync::OnceLock;

/// Global connection pool singleton
static POOL: OnceLock<MySqlPool> = OnceLock::new();
const CONNECTION_STRING: &str = env!("MYSQL_CONNECTION_STRING");

fn connection_options() -> Result<MySqlConnectOptions> {
    Ok(CONNECTION_STRING
        .parse::<MySqlConnectOptions>()?
        .log_statements(log::LevelFilter::Trace))
}

/// Get a reference to the global connection pool.
pub fn get_pool() -> &'static MySqlPool {
    POOL.get()
        .expect("Database pool not initialized. Call initialize_database() first.")
}

/// Get a clone of the global connection pool.
pub async fn get_or_init_pool() -> Result<MySqlPool> {
    POOL.get()
        .cloned()
        .ok_or_else(|| anyhow::anyhow!("Database pool not initialized. Call initialize_database() first."))
}

/// Initialize database tables if they don't exist yet.
pub async fn initialize_database() -> Result<()> {
    // Use a direct connection for table initialization — NOT the pool.
    // The pool's connections would be bound to the main runtime's I/O driver,
    // making them unusable from actix-web worker threads (each worker runs
    // its own tokio current_thread runtime with a separate reactor).
    let mut conn = connection_options()?.connect().await?;
    let mut transaction = conn.begin().await?;

    // ======   List tables here    ======
    auth::initialize_table(&mut transaction).await?;
    data::initialize_table(&mut transaction).await?;
    vendors::initialize_table(&mut transaction).await?;
    purchase_orders::initialize_table(&mut transaction).await?;

    // ======   End of list         ======

    transaction.commit().await?;
    drop(conn);

    // Create the pool lazily — no connections are established now.
    // Each worker will create connections on its own runtime on demand.
    let pool = MySqlPoolOptions::new()
        .max_connections(50)
        .acquire_timeout(std::time::Duration::from_secs(10))
        .idle_timeout(std::time::Duration::from_secs(300))
        .connect_lazy_with(connection_options()?);

    POOL.set(pool)
        .map_err(|_| anyhow::anyhow!("Pool already initialized"))?;

    Ok(())
}

use sqlx::{ConnectOptions, MySqlPool};
use anyhow::Result;
use sqlx::mysql::{MySqlConnectOptions, MySqlPoolOptions};

pub async fn create_pool() ->Result<MySqlPool>
{
	// The mysql connection string.
	// For example, `mysql://root:password@localhost:3306/po_tracker`
	let connection_string = env!("MYSQL_CONNECTION_STRING");

	let connection_options = connection_string.parse::<MySqlConnectOptions>()?.log_statements(log::LevelFilter::Trace);
	let pool_options = MySqlPoolOptions::new()
		.max_connections(50)
		.min_connections(5)
		.idle_timeout(std::time::Duration::from_secs(3));

	let connection = pool_options.connect_with(connection_options).await?;
	Ok(connection)
}
use sqlx::{ConnectOptions, MySqlPool};
use anyhow::Result;
use sqlx::mysql::MySqlConnectOptions;

pub async fn create_pool() ->Result<MySqlPool>
{
	// The mysql connection string.
	// For example, `mysql://root:password@localhost:3306/mydatabase`
	let connection_string = std::env::var("MYSQL_CONNECTION_STRING").expect("DATABASE_URL must be set");

	let options = connection_string.parse::<MySqlConnectOptions>()?.log_statements(log::LevelFilter::Trace);
	let connection = MySqlPool::connect_with(options).await?;
	Ok(connection)
}
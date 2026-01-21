use anyhow::Result;
use sqlx::MySqlTransaction;

const USERS_TABLE_SCHEMA: &str = include_str!(r#"../../sql/users.sql"#);

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> Result<()> {
    sqlx::query(USERS_TABLE_SCHEMA)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}


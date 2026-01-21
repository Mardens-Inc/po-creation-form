use crate::auth::users_data::User;
use anyhow::Result;
use sqlx::MySqlTransaction;

const USERS_TABLE_SCHEMA: &str = include_str!(r#"../../sql/users.sql"#);

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> Result<()> {
    sqlx::query(USERS_TABLE_SCHEMA)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn get_users_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
) -> Result<Vec<User>> {
    let users: Vec<User> = sqlx::query_as(r#"SELECT * FROM users"#)
        .fetch_all(&mut **transaction)
        .await?;
    Ok(users)
}

pub async fn get_users() -> Result<Vec<User>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let users = get_users_with_transaction(&mut transaction).await?;
    transaction.commit().await?;
    Ok(users)
}
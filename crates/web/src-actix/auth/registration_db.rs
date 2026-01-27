use anyhow::{anyhow, Result};
use sqlx::MySqlTransaction;

const USERS_TABLE_SCHEMA: &str = include_str!(r#"../../sql/registration_requests.sql"#);

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> Result<()> {
    sqlx::query(USERS_TABLE_SCHEMA)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn insert_request_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    email: &str,
    token: &str,
    user_id: u32,
) -> Result<u32> {
    let request_id: u32 =
        sqlx::query("INSERT INTO registration_requests (token, email, user_id) VALUES (?, ?, ?)")
            .bind(token)
            .bind(email)
            .bind(user_id)
            .execute(&mut **transaction)
            .await?
            .last_insert_id() as u32;
    Ok(request_id)
}

pub async fn insert_request(email: &str, token: &str, user_id: u32) -> Result<u32> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let request_id =
        insert_request_with_transaction(&mut transaction, email, token, user_id).await?;
    transaction.commit().await?;
    Ok(request_id)
}

pub async fn get_request_from_token_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    token: &str,
    email: &str,
) -> Result<Option<u32>> {
    let request_id: Option<u32> = sqlx::query_scalar(
        "SELECT id FROM registration_requests WHERE token = ? and email = ? LIMIT 1",
    )
    .bind(token)
    .bind(email)
    .fetch_optional(&mut **transaction)
    .await?;
    Ok(request_id)
}

pub async fn get_request_from_token(token: &str, email: &str) -> Result<Option<u32>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let request_id =
        get_request_from_token_with_transaction(&mut transaction, token, email).await?;
    transaction.commit().await?;
    Ok(request_id)
}

pub async fn remove_request_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    request_id: u32,
) -> Result<()> {
    sqlx::query("DELETE FROM registration_requests WHERE id = ?")
        .bind(request_id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn remove_request(request_id: u32) -> Result<()> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    remove_request_with_transaction(&mut transaction, request_id).await?;
    transaction.commit().await?;
    Ok(())
}

pub async fn remove_request_by_email_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    email: &str,
)-> Result<()> {
    sqlx::query("DELETE FROM registration_requests WHERE email = ?")
        .bind(email)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn confirm_request(email: &str, token: &str) -> Result<()> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    confirm_request_with_transaction(&mut transaction, email, token).await?;
    transaction.commit().await?;
    Ok(())
}

pub async fn confirm_request_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    email: &str,
    token: &str,
) -> Result<()> {
    let request_id = get_request_from_token_with_transaction(transaction, token, email).await?;
    match request_id {
        Some(id) => {
            crate::auth::users_db::set_confirmed_email_with_transaction(transaction, id).await?;
            remove_request_with_transaction(transaction, id).await?;
            Ok(())
        }
        None => Err(anyhow!("Invalid token")),
    }
}

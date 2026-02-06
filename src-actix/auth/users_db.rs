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

pub async fn get_user_by_id_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    uid: u32,
) -> Result<Option<User>> {
    let user: Option<User> = sqlx::query_as(r#"SELECT * FROM users WHERE id = ? LIMIT 1"#)
        .bind(uid)
        .fetch_optional(&mut **transaction)
        .await?;
    Ok(user)
}

pub async fn get_user_by_id(uid: u32) -> Result<Option<User>> {
    let pool = crate::app_db::get_or_init_pool().await?;
    let mut transaction = pool.begin().await?;
    let user = get_user_by_id_with_transaction(&mut transaction, uid).await?;
    transaction.commit().await?;
    Ok(user)
}

pub async fn get_user_by_email_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    email: &str,
)->Result<Option<User>>{
    let user: Option<User> = sqlx::query_as(r#"SELECT * FROM users WHERE email = ? LIMIT 1"#)
        .bind(email)
        .fetch_optional(&mut **transaction)
        .await?;
    Ok(user)
}

pub async fn get_user_by_email(email: &str) -> Result<Option<User>> {
    let pool = crate::app_db::get_or_init_pool().await?;
    let mut transaction = pool.begin().await?;
    let user = get_user_by_email_with_transaction(&mut transaction, email).await?;
    transaction.commit().await?;
    Ok(user)
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
    let pool = crate::app_db::get_or_init_pool().await?;
    let mut transaction = pool.begin().await?;
    let users = get_users_with_transaction(&mut transaction).await?;
    transaction.commit().await?;
    Ok(users)
}

pub async fn register_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    user: &User,
    hashed_password: &str,
) -> Result<u32> {
    let uid = sqlx::query(r#"INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)"#)
        .bind(&user.first_name)
        .bind(&user.last_name)
        .bind(&user.email)
        .bind(hashed_password)
        .bind(user.role)
        .execute(&mut **transaction)
        .await?
        .last_insert_id();

    Ok(uid as u32)
}

pub async fn register(user: &User, hashed_password: &str) -> Result<u32> {
    let pool = crate::app_db::get_or_init_pool().await?;
    let mut transaction = pool.begin().await?;
    let uid = register_with_transaction(&mut transaction, user, hashed_password).await?;
    transaction.commit().await?;
    Ok(uid)
}


pub async fn set_confirmed_email_with_transaction<'a>(transaction: &mut MySqlTransaction<'a>, uid: u32) -> Result<()> {
    sqlx::query("UPDATE users SET has_confirmed_email = 1 WHERE id = ?")
        .bind(uid)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn delete_user_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    uid: u32,
) -> Result<()> {
    sqlx::query(r#"DELETE FROM users WHERE id = ?"#)
        .bind(uid)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn delete_user(uid: u32) -> Result<()> {
    let pool = crate::app_db::get_or_init_pool().await?;
    let mut transaction = pool.begin().await?;
    delete_user_with_transaction(&mut transaction, uid).await?;
    transaction.commit().await?;
    Ok(())
}

pub async fn update_last_online_with_transaction<'a>(transaction: &mut MySqlTransaction<'a>, uid: u32) -> Result<()> {
    sqlx::query("UPDATE users SET last_online = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(uid)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}
pub async fn update_last_online(uid: u32) -> Result<()> {
    let pool = crate::app_db::get_or_init_pool().await?;
    let mut transaction = pool.begin().await?;
    update_last_online_with_transaction(&mut transaction, uid).await?;
    transaction.commit().await?;
    Ok(())
}

pub async fn update_user_with_transaction<'a>(transaction: &mut MySqlTransaction<'a>, user: User)->Result<()>
{
    sqlx::query(r#"UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ?, has_confirmed_email = ?, needs_password_reset = ?, mfa_enabled = ?, mfa_secret = ? WHERE id = ?"#)
        .bind(&user.first_name)
        .bind(&user.last_name)
        .bind(&user.email)
        .bind(user.role)
        .bind(user.has_confirmed_email)
        .bind(user.needs_password_reset)
        .bind(user.mfa_enabled)
        .bind(&user.mfa_secret)
        .bind(user.id)
        .execute(&mut **transaction)
        .await?;

    Ok(())
}

pub async fn update_user(user: User) -> Result<()> {
    let pool = crate::app_db::get_or_init_pool().await?;
    let mut transaction = pool.begin().await?;
    update_user_with_transaction(&mut transaction, user).await?;
    transaction.commit().await?;
    Ok(())
}
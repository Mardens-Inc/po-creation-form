use anyhow::Result;
use sqlx::MySqlTransaction;

use super::vendors_data::{Vendor, VendorContact, VendorShipLocation, VendorStatus};

const VENDORS_TABLE: &str = include_str!("../../sql/vendors.sql");
const VENDOR_CONTACTS_TABLE: &str = include_str!("../../sql/vendor_contacts.sql");
const VENDOR_SHIP_LOCATIONS_TABLE: &str = include_str!("../../sql/vendor_ship_locations.sql");

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> Result<()> {
    sqlx::query(VENDORS_TABLE)
        .execute(&mut **transaction)
        .await?;
    sqlx::query(VENDOR_CONTACTS_TABLE)
        .execute(&mut **transaction)
        .await?;
    sqlx::query(VENDOR_SHIP_LOCATIONS_TABLE)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

// -- Vendor CRUD --

pub async fn insert_vendor_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    name: &str,
    code: &str,
    status: VendorStatus,
    created_by: u32,
) -> Result<u32> {
    let id = sqlx::query(
        r#"INSERT INTO vendors (name, code, status, created_by) VALUES (?, ?, ?, ?)"#,
    )
    .bind(name)
    .bind(code)
    .bind(status)
    .bind(created_by)
    .execute(&mut **transaction)
    .await?
    .last_insert_id();
    Ok(id as u32)
}

pub async fn insert_vendor(
    name: &str,
    code: &str,
    status: VendorStatus,
    created_by: u32,
) -> Result<u32> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let id = insert_vendor_with_transaction(&mut transaction, name, code, status, created_by).await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(id)
}

// -- Contact CRUD --

pub async fn insert_contact_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    vendor_id: u32,
    first_name: &str,
    last_name: &str,
    email: &str,
    phone: &str,
) -> Result<u32> {
    let id = sqlx::query(
        r#"INSERT INTO vendor_contacts (vendor_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)"#,
    )
    .bind(vendor_id)
    .bind(first_name)
    .bind(last_name)
    .bind(email)
    .bind(phone)
    .execute(&mut **transaction)
    .await?
    .last_insert_id();
    Ok(id as u32)
}

// -- Ship Location CRUD --

pub async fn insert_ship_location_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    vendor_id: u32,
    address: &str,
) -> Result<u32> {
    let id = sqlx::query(
        r#"INSERT INTO vendor_ship_locations (vendor_id, address) VALUES (?, ?)"#,
    )
    .bind(vendor_id)
    .bind(address)
    .execute(&mut **transaction)
    .await?
    .last_insert_id();
    Ok(id as u32)
}

// -- Query functions --

pub async fn get_all_vendors() -> Result<Vec<Vendor>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let vendors: Vec<Vendor> =
        sqlx::query_as(r#"SELECT id, name, code, status, created_at, created_by FROM vendors ORDER BY name"#)
            .fetch_all(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(vendors)
}

pub async fn get_vendor_by_id(id: u32) -> Result<Option<Vendor>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let vendor: Option<Vendor> =
        sqlx::query_as(r#"SELECT id, name, code, status, created_at, created_by FROM vendors WHERE id = ? LIMIT 1"#)
            .bind(id)
            .fetch_optional(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(vendor)
}

pub async fn get_contacts_by_vendor_id(vendor_id: u32) -> Result<Vec<VendorContact>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let contacts: Vec<VendorContact> =
        sqlx::query_as(r#"SELECT id, vendor_id, first_name, last_name, email, phone FROM vendor_contacts WHERE vendor_id = ? ORDER BY last_name, first_name"#)
            .bind(vendor_id)
            .fetch_all(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(contacts)
}

pub async fn get_ship_locations_by_vendor_id(vendor_id: u32) -> Result<Vec<VendorShipLocation>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let locations: Vec<VendorShipLocation> =
        sqlx::query_as(r#"SELECT id, vendor_id, address FROM vendor_ship_locations WHERE vendor_id = ? ORDER BY address"#)
            .bind(vendor_id)
            .fetch_all(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(locations)
}

// -- Update --

pub async fn update_vendor_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    id: u32,
    name: Option<&str>,
    code: Option<&str>,
    status: Option<VendorStatus>,
) -> Result<()> {
    if let Some(name) = name {
        sqlx::query(r#"UPDATE vendors SET name = ? WHERE id = ?"#)
            .bind(name)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(code) = code {
        sqlx::query(r#"UPDATE vendors SET code = ? WHERE id = ?"#)
            .bind(code)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(status) = status {
        sqlx::query(r#"UPDATE vendors SET status = ? WHERE id = ?"#)
            .bind(status)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    Ok(())
}

pub async fn update_vendor(
    id: u32,
    name: Option<&str>,
    code: Option<&str>,
    status: Option<VendorStatus>,
) -> Result<()> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    update_vendor_with_transaction(&mut transaction, id, name, code, status).await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(())
}

// -- Delete --

pub async fn delete_vendor_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    id: u32,
) -> Result<()> {
    sqlx::query(r#"DELETE FROM vendors WHERE id = ?"#)
        .bind(id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn delete_vendor(id: u32) -> Result<()> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    delete_vendor_with_transaction(&mut transaction, id).await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(())
}

pub async fn delete_contacts_by_vendor_id_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    vendor_id: u32,
) -> Result<()> {
    sqlx::query(r#"DELETE FROM vendor_contacts WHERE vendor_id = ?"#)
        .bind(vendor_id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn delete_ship_locations_by_vendor_id_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    vendor_id: u32,
) -> Result<()> {
    sqlx::query(r#"DELETE FROM vendor_ship_locations WHERE vendor_id = ?"#)
        .bind(vendor_id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

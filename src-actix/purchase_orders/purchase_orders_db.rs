use anyhow::Result;
use sqlx::MySqlTransaction;

use super::purchase_orders_data::{FOBType, POFile, POStatus, PurchaseOrder, UploadFileType};

const PURCHASE_ORDERS_TABLE: &str = include_str!("../../sql/purchase_orders.sql");
const PO_FILES_TABLE: &str = include_str!("../../sql/po_files.sql");

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> Result<()> {
    sqlx::query(PURCHASE_ORDERS_TABLE)
        .execute(&mut **transaction)
        .await?;
    sqlx::query(PO_FILES_TABLE)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

// ── PO CRUD ───────────────────────────────────────────────────────────────────

pub async fn insert_po_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    po_number: &str,
    vendor_id: u32,
    buyer_id: u32,
    description: &str,
    order_date: chrono::NaiveDate,
    ship_date: Option<chrono::NaiveDate>,
    cancel_date: Option<chrono::NaiveDate>,
    shipping_notes: Option<&str>,
    terms: &str,
    ship_to_address: &str,
    fob_type: FOBType,
    fob_point: &str,
    notes: Option<&str>,
) -> Result<u32> {
    let id = sqlx::query(
        r#"INSERT INTO purchase_orders
           (po_number, vendor_id, buyer_id, description, order_date, ship_date, cancel_date,
            shipping_notes, terms, ship_to_address, fob_type, fob_point, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
    )
    .bind(po_number)
    .bind(vendor_id)
    .bind(buyer_id)
    .bind(description)
    .bind(order_date)
    .bind(ship_date)
    .bind(cancel_date)
    .bind(shipping_notes)
    .bind(terms)
    .bind(ship_to_address)
    .bind(fob_type)
    .bind(fob_point)
    .bind(notes)
    .execute(&mut **transaction)
    .await?
    .last_insert_id();
    Ok(id as u32)
}

pub async fn insert_po(
    po_number: &str,
    vendor_id: u32,
    buyer_id: u32,
    description: &str,
    order_date: chrono::NaiveDate,
    ship_date: Option<chrono::NaiveDate>,
    cancel_date: Option<chrono::NaiveDate>,
    shipping_notes: Option<&str>,
    terms: &str,
    ship_to_address: &str,
    fob_type: FOBType,
    fob_point: &str,
    notes: Option<&str>,
) -> Result<u32> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let id = insert_po_with_transaction(
        &mut transaction,
        po_number,
        vendor_id,
        buyer_id,
        description,
        order_date,
        ship_date,
        cancel_date,
        shipping_notes,
        terms,
        ship_to_address,
        fob_type,
        fob_point,
        notes,
    )
    .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(id)
}

pub async fn get_all_pos() -> Result<Vec<PurchaseOrder>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let pos: Vec<PurchaseOrder> = sqlx::query_as(
        r#"SELECT id, po_number, vendor_id, buyer_id, status, description, order_date,
                  ship_date, cancel_date, shipping_notes, terms, ship_to_address,
                  fob_type, fob_point, notes, total_amount, created_at
           FROM purchase_orders ORDER BY created_at DESC"#,
    )
    .fetch_all(&mut *transaction)
    .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(pos)
}

pub async fn get_po_by_id(id: u32) -> Result<Option<PurchaseOrder>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let po: Option<PurchaseOrder> = sqlx::query_as(
        r#"SELECT id, po_number, vendor_id, buyer_id, status, description, order_date,
                  ship_date, cancel_date, shipping_notes, terms, ship_to_address,
                  fob_type, fob_point, notes, total_amount, created_at
           FROM purchase_orders WHERE id = ? LIMIT 1"#,
    )
    .bind(id)
    .fetch_optional(&mut *transaction)
    .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(po)
}

pub async fn get_vendor_name(vendor_id: u32) -> Result<String> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let name: (String,) =
        sqlx::query_as(r#"SELECT name FROM vendors WHERE id = ? LIMIT 1"#)
            .bind(vendor_id)
            .fetch_one(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(name.0)
}

pub async fn get_buyer_name(buyer_id: u32) -> Result<String> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let name: (String,) = sqlx::query_as(
        r#"SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = ? LIMIT 1"#,
    )
    .bind(buyer_id)
    .fetch_one(&mut *transaction)
    .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(name.0)
}

pub async fn update_po_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    id: u32,
    po_number: Option<&str>,
    vendor_id: Option<u32>,
    status: Option<POStatus>,
    description: Option<&str>,
    order_date: Option<chrono::NaiveDate>,
    ship_date: Option<chrono::NaiveDate>,
    cancel_date: Option<chrono::NaiveDate>,
    shipping_notes: Option<&str>,
    terms: Option<&str>,
    ship_to_address: Option<&str>,
    fob_type: Option<FOBType>,
    fob_point: Option<&str>,
    notes: Option<&str>,
    total_amount: Option<f64>,
) -> Result<()> {
    if let Some(v) = po_number {
        sqlx::query(r#"UPDATE purchase_orders SET po_number = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = vendor_id {
        sqlx::query(r#"UPDATE purchase_orders SET vendor_id = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = status {
        sqlx::query(r#"UPDATE purchase_orders SET status = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = description {
        sqlx::query(r#"UPDATE purchase_orders SET description = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = order_date {
        sqlx::query(r#"UPDATE purchase_orders SET order_date = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = ship_date {
        sqlx::query(r#"UPDATE purchase_orders SET ship_date = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = cancel_date {
        sqlx::query(r#"UPDATE purchase_orders SET cancel_date = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = shipping_notes {
        sqlx::query(r#"UPDATE purchase_orders SET shipping_notes = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = terms {
        sqlx::query(r#"UPDATE purchase_orders SET terms = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = ship_to_address {
        sqlx::query(r#"UPDATE purchase_orders SET ship_to_address = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = fob_type {
        sqlx::query(r#"UPDATE purchase_orders SET fob_type = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = fob_point {
        sqlx::query(r#"UPDATE purchase_orders SET fob_point = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = notes {
        sqlx::query(r#"UPDATE purchase_orders SET notes = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    if let Some(v) = total_amount {
        sqlx::query(r#"UPDATE purchase_orders SET total_amount = ? WHERE id = ?"#)
            .bind(v)
            .bind(id)
            .execute(&mut **transaction)
            .await?;
    }
    Ok(())
}

pub async fn update_po(
    id: u32,
    po_number: Option<&str>,
    vendor_id: Option<u32>,
    status: Option<POStatus>,
    description: Option<&str>,
    order_date: Option<chrono::NaiveDate>,
    ship_date: Option<chrono::NaiveDate>,
    cancel_date: Option<chrono::NaiveDate>,
    shipping_notes: Option<&str>,
    terms: Option<&str>,
    ship_to_address: Option<&str>,
    fob_type: Option<FOBType>,
    fob_point: Option<&str>,
    notes: Option<&str>,
    total_amount: Option<f64>,
) -> Result<()> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    update_po_with_transaction(
        &mut transaction,
        id,
        po_number,
        vendor_id,
        status,
        description,
        order_date,
        ship_date,
        cancel_date,
        shipping_notes,
        terms,
        ship_to_address,
        fob_type,
        fob_point,
        notes,
        total_amount,
    )
    .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(())
}

pub async fn delete_po_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    id: u32,
) -> Result<()> {
    sqlx::query(r#"DELETE FROM purchase_orders WHERE id = ?"#)
        .bind(id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn delete_po(id: u32) -> Result<()> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    delete_po_with_transaction(&mut transaction, id).await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(())
}

// ── File CRUD ─────────────────────────────────────────────────────────────────

pub async fn insert_po_file_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    po_id: u32,
    filename: &str,
    asset_type: UploadFileType,
    disk_path: &str,
    uploaded_by: u32,
) -> Result<u32> {
    let id = sqlx::query(
        r#"INSERT INTO po_files (po_id, filename, asset_type, disk_path, uploaded_by)
           VALUES (?, ?, ?, ?, ?)"#,
    )
    .bind(po_id)
    .bind(filename)
    .bind(asset_type)
    .bind(disk_path)
    .bind(uploaded_by)
    .execute(&mut **transaction)
    .await?
    .last_insert_id();
    Ok(id as u32)
}

pub async fn get_files_by_po_id(po_id: u32) -> Result<Vec<POFile>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let files: Vec<POFile> = sqlx::query_as(
        r#"SELECT id, po_id, filename, asset_type, disk_path, uploaded_at, uploaded_by
           FROM po_files WHERE po_id = ? ORDER BY uploaded_at DESC"#,
    )
    .bind(po_id)
    .fetch_all(&mut *transaction)
    .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(files)
}

pub async fn get_file_by_id(file_id: u32) -> Result<Option<POFile>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let file: Option<POFile> = sqlx::query_as(
        r#"SELECT id, po_id, filename, asset_type, disk_path, uploaded_at, uploaded_by
           FROM po_files WHERE id = ? LIMIT 1"#,
    )
    .bind(file_id)
    .fetch_optional(&mut *transaction)
    .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(file)
}

pub async fn delete_file_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    file_id: u32,
) -> Result<()> {
    sqlx::query(r#"DELETE FROM po_files WHERE id = ?"#)
        .bind(file_id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

pub async fn delete_file(file_id: u32) -> Result<()> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    delete_file_with_transaction(&mut transaction, file_id).await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(())
}

pub async fn delete_files_by_po_id_with_transaction<'a>(
    transaction: &mut MySqlTransaction<'a>,
    po_id: u32,
) -> Result<()> {
    sqlx::query(r#"DELETE FROM po_files WHERE po_id = ?"#)
        .bind(po_id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

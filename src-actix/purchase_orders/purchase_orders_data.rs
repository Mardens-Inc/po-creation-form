use rust_decimal::Decimal;
use crate::purchase_orders::fob_type::FOBType;
use crate::purchase_orders::po_status::POStatus;
use crate::purchase_orders::upload_file_type::UploadFileType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct PurchaseOrder {
    pub id: Option<u32>,
    pub po_number: String,
    pub vendor_id: u32,
    pub buyer_id: u32,
    pub status: POStatus,
    pub description: String,
    pub order_date: chrono::NaiveDate,
    pub ship_date: Option<chrono::NaiveDate>,
    pub cancel_date: Option<chrono::NaiveDate>,
    pub shipping_notes: Option<String>,
    pub terms: String,
    pub ship_to_address: String,
    pub fob_type: FOBType,
    pub fob_point: String,
    pub notes: Option<String>,
    pub total_amount: Decimal,
    pub created_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct POFile {
    pub id: Option<u32>,
    pub po_id: u32,
    pub filename: String,
    pub asset_type: UploadFileType,
    pub disk_path: String,
    pub uploaded_at: Option<chrono::NaiveDateTime>,
    pub uploaded_by: u32,
}



#[derive(Debug, Deserialize)]
pub struct CreatePurchaseOrderRequest {
    pub po_number: String,
    pub vendor_id: u32,
    pub description: String,
    pub order_date: chrono::NaiveDate,
    pub ship_date: Option<chrono::NaiveDate>,
    pub cancel_date: Option<chrono::NaiveDate>,
    #[serde(default)]
    pub shipping_notes: Option<String>,
    #[serde(default)]
    pub terms: String,
    #[serde(default)]
    pub ship_to_address: String,
    #[serde(default)]
    pub fob_type: FOBType,
    #[serde(default)]
    pub fob_point: String,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePurchaseOrderRequest {
    pub po_number: Option<String>,
    pub vendor_id: Option<u32>,
    pub status: Option<POStatus>,
    pub description: Option<String>,
    pub order_date: Option<chrono::NaiveDate>,
    pub ship_date: Option<chrono::NaiveDate>,
    pub cancel_date: Option<chrono::NaiveDate>,
    pub shipping_notes: Option<String>,
    pub terms: Option<String>,
    pub ship_to_address: Option<String>,
    pub fob_type: Option<FOBType>,
    pub fob_point: Option<String>,
    pub notes: Option<String>,
    pub total_amount: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct FileUploadQuery {
    pub filename: String,
    #[serde(default)]
    pub asset_type: UploadFileType,
}

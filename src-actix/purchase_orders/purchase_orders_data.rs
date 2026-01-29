use serde::{Deserialize, Deserializer, Serialize};

// ── POStatus ──────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Default, sqlx::Type)]
#[repr(u8)]
pub enum POStatus {
    #[default]
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    Received = 3,
    Cancelled = 4,
}

impl<'de> Deserialize<'de> for POStatus {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct POStatusVisitor;

        impl<'de> serde::de::Visitor<'de> for POStatusVisitor {
            type Value = POStatus;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a string or u8 representing a POStatus")
            }

            fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    0 => Ok(POStatus::Draft),
                    1 => Ok(POStatus::Submitted),
                    2 => Ok(POStatus::Approved),
                    3 => Ok(POStatus::Received),
                    4 => Ok(POStatus::Cancelled),
                    _ => Err(E::custom(format!(
                        "invalid u8 value for POStatus: {}",
                        value
                    ))),
                }
            }

            fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                if value <= u8::MAX as u64 {
                    self.visit_u8(value as u8)
                } else {
                    Err(E::custom(format!(
                        "u64 value {} is out of range for u8",
                        value
                    )))
                }
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value.to_lowercase().as_str() {
                    "draft" => Ok(POStatus::Draft),
                    "submitted" => Ok(POStatus::Submitted),
                    "approved" => Ok(POStatus::Approved),
                    "received" => Ok(POStatus::Received),
                    "cancelled" => Ok(POStatus::Cancelled),
                    _ => Err(E::unknown_variant(
                        value,
                        &["Draft", "Submitted", "Approved", "Received", "Cancelled"],
                    )),
                }
            }
        }

        deserializer.deserialize_any(POStatusVisitor)
    }
}

// ── FOBType ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Default, sqlx::Type)]
#[repr(u8)]
pub enum FOBType {
    #[default]
    Pickup = 0,
    Delivered = 1,
}

impl<'de> Deserialize<'de> for FOBType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct FOBTypeVisitor;

        impl<'de> serde::de::Visitor<'de> for FOBTypeVisitor {
            type Value = FOBType;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a string or u8 representing a FOBType")
            }

            fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    0 => Ok(FOBType::Pickup),
                    1 => Ok(FOBType::Delivered),
                    _ => Err(E::custom(format!(
                        "invalid u8 value for FOBType: {}",
                        value
                    ))),
                }
            }

            fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                if value <= u8::MAX as u64 {
                    self.visit_u8(value as u8)
                } else {
                    Err(E::custom(format!(
                        "u64 value {} is out of range for u8",
                        value
                    )))
                }
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value.to_lowercase().as_str() {
                    "pickup" => Ok(FOBType::Pickup),
                    "delivered" => Ok(FOBType::Delivered),
                    _ => Err(E::unknown_variant(value, &["Pickup", "Delivered"])),
                }
            }
        }

        deserializer.deserialize_any(FOBTypeVisitor)
    }
}

// ── UploadFileType ────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Default, sqlx::Type)]
#[repr(u8)]
pub enum UploadFileType {
    #[default]
    Asset = 0,
    Manifest = 1,
}

impl<'de> Deserialize<'de> for UploadFileType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct UploadFileTypeVisitor;

        impl<'de> serde::de::Visitor<'de> for UploadFileTypeVisitor {
            type Value = UploadFileType;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a string or u8 representing an UploadFileType")
            }

            fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    0 => Ok(UploadFileType::Asset),
                    1 => Ok(UploadFileType::Manifest),
                    _ => Err(E::custom(format!(
                        "invalid u8 value for UploadFileType: {}",
                        value
                    ))),
                }
            }

            fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                if value <= u8::MAX as u64 {
                    self.visit_u8(value as u8)
                } else {
                    Err(E::custom(format!(
                        "u64 value {} is out of range for u8",
                        value
                    )))
                }
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value.to_lowercase().as_str() {
                    "asset" => Ok(UploadFileType::Asset),
                    "manifest" => Ok(UploadFileType::Manifest),
                    _ => Err(E::unknown_variant(value, &["Asset", "Manifest"])),
                }
            }
        }

        deserializer.deserialize_any(UploadFileTypeVisitor)
    }
}

// ── Database Structs ──────────────────────────────────────────────────────────

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
    pub total_amount: f64,
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

// ── Response DTO ──────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Clone)]
pub struct PurchaseOrderResponse {
    pub id: u32,
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
    pub total_amount: f64,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub vendor_name: String,
    pub buyer_name: String,
    pub files: Vec<POFile>,
}

impl PurchaseOrderResponse {
    pub fn from_po(
        po: PurchaseOrder,
        vendor_name: String,
        buyer_name: String,
        files: Vec<POFile>,
    ) -> Self {
        Self {
            id: po.id.unwrap_or(0),
            po_number: po.po_number,
            vendor_id: po.vendor_id,
            buyer_id: po.buyer_id,
            status: po.status,
            description: po.description,
            order_date: po.order_date,
            ship_date: po.ship_date,
            cancel_date: po.cancel_date,
            shipping_notes: po.shipping_notes,
            terms: po.terms,
            ship_to_address: po.ship_to_address,
            fob_type: po.fob_type,
            fob_point: po.fob_point,
            notes: po.notes,
            total_amount: po.total_amount,
            created_at: po.created_at,
            vendor_name,
            buyer_name,
            files,
        }
    }
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

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

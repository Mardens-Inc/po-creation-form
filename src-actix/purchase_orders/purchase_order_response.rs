use rust_decimal::Decimal;
use serde::Serialize;
use crate::purchase_orders::fob_type::FOBType;
use crate::purchase_orders::manifest_parser::POLineItem;
use crate::purchase_orders::po_status::POStatus;
use crate::purchase_orders::purchase_orders_data::{POFile,  PurchaseOrder};

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
    pub total_amount: Decimal,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub vendor_name: String,
    pub buyer_name: String,
    pub files: Vec<POFile>,
    pub line_items: Vec<POLineItem>,
}

impl PurchaseOrderResponse {
    pub fn from_po(
        po: PurchaseOrder,
        vendor_name: String,
        buyer_name: String,
        files: Vec<POFile>,
        line_items: Vec<POLineItem>,
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
            line_items,
        }
    }
}
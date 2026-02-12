use std::fmt::{Debug, Formatter};
use std::io::Cursor;

use anyhow::{Context, Result};
use calamine::{Reader, Xlsx};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct ManifestParseResult {
    pub buyer_name: String,
    pub po_number: String,
    pub vendor_name: String,
    pub terms: String,
    pub ship_to_address: String,
    pub ship_from_address: String,
    pub notes: String,
    pub line_items: Vec<POLineItem>,
}
#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct POLineItem {
    pub id: Option<u32>,
    pub po_id: u32,
    pub item_number: String,
    pub upc: String,
    pub description: String,
    pub case_pack: String,
    pub cases: String,
    pub qty: u32,
    pub mardens_cost: rust_decimal::Decimal,
    pub mardens_price: rust_decimal::Decimal,
    pub comp_retail: rust_decimal::Decimal,
    pub department: String,
    pub category: String,
    pub sub_category: String,
    pub season: String,
    pub buyer_notes: Option<String>,
}

/// Parse the xlsx manifest file and extract header fields and line items.
pub fn parse_manifest(bytes: &[u8]) -> Result<ManifestParseResult> {
    let cursor = Cursor::new(bytes);
    let mut workbook: Xlsx<_> =
        calamine::open_workbook_from_rs(cursor).context("Failed to open xlsx workbook")?;

    let sheet_name = workbook
        .sheet_names()
        .first()
        .cloned()
        .context("No worksheets found in workbook")?;

    let range = workbook
        .worksheet_range(&sheet_name)
        .context("Failed to read worksheet")?;

    // Helper to get cell as string
    let get_cell_str = |row: u32, col: u32| -> String {
        range
            .get_value((row, col))
            .map(|v| v.to_string().trim().to_string())
            .unwrap_or_default()
    };

    // Extract header fields (0-indexed rows)
    // Row 1 (0-indexed row 1): PO # at col B (1), SHIP TO at col G (6)
    // Row 2 (0-indexed row 2): VENDOR at col B (1), TERMS at col G (6), NOTES at col J (9)
    let buyer_name = get_cell_str(0, 1);
    let po_number = get_cell_str(1, 1);
    let vendor_name = get_cell_str(2, 1);
    let ship_to_address = get_cell_str(1, 6);
    let ship_from_address = get_cell_str(1, 9);
    let terms = get_cell_str(2, 6);
    let notes = get_cell_str(2, 9);

    // Parse line items starting at row 5 (0-indexed)
    // Columns: A=ITEM #, B=UPC, C=DESCRIPTION, D=CASE PACK, E=CASES, F=QTY,
    //          G=MARDENS COST, H=MARDENS PRICE, I=COMP RETAIL, J=DEPARTMENT,
    //          K=CATEGORY, L=SUB CATEGORY, M=SEASON/Holiday, N=BUYER NOTES
    let mut line_items = Vec::new();

    let (row_count, _) = range.get_size();
    for row_idx in 5..row_count as u32 {
        let description = get_cell_str(row_idx, 2); // Column C
        if description.is_empty() {
            continue; // Skip empty rows
        }

        let item_number = get_cell_str(row_idx, 0);
        let upc = get_cell_str(row_idx, 1);
        let case_pack = get_cell_str(row_idx, 3);
        let cases = get_cell_str(row_idx, 4);
        let qty = parse_u32(&get_cell_str(row_idx, 5));
        let mardens_cost = parse_f64(&get_cell_str(row_idx, 6));
        let mardens_price = parse_f64(&get_cell_str(row_idx, 7));
        let comp_retail = parse_f64(&get_cell_str(row_idx, 8));
        let department = get_cell_str(row_idx, 9);
        let category = get_cell_str(row_idx, 10);
        let sub_category = get_cell_str(row_idx, 11);
        let season = get_cell_str(row_idx, 12);
        let buyer_notes_str = get_cell_str(row_idx, 13);
        let buyer_notes = if buyer_notes_str.is_empty() {
            None
        } else {
            Some(buyer_notes_str)
        };

        line_items.push(POLineItem {
            id: None,
            po_id: 0, // Will be set when inserting
            item_number,
            upc,
            description,
            case_pack,
            cases,
            qty,
            mardens_cost: rust_decimal::Decimal::from_f64_retain(mardens_cost).unwrap_or_default(),
            mardens_price: rust_decimal::Decimal::from_f64_retain(mardens_price).unwrap_or_default(),
            comp_retail: rust_decimal::Decimal::from_f64_retain(comp_retail).unwrap_or_default(),
            department,
            category,
            sub_category,
            season,
            buyer_notes,
        });
    }

    Ok(ManifestParseResult {
        buyer_name,
        po_number,
        vendor_name,
        terms,
        ship_to_address,
        ship_from_address,
        notes,
        line_items,
    })
}

fn parse_u32(s: &str) -> u32 {
    // Remove currency symbols, commas, and whitespace
    let cleaned: String = s.chars().filter(|c| c.is_ascii_digit()).collect();
    cleaned.parse().unwrap_or(0)
}

fn parse_f64(s: &str) -> f64 {
    // Remove currency symbols and commas, keep digits and decimal point
    let cleaned: String = s
        .chars()
        .filter(|c| c.is_ascii_digit() || *c == '.' || *c == '-')
        .collect();
    cleaned.parse().unwrap_or(0.0)
}

impl Debug for ManifestParseResult {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let items: Vec<String> = self
            .line_items
            .iter()
            .map(|i| {
                format!(
                    r#"| {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} |"#,
                    i.item_number,
                    i.upc,
                    i.description,
                    i.case_pack,
                    i.cases,
                    i.qty,
                    i.mardens_cost,
                    i.mardens_price,
                    i.comp_retail,
                    i.department,
                    i.category,
                    i.sub_category,
                    i.season,
                    i.buyer_notes.as_ref().unwrap_or(&String::new())
                )
            })
            .collect();
        let result = format!(
			r#"
PO#:        {},
Vendor:     {},
Ships To:   {},
Ships From: {},
Terms:      {},
Notes:      {},

| Item # | UPC | Description | Case Pack | Cases | Qty | Mardens Cost | Mardens Price | Comp Retail | Department | Category | Sub Category | Season | Buyer Notes |
|--------|-----|-------------|-----------|-------|-----|--------------|---------------|-------------|------------|----------|--------------|--------|---------------|
{}
        "#,
			self.po_number, self.vendor_name, self.ship_to_address, self.ship_from_address, self.terms, self.notes, items.join("\n")
		);
        f.write_str(&result)
    }
}

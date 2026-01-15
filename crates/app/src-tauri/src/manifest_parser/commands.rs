use super::parser::{ManifestData, parse_manifest};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize, Serialize, Debug)]
pub struct ManifestRow {
    pub item_number: String,
    pub upc: String,
    pub description: String,
    pub case_pack: String,
    pub cases: String,
    pub mardens_cost: String,
    pub mardens_price: String,
    pub comp_retail: String,
    pub department: String,
    pub category: String,
    pub sub_category: String,
    pub season: String,
    pub notes: String,
}

#[tauri::command]
pub async fn parse_manifest_file(path: String) -> Result<ManifestData, String> {
    // Run parsing in a blocking task to avoid blocking the async runtime
    tokio::task::spawn_blocking(move || parse_manifest(path))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn write_manifest_csv(
    rows: Vec<ManifestRow>,
    filename: String,
) -> Result<String, String> {
    tokio::task::spawn_blocking(move || {
        // Create temp directory for CSV
        let temp_dir = std::env::temp_dir().join("po_creation_form_manifests");
        std::fs::create_dir_all(&temp_dir)
            .map_err(|e| format!("Failed to create temp directory: {}", e))?;

        // Generate path for the CSV file
        let csv_path = temp_dir.join(&filename);

        // Create CSV writer
        let mut writer = csv::Writer::from_path(&csv_path)
            .map_err(|e| format!("Failed to create CSV writer: {}", e))?;

        // Write header row
        writer
            .write_record([
                "Item Number",
                "UPC",
                "Description",
                "Case Pack",
                "Cases",
                "Mardens Cost",
                "Mardens Price",
                "Comp Retail",
                "Department",
                "Category",
                "Sub Category",
                "Season",
                "Notes",
            ])
            .map_err(|e| format!("Failed to write CSV header: {}", e))?;

        // Write data rows
        for row in rows {
            writer
                .write_record([
                    &row.item_number,
                    &row.upc,
                    &row.description,
                    &row.case_pack,
                    &row.cases,
                    &row.mardens_cost,
                    &row.mardens_price,
                    &row.comp_retail,
                    &row.department,
                    &row.category,
                    &row.sub_category,
                    &row.season,
                    &row.notes,
                ])
                .map_err(|e| format!("Failed to write CSV row: {}", e))?;
        }

        writer
            .flush()
            .map_err(|e| format!("Failed to flush CSV writer: {}", e))?;

        // Return the absolute path as a string
        csv_path
            .to_str()
            .ok_or("Failed to convert path to string".to_string())
            .map(|s| s.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn validate_column_mapping(
    path: String,
    mappings: HashMap<String, String>,
) -> Result<Vec<String>, String> {
    // Define required fields
    let required_fields = ["item_number", "description", "department"];

    // Parse the manifest to get available columns
    let manifest_data = tokio::task::spawn_blocking(move || parse_manifest(path))
        .await
        .map_err(|e| format!("Task join error: {}", e))??;

    let available_columns: std::collections::HashSet<String> =
        manifest_data.columns.into_iter().collect();

    let mut errors = Vec::new();

    // Check that all required fields are mapped
    for field in required_fields.iter() {
        if !mappings.contains_key(*field) {
            errors.push(format!("Required field '{}' is not mapped", field));
        } else {
            // Check that the mapped column exists in the manifest
            let mapped_column = &mappings[*field];
            if !available_columns.contains(mapped_column) {
                errors.push(format!(
                    "Field '{}' is mapped to '{}' which doesn't exist in the manifest",
                    field, mapped_column
                ));
            }
        }
    }

    // Check that all mapped columns exist in the manifest
    for (field, column) in mappings.iter() {
        if !available_columns.contains(column) {
            errors.push(format!(
                "Field '{}' is mapped to non-existent column '{}'",
                field, column
            ));
        }
    }

    Ok(errors)
}

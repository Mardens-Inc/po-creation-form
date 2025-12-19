use super::parser::{parse_manifest, ManifestData};
use std::collections::HashMap;

#[tauri::command]
pub async fn parse_manifest_file(path: String) -> Result<ManifestData, String> {
    // Run parsing in a blocking task to avoid blocking the async runtime
    tokio::task::spawn_blocking(move || parse_manifest(path))
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

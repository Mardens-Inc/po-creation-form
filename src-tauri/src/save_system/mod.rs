use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{generate_handler, Runtime};

#[derive(Deserialize, Serialize, Debug)]
struct SaveItem {
    pub version: String,
    pub po_number: i32,
    pub buyer_id: String,
    pub vendor: String,
    pub creation_date: String,
    pub expected_delivery_date: Option<String>,
    pub manifests: Vec<ManifestItem>,
    pub assets: Vec<AssetFile>,
}

#[derive(Deserialize, Serialize, Debug)]
struct ManifestItem {
    path: String,
    filename: String,
    mappings: HashMap<String, String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
struct AssetFile {
    filename: String,
    path: String,
    file_type: String,
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("save_system")
        .invoke_handler(generate_handler![save, load])
        .build()
}

#[tauri::command]
async fn save(path: String, item: SaveItem) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        // 1. Create temp directory for staging
        let temp_dir = std::env::temp_dir().join(format!("pocf_{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&temp_dir)
            .map_err(|e| format!("Failed to create temp directory: {}", e))?;

        // 2. Create assets subdirectory
        let assets_dir = temp_dir.join("assets");
        std::fs::create_dir_all(&assets_dir)
            .map_err(|e| format!("Failed to create assets directory: {}", e))?;

        // 3. Write manifest.json
        let manifest_json = serde_json::to_string_pretty(&item)
            .map_err(|e| format!("Failed to serialize manifest: {}", e))?;
        std::fs::write(temp_dir.join("manifest.json"), manifest_json)
            .map_err(|e| format!("Failed to write manifest.json: {}", e))?;

        // 4. Copy all asset files to assets/
        for asset in &item.assets {
            let src = Path::new(&asset.path);
            if !src.exists() {
                return Err(format!("Asset file not found: {}", asset.path));
            }
            let dst = assets_dir.join(&asset.filename);
            std::fs::copy(src, dst)
                .map_err(|e| format!("Failed to copy asset {}: {}", asset.filename, e))?;
        }

        // 5. Create 7z archive with compression
        sevenz_rust2::compress_to_path(&temp_dir, &path)
            .map_err(|e| format!("Failed to create 7z archive: {}", e))?;

        // 6. Cleanup temp directory
        std::fs::remove_dir_all(&temp_dir)
            .map_err(|e| format!("Failed to cleanup temp directory: {}", e))?;

        Ok(())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
#[tauri::command]
async fn load(path: String) -> Result<SaveItem, String> {
    tokio::task::spawn_blocking(move || {
        // 1. Extract to persistent directory (not temp, so files remain accessible)
        // Use a subdirectory of temp with a predictable name structure
        let extract_base = std::env::temp_dir().join("po_creation_form_loaded");
        std::fs::create_dir_all(&extract_base)
            .map_err(|e| format!("Failed to create extraction base directory: {}", e))?;

        let extract_dir = extract_base.join(format!("pocf_{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&extract_dir)
            .map_err(|e| format!("Failed to create extraction directory: {}", e))?;

        // 2. Decompress the archive
        sevenz_rust2::decompress_file(&path, &extract_dir)
            .map_err(|e| format!("Failed to decompress archive: {}", e))?;

        // 3. Read and parse manifest.json
        let manifest_path = extract_dir.join("manifest.json");
        if !manifest_path.exists() {
            return Err("Invalid .pocf file: manifest.json not found".to_string());
        }

        let manifest_content = std::fs::read_to_string(&manifest_path)
            .map_err(|e| format!("Failed to read manifest.json: {}", e))?;
        let mut save_item: SaveItem = serde_json::from_str(&manifest_content)
            .map_err(|e| format!("Failed to parse manifest.json: {}", e))?;

        // 4. Validate structure
        if save_item.manifests.is_empty() && save_item.assets.is_empty() {
            return Err("Invalid .pocf file: no assets found".to_string());
        }

        // 5. Update asset paths in SaveItem to point to extracted location
        let assets_dir = extract_dir.join("assets");
        for asset in &mut save_item.assets {
            asset.path = assets_dir.join(&asset.filename)
                .to_string_lossy()
                .to_string();
        }

        // Update manifest paths as well
        for manifest in &mut save_item.manifests {
            manifest.path = assets_dir.join(&manifest.filename)
                .to_string_lossy()
                .to_string();
        }

        Ok(save_item)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

use anyhow::{anyhow, Result};
use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveFile {
    pub version: String,
    pub po_number: String,
    pub buyer_id: u32,
    pub vendor: String,
    pub order_date: String,
    pub ship_date: Option<String>,
    pub cancel_date: Option<String>,
    pub shipping_notes: String,
    pub description: String,
    pub terms: String,
    pub ship_to_address: String,
    pub fob_type: String,
    pub fob_point: String,
    pub notes: String,
    pub manifests: Vec<ManifestItem>,
    pub assets: Vec<AssetFile>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ManifestItem {
    pub filename: String,
    pub path: String,
    pub mappings: HashMap<String, String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AssetFile {
    pub filename: String,
    pub path: String,
    pub file_type: String,
}

impl SaveFile {
    /// Asynchronously opens and processes a save file from the specified path.
    ///
    /// This function reads a `.7z` archive at the given path, extracting
    /// its contents to a persistent directory and parsing `manifest.json`.
    /// Asset paths are updated to point to the extracted locations.
    ///
    /// # Arguments
    ///
    /// * `path` - A type that can be converted into a reference to a `Path`.
    ///
    /// # Returns
    ///
    /// Returns a `Result<Self>` with the deserialized SaveFile.
    ///
    /// # Errors
    ///
    /// * Fails if the specified path does not exist or cannot be accessed.
    /// * Fails if there is an error decompressing the `.7z` archive.
    /// * Fails if the `manifest.json` file is not found within the archive.
    /// * Fails if the contents of `manifest.json` cannot be deserialized.
    pub async fn open(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref().to_path_buf();
        info!("Opening save file: {path:?}");

        tokio::task::spawn_blocking(move || {
            // Extract to persistent directory so files remain accessible
            let extract_base = std::env::temp_dir().join("po_tracker_loaded");
            std::fs::create_dir_all(&extract_base)
                .map_err(|e| anyhow!("Failed to create extraction base directory: {}", e))?;

            let extract_dir = extract_base.join(format!("pocf_{}", uuid::Uuid::new_v4()));
            std::fs::create_dir_all(&extract_dir)
                .map_err(|e| anyhow!("Failed to create extraction directory: {}", e))?;

            debug!("Extracting to: {extract_dir:?}");

            // Decompress the archive
            sevenz_rust2::decompress_file(&path, &extract_dir)
                .map_err(|e| anyhow!("Failed to decompress archive: {}", e))?;

            // Read and parse manifest.json
            let manifest_path = extract_dir.join("manifest.json");
            if !manifest_path.exists() {
                return Err(anyhow!("Invalid .pocf file: manifest.json not found"));
            }

            let manifest_content = std::fs::read_to_string(&manifest_path)
                .map_err(|e| anyhow!("Failed to read manifest.json: {}", e))?;
            let mut save_file: SaveFile = serde_json::from_str(&manifest_content)
                .map_err(|e| anyhow!("Failed to parse manifest.json: {}", e))?;

            // Update asset paths to point to extracted location
            let assets_dir = extract_dir.join("assets");
            for asset in &mut save_file.assets {
                asset.path = assets_dir
                    .join(&asset.filename)
                    .to_string_lossy()
                    .to_string();
            }

            // Update manifest paths as well
            for manifest in &mut save_file.manifests {
                manifest.path = assets_dir
                    .join(&manifest.filename)
                    .to_string_lossy()
                    .to_string();
            }

            Ok(save_file)
        })
        .await
        .map_err(|e| anyhow!("Task join error: {}", e))?
    }

    /// Asynchronously saves the current object and its associated assets to a 7z archive.
    ///
    /// # Arguments
    /// * `path` - The output location for the generated 7z archive.
    ///
    /// # Workflow
    /// 1. Creates a temporary directory for staging
    /// 2. Creates an assets subdirectory
    /// 3. Writes manifest.json with serialized data
    /// 4. Copies all asset files to assets/
    /// 5. Creates 7z archive with compression
    /// 6. Cleans up temporary directory
    ///
    /// # Returns
    /// Returns a `Result<()>`:
    /// * `Ok(())` if the operation completes successfully.
    /// * `Err` if any step in the process fails.
    pub async fn save(&self, path: impl AsRef<Path>) -> Result<()> {
        let path = path.as_ref().to_path_buf();
        let save_file = self.clone_for_save();

        tokio::task::spawn_blocking(move || {
            info!("Saving asset file to {path:?}");
            let temp_dir = std::env::temp_dir().join(format!("pocf_{}", uuid::Uuid::new_v4()));
            debug!("Creating temp directory for staging: {temp_dir:?}");
            std::fs::create_dir_all(&temp_dir)
                .map_err(|e| anyhow!("Failed to create temp directory: {}", e))?;

            // Create assets subdirectory
            let assets_dir = temp_dir.join("assets");
            debug!("Creating assets directory: {assets_dir:?}");
            std::fs::create_dir_all(&assets_dir)
                .map_err(|e| anyhow!("Failed to create assets directory: {}", e))?;

            // Write manifest.json
            let manifest_path = temp_dir.join("manifest.json");
            debug!("Writing manifest.json to {manifest_path:?}");
            let manifest_json = serde_json::to_string_pretty(&save_file)
                .map_err(|e| anyhow!("Failed to serialize manifest: {}", e))?;
            std::fs::write(&manifest_path, manifest_json)
                .map_err(|e| anyhow!("Failed to write manifest.json: {}", e))?;

            // Copy all asset files to assets/
            debug!("Copying asset files to {assets_dir:?}");
            for asset in &save_file.assets {
                let src = Path::new(&asset.path);
                if !src.exists() {
                    return Err(anyhow!("Asset file not found: {}", asset.path));
                }
                let dst = assets_dir.join(&asset.filename);
                std::fs::copy(src, &dst)
                    .map_err(|e| anyhow!("Failed to copy asset {}: {}", asset.filename, e))?;
                debug!("Copied {src:?} to {dst:?}");
            }

            // Create 7z archive with compression
            debug!("Creating 7z archive at {path:?}");
            sevenz_rust2::compress_to_path(&temp_dir, &path)
                .map_err(|e| anyhow!("Failed to create 7z archive: {}", e))?;

            // Cleanup temp directory
            std::fs::remove_dir_all(&temp_dir)
                .map_err(|e| anyhow!("Failed to cleanup temp directory: {}", e))?;

            Ok(())
        })
        .await
        .map_err(|e| anyhow!("Task join error: {}", e))?
    }

    fn clone_for_save(&self) -> SaveFile {
        SaveFile {
            version: self.version.clone(),
            po_number: self.po_number.clone(),
            buyer_id: self.buyer_id,
            vendor: self.vendor.clone(),
            order_date: self.order_date.clone(),
            ship_date: self.ship_date.clone(),
            cancel_date: self.cancel_date.clone(),
            shipping_notes: self.shipping_notes.clone(),
            description: self.description.clone(),
            terms: self.terms.clone(),
            ship_to_address: self.ship_to_address.clone(),
            fob_type: self.fob_type.clone(),
            fob_point: self.fob_point.clone(),
            notes: self.notes.clone(),
            manifests: self.manifests.clone(),
            assets: self.assets.clone(),
        }
    }
}

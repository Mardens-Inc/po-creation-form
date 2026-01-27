use anyhow::{Result, anyhow};
use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveFile {
    pub po_number: String,
    pub user_id: u32,
    pub vendor_id: String,
    pub order_date: chrono::NaiveDate,
    pub description: String,
    pub terms: String,
    pub ship_address: String,
    #[serde(alias = "disclaimers")]
    pub notes: String,
    pub shipping_info: ShippingInformation,
    pub fob: FreightOnBoard,
    pub assets: Vec<AssetFile>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FreightOnBoard {
    #[serde(rename = "type")]
    pub location: String,
    pub fob_type: FreightOnBoardType,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum FreightOnBoardType {
    Pickup,
    Delivery,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ShippingInformation {
    pub date: chrono::NaiveDate,
    pub cancel_date: chrono::NaiveDate,
    pub notes: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AssetFile {
    filename: String,
    path: String,
    file_type: String,
}

impl SaveFile {
    /// Asynchronously opens and processes a save file from the specified path.
    ///
    /// This function attempts to read a `.7z` archive at the given path, extracting
    /// its contents temporarily and searching for a file named `manifest.json`. The
    /// contents of `manifest.json` are then deserialized into an instance of the `Self` type.
    ///
    /// # Arguments
    ///
    /// * `path` - A type that can be converted into a reference to a `Path`. This specifies
    ///   the path of the `.7z` archive to be opened.
    ///
    /// # Returns
    ///
    /// Returns a `Result<Self>`, where:
    /// * `Ok(Self)` contains the deserialized object of the type implementing this method.
    /// * `Err(anyhow::Error)` contains an error if opening or processing the save file fails,
    ///   or if the `manifest.json` file is missing or cannot be parsed successfully.
    ///
    /// # Errors
    ///
    /// * Fails if the specified path does not exist or cannot be accessed.
    /// * Fails if there is an error decompressing the `.7z` archive.
    /// * Fails if the `manifest.json` file is not found within the archive.
    /// * Fails if the contents of `manifest.json` cannot be deserialized into the expected type.
    ///
    /// # Example
    ///
    /// ```rust
    /// use my_crate::SaveFile; // Replace with the actual type or module
    /// use std::path::Path;
    ///
    /// #[tokio::main]
    /// async fn main() -> Result<(), Box<dyn std::error::Error>> {
    ///     let save_file = SaveFile::open(Path::new("path/to/savefile.7z")).await?;
    ///     println!("Save file opened successfully: {:?}", save_file);
    ///     Ok(())
    /// }
    /// ```
    ///
    /// # Logging
    ///
    /// This function logs the path of the save file being opened at the `info` level.
    pub async fn open(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref();
        info!("Opening save file: {path:?}");
        let mut manifest_content = String::new();
        sevenz_rust2::decompress_file_with_extract_fn(path, ".", |entry, reader, _| {
            if entry.name() == "manifest.json" {
                reader.read_to_string(&mut manifest_content)?;
            }

            Ok(false)
        })
        .map_err(|e| anyhow!("Failed to open save file: {e}"))?;

        Ok(serde_json::from_str::<Self>(&manifest_content)?)
    }

    /// Asynchronously saves the current object and its associated assets to a 7z archive at the specified path.
    ///
    /// # Arguments
    /// * `path` - A path-like object representing the output location for the generated 7z archive.
    ///
    /// # Workflow
    /// 1. **Create a Temporary Directory**:
    ///    A temporary directory is created to stage the assets before compression. This is done using a UUID to ensure
    ///    uniqueness and avoid conflicts.
    ///
    /// 2. **Create an Assets Subdirectory**:
    ///    Within the temporary directory, an "assets" subdirectory is created to hold all associated asset files.
    ///
    /// 3. **Write a Manifest File**:
    ///    A `manifest.json` file is generated in the root of the temporary directory. The current object is serialized
    ///    into a JSON format, which serves as the manifest file, detailing the structure or metadata of the assets.
    ///
    /// 4. **Copy Asset Files**:
    ///    Each asset specified in the object is copied into the "assets" subdirectory. Failure to locate or copy any of
    ///    the asset files results in an error.
    ///
    /// 5. **Create a 7z Archive**:
    ///    The contents of the temporary directory, including `manifest.json` and the "assets" subdirectory, are compressed
    ///    into a 7z archive at the specified `path`.
    ///
    /// 6. **Cleanup Temporary Directory**:
    ///    After successful compression, the temporary directory and its contents are deleted to clean up intermediate
    ///    files.
    ///
    /// # Returns
    /// Returns a `Result<()>`:
    /// * `Ok(())` if the operation completes successfully.
    /// * `Err` if any step in the process fails, with an appropriate error message.
    ///
    /// # Errors
    /// * Errors may occur if:
    ///   - Temporary or assets subdirectories cannot be created.
    ///   - The manifest file cannot be serialized or written.
    ///   - Asset files are missing or cannot be copied.
    ///   - The 7z archive fails to be created.
    ///   - The temporary directory fails to be cleaned up.
    ///
    /// # Examples
    /// ```rust
    /// let my_object = MyObject::new(...);
    /// let result = my_object.save("/path/to/output.7z").await;
    /// match result {
    ///     Ok(_) => println!("Archive saved successfully."),
    ///     Err(e) => eprintln!("Failed to save archive: {}", e),
    /// }
    /// ```
    ///
    /// # Notes
    /// * This function depends on the `anyhow` crate for error handling, `serde_json` for serialization, and
    ///   `sevenz_rust2` for creating 7z archives.
    /// * Temporary directories are created using the system's default temporary directory as a base.
    /// * Make sure the necessary permissions exist to write to the specified output path and manipulate files.
    ///
    /// # Logging
    /// * The function emits debug and info-level logs for each significant step in the process.
    pub async fn save(&self, path: impl AsRef<Path>) -> Result<()> {
        let path = path.as_ref();
        // 1. Create temp directory for staging
        info!("Saving asset file to {path:?}");
        let temp_dir = std::env::temp_dir().join(format!("pocf_{}", uuid::Uuid::new_v4()));
        debug!("creating temp directory for staging: {temp_dir:?}");
        std::fs::create_dir_all(&temp_dir)
            .map_err(|e| anyhow!("Failed to create temp directory: {}", e))?;

        // 2. Create assets subdirectory
        let assets_dir = temp_dir.join("assets");
        debug!("creating assets directory: {assets_dir:?}");
        std::fs::create_dir_all(&assets_dir)
            .map_err(|e| anyhow!("Failed to create assets directory: {}", e))?;

        // 3. Write manifest.json
        let manifest_path = temp_dir.join("manifest.json");
        debug!("writing manifest.json to {manifest_path:?}");
        let manifest_json = serde_json::to_string_pretty(&self)
            .map_err(|e| anyhow!("Failed to serialize manifest: {}", e))?;
        std::fs::write(manifest_path, manifest_json)
            .map_err(|e| anyhow!("Failed to write manifest.json: {}", e))?;

        // 4. Copy all asset files to assets/
        debug!("copying asset files to {assets_dir:?}");
        for asset in &self.assets {
            let src = Path::new(&asset.path);
            if !src.exists() {
                return Err(anyhow!("Asset file not found: {}", asset.path));
            }
            let dst = assets_dir.join(&asset.filename);
            std::fs::copy(src, &dst)
                .map_err(|e| anyhow!("Failed to copy asset {}: {}", asset.filename, e))?;
            debug!("copied {src:?} to {dst:?}");
        }

        // 5. Create 7z archive with compression
        debug!("creating 7z archive at {path:?}");
        sevenz_rust2::compress_to_path(&temp_dir, path)
            .map_err(|e| anyhow!("Failed to create 7z archive: {}", e))?;

        // 6. Cleanup temp directory
        std::fs::remove_dir_all(&temp_dir)
            .map_err(|e| anyhow!("Failed to cleanup temp directory: {}", e))?;

        Ok(())
    }
}

pub use po_tracker_share_lib::save_file::SaveFile;

#[tauri::command]
pub async fn save(path: String, item: SaveFile) -> Result<(), String> {
    item.save(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load(path: String) -> Result<SaveFile, String> {
    SaveFile::open(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_save(path: String, item: SaveFile) -> Result<(), String> {
    save(path, item).await
}

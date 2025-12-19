use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{generate_handler, Runtime};

#[derive(Deserialize, Serialize, Debug)]
struct SaveItem {
    pub po_number: String,
    pub vendor: String,
    pub ship_to: String,
    pub terms: String,
    pub notes: String,
    pub creation_date: String,
    pub expected_delivery_date: Option<String>,
    pub manifests: Vec<ManifestItem>,
    pub assets: Vec<String>,
}

#[derive(Deserialize, Serialize, Debug)]
struct ManifestItem {
    path: String,
    filename: String,
    mappings: HashMap<String, String>,
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("save_system")
        .invoke_handler(generate_handler![save, load])
        .build()
}

#[tauri::command]
async fn save(_path: String, _item: SaveItem) {

}
#[tauri::command]
async fn load() -> Option<SaveItem> {
    None
}

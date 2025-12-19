use serde::{Deserialize, Serialize};
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
    mappings: TemplateItemStructure,
}
#[derive(Deserialize, Serialize, Debug)]
struct TemplateItemStructure {
    item_number: String,
    upc: String,
    description: String,
    case_pack: String,
    cases: String,
    mardens_cost: String,
    mardens_price: String,
    comp_retail: String,
    department: String,
    category: String,
    sub_category: String,
    season: String,
    notes: String,
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("save_system")
        .invoke_handler(generate_handler![save, load])
        .build()
}

#[tauri::command]
async fn save(path: String, item: SaveItem) {
    
}
#[tauri::command]
async fn load() -> Option<SaveItem> {
    None
}

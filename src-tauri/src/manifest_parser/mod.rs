use tauri::plugin::{Builder, TauriPlugin};
use tauri::{generate_handler, Runtime};

mod parser;
mod commands;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("manifest_parser")
        .invoke_handler(generate_handler![
            commands::parse_manifest_file,
            commands::validate_column_mapping
        ])
        .build()
}

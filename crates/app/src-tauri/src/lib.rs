mod manifest_parser;
mod save_system;

use tauri::{Emitter, Manager, WindowEvent};
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(StateFlags::MAXIMIZED | StateFlags::POSITION | StateFlags::SIZE)
                .build(),
        )
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                // Focus the window
                if let Err(e) = window.set_focus() {
                    eprintln!("Failed to set focus: {}", e);
                }

                // Parse command-line arguments for .pocf file path
                // Args format: ["exe_path", "file.pocf"] when opening file
                if args.len() > 1 {
                    let potential_file = &args[1];
                    if potential_file.ends_with(".pocf") && std::path::Path::new(potential_file).exists() {
                        // Emit event to frontend with file path
                        if let Err(e) = window.emit("open-file", potential_file.clone()) {
                            eprintln!("Failed to emit open-file event: {}", e);
                        }
                    }
                }
            }
        }))
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                window
                    .app_handle()
                    .save_window_state(
                        StateFlags::MAXIMIZED | StateFlags::POSITION | StateFlags::SIZE,
                    )
                    .expect("Failed to save window state");
            }
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            manifest_parser::commands::parse_manifest_file,
            manifest_parser::commands::validate_column_mapping,
            manifest_parser::commands::write_manifest_csv,
            save_system::save,
            save_system::load,
            save_system::update_save,
            get_api_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tauri::command]
fn get_api_url() -> String {
    #[cfg(debug_assertions)]
    return "http://localhost:8522/api".to_string();
    #[cfg(not(debug_assertions))]
    return "https://potracker.mardens.com/api".to_string();
}
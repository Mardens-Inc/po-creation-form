mod manifest_parser;
mod save_system;

use tauri::{Manager, WindowEvent};
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            app.get_webview_window("main")
                .expect("Failed to find window")
                .set_focus()
                .expect("Failed to set focus");
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(StateFlags::MAXIMIZED | StateFlags::POSITION | StateFlags::SIZE)
                .build(),
        )
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main")
                && let Err(e) = window.set_focus()
            {
                eprintln!("Failed to set focus: {}", e);
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
        .invoke_handler(tauri::generate_handler![
            manifest_parser::commands::parse_manifest_file,
            manifest_parser::commands::validate_column_mapping,
            manifest_parser::commands::write_manifest_csv,
            save_system::save,
            save_system::load
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

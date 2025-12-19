mod save_system;
mod manifest_parser;

use tauri::{Manager, WindowEvent};
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(save_system::init())
        .plugin(manifest_parser::init())
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
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

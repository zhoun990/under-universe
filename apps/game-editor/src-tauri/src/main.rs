// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::fs::File;
use std::io::Write;
use tauri::api::dialog::blocking::FileDialogBuilder;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn write_file(file_string: &str) -> bool {
    let result = FileDialogBuilder::new().pick_files();
    if let Some(file_paths) = result {
        if let Some(path) = file_paths.first() {
            let mut buffer = File::create(path).expect("ファイル作成中にエラーが発生しました。");
            buffer
                .write_all(format!("{}", file_string).as_bytes())
                .expect("ファイル書き込み中にエラーが発生しました。");
            true
        } else {
            false
        }
    } else {
        false
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![write_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

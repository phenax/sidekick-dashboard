#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::path::PathBuf;

#[derive(serde::Serialize, serde::Deserialize, Debug, Default)]
struct TaskItem {
  text: String,
  #[serde(skip_serializing_if = "std::ops::Not::not")]
  #[serde(default)]
  checked: bool,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Default)]
struct DashboardData {
  tasks: Vec<TaskItem>,
}

fn get_data_path() -> PathBuf {
  let mut path = std::env::home_dir().unwrap_or(PathBuf::new());
  path.push("nixos/extras/notes/today.yml");
  path
}

fn fetch_data() -> DashboardData {
  std::fs::read_to_string(get_data_path())
    .map_err(|_| ())
    .and_then(|s| serde_yaml::from_str(&s).map_err(|_| ()))
    .unwrap_or_else(|_| DashboardData::default())
}

#[tauri::command]
fn load_tasks() -> Vec<TaskItem> {
  let res = fetch_data();
  res.tasks
}

#[tauri::command]
fn sync_tasks(tasks: Vec<TaskItem>) -> () {
  let mut data = fetch_data();
  data.tasks = tasks;

  let data_str = serde_yaml::to_string(&data).unwrap();
  std::fs::write(get_data_path(), data_str).unwrap();
  println!("sync done");
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![load_tasks, sync_tasks])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

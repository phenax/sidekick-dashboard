#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct TaskItem {
  text: String,
  checked: bool,
}

#[tauri::command]
fn load_tasks() -> Vec<TaskItem> {
  vec![
    TaskItem {
      text: "foobar".to_string(),
      checked: false,
    },
    TaskItem {
      text: "Nicetyt".to_string(),
      checked: true,
    },
    TaskItem {
      text: "Gogo gadget".to_string(),
      checked: false,
    },
  ]
}

#[tauri::command]
fn sync_tasks(tasks: Vec<TaskItem>) -> () {
  println!("Syncingg : {:?}", tasks);
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![load_tasks, sync_tasks])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

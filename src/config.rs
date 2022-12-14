use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct TaskData {
  pub text: String,
  #[serde(skip_serializing_if = "std::ops::Not::not")]
  #[serde(default)]
  pub checked: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct DailyTasks {
  pub tasks: Vec<TaskData>,
  pub date: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct Config {
  pub tasks: Vec<TaskData>,
  pub daily: DailyTasks,
}

const FILENAME: &str = "/home/imsohexy/nixos/extras/notes/today.yml";

static mut GLOBAL_CONFIG: Option<Config> = None;

impl Config {
  pub fn get() -> Self {
    unsafe {
      if let Some(cfg) = GLOBAL_CONFIG.clone() {
        return cfg;
      }

      let config = Self::load_config_file();
      GLOBAL_CONFIG = Some(config.clone());
      config
    }
  }

  pub fn reset() {
    unsafe { GLOBAL_CONFIG = None }
  }

  fn load_config_file() -> Self {
    let contents =
      std::fs::read_to_string(FILENAME).expect("Something went wrong reading the file");

    serde_yaml::from_str(&contents).expect("Parsing error")
  }

  pub fn save(&self) {
    let data = serde_yaml::to_string(self).expect("Cant serialize");
    std::fs::write(FILENAME, data).expect("Unable to write to file");
  }
}

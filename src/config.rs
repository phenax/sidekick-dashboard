use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct TaskData {
  pub text: String,
  pub checked: bool,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct Config {
  pub today: Vec<TaskData>,
}

const FILENAME: &str = "/home/imsohexy/nixos/extras/notes/today.yml";

impl Config {
  pub fn load_file() -> Self {
    let contents =
      std::fs::read_to_string(FILENAME).expect("Something went wrong reading the file");

    serde_yaml::from_str(&contents).expect("Parsing error")
  }

  pub fn save(&self) {
    let data = serde_yaml::to_string(self).expect("Cant deserialize");
    std::fs::write(FILENAME, data).expect("Unable to write to file");
  }
}

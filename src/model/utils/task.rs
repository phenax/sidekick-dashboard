use crate::config::TaskData;
use qmetaobject::{prelude::*, SimpleListItem};

#[derive(SimpleListItem, QObject, Default)]
pub struct Task {
  base: qt_base_class!(trait QObject),

  pub text: qt_property!(QString),
  pub checked: qt_property!(bool),
}

impl Task {
  pub fn from(data: TaskData) -> Self {
    Self {
      text: data.text.into(),
      checked: data.checked,
      ..Self::default()
    }
  }

  pub fn to_data(&self) -> TaskData {
    TaskData {
      text: self.text.to_string(),
      checked: self.checked,
    }
  }

  pub fn set_checked(&self, checked: bool) -> Self {
    Self {
      checked,
      text: self.text.clone(),
      ..Self::default()
    }
  }
}

pub trait TaskListModel {
  fn load_tasks(&mut self);
  fn set_checked(&mut self, index: usize, checked: bool);
  fn toggle_checked(&mut self, index: usize);
  fn set_focus(&mut self, task: String);
  fn get_task_text(&self, index: usize) -> QString;
}

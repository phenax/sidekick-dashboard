use crate::config::{Config, TaskData};
use qmetaobject::{prelude::*, SimpleListItem, SimpleListModel};
use std::cell::RefCell;
use std::ops::Index;

#[derive(SimpleListItem, QObject, Default)]
struct Task {
  base: qt_base_class!(trait QObject),

  pub text: qt_property!(QString),
  pub checked: qt_property!(bool),
}

impl Task {
  fn from(data: TaskData) -> Self {
    Self {
      text: data.text.into(),
      checked: data.checked,
      ..Self::default()
    }
  }

  fn to_data(&self) -> TaskData {
    TaskData {
      text: self.text.to_string(),
      checked: self.checked,
    }
  }

  fn set_checked(&self, checked: bool) -> Self {
    Self {
      checked,
      text: self.text.clone(),
      ..Self::default()
    }
  }
}

#[derive(QObject, Default)]
pub struct TasksModel {
  base: qt_base_class!(trait QObject),
  tasks: qt_property!(RefCell<SimpleListModel<Task>>; NOTIFY tasks_updated),

  // Signals
  tasks_updated: qt_signal!(),

  // Methods
  load_tasks: qt_method!(fn(&mut self)),
  set_checked: qt_method!(fn(&mut self, index: usize, checked: bool)),
}

impl TasksModel {
  fn load_tasks(&mut self) {
    let d = Config::get();

    self
      .tasks
      .borrow_mut()
      .reset_data(d.tasks.iter().map(|t| Task::from((*t).clone())).collect());

    self.tasks_updated();
  }

  fn set_checked(&mut self, index: usize, checked: bool) {
    let mut tasks = self.tasks.borrow_mut();
    let t = tasks.index(index).set_checked(checked);
    tasks.change_line(index, t);
    self.tasks_updated();

    // Save config
    Config {
      tasks: tasks.iter().map(|t| t.to_data()).collect(),
      ..Config::get()
    }
    .save()
  }
}

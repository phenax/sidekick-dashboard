use crate::config::Config;
use crate::model::utils::task::{Task, TaskListModel};
use qmetaobject::{prelude::*, SimpleListModel};
use std::cell::RefCell;
use std::ops::Index;

#[derive(QObject, Default)]
pub struct TasksModel {
  base: qt_base_class!(trait QObject),
  tasks: qt_property!(RefCell<SimpleListModel<Task>>; NOTIFY tasks_updated),
  focus: qt_property!(QString; NOTIFY focus_updated),

  // Signals
  tasks_updated: qt_signal!(),
  focus_updated: qt_signal!(),

  // Methods
  load_tasks: qt_method!(fn(&mut self)),
  set_checked: qt_method!(fn(&mut self, index: usize, checked: bool)),
  set_focus: qt_method!(fn(&mut self, task: String)),
}

impl TaskListModel for TasksModel {
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

  fn set_focus(&mut self, task: String) {
    self.focus = task.into();
    self.focus_updated();
  }
}

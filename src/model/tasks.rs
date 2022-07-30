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
    self.tasks.borrow_mut().insert(
      0,
      Task {
        text: "Helolo worldd".into(),
        ..Task::default()
      },
    );
    self.tasks.borrow_mut().insert(
      0,
      Task {
        text: "Testing 1 2 4".into(),
        ..Task::default()
      },
    );
    self.tasks.borrow_mut().insert(
      0,
      Task {
        text: "More tasks will go here foobasr".into(),
        ..Task::default()
      },
    );

    self.tasks_updated();
  }

  fn set_checked(&mut self, index: usize, checked: bool) {
    let mut tasks = self.tasks.borrow_mut();
    let t = tasks.index(index).set_checked(checked);
    tasks.change_line(index, t);
    self.tasks_updated()
  }
}

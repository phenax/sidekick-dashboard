use crate::config::{Config, DailyTasks, TaskData};
use crate::model::utils::task::{Task, TaskListModel};
use qmetaobject::{prelude::*, SimpleListModel};
use std::cell::RefCell;
use std::ops::Index;

#[derive(QObject, Default)]
pub struct DailyModel {
  base: qt_base_class!(trait QObject),
  tasks: qt_property!(RefCell<SimpleListModel<Task>>; NOTIFY tasks_updated),

  // Signals
  tasks_updated: qt_signal!(),

  // Methods
  load_tasks: qt_method!(fn(&mut self)),
  set_checked: qt_method!(fn(&mut self, index: usize, checked: bool)),
  toggle_checked: qt_method!(fn(&mut self, index: usize)),
  // set_focus: qt_method!(fn(&mut self, task: String)),
  // get_task_text: qt_method!(fn(&self, index: usize) -> QString),
}

fn update_daily(tasks: Vec<TaskData>) {
  let cfg = Config::get();
  Config {
    daily: DailyTasks { tasks, ..cfg.daily },
    ..cfg
  }
  .save()
}

impl TaskListModel for DailyModel {
  fn load_tasks(&mut self) {
    let mut cfg = Config::get();

    let date = chrono::Local::now().format("%D").to_string();
    if cfg.daily.date != date {
      cfg = Config {
        daily: DailyTasks {
          date,
          tasks: cfg
            .daily
            .tasks
            .iter()
            .map(|t| TaskData {
              checked: false,
              text: t.text.to_string(),
            })
            .collect(),
        },
        ..cfg
      };

      cfg.save()
    }

    self.tasks.borrow_mut().reset_data(
      cfg
        .daily
        .tasks
        .iter()
        .map(|t| Task::from((*t).clone()))
        .collect(),
    );

    self.tasks_updated();
  }

  fn set_checked(&mut self, index: usize, checked: bool) {
    let mut tasks = self.tasks.borrow_mut();
    let t = tasks.index(index).set_checked(checked);
    tasks.change_line(index, t);
    self.tasks_updated();

    // Save config
    update_daily(tasks.iter().map(|t| t.to_data()).collect())
  }

  fn toggle_checked(&mut self, index: usize) {
    let mut tasks = self.tasks.borrow_mut();
    let t = tasks.index(index);
    let t = t.set_checked(!t.checked);
    tasks.change_line(index, t);
    self.tasks_updated();

    // Save config
    update_daily(tasks.iter().map(|t| t.to_data()).collect())
  }

  fn set_focus(&mut self, _task: String) {}
  fn get_task_text(&self, _index: usize) -> QString {
    "".into()
  }
}

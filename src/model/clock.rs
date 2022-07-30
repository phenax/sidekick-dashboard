use chrono::Local;
use qmetaobject::prelude::*;

#[derive(QObject, Default)]
pub struct ClockModel {
  base: qt_base_class!(trait QObject),
  time: qt_property!(QString; NOTIFY update),
  date: qt_property!(QString; NOTIFY update),
  time_format: qt_property!(QString),
  date_format: qt_property!(QString),

  // Signals
  update: qt_signal!(),

  // Methods
  update_time: qt_method!(fn(&mut self)),
}

impl ClockModel {
  fn update_time(&mut self) {
    let now = Local::now();

    self.time = now.format(&self.time_format.to_string()).to_string().into();
    self.date = now.format(&self.date_format.to_string()).to_string().into();

    self.update();
  }
}

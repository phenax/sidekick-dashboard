use crate::config::Config;
use qmetaobject::prelude::*;

#[derive(QObject, Default)]
pub struct ConfigModel {
  base: qt_base_class!(trait QObject),

  refreshed: qt_signal!(),

  // Methods
  refresh: qt_method!(fn(&mut self)),
}

impl ConfigModel {
  fn refresh(&mut self) {
    Config::reset();
    self.refreshed()
  }
}

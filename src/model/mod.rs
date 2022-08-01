use cstr::cstr;
use qmetaobject::prelude::*;

pub mod clock;
pub mod config;
pub mod tasks;

const MODULE_NAME: &std::ffi::CStr = cstr!("Sidekick");
const MODULE_VERSION: (u32, u32) = (1, 0);

macro_rules! register {
  ($class: ty, $name: expr) => {
    qml_register_type::<$class>(
      MODULE_NAME,
      MODULE_VERSION.0,
      MODULE_VERSION.1,
      cstr!($name),
    );
  };
}

pub fn register_all() {
  register!(clock::ClockModel, "ClockModel");
  register!(tasks::TasksModel, "TasksModel");
  register!(config::ConfigModel, "ConfigModel");
}

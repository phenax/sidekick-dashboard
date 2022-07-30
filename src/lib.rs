use qmetaobject::prelude::*;
#[cfg(not(no_qt))]
use qmetaobject::webengine;

mod model;
mod resources;

pub fn create_application() -> QQuickView {
  #[cfg(not(no_qt))]
  webengine::initialize();

  resources::load_resources();
  model::register_all();

  let mut view = QQuickView::new();

  let engine = view.engine();
  engine.load_file("qrc:/qml/src/main.qml".into());

  view
}

pub fn run_application() {
  let mut view = create_application();
  let engine = view.engine();

  #[cfg(not(no_qt))]
  engine.exec();
}

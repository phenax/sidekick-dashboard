use qmetaobject::prelude::*;

qrc!(pub load_resources,
  "qml" {
    "src/main.qml",

    // Fonts
    "assets/Oxanium-Bold.ttf",
    "assets/Oxanium-Regular.ttf",

    // Widgets
    "src/widgets/Clock.qml",
    "src/widgets/TaskList.qml",
    "src/widgets/Checkbox.qml",
    "src/widgets/IdleAnimations.qml",
  },
);

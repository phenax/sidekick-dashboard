import QtQuick 2.9;
import QtQuick.Controls 1.4;
import QtQuick.Controls.Styles 1.4;
import QtQuick.Layouts 1.15;

import Sidekick 1.0;
import "." as Widget;

ListView {
  id: listView
  property var taskModel

  Component.onCompleted: {
    listView.taskModel.load_tasks()
  }

  function refresh() {
    listView.taskModel.load_tasks()
  }

  anchors.fill: parent
  model: listView.taskModel.tasks
  anchors.margins: 30
  spacing: 5
  clip: true

  delegate: Item {
    width: ListView.view.width
    height: childrenRect.height

    Widget.Checkbox {
      checked: model.checked
      onChanged: checked => listView.taskModel.set_checked(model.index, checked)
    }
  }
}

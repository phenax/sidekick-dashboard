import QtQuick 2.9;
import QtQuick.Controls 1.4;
import QtQuick.Controls.Styles 1.4;
import QtQuick.Layouts 1.15;

import Sidekick 1.0;
import "." as Widget;

ListView {
  id: listView
  property var taskModel
  property bool withFocus: false;

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

  delegate: Row {
    width: ListView.view.width
    height: childrenRect.height

    Widget.Checkbox {
      text: model.text
      checked: model.checked
      onChanged: checked => listView.taskModel.set_checked(model.index, checked)
      width: parent.width - focusBtn.width
    }

    Rectangle {
      id: focusBtn
      anchors.right: parent.right
      height: parent.height
      width: 40
      color: primaryColor
      border.color: "transparent"
      border.width: 1

      MouseArea {
        hoverEnabled: true
        anchors.fill: parent
        onClicked: taskModel.set_focus(model.text)
        onEntered: focusBtn.border.color = "#444"
        onExited: focusBtn.border.color = "transparent"
      }

      Text {
        text: "🎯"
        color: textColor
        anchors.fill: parent
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
      }
    }
  }
}

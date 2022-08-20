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

  property int current: 0

  function length() {
    return taskModel.tasks.rowCount()
  }

  function highlightNext() {
    current = (current + 1) % listView.length()
  }
  function highlightPrev() {
    current = current === 0 ? listView.length() - 1 : current - 1
  }
  function highlightFocus() {
    taskModel.set_focus(taskModel.get_task_text(current))
  }
  function highlightToggle() {
    taskModel.toggle_checked(current)
  }

  anchors.fill: parent
  model: taskModel.tasks
  anchors.margins: 30
  spacing: 5
  clip: true

  delegate: Row {
    width: ListView.view.width
    height: childrenRect.height

    Rectangle {
      width: 4
      height: parent.height
      color: listView.current === model.index ? accentColor : primaryColor
    }

    Widget.Checkbox {
      id: checkbox
      text: model.text
      checked: model.checked
      onChanged: checked => listView.taskModel.set_checked(model.index, checked)
      width: parent.width - (withFocus ? focusBtn.width : 0)
    }

    Rectangle {
      visible: withFocus
      id: focusBtn
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

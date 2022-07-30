import QtQuick 2.9;
import QtQuick.Controls 1.4;
import QtQuick.Controls.Styles 1.4;
import QtQuick.Layouts 1.15;

import Sidekick 1.0;

ListView {
  TasksModel {
    id: tasksModel
    Component.onCompleted: tasksModel.load_tasks()
  }

  anchors.fill: parent
  model: tasksModel.tasks
  anchors.margins: 30
  spacing: 5
  clip: true

  delegate: Item {
    width: ListView.view.width
    height: childrenRect.height

    Rectangle {
      color: primaryColor
      width: parent.width
      height: blockRow.height + 20

      MouseArea {
        enabled: true
          onClicked: tasksModel.set_checked(model.index, !model.checked)
        anchors.fill: parent
      }

      Row {
        id: blockRow
        width: parent.width
        height: childrenRect.height
        x: 10
        y: 10
        spacing: 16

        Rectangle {
          width: 35
          height: 35
          color: primaryColor
          border.width: 2
          border.color: contentBackground

          Rectangle {
            visible: model.checked
            color: accentColor
            anchors.margins: 1
            anchors.fill: parent
          }
        }

        Text {
          text: model.text
          color: textColor
          font.pointSize: 20
          font.family: contentFont.name
          y: 5
          wrapMode: Text.WordWrap
          width: parent.width
          verticalAlignment: Text.AlignVCenter
        }
      }
    }
  }
}

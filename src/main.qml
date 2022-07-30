import QtQuick 2.9;
import QtQuick.Window 2.0;
import QtQuick.Controls 1.4;
import QtQuick.Controls.Styles 1.4;
import QtQuick.Layouts 1.15;

import Sidekick 1.0;

Window {
  id: window
  title: "Sidekick Dashboard"
  visible: true
  width: 600
  height: 800

  property var primaryColor: "#000207";
  property var accentColor: "#4e3aA3";
  property var textColor: "white";

  property var clockBackground: primaryColor;
  property var contentBackground: "#0f0c19";

  FontLoader {
    id: titleFont
    source: "../assets/Oxanium-Bold.ttf"
  }

  FontLoader {
    id: contentFont
    source: "../assets/Oxanium-Regular.ttf"
  }

  ClockModel {
    id: clockModel
    time_format: "%I:%M:%S"
    date_format: "%A, %d %b"

    Component.onCompleted: clockModel.update_time()
  }
  Timer {
    interval: 500;
    running: true;
    repeat: true
    onTriggered: clockModel.update_time()
  }

  Column {
    anchors.fill: parent
    spacing: 0

    Rectangle {
      id: clock
      color: clockBackground
      width: parent.width
      height: 300

      Column {
        anchors.fill: parent
        anchors.topMargin: 50
        anchors.bottomMargin: anchors.topMargin
        anchors.leftMargin: 50
        anchors.rightMargin: anchors.leftMargin
        spacing: 0

        Text {
          text: clockModel.time
          color: textColor
          width: parent.width
          height: parent.height * 0.75
          fontSizeMode: Text.HorizontalFit
          verticalAlignment: Text.AlignBottom
          horizontalAlignment: Text.AlignHCenter
          font.pointSize: 120
          font.bold: true
          font.family: titleFont.name
        }

        Text {
          text: clockModel.date
          color: textColor
          width: parent.width
          horizontalAlignment: Text.AlignHCenter
          font.pointSize: 22
          font.bold: true
          font.family: titleFont.name
        }
      }
    }

    Rectangle {
      id: content
      color: contentBackground
      width: parent.width
      height: parent.height - clock.height

      Column {
        anchors.fill: parent
        anchors.margins: 30
        spacing: 0

        CheckBox {
          text: "This is the first task"
          checked: false
          // anchors.left: parent.left
          // anchors.right: parent.right

          style: CheckBoxStyle {
            spacing: 20

            indicator: Rectangle {
              implicitWidth: 35
              implicitHeight: 35
              color: primaryColor

              Rectangle {
                visible: control.checked
                color: accentColor
                anchors.margins: 1
                anchors.fill: parent
              }
            }

            label: Text {
              text: control.text
              color: textColor
              font.pointSize: 20
              font.family: contentFont.name
            }
          }
        }
      }
    }
  }
}

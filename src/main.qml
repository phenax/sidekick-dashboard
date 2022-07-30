import QtQuick 2.9;
import QtQuick.Window 2.0;
import QtQuick.Controls 1.4;
import QtQuick.Controls.Styles 1.4;
import QtQuick.Layouts 1.15;

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
        spacing: 0

        Text {
          text: "03:27"
          color: textColor
          width: parent.width
          height: parent.height * 0.73
          horizontalAlignment: Text.AlignHCenter
          verticalAlignment: Text.AlignBottom
          font.pointSize: 125
          font.bold: true
          font.family: titleFont.name
        }

        Text {
          text: "Friday, 30 July"
          color: textColor
          width: parent.width
          horizontalAlignment: Text.AlignHCenter
          verticalAlignment: Text.AlignTop
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
          text: "This is the first"
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

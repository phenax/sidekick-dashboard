import QtQuick 2.9;
import QtQuick.Window 2.0;
import QtQuick.Layouts 1.15;
import QtQuick.Controls 1.4;

import Sidekick 1.0;
import "widgets" as Widget;

Window {
  id: window
  title: "Sidekick Dashboard"
  visible: true
  width: 600
  height: 800

  property var primaryColor: "#000207";
  property var accentColor: "#4e3aA3";
  property var textColor: "white";

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
      color: primaryColor
      width: parent.width
      height: 300

      Widget.Clock {}
    }

    Rectangle {
      color: contentBackground
      width: parent.width
      height: parent.height - clock.height

      Column {
        id: content
        anchors.fill: parent
        anchors.topMargin: 10

        Item {
          id: tabState

          property var tabs: ["Tasks", "-"]
          property var activeTab: 0

          function next() {
            tabState.activeTab = (tabState.activeTab + 1) % tabState.tabs.length
          }
          function prev() {
            tabState.activeTab = tabState.activeTab == 0 ? tabState.tabs.length - 1 : tabState.activeTab - 1
          }
        }

        Row {
          spacing: 0
          width: parent.width
          height: 30

          component ScaledButton: Rectangle {
            id: arrowBtn
            property var text
            signal clicked

            readonly property var activeColor: "#30000000"
            readonly property var defaultColor: "transparent"

            width: parent.width * 2 / 5
            height: parent.height
            color: defaultColor

            MouseArea {
              hoverEnabled: true
              anchors.fill: parent
              onClicked: arrowBtn.clicked()
              onEntered: arrowBtn.color = activeColor
              onExited: arrowBtn.color = defaultColor
            }

            Text {
              text: arrowBtn.text
              anchors.fill: parent
              color: textColor
              font.family: titleFont.name
              font.pointSize: 16
              horizontalAlignment: Text.AlignHCenter
              verticalAlignment: Text.AlignVCenter
            }
          }

          ScaledButton {
            text: "⇐"
            onClicked: tabState.next()
          }

          Text {
            text: tabState.tabs[tabState.activeTab]
            width: parent.width / 5
            height: parent.height
            color: textColor
            font.family: contentFont.name
            font.pointSize: 16
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
          }

          ScaledButton {
            text: "⇒"
            onClicked: tabState.prev()
          }
        }

        StackLayout {
          id: tabStack
          currentIndex: tabState.activeTab
          width: content.width
          height: content.height

          Item {
            Widget.TaskList { }
          }

          Item {
            Text { text: "foobar" }
          }
        }
      }
    }
  }
}

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
      id: content
      color: contentBackground
      width: parent.width
      height: parent.height - clock.height

      Column {
        id: tabState
        anchors.fill: parent
        anchors.topMargin: 10

        property var tabs: ["Tasks", "-"]
        property var activeTab: 0

        function next() {
          tabState.activeTab = (tabState.activeTab + 1) % tabState.tabs.length
        }
        function prev() {
          tabState.activeTab = tabState.activeTab == 0 ? tabState.tabs.length - 1 : tabState.activeTab - 1
        }

        Row {
          spacing: 0
          width: parent.width
          height: 30

          Rectangle {
            width: parent.width * 2 / 5
            height: parent.height
            color: "transparent"

            MouseArea {
              anchors.fill: parent
              onClicked: tabState.next()
            }

            Text {
              text: "⇐"
              anchors.fill: parent
              color: textColor
              font.family: titleFont.name
              font.pointSize: 16
              horizontalAlignment: Text.AlignHCenter
              verticalAlignment: Text.AlignVCenter
            }
          }

          Text {
            text: tabState.tabs[tabState.activeTab]
            width: parent.width / 5
            height: parent.height
            font.family: contentFont.name
            color: textColor
            font.pointSize: 16
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
          }

          Rectangle {
            width: parent.width * 2 / 5
            height: parent.height
            color: "transparent"

            MouseArea {
              anchors.fill: parent
              onClicked: tabState.prev()
            }

            Text {
              text: "⇒"
              anchors.fill: parent
              color: textColor
              font.family: titleFont.name
              font.pointSize: 16
              horizontalAlignment: Text.AlignHCenter
              verticalAlignment: Text.AlignVCenter
            }
          }
        }

        StackLayout {
          id: tabStack
          currentIndex: tabState.activeTab
          width: tabState.width
          height: tabState.height

          Rectangle {
            color: contentBackground
            Widget.TaskList { }
          }

          Text { text: "foobar" }
        }
      }
    }
  }
}

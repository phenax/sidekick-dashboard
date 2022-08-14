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

  property var primaryColor: "#000207"
  property var accentColor: "#442fa7"
  property var textColor: "white"

  property var contentBackground: "#0f0c19"

  FontLoader {
    id: titleFont
    source: "../assets/Oxanium-Bold.ttf"
  }

  FontLoader {
    id: contentFont
    source: "../assets/Oxanium-Regular.ttf"
  }

  Timer {
    interval: 8000
    running: true
    repeat: true
    onTriggered: globalConfig.refresh()
  }
  ConfigModel {
    id: globalConfig
    onRefreshed: {
      console.log("[reloaded config]")
      taskList.refresh()
      dailyList.refresh()
    }
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

          property var tabs: ["Tasks", "Daily todo", "λ", "Focus mode"]
          property var activeTab: 0

          function getNextTab() {
            return (tabState.activeTab + 1) % tabState.tabs.length
          }
          function getPrevTab() {
            return tabState.activeTab == 0 ? tabState.tabs.length - 1 : tabState.activeTab - 1
          }

          function next() {
            tabState.activeTab = tabState.getNextTab()
          }
          function prev() {
            tabState.activeTab = tabState.getPrevTab()
          }
          function getNextTabLabel() {
            return tabState.tabs[tabState.getNextTab()]
          }
          function getPrevTabLabel() {
            return tabState.tabs[tabState.getPrevTab()]
          }

          function openFocusMode() {
            tabState.activeTab = tabState.tabs.indexOf("Focus mode")
          }
        }

        Row {
          spacing: 0
          width: parent.width
          height: 45

          component ScaledButton: Rectangle {
            id: arrowBtn
            property var icon
            property var label
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

            Column {
              anchors.fill: parent

              Text {
                width: parent.width
                text: arrowBtn.icon
                color: textColor
                font.family: titleFont.name
                font.pointSize: 16
                horizontalAlignment: Text.AlignHCenter
              }
              Text {
                width: parent.width
                text: arrowBtn.label
                color: textColor
                font.family: titleFont.name
                font.pointSize: 8
                horizontalAlignment: Text.AlignHCenter
              }
            }
          }

          ScaledButton {
            icon: "⇐"
            label: tabState.getPrevTabLabel()
            onClicked: tabState.prev()
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
            icon: "⇒"
            label: tabState.getNextTabLabel()
            onClicked: tabState.next()
          }
        }

        TasksModel {
          id: taskModel
          focus: "No task selected"
          onFocus_updated: {
            tabState.openFocusMode()
            focusMode.reset()
          }
        }

        StackLayout {
          id: tabStack
          currentIndex: tabState.activeTab
          width: content.width
          height: content.height

          Item {
            Widget.TaskList {
              id: taskList
              taskModel: taskModel
              withFocus: true
            }
          }

          Item {
            Widget.TaskList {
              id: dailyList
              taskModel: DailyModel {}
            }
          }

          Item {
            Widget.IdleAnimations { }
          }

          Item {
            Widget.FocusMode {
              id: focusMode
              text: taskModel.focus
            }
          }
        }
      }
    }
  }
}

import QtQuick 2.9;
import QtQuick.Window 2.0;
import QtQuick.Layouts 1.15;
import QtQuick.Controls 1.4;
import QtQuick.Shapes 1.15;

import Sidekick 1.0;
import "widgets" as Widget;

Window {
  id: window
  title: "Sidekick Dashboard"
  visible: true
  width: 600
  height: 800

  property var primaryColor: "#000207"
  property var accentColor: "#4e3aA3"
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

          property var tabs: ["Tasks", "Daily todo", "-", "Focus mode"]
          property var activeTab: 3

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

        component FocusMode: Item {
          id: focusMode
          anchors.fill: parent

          readonly property var startTime: Date.now()
          readonly property var duration: 3 * 1000

          property var current: 0
          property bool isComplete: current === 1

          Timer {
            interval: 100
            running: true
            repeat: true
            onTriggered: {
              focusMode.current = Math.min(1, (Date.now() - focusMode.startTime) / focusMode.duration)
              canvas.requestPaint()
            }
          }

          Canvas {
            id: canvas
            anchors.fill: parent
            renderStrategy: Canvas.Threaded

            readonly property int radius: Math.min(width, height)/2 - 30
            readonly property int thickness: 20

            function getCurrentTime() {
              const timeInMs = focusMode.current * focusMode.duration
              const timeInSecs = Math.floor(timeInMs / 1000)
              const minutes = Math.floor(timeInSecs / 60)
              const seconds = timeInSecs % 60

              return `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(0).padStart(2, '0')}`
            }

            onPaint: {
              const ctx = getContext('2d')
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              const midX = canvas.width / 2
              const midY = canvas.height / 2

              const arc = (start, end) => {
                const offset = Math.PI/2
                ctx.beginPath()
                ctx.lineWidth = thickness
                ctx.arc(midX, midY, radius, start - offset, end - offset)
                ctx.stroke()
              }

              ctx.strokeStyle = primaryColor
              arc(0, 2 * Math.PI)

              ctx.strokeStyle = isComplete ? "white" : accentColor
              arc(0, current * 2 * Math.PI)

              const fontSize = radius / 2
              Object.assign(ctx, {
                fillStyle: textColor,
                textAlign: 'center',
                textBaseline: 'middle',
                font: `${fontSize}px ${titleFont.name}`,
              })
              ctx.fillText(getCurrentTime(), midX, midY + fontSize / 10)
            }
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
              taskModel: TasksModel {}
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
            FocusMode { }
          }
        }
      }
    }
  }
}

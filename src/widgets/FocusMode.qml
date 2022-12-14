import QtQuick 2.9;
import QtQuick.Window 2.0;
import QtQuick.Layouts 1.15;
import QtQuick.Controls 1.4;

Column {
  id: focusMode
  anchors.fill: parent
  anchors.topMargin: 50
  property var __mins: 60 * 1000

  // prop
  property var text

  // state
  property var duration: 30 * __mins
  property var current: 0
  readonly property bool isComplete: current >= duration

  function setDuration(cur) {
    focusMode.duration = cur
    canvas.requestPaint()
  }

  function setCurrent(cur) {
    focusMode.current = cur
    canvas.requestPaint()
  }

  function reset() {
    focusMode.current = 0
    focusMode.duration = 30 * __mins
    canvas.requestPaint()
  }

  function toggle() {
    timer.toggle()
  }

  Timer {
    id: timer
    interval: 500
    running: false
    repeat: true
    onTriggered: {
      if (focusMode.isComplete) {
        timer.running = false
      } else {
        const cur = Math.min(focusMode.duration, focusMode.current + interval)
        setCurrent(cur)
      }
    }

    function toggle() {
      if (focusMode.isComplete) {
        focusMode.reset()
      }

      timer.running = !timer.running
    }
  }

  Rectangle {
    id: focusTextWrap
    width: parent.width
    height: focusText.contentHeight + 40
    color:
      focusMode.isComplete ? "white"
      : timer.running ? accentColor
      : primaryColor

    Text {
      id: focusText
      width: parent.width
      padding: 20
      text:  focusMode.text
      color: focusMode.isComplete ? primaryColor : textColor
      font.family: titleFont.name
      font.pointSize: 22
      font.bold: true
      wrapMode: Text.WordWrap
      horizontalAlignment: Text.AlignHCenter
    }

    MouseArea {
      visible: focusMode.isComplete
      anchors.fill: parent
      onClicked: {
        setDuration(focusMode.duration + 15 * __mins)
        timer.running = true
      }
    }

    Text {
      visible: focusMode.isComplete
      text: "+ 15"
      font.pointSize: 14
      width: 80
      height: parent.height
      anchors.right: parent.right
      font.family: titleFont.name
      horizontalAlignment: Text.AlignHCenter
      verticalAlignment: Text.AlignVCenter
    }
  }

  Canvas {
    id: canvas
    width: parent.width
    height: parent.height - focusTextWrap.height
    renderStrategy: Canvas.Threaded

    readonly property int radius: Math.max(10, Math.min(width, height)/2 - 30 - 2*thickness)
    readonly property int thickness: 20

    function getCurrentTime() {
      const timeInMs = focusMode.duration - focusMode.current
      const timeInSecs = Math.floor(timeInMs / 1000)
      const minutes = Math.floor(timeInSecs / 60)
      const seconds = timeInSecs % 60

      return `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(0).padStart(2, '0')}`
    }

    MouseArea {
      anchors.fill: parent
      onClicked: timer.toggle()
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
      arc(0, 2 * Math.PI * focusMode.current/focusMode.duration)

      const fontSize = radius / 2
      Object.assign(ctx, {
        fillStyle: timer.running || focusMode.isComplete ? textColor : primaryColor,
        textAlign: 'center',
        textBaseline: 'middle',
        font: `${fontSize}px ${titleFont.name}`,
      })
      ctx.fillText(getCurrentTime(), midX, midY + fontSize / 10)
    }
  }
}

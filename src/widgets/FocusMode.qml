import QtQuick 2.9;
import QtQuick.Window 2.0;
import QtQuick.Layouts 1.15;
import QtQuick.Controls 1.4;


// TODO: Allow extending time (+15 minutes)
// TODO: Allow resetting when timer is complete
// TODO: Use absolute current time
// TODO: play a bell when timer is done + flash clock for 10 seconds?
Column {
  id: focusMode
  anchors.fill: parent
  anchors.topMargin: 50

  property var text

  readonly property var duration: 5 * 1000

  property var current: 0
  readonly property bool isComplete: current >= duration

  function reset() {
    focusMode.current = 0
    canvas.requestPaint()
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
        focusMode.current = Math.min(focusMode.duration, focusMode.current + interval)
        canvas.requestPaint()
      }
    }

    function toggle() {
      timer.running = !timer.running
    }
  }

  Rectangle {
    id: focusTextWrap
    width: parent.width
    height: focusText.contentHeight + 40
    color: timer.running ? accentColor : primaryColor

    Text {
      id: focusText
      width: parent.width
      padding: 20
      text:  focusMode.text
      color: textColor
      font.family: titleFont.name
      font.pointSize: 22
      wrapMode: Text.WordWrap
      horizontalAlignment: Text.AlignHCenter
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
      const timeInMs = focusMode.current
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

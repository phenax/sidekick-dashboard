import QtQuick 2.9;
import QtQuick.Window 2.0;
import QtQuick.Layouts 1.15;
import QtQuick.Controls 1.4;


Column {
  id: focusMode
  anchors.fill: parent
  anchors.topMargin: 50

  property var text

  readonly property var startTime: Date.now()
  readonly property var duration: 3 * 1000

  property var current: 0
  property bool isComplete: current === 1

  Timer {
    interval: 100
    running: true
    repeat: true
    onTriggered: {
      if (!isComplete) {
        focusMode.current = Math.min(1, (Date.now() - focusMode.startTime) / focusMode.duration)
        canvas.requestPaint()
      }
    }
  }

  Text {
    id: focusText
    text: focusMode.text
    width: parent.width
    color: textColor
    font.family: contentFont.name
    font.pointSize: 24
    wrapMode: Text.WordWrap
    horizontalAlignment: Text.AlignHCenter
    verticalAlignment: Text.AlignVCenter
  }

  Canvas {
    id: canvas
    width: parent.width
    height: parent.height - focusText.height
    renderStrategy: Canvas.Threaded

    readonly property int radius: Math.min(width, height)/2 - 30 - 2*thickness
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

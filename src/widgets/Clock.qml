import QtQuick 2.9;
import Sidekick 1.0;

Column {
  anchors.fill: parent
  anchors.topMargin: 50
  anchors.bottomMargin: anchors.topMargin
  anchors.leftMargin: 50
  anchors.rightMargin: anchors.leftMargin
  spacing: 0

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

  Text {
    text: clockModel.time
    color: "white"
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
    color: "white"
    width: parent.width
    horizontalAlignment: Text.AlignHCenter
    font.pointSize: 22
    font.bold: true
    font.family: titleFont.name
  }
}

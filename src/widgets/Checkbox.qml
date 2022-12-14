import QtQuick 2.9;
import QtQuick.Controls 1.4;
import QtQuick.Controls.Styles 1.4;
import QtQuick.Layouts 1.15;

import Sidekick 1.0;

Rectangle {
  id: checkbox

  property bool checked
  property string text

  signal changed(bool checked)

  property var backgroundColor: primaryColor;
  property var highlightColor: accentColor;
  property var checkboxBorderColor: contentBackground;

  color: backgroundColor
  width: parent.width
  height: blockRow.height + 20

  MouseArea {
    enabled: true
    onClicked: checkbox.changed(!checked)
    anchors.fill: parent
  }

  Row {
    id: blockRow
    width: parent.width
    height: childrenRect.height
    x: 10
    y: 10
    spacing: 16

    Rectangle {
      id: checkRect
      width: 35
      height: 35
      color: backgroundColor
      border.width: 2
      border.color: checkboxBorderColor

      Rectangle {
        visible: checkbox.checked
        color: highlightColor
        anchors.margins: 1
        anchors.fill: parent
      }
    }

    Text {
      text: checkbox.text
      color: textColor
      font.pointSize: 20
      font.family: contentFont.name
      y: 5
      wrapMode: Text.WordWrap
      width: parent.width - checkRect.width
      verticalAlignment: Text.AlignVCenter
    }
  }
}

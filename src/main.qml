import QtQuick 2.9;
import QtQuick.Window 2.0;
// import QtQuick.Controls 1.2;
import QtQuick.Controls 2.15;
import QtWebEngine 1.8;
import QtQuick.Layouts 1.15;

Window {
  id: window
  title: "QuandaleDingle"
  visible: true
  width: 800
  height: 600

  Rectangle {
    id: statusBar
    color: "black"
    height: 18
    width: parent.width
    y: 200

    Text {
      text: "foobarity rules"
      verticalAlignment: Text.AlignVCenter
      height: parent.height
      color: "white"
    }

    Button {
      id: commandMenuBtn
      text: "Btn 1"
      onClicked: console.log("fuck")
      x: parent.width - width - 5
      y: 100
    }

    Button {
      id: closeWindowButton
      text: "Btn 2"
      onClicked: console.log("you")
      x: parent.width - width - 5
      // y: 100
      anchors.top: commandMenuBtn.bottom
    }
  }
}

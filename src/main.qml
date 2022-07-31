import QtQuick 2.9;
import QtQuick.Window 2.0;
import QtQuick.Layouts 1.15;

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

      Widget.TaskList { }
    }
  }
}

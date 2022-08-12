import QtQuick 2.9;
import Sidekick 1.0;

Item {
  anchors.fill: parent

  Canvas {
    anchors.fill: parent
    anchors.topMargin: 10
    renderStrategy: Canvas.Threaded

    onPaint: {
      const ctx = getContext('2d')

      const color = "#574b90"
      const speed = 0.0002

      function render(ctx, rotation) {
        const { width, height } = ctx.canvas;
        const midX = width / 2;
        const midY = height / 2;

        ctx.clearRect(0, 0, width, height);

        for (let n = 0; n < 465; n++) {
          const opacity = n % 2 === 0 ? 1 : 0.2

          ctx.save();
          ctx.beginPath();

          ctx.fillStyle = color;
          ctx.globalAlpha = opacity;
          const x = n * Math.cos(n + rotation);
          const y = n * Math.sin(n + rotation);
          const r = Math.min(70, n * 0.2 + 0.1) / 3;
          ctx.arc(x + midX, y + midY, r, 0, Math.PI * 2)
          ctx.fill();

          ctx.restore();
        }
      }

      let rotation = 0
      const run = () => {
        render(ctx, rotation)
        rotation += speed % 2*Math.PI
        requestAnimationFrame(run)
      }

      run()
    }
  }
}

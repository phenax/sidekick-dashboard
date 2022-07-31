import QtQuick 2.9;
import Sidekick 1.0;

Item {
  anchors.fill: parent

  Timer {
    interval: 500
    running: true;
    repeat: true
  }

  Canvas {
    anchors.fill: parent
    anchors.topMargin: 10
    renderStrategy: Canvas.Threaded

    onPaint: {
      const color = "#e95180"
      const draw = (ctx, fn) => {
        ctx.save();
        ctx.beginPath();
        fn(ctx);
        ctx.restore();
      };
      const circle = (ctx, x, y, r) => ctx.arc(x, y, r, 0, Math.PI * 2);

      const ctx = getContext("2d")

      function render(ctx, rotation) {
        const { width, height } = ctx.canvas;
        const midX = width / 2;
        const midY = height / 2;

        ctx.clearRect(0, 0, width, height);

        Array.from(Array(600), (_, i) => i).forEach(n => {
          const opacity = n % 2 === 0 ? 1 : 0.4 // ((rotation * 1000) % 1000) / 1000

          draw(ctx, () => {
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity;
            const x = n * Math.cos(n + rotation);
            const y = n * Math.sin(n + rotation);
            const r = Math.min(70, n * 0.2 + 0.1) / 3;
            circle(ctx, x + midX, y + midY, r);
            ctx.fill();
          });
        });
      }

      let rotation = 0
      const run = () => {
        render(ctx, rotation, opacity)
        rotation += 0.0004 % 2*Math.PI
        requestAnimationFrame(run)
      }

      run()
    }
  }
}

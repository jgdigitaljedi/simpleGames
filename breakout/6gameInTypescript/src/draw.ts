import { IDefaults } from "../models/defaults.model";
import { IState } from "../models/state.model";

export class Draw {
  constructor() {}

  drawScore(
    ctx: CanvasRenderingContext2D,
    state: IState,
    defaults: IDefaults
  ): void {
    ctx.beginPath();
    ctx.font = "16px Arial";
    ctx.fillStyle = defaults.scoreLivesColor;
    ctx.textAlign = "left";
    ctx.fillText("Score: " + state.score, 8, 20);
    ctx.fill();
  }

  drawLives(
    ctx: CanvasRenderingContext2D,
    state: IState,
    defaults: IDefaults,
    canvas: any
  ): void {
    ctx.beginPath();
    ctx.font = "16px Arial";
    ctx.fillStyle = defaults.scoreLivesColor;
    ctx.textAlign = "left";
    ctx.fillText("Lives: " + state.lives, canvas.width - 65, 20);
    ctx.fill();
  }

  drawPowerUp(
    ctx: CanvasRenderingContext2D,
    state: IState,
    defaults: IDefaults
  ): void {
    ctx.beginPath();
    ctx.arc(state.px, state.py, defaults.powerUpRadius, 0, Math.PI * 2);
    ctx.fillStyle = state.powerUpFalling.color;
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.powerUpFalling.symbol, state.px, state.py);
    ctx.closePath();
  }

  drawBall(ctx: CanvasRenderingContext2D, defaults: IDefaults, x, y): void {
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      defaults.ballRadius ? defaults.ballRadius : 0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = defaults.ballColor;
    ctx.fill();
    ctx.closePath();
  }

  drawPaddle(
    ctx: CanvasRenderingContext2D,
    state: IState,
    defaults: IDefaults,
    canvas: any
  ) {
    ctx.beginPath();
    ctx.rect(
      state.paddleX,
      canvas.height - defaults.paddleHeight,
      state.paddleWidth,
      defaults.paddleHeight
    );
    ctx.fillStyle = defaults.paddleColor;
    ctx.fill();
    ctx.closePath();
  }

  drawBricks(ctx: CanvasRenderingContext2D, defaults: IDefaults, bricks) {
    for (var c = 0; c < defaults.brickColumnCount; c++) {
      for (var r = 0; r < defaults.brickRowCount; r++) {
        if (bricks[c][r].show) {
          ctx.beginPath();
          ctx.rect(
            bricks[c][r].x,
            bricks[c][r].y,
            defaults.brickWidth ? defaults.brickWidth : 0,
            defaults.brickHeight
          );
          ctx.fillStyle = defaults.brickColorArray[r];
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }
}

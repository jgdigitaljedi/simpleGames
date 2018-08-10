import { IDefaults } from '../models/defaults.model';

export class Handler {
  constructor() {}

  // moves paddle when key pressed
  keydownHandler(e: KeyboardEvent): string {
    if (e.keyCode === 39) {
      return 'rightPressed';
    } else if (e.keyCode === 37) {
      return 'leftPressed';
    }
    return '';
  }

  // resets key pressed state to stop paddle movement on keyup
  keyupHandler(e: KeyboardEvent): string {
    if (e.keyCode === 39) {
      return 'rightPressed';
    } else if (e.keyCode === 37) {
      return 'leftPressed';
    }
    return '';
  }

  pauseGame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.beginPath();
    ctx.font = '36px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fill();
  }

  gameOver(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, defaults: IDefaults): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = defaults.scoreLivesColor;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Click Mouse to Restart', canvas.width / 2, canvas.height / 2 + 50);
  }
}

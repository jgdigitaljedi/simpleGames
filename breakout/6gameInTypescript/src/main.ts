import { Defaults } from "./defaults";
import { Handler } from "./handler";
import { IDefaults } from "../models/defaults.model";
import { IState } from "../models/state.model";
import { Stages } from "./stages";
import { Powerups } from "./powerups";
import { Draw } from "./draw";

/*********** BUGS *************
 * - ball doesn't reset position when changing stages
 * - ball changes direction sometimes when powerup collected
 */
export class Breakout {
  canvas: any = document.getElementById("breakout");
  ctx: CanvasRenderingContext2D;
  defaults: IDefaults;
  state: IState;
  x: number;
  y: number;
  bricks: any;
  powerups: any[];
  stages: any;
  gameInterval: any;
  private _handler: Handler;
  private _stages: Stages;
  private _powerups: Powerups;
  private _drawClass: Draw;
  constructor() {
    this.initializeGame();
  }

  initializeGame() {
    this._handler = new Handler();
    this._stages = new Stages();
    this._powerups = new Powerups();
    this._drawClass = new Draw();
    this._initVariables();
    document.addEventListener("keydown", this.keydown.bind(this));
    document.addEventListener("keyup", this.keyupHandler.bind(this));
    document.addEventListener("mousemove", this.mouseMoveHandler.bind(this));
    document.addEventListener("mouseup", this.mouseClickHandler.bind(this));
  }

  // moves paddle when key pressed
  keydown(e: KeyboardEvent): void {
    const which: string = this._handler.keydownHandler(e);
    if (which && which !== "") {
      this.state[which] = true;
    }
  }

  // resets key pressed state to stop paddle movement on keyup
  keyupHandler(e: KeyboardEvent): void {
    const which: string = this._handler.keyupHandler(e);
    if (which && which !== "") {
      this.state[which] = false;
    }
  }

  mouseMoveHandler(e) {
    var relativeX = e.clientX - this.canvas.offsetLeft;
    if (
      relativeX > this.state.paddleWidth / 2 &&
      relativeX < this.canvas.width - this.state.paddleWidth / 2
    ) {
      this.state.paddleX = relativeX - this.state.paddleWidth / 2;
    }
  }

  mouseClickHandler(e) {
    if (this.state.gameOver) {
      this._resetGame();
      this.state.gameOver = false;
    } else if (this.state.paused) {
      this._pauseHandler(false);
    } else {
      this._pauseHandler(true, true);
    }
  }

  private _resetGame() {
    document.location.reload();
  }

  private _powerUp() {
    this.state.powerUpCounter = 0;
    const pLen = this.powerups.length;
    const randPu = Math.floor(Math.random() * pLen);
    this.state.powerUpFalling = this.powerups[randPu];
    this.state.px = Math.floor(
      Math.random() * (this.canvas.width - this.defaults.powerUpRadius)
    );
    if (this.state.px < this.defaults.powerUpRadius)
      this.state.px = this.defaults.powerUpRadius;
  }

  private _powerUpActivate() {
    const action = this.state.powerUpFalling.activePower;
    const endAction = this.state.powerUpFalling.endPower;
    action();
    setTimeout(function() {
      endAction();
    }, this.defaults.powerUpDuration);
  }

  private _powerupCollision() {
    if (
      this.state.px + this.defaults.powerUpRadius >= this.state.paddleX &&
      this.state.px <= this.state.paddleX + this.state.paddleWidth &&
      this.state.py >= this.canvas.height - this.defaults.paddleHeight
    ) {
      this._powerUpActivate();
    }
  }

  private _pauseHandler(pause: boolean, showText?: boolean) {
    if (pause) {
      this.state.paused = true;
      if (showText) {
        this._handler.pauseGame(this.ctx, this.canvas);
      }
    } else {
      this.state.paused = false;
    }
  }

  private _gameOver() {
    clearInterval(this.gameInterval);
    this._handler.gameOver(this.ctx, this.canvas, this.defaults);
    this.state.gameOver = true;
  }

  private _collisionDetection(x, y) {
    for (let c = 0; c < this.defaults.brickColumnCount; c++) {
      for (let r = 0; r < this.defaults.brickRowCount; r++) {
        let b = this.bricks[c][r];
        if (b.show) {
          if (
            x + this.defaults.ballRadius >= b.x &&
            x - (this.defaults.ballRadius ? this.defaults.ballRadius : 0) <=
              b.x + this.defaults.brickWidth &&
            y >=
              b.y - (this.defaults.ballRadius ? this.defaults.ballRadius : 0) &&
            y <= b.y + this.defaults.brickHeight + this.defaults.ballRadius
          ) {
            if (!this.state.powerUpFalling) {
              this.state.powerUpCounter++;
            }
            if (this.state.powerUpCounter >= this.defaults.powerUpActivateCount)
              this._powerUp();
            if (y < b.y + this.defaults.brickHeight + 2) {
              // if collision occurs on side of brick
              this.state.dx = -this.state.dx;
            } else {
              // collision occurred on top or bottom
              this.state.dy = -this.state.dy;
            }
            b.show = false;
            this.state.score += 100;
            if (
              this.state.score ===
              this.defaults.brickRowCount * this.defaults.brickColumnCount * 100
            ) {
              this._pauseHandler(true, false);
              if (this.state.stage < Object.keys(this.stages).length) {
                this.state.stage++;
              } else {
                this.state.stage = 1;
              }
              this.ctx.beginPath();
              this.ctx.fillStyle = "white";
              this.ctx.textAlign = "center";
              // this.ctx.fontStyle = '36px Arial';
              this.ctx.fillText(
                "Click to go to next stage",
                this.canvas.width / 2,
                this.canvas.height / 2 - 20
              );
              this.ctx.fill();
              this.bricks = this.stages["stage" + this.state.stage]();
              x = this.canvas.width / 2;
              y = this.canvas.height - 30;
              this.state.dx = this.defaults.dx;
              this.state.dy = this.defaults.dy;
            }
          }
        }
      }
    }
  }

  private _handlePaddleHit() {
    // what percentage of x axis did ball hit paddle
    var deltaX = Math.abs(
      (this.x - this.state.paddleX) / this.state.paddleWidth
    );
    // if ball hit paddle off center then slightly change ball movement direction accordingly
    if (deltaX > 0.55) {
      this.state.dx += deltaX * 1.2;
    } else if (deltaX < 0.45) {
      this.state.dx -= deltaX * 1.2;
    }
    this.state.dy = -this.state.dy;
  }

  private _draw() {
    if (!this.state.paused && this.bricks.length) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.state.powerUpFalling) {
        this._drawClass.drawPowerUp(this.ctx, this.state, this.defaults);
        this._powerupCollision();
      }
      this._drawClass.drawBricks(this.ctx, this.defaults, this.bricks);
      this._drawClass.drawBall(this.ctx, this.defaults, this.x, this.y);
      this._drawClass.drawPaddle(
        this.ctx,
        this.state,
        this.defaults,
        this.canvas
      );
      this._collisionDetection(this.x, this.y);
      this._drawClass.drawScore(this.ctx, this.state, this.defaults);
      this._drawClass.drawLives(
        this.ctx,
        this.state,
        this.defaults,
        this.canvas
      );

      if (
        this.y + this.state.dy <
        (this.defaults.ballRadius ? this.defaults.ballRadius : 0)
      ) {
        this.state.dy = -this.state.dy;
      } else if (
        this.y + this.state.dy >
        this.canvas.height -
          (this.defaults.ballRadius ? this.defaults.ballRadius : 0) -
          this.defaults.paddleHeight +
          2
      ) {
        if (
          this.x > this.state.paddleX &&
          this.x < this.state.paddleX + this.state.paddleWidth
        ) {
          this._handlePaddleHit();
        } else {
          this.state.lives--;
          if (this.state.lives === 0) {
            // alert('GAME OVER!!');
            this._gameOver();
            // document.location.reload();
          } else {
            this.x = this.canvas.width / 2;
            this.y = this.canvas.height - 30;
            this.state.dx = this.defaults.dx;
            this.state.dy = this.defaults.dy;
            this.state.paddleX =
              (this.canvas.width - this.state.paddleWidth) / 2;
          }
        }
      }

      if (
        this.x + this.state.dx <
          (this.defaults.ballRadius ? this.defaults.ballRadius : 0) ||
        this.x + this.state.dx >
          this.canvas.width -
            (this.defaults.ballRadius ? this.defaults.ballRadius : 0)
      ) {
        this.state.dx = -this.state.dx;
      }

      if (
        this.state.rightPressed &&
        this.state.paddleX < this.canvas.width - this.state.paddleWidth
      ) {
        this.state.paddleX += this.defaults.paddleMovement;
      } else if (this.state.leftPressed && this.state.paddleX > 0) {
        this.state.paddleX -= this.defaults.paddleMovement;
      }

      this.x += this.state.dx;
      this.y += this.state.dy;
      if (this.state.powerUpFalling) {
        this.state.py += this.defaults.powerUpSpeed;
        if (this.state.py > this.canvas.height) {
          this.state.powerUpFalling = false;
          this.state.py = 5;
        }
      }
      // requestAnimationFrame(draw);
    }
  }

  private _initState() {
    this.state = {
      score: 0,
      lives: 3,
      rightPressed: false,
      leftPressed: false,
      paddleX:
        (this.canvas.width -
          (typeof this.defaults.paddleWidth === "number"
            ? this.defaults.paddleWidth
            : 0)) /
        2,
      dx: this.defaults.dx,
      dy: this.defaults.dy,
      stage: 1,
      paddleWidth: this.defaults.paddleWidth || 100,
      powerUpCounter: 0,
      powerUpFalling: null,
      px: 5,
      py: 5,
      paused: false
    };
  }

  private _initBallPosition() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 30;
  }

  private _initDefaults() {
    this.defaults = Defaults;
    this.defaults.brickWidth =
      (this.canvas.width -
        this.defaults.brickOffsetLeft * 2 -
        this.defaults.brickColumnCount * this.defaults.brickPadding) /
      this.defaults.brickColumnCount;
    this.defaults.paddleWidth = this.canvas.width / 8;
    this.defaults.ballRadius = this.canvas.width / 80;
  }

  private _initVariables() {
    this.ctx = this.canvas.getContext("2d");
    this._initDefaults();
    this._initState();
    this.powerups = this._powerups.getPowerUps(this.state, this.defaults);
    this.stages = this._stages.getStages(this.defaults);
    this._initBallPosition();

    this.bricks = this.stages["stage" + this.state.stage]();
    setTimeout(() => {
      this.gameInterval = setInterval(() => {
        this._draw();
      }, 1000 / this.defaults.framesPerSecond);
    }, 1000);
  }
}

import { Defaults } from "./defaults";
import { IDefaults } from "../models/defaults.model";
import { IState } from "../models/state.model";

// @TODO: get it working first, then refactor into several files. Doing it all at once is messy and overwhelming.
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
  constructor() {
    this.initializeGame();
  }

  initializeGame() {
    this._initVariables();
    document.addEventListener("keydown", this.keydownHandler.bind(this));
    document.addEventListener("keyup", this.keyupHandler.bind(this));
    document.addEventListener("mousemove", this.mouseMoveHandler.bind(this));
    document.addEventListener("mouseup", this.mouseClickHandler.bind(this));
  }

  // moves paddle when key pressed
  keydownHandler(e) {
    console.log("this.state in down", this.state);
    if (e.keyCode === 39) {
      this.state.rightPressed = true;
    } else if (e.keyCode === 37) {
      this.state.leftPressed = true;
    }
  }

  // resets key pressed state to stop paddle movement on keyup
  keyupHandler(e) {
    console.log("this.state in up", this.state);
    if (e.keyCode === 39) {
      this.state.rightPressed = false;
    } else if (e.keyCode === 37) {
      this.state.leftPressed = false;
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
      this._pauseHandler(false, false);
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

  private _pauseHandler(pause: boolean, showText: boolean) {
    if (pause) {
      this.state.paused = true;
      if (showText) {
        this.ctx.beginPath();
        this.ctx.font = "36px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          "PAUSED",
          this.canvas.width / 2,
          this.canvas.height / 2 - 20
        );
        this.ctx.fill();
      }
    } else {
      this.state.paused = false;
    }
  }

  private _gameOver() {
    clearInterval(this.gameInterval);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.defaults.scoreLivesColor;
    // this.ctx.fontStyle = '48px Arial';
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Game Over",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.fillText(
      "Click Mouse to Restart",
      this.canvas.width / 2,
      this.canvas.height / 2 + 50
    );
    this.state.gameOver = true;
  }

  private _collisionDetection(x, y) {
    for (var c = 0; c < this.defaults.brickColumnCount; c++) {
      for (var r = 0; r < this.defaults.brickRowCount; r++) {
        var b = this.bricks[c][r];
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

  private _drawScore() {
    this.ctx.beginPath();
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = this.defaults.scoreLivesColor;
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score: " + this.state.score, 8, 20);
    this.ctx.fill();
  }

  private _drawLives() {
    this.ctx.beginPath();
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = this.defaults.scoreLivesColor;
    this.ctx.textAlign = "left";
    this.ctx.fillText("Lives: " + this.state.lives, this.canvas.width - 65, 20);
    this.ctx.fill();
  }

  private _drawPowerUp() {
    this.ctx.beginPath();
    this.ctx.arc(
      this.state.px,
      this.state.py,
      this.defaults.powerUpRadius,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = this.state.powerUpFalling.color;
    this.ctx.fill();
    this.ctx.fillStyle = "white";
    // this.ctx.fontStyle = '10px Arial';
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      this.state.powerUpFalling.symbol,
      this.state.px,
      this.state.py
    );
    this.ctx.closePath();
  }

  private _drawBall() {
    this.ctx.beginPath();
    this.ctx.arc(
      this.x,
      this.y,
      this.defaults.ballRadius ? this.defaults.ballRadius : 0,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = this.defaults.ballColor;
    this.ctx.fill();
    this.ctx.closePath();
  }

  private _drawPaddle() {
    this.ctx.beginPath();
    this.ctx.rect(
      this.state.paddleX,
      this.canvas.height - this.defaults.paddleHeight,
      this.state.paddleWidth,
      this.defaults.paddleHeight
    );
    this.ctx.fillStyle = this.defaults.paddleColor;
    this.ctx.fill();
    this.ctx.closePath();
  }

  private _drawBricks() {
    for (var c = 0; c < this.defaults.brickColumnCount; c++) {
      for (var r = 0; r < this.defaults.brickRowCount; r++) {
        if (this.bricks[c][r].show) {
          this.ctx.beginPath();
          this.ctx.rect(
            this.bricks[c][r].x,
            this.bricks[c][r].y,
            this.defaults.brickWidth ? this.defaults.brickWidth : 0,
            this.defaults.brickHeight
          );
          this.ctx.fillStyle = this.defaults.brickColorArray[r];
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }

  private _draw() {
    if (!this.state.paused && this.bricks.length) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.state.powerUpFalling) {
        this._drawPowerUp();
        this._powerupCollision();
      }
      this._drawBricks();
      this._drawBall();
      this._drawPaddle();
      this._collisionDetection(this.x, this.y);
      this._drawScore();
      this._drawLives();

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

  private _initPowerups() {
    this.powerups = [
      {
        symbol: "\u25bc", // slow down
        color: "#D50000",
        activePower: () => {
          this.state.dy = 1;
          this.state.dx = 1;
        },
        endPower: () => {
          this.state.dy =
            this.state.dy < 0 ? -this.defaults.dy : this.defaults.dy;
          this.state.dx =
            this.state.dx < 0 ? -this.defaults.dx : this.defaults.dx;
        }
      },
      {
        symbol: "\u25b2", // speed up
        color: "#00C853",
        activePower: () => {
          this.state.dy = 5;
          this.state.dx = 5;
        },
        endPower: () => {
          this.state.dy =
            this.state.dy < 0 ? -this.defaults.dy : this.defaults.dy;
          this.state.dx =
            this.state.dx < 0 ? -this.defaults.dx : this.defaults.dx;
        }
      },
      {
        symbol: "\u2b0c", // large paddle
        color: "#FF6F00",
        activePower: () => {
          this.state.paddleWidth = this.defaults.paddleWidth * 1.25;
        },
        endPower: () => {
          this.state.paddleWidth = this.defaults.paddleWidth;
        }
      },
      {
        symbol: "S", // small paddle
        color: "#C51162",
        activePower: () => {
          this.state.paddleWidth = this.defaults.paddleWidth * 0.75;
        },
        endPower: () => {
          this.state.paddleWidth = this.defaults.paddleWidth;
        }
      }
    ];
  }

  private _initStages() {
    this.stages = {
      stage1: () => {
        var stage: any[] = [];
        this.defaults.brickRowCount = 6;
        for (var c = 0; c < this.defaults.brickColumnCount; c++) {
          stage[c] = [];
          for (var r = 0; r < this.defaults.brickRowCount; r++) {
            var brickX =
              c *
                ((this.defaults.brickWidth ? this.defaults.brickWidth : 0) +
                  this.defaults.brickPadding) +
              this.defaults.brickOffsetLeft;
            var brickY =
              r * (this.defaults.brickHeight + this.defaults.brickPadding) +
              this.defaults.brickOffsetTop;
            stage[c][r] = { x: brickX, y: brickY, show: true };
          }
        }
        return stage;
      },
      stage2: () => {
        var stage: any[] = [];
        this.defaults.brickRowCount = 8;
        for (var c = 0; c < this.defaults.brickColumnCount; c++) {
          stage[c] = [];
          for (var r = 0; r < this.defaults.brickRowCount; r++) {
            var brickX =
              c *
                ((this.defaults.brickWidth ? this.defaults.brickWidth : 0) +
                  this.defaults.brickPadding) +
              this.defaults.brickOffsetLeft;
            var brickY =
              r * (this.defaults.brickHeight + this.defaults.brickPadding) +
              this.defaults.brickOffsetTop;
            stage[c][r] = { x: brickX, y: brickY };
            if (c < r) {
              stage[c][r].show = false;
            } else {
              stage[c][r].show = true;
            }
          }
        }
        return stage;
      },
      stage3: () => {
        var stage: any[] = [];
        this.defaults.brickRowCount = 8;
        for (var c = 0; c < this.defaults.brickColumnCount; c++) {
          stage[c] = [];
          for (var r = 0; r < this.defaults.brickRowCount; r++) {
            var brickX =
              c *
                ((this.defaults.brickWidth ? this.defaults.brickWidth : 0) +
                  this.defaults.brickPadding) +
              this.defaults.brickOffsetLeft;
            var brickY =
              r * (this.defaults.brickHeight + this.defaults.brickPadding) +
              this.defaults.brickOffsetTop;
            var showBrick;
            if (r % 2 === 0) {
              showBrick = c % 2 === 0;
            } else {
              showBrick = c % 2 === 1;
            }
            stage[c][r] = { x: brickX, y: brickY, show: showBrick };
          }
        }
        return stage;
      }
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
    this._initPowerups();
    this._initStages();
    this._initBallPosition();

    this.bricks = this.stages["stage" + this.state.stage]();
    setTimeout(() => {
      this.gameInterval = setInterval(() => {
        this._draw();
      }, 1000 / this.defaults.framesPerSecond);
    }, 1000);
  }
}

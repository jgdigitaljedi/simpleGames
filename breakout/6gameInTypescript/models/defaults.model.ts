export interface IDefaults {
  ballColor: string; // color of ball
  ballRadius?: number;
  brickColorArray: string[];
  brickColumnCount: number; // amount of columns of bricks
  brickHeight: number; // height of bricks
  brickOffsetLeft: number; // pixels from left to starting creating bricks
  brickOffsetTop: number; // pixels from top to start creating bricks
  brickPadding: number; // space between bricks
  brickRowCount: number; // amount of rows of bricks
  brickWidth?: number;
  dx: number; // starting x direction for ball
  dy: number; // starting y direction for ball
  framesPerSecond: number; // frames per second
  gameOver: boolean; // tracks game over state
  paddleColor: string; // color of paddle
  paddleHeight: number; // paddle height
  paddleMovement: number; // pixels paddle can move each frame
  paddleWidth?: number;
  paused: boolean; // tracks pause state
  powerUpActivateCount: number; // number of bricks hit before powerup falls
  powerUpDuration: number; // duration for which powerup lasts
  powerUpRadius: number; // radius of the powerup ball
  powerUpSpeed: number; // number of pixels powerup moves vertically per frame
  scoreLivesColor: string; // color of score and lives text
}

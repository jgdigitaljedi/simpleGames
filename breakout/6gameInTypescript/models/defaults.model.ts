export interface IDefaults {
  dx: number; // starting x direction for ball
  dy: number; // starting y direction for ball
  framesPerSecond: number; // frames per second
  paddleHeight: number; // paddle height
  brickRowCount: number; // amount of rows of bricks
  brickColumnCount: number; // amount of columns of bricks
  brickHeight: number; // height of bricks
  brickPadding: number; // space between bricks
  brickOffsetTop: number; // pixels from top to start creating bricks
  brickOffsetLeft: number; // pixels from left to starting creating bricks
  paddleMovement: number; // pixels paddle can move each frame
  scoreLivesColor: string; // color of score and lives text
  ballColor: string; // color of ball
  paddleColor: string; // color of paddle
  brickColorArray: string[];
  gameOver: boolean; // tracks game over state
  paused: boolean; // tracks pause state
  powerUpSpeed: number; // number of pixels powerup moves vertically per frame
  powerUpActivateCount: number; // number of bricks hit before powerup falls
  powerUpRadius: number; // radius of the powerup ball
  powerUpDuration: number; // duration for which powerup lasts
  paddleWidth?: number;
}

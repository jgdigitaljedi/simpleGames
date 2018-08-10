export const Defaults = {
  dx: 3, // starting x direction for ball
  dy: -3, // starting y direction for ball
  framesPerSecond: 75, // frames per second
  paddleHeight: 10, // paddle height
  brickRowCount: 6, // amount of rows of bricks
  brickColumnCount: 10, // amount of columns of bricks
  brickHeight: 20, // height of bricks
  brickPadding: 2, // space between bricks
  brickOffsetTop: 30, // pixels from top to start creating bricks
  brickOffsetLeft: 5, // pixels from left to starting creating bricks
  paddleMovement: 7, // pixels paddle can move each frame
  scoreLivesColor: "#FFC107", // color of score and lives text
  ballColor: "#2196F3", // color of ball
  paddleColor: "#9E9E9E", // color of paddle
  brickColorArray: [
    // array of colors for bricks
    "#F44336",
    "#9C27B0",
    "#3F51B5",
    "#03A9F4",
    "#009688",
    "#8BC34A",
    "#FFEB3B",
    "#FF9800",
    "#795548"
  ],
  gameOver: false, // tracks game over state
  paused: false, // tracks pause state
  powerUpSpeed: 2, // number of pixels powerup moves vertically per frame
  powerUpActivateCount: 20, // number of bricks hit before powerup falls
  powerUpRadius: 8, // radius of the powerup ball
  powerUpDuration: 20000 // duration for which powerup lasts
};

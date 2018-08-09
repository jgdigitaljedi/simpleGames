export interface IState {
  score: number; // score
  lives: number; // lives
  rightPressed: boolean; // right arrow being pressed
  leftPressed: boolean; // left arrow being pressed
  paddleX: number; // horizontol paddle position
  dx: number; // horizontal ball speed
  dy: number; // vertical ball speed
  stage: number; // stage
  paddleWidth: number; // width of paddle
  powerUpCounter: number; // counts bricks hit to know when to drop powerup
  powerUpFalling: any; // tracks whether a powerup is falling
  px: number; // powerup x position
  py: number;
  paused: boolean;
  gameOver?: boolean;
}

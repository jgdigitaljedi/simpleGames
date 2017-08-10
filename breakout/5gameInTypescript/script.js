(function () {
    /*********** BUGS *************
     * - ball doesn't reset position when changing stages
     * - ball changes direction sometimes when powerup collected
     */

    // create main canvas and get 2d context
    const canvas = document.getElementById('breakout');
    const ctx = canvas.getContext('2d');

    // pull in default values and assign to variable
    var defaults = window.defaults;

    // setting last default values that require others to calculate
    defaults.brickWidth = (canvas.width - (defaults.brickOffsetLeft*2) - (defaults.brickColumnCount * defaults.brickPadding))/defaults.brickColumnCount;
    defaults.paddleWidth = canvas.width / 8;
    defaults.ballRadius = canvas.width / 80;

    // sets starting game state
    var state = {
        score: 0,                                           // score
        lives: 3,                                           // lives
        rightPressed: false,                                // right arrow being pressed
        leftPressed: false,                                 // left arrow being pressed
        paddleX: (canvas.width - defaults.paddleWidth)/2,   // horizontol paddle position
        dx: defaults.dx,                                    // horizontal ball speed
        dy: defaults.dy,                                    // vertical ball speed
        stage: 1,                                           // stage
        paddleWidth: defaults.paddleWidth,                  // width of paddle
        powerUpCounter: 0,                                  // counts bricks hit to know when to drop powerup
        powerUpFalling: false,                              // tracks whether a powerup is falling
        px: 5,                                              // powerup x position
        py: 5                                               // powerup y position
    };

    // powerup definitions
    var powerUps = [
        {
            symbol: '\u25bc', // slow down
            color: '#D50000',
            activePower: function() {
                state.dy = 1;
                state.dx = 1;
            },
            endPower: function() {
                state.dy = defaults.dy;
                state.dx = defaults.dx;
            }
        },
        {
            symbol: '\u25b2', // speed up
            color: '#00C853',
            activePower: function() {
                state.dy = 5;
                state.dx = 5;
            },
            endPower: function() {
                state.dy = defaults.dy;
                state.dx = 5;
            }
        },
        {
            symbol: '\u2b0c', // large paddle
            color: '#FF6F00',
            activePower: function() {
                state.paddleWidth = defaults.paddleWidth * 1.25;
            },
            endPower: function() {
                state.paddleWidth = defaults.paddleWidth;
            }
        },
        {
            symbol: 'S', // small paddle
            color: '#C51162',
            activePower: function() {
                state.paddleWidth = defaults.paddleWidth * 0.75;
            },
            endPower: function() {
                state.paddleWidth = defaults.paddleWidth;
            }
        },
    ];

    // starting ball position
    var x = canvas.width / 2;
    var y = canvas.height - 30;

    // starting bricks layout
    var bricks = window.stages['stage' + state.stage]();

    // adding arrow key event listeners for movement
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);

    // moves paddle when key pressed
    function keydownHandler(e) {
        if (e.keyCode === 39) {
            state.rightPressed = true;
        } else if (e.keyCode === 37) {
            state.leftPressed = true;
        }
    }

    // resets key pressed state to stop paddle movement on keyup
    function keyupHandler(e) {
        if (e.keyCode === 39) {
            state.rightPressed = false;
        } else if (e.keyCode === 37) {
            state.leftPressed = false;
        }
    }

    // draws score
    function drawScore() {
        ctx.beginPath();
        ctx.font = '16px Arial';
        ctx.fillStyle = defaults.scoreLivesColor;
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + state.score, 8, 20);
        ctx.fill();
    }

    // draws lives
    function drawLives() {
        ctx.beginPath();
        ctx.font = '16px Arial';
        ctx.fillStyle = defaults.scoreLivesColor;
        ctx.textAlign = 'left';
        ctx.fillText('Lives: ' + state.lives, canvas.width - 65, 20);
        ctx.fill();
    }

    // completely resets game state
    function resetGame() {
        document.location.reload();
    }

    // draws powerups
    function drawPowerUp() {
        ctx.beginPath();
        ctx.arc(state.px, state.py, defaults.powerUpRadius, 0, Math.PI*2);
        ctx.fillStyle = state.powerUpFalling.color;
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fontStyle = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.powerUpFalling.symbol, state.px, state.py);
        ctx.closePath();
    }

    // ramdomly selects power and x position to fall from and sets state
    function powerUp() {
        state.powerUpCounter = 0;
        const pLen = powerUps.length;
        const randPu = Math.floor(Math.random() * pLen);
        state.powerUpFalling = powerUps[randPu];
        state.px = Math.floor(Math.random() * (canvas.width - defaults.powerUpRadius));
        if (state.px < defaults.powerUpRadius) state.px = defaults.powerUpRadius;
    }

    // handles pause state
    function pauseHandler(pause, showText) {
        if (pause) {
            state.paused = true;
            if (showText) {
                ctx.beginPath();
                ctx.font = '36px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', canvas.width/2, canvas.height/2-20);
                ctx.fill();
            }
        } else {
            state.paused = false;
        }
    }

    // handles game over state
    function gameOver() {
        clearInterval(gameInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = defaults.scoreLivesColor;
        ctx.fontStyle = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width/2, canvas.height/2);
        ctx.fillText('Click Mouse to Restart', canvas.width/2, canvas.height/2 + 50);
        state.gameOver = true;
    }

    // starts and stops powerup
    function powerUpActivate() {
        var action = state.powerUpFalling.activePower;
        var endAction = state.powerUpFalling.endPower;
        action();
        setTimeout(function () {
            endAction();
        }, defaults.powerUpDuration)
    }

    // detects when powerup collected and triggers it
    function powerupCollision() {
        if (state.px + defaults.powerUpRadius >= state.paddleX &&
            state.px <= state.paddleX + state.paddleWidth &&
            state.py >= canvas.height - defaults.paddleHeight) {
                powerUpActivate();
        }
    }

    // detects when ball hits bricks, handles ball direction change, and detects when all bricks are gone and handles stage change
    function collisionDetection(x, y) {
        for (var c = 0; c < defaults.brickColumnCount; c++) {
            for (var r = 0; r < defaults.brickRowCount; r++) {
                var b = bricks[c][r];
                if (b.show) {
                    if ((x + defaults.ballRadius) >= b.x
                        && x - defaults.ballRadius <= b.x+defaults.brickWidth
                        && y >= (b.y - defaults.ballRadius)
                        && y <= b.y+defaults.brickHeight+defaults.ballRadius) {
                        if (!state.powerUpFalling) {
                            state.powerUpCounter++;
                        }
                        if (state.powerUpCounter >= defaults.powerUpActivateCount) powerUp();
                        if (y < b.y + defaults.brickHeight + 2) { // if collision occurs on side of brick
                            state.dx = -state.dx;
                        } else { // collision occurred on top or bottom
                            state.dy = -state.dy;
                        }
                        b.show = false;
                        state.score += 100;
                        if (state.score === defaults.brickRowCount*defaults.brickColumnCount*100) {
                            pauseHandler(true, false);
                            if (state.stage < Object.keys(window.stages).length) {
                                state.stage++;
                            } else {
                                state.stage = 1;
                            }
                            ctx.beginPath();
                            ctx.fillStyle = 'white';
                            ctx.textAlign = 'center';
                            ctx.fontStyle = '36px Arial';
                            ctx.fillText('Click to go to next stage', canvas.width/2, canvas.height/2 - 20);
                            ctx.fill();
                            bricks = window.stages['stage' + state.stage]();
                            x = canvas.width/2;
                            y = canvas.height - 30;
                            state.dx = defaults.dx;
                            state.dy = defaults.dy;
                        }
                    }
                }
            }
        }
    }

    // draws the ball
    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, defaults.ballRadius, 0, Math.PI*2);
        ctx.fillStyle = defaults.ballColor;
        ctx.fill();
        ctx.closePath();
    }

    // draws the paddle
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(state.paddleX, canvas.height - defaults.paddleHeight, state.paddleWidth, defaults.paddleHeight);
        ctx.fillStyle = defaults.paddleColor;
        ctx.fill();
        ctx.closePath();
    }

    // draws the bricks
    function drawBricks() {
        for (var c = 0; c < defaults.brickColumnCount; c++) {
            for (var r = 0; r < defaults.brickRowCount; r++) {
                if (bricks[c][r].show) {
                    ctx.beginPath();
                    ctx.rect(bricks[c][r].x, bricks[c][r].y, defaults.brickWidth, defaults.brickHeight);
                    ctx.fillStyle = defaults.brickColorArray[r];
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    // logic to change ball direction depending on where it hits paddle
    function handlePaddleHit() {

        // what percentage of x axis did ball hit paddle
        var deltaX = Math.abs((x - state.paddleX) / state.paddleWidth);

        // if ball hit paddle off center then slightly change ball movement direction accordingly
        if (deltaX > 0.55) {
            state.dx += (deltaX * 1.2);
        } else if (deltaX < 0.45) {
            state.dx -= (deltaX * 1.2);
        }
        state.dy = -state.dy;
    }

    // main draw function that triggers other draw functions and handles some game logic
    function draw() {
        if (!state.paused && bricks.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (state.powerUpFalling) {
                drawPowerUp();
                powerupCollision();
            }
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection(x, y);
            drawScore();
            drawLives();

            if (y + state.dy < defaults.ballRadius) {
                state.dy = -state.dy;
            } else if (y + state.dy > canvas.height - defaults.ballRadius - defaults.paddleHeight + 2) {
                if (x > state.paddleX && (x < state.paddleX + state.paddleWidth)) {
                    handlePaddleHit();
                } else {
                    state.lives--;
                    if (state.lives === 0) {
                        // alert('GAME OVER!!');
                        gameOver();
                        // document.location.reload();
                    } else {
                        x = canvas.width/2;
                        y = canvas.height - 30;
                        state.dx = defaults.dx;
                        state.dy =defaults.dy;
                        state.paddleX = (canvas.width - state.paddleWidth)/2;
                    }
                }
            }

            if (x + state.dx < defaults.ballRadius || x + state.dx > canvas.width - defaults.ballRadius) {
                state.dx = -state.dx;
            }

            if (state.rightPressed && state.paddleX < canvas.width - state.paddleWidth) {
                state.paddleX += defaults.paddleMovement;
            } else if (state.leftPressed && state.paddleX > 0) {
                state.paddleX -= defaults.paddleMovement;
            }

            x += state.dx;
            y += state.dy;
            if (state.powerUpFalling) {
                state.py += defaults.powerUpSpeed;
                if (state.py > canvas.height) {
                    state.powerUpFalling = false;
                    state.py = 5;
                }
            }
            // requestAnimationFrame(draw);
        }
    }

    // handles mouse movements within canvas area to use mouse instead of arrows
    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > state.paddleWidth/2 && relativeX < canvas.width - state.paddleWidth/2) {
            state.paddleX = relativeX - state.paddleWidth/2;
        }
    }

    // handles mouse click to pause, unpause, or reset game state
    function mouseClickHandler(e) {
        if (state.gameOver) {
            resetGame();
            state.gameOver = false;
        } else if (state.paused) {
            pauseHandler(false)
        } else {
            pauseHandler(true, true);
        }
    }

    // event listeners to bind mouse events
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseClickHandler);

    // main interval to start game
    var gameInterval = setInterval(draw, (1000/defaults.framesPerSecond));
})();

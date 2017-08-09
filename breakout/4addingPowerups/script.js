(function () {
    const canvas = document.getElementById('breakout');
    const ctx = canvas.getContext('2d');

    var defaults = window.defaults;

    defaults.brickWidth = (canvas.width - (defaults.brickOffsetLeft*2) - (defaults.brickColumnCount * defaults.brickPadding))/defaults.brickColumnCount;
    defaults.paddleWidth = canvas.width / 8;
    defaults.ballRadius = canvas.width / 80;

    var state = {
        score: 0,
        lives: 3,
        rightPressed: false,
        leftPressed: false,
        paddleX: (canvas.width - defaults.paddleWidth)/2,
        dx: defaults.dy,
        dy: defaults.dy,
        stage: 1,
        paddleWidth: defaults.paddleWidth,
        powerUpCounter: 0,
        powerUpFalling: false,
        px: 5,
        py: 5
    };

    var powerUps = [
        {
            symbol: '\u25bc', // slow down
            color: '#D50000',
            activePower: function() {
                state.dy = 1;
            },
            endPower: function() {
                state.dy = defaults.dy;
            }
        },
        {
            symbol: '\u25b2', // speed up
            color: '#00C853',
            activePower: function() {
                state.dy = 5;
            },
            endPower: function() {
                state.dy = defaults.dy;
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

    var x = canvas.width / 2;
    var y = canvas.height - 30;

    var bricks = window.stages['stage' + state.stage]();
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);

    function keydownHandler(e) {
        if (e.keyCode === 39) {
            state.rightPressed = true;
        } else if (e.keyCode === 37) {
            state.leftPressed = true;
        }
    }

    function keyupHandler(e) {
        if (e.keyCode === 39) {
            state.rightPressed = false;
        } else if (e.keyCode === 37) {
            state.leftPressed = false;
        }
    }

    function drawScore() {
        ctx.beginPath();
        ctx.font = '16px Arial';
        ctx.fillStyle = defaults.scoreLivesColor;
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + state.score, 8, 20);
        ctx.fill();
    }

    function drawLives() {
        ctx.beginPath();
        ctx.font = '16px Arial';
        ctx.fillStyle = defaults.scoreLivesColor;
        ctx.textAlign = 'left';
        ctx.fillText('Lives: ' + state.lives, canvas.width - 65, 20);
        ctx.fill();
    }

    function resetGame() {
        document.location.reload();
    }

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

    function powerUp() {
        state.powerUpCounter = 0;
        const pLen = powerUps.length;
        const randPu = Math.floor(Math.random() * pLen);
        state.powerUpFalling = powerUps[randPu];
        state.px = Math.floor(Math.random() * (canvas.width - defaults.powerUpRadius));
        if (state.px < defaults.powerUpRadius) state.px = defaults.powerUpRadius;
    }

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

    function powerUpActivate() {
        var action = state.powerUpFalling.activePower;
        var endAction = state.powerUpFalling.endPower;
        action();
        setTimeout(function () {
            endAction();
        }, defaults.powerUpDuration)
    }

    function powerupCollision() {
        if (state.px + defaults.powerUpRadius >= state.paddleX &&
            state.px <= state.paddleX + state.paddleWidth &&
            state.py >= canvas.height - defaults.paddleHeight) {
                powerUpActivate();
        }
    }

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
                            var x = canvas.width/2;
                            var y = canvas.height - 30;
                            state.dx = defaults.dx;
                            state.dy = defaults.dy;
                        }
                    }
                }
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, defaults.ballRadius, 0, Math.PI*2);
        ctx.fillStyle = defaults.ballColor;
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(state.paddleX, canvas.height - defaults.paddleHeight, state.paddleWidth, defaults.paddleHeight);
        ctx.fillStyle = defaults.paddleColor;
        ctx.fill();
        ctx.closePath();
    }

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

    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > state.paddleWidth/2 && relativeX < canvas.width - state.paddleWidth/2) {
            state.paddleX = relativeX - state.paddleWidth/2;
        }
    }

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

    document.addEventListener('mousemove', mouseMoveHandler);

    document.addEventListener('mouseup', mouseClickHandler);

    var gameInterval = setInterval(draw, (1000/defaults.framesPerSecond));
})();

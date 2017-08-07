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
        dy: defaults.dy
    };

    var x = canvas.width/2;
    var y = canvas.height - 30;

    var bricks = window.stages.stage1();
    console.log('bricks', bricks);
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
        ctx.font = '16px Arial';
        ctx.fillStyle = defaults.scoreLivesColor;
        ctx.fillText('Score: ' + state.score, 8, 20);
    }

    function drawLives() {
        ctx.font = '16px Arial';
        ctx.fillStyle = defaults.scoreLivesColor;
        ctx.fillText('Lives: ' + state.lives, canvas.width - 65, 20);
    }

    function resetGame() {
        document.location.reload();

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

    function collisionDetection() {
        for (var c = 0; c < defaults.brickColumnCount; c++) {
            for (var r = 0; r < defaults.brickRowCount; r++) {
                var b = bricks[c][r];
                if (b.show) {
                    if ((x + defaults.ballRadius) > b.x
                        && x - defaults.ballRadius < b.x+defaults.brickWidth
                        && y > (b.y - defaults.ballRadius)
                        && y < b.y+defaults.brickHeight+defaults.ballRadius) {
                        if (y < b.y + defaults.brickHeight + 2) { // if collision occurs on side of brick
                            state.dx = -state.dx;
                        } else { // collision occurred on top or bottom
                            state.dy = -state.dy;
                        }
                        b.show = false;
                        state.score += 100;
                        if (state.score === defaults.brickRowCount*defaults.brickColumnCount*100) {
                            // alert('YOU WIN!!');
                            pause();
                            document.location.reload();
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
        ctx.rect(state.paddleX, canvas.height - defaults.paddleHeight, defaults.paddleWidth, defaults.paddleHeight);
        ctx.fillStyle = defaults.paddleColor;
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (var c = 0; c < defaults.brickColumnCount; c++) {
            for (var r = 0; r < defaults.brickRowCount; r++) {
                if (bricks[c][r].show) {
                    // var brickX = (c*(defaults.brickWidth + defaults.brickPadding)) + defaults.brickOffsetLeft;
                    // var brickY = (r*(defaults.brickHeight + defaults.brickPadding)) + defaults.brickOffsetTop;
                    // bricks[c][r].x = brickX;
                    // bricks[c][r].y = brickY;
                    // ctx.beginPath();
                    // ctx.rect(brickX, brickY, defaults.brickWidth, defaults.brickHeight);
                    console.log('this brick', bricks[c][r]);
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
        var deltaX = Math.abs((x - state.paddleX) / defaults.paddleWidth);

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
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();
            drawScore();
            drawLives();

            if (y + state.dy < defaults.ballRadius) {
                state.dy = -state.dy;
            } else if (y + state.dy > canvas.height - defaults.ballRadius - defaults.paddleHeight + 2) {
                if (x > state.paddleX && (x < state.paddleX + defaults.paddleWidth)) {
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
                        state.paddleX = (canvas.width - defaults.paddleWidth)/2;
                    }
                }
            }

            if (x + state.dx < defaults.ballRadius || x + state.dx > canvas.width - defaults.ballRadius) {
                state.dx = -state.dx;
            }

            if (state.rightPressed && state.paddleX < canvas.width - defaults.paddleWidth) {
                state.paddleX += defaults.paddleMovement;
            } else if (state.leftPressed && state.paddleX > 0) {
                state.paddleX -= defaults.paddleMovement;
            }

            x += state.dx;
            y += state.dy;
            // requestAnimationFrame(draw);
        }
    }

    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > defaults.paddleWidth/2 && relativeX < canvas.width - defaults.paddleWidth/2) {
            state.paddleX = relativeX - defaults.paddleWidth/2;
        }
    }

    function mouseClickHandler(e) {
        if (state.gameOver) {
            resetGame();
            state.gameOver = false;
        } else if (state.paused) {
            state.paused = false;
        } else {
            state.paused = true;
        }
    }

    document.addEventListener('mousemove', mouseMoveHandler);

    document.addEventListener('mouseup', mouseClickHandler);

    var gameInterval = setInterval(draw, (1000/defaults.framesPerSecond));
})();

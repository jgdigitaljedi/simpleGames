(function () {
    const canvas = document.getElementById('breakout');
    const ctx = canvas.getContext('2d');

    var defaults = {
        dx: 2,
        dy: -2,
        ballRadius: 10,
        paddleHeight: 10,
        paddleWidth: 75,
        brickRowCount: 3,
        brickColumnCount: 5,
        brickWidth: 75,
        brickHeight: 20,
        brickPadding: 10,
        brickOffsetTop: 30,
        brickOffsetLeft: 30,
        paddleMovement: 7,
        scoreLivesColor: '#FFC107'
    };

    var state = {
        score: 0,
        lives: 3,
        rightPressed: false,
        leftPressed: false,
        paddleX: (canvas.width - defaults.paddleWidth)/2
    };

    var x = canvas.width/2;
    var y = canvas.height - 30;

    var bricks = [];
    for (var c = 0; c < defaults.brickColumnCount; c++) {
        bricks[c] = [];
        for (var r = 0; r < defaults.brickRowCount; r++) {
            bricks[c][r] = {x: 0, y: 0, show: true};
        }
    }

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

    function collisionDetection() {
        for (var c = 0; c < defaults.brickColumnCount; c++) {
            for (var r = 0; r < defaults.brickRowCount; r++) {
                var b = bricks[c][r];
                if (b.show) {
                    if (x > b.x && x < b.x+defaults.brickWidth && y > b.y && y < b.y+defaults.brickHeight) {
                        defaults.dy = -defaults.dy;
                        b.show = false;
                        state.score += 100;
                        if (state.score === defaults.brickRowCount*defaults.brickColumnCount*100) {
                            alert('YOU WIN!!');
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
        ctx.fillStyle = '#2196F3';
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(state.paddleX, canvas.height - defaults.paddleHeight, defaults.paddleWidth, defaults.paddleHeight);
        ctx.fillStyle = '#FF5722';
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (var c = 0; c < defaults.brickColumnCount; c++) {
            for (var r = 0; r < defaults.brickRowCount; r++) {
                if (bricks[c][r].show) {
                    var brickX = (c*(defaults.brickWidth + defaults.brickPadding)) + defaults.brickOffsetLeft;
                    var brickY = (r*(defaults.brickHeight + defaults.brickPadding)) + defaults.brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, defaults.brickWidth, defaults.brickHeight);
                    ctx.fillStyle = '#009688';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();
        drawScore();
        drawLives();

        if (y + defaults.dy < defaults.ballRadius) {
            defaults.dy = -defaults.dy;
        } else if (y + defaults.dy > canvas.height - defaults.ballRadius) {
            if (x > state.paddleX && (x < state.paddleX + defaults.paddleWidth)) {
                defaults.dy = -defaults.dy;
            } else {
                state.lives--;
                if (state.lives === 0) {
                    alert('GAME OVER!!');
                    document.location.reload();
                } else {
                    x = canvas.width/2;
                    y = canvas.height - 30;
                    defaults.dx = 2;
                    defaults.dy = 2;
                    state.paddleX = (canvas.width - defaults.paddleWidth)/2;
                }
            }
        }

        if (x + defaults.dx < defaults.ballRadius || x + defaults.dx > canvas.width - defaults.ballRadius) {
            defaults.dx = -defaults.dx;
        }

        if (state.rightPressed && state.paddleX < canvas.width - defaults.paddleWidth) {
            state.paddleX += defaults.paddleMovement;
        } else if (state.leftPressed && state.paddleX > 0) {
            state.paddleX -= defaults.paddleMovement;
        }

        x += defaults.dx;
        y += defaults.dy;
        requestAnimationFrame(draw);
    }

    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > defaults.paddleWidth/2 && relativeX < canvas.width - defaults.paddleWidth/2) {
            state.paddleX = relativeX - defaults.paddleWidth/2;
        }
    }

    document.addEventListener('mousemove', mouseMoveHandler);

    draw();
})();

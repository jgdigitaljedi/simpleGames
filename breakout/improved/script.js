(function () {
    const canvas = document.getElementById('breakout');
    const ctx = canvas.getContext('2d');

    var defaults = {
        dx: 2,
        dy: -2,
        framesPerSecond: 60,
        paddleHeight: 10,
        brickRowCount: 6,
        brickColumnCount: 10,
        brickHeight: 20,
        brickPadding: 2,
        brickOffsetTop: 30,
        brickOffsetLeft: 2,
        paddleMovement: 7,
        scoreLivesColor: '#FFC107',
        ballColor: '#2196F3',
        paddleColor: '#FF5722',
        brickColorArray: [
            '#F44336',
            '#9C27B0',
            '#3F51B5',
            '#03A9F4',
            '#009688',
            '#8BC34A',
            '#FFEB3B'
        ]
    };

    defaults.brickWidth = (canvas.width - (defaults.brickOffsetLeft*2) - (defaults.brickColumnCount * defaults.brickPadding))/defaults.brickColumnCount;
    defaults.paddleWidth = canvas.width / 8;
    defaults.ballRadius = canvas.width / 80;

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
                    if ((x + defaults.ballRadius) > b.x
                        && x - defaults.ballRadius < b.x+defaults.brickWidth
                        && y > (b.y - defaults.ballRadius)
                        && y < b.y+defaults.brickHeight+defaults.ballRadius) {
                        if (y < b.y + defaults.brickHeight + 2) { // if collision occurs on side of brick
                            defaults.dx = -defaults.dx;
                        } else { // collision occurred on top or bottom
                            defaults.dy = -defaults.dy;
                        }
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
                    var brickX = (c*(defaults.brickWidth + defaults.brickPadding)) + defaults.brickOffsetLeft;
                    var brickY = (r*(defaults.brickHeight + defaults.brickPadding)) + defaults.brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, defaults.brickWidth, defaults.brickHeight);
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
            defaults.dx += (deltaX * 1.2);
        } else if (deltaX < 0.45) {
            defaults.dx -= (deltaX * 1.2);
        }
        defaults.dy = -defaults.dy;
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
        } else if (y + defaults.dy > canvas.height - defaults.ballRadius - defaults.paddleHeight + 2) {
            if (x > state.paddleX && (x < state.paddleX + defaults.paddleWidth)) {
                handlePaddleHit();
            } else {
                state.lives--;
                if (state.lives === 0) {
                    alert('GAME OVER!!');
                    document.location.reload();
                } else {
                    x = canvas.width/2;
                    y = canvas.height - 30;
                    defaults.dx = 2;
                    defaults.dy = -2;
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
        // requestAnimationFrame(draw); // without using timeout, this works but speed not adjustable
    }

    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > defaults.paddleWidth/2 && relativeX < canvas.width - defaults.paddleWidth/2) {
            state.paddleX = relativeX - defaults.paddleWidth/2;
        }
    }

    document.addEventListener('mousemove', mouseMoveHandler);

    setInterval(draw, (1000/defaults.framesPerSecond));
})();

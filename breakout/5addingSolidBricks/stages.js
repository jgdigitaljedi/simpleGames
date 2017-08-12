(function() {
    window.stages = {
        stage1: function () {
            var stage = {
                bricks: [],
                blocks: [],
                brickCount: 0
            };
            window.defaults.brickRowCount = 6;
            for (var c = 0; c < defaults.brickColumnCount; c++) {
                stage.bricks[c] = [];
                stage.blocks[c] = [];
                for (var r = 0; r < defaults.brickRowCount; r++) {
                    var brickX = (c*(defaults.brickWidth + defaults.brickPadding)) + defaults.brickOffsetLeft;
                    var brickY = (r*(defaults.brickHeight + defaults.brickPadding)) + defaults.brickOffsetTop;
                    if (c === 0 || c === (defaults.brickColumnCount - 1) || r === 0) {
                        var width;
                        if (r === 0) {
                            width = defaults.brickWidth;
                            if (c != 0 && c != defaults.brickColumnCount - 1) stage.bricks[c][r] = {x: brickX, y: brickY, show: false};
                        } else if (c === 0) {
                            width = defaults.brickWidth / 2;
                        } else if (c === (defaults.brickColumnCount - 1)) {
                            brickX += defaults.brickWidth / 2;
                            width = defaults.brickWidth / 2;
                        }
                        stage.blocks[c][r] = {x: brickX, y: brickY, width: width};
                    } else {
                        stage.bricks[c][r] = {x: brickX, y: brickY, show: true};
                        stage.brickCount++;
                    }
                }
            }
            return stage;
        },
        stage2: function () {
            var stage = [];
            window.defaults.brickRowCount = 8;
            for (var c = 0; c < defaults.brickColumnCount; c++) {
                stage[c] = [];
                for (var r = 0; r < defaults.brickRowCount; r++) {
                    var brickX = (c*(defaults.brickWidth + defaults.brickPadding)) + defaults.brickOffsetLeft;
                    var brickY = (r*(defaults.brickHeight + defaults.brickPadding)) + defaults.brickOffsetTop;
                    stage[c][r] = {x: brickX, y: brickY};
                    if (c < r) {
                        stage[c][r].show = false;
                    } else {
                        stage[c][r].show = true;
                    }
                }
            }
            return stage;
        },
        stage3: function () {
            var stage = [];
            window.defaults.brickRowCount = 8;
            for (var c = 0; c < defaults.brickColumnCount; c++) {
                stage[c] = [];
                for (var r = 0; r < defaults.brickRowCount; r++) {
                    var brickX = (c*(defaults.brickWidth + defaults.brickPadding)) + defaults.brickOffsetLeft;
                    var brickY = (r*(defaults.brickHeight + defaults.brickPadding)) + defaults.brickOffsetTop;
                    var showBrick;
                    if (r % 2 === 0) {
                        showBrick = c % 2 === 0;
                    } else {
                        showBrick = c % 2 === 1;
                    }
                    stage[c][r] = {x: brickX, y: brickY, show: showBrick};
                }
            }
            return stage;
        }
    }
})();
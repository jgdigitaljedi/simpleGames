(function() {
    window.stages = {
        stage1: function () {
            var stage = [];
            for (var c = 0; c < defaults.brickColumnCount; c++) {
                stage[c] = [];
                for (var r = 0; r < defaults.brickRowCount; r++) {
                    var brickX = (c*(defaults.brickWidth + defaults.brickPadding)) + defaults.brickOffsetLeft;
                    var brickY = (r*(defaults.brickHeight + defaults.brickPadding)) + defaults.brickOffsetTop;
                    stage[c][r] = {x: brickX, y: brickY, show: true};
                }
            }
            return stage;
        },
        stage2: function () {
            var stage = [];
            for (var c = 0; c < defaults.brickColumnCount; c++) {
                stage[c] = [];
                for (var r = 0; r < defaults.brickRowCount; r++) {
                    var brickX = (c*(defaults.brickWidth + defaults.brickPadding)) + defaults.brickOffsetLeft;
                    var brickY = (r*(defaults.brickHeight + defaults.brickPadding)) + defaults.brickOffsetTop;
                    stage[c][r] = {x: brickX, y: brickY};
                    if (c < r || c > defaults.brickColumnCount - r) {
                        stage[c][r].show = false;
                    } else {
                        stage[c][r].show = true;
                    }
                }
            }
            return stage;
        }
    }
})();
function createPaddle(x, y) {
    return {
        x: x,
        y: y,
        width: 10,
        height: 100,
        speed: 8,
        keyboardUp: false,
        keyboardDown: false
    };
}

function movePaddle(paddle, canvas) {
    if (paddle.keyboardUp != paddle.keyboardDown) {
        paddle.y += paddle.keyboardUp ? -paddle.speed : paddle.speed;
    }

    if (paddle.y < 0) {
        paddle.y = 0;
    } else if (paddle.y > canvas.height - paddle.height) {
        paddle.y = canvas.height - paddle.height;
    }
}

function drawPaddle(context, paddle) {
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}
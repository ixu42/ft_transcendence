const createPaddle = (x, y) => ({
    x: x,
    y: y,
    width: 10,
    height: 100,
    speed: 8,
    keyboardUp: false,
    keyboardDown: false,
    score: 0
});

const movePaddle = (paddle, canvas) => {
    if (paddle.keyboardUp != paddle.keyboardDown)
        paddle.y += paddle.keyboardUp ? -paddle.speed : paddle.speed;
    
    if (paddle.y < 0) {
        paddle.y = 0;
    } else if (paddle.y > canvas.height - paddle.height) {
        paddle.y = canvas.height - paddle.height;
    }
};

const drawPaddle = (context, paddle) => {
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
};

const resetPaddle = (paddle, canvas) => {
    paddle.y = canvas.height / 2 - 50;
}
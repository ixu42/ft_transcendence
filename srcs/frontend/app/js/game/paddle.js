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

const moveAIPaddle = (paddle, ball, canvas) => {
    const speed = 1; // AI paddle speed
    if (ball.y < paddle.y + paddle.height / 2) {
        paddle.y -= speed;
    } else if (ball.y > paddle.y + paddle.height / 2) {
        paddle.y += speed;
    }
    // Ensure the paddle stays within the canvas
    paddle.y = Math.max(Math.min(paddle.y, canvas.height - paddle.height), 0);
};

const drawPaddle = (context, paddle) => {
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
};
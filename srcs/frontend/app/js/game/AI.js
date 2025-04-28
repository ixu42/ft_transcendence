const initializeAIGame = (gameId, userId) => {
    const canvas = document.getElementById('pong');
    if (!canvas) {
        console.error("Canvas element '#pong' not found.");
        return;
    }
    const game = createGame();
    game.state = "levelSelection";
    game.isAI = true;
    game.AI = createAI();
    setupAndStart(gameId, userId, game);
};

const createAI = () => {
    const lastAICheckTime = 0;
    const targetPaddleY = 0;
    return {lastAICheckTime, targetPaddleY};
}

const moveAIPaddle = (paddle, ball, canvas, aiLevel, AI) => {

    const currentTime = performance.now();
    // Check the ball's position only once per second
    if (currentTime - AI.lastAICheckTime >= 1000) {
        AI.lastAICheckTime = currentTime;

        // Predict the ball's future position
        let projectedX = ball.x;
        let projectedY = ball.y;
        let velocityX = ball.dx * ball.speed;
        let velocityY = ball.dy * ball.speed;

        // Simulate the ball's movement until it reaches the paddle's x position
        while (velocityX > 0 ? projectedX < paddle.x : projectedX > paddle.x) {
            projectedX += velocityX;
            projectedY += velocityY;

            // Handle wall bounces
            if (projectedY - ball.radius <= 0 || projectedY + ball.radius >= canvas.height) {
                velocityY = -velocityY; // Reverse vertical direction
                projectedY = Math.max(ball.radius, Math.min(canvas.height - ball.radius, projectedY)); // Clamp within bounds
            }
        }

        // Set the target position for the paddle
        AI.targetPaddleY = projectedY - paddle.height / 2; // Center the paddle on the ball
    }

    const speed = aiLevel === "easy" ? 2 : aiLevel === "medium" ? 5 : aiLevel == 'hard' ? 9 : 2; // AI paddle speed
    if (paddle.y < AI.targetPaddleY) {
        paddle.y = Math.min(paddle.y + speed, AI.targetPaddleY); // Move down toward the target
    } else if (paddle.y > AI.targetPaddleY) {
        paddle.y = Math.max(paddle.y - speed, AI.targetPaddleY); // Move up toward the target
    }
    // Ensure the paddle stays within the canvas
    paddle.y = Math.max(Math.min(paddle.y, canvas.height - paddle.height), 0);
};

const drawLevelSelection = (game) => {
    const context = game.context;
    context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText('Select AI Level', game.canvas.width / 2 - 100, game.canvas.height / 2 - 60);
    context.fillText('1. Easy', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
    context.fillText('2. Medium', game.canvas.width / 2 - 50, game.canvas.height / 2 + 20);
    context.fillText('3. Hard', game.canvas.width / 2 - 50, game.canvas.height / 2 + 60);
    context.fillText('Press 1, 2, or 3 to select', game.canvas.width / 2 - 100, game.canvas.height / 2 + 100);
};


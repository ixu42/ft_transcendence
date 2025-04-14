const initializeAIGame = (gameId, userId) => {
    const canvas = document.getElementById('pong');
    if (!canvas) {
        console.error("Canvas element '#pong' not found.");
        return;
    }
    const game = createGame(true);
    setupControls(game.player, game.player2, game, gameId, userId);
    setupAILevelControls(game);
    console.log("Starting game loop");
    startGameLoop(game);
};

const moveAIPaddle = (paddle, ball, canvas, aiLevel) => {
    const speed = aiLevel === "easy" ? 2 : aiLevel === "medium" ? 5 : aiLevel == 'hard' ? 9 : 2; // AI paddle speed
    if (ball.y < paddle.y + paddle.height / 2) {
        paddle.y -= speed;
    } else if (ball.y > paddle.y + paddle.height / 2) {
        paddle.y += speed;
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


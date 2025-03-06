const createGame = (isAI = false) => {
    const canvas = document.getElementById('pong');
    const player = createPaddle(0, canvas.height / 2 - 50);
    const player2 = createPaddle(canvas.width - 10, canvas.height / 2 - 50);
    const ball = createBall(canvas.width / 2, canvas.height / 2);
    const context = canvas.getContext('2d');
    const state = isAI ? "levelSelection" : "scoreSelection";
    const lastState = "prepare";
    const aiLevel = 'none';
    const winningScore = 0;

    return { player, player2, ball, canvas, context, state, lastState, isAI, aiLevel, winningScore };
};

const updateGame = (game) => {
    movePaddle(game.player, game.canvas);
    game.isAI ? moveAIPaddle(game.player2, game.ball, game.canvas, game.aiLevel) : movePaddle(game.player2, game.canvas);
    game.state === "game" && moveBall(game.ball, game.player, game.player2, game.canvas);
};

const drawScore = (game) => {
    game.context.font = '30px Arial';
    game.context.fillText(game.player.score, game.canvas.width / 4, 30);
    game.context.fillText(game.player2.score, 3 * game.canvas.width / 4, 30);
};

const drawPause = (game) => {
    game.context.font = '30px Arial';
    game.context.fillText('PAUSE', game.canvas.width / 2 - 50, game.canvas.height / 2);
};

const drawGame = (game) => {
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.context.fillStyle = '#fff';
    drawPaddle(game.context, game.player);
    drawPaddle(game.context, game.player2);
    game.state == "pause" && drawPause(game);
    drawBall(game.context, game.ball);
    drawScore(game);
};

const drawScoreSelection = (game) => {
    const context = game.context;
    context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText('Select Winning Score', game.canvas.width / 2 - 100, game.canvas.height / 2 - 60);
    context.fillText('1. 3 Points', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
    context.fillText('2. 7 Points', game.canvas.width / 2 - 50, game.canvas.height / 2 + 20);
    context.fillText('3. Endless', game.canvas.width / 2 - 50, game.canvas.height / 2 + 60);
    context.fillText('Press 1, 2, or 3 to select', game.canvas.width / 2 - 100, game.canvas.height / 2 + 100);
};

const drawGameOver = (game) => {
    const context = game.context;
    context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText('Game Over', game.canvas.width / 2 - 50, game.canvas.height / 2 - 60);
    if (game.isAI)
    {
        if (game.player.score >= game.winningScore)
            context.fillText('You Win!', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
        else 
            context.fillText('You lost!', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
    }
    else
    {
        if (game.player.score >= game.winningScore)
            context.fillText('Player 1 Wins!', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
        else 
            context.fillText('Player 2 Wins!', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
    }
    context.fillText('Press Space to Restart', game.canvas.width / 2 - 100, game.canvas.height / 2 + 20);
};

const resetGame = (game) => {
    game.player.score = 0;
    game.player2.score = 0;
    resetBall(game.ball, game.canvas);
};

const gameLoop = (game) => {
    if (game.state === "game" || game.state === "pause" || game.state === "prepare") {
        updateGame(game);
        drawGame(game);
        if (game.winningScore > 0 && (game.player.score >= game.winningScore || game.player2.score >= game.winningScore))
            game.state = "gameOver";
    }
    if (game.state === "levelSelection") {
        drawLevelSelection(game);
    }
    if (game.state === "scoreSelection") {
        drawScoreSelection(game);
    }
    if (game.state === "gameOver") {
        drawGameOver(game);
    }
    requestAnimationFrame(() => gameLoop(game));
};

const initializeGame = () => {
        const canvas = document.getElementById('pong');
        if (!canvas) {
            console.error("Canvas element '#pong' not found.");
            resolve([0, 0]);
            return;
        }
        const game = createGame(false);
        setupControls(game.player, game.player2, game);
        console.log("Starting game loop");
        gameLoop(game);
};
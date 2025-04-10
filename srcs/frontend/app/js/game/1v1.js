const createGame = (isAI = false) => {
    const canvas = document.getElementById('pong');
    const player = createPaddle(0, canvas.height / 2 - 50);
    const player2 = createPaddle(canvas.width - 10, canvas.height / 2 - 50);
    const ball = createBall(canvas.width / 2, canvas.height / 2);
    const context = canvas.getContext('2d');
    const state = isAI ? "levelSelection" : "scoreSelection";
    const lastState = "prepare";
    const aiLevel = 'none';
    const winningScore = -1;
    const options = {walls: 0};
    const walls = {player: 0, player2: 0};

    return { player, player2, ball, canvas, context, state, lastState, isAI, aiLevel, winningScore, options, walls };
};

const updateGame = (game) => {
    movePaddle(game.player, game.canvas);
    game.isAI ? moveAIPaddle(game.player2, game.ball, game.canvas, game.aiLevel) : movePaddle(game.player2, game.canvas);
    game.state === "game" && moveBall(game.ball, game.player, game.player2, game.canvas, game);
};

const drawWalls = (game) => {
    const context = game.context;

    const getWallColor = (hp) => {
        if (hp <= 1) return 'rgba(255, 0, 0, 0)'; // Invisible when HP is 1
        const brightness = Math.min(255, 255 - 255 * (hp/game.winningScore)); // Brighter as HP decreases
        return `rgb(255, ${brightness}, ${brightness})`; // Red with increasing brightness
    };
    
    context.fillStyle = getWallColor(game.walls.player); // Color for left wall
    context.fillRect(0, 0, 10, game.canvas.height); // Left wall
    context.fillStyle = getWallColor(game.walls.player2); // Colour for right wall
    context.fillRect(game.canvas.width - 10, 0, 10, game.canvas.height); // right wall

    context.font = '20px Arial';
    context.fillStyle = '#fff';
    context.fillText(`Wall HP: ${game.walls.player}`, 20, 30);
    context.fillText(`Wall HP: ${game.walls.player2}`, game.canvas.width - 140, 30); 
};

const drawWallSelection = (game) => {
    const context = game.context;
    context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText('Enable Walls?', game.canvas.width / 2 - 100, game.canvas.height / 2 - 60);
    context.fillText('1. Yes', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
    context.fillText('2. No', game.canvas.width / 2 - 50, game.canvas.height / 2 + 20);
    context.fillText('Press 1 or 2 to select', game.canvas.width / 2 - 100, game.canvas.height / 2 + 60);
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
    game.options.walls ? drawWalls(game) : drawScore(game);
    drawPaddle(game.context, game.player);
    drawPaddle(game.context, game.player2);
    game.state == "pause" && drawPause(game);
    drawBall(game.context, game.ball);
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
        if ((game.options.walls && game.walls.player2 <= 0) || game.player.score >= game.winningScore)
            context.fillText('You Win!', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
        else 
            context.fillText('You lost!', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
    }
    else
    {
        if ((game.options.walls && game.walls.player2 <= 0) || game.player.score >= game.winningScore)
            context.fillText('Player 1 Wins!', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
        else 
            context.fillText('Player 2 Wins!', game.canvas.width / 2 - 50, game.canvas.height / 2 - 20);
    }
    context.fillText('Press X to exit', game.canvas.width / 2 - 50, game.canvas.height / 2 + 40);
};

const resetGame = (game) => {
    game.player.score = 0;
    game.player2.score = 0;
    resetBall(game.ball, game.canvas);
};

const gameLoop = (game) => {
    console.log("game state: " + game.state);
    if (game.state === "game" || game.state === "pause" || game.state === "prepare") {
        updateGame(game);
        drawGame(game);
    }
    if (game.state === "levelSelection") {
        drawLevelSelection(game);
    }
    if (game.state === "scoreSelection") {
        drawScoreSelection(game);
    }
    if (game.state === "wallSelection") {
        drawWallSelection(game);
    }
    if (game.state === "gameOver") {
        drawGameOver(game);
    }
    requestAnimationFrame(() => gameLoop(game));
};

const initializeGame = (gameId) => {
        const canvas = document.getElementById('pong');
        if (!canvas) {
            console.error("Canvas element '#pong' not found.");
            resolve([0, 0]);
            return;
        }
        const game = createGame(false);
        setupControls(game.player, game.player2, game, gameId);
        console.log("Starting game loop");
        gameLoop(game);
};
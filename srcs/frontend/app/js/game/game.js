function createGame() {
    const canvas = document.getElementById('pong');
    const player = createPaddle(0, canvas.height / 2 - 50);
    const player2 = createPaddle(canvas.width - 10, canvas.height / 2 - 50);
    const ball = createBall(canvas.width / 2, canvas.height / 2);
    const context = canvas.getContext('2d');
    const pause = false;

    return { player, player2, ball, canvas, context , pause};
}

function updateGame(game) {
    movePaddle(game.player, game.canvas);
    movePaddle(game.player2, game.canvas);
    if (!game.pause)
        moveBall(game.ball, game.player, game.player2, game.canvas);
}

function drawScore(game) {
    game.context.font = '30px Arial';
    game.context.fillText(game.player.score, game.canvas.width / 4, 30);
    game.context.fillText(game.player2.score, 3 * game.canvas.width / 4, 30);
}

function drawPause(game) {
    game.context.font = '30px Arial';
    game.context.fillText('PAUSE', game.canvas.width / 2 - 50, game.canvas.height / 2);
}

function drawGame(game) {
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);

    game.context.fillStyle = '#fff';
    drawPaddle(game.context, game.player);
    drawPaddle(game.context, game.player2);
    game.pause ? drawPause(game) : null;
    drawBall(game.context, game.ball);
    drawScore(game);
}
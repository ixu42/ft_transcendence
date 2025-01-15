const initializeGame = () => {
    const canvas = document.getElementById('pong');
    if (!canvas) {
        console.error("Canvas element '#pong' not found.");
        return;
    }

    const game = createGame();
    setupControls(game.player, game.player2, game);
    resetBall(drawBall, canvas);

    function gameLoop() {
        updateGame(game);
        drawGame(game);
        requestAnimationFrame(gameLoop);
    }

    console.log("Starting game loop");
    gameLoop();
};

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
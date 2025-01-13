document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pong');
    if (!canvas) {
        console.error("Canvas element '#pong' not found.");
        return;
    }

    const game = createGame();
    setupControls(game.player, game.player2);

    function gameLoop() {
        updateGame(game);
        drawGame(game);
        requestAnimationFrame(gameLoop);
    }

    console.log("Starting game loop");
    gameLoop();
});

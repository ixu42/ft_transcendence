document.addEventListener('DOMContentLoaded', () => {
    const game = createGame();

    setupControls(game.player, game.player2);

    function gameLoop() {
        updateGame(game);
        drawGame(game);
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
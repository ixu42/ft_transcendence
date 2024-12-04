document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pong');
    const context = canvas.getContext('2d');

    const player = createPaddle(0, canvas.height / 2 - 50);
    const ai = createPaddle(canvas.width - 10, canvas.height / 2 - 50);
    const ball = createBall(canvas.width / 2, canvas.height / 2);

    const aispeed = 4;
    const paddleSpeed = 8;

    setupControls(player);


    function gameLoop() {
        updateGame(player, ai, ball, canvas);
        drawGame(context, player, ai, ball, canvas);
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
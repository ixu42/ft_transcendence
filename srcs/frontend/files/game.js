function updateGame(player, ai, ball, canvas) {
    movePaddle(player, canvas);
    moveBall(ball, player, ai, canvas);
}

function drawGame(context, player, ai, ball, canvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#fff';
    drawPaddle(context, player);
    drawPaddle(context, ai);
    drawBall(context, ball);
}
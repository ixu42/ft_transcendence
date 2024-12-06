function createBall(x, y) {
    return {
        x: x,
        y: y,
        radius: 10,
        speed: 4,
        dx: 4,
        dy: 4
    };
}

function moveBall(ball, player, player2, canvas) {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
        ball.dy *= -1;
    }

    if (ball.x < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height) {
        ball.dx *= -1;
    }

    if (ball.x > player2.x - ball.radius &&
        ball.y > player2.y &&
        ball.y < player2.y + player2.height) {
        ball.dx *= -1;
    }

    if (ball.x < 0 || ball.x > canvas.width) {
        if (ball.x < 0)
            player2.score++;
        else if (ball.x > canvas.width)
            player.score++;    
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1);
    }
}

function drawBall(context, ball) {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
}
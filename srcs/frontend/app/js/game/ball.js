const createBall = (x, y) => {
    return {
        x: x,
        y: y,
        radius: 10,
        speed: 0.3,
        speedUp: 0.03,
        dx: Math.cos(Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1),
        dy: Math.sin(Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1)
    };
}

const resetBall = (ball, canvas) => {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = Math.cos(Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = Math.sin(Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
    ball.speed = 0.3;
}

const hitPaddle = (ball, player, direction) => {
    let relativeIntersectY = (player.y + (player.height / 2)) - ball.y;
    let normalizedRelativeIntersectionY = (relativeIntersectY / (player.height / 2));
    let bounceAngle = normalizedRelativeIntersectionY * Math.PI / 4; // 45 degrees

    ball.dx = direction * Math.cos(bounceAngle);
    ball.dy = -Math.sin(bounceAngle);
    ball.speed += ball.speedUp;
}

const moveBall = (ball, player, player2, canvas, game, deltatime) => {
    ball.x += ball.dx * ball.speed * deltatime;
    ball.y += ball.dy * ball.speed * deltatime;

    if ((ball.y - ball.radius < 0 && ball.dy < 0) || (ball.y + ball.radius > canvas.height && ball.dy > 0)) {
        ball.dy *= -1;
    }

    if (ball.x - ball.radius < player.x + player.width &&
        ball.y + ball.radius > player.y &&
        ball.y - ball.radius < player.y + player.height) {
        hitPaddle(ball, player, 1);
    }

    if (ball.x + ball.radius > player2.x &&
        ball.y + ball.radius > player2.y &&
        ball.y - ball.radius < player2.y + player2.height) {
        hitPaddle(ball, player2, -1);
    }

    if ((ball.x < 0 && ball.dx < 0) || (ball.x > canvas.width) && ball.dx > 0) {
        ball.x < 0 ? player2.score++ : player.score++;
        if (game.options.walls)
        {
            ball.x < 0 ? game.walls.player-- : game.walls.player2--;
            if (game.walls.player <= 0 || game.walls.player2 <= 0) {
                game.state = "gameOver";
            }
            ball.dx *= -1;
            return;
        }
        game.state = game.player.score >= game.winningScore || game.player2.score >= game.winningScore ? "gameOver" : "prepare";
        resetPaddle(player, canvas);
        resetPaddle(player2, canvas);
        resetBall(ball, canvas);
    }
}

const drawBall = (context, ball) => {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
}
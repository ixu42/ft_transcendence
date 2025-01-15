const createBall = (x, y) => {
    return {
        x: x,
        y: y,
        radius: 10,
        speed: 2,
        speedUp: 0.2,
        dx: Math.cos(Math.PI / 4) * Math.random() > 0.5 ? 1 : -1,
        dy: Math.sin(Math.PI / 4) * Math.random() > 0.5 ? 1 : -1
    };
}

const resetBall = (ball, canvas) => {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = Math.cos(Math.PI / 4) * Math.random() > 0.5 ? 1 : -1;
    ball.dy = Math.sin(Math.PI / 4) * Math.random() > 0.5 ? 1 : -1;
    ball.speed = 2;
}

const hitPaddle = (ball, player, direction) => {
    let relativeIntersectY = (player.y + (player.height / 2)) - ball.y;
    let normalizedRelativeIntersectionY = (relativeIntersectY / (player.height / 2));
    let bounceAngle = normalizedRelativeIntersectionY * Math.PI / 4; // 45 degrees

    ball.dx = direction * Math.cos(bounceAngle);
    ball.dy = -Math.sin(bounceAngle);
    ball.speed += ball.speedUp;
}

const moveBall = (ball, player, player2, canvas) => {
    ball.x += ball.dx * ball.speed;
    ball.y += ball.dy * ball.speed;

    if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
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

    if (ball.x < 0 || ball.x > canvas.width) {
        ball.x < 0 ? player2.score++ : player.score++;
        resetBall(ball, canvas);
    }
}

const drawBall = (context, ball) => {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
}
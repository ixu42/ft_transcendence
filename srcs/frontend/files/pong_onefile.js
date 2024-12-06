// Select the canvas element
const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 100;
const paddleSpeed = 8;

// Player paddle
const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    keyboardUp: false,
    keyboardDown: false
};

// AI paddle
const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 4
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 4,
    dx: 4,
    dy: 4
};

// Draw the paddles and ball
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#fff';

    // Draw player paddle
    context.fillRect(player.x, player.y, player.width, player.height);

    // Draw AI paddle
    context.fillRect(ai.x, ai.y, ai.width, ai.height);

    // Draw the ball
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
}

// Move paddles
function move() {
    // Move player paddle
    
    if (player.keyboardUp != player.keyboardDown) {
        player.y += player.keyboardUp ? -paddleSpeed : paddleSpeed;
    }

    // Prevent paddles from going out of bounds
    if (player.y < 0) {
        player.y = 0;
    } else if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
    }

    // Move AI paddle
    ai.y += ai.dy;

    // AI paddle AI
    if (ai.y < 0 || ai.y > canvas.height - ai.height) {
        ai.dy *= -1;
    }
}

// Move ball
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    if (ball.x < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height) {
        ball.dx *= -1;
    }

    if (ball.x > ai.x - ball.radius &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height) {
        ball.dx *= -1;
    }

    // Ball out of bounds
    if (ball.x < 0 || ball.x > canvas.width) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1);
    }
}

// Update game state
function update() {
    move();
    moveBall();
    draw();
}

// Keyboard controls
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        player.keyboardUp = true;
    } else if (event.key === 'ArrowDown') {
        player.keyboardDown = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowUp') {
        player.keyboardUp = false;
    } else if (event.key === 'ArrowDown') {
        player.keyboardDown = false;
    }
});

// Start the game loop
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

// ui.js

let player1Score = 0;
let player2Score = 0;

function updateScore() {
    document.getElementById('player1-score').textContent = player1Score;
    document.getElementById('player2-score').textContent = player2Score;
}

function increasePlayer1Score() {
    player1Score++;
    updateScore();
}

function increasePlayer2Score() {
    player2Score++;
    updateScore();
}

document.addEventListener('keydown', (event) => {
});


const setupTournament = () => {
    const numberOfPlayers = parseInt(prompt("Enter the number of players:"));
    if (isNaN(numberOfPlayers) || numberOfPlayers <= 2) {
        alert("Invalid number of players. Please enter a positive integer of least 3.");
        return null;
    }

    const players = [];
    for (let i = 0; i < numberOfPlayers; i++) {
        const playerName = prompt(`Enter the name of player ${i + 1}:`);
        if (playerName) {
            players.push({ name: playerName, score: 0, matches: 0 });
        } else {
            alert("Player name cannot be empty. Please enter a valid name.");
            i--; // Retry for the same player index
        }
    }

    const winningScore = parseInt(prompt("Enter the winning match score:"));
    if (isNaN(winningScore) || winningScore <= 0) {
        alert("Invalid winning score. Please enter a positive integer.");
        return null;
    }

    console.log("Tournament initialized with players:", players);
    return { players, winningScore, keyboardEnter: false, state: 'table' };
};

const initializeTournament = (gameId) => {
    const canvas = document.getElementById('pong');
    if (!canvas) {
        console.error("Canvas element '#pong' not found.");
        return;
    }
    const tournament = setupTournament();
    if (!tournament) return;
    const game = createGame();
    game.winningScore = tournament.winningScore;
    setupTournamentControls(tournament);
    setupControls(game.player, game.player2, game, gameId);
    
    let currentMatchIndex = 0;
    tournamentLoop(tournament, game, currentMatchIndex, gameId);
};

const tournamentLoop = (tournament, game, currentMatchIndex, gameId) => {
    if (tournament.state === 'table') {
        drawTable(tournament.players, game.canvas);
        if (tournament.keyboardEnter) {
            tournament.state = 'prepare';
            tournament.keyboardEnter = false;
        }
    }
    if (tournament.state === 'prepare') {
        drawMatch(tournament.players, game.canvas, currentMatchIndex);
        if (tournament.keyboardEnter) {
            tournament.state = 'playing';
            game.state = 'wallSelection';
            tournament.keyboardEnter = false;
        }
    }
    if (tournament.state === 'playing') {
        if (game.state === "wallSelection") {
            drawWallSelection(game);
        }
        else {
            updateGame(game);
            drawGame(game);
            if (game.player.score === tournament.winningScore || game.player2.score === tournament.winningScore) {
                let winner, loser;
                if (game.player.score > game.player2.score) {
                    winner = tournament.players[currentMatchIndex];
                    loser = tournament.players[currentMatchIndex + 1];
                } else {
                    winner = tournament.players[currentMatchIndex + 1];
                    loser = tournament.players[currentMatchIndex];
                }
                winner.score++;
                tournament.players = tournament.players.filter(player => player !== loser);
                currentMatchIndex++;
                if (currentMatchIndex >= tournament.players.length - 1)
                    currentMatchIndex = 0;
                if (tournament.players.length === 1) {
                    game.state = 'gameOver';
                    drawWinner(tournament.players[0], game.canvas);
                    return;
                }
                tournament.state = 'table';
                resetGame(game);
            }
        }
    }
    requestAnimationFrame(() => tournamentLoop(tournament, game, currentMatchIndex));
};

const drawTable = (players, canvas) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText('Tournament', canvas.width / 2 - 50, 30);

    players.sort((a, b) => b.score - a.score);

    let y = 100;
    for (let i = 0; i < players.length; i++) {
        context.fillText(`${players[i].name}: ${players[i].score}`, canvas.width / 2 - 50, y);
        y += 50;
    }
    context.fillText('Press Enter to start', canvas.width / 2 - 50, y + 50);
};

const drawMatch = (players, canvas, matchIndex) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText('Match', canvas.width / 2 - 50, 30);

    context.fillText(`${players[matchIndex].name} vs ${players[matchIndex + 1].name}`, canvas.width / 2 - 50, 100);
    context.fillText('Press Enter to start', canvas.width / 2 - 50, 150);
};

const drawWinner = (player, canvas) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText(`Winner: ${player.name}`, canvas.width / 2 - 50, canvas.height / 2);
    context.fillText('Press X to exit', canvas.width / 2 - 50, canvas.height / 2 + 40);
};

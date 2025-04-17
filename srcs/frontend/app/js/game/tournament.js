const setupTournament = async (response) => {
    const tournamentId = response.tournament_id;
    const creatorUsername = response.tournament_name.split("'")[0];
    const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);

    // Step 1: Check if there are at least 3 logged-in users (including creator)
    if (loggedInUsers.length < 3) {
        alert("❌ Tournament requires exactly 3 logged-in users. Found: " + loggedInUsers.length);
        return null;
    }

    // Step 2: Verify the creator is logged in
    const creator = loggedInUsers.find(user => user.username === creatorUsername);
    if (!creator) {
        alert("❌ Tournament creator must be logged in.");
        return null;
    }

    // Step 3: Initialize players with the creator
    const players = [
        {
            name: creatorUsername,
            userId: creator.id,
            score: 0,
            matches: 0
        }
    ];

    // Step 4: Prompt to select exactly 2 additional logged-in players
    const potentialPlayers = loggedInUsers.filter(
        user => user.username !== creatorUsername
    );
    let playerOptions = potentialPlayers
        .map(user => `${user.id}: ${user.username}`)
        .join("\n");

    while (players.length < 3 && potentialPlayers.length > 0) {
        const selectedPlayer = window.prompt(
            `Select a logged-in user to join the tournament (need ${3 - players.length} more):\n${playerOptions}`
        );
        if (!selectedPlayer) {
            alert("❌ Tournament requires exactly 3 players. Selection cancelled.");
            return null;
        }

        const playerId = selectedPlayer.trim();
        const player = potentialPlayers.find(p => p.id.toString() === playerId);
        if (!player) {
            alert("❌ Invalid player selection.");
            continue;
        }

        // Join player via API
        const joinResponse = await apiRequest(
            `tournaments/${tournamentId}/players/?user_id=${playerId}`,
            "PATCH",
            {
                display_name: player.username
            }
        );
        if (joinResponse.errors) {
            alert(`❌ Failed to add ${player.username}: ${JSON.stringify(joinResponse.errors)}`);
            continue;
        }

        // Add player to tournament
        players.push({
            name: player.username,
            userId: player.id,
            score: 0,
            matches: 0
        });
        console.log(`✅ ${player.username} joined tournament ${tournamentId}`);

        // Remove selected player from potential players
        potentialPlayers.splice(potentialPlayers.indexOf(player), 1);
        playerOptions = potentialPlayers
            .map(user => `${user.id}: ${user.username}`)
            .join("\n");
    }

    // Step 5: Verify exactly 3 players
    if (players.length !== 3) {
        alert("❌ Tournament requires exactly 3 players. Selected: " + players.length);
        return null;
    }

    // Step 6: Set winning score
    const winningScore = parseInt(prompt("Enter the winning match score (e.g., 10):"));
    if (isNaN(winningScore) || winningScore <= 0) {
        alert("Invalid winning score. Please enter a positive integer.");
        return null;
    }

    // Step 7: Log and return tournament data
    console.log("Tournament initialized with 3 players:", players);
    const isTournamentRunning = false; // Initialize tournament state

    return {
        players,                   
        allPlayers: [...players],   // Copy of players for reference (from Stashed changes)
        winningScore,               // Winning score for the tournament
        keyboardEnter: false,       // Keyboard input state
        state: "table",            // Initial tournament state
        tournamentId,              // Tournament ID (from Stashed changes)
        isTournamentRunning        // Tournament running state (from Updated upstream)
    };
};

const startTournament = async (tournament) => {
    const creator = tournament.allPlayers.find(player => player.name === tournament.allPlayers[0].name);
    if (!creator || !creator.userId) {
        console.error("Cannot start tournament: Creator not found or not logged in");
        alert("❌ Cannot start tournament: Creator not logged in.");
        return;
    }

    console.log(`Attempting to start tournament ${tournament.tournamentId} for creator user_id=${creator.userId}`);
    const startResponse = await apiRequest(
        `tournaments/${tournament.tournamentId}/start/?user_id=${creator.userId}`,
        "PATCH",
        {}
    );
    if (startResponse.errors) {
        console.error(
            `Failed to start tournament for ${creator.name} (user_id=${creator.userId}):`,
            startResponse.errors
        );
        alert(
            `❌ Failed to start tournament: ${JSON.stringify(startResponse.errors)}`
        );
    } else {
        console.log(`✅ Tournament started for ${creator.name} (user_id=${creator.userId})`);
    }
};

const initializeTournament = async (response) => {
    const canvas = document.getElementById("pong");
    if (!canvas) {
        console.error("Canvas element '#pong' not found.");
        return;
    }
    const tournament = await setupTournament(response);
    if (!tournament) return;
    await startTournament(tournament);
    const game = createGame();
    game.winningScore = tournament.winningScore;
    setupTournamentControls(tournament);
    setupControls(game.player, game.player2, game, tournament.tournamentId, true);

    let currentMatchIndex = 0;
    tournament.isTournamentRunning = true;
    tournamentLoop(tournament, game, currentMatchIndex, gameId);
};


const stopTournamentLoop = (tournament) => {
    tournament.isTournamentRunning = false;
}

const tournamentLoop = async (tournament, game, currentMatchIndex) => {
    // Early return if tournament is not running
    if (tournament.isTournamentRunning === false) {
        return;
    }

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
        } else {
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
                if (currentMatchIndex >= tournament.players.length - 1) {
                    currentMatchIndex = 0;
                }
                if (tournament.players.length === 1) {
                    game.state = 'gameOver';
                    drawWinner(tournament.players[0], game.canvas);

                    const winner = tournament.players[0];
                    const creator = tournament.allPlayers[0];

                    if (!creator.userId) {
                        console.warn("No valid userId for creator; skipping stats save");
                        alert("❌ Cannot save stats: Creator not logged in.");
                    } else {
                        const winnerId = winner.userId;
                        if (!winnerId) {
                            console.warn("No valid winner_id; skipping stats save");
                            alert("❌ Cannot save stats: Winner has no valid userId.");
                        } else {
                            console.log(
                                `Saving stats for creator user_id=${creator.userId}, winner_id=${winnerId}`
                            );
                            const statsResponse = await apiRequest(
                                `tournaments/${tournament.tournamentId}/stats/?user_id=${creator.userId}`,
                                "PATCH",
                                {
                                    winner_id: winnerId
                                }
                            );
                            if (statsResponse.errors) {
                                console.error(
                                    `Failed to save stats for ${creator.name} (user_id=${creator.userId}):`,
                                    statsResponse.errors
                                );
                                alert(
                                    `❌ Failed to save stats for ${creator.name}: ${JSON.stringify(statsResponse.errors)}`
                                );
                            } else {
                                console.log(`✅ Stats saved for ${creator.name}`);
                            }
                        }
                    }

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

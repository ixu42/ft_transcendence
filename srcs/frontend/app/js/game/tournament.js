const setupTournament = async (response) => {
    const tournamentId = response.tournament_id;
    const creatorUsername = response.tournament_name.split("'")[0];
    const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);

    // Step 1: Verify the creator is logged in
    const creator = loggedInUsers.find(user => user.username === creatorUsername);
    if (!creator) {
        alert("❌ Tournament creator must be logged in.");
        return null;
    }

    // Step 2: Check if there are at least 2 potential players (logged-in or guest)
    // Creator is already included, so we need 2 more players
    if (loggedInUsers.length < 1) {
        alert("❌ At least one logged-in user (creator) is required.");
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

    // Step 4: Prompt to select exactly 2 additional players (logged-in or guest)
    const potentialLoggedInPlayers = loggedInUsers.filter(
        user => user.username !== creatorUsername
    );
    let playerOptions = potentialLoggedInPlayers
        .map(user => `${user.id}: ${user.username}`)
        .join("\n");
    playerOptions += "\nOr enter a guest username (e.g., guest123)";

    while (players.length < 3) {
        const selectedPlayer = window.prompt(
            `Select a logged-in user by ID or enter a guest username (need ${3 - players.length} more):\n${playerOptions}`
        );
        if (!selectedPlayer) {
            alert("❌ Tournament requires exactly 3 players. Selection cancelled.");
            return null;
        }

        const input = selectedPlayer.trim();
        let player, playerId, displayName;

        // Check if input is a logged-in user ID
        if (potentialLoggedInPlayers.find(p => p.id.toString() === input)) {
            player = potentialLoggedInPlayers.find(p => p.id.toString() === input);
            playerId = player.id;
            displayName = player.username;

            // Join logged-in player via API
            const joinResponse = await apiRequest(
                `tournaments/${tournamentId}/players/?user_id=${playerId}`,
                "PATCH",
                { display_name: displayName }
            );
            if (joinResponse.errors) {
                alert(`❌ Failed to add ${displayName}: ${JSON.stringify(joinResponse.errors)}`);
                continue;
            }

            // Add logged-in player to tournament
            players.push({
                name: displayName,
                userId: playerId,
                score: 0,
                matches: 0
            });
            console.log(`✅ ${displayName} (logged-in) joined tournament ${tournamentId}`);

            // Remove selected player from potential logged-in players
            potentialLoggedInPlayers.splice(potentialLoggedInPlayers.indexOf(player), 1);
        } else {
            // Assume input is a guest username
            displayName = input;

            // Fetch guest ID
            const guestResponse = await apiRequest(
                `get-guest-id/?username=${encodeURIComponent(displayName)}`,
                "GET",
                null
            );
            if (guestResponse.errors || !guestResponse.id) {
                alert(`❌ Failed to fetch guest ID for ${displayName}: ${JSON.stringify(guestResponse.errors || "No guest ID returned")}`);
                continue;
            }
            playerId = guestResponse.id;

            // Join guest player via API
            const joinResponse = await apiRequest(
                `tournaments/${tournamentId}/players/?user_id=${playerId}`,
                "PATCH",
                { display_name: displayName }
            );
            if (joinResponse.errors) {
                alert(`❌ Failed to add guest ${displayName}: ${JSON.stringify(joinResponse.errors)}`);
                continue;
            }

            // Add guest player to tournament
            players.push({
                name: displayName,
                userId: playerId,
                score: 0,
                matches: 0
            });
            console.log(`✅ ${displayName} (guest) joined tournament ${tournamentId}`);
        }

        // Update player options
        playerOptions = potentialLoggedInPlayers
            .map(user => `${user.id}: ${user.username}`)
            .join("\n");
        playerOptions += "\nOr enter a guest username (e.g., guest123)";
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
    const isTournamentRunning = false;

    return {
        players,
        allPlayers: [...players],
        winningScore,
        keyboardEnter: false,
        state: "table",
        tournamentId,
        isTournamentRunning
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

const initializeTournament = async (response, currentUserId) => {
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
    setupControls(game.player, game.player2, game, response.game_id, currentUserId, true);
    setupWindowEvents(game);
    setupWindowEventsTournament(tournament);

    let currentMatchIndex = 0;
    tournament.isTournamentRunning = true;
    tournamentLoop(tournament, game, currentMatchIndex);
};


const stopTournamentLoop = (tournament) => {
    tournament.isTournamentRunning = false;
}

const tournamentLoop = async (tournament, game, currentMatchIndex) => {
    if (tournament.isTournamentRunning === false) {
        return;
    }
    if (tournament.state === 'table') {
        drawTable(tournament.players, game.canvas);
        if (tournament.keyboardEnter) {
            tournament.state = "prepare";
            tournament.keyboardEnter = false;
        }
    }
    if (tournament.state === "prepare") {
        drawMatch(tournament.players, game.canvas, currentMatchIndex);
        if (tournament.keyboardEnter) {
            tournament.state = "playing";
            game.state = "wallSelection";
            tournament.keyboardEnter = false;
        }
    }
    if (tournament.state === 'playing') {
        startGameLoop(game, () => {
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
                tournament.state = 'gameOver';
                drawWinner(tournament.players[0], game.canvas);
                return;
            }
            tournament.state = 'table';
            resetGame(game);
            tournamentLoop(tournament, game, currentMatchIndex, gameId);
        });
        return;
    }
    requestAnimationFrame(() => tournamentLoop(tournament, game, currentMatchIndex, gameId));
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

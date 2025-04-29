const setupTournament = async (response) => {
    const tournamentId = response.tournament_id;
    const creatorUsername = response.tournament_name.split("'")[0];
    const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);
    const MAX_PLAYERS = 6;

    const redirectToLobby = () => {
        window.location.hash = 'lobby';
        return null;
    };

    const promptValidInput = (message, validator, errorMsg) => {
        while (true) {
            const input = prompt(message);
            if (input === null) return null;
            if (input.trim() === "") {
                alert("❌ Please enter a valid input.");
                continue;
            }
            const value = validator(input);
            if (value) return value;
            alert(errorMsg);
        }
    };

    const promptWinningScore = () => promptValidInput(
        "Enter the winning match score (e.g., 10):",
        input => {
            const score = parseInt(input, 10);
            return !isNaN(score) && score > 0 ? score : null;
        },
        "❌ Winning score must be a positive integer."
    );

    const promptPlayerCount = () => promptValidInput(
        `Enter the number of players for the tournament (minimum 3, maximum ${MAX_PLAYERS}):`,
        input => {
            const count = parseInt(input, 10);
            return !isNaN(count) && count >= 3 && count <= MAX_PLAYERS ? count : null;
        },
        `❌ Number of players must be between 3 and ${MAX_PLAYERS}.`
    );

    const joinPlayer = async (playerId, displayName) => {
        const joinResponse = await apiRequest(
            `tournaments/${tournamentId}/players/?user_id=${playerId}`,
            "PATCH",
            { display_name: displayName }
        );
        return joinResponse.errors ? null : true;
    };

    // Step 1: Verify creator is logged in
    const creator = loggedInUsers.find(user => user.username === creatorUsername);
    if (!creator) {
        alert("❌ Tournament creator must be logged in. Please log in as the creator.");
        return redirectToLobby();
    }

    // Step 2: Prompt for creator's display name
    let creatorDisplayName = creatorUsername;
    const creatorCustomName = prompt(
        `Enter a custom display name for ${creatorUsername} (press OK to keep default, or enter a new name):`,
        creatorUsername
    )?.trim();

    if (creatorCustomName === null) return redirectToLobby();
    if (creatorCustomName !== "" && creatorCustomName.toLowerCase() !== creatorUsername.toLowerCase()) {
        creatorDisplayName = creatorCustomName;
    }

    // Initialize players with creator
    const players = [{
        name: creatorDisplayName,
        userId: creator.id,
        score: 0,
        matches: 0
    }];

    // Step 3: Prompt for number of players
    const targetPlayerCount = await promptPlayerCount();
    if (targetPlayerCount === null) return redirectToLobby();

    // Step 4: Add players
    const potentialPlayers = loggedInUsers.filter(user => user.username !== creatorUsername);

    while (players.length < targetPlayerCount && players.length < MAX_PLAYERS) {
        const playerOptions = potentialPlayers
            .map(user => `${user.id}: ${user.username}`)
            .concat(["Or enter a guest username (e.g., guest123)"])
            .join("\n");

        const input = prompt(
            `Select a player by ID or enter a guest username (need ${targetPlayerCount - players.length} more players, max ${MAX_PLAYERS}):\n${playerOptions}`
        )?.trim().toLowerCase();

        if (input === null) return redirectToLobby();
        if (input === "") {
            alert("❌ Please select a valid player or enter a guest username.");
            continue;
        }

        let playerId, displayName;

        // Handle logged-in player
        const loggedInPlayer = potentialPlayers.find(p => p.id.toString() === input);
        if (loggedInPlayer) {
            playerId = loggedInPlayer.id;
            displayName = loggedInPlayer.username;

            // Prompt for custom display name
            const customName = prompt(
                `Enter a custom display name for ${displayName} (press OK to keep default, or enter a new name):`,
                displayName
            )?.trim();

            if (customName === null) return redirectToLobby();
            if (customName !== "" && customName.toLowerCase() !== displayName.toLowerCase()) {
                if (players.some(p => p.name.toLowerCase() === customName.toLowerCase())) {
                    alert(`❌ Display name "${customName}" is already used. Please choose a unique name.`);
                    continue;
                }
                displayName = customName;
            } else if (players.some(p => p.name.toLowerCase() === displayName.toLowerCase())) {
                alert(`❌ Display name "${displayName}" is already used. Please choose a unique name.`);
                continue;
            }

            if (await joinPlayer(playerId, displayName)) {
                players.push({ name: displayName, userId: playerId, score: 0, matches: 0 });
                potentialPlayers.splice(potentialPlayers.indexOf(loggedInPlayer), 1);
            } else {
                alert(`❌ Failed to add ${displayName}. Please try again.`);
            }
            continue;
        }

        // Handle guest player
        displayName = input;
        if (players.some(p => p.name.toLowerCase() === displayName.toLowerCase())) {
            alert(`❌ Username "${displayName}" is already used. Please enter a unique username.`);
            continue;
        }

        const guestResponse = await apiRequest(
            `get-guest-id/?username=${encodeURIComponent(displayName)}`,
            "GET",
            null
        );

        if (guestResponse.errors || !guestResponse.id) {
            alert(`❌ Failed to fetch guest ID for ${displayName}. Please enter a different username.`);
            continue;
        }

        playerId = guestResponse.id;
        if (await joinPlayer(playerId, displayName)) {
            players.push({ name: displayName, userId: playerId, score: 0, matches: 0 });
        } else {
            alert(`❌ Failed to add guest ${displayName}. Please enter a different username.`);
        }
    }

    // Step 5: Set winning score
    const winningScore = await promptWinningScore();
    if (winningScore === null) return redirectToLobby();

    // Step 6: Return tournament data
    return {
        players,
        allPlayers: [...players],
        winningScore,
        keyboardEnter: false,
        state: "table",
        tournamentId,
        isTournamentRunning: false
    };
};

const startTournament = async (tournament) => {
    const creator = tournament.allPlayers.find(player => player.name === tournament.allPlayers[0].name);
    if (!creator || !creator.userId) {
        console.error("Cannot start tournament: Creator not found or not logged in");
        alert("❌ Cannot start tournament: Creator not logged in.");
        return;
    }

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
    tournamentLoop(tournament, game, currentMatchIndex, response.game_id);
};


const stopTournamentLoop = (tournament) => {
    tournament.isTournamentRunning = false;
}

const tournamentLoop = async (tournament, game, currentMatchIndex, game_id) => {
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
                saveTournamentStats(tournament.tournamentId, tournament.players[0].userId);
                return;
            }
            tournament.state = 'table';
            resetGame(game);
            tournamentLoop(tournament, game, currentMatchIndex, game_id);
        });
        return;
    }
    if (tournament.state === 'gameOver') {
        drawWinner(tournament.players[0], game.canvas);
        return;
    }
    requestAnimationFrame(() => tournamentLoop(tournament, game, currentMatchIndex, game_id));
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
    context.textAlign = 'center';

    context.fillText('Match', canvas.width / 2, 30);
    context.fillText(
        `${players[matchIndex].name} vs ${players[matchIndex + 1].name}`,
        canvas.width / 2,
        100
    );
    context.fillText('Press Enter to start', canvas.width / 2, 150);

    context.fillText('Current Standings:', canvas.width / 2, 220);
    context.font = '20px Arial';
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    let y = 250;
    for (let i = 0; i < sortedPlayers.length; i++) {
        context.fillText(
            `${i + 1}. ${sortedPlayers[i].name}: ${sortedPlayers[i].score} W`,
            canvas.width / 2,
            y
        );
        y += 30;
    }

    context.textAlign = 'left';
    context.font = '20px Arial';
    context.fillText('Upcoming Matches:', 20, 50);
    y = 80;
    for (let i = 0; i < players.length - 1; i += 2) {
        if (i !== matchIndex) {
            context.fillText(
                `${players[i].name} vs ${players[i + 1].name}`,
                20,
                y
            );
            y += 30;
        }
    }
    context.textAlign = 'start';
};


const drawWinner = (player, canvas) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText(`Winner: ${player.name}`, canvas.width / 2 - 50, canvas.height / 2);
    context.fillText('Press X to exit', canvas.width / 2 - 50, canvas.height / 2 + 40);
};

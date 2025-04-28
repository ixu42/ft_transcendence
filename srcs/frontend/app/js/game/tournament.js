const setupTournament = async (response) => {
    const tournamentId = response.tournament_id;
    const creatorUsername = response.tournament_name.split("'")[0];
    const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);
    const MAX_PLAYERS = 6; // Add this constant at the top

    // Helper function to redirect to #lobby
    function redirectToLobby() {
        console.log("❌ Tournament setup cancelled, redirecting to #lobby");
        window.location.hash = 'lobby';
        return null;
    }

    // Helper function to prompt for winning score
    async function promptWinningScore() {
        let winningScore;
        while (!winningScore) {
            const input = prompt("Enter the winning match score (e.g., 10):");
            if (input === null) {
                return redirectToLobby();
            }
            if (input.trim() === "") {
                alert("❌ Please enter a valid positive integer for the winning score.");
                continue;
            }
            winningScore = parseInt(input, 10);
            if (isNaN(winningScore) || winningScore <= 0) {
                alert("❌ Winning score must be a positive integer.");
                winningScore = null;
                continue;
            }
        }
        return winningScore;
    }

    // Step 1: Verify the creator is logged in
    let creator;
    creator = loggedInUsers.find(user => user.username === creatorUsername);
    if (!creator) {
        alert("❌ Tournament creator must be logged in. Please log in as the creator.");
        return redirectToLobby();
    }

    // Step 2: Check for at least 1 logged-in user (creator)
    if (loggedInUsers.length < 1) {
        alert("❌ At least one logged-in user (creator) is required.");
        return redirectToLobby();
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

    // Step 4: Prompt for the desired number of players (minimum 3, maximum 6)
    let targetPlayerCount;
    while (!targetPlayerCount) {
        const input = prompt(`Enter the number of players for the tournament (minimum 3, maximum ${MAX_PLAYERS}):`);
        if (input === null) {
            return redirectToLobby();
        }
        if (input.trim() === "") {
            alert("❌ Please enter a valid number of players.");
            continue;
        }
        targetPlayerCount = parseInt(input, 10);
        if (isNaN(targetPlayerCount) || targetPlayerCount < 3 || targetPlayerCount > MAX_PLAYERS) {
            alert(`❌ Number of players must be between 3 and ${MAX_PLAYERS}.`);
            targetPlayerCount = null;
            continue;
        }
    }

    // Step 5: Prompt to add players until the target is reached or user chooses to continue
    const potentialLoggedInPlayers = loggedInUsers.filter(
        user => user.username !== creatorUsername
    );

    while (players.length < targetPlayerCount && players.length < MAX_PLAYERS) {
        // Check if we've reached the maximum players
        if (players.length >= MAX_PLAYERS) {
            alert(`✅ Maximum number of players (${MAX_PLAYERS}) reached. Starting tournament.`);
            break;
        }

        let playerOptions = potentialLoggedInPlayers
            .map(user => `${user.id}: ${user.username}`)
            .join("\n");
        playerOptions += "\nOr enter a guest username (e.g., guest123)";
        playerOptions += `\nEnter 'done' to start the tournament (current players: ${players.length}/${targetPlayerCount})`;

        const selectedPlayer = window.prompt(
            `Select a logged-in user by ID, enter a guest username, or type 'done' to start (need at least 2 players, max ${MAX_PLAYERS}):\n${playerOptions}`
        );

        if (selectedPlayer === null) {
            return redirectToLobby();
        }
        if (selectedPlayer.trim() === "") {
            alert("❌ Please select a valid player, enter a guest username, or type 'done'.");
            continue;
        }

        const input = selectedPlayer.trim().toLowerCase();

        // Check if user wants to start the tournament
        if (input === 'done') {
            if (players.length < 2) {
                alert("❌ At least 2 players are required to start the tournament.");
                continue;
            }
            console.log(`✅ User chose to start tournament with ${players.length} players.`);
            break; // Exit the loop to start the tournament
        }

        let player, playerId, displayName;

        // Check if input is a logged-in user ID
        if (potentialLoggedInPlayers.find(p => p.id.toString() === input)) {
            player = potentialLoggedInPlayers.find(p => p.id.toString() === input);
            playerId = player.id;
            displayName = player.username;

            // Join logged-in player via API
            let joinResponse;
            while (!joinResponse || joinResponse.errors) {
                joinResponse = await apiRequest(
                    `tournaments/${tournamentId}/players/?user_id=${playerId}`,
                    "PATCH",
                    { display_name: displayName }
                );
                if (joinResponse.errors) {
                    alert(`❌ Failed to add ${displayName}: ${JSON.stringify(joinResponse.errors)}. Please try again.`);
                    const retry = window.prompt(
                        `Select a logged-in user by ID, enter a guest username, or type 'done' to start (max ${MAX_PLAYERS} players):\n${playerOptions}`
                    );
                    if (retry === null) {
                        return redirectToLobby();
                    }
                    if (retry.trim() === "" || retry.trim().toLowerCase() === 'done') {
                        if (players.length < 2) {
                            alert("❌ At least 2 players are required to start the tournament.");
                            continue;
                        }
                        console.log(`✅ User chose to start tournament with ${players.length} players.`);
                        const winningScore = await promptWinningScore();
                        if (winningScore === null) {
                            return null; // Redirect already handled in promptWinningScore
                        }
                        return {
                            players,
                            allPlayers: [...players],
                            winningScore,
                            keyboardEnter: false,
                            state: "table",
                            tournamentId,
                            isTournamentRunning: false
                        };
                    }
                    input = retry.trim();
                    player = potentialLoggedInPlayers.find(p => p.id.toString() === input);
                    if (!player) break; // Proceed to guest logic if retry input isn't a logged-in user ID
                    playerId = player.id;
                    displayName = player.username;
                }
            }

            if (player) {
                players.push({
                    name: displayName,
                    userId: playerId,
                    score: 0,
                    matches: 0
                });
                console.log(`✅ ${displayName} (logged-in) joined tournament ${tournamentId}`);
                potentialLoggedInPlayers.splice(potentialLoggedInPlayers.indexOf(player), 1);
            }
        } else {
            displayName = input;
            if (players.some(p => p.name.toLowerCase() === displayName.toLowerCase())) {
                alert(`❌ Username "${displayName}" is already used in this tournament. Please enter a unique username.`);
                continue;
            }

            // Fetch guest ID
            let guestResponse;
            while (!guestResponse || guestResponse.errors || !guestResponse.id) {
                guestResponse = await apiRequest(
                    `get-guest-id/?username=${encodeURIComponent(displayName)}`,
                    "GET",
                    null
                );
                if (guestResponse.errors || !guestResponse.id) {
                    alert(`❌ Failed to fetch guest ID for ${displayName}: ${JSON.stringify(guestResponse.errors || "No guest ID returned")}. Please enter a different username.`);
                    const retry = window.prompt(
                        `Select a logged-in user by ID, enter a guest username, or type 'done' to start (max ${MAX_PLAYERS} players):\n${playerOptions}`
                    );
                    if (retry === null) {
                        return redirectToLobby();
                    }
                    if (retry.trim() === "" || retry.trim().toLowerCase() === 'done') {
                        if (players.length < 2) {
                            alert("❌ At least 2 players are required to start the tournament.");
                            continue;
                        }
                        console.log(`✅ User chose to start tournament with ${players.length} players.`);
                        const winningScore = await promptWinningScore();
                        if (winningScore === null) {
                            return null; // Redirect already handled in promptWinningScore
                        }
                        return {
                            players,
                            allPlayers: [...players],
                            winningScore,
                            keyboardEnter: false,
                            state: "table",
                            tournamentId,
                            isTournamentRunning: false
                        };
                    }
                    displayName = retry.trim();
                    if (players.some(p => p.name.toLowerCase() === displayName.toLowerCase())) {
                        alert(`❌ Username "${displayName}" is already used in this tournament. Please enter a unique username.`);
                        continue;
                    }
                }
            }
            playerId = guestResponse.id;

            // Join guest player via API
            let joinResponse;
            while (!joinResponse || joinResponse.errors) {
                joinResponse = await apiRequest(
                    `tournaments/${tournamentId}/players/?user_id=${playerId}`,
                    "PATCH",
                    { display_name: displayName }
                );
                if (joinResponse.errors) {
                    alert(`❌ Failed to add guest ${displayName}: ${JSON.stringify(joinResponse.errors)}. Please enter a different username.`);
                    const retry = window.prompt(
                        `Select a logged-in user by ID, enter a guest username, or type 'done' to start (max ${MAX_PLAYERS} players):\n${playerOptions}`
                    );
                    if (retry === null) {
                        return redirectToLobby();
                    }
                    if (retry.trim() === "" || retry.trim().toLowerCase() === 'done') {
                        if (players.length < 2) {
                            alert("❌ At least 2 players are required to start the tournament.");
                            continue;
                        }
                        console.log(`✅ User chose to start tournament with ${players.length} players.`);
                        const winningScore = await promptWinningScore();
                        if (winningScore === null) {
                            return null;
                        }
                        return {
                            players,
                            allPlayers: [...players],
                            winningScore,
                            keyboardEnter: false,
                            state: "table",
                            tournamentId,
                            isTournamentRunning: false
                        };
                    }
                    displayName = retry.trim();
                    if (players.some(p => p.name.toLowerCase() === displayName.toLowerCase())) {
                        alert(`❌ Username "${displayName}" is already used in this tournament. Please enter a unique username.`);
                        continue;
                    }
                    guestResponse = await apiRequest(
                        `get-guest-id/?username=${encodeURIComponent(displayName)}`,
                        "GET",
                        null
                    );
                    if (guestResponse.errors || !guestResponse.id) {
                        alert(`❌ Failed to fetch guest ID for ${displayName}: ${JSON.stringify(guestResponse.errors || "No guest ID returned")}.`);
                        continue;
                    }
                    playerId = guestResponse.id;
                }
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
    }

    // Step 6: Set winning score
    const winningScore = await promptWinningScore();
    if (winningScore === null) {
        return null; // Redirect already handled in promptWinningScore
    }

    // Step 7: Log and return tournament data
    console.log(`Tournament initialized with ${players.length} players:`, players);
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
    context.fillText('Match', canvas.width / 2 - 50, 30);
    context.fillText(
        `${players[matchIndex].name} vs ${players[matchIndex + 1].name}`,
        canvas.width / 2 - 50,
        100
    );
    context.fillText('Press Enter to start', canvas.width / 2 - 50, 150);
    context.fillText('Current Standings:', canvas.width / 2 - 50, 220);
    context.font = '20px Arial'; // Smaller font for standings to fit W/L
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    let y = 250; // Adjusted y-coordinate for standings
    for (let i = 0; i < sortedPlayers.length; i++) {
        context.fillText(
            `${i + 1}. ${sortedPlayers[i].name}: ${sortedPlayers[i].score} W ${sortedPlayers[i].losses} L`,
            canvas.width / 2 - 50,
            y
        );
        y += 30; // Reduced spacing to fit more players
    }
};

const drawWinner = (player, canvas) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.fillText(`Winner: ${player.name}`, canvas.width / 2 - 50, canvas.height / 2);
    context.fillText('Press X to exit', canvas.width / 2 - 50, canvas.height / 2 + 40);
};

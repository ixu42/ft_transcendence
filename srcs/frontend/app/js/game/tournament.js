const setupTournament = async (response) => {
    const tournamentId = response.tournament_id;
    const creatorUsername = response.tournament_name.split("'")[0];
    const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);
    const MAX_PLAYERS = 12;

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
            return !isNaN(score) && score > 0 && score <= 100 ? score : null;
        },
        "❌ Winning score must be a positive integer up to 100.");

    const promptPlayerCount = () => promptValidInput(
        `Enter the number of players for the tournament (minimum 3, maximum ${MAX_PLAYERS}):`,
        input => {
            const count = parseInt(input, 10);
            return !isNaN(count) && count >= 3 && count <= MAX_PLAYERS ? count : null;
        },
        `❌ Number of players must be between 3 and ${MAX_PLAYERS}.`);

    const joinPlayer = async (playerId) => {
        const joinResponse = await apiRequest(
            `tournaments/${tournamentId}/players/?user_id=${playerId}`,
            "PATCH");
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
    );

    if (creatorCustomName === null) return redirectToLobby();
    const trimmedCreatorName = creatorCustomName.trim();
    if (trimmedCreatorName !== "" && trimmedCreatorName.toLowerCase() !== creatorUsername.toLowerCase()) {
        creatorDisplayName = trimmedCreatorName;
    }

    // Initialize players with creator
    const players = [{name: creatorDisplayName, userId: creator.id, score: 0, matches: 0}];

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
        );

        if (input === null) return redirectToLobby();
        const trimmedInput = input.trim().toLowerCase();
        if (trimmedInput === "") {
            alert("❌ Please select a valid player or enter a guest username.");
            continue;
        }

        let playerId, displayName;

        // Handle logged-in player
        const loggedInPlayer = potentialPlayers.find(p => p.id.toString() === trimmedInput);
        if (loggedInPlayer) {
            playerId = loggedInPlayer.id;
            displayName = loggedInPlayer.username;

            // Prompt for custom display name
            const customName = prompt(
                `Enter a custom display name for ${displayName} (press OK to keep default, or enter a new name):`,
                displayName
            );

            if (customName === null) return redirectToLobby();
            const trimmedCustomName = customName.trim();
            if (trimmedCustomName !== "" && trimmedCustomName.toLowerCase() !== displayName.toLowerCase()) {
                if (players.some(p => p.name.toLowerCase() === trimmedCustomName.toLowerCase())) {
                    alert(`❌ Display name "${trimmedCustomName}" is already used. Please choose a unique name.`);
                    continue;
                }
                displayName = trimmedCustomName;
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
        displayName = trimmedInput;
        if (players.some(p => p.name.toLowerCase() === displayName.toLowerCase())) {
            alert(`❌ Username "${displayName}" is already used. Please enter a unique username.`);
            continue;
        }

        const guestResponse = await apiRequest('get-guest-id/', "GET", null);

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
    return {players, winningScore, state: "table", tournamentId};
};

const startTournament = async (tournament) => {
    const creator = tournament.players.find(player => player.name === tournament.players[0].name);
    if (!creator || !creator.userId) {
        console.error("Cannot start tournament: Creator not found or not logged in");
        alert("❌ Cannot start tournament: Creator not logged in.");
        return;
    }

    const startResponse = await apiRequest(
        `tournaments/${tournament.tournamentId}/start/?user_id=${creator.userId}`,
        "PATCH");
    if (startResponse.errors) {
        console.error(
            `Failed to start tournament for ${creator.name} (user_id=${creator.userId}):`,
            startResponse.errors);
        alert(`❌ Failed to start tournament: ${JSON.stringify(startResponse.errors)}`);
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
    setupControls(game.player, game.player2, game);
    setupWindowEvents(game);
    initializeUpcomingMatches(tournament);
    tournamentLoop(tournament, game, response.game_id);
};

const initializeUpcomingMatches = (tournament) => {
    tournament.upcomingMatches = [];
    for (let i = 0; i < tournament.players.length - 2; i += 2)
        createMatch(tournament.upcomingMatches, tournament.players[i], tournament.players[i + 1]);
    if (tournament.players.length % 2 !== 0)
        createMatch(tournament.upcomingMatches, tournament.players[tournament.players.length - 1]);
};

const createMatch = (upcomingMatches, p1, p2 = null) => {
    upcomingMatches.push({ player1: p1, player2: p2});
};

const addWinnerToNextMatch = (upcomingMatches, winner) => {
    const lastMatch = upcomingMatches[upcomingMatches.length - 1];
    lastMatch.player2 == null ? lastMatch.player2 = winner : createMatch(upcomingMatches, winner);
}
const tournamentLoop = async (tournament, game, game_id) => {
    const processMatchResult = () => {
        winner = game.player.score > game.player2.score ? tournament.upcomingMatches[0].player1 : tournament.upcomingMatches[0].player2;
        addWinnerToNextMatch(tournament.upcomingMatches, winner);
        tournament.upcomingMatches.shift();
        return winner;
    };

    const checkTournamentEnd = (winner) => {
        if (tournament.upcomingMatches[0].player2 == null) {
            tournament.state = 'gameOver';
            drawWinner(winner, game.canvas);
            saveTournamentStats(tournament.tournamentId, winner.userId);
            waitForButton('x', () => {window.location.hash = 'lobby';});
            return true;
        }
        return false;
    };

    switch (tournament.state) {
        case 'table':
            drawTable(game.canvas, tournament.upcomingMatches);
            waitForButton('enter', () => {
                tournament.state = 'prepare';
                tournamentLoop(tournament, game, game_id);
            });
            break;

        case 'prepare':
            drawMatch(game.canvas, tournament.upcomingMatches[0]);
            waitForButton('enter', () => {
                tournament.state = 'playing';
                game.state = 'wallSelection';
                tournamentLoop(tournament, game, game_id);
            });
            break;

        case 'playing':
            startGameLoop(game, () => {
                winner = processMatchResult();
                if (!checkTournamentEnd(winner)) {
                    tournament.state = 'table';
                    resetGame(game);
                    tournamentLoop(tournament, game, game_id);
                }});
            break;
    }
};

const drawTable = (canvas, upcomingMatches) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.textAlign = 'center';
    context.fillText('Tournament', canvas.width / 2, 30);

    let y = 100;
    // Draw upcoming matches
    context.font = '20px Arial';
    y = 100;
    context.fillText('Upcoming Matches:', canvas.width / 2, 70);
    for (const match of upcomingMatches) {
        player2 = match.player2 ? match.player2.name : "?";
        context.fillText(`${match.player1.name} vs ${player2}`,canvas.width / 2, y);
        y += 30;
    }
    context.font = '30px Arial';
    context.fillText('Press Enter to start', canvas.width / 2, 280);
};

const drawMatch = (canvas, match) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.textAlign = 'center';

    // Draw current match
    context.fillText('Match', canvas.width / 2, 30);
    context.fillText(`${match.player1.name} vs ${match.player2.name}`, canvas.width / 2, 100);
    context.fillText('Press Enter to start', canvas.width / 2, 280);
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

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
            return !isNaN(score) && score > 0 && score <= 100 ? score : null;
        },
        "❌ Winning score must be a positive integer up to 100."
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
    );

    if (creatorCustomName === null) return redirectToLobby();
    const trimmedCreatorName = creatorCustomName.trim();
    if (trimmedCreatorName !== "" && trimmedCreatorName.toLowerCase() !== creatorUsername.toLowerCase()) {
        creatorDisplayName = trimmedCreatorName;
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
    // setupTournamentControls(tournament);
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

const initializeUpcomingMatches = (tournament) => {
    if (tournament.upcomingMatches) return;
    
    tournament.upcomingMatches = [];
    const playerCount = tournament.players.length;
    
    const createMatch = (p1, p2 = "?") => ({
        player1: p1.name,
        player2: p2 === "?" ? p2 : p2.name
    });

    if (playerCount === 5) {
        tournament.upcomingMatches = [
            createMatch(tournament.players[0], tournament.players[1]),
            createMatch(tournament.players[2], tournament.players[3]),
            createMatch(tournament.players[4]) // Bye
        ];
    } else if (playerCount === 6) {
        tournament.upcomingMatches = [
            createMatch(tournament.players[0], tournament.players[1]),
            createMatch(tournament.players[2], tournament.players[3]),
            createMatch(tournament.players[4], tournament.players[5])
        ];
    } else {
        for (let i = 0; i < tournament.players.length - 1; i += 2) {
            tournament.upcomingMatches.push(
                createMatch(tournament.players[i], tournament.players[i + 1])
            );
        }
        if (tournament.players.length % 2 !== 0) {
            tournament.upcomingMatches.push(
                createMatch(tournament.players[tournament.players.length - 1])
            );
        }
    }
};

const tournamentLoop = async (tournament, game, currentMatchIndex, game_id) => {
    
    const processMatchResult = () => {
        const determineWinner = () => {
            return game.player.score > game.player2.score
                ? { winner: tournament.players[currentMatchIndex], loser: tournament.players[currentMatchIndex + 1] }
                : { winner: tournament.players[currentMatchIndex + 1], loser: tournament.players[currentMatchIndex] };
        };

        const { winner, loser } = determineWinner();
        winner.score++;
        tournament.players = tournament.players.filter(player => player !== loser);

        if (tournament.upcomingMatches.length > 0) {
            tournament.upcomingMatches.splice(Math.floor(currentMatchIndex / 2), 1);
        }

        return winner;
    };

    const setupNextRound = (winner) => {
        const setupSpecialRound = (count, currentCount) => {
            if (count === 5 && currentCount === 3) {
                tournament.upcomingMatches = [
                    { player1: tournament.players[0].name, player2: tournament.players[1].name },
                    { player1: tournament.players[2].name, player2: "?" }
                ];
            } else if (count === 6) {
                if (currentCount === 3) {
                    // After first round (3 winners)
                    tournament.upcomingMatches = [
                        { player1: tournament.players[0].name, player2: tournament.players[1].name },
                        { player1: tournament.players[2].name, player2: "?" }
                    ];
                } else if (currentCount === 2) {
                    // After semifinals (2 winners)
                    tournament.upcomingMatches = [
                        { player1: tournament.players[0].name, player2: tournament.players[1].name }
                    ];
                }
            }
        };
        console.log("player0: ", tournament.players[0].name);
        if ([5, 6].includes(tournament.allPlayers.length)) {
            setupSpecialRound(tournament.allPlayers.length, tournament.players.length);
        } else {
            // Standard bracket progression
            const upcomingWithQuestion = tournament.upcomingMatches.find(m => m.player2 === "?");
            if (upcomingWithQuestion) {
                upcomingWithQuestion.player2 = winner.name;
            } else if (tournament.players.length > 1) {
                tournament.upcomingMatches.push({ player1: winner.name, player2: "?" });
            }
        }
    };

    const checkTournamentEnd = () => {
        if (tournament.players.length === 1) {
            tournament.state = 'gameOver';
            drawWinner(tournament.players[0], game.canvas);
            saveTournamentStats(tournament.tournamentId, tournament.players[0].userId);
            waitForButton('x', () => {
                window.location.hash = 'lobby';
            });
            return true;
        }
        return false;
    };

    if (!tournament.upcomingMatches) initializeUpcomingMatches(tournament);
    if (tournament.isTournamentRunning === false) return;

    switch (tournament.state) {
        case 'table':
            tournament.upcomingMatches.forEach(match => {
                if (match.player2 === "?") {
                    const waitingPlayer = tournament.players.find(p => 
                        !tournament.upcomingMatches.some(m => 
                            m.player1 === p.name || m.player2 === p.name
                        )
                    );
                    if (waitingPlayer) match.player2 = waitingPlayer.name;
                }
            });
            drawTable(tournament.players, game.canvas, tournament.upcomingMatches);
            waitForButton('enter', () => {
                tournament.state = 'prepare';
                tournamentLoop(tournament, game, currentMatchIndex, game_id);
            });
            break;

        case 'prepare':
            drawMatch(tournament.players, game.canvas, currentMatchIndex, tournament.upcomingMatches);
            waitForButton('enter', () => {
                tournament.state = 'playing';
                game.state = 'wallSelection';
                tournamentLoop(tournament, game, currentMatchIndex, game_id);
            });
            break;

        case 'playing':
            startGameLoop(game, () => {
                const winner = processMatchResult();
                setupNextRound(winner);

                currentMatchIndex++;
                if (currentMatchIndex >= tournament.players.length - 1) {
                    console.log("New round");
                    currentMatchIndex = 0;
                    if (tournament.players.length % 2 === 1) {
                        // Move the last player to the first position
                        const lastPlayer = tournament.players.pop(); // Remove the last player
                        tournament.players.unshift(lastPlayer); // Add the last player to the beginning
                        console.log("1player0: ", tournament.players[0].name);
                        tournament.upcomingMatches = null;
                        initializeUpcomingMatches(tournament);
                    }
                }

                if (!checkTournamentEnd()) {
                    tournament.state = 'table';
                    resetGame(game);
                    tournamentLoop(tournament, game, currentMatchIndex, game_id);
                }
            });
            break;
    }
};

const drawTable = (players, canvas, upcomingMatches) => {
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
        context.fillText(`${match.player1} vs ${match.player2}`,canvas.width / 2, y);
        y += 30;
    }
    context.font = '30px Arial';
    context.fillText('Press Enter to start', canvas.width / 2, 280);
};

const drawMatch = (players, canvas, matchIndex) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = '#fff';
    context.textAlign = 'center';

    // Draw current match
    context.fillText('Match', canvas.width / 2, 30);
    const player2Name = players[matchIndex + 1] ? players[matchIndex + 1].name : "?";
    context.fillText(
        `${players[matchIndex].name} vs ${player2Name}`,
        canvas.width / 2,
        100
    );
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

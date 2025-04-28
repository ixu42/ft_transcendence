const setupGameJs = async () => {
    try {
        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        const type = params.get("type") || "local";  // Default: Local game
        const mode = params.get("mode") || "1v1";    // Default: 1v1 mode
        let opponentId = null;
        let currentUserId = localStorage.getItem("user_id");
        const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);

        const selectUserForGame = () => {
            const userOptions = loggedInUsers
                .map(user => `${user.id}: ${user.username}`)
                .join("\n");
            const selected = window.prompt(
                "Please enter your user ID to create the game:\n" + userOptions
            );
            if (!selected) {
                window.location.hash = "#lobby";
                return null;
            }
            return selected.trim();
        };

        if (loggedInUsers.length === 0) {
            alert("Please log in to play a game 🏓");
            window.location.href = "#login";
            return;
        }

        if (loggedInUsers.length === 1) {
            currentUserId = loggedInUsers[0].id;
            if (mode === "1v1" || mode === "ai") {
                opponentId = "guest";
            }
        } else {
            const selectedUser = selectUserForGame();
            if (!selectedUser) return;
            currentUserId = selectedUser;
        }

        if ((mode === "1v1" || mode === "ai") && opponentId !== "guest") {
            const potentialOpponents = loggedInUsers.filter(
                user => user.id.toString() !== currentUserId.toString()
            );
            let opponentOptions = potentialOpponents
                .map(user => `${user.id}: ${user.username}`)
                .join("\n");
            opponentOptions += "\nguest: Guest";

            const selectedOpponent = window.prompt(
                `Select an opponent for the ${mode.toUpperCase()} game:\n` + opponentOptions
            );
            if (!selectedOpponent) {
                window.location.hash = "#lobby";
                return;
            }
            opponentId = selectedOpponent.trim();
        }

        let response;
        console.log(`🎮 Starting ${type.toUpperCase()} | Mode: ${mode.toUpperCase()} for user ${currentUserId}`);

        if (type === "online") {
            initializeOnlineGame(mode);
        } else if (type === "local") {
            switch (mode) {
                case "tournament":
                    response = await apiRequest(`tournaments/?user_id=${currentUserId}`, "POST", {
                        tournament_name: `${loggedInUsers.find(u => u.id == currentUserId).username}'s tournament`,
                        display_name: loggedInUsers.find(u => u.id == currentUserId).username
                    });
                    if (response.error) { throw new Error(response.error); }
                    initializeTournament(response, currentUserId);
                    break;
                case "1v1":
                    if (opponentId === "guest") {
                        response = await apiRequest(`users/${currentUserId}/games/local/guest/`, "POST");
                    } else {
                        response = await apiRequest(`users/${currentUserId}/games/local/?user_id=${opponentId}`, "POST");
                    }
                    if (response.error) { throw new Error(response.error); }
                    initializeGame(response.game_id, currentUserId, opponentId);
                    break;
                case "ai":
                    response = await apiRequest(`users/${currentUserId}/games/ai/`, "POST");
                    if (response.error) { throw new Error(response.error); }
                    initializeAIGame(response.game_id, currentUserId, opponentId);
                    break;
                default:
                    console.error(`❌ Unknown game mode: ${mode}`);
                    initializeGame(response.game_id);
            }
        } else {
            console.error(`❌ Unknown game type: ${type}`);
        }
    } catch (error) {
        console.error("Error setting up the game:", error);
    }
};




async function saveGameStats(gameId, player1Score, player2Score, userId)
{
    const body = {
        player1_score: player1Score,
        player2_score: player2Score,
    };

    const response = await apiRequest(`users/${userId}/games/${gameId}/stats/`, 'PATCH', body);
    if (response.message === 'Game stats saved.') {
        console.log('Game stats saved successfully');
    } else {
        console.log('Failed to save game stats:', response.error || response.errors);
    }
}

async function saveTournamentStats(tournamentId, winnerId) {
    try {
        const response = await fetch(
            `/api/tournaments/${tournamentId}/stats/?user_id=${encodeURIComponent(winnerId)}`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': await getCSRFCookie(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ winner_id: winnerId })
            }
        );
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error saving tournament stats:', errorData);
            alert(`Failed to save tournament stats: ${errorData.errors || response.statusText}`);
            return;
        }
        console.log('Tournament stats saved successfully!');
    } catch (error) {
        console.error('Error saving tournament stats:', error);
        alert('Something went wrong while saving tournament stats.');
    }
}


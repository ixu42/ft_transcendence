

const setupGameJs = async () => {
    try {
        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        const type = params.get("type") || "local";  // Default: Local game
        const mode = params.get("mode") || "1v1";      // Default: 1v1 mode
        let response;

        console.log(`🎮 Starting ${type.toUpperCase()} | Mode: ${mode.toUpperCase()}`);

        if (type === "online") {
            initializeOnlineGame(mode);
        } else if (type === "local") {
            switch (mode) {
                case "tournament":
                    response = await apiRequest('games/local/', 'POST');
                    if (response.error) { throw new Error(response.error); }
                    initializeTournament(response.game_id);
                    break;
                case "1v1":
                    response = await apiRequest('games/local/', 'POST');
                    if (response.error) { throw new Error(response.error); }
                    initializeGame(response.game_id);
                    break;
                case "ai":
                    response = await apiRequest('games/ai/', 'POST');
                    if (response.error) { throw new Error(response.error);}
                    initializeAIGame(response.game_id);
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

async function saveGameStats(gameId, player1Score, player2Score)
{
    const body = {
        player1_score: player1Score,
        player2_score: player2Score,
    };

    const response = await apiRequest(`${gameId}/stats/`, 'PATCH', body);
    if (response.message === 'Game stats saved.') {
        console.log('Game stats saved successfully');
    } else {
        console.log('Failed to save game stats:', response.error || response.errors);
    }
}

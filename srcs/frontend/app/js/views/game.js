

const setupGameJs = () => {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const type = params.get("type") || "local";  // Default: Local game
    const mode = params.get("mode") || "1v1";    // Default: 1v1 mode

    console.log(`🎮 Starting ${type.toUpperCase()} | Mode: ${mode.toUpperCase()}`);

    setTimeout(() => {
        const canvas = document.getElementById("pong");
        if (!canvas) {
            console.error("❌ Pong canvas not found! Game cannot start.");
            return;
        }

        switch (type) {
            case "online":
                initializeOnlineGame(mode);
                break;
            case "local":
                switch (mode)
                {
                    case "tournament":
                        initializeTournament();
                        break;
                    case "1v1":
                        initializeGame();
                        break;
                    case "ai":
                        initializeAIGame();
                        break;
                    default:
                        console.error(`❌ Unknown game mode: ${mode}`);
                        initializeGame();
                }
                break;
            default:
                console.error(`❌ Unknown game type: ${type}`);
        }
    }, 100);
};


async function apiRequest(endpoint, method, body = null) {
    const url = `api/${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
    };
    const csrfToken = await getCSRFCookie();
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }
    const options = {
        method: method,
        headers: headers,
        credentials: "include",
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${JSON.stringify(errorData.errors || errorData.message)}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Request failed:', error);
        return { error: error.message };
    }
}

async function createAiGame() {
    const response = await apiRequest('games/ai/', 'POST');
    if (response.message === 'AI game created.') {
        console.log('AI Game created successfully with Game ID:', response.game_id);
        return response.game_id;
    }
    console.log('Failed to create AI game:', response.error || response.errors);
}


async function saveGameStats(gameId, player1Score, player2Score) {
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

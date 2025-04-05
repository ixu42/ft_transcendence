

const setupGameJs = async () => {
    try {
      const params = new URLSearchParams(window.location.hash.split("?")[1]);
      const type = params.get("type") || "local";  // Default: Local game
      const mode = params.get("mode") || "1v1";      // Default: 1v1 mode
  
      let currentUserId;
      const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);

      if (loggedInUsers.length === 0) {
        alert("Please log in to play a game 🏓");
        window.location.href = "#login";
        return;
      }
      else if (loggedInUsers.length === 1) {
        currentUserId = loggedInUsers[0].id;
      }
      else if (loggedInUsers.length > 1) {
        const userOptions = loggedInUsers
          .map(user => `${user.id}: ${user.username}`)
          .join("\n");
        const selected = window.prompt(
          "Multiple users are logged in. Please enter your user ID for the game:\n" + userOptions
        );
        if (selected) {
          currentUserId = selected.trim();
        }
      }
  
      let opponentId = null;
      if (mode === "1v1" || mode === "ai") {
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
        if (selectedOpponent) {
          opponentId = selectedOpponent.trim();
        }
      }
  
      let response;
      console.log(`🎮 Starting ${type.toUpperCase()} | Mode: ${mode.toUpperCase()} for user ${currentUserId}`);
      
      if (type === "online") {
        initializeOnlineGame(mode);
      } else if (type === "local") {
        switch (mode) {
          case "tournament":
            response = await apiRequest(`users/${currentUserId}/games/local/`, 'POST');
            if (response.error) { throw new Error(response.error); }
            initializeTournament(response.game_id);
            break;
          case "1v1":
            response = await apiRequest(`users/${currentUserId}/games/local/`, 'POST');
            if (response.error) { throw new Error(response.error); }
            initializeGame(response.game_id, currentUserId, opponentId);
            break;
          case "ai":
            response = await apiRequest(`users/${currentUserId}/games/ai/`, 'POST');
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

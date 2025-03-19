const setupControls = async (player, player2, game, gameId) => {
    document.addEventListener('keydown', async (event) => {
        const key = event.key.toLowerCase();
        key === 'arrowup' ? player2.keyboardUp = true :
            key === 'arrowdown' ? player2.keyboardDown = true :
            key === 'w' ? player.keyboardUp = true :
            key === 's' ? player.keyboardDown = true : null;
        if (key === ' ' || key === 'escape')
        {
            if (game.state == 'pause')
                game.state = game.lastState;
            else if (game.state == 'game')
            {
                game.lastState = game.state;
                game.state = "pause";
            }
        } 
         // Prepare state handling
         if (game.state === 'prepare') {
            game.state = 'game';
        }

        if (game.state === 'scoreSelection') {
            if (key === '1') {
                game.winningScore = 3;
                game.state = 'prepare';
            } else if (key === '2') {
                game.winningScore = 7;
                game.state = 'prepare';
            } else if (key === '3') {
                game.winningScore = -1;
                game.state = 'prepare';
            }
        }

        if (game.state === 'gameOver') {
            if (key === 'x') {
                if (localStorage.getItem("isLoggedIn") === "true") {
                   await saveGameStats(gameId, player.score, player2.score);
                }
                window.location.href = "/#lobby"; // Adjust the URL to your lobby page
            }
        }
        
    });

    document.addEventListener('keyup', function(event) {
        const key = event.key.toLowerCase();
        key === 'arrowup' ? player2.keyboardUp = false :
            key === 'arrowdown' ? player2.keyboardDown = false :
            key === 'w' ? player.keyboardUp = false :
            key === 's' ? player.keyboardDown = false : null;
    });
}

const setupTournamentControls = (tournament) => {
    document.addEventListener('keydown', function(event) {
        const key = event.key.toLowerCase();
        key === 'enter' ? tournament.keyboardEnter = true : null;
    });
}

const setupAILevelControls = (game) => {
    document.addEventListener('keydown', function(event) {
        if (game.state === 'levelSelection') {
            if (event.key === '1') {
                game.aiLevel = 'easy';
                game.state = 'scoreSelection';
            } else if (event.key === '2') {
                game.aiLevel = 'medium';
                game.state = 'scoreSelection';
            } else if (event.key === '3') {
                game.aiLevel = 'hard';
                game.state = 'scoreSelection';
            }
            console.log("AI Level: " + game.aiLevel);
        }
    });
}
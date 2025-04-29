const setupControls = async (player, player2, game) => {
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
            else
                pauseIfGame(game); // Pause the game if the space bar or escape is pressed
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

const waitForSelection = (callback) => {
    console.log('Waiting for selection...');
    document.addEventListener('keydown', function thisEvent(event) {
        if (event.key.toLowerCase() === '1' || event.key.toLowerCase() === '2' || event.key.toLowerCase() === '3') {
            console.log('Selection made:', event.key.toLowerCase());
            document.removeEventListener('keydown', thisEvent); // Remove the event listener to prevent multiple triggers
            callback(event.key.toLocaleLowerCase());
        }
    });
}

const waitForWallSelection = (callback) => {
    document.addEventListener('keydown', function thisEvent(event) {
        if (event.key.toLowerCase() === '1' || event.key.toLowerCase() === '2') {
            document.removeEventListener('keydown', thisEvent); // Remove the event listener to prevent multiple triggers
            callback(event.key.toLocaleLowerCase());
        }
    });
}

const waitForButton = (button, callback) => {
    document.addEventListener('keydown', function thisEvent(event) {
        if (event.key.toLowerCase() === button) {
            document.removeEventListener('keydown', thisEvent); // Remove the event listener to prevent multiple triggers
            callback();
        }
    });
}

const waitForAnyButton = (callback) => {
    document.addEventListener('keydown', function thisEvent(event) {
        document.removeEventListener('keydown', thisEvent); // Remove the event listener to prevent multiple triggers
        callback();
    });
}
const setupWindowEvents = (game) => {
    window.addEventListener('beforeunload', () => {
        game.isGameRunning = false;
    });
    window.addEventListener('popstate', () => {
        game.isGameRunning = false;
    });

    document.addEventListener('visibilitychange', () => {
        pauseIfGame(game); // Pause the game if the tab is not visible
    });

    window.addEventListener('blur', () => {
        pauseIfGame(game); // Pause the game if the window loses focus
    });
}

const setupWindowEventsTournament = (tournament) => {
    window.addEventListener('beforeunload', () => {
        tournament.isTournamentRunning = false;
    });
    window.addEventListener('popstate', () => {
        tournament.isTournamentRunning = false;
    });
}

const pauseIfGame = (game) => {
    if (game.state === 'game') {
        game.lastState = game.state; // Save the current state
        game.state = 'pause'; // Pause the game
    }
}
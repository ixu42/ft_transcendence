const addEventListener = (eventListeners, element, type, listener) => {
    element.addEventListener(type, listener);
    eventListeners.push({ element, type, listener });
};

const removeEventListener = (eventListeners, element, type, listener) => {
    element.removeEventListener(type, listener);
    const index = eventListeners.findIndex(
        (entry) => entry.element === element && entry.type === type && entry.listener === listener
    );
    if (index !== -1) {
        eventListeners.splice(index, 1); // Remove the listener from the array
    }
};

const removeAllEventListeners = (eventListeners) => {
    eventListeners.forEach(({ element, type, listener }) => {
        element.removeEventListener(type, listener);
    });
    eventListeners.length = 0; // Clear the array after removing all listeners
    console.log("All controls removed.");
};

const setupGameControls = async (player, player2, game) => {
    const keydownHandler = async (event) => {
        const key = event.key.toLowerCase();
        key === 'arrowup' ? player2.keyboardUp = true :
            key === 'arrowdown' ? player2.keyboardDown = true :
            key === 'w' ? player.keyboardUp = true :
            key === 's' ? player.keyboardDown = true : null;
        if (key === ' ' || key === 'escape') {
            pauseIfGame(game); // Pause the game if the space bar or escape is pressed
        }
    };
    const keyupHandler = async (event) => {
        const key = event.key.toLowerCase();
        key === 'arrowup' ? player2.keyboardUp = false :
            key === 'arrowdown' ? player2.keyboardDown = false :
            key === 'w' ? player.keyboardUp = false :
            key === 's' ? player.keyboardDown = false : null;
    };

    const beforeUnloadHandler = () => {
        game.isGameRunning = false;
        removeAllEventListeners(game.eventListeners);
    };

    const popStateHandler = () => {
        game.isGameRunning = false;
        removeAllEventListeners(game.eventListeners);
    };

    const visibilityChangeHandler = () => {
        pauseIfGame(game); // Pause the game if the tab is not visible
    };

    const blurHandler = () => {
        pauseIfGame(game); // Pause the game if the window loses focus
    };
    
    addEventListener(game.eventListeners, document, 'keydown', keydownHandler);
    addEventListener(game.eventListeners, document, 'keyup', keyupHandler);
    addEventListener(game.eventListeners, window, 'beforeunload', beforeUnloadHandler);
    addEventListener(game.eventListeners, window, 'popstate', popStateHandler);
    addEventListener(game.eventListeners, document, 'visibilitychange', visibilityChangeHandler);
    addEventListener(game.eventListeners, window, 'blur', blurHandler);
};


const waitForSelection = (game, callback) => {
    const selectionHandler = (event) => {
        const key = event.key.toLowerCase();
        if (key === '1' || key === '2' || key === '3') {
            console.log('Selection made:', key);
            removeEventListener(game.eventListeners, document, 'keydown', selectionHandler); 
            callback(key);
        }
    };
    addEventListener(game.eventListeners, document, 'keydown', selectionHandler);
};

const waitForWallSelection = (game, callback) => {
    const wallSelectionHandler = (event) => {
        const key = event.key.toLowerCase();
        if (key === '1' || key === '2') {
            console.log('Wall option selected:', key);
            removeEventListener(game.eventListeners, document, 'keydown', wallSelectionHandler);
            callback(key);
        }
    };
    addEventListener(game.eventListeners, document, 'keydown', wallSelectionHandler);
};

const waitForButton = (game, button, callback) => {
    const buttonHandler = (event) => {
        const key = event.key.toLowerCase();
        if (key === button) {
            console.log('Button pressed:', button);
            removeEventListener(game.eventListeners, document, 'keydown', buttonHandler);
            callback();
        }
    };
    addEventListener(game.eventListeners, document, 'keydown', buttonHandler);
};

const waitForAnyButton = (game, callback) => {
    const anyButtonHandler = (event) => {
        console.log('Any button pressed:', event.key);
        removeEventListener(game.eventListeners, document, 'keydown', anyButtonHandler);
        callback();
    };
    addEventListener(game.eventListeners, document, 'keydown', anyButtonHandler);
};

const pauseIfGame = (game) => {
    if (game.state === 'game') {
        game.lastState = game.state; // Save the current state
        game.state = 'pause'; // Pause the game
    }
}
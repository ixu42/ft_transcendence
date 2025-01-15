function setupControls(player, player2, game) {
    document.addEventListener('keydown', function(event) {
        const key = event.key.toLowerCase();
        key === 'arrowup' ? player2.keyboardUp = true :
            key === 'arrowdown' ? player2.keyboardDown = true :
            key === 'w' ? player.keyboardUp = true :
            key === 's' ? player.keyboardDown = true :
            key === ' ' || key === 'escape' ? game.pause = !(game.pause) : 
            null;
    });

    document.addEventListener('keyup', function(event) {
        const key = event.key.toLowerCase();
        key === 'arrowup' ? player2.keyboardUp = false :
            key === 'arrowdown' ? player2.keyboardDown = false :
            key === 'w' ? player.keyboardUp = false :
            key === 's' ? player.keyboardDown = false : null;
    });
}
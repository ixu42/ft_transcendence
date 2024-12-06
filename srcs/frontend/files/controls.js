function setupControls(player, player2) {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp') {
            player.keyboardUp = true;
        } else if (event.key === 'ArrowDown') {
            player.keyboardDown = true;
        } else if (event.key.toLowerCase() === 'w') {
            player2.keyboardUp = true;
        } else if (event.key.toLowerCase() === 's') {
            player2.keyboardDown = true;
        }
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowUp') {
            player.keyboardUp = false;
        } else if (event.key === 'ArrowDown') {
            player.keyboardDown = false;
        } else if (event.key.toLowerCase() === 'w') {
            player2.keyboardUp = false;
        } else if (event.key.toLowerCase() === 's') {
            player2.keyboardDown = false
        }
    });
}
function setupControls(player) {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp') {
            player.keyboardUp = true;
        } else if (event.key === 'ArrowDown') {
            player.keyboardDown = true;
        }
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowUp') {
            player.keyboardUp = false;
        } else if (event.key === 'ArrowDown') {
            player.keyboardDown = false;
        }
    });
}




document.addEventListener('DOMContentLoaded', () => {
    const startLocalBtn = document.getElementById('start-local-btn');

    startLocalBtn.addEventListener('click', () => {
        window.location.href = 'game.html';
    });

    const startOnlineBtn = document.getElementById('start-online-btn');
    startOnlineBtn.addEventListener('click', () => {
        alert('Online game functionality is coming soon!');
    });
});



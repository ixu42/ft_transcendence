document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');

    playBtn.addEventListener('click', () => {
        window.location.hash = "#lobby";
    });
});

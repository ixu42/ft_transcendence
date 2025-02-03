document.addEventListener("view-changed", (event) => {
    if (event.detail.path === "#lobby") {
        setupLobby();
    }
});

const setupLobby = () => {
    console.log("🏠 Lobby Loaded");
    bindLobbyEventListeners();
};

const bindLobbyEventListeners = () => {
    document.getElementById("start-local-btn")?.addEventListener("click", showGameModal);
    document.getElementById("start-online-btn")?.addEventListener("click", () => alert("🌍 Online mode coming soon!"));
};

const showGameModal = () => {
    const modal = document.getElementById("game-modal");
    if (!modal) {
        console.error("Game modal not found!");
        return;
    }

    modal.style.display = "flex";
    document.getElementById("start-tournament-btn")?.addEventListener("click", () => startGame("local", "tournament"));
    document.getElementById("start-1v1-btn")?.addEventListener("click", () => startGame("local", "1v1"));
    document.getElementById("cancel-game")?.addEventListener("click", () => (modal.style.display = "none"));
};

const startGame = (type, mode) => {
    window.location.hash = `#game?type=${type}&mode=${mode}`;
};

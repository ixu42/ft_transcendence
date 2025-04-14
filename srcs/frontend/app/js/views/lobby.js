const setupLobbyJs = () => {
    console.log("🏠 Lobby Loaded");
    bindLobbyEventListeners();
};

const bindLobbyEventListeners = () => {
    document.getElementById("start-local-btn")?.addEventListener("click", showGameModal);
};

const showGameModal = () => {
    const modalOverlay = document.getElementById("game-mode-modal-overlay");
    const gameModal = document.getElementById("game-mode-modal");

    if (!modalOverlay || !gameModal) {
        console.error("❌ Game modal not found!");
        return;
    }

    modalOverlay.style.display = "flex";
    gameModal.style.display = "block";

    // Event listeners for the game mode buttons
    document.getElementById("start-tournament-btn")?.addEventListener("click", () => startGame("local", "tournament"));
    document.getElementById("start-1v1-btn")?.addEventListener("click", () => startGame("local", "1v1"));
    document.getElementById("start-ai-btn")?.addEventListener("click", () => startGame("local", "ai"));
    document.getElementById("close-btn")?.addEventListener("click", closeGameModal);

    // Close modal if overlay is clicked
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) {
            closeGameModal();
        }
    });
};

const closeGameModal = () => {
    const modalOverlay = document.getElementById("game-mode-modal-overlay");
    const gameModal = document.getElementById("game-mode-modal");

    if (modalOverlay) modalOverlay.style.display = "none";
    if (gameModal) gameModal.style.display = "none";
};

const startGame = (type, mode) => {
    closeGameModal();
    window.location.hash = `#game?type=${type}&mode=${mode}`;
};

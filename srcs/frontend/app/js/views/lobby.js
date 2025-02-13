
const setupLobby = () => {
    console.log("🏠 Lobby Loaded");
    bindLobbyEventListeners();
};

const bindLobbyEventListeners = () => {
    document.getElementById("start-local-btn")?.addEventListener("click", showGameModal);
    document.getElementById("start-online-btn")?.addEventListener("click", () => alert("🌍 Online mode coming soon!"));
};

const showGameModal = () => {
    const modalOverlay = document.getElementById("modal-overlay");
    const gameModal = document.getElementById("game-modal");

    if (!modalOverlay || !gameModal) {
        console.error("❌ Game modal not found!");
        return;
    }

    modalOverlay.style.display = "flex";
    gameModal.style.display = "block";

    document.getElementById("start-tournament-btn")?.addEventListener("click", () => startGame("local", "tournament"));
    document.getElementById("start-1v1-btn")?.addEventListener("click", () => startGame("local", "1v1"));
    document.getElementById("close-btn")?.addEventListener("click", closeGameModal);

    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) {
            closeGameModal();
        }
    });
};

const closeGameModal = () => {
    const modalOverlay = document.getElementById("modal-overlay");
    const gameModal = document.getElementById("game-modal");

    if (modalOverlay) modalOverlay.style.display = "none";
    if (gameModal) gameModal.style.display = "none";
};

const startGame = (type, mode) => {
    closeGameModal();
    window.location.hash = `#game?type=${type}&mode=${mode}`;
};
const setupDashyJs = () => {
    bindDashyEventListeners();
};

const bindDashyEventListeners = () => {
    const startUserBtn = document.getElementById("start-user-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    const loggedInUsers = getLoggedInUsers();
    const hasLoggedInUsers = loggedInUsers.some(user => user.loggedIn);

    // Function to show login prompt
    const showLoginPrompt = () => {
        alert("You need to be logged in to view these stats.");
    };

    // Remove any existing login message to avoid duplicates
    const existingMessage = document.getElementById("login-message");
    if (existingMessage) {
        existingMessage.remove();
    }

    if (!hasLoggedInUsers) {
        // Create and insert login message
        const loginMessage = document.createElement("p");
        loginMessage.id = "login-message";
        loginMessage.textContent = "Log in to view these stats";
        loginMessage.style.marginBottom = "10px"; // Optional: Add some spacing
        loginMessage.style.color = "#ff4444"; // Optional: Make it stand out (red color)
        loginMessage.style.fontWeight = "bold"; // Optional: Make it bold

        // Insert the message before the first button
        if (startUserBtn && startUserBtn.parentNode) {
            startUserBtn.parentNode.insertBefore(loginMessage, startUserBtn);
        } else if (startGameBtn && startGameBtn.parentNode) {
            startGameBtn.parentNode.insertBefore(loginMessage, startGameBtn);
        }

        // Disable buttons if no user is logged in
        if (startUserBtn) {
            startUserBtn.disabled = true;
            startUserBtn.addEventListener("click", showLoginPrompt);
        }
        if (startGameBtn) {
            startGameBtn.disabled = true;
            startGameBtn.addEventListener("click", showLoginPrompt);
        }
        console.warn("⚠️ No logged-in users. Buttons disabled.");
        return;
    }

    // Enable buttons and bind normal functionality if users are logged in
    if (startUserBtn) {
        startUserBtn.disabled = false;
        startUserBtn.addEventListener("click", showUserStatsModal);
    }
    if (startGameBtn) {
        startGameBtn.disabled = false;
        startGameBtn.addEventListener("click", showGameStatsModal);
    }
};

const showUserStatsModal = () => {
    const userstatsmodaloverlay = document.getElementById("userstats-mode-modal-overlay");
    const userstatsmodal = document.getElementById("userstats-mode-modal");

    if (!userstatsmodaloverlay || !userstatsmodal) {
        console.error("❌ user stats modal not found!");
        return;
    }

    userstatsmodaloverlay.style.display = "flex";
    userstatsmodal.style.display = "block";

    // event listeners for the game mode buttons
    document.getElementById("one-user-stat-btn")?.addEventListener("click", () => showUserStats("overview"));
    document.getElementById("two-user-stat-btn")?.addEventListener("click", () => showUserStats("history"));
    document.getElementById("thr-user-stat-btn")?.addEventListener("click", () => showUserStats("modes"));
    document.getElementById("close-user-btn")?.addEventListener("click", closeUserStatsModal);

    // close modal if overlay is clicked
    userstatsmodaloverlay.addEventListener("click", (event) => {
        if (event.target === userstatsmodaloverlay) {
            closeUserStatsModal();
        }
    });
};

const showGameStatsModal = () => {
    const gameStatsmodalOverlay = document.getElementById("gamestats-mode-modal-overlay");
    const gameStatsModal = document.getElementById("gamestats-mode-modal");

    if (!gameStatsmodalOverlay || !gameStatsModal) {
        console.error("❌ Game stats modal not found!");
        return;
    }

    gameStatsmodalOverlay.style.display = "flex";
    gameStatsModal.style.display = "block";

    // Event listeners for the game mode buttons
    document.getElementById("one-game-stat-btn")?.addEventListener("click", () => showGameStats("overview"));
    document.getElementById("two-game-stat-btn")?.addEventListener("click", () => showGameStats("matches"));
    document.getElementById("thr-game-stat-btn")?.addEventListener("click", () => showGameStats("trends"));
    document.getElementById("close-game-btn")?.addEventListener("click", closeGameStatsModal);

    // Close modal if overlay is clicked
    gameStatsmodalOverlay.addEventListener("click", (event) => {
        if (event.target === gameStatsmodalOverlay) {
            closeGameStatsModal();
        }
    });
};

const closeUserStatsModal = () => {
    const modalOverlay = document.getElementById("userstats-mode-modal-overlay");
    const userModal = document.getElementById("userstats-mode-modal");

    if (modalOverlay) modalOverlay.style.display = "none";
    if (userModal) userModal.style.display = "none";
};

const closeGameStatsModal = () => {
    const modalOverlay = document.getElementById("gamestats-mode-modal-overlay");
    const gameModal = document.getElementById("gamestats-mode-modal");

    if (modalOverlay) modalOverlay.style.display = "none";
    if (gameModal) gameModal.style.display = "none";
};

const showUserStats = (section) => {
    closeGameStatsModal();
    window.location.hash = `#userstats?section=${section}`;
};

const showGameStats = (section) => {
    closeGameStatsModal();
    window.location.hash = `#gamestats?section=${section}`;
};


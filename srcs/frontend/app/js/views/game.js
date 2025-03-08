

const setupGameJs = () => {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const type = params.get("type") || "local";  // Default: Local game
    const mode = params.get("mode") || "1v1";    // Default: 1v1 mode

    console.log(`🎮 Starting ${type.toUpperCase()} | Mode: ${mode.toUpperCase()}`);

    setTimeout(() => {
        const canvas = document.getElementById("pong");
        if (!canvas) {
            console.error("❌ Pong canvas not found! Game cannot start.");
            return;
        }

        switch (type) {
            case "online":
                initializeOnlineGame(mode);
                break;
            case "local":
                switch (mode)
                {
                    case "tournament":
                        initializeTournament();
                        break;
                    case "1v1":
                        initializeGame();
                        break;
                    case "ai":
                        initializeAIGame();
                        break;
                    default:
                        console.error(`❌ Unknown game mode: ${mode}`);
                        initializeGame();
                }
                break;
            default:
                console.error(`❌ Unknown game type: ${type}`);
        }
    }, 100);
};

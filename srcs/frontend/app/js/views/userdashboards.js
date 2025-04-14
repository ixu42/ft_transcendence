const setupUserDashboardJs = async () => {
    try {
        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        const section = params.get("section") || "overview";  // Default: Local game
        const userId = localStorage.getItem("user_id");

        console.log(`📊 Loading User Stats | Section: ${section.toUpperCase()}`);

        switch (section) {
            case "overview":
                initializeUserOverview();
                break;
            case "history":
                initializeMatchHistory();
                break;
            case "modes":
                await import('../userdashboard/modes.js').then(mod => mod.initializeModes(userId));
                break;
            default:
                console.error(`❌ Unknown stats section: ${section}`);
        }
    } catch (error) {
        console.error("Error setting up the stats dashboards:", error);
    }
};


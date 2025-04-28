
const setupGameDashboardJs = async () => {
    try {
        const userId = await listAndSelectLoggedInUser();
        if (!userId) {
            console.error("❌ No user selected. Aborting dashboard setup.");
            window.location.hash = "#dashy";
            return;
        }

        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        const section = params.get("section") || "overview";


        switch (section) {
            case "overview":
                initializeGameStatsOverview(userId);
                break;
            case "trends":
                initializeTrends(userId);
                break;
            default:
                console.error(`❌ Unknown gamestats section: ${section}`);
        }
    } catch (error) {
        console.error("Error setting up the gamestats dashboards:", error);
    }
};


const setupGameDashboardJs = async () => {
    try {
        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        const section = params.get("section") || "overview"; 
        const userId = localStorage.getItem("user_id");

        console.log(`📈 Loading Game Stats | Section:: ${section.toUpperCase()}`);

        switch (section) {
            case "overview":
                initializeGameStatsOverview();
                break;
            // case "matches":
            //     initializeGameHistory();
            //     break;
            case "trends":
                initializeTrends();
                break;
            default:
                console.error(`❌ Unknown gamestats section: ${section}`);
        }
    } catch (error) {
        console.error("Error setting up the gamestats dashboards:", error);
    }
};

// export function setupGameDashboardJs() {
//   console.log("✅ setupGameDashboardJs available");
// }

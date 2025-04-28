// Updated setupUserDashboardJs
const setupUserDashboardJs = async () => {
    try {
        // Get the selected user ID
        const userId = await listAndSelectLoggedInUser();
        if (!userId) {
            console.error("❌ No user selected. Aborting dashboard setup.");
            window.location.hash = "#dashy";
            return;
        }

        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        const section = params.get("section") || "overview";

        console.log(`📊 Loading User Stats | Section: ${section.toUpperCase()} | User ID: ${userId}`);

        switch (section) {
            case "overview":
                initializeUserOverview(userId); // Pass userId to the function if needed
                break;
            case "history":
                initializeMatchHistory(userId); // Pass userId to the function if needed
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
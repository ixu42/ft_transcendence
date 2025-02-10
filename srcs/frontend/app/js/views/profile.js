
const logout = async () => {
    console.log("Logout button clicked");

    try {
        const csrfToken = await getCSRFCookie();
        console.log("CSRF Token:", csrfToken);

        if (!csrfToken) {
            console.error("❌ CSRF Token is missing.");
            return;
        }

        const response = await fetch("http://localhost:8000/users/logout/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            credentials: "include", 
        });

        if (response.ok) {
            console.log("✅ Logout successful");
            document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            localStorage.setItem("isLoggedIn", "false");
            updateNavbar();
            window.location.hash = "#login";
        } else {
            const data = await response.json();
            console.error("❌ Logout failed:", data.errors);
        }
    } catch (error) {
        console.error("❌ Error during logout:", error);
    }
};


const setupProfilePage = () => {
    console.log("⚡ setupProfilePage() called!");

    const logoutButton = document.getElementById("profile-logout-btn");
    const menuButton = document.getElementById("profile-menu-btn");

    if (logoutButton) {
        console.log("✅ Found logout button, adding event listener...");
        logoutButton.addEventListener("click", logout);
    } else {
        console.warn("⚠️ Logout button not found.");
    }

    if (menuButton) {
        menuButton.addEventListener("click", () => {
            console.log("📌 Menu button clicked");
            window.location.hash = "#menu";
        });
    } else {
        console.warn("⚠️ Menu button not found.");
    }
};



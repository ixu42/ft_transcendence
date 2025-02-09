document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    const logoutButton = document.getElementById("logout-btn");
    const menuButton = document.getElementById("profile-menu-btn");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            console.log("Logout button clicked");
            localStorage.setItem("isLoggedIn", "false");
            window.location.hash = "#login";
        });
    }

    if (menuButton) {
        menuButton.addEventListener("click", () => {
            console.log("Menu button clicked");
            window.location.hash = "#menu";
        });
    }
});

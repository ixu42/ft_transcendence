

function updateNavbar() {
    const authButton = document.getElementById("tr-auth-btn");
    const homeButton = document.getElementById("tr-home-btn");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (authButton)
    {
        if (isLoggedIn) {
            authButton.textContent = "Profile";
            authButton.onclick = () => (window.location.hash = "#profile");
        } else {
            authButton.textContent = "Login / Register";
            authButton.onclick = () => (window.location.hash = "#login");
        }
    }
    if (homeButton) {homeButton.onclick = () => (window.location.hash = "#menu");}
}


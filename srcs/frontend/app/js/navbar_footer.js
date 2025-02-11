function updateNavbar() {
    const authButton = document.getElementById("auth-btn");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (authButton) {
        if (isLoggedIn) {
            authButton.textContent = "Profile";
            authButton.onclick = () => (window.location.hash = "#profile");
        } else {
            authButton.textContent = "Login / Register";
            authButton.onclick = () => (window.location.hash = "#login");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();

    window.addEventListener("storage", updateNavbar);
});

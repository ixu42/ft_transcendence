function updateNavbar() {
    const authButton = document.getElementById("tr-auth-btn");
    const homeButton = document.getElementById("tr-home-btn");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (authButton) {
        if (isLoggedIn) {
            authButton.innerHTML = '<img src="static/icons/profile30x30.png" alt="Profile" class="navbar-icon"> Profile'; // Profile icon
            authButton.onclick = () => (window.location.hash = "#profile");
        } else {
            authButton.innerHTML = '<img src="static/icons/login32x32.png" alt="Login" class="navbar-icon"> Login / Register'; // Login icon
            authButton.onclick = () => (window.location.hash = "#login");
        }
    }
    if (homeButton) {
        homeButton.innerHTML = '<img src="static/icons/home30x30.svg" alt="Home" class="navbar-icon"> Home'; // Home icon
        homeButton.onclick = () => (window.location.hash = "#menu");
    }
}
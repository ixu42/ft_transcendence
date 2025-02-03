document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("auth-btn");
    const profileButton = document.getElementById("profile-btn");

    if (profileButton) {
        profileButton.style.display = "inline-block";
        profileButton.addEventListener("click", () => {
            window.location.hash = "#profile";
        });
    }

    if (authButton) {
        authButton.addEventListener("click", () => {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            window.location.hash = isLoggedIn ? "#profile" : "#login";
        });
    }
});

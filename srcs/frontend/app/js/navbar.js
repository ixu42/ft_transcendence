document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("auth-btn");
    const profileButton = document.getElementById("profile-btn"); // New button

    if (authButton) {
        authButton.addEventListener("click", () => {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // Mocked login state
            window.location.hash = isLoggedIn ? "#profile" : "#login";
        });
    }

    if (profileButton) {
        profileButton.addEventListener("click", () => {
            window.location.hash = "#profile"; // Navigate to profile view
        });
    }
});

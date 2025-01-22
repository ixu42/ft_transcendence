document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("auth-btn");

    if (authButton) {
        authButton.addEventListener("click", () => {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // Mocked login state
            window.location.hash = isLoggedIn ? "#profile" : "#login";
        });
    }
});

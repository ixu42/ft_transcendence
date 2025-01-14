document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("auth-btn");

    authButton.addEventListener("click", () => {

        // add logic later
        const isLoggedIn = false // localStorage.getItem("isLoggedIn") === "true";

        if (isLoggedIn) {
            window.location.hash = "#profile";
        } else {
            window.location.hash = "#login";
        }
    });
});

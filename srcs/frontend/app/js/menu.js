document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    const playBtn = document.getElementById('play-btn');

    let isLoggedIn = false; // Simulates login state for now fetch from backend later






    authBtn.addEventListener('click', () => {
        if (!isLoggedIn) {
            const username = prompt("Enter your username to log in or register:");
            if (username) {
                alert(`Welcome, ${username}! You are now logged in.`);
                isLoggedIn = true;
                updateUI();
            } else {
                alert("Login/Register failed. Please try again.");
            }
        } else {
            if (confirm("Are you sure you want to log out?")) {
                isLoggedIn = false;
                alert("You are now logged out.");
                updateUI();
            }
        }
    });



    function updateUI() {
        if (isLoggedIn) {
            authBtn.textContent = "Logout";
            playBtn.classList.remove('disabled');
            playBtn.removeAttribute('aria-disabled');
        } else {
            authBtn.textContent = "Login / Register";
            playBtn.classList.add('disabled');
            playBtn.setAttribute('aria-disabled', 'true');
        }
    }

    updateUI();
});

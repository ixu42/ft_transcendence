document.addEventListener('DOMContentLoaded', () => {
    const navbarContainer = document.querySelector('#navbar-container');
    if (navbarContainer) {
        fetch('navbar.html')
            .then(response => response.text())
            .then(data => {
                navbarContainer.innerHTML = data;

                const authBtn = document.getElementById('auth-btn');
                let isLoggedIn = false; // Simulate login state fetch later from backend maybe JWT token would be good ?

                authBtn.addEventListener('click', () => {
                    if (!isLoggedIn) {
                        const username = prompt("Enter your username to log in:");
                        if (username) {
                            alert(`Welcome, ${username}!`);
                            isLoggedIn = true;
                            authBtn.textContent = 'Logout';
                        }
                    } else {
                        alert('Logged out.');
                        isLoggedIn = false;
                        authBtn.textContent = 'Login / Register';
                    }
                });
            })
            .catch(error => console.error('Error loading navbar:', error));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const navbarContainer = document.querySelector('#navbar');
    if (navbarContainer) {
        fetch('navbar.html')
            .then(response => response.text())
            .then(data => {
                navbarContainer.innerHTML = data;

                const authBtn = document.getElementById('auth-btn');
                const authBox = document.getElementById('auth-box');
                const loginContent = document.getElementById('login-content');
                const registerContent = document.getElementById('register-content');
                const showRegisterLink = document.getElementById('show-register');
                const showLoginLink = document.getElementById('show-login');
                let isLoggedIn = false;

                if (authBtn && authBox) {
                    authBtn.addEventListener('click', () => {
                        if (!isLoggedIn) {
                            authBox.classList.toggle('visible');
                            loginContent.classList.add('visible');
                            registerContent.classList.remove('visible');
                        } else {
                            alert('Logged out.');
                            isLoggedIn = false;
                            authBtn.textContent = 'Login / Register';
                            authBox.classList.remove('visible');
                        }
                    });

                    const loginForm = document.getElementById('login-form');
                    if (loginForm) {
                        loginForm.addEventListener('submit', (event) => {
                            event.preventDefault();
                            const username = document.getElementById('login-username').value;
                            const password = document.getElementById('login-password').value;

                            // Simulate authentication
                            if (username && password) {
                                alert(`Welcome, ${username}!`);
                                isLoggedIn = true;
                                authBtn.textContent = 'Logout';
                                authBox.classList.remove('visible');
                                loginForm.reset();
                            } else {
                                alert('Please enter both username and password.');
                            }
                        });
                    }

                    const registerForm = document.getElementById('register-form');
                    if (registerForm) {
                        registerForm.addEventListener('submit', (event) => {
                            event.preventDefault();
                            const username = document.getElementById('register-username').value;
                            const email = document.getElementById('register-email').value;
                            const password = document.getElementById('register-password').value;
                            const confirmPassword = document.getElementById('register-confirm-password').value;

                            // Simulate registration
                            if (username && email && password && password === confirmPassword) {
                                alert(`Account created for ${username}!`);
                                isLoggedIn = true;
                                authBtn.textContent = 'Logout';
                                authBox.classList.remove('visible');
                                registerForm.reset();
                            } else {
                                alert('Please fill all fields correctly.');
                            }
                        });
                    }

                    // Handle toggling between login and register forms
                    if (showRegisterLink) {
                        showRegisterLink.addEventListener('click', (event) => {
                            event.preventDefault();
                            loginContent.classList.remove('visible');
                            registerContent.classList.add('visible');
                        });
                    }

                    if (showLoginLink) {
                        showLoginLink.addEventListener('click', (event) => {
                            event.preventDefault();
                            registerContent.classList.remove('visible');
                            loginContent.classList.add('visible');
                        });
                    }

                    // Close auth box when clicking outside
                    document.addEventListener('click', (event) => {
                        if (!authBox.contains(event.target) && !authBtn.contains(event.target)) {
                            authBox.classList.remove('visible');
                            loginContent.classList.remove('visible');
                            registerContent.classList.remove('visible');
                        }
                    });
                }
            })
            .catch(error => console.error('Error loading navbar:', error));
    }
});

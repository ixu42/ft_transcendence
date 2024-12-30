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

                // Track the login state in a variable
                let isLoggedIn = false;

                if (authBtn && authBox) {
                    authBtn.addEventListener('click', () => {
                        if (!isLoggedIn) {
                            // Show the auth box with the login form visible by default
                            authBox.classList.toggle('visible');
                            loginContent.classList.add('visible');
                            registerContent.classList.remove('visible');
                        } else {
                            // On logout
                            alert('Logged out.');
                            isLoggedIn = false;
                            authBtn.textContent = 'Login / Register';
                            authBox.classList.remove('visible');
                        }
                    });

                    /* ------------------ LOGIN FORM ------------------ */
                    const loginForm = document.getElementById('login-form');
                    if (loginForm) {
                        loginForm.addEventListener('submit', (event) => {
                            event.preventDefault();

                            const username = document.getElementById('login-username').value.trim();
                            const password = document.getElementById('login-password').value.trim();

                            // Basic validation before sending request
                            if (!username || !password) {
                                alert('Please enter both username and password.');
                                return;
                            }

                            // Real login call
                            fetch('/users/login/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ username, password })
                            })
                            .then(response => {
                                // If the response is not OK, throw an error to trigger catch
                                if (!response.ok) {
                                    throw new Error('Login failed. Please check your credentials.');
                                }
                                return response.json();
                            })
                            .then(data => {
                                // If successful, show welcome
                                alert(`Welcome, ${data.username || username}!`);
                                isLoggedIn = true;
                                authBtn.textContent = 'Logout';
                                authBox.classList.remove('visible');
                                loginForm.reset();
                            })
                            .catch(error => {
                                // Show any errors
                                alert(error.message);
                            });
                        });
                    }

                    /* ------------------ REGISTER FORM ------------------ */
                    const registerForm = document.getElementById('register-form');
                    if (registerForm) {
                        registerForm.addEventListener('submit', (event) => {
                            event.preventDefault();

                            const username = document.getElementById('register-username').value.trim();
                            const displayName = document.getElementById('register-email').value.trim();
                            const password1 = document.getElementById('register-password').value;
                            const password2 = document.getElementById('register-confirm-password').value;

                            // Basic validation
                            if (!username || !displayName || !password1 || !password2) {
                                alert('Please fill all fields correctly.');
                                return;
                            }
                            if (password1 !== password2) {
                                alert('Passwords do not match.');
                                return;
                            }

                            // Real registration call
                            fetch('/users/register/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    username: username,
                                    password1: password1,
                                    password2: password2,
                                    display_name: displayName
                                })
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Registration failed. Please try again.');
                                }
                                return response.json();
                            })
                            .then(data => {
                                alert(`Account created for ${data.username || username}!`);
                                isLoggedIn = true;
                                authBtn.textContent = 'Logout';
                                authBox.classList.remove('visible');
                                registerForm.reset();
                            })
                            .catch(error => {
                                alert(error.message);
                            });
                        });
                    }

                    /* -------------- TOGGLE BETWEEN FORMS ------------- */
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

                    /* ------------- CLOSE AUTH BOX ON OUTSIDE CLICK ------------- */
                    document.addEventListener('click', (event) => {
                        // If the click is outside both authBox and authBtn, close the auth box
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

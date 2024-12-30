document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("auth-btn");
    const authBox = document.getElementById("auth-box");
    const loginContent = document.getElementById("login-content");
    const registerContent = document.getElementById("register-content");
    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // Toggle visibility of the auth box
    authBtn.addEventListener("click", () => {
        authBox.classList.toggle("hidden");
    });

    // Toggle between login and register forms
    showRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginContent.classList.add("hidden");
        registerContent.classList.remove("hidden");
    });

    showLogin.addEventListener("click", (e) => {
        e.preventDefault();
        registerContent.classList.add("hidden");
        loginContent.classList.remove("hidden");
    });

    // Handle registration
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("register-username").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const response = await fetch("/users/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password1: password,
                password2: confirmPassword,
                display_name: username, // optional, can be omitted
            }),
        });

        if (response.ok) {
            alert("Registration successful!");
            registerContent.classList.add("hidden");
            loginContent.classList.remove("hidden");
        } else {
            const data = await response.json();
            alert(`Registration failed: ${JSON.stringify(data.errors)}`);
        }
    });

    // Handle login
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        const response = await fetch("/users/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (response.ok) {
            alert("Login successful!");
            authBox.classList.add("hidden");
        } else {
            const data = await response.json();
            alert(`Login failed: ${data.errors}`);
        }
    });
});



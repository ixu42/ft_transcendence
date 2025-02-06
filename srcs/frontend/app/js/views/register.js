document.addEventListener("DOMContentLoaded", () => {
    waitForRegisterForm();
});

function waitForRegisterForm() {
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 500;

    const interval = setInterval(() => {
        const registerForm = document.getElementById("register-form");
        if (registerForm) {
            clearInterval(interval);
            attachRegisterEvent(registerForm);
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
        }
        attempts++;
    }, checkInterval);
}

async function register({ username, password1, password2 }) {
    const csrfToken = await getCSRFCookie();
    const response = await fetch("http://localhost:8000/users/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ username, password1, password2 }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.username?.[0] || "Registration failed");
    }

    return await response.json();
}

function attachRegisterEvent(form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userData = {
            username: document.getElementById("username")?.value.trim(),
            email: document.getElementById("register-email")?.value.trim(),
            password1: document.getElementById("register-password")?.value.trim(),
            password2: document.getElementById("register-password")?.value.trim(),
        };

        if (!userData.username || !userData.email || !userData.password1) {
            alert("⚠️ Please fill in all required fields.");
            return;
        }

        try {
            const response = await register(userData);
            alert("✅ Registration successful! Redirecting to login.");
            window.location.href = "#login";
        } catch (error) {
            alert("Error: " + (error.message || "Something went wrong."));
        }
    });
}

async function getCSRFCookie() {
    const name = 'csrftoken';
    const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
    return value || '';
}





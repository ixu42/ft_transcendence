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

async function register({ username, email, password1, password2 }) {
    const csrfToken = await getCSRFCookie();
    console.log("CSRF Token:", csrfToken);

    const response = await fetch("api/users/register/", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ username, email, password1, password2 }),
    });

    console.log("Sending request with body:", JSON.stringify({ username, email, password1, password2 }));

    if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Full error response from backend:", errorData);
        throw new Error(JSON.stringify(errorData));
    }

    const responseData = await response.json();
    console.log("✅ Registration successful:", responseData);
    return responseData;
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

        console.log("Collected user data:", userData);

        if (!userData.username || !userData.email || !userData.password1 || !userData.password2) {
            console.warn("⚠️ Missing required fields. User data:", userData);
            alert("⚠️ Please fill in all required fields.");
            return;
        }

        try {
            const response = await register(userData);
            if (response.errors) {
                console.error("❌ Registration failed:", response.errors);
            }
            alert("✅ Registration successful! Redirecting to login.");
            window.location.href = "#login";
        } catch (error) {
            console.error("❌ Registration error:", error);
            alert("Error: " + (error.message || "Something went wrong."));
        }
    });
}




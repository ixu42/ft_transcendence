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
    console.log("CSRF Token:", csrfToken);

    const response = await fetch("http://localhost:8000/users/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ username, password1, password2 }),
        credentials: "include",
    });

    console.log("Sending request with body:", JSON.stringify({ username, password1, password2 }));

    if (!response.ok) {
        console.error("❌ Registration failed with status:", response.status);
        const errorData = await response.json();
        console.error("❌ Error details:", errorData);
        throw new Error(errorData.errors?.username?.[0] || "Registration failed");
    }

    const responseData = await response.json();
    console.log("✅ Registration successful:", responseData);
    return responseData;
}

function attachRegisterEvent(form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Collect user input data
        const userData = {
            username: document.getElementById("username")?.value.trim(),
            password1: document.getElementById("register-password")?.value.trim(),
            password2: document.getElementById("register-password")?.value.trim(),
        };

        // Log the collected user data for verification
        console.log("Collected user data:", userData);

        if (!userData.username || !userData.password1 || !userData.password2) {
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




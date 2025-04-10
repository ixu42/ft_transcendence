

function setupRegisterPageJs() {
    console.log("Register page loaded");
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        attachRegisterEvent(registerForm);
    } else {
        console.warn("Register form not found on setup");
    }
}


async function register({ username, password1, password2 }) {
    const csrfToken = await getCSRFCookie();
    console.log("CSRF Token:", csrfToken);

    const response = await fetch("api/users/register/", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ username, password1, password2 }),
    });

    console.log("Sending request with body:", JSON.stringify({ username, password1, password2 }));

    const data = await safeParseJSON(response);

    return {
        ok: response.ok,
        status: response.status,
        data,
    };
}

function attachRegisterEvent(form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userData = {
            username: document.getElementById("username")?.value.trim(),
            password1: document.getElementById("register-password1")?.value.trim(),
            password2: document.getElementById("register-password2")?.value.trim(),
        };

        console.log("Collected user data:", userData);

        if (!userData.username || !userData.password1 || !userData.password2) {
            console.warn("⚠️ Missing required fields. User data:", userData);
            alert("⚠️ Please fill in all required fields.");
            return;
        }

        const response = await register(userData);

        if (!response.ok) {
            const { errors } = response.data;
            const messages = [];

            if (errors?.username) messages.push(errors.username.join("\n"));
            if (errors?.password1) messages.push(errors.password1.join("\n"));
            if (errors?.password2) messages.push(errors.password2.join("\n"));

            alert("❌ " + (messages.join("\n") || "Registration failed."));
            return;
        }

        alert("✅ Registration successful! Redirecting to login.");
        window.location.href = "#login";
    });
}




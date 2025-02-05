




// REGISTER EXAMPLE

async function handleRegister() {
    // Fetch necessary translations and placeholders for the form
    const translations = await Promise.all([
        translateKey('email'),
        translateKey('username'),
        translateKey('password'),
        translateKey('confirmPassword'),
        translateKey('registerStatus'),
    ]);

    const [
        emailPlaceholder,
        usernamePlaceholder,
        passwordPlaceholder,
        confirmPasswordPlaceholder,
        registerStatusMessage
    ] = translations;

    // Update placeholders and labels dynamically
    document.getElementById("enterEmail").setAttribute('placeholder', emailPlaceholder);
    document.getElementById("enterUsername").setAttribute('placeholder', usernamePlaceholder);
    document.getElementById("enterPassword").setAttribute('placeholder', passwordPlaceholder);
    document.getElementById("confirmPasswordP").setAttribute('placeholder', confirmPasswordPlaceholder);
    document.getElementById("register-status").textContent = registerStatusMessage;

    document.getElementById("register-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        // Collect form inputs
        const email = document.getElementById("enterEmail").value.trim();
        const username = document.getElementById("enterUsername").value.trim();
        const password = document.getElementById("enterPassword").value;
        const confirmPassword = document.getElementById("confirmPasswordP").value;

        // Input validation
        if ([email, username, password, confirmPassword].some(field => field.length > 50)) {
            alert('Input exceeds the maximum allowed length of 50 characters.');
            return;
        }

        if (password !== confirmPassword) {
            const feedback = document.getElementById("password-mismatch-feedback");
            feedback.style.display = "block";
            feedback.textContent = "Passwords do not match.";
            return;
        } else {
            document.getElementById("password-mismatch-feedback").style.display = "none";
        }

        const requestData = JSON.stringify({
            username: username,
            password1: password,
            password2: confirmPassword,
            display_name: email // Assuming email is used as display_name
        });

        try {
            // Send registration request
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`/users/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: requestData,
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Inform the user and redirect to login
                document.getElementById("register-status").textContent = data.message;
                document.getElementById("register-status").style.color = "green";
                setTimeout(() => {
                    window.location.href = "/#login?m=success";
                }, 1000);
            } else {
                // Handle errors from the API
                const errorFeedback = data.errors || "An unknown error occurred.";
                document.getElementById("register-status").textContent = errorFeedback;
                document.getElementById("register-status").style.color = "red";
            }
        } catch (error) {
            console.error("Error during registration:", error);
            document.getElementById("register-status").textContent = `Error: ${error.message}`;
            document.getElementById("register-status").style.color = "red";
        }
    });
}

async function getCSRFCookie() {
    const csrfCookieName = "csrftoken";
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
    const csrfCookie = cookies.find((cookie) => cookie.startsWith(csrfCookieName + "="));
    return csrfCookie ? csrfCookie.split("=")[1] : null;
}





document.addEventListener("DOMContentLoaded", handleRegister);




function setupLoginPageJs()
{
    const loginButton = document.getElementById("login-btn");
    if (loginButton){
        handleLogin(loginButton);
    }
    else{
        console.error("Login button not found!");
    }
    displayLoggedInUsers();
}

function handleLogin(loginButton) {
    loginButton.addEventListener("click", async () => {
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!username || !password) {
            alert("⚠️ Please fill in all required fields.");
            return;
        }

        const csrfToken = await getCSRFCookie();
        if (!csrfToken) {
            alert("❌ CSRF Token not available. Please try again.");
            return;
        }

        try {
            const response = await fetch("/api/users/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({ username, password }),
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Login successful!");

                data.loggedIn = true;
                addOrUpdateLoggedInUser(data);

                updateNavbar();
                window.location.hash = "#menu";
            } else if (response.status === 400) {
                alert(`❌ Error: ${data.errors || "Redirecting to menu..."}`);
                window.location.hash = "#menu";
            } else {
                alert(`❌ Error: ${data.errors || "Login failed"}`);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("❌ Network error. Please try again later.");
        }
    });
}


function displayLoggedInUsers() {
    const loggedInUsers = getLoggedInUsers();
    const loggedInSessionsDiv = document.getElementById("loggedInSessions");
    loggedInSessionsDiv.innerHTML = ""; // Clear previous content

    if (loggedInUsers.length > 0) {
        const sessionsTitle = document.createElement("p");
        sessionsTitle.textContent = "Existing Sessions:";
        loggedInSessionsDiv.appendChild(sessionsTitle);

        loggedInUsers.forEach(user => {
            const sessionParagraph = document.createElement("p");
            sessionParagraph.textContent = `You're logged in as: ${user.username} `;

            const continueLink = document.createElement("a");
            continueLink.href = "#menu";
            continueLink.textContent = "(Continue)";
            continueLink.style.cursor = "pointer";

            sessionParagraph.appendChild(continueLink);
            loggedInSessionsDiv.appendChild(sessionParagraph);
        });
    } else {
        const guestParagraph = document.createElement("p");
        guestParagraph.textContent = "Continue as Guest ";

        const continueLink = document.createElement("a");
        continueLink.href = "#menu";
        continueLink.textContent = "(Continue)";
        continueLink.style.cursor = "pointer";

        guestParagraph.appendChild(continueLink);
        loggedInSessionsDiv.appendChild(guestParagraph);
    }
}



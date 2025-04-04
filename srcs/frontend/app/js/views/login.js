
function setupLoginPageJs()
{
    checkAndShowSplash();
    const loginButton = document.getElementById("login-btn");
    if (loginButton){
        handleLogin(loginButton);
    }
    else{
        console.error("Login button not found!");
    }
}

function checkAndShowSplash() {
    const splashScreen = document.querySelector(".splash-screen");
    const loginContainer = document.getElementById("login-container");

    console.log("Checking localStorage splashShown:", localStorage.getItem("splashShown"));

    if (localStorage.getItem("splashShown") === "true") {
        console.log("Splash already shown. Skipping...");
        splashScreen?.classList.add("hidden");
        loginContainer?.classList.remove("hidden");
    } else {
        console.log("Splash not shown yet. Displaying splash screen...");
        splashScreen?.classList.remove("hidden");
    }
}

function handleLogin(loginButton) {
    loginButton.addEventListener("click", async () => {
        const username = document.getElementById("login-username-email").value.trim();
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

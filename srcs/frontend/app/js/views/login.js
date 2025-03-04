
function setupLoginPage()
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

async function getCSRFCookie() {
    try {
        const response = await fetch("/api/get-csrf-token/", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch CSRF token: ${response.status}`);
        }

        const csrfToken = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        if (!csrfToken) {
            console.log("❌ CSRF Token not found.");
            return "";
        }

        console.log("🔑 CSRF Token fetched:", csrfToken);
        return csrfToken;
    } catch (error) {
        console.error("❌ CSRF Token fetch error:", error);
        return "";
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
                
                // ✅ Store user ID in localStorage
                if (data.id) {
                    localStorage.setItem("user_id", data.id);
                } else {
                    console.error("❌ No user ID in response!");
                }

                localStorage.setItem("isLoggedIn", "true");
                updateNavbar();
                window.location.hash = "#menu";
            
            }
            else if (response.status == 400) {
                alert(`❌ Error: ${data.errors || "Redirecting to menu..."}`);
                window.location.hash = "#menu";
            }
            else {
                alert(`❌ Error: ${data.errors || "Login failed"}`);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("❌ Network error. Please try again later.");
        }
    });
}

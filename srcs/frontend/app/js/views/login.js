document.addEventListener("DOMContentLoaded", () => {
    waitForLoginForm();
});

function waitForLoginForm() {
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 500;

    const interval = setInterval(() => {
        const loginButton = document.getElementById("login-btn");
        if (loginButton) {
            clearInterval(interval);
            bindLoginButton(loginButton);
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
        }
        attempts++;
    }, checkInterval);
}

async function getCSRFCookie() {
    try {
        const response = await fetch("http://localhost:8000/get_csrf_token/", {
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

function bindLoginButton(loginButton) {
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
            const response = await fetch("http://localhost:8000/users/login/", {
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
                localStorage.setItem("isLoggedIn", "true");
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

function hideSplash() {
    const splash = document.querySelector(".splash-screen");
    const loginContainer = document.getElementById("login-container");

    if (!splash || !loginContainer) {
        console.error("Splash screen or login container not found!");
        return;
    }
    
    console.log("Splash clicked! Hiding splash screen...");
    
    splash.classList.add("hidden");
    setTimeout(() => {
        splash.style.display = "none";
        loginContainer.style.display = "flex";
    }, 500);
}





document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.querySelector(".splash-screen");
    
    if (splashScreen) {
        splashScreen.addEventListener("click", hideSplash);
    }
});












// document.addEventListener("DOMContentLoaded", async () => {
//     const translations = {
//         oauthError: await translateKey("oauthError"),
//         successMsg: await translateKey("successMsg"),
//         max50chars: await translateKey("max50chars"),
//         invalidUsername: await translateKey("invalidUsername"),
//         invalidPass: await translateKey("invalidPass"),
//         need2fa: await translateKey("need2fa"),
//         invalid2fa: await translateKey("invalid2fa"),
//         loginFailed: await translateKey("loginFailed"),
//         errorLogin: await translateKey("errorLogin"),
//     };

//     const loginForm = document.getElementById("login-form");
//     const loginStatus = document.getElementById("login-status");
//     const twoFactorCodeContainer = document.getElementById("2fa-code-container");
//     const twoFactorCodeInput = document.getElementById("twoFactorCode");

//     if (twoFactorCodeInput) twoFactorCodeInput.style.display = "none";
//     if (twoFactorCodeContainer) twoFactorCodeContainer.style.display = "none";

//     async function getCSRFCookie() {
//         const csrfCookieName = "csrftoken";
//         const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
//         const csrfCookie = cookies.find((cookie) => cookie.startsWith(csrfCookieName + "="));
//         return csrfCookie ? csrfCookie.split("=")[1] : null;
//     }

//     async function check2FAStatus(username) {
//         try {
//             const csrfToken = await getCSRFCookie();
//             const response = await fetch(`/api/2fa-status?username=${username}`, {
//                 method: "POST",
//                 headers: { "X-CSRFToken": csrfToken },
//             });

//             if (!response.ok) throw new Error("Failed to fetch 2FA status");
//             const data = await response.json();
//             return data.enabled;
//         } catch (error) {
//             console.error("Error checking 2FA status:", error);
//             return false;
//         }
//     }

//     async function check2FACode(username, code) {
//         try {
//             const csrfToken = await getCSRFCookie();
//             const response = await fetch(`/api/check-2fa-code?username=${username}&code=${code}`, {
//                 method: "GET",
//                 headers: { "X-CSRFToken": csrfToken },
//             });

//             if (!response.ok) throw new Error("Failed to check 2FA code");
//             const data = await response.json();
//             return data.valid;
//         } catch (error) {
//             console.error("Error checking 2FA code:", error);
//             return false;
//         }
//     }

//     if (loginForm) {
//         loginForm.addEventListener("submit", async (e) => {
//             e.preventDefault();
//             const formData = new FormData(loginForm);
//             const username = formData.get("username");
//             const password = formData.get("password");

//             if (!username || username.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
//                 loginStatus.textContent = translations.invalidUsername;
//                 loginStatus.style.color = "red";
//                 return;
//             }

//             if (!password || password.length > 50 || /\s/.test(password) || /["'`]/.test(password)) {
//                 loginStatus.textContent = translations.invalidPass;
//                 loginStatus.style.color = "red";
//                 return;
//             }

//             const is2FAEnabled = await check2FAStatus(username);

//             if (is2FAEnabled) {
//                 if (twoFactorCodeContainer) twoFactorCodeContainer.style.display = "block";
//                 const twoFactorCode = twoFactorCodeInput?.value.trim();

//                 if (!twoFactorCode) {
//                     loginStatus.textContent = translations.need2fa;
//                     loginStatus.style.color = "red";
//                     return;
//                 }

//                 const is2FACodeValid = await check2FACode(username, twoFactorCode);
//                 if (!is2FACodeValid) {
//                     loginStatus.textContent = translations.invalid2fa;
//                     loginStatus.style.color = "red";
//                     return;
//                 }
//             }

//             try {
//                 const csrfToken = await getCSRFCookie();
//                 const response = await fetch(`/api/login/`, {
//                     method: "POST",
//                     body: formData,
//                     headers: { "X-CSRFToken": csrfToken },
//                 });

//                 const data = await response.json();

//                 if (data.message === "Login successful") {
//                     localStorage.setItem("isLoggedIn", "true");
//                     if (data.jwt_token) localStorage.setItem("jwtToken", data.jwt_token);

//                     window.location.hash = "#menu";
//                 } else {
//                     loginStatus.textContent = data.error || translations.loginFailed;
//                     loginStatus.style.color = "red";
//                 }
//             } catch (error) {
//                 console.error("Error logging in:", error);
//                 loginStatus.textContent = translations.errorLogin;
//                 loginStatus.style.color = "red";
//             }
//         });
//     }
// });


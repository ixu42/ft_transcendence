async function handleLogin(msg) {
    translate(currentLanguage);
    const translations = {
      oauthError: await translateKey("oauthError"),
      successMsg: await translateKey("successMsg"),
      max50chars: await translateKey("max50chars"),
      invalidUsername: await translateKey("invalidUsername"),
      invalidPass: await translateKey("invalidPass"),
      need2fa: await translateKey("need2fa"),
      invalid2fa: await translateKey("invalid2fa"),
      loginFailed: await translateKey("loginFailed"),
      errorLogin: await translateKey("errorLogin"),
    };
  
    if (msgReg === "oauth") msgReg = translations.oauthError;
    if (msgReg === "success") msgReg = translations.successMsg;
    if (msg === "oauth") msg = translations.oauthError;
    if (msg === "success") msg = translations.successMsg;
  
    async function check2FACode(username, code) {
      try {
        const csrfToken = await getCSRFCookie();
        const response = await fetch(`/api/check-2fa-code?username=${username}&code=${code}`, {
          method: "GET",
          headers: { "X-CSRFToken": csrfToken },
        });
  
        if (!response.ok) throw new Error("Failed to check 2FA code");
        const data = await response.json();
        return data.valid;
      } catch (error) {
        console.error("Error checking 2FA code:", error);
        return false;
      }
    }
  
    async function check2FAStatus(username) {
      try {
        const csrfToken = await getCSRFCookie();
        const response = await fetch(`/api/2fa-status?username=${username}`, {
          method: "POST",
          headers: { "X-CSRFToken": csrfToken },
        });
  
        if (!response.ok) throw new Error("Failed to fetch 2FA status");
        const data = await response.json();
        return data.enabled;
      } catch (error) {
        console.error("Error checking 2FA status:", error);
      }
    }
  
    const loginForm = document.getElementById("login-form2");
    const loginStatus = document.getElementById("login-status");
    const submitButton = loginForm?.querySelector('[type="submit"]');
    const twoFactorCodeContainer = document.getElementById("2fa-code-container");
    const twoFactorCodeInput = document.getElementById("twoFactorCode");
  
    if (twoFactorCodeInput) twoFactorCodeInput.style.display = "none";
    if (twoFactorCodeContainer) twoFactorCodeContainer.style.display = "none";
  
    if (loginForm) {
      const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get("username");
        const password = formData.get("password");
  
        for (const [key, value] of formData.entries()) {
          if (value.length > 50) {
            loginStatus.textContent = `${key} ${translations.max50chars}`;
            loginStatus.style.color = "red";
            return;
          }
        }
  
        if (!username || !/^[a-zA-Z0-9_-]+$/.test(username)) {
          loginStatus.textContent = translations.invalidUsername;
          loginStatus.style.color = "red";
          return;
        }
  
        if (!password || /\s/.test(password) || /["'`]/.test(password)) {
          loginStatus.textContent = translations.invalidPass;
          loginStatus.style.color = "red";
          return;
        }
  
        const is2FAEnabled = await check2FAStatus(username);
  
        if (is2FAEnabled) {
          if (twoFactorCodeContainer) twoFactorCodeContainer.style.display = "block";
          if (twoFactorCodeInput) twoFactorCodeInput.style.display = "block";
  
          const twoFactorCode = twoFactorCodeInput.value.trim();
          if (!twoFactorCode) {
            loginStatus.textContent = translations.need2fa;
            loginStatus.style.color = "red";
            return;
          }
  
          const is2FACodeValid = await check2FACode(username, twoFactorCode);
          if (!is2FACodeValid) {
            loginStatus.textContent = translations.invalid2fa;
            loginStatus.style.color = "red";
            return;
          }
        }
  
        if (submitButton) submitButton.disabled = true;
  
        try {
          const csrfToken = await getCSRFCookie();
          const response = await fetch(`/api/login/`, {
            method: "POST",
            body: formData,
            headers: { "X-CSRFToken": csrfToken },
          });
  
          const data = await response.json();
  
          if (data.message === "Login successful") {
            localStorage.setItem("isLoggedIn", "true");
            if (data.jwt_token) localStorage.setItem("jwtToken", data.jwt_token);
            if (data.userLogin) localStorage.setItem("userLogin", data.userLogin);
            if (data.userNickname) localStorage.setItem("userNickname", data.userNickname);
  
            setTimeout(() => {
              if (submitButton) submitButton.disabled = false;
              window.location.href = "/#profile";
            }, 2000);
          } else {
            loginStatus.textContent = data.error || translations.loginFailed;
            loginStatus.style.color = "red";
            if (submitButton) submitButton.disabled = false;
          }
        } catch (error) {
          console.error("Error logging in:", error);
          loginStatus.textContent = translations.errorLogin;
          loginStatus.style.color = "red";
          if (submitButton) submitButton.disabled = false;
        }
      };
  
      loginForm.addEventListener("submit", handleSubmit);
  
      const usernameElement = document.getElementById("userName");
      const passwordElement = document.getElementById("pwd");
  
      if (usernameElement) usernameElement.placeholder = await translateKey("username");
      if (passwordElement) passwordElement.placeholder = await translateKey("password");
  
      if (loginStatus && msgReg) loginStatus.textContent = msgReg;
      else if (loginStatus && msg) loginStatus.textContent = msg;
  
      setTimeout(() => {
        msgReg = null;
        msg = null;
      }, 5000);
    }
  }
  
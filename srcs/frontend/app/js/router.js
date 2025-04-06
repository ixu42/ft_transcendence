
const routes = {
  "#": "/views/login.html",
  "#menu": "/views/menu.html",
  "#about": "/views/about.html",
  "#leaderboard": "/views/leaderboard.html",
  "#lobby": "/views/lobby.html",
  "#terms-of-service": "/views/terms-of-service.html",
  "#privacy-policy": "/views/privacy-policy.html",
  "#login": "/views/login.html",
  "#register": "/views/register.html",
  "#game": "/views/game.html",
  "#profile": "/views/profile.html",
  '#chat': "/views/chat.html",
  '#contact': "/views/contact.html",
  404: "/views/404.html",
};

const protectedRoutes = [/*"#profile"*/];
const loggedInUsers = JSON.parse(localStorage.getItem("loggedInUsers") || "[]");
const isAnyUserLoggedIn = loggedInUsers.some(user => user.loggedIn);
const routeToMenu = () => { history.replaceState(null, null, "#menu");};

const routeHandlers = {
  "#game": () => setupGameJs(),
  "#lobby": () => setupLobbyJs(),
  "#menu": () => console.log("Menu loaded"),
  "#leaderboard": () => setupLeaderboardJs(),
  "#profile": () => {
    const hash = window.location.hash;
    const queryString = hash.split("?")[1];
    const userId = queryString ? new URLSearchParams(queryString).get("user_id") : null;
    if (userId) {
      console.log(`Profile loaded for user ID: ${userId}`);
      setupProfilePageJs(userId);
    } else {
      console.warn("No user ID provided; profile not loaded.");
    }
  },
  "#terms-of-service": () => {},
  "#privacy-policy": () => {},
  "#about": () => {},
  "#register": () => setupRegisterPageJs(),
  "#login": () => setupLoginPageJs(),
  "#chat": () => {},

};

let heartbeatInterval = null; // Store interval ID

const startHeartbeat = async () => {
  const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);
  if (loggedInUsers.length === 0) {
      console.log("No logged in users, skipping heartbeat.");
      return;
  }
  if (heartbeatInterval) {
      console.log("Heartbeat already running.");
      return;
  }

  async function sendHeartbeat() {
      const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);
      for (const user of loggedInUsers) {
          try {
              await apiRequest(`users/${user.id}/heartbeat/`, "GET");
              console.log(`Heartbeat updated for user ${user.id}`);
          } catch (error) {
              console.error(`Heartbeat error for user ${user.id}:`, error);
          }
      }
  }

  await sendHeartbeat();
  heartbeatInterval = setInterval(sendHeartbeat, 40000);
};

const stopHeartbeat = () => {
  if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
      console.log("Heartbeat stopped.");
  }
};

const handleLocation = async () => {

  if (!window.location.hash)
  {
    const defaultRoute = isAnyUserLoggedIn ? "#menu" : "#login";
    console.log(`🔀 Redirecting to default route: ${defaultRoute}`);
    console.log(`🔀 Redirecting to default route: ${defaultRoute}`);
    history.replaceState(null, null, defaultRoute);
  }
  
  const hashParts = window.location.hash.split("?");
  const path = hashParts[0] || "#";
  const route = routes[path] || routes[404];
  const isLoggedIn = isAnyUserLoggedIn;
  const hideNavbarAndFooter = ["#login", "#register", "", "#game", "#profile"].includes(path) || window.location.hash === "";

  const navbar = document.getElementById("tr-navbar-container");
  const footer = document.getElementById("tr-footer-container");
  const app = document.getElementById("app");

  if (navbar) navbar.classList.toggle("hidden", hideNavbarAndFooter);
  if (footer) footer.classList.toggle("hidden", hideNavbarAndFooter);

  // Check for protected routes.
  if (protectedRoutes.includes(path) && !isLoggedIn) {
    console.warn(`🚨 Access denied: ${path} requires authentication.`);
    alert("You must be logged in to access this page.");
    return;
  }

  try {
    const html = await fetch(route).then((data) => data.text());
    app.innerHTML = html;

    if (routeHandlers[path]) {
      routeHandlers[path]();
    }

    console.log(`✅ Loaded route content: ${path}`);
    console.log(`Updating navbar...`);
    updateNavbar(); // Update the navbar after loading the route content

    if (isLoggedIn) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  
  } catch (error) {
    app.innerHTML = "<h1>Error loading page</h1>";
    console.error(`❌ Failed to load route ${path}:`, error);
  }
};
window.addEventListener("hashchange", handleLocation);
window.addEventListener("DOMContentLoaded", handleLocation);

   /* Just the basics first 

   async function fetchCSRFToken() {
     const csrfCookieName = "csrftoken";
     let csrfToken = getCookie(csrfCookieName);
     if (!csrfToken) {
       try {
         const response = await fetch("/api/get-csrf-token/", {
           method: "GET",
           credentials: "same-origin",
         });
         if (!response.ok) throw new Error(`Failed to fetch CSRF token`);
         const data = await response.json();
         csrfToken = data.csrfToken;
         document.cookie = `${csrfCookieName}=${csrfToken}; path=/`;
       } catch (error) {
         console.error("Error fetching CSRF token:", error);
         return null;
       }
     }
     return csrfToken;
   }
   function getCookie(name) {
     const cookies = document.cookie.split(";");
     for (let cookie of cookies) {
       const [cookieName, cookieValue] = cookie.trim().split("=");
       if (cookieName === name) return decodeURIComponent(cookieValue);
     }
     return null;
   }
   async function fetchDataWithCSRF() {
     const csrfToken = await fetchCSRFToken();
     if (!csrfToken) return console.error("CSRF token not available.");
     try {
       const response = await fetch("/api/secure-endpoint/", {
         method: "POST",
         headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
         body: JSON.stringify({ key: "value" }),
         credentials: "same-origin",
       });
       if (!response.ok) throw new Error("Request failed");
       const data = await response.json();
       console.log("Data fetched successfully:", data);
     } catch (error) {
       console.error("Error during fetch:", error);
     }
   }
   (async function initializeCSRFToken() {
     const csrfToken = await fetchCSRFToken();
     if (csrfToken) console.log("CSRF token initialized:", csrfToken);
   })();

   */



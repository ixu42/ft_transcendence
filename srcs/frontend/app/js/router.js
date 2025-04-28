
const routes = {
  "#": "/views/login.html",
  "#menu": "/views/menu.html",
  "#about": "/views/about.html",
  "#leaderboard": "/views/leaderboard.html",
  "#lobby": "/views/lobby.html",
  "#dashy": "/views/dashy.html",
  "#terms-of-service": "/views/terms-of-service.html",
  "#privacy-policy": "/views/privacy-policy.html",
  "#login": "/views/login.html",
  "#register": "/views/register.html",
  "#game": "/views/game.html",
  "#userstats": "/views/userstats.html",
  "#gamestats": "/views/gamestats.html",
  "#profile": "/views/profile.html",
  '#chat': "/views/chat.html",
  '#contact': "/views/contact.html",
  404: "/views/404.html",
};

const protectedRoutes = ["#profile"];
let isAnyUserLoggedIn =  getLoggedInUsers().some(user => user.loggedIn);
const routeToMenu = () => { history.replaceState(null, null, "#menu");};

const routeHandlers = {
  "#game": () => setupGameJs(),
  "#userstats": () => setupUserDashboardJs(),
  "#gamestats": () => setupGameDashboardJs(),
  "#lobby": () => setupLobbyJs(),
  "#dashy": () => setupDashyJs(),
  "#leaderboard": () => setupLeaderboardJs(),
  "#profile": () => {
    const hash = window.location.hash;
    const queryString = hash.split("?")[1];
    const userId = queryString ? new URLSearchParams(queryString).get("user_id") : null;
    if (userId) {
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

let heartbeatInterval = null;

const startHeartbeat = async () => {
  const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);
  if (loggedInUsers.length === 0) {
      return;
  }
  if (heartbeatInterval) {
      return;
  }

  async function sendHeartbeat() {
      const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);
      for (const user of loggedInUsers) {
          try {
              await apiRequest(`users/${user.id}/heartbeat/`, "GET");
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
  }
};

const handleLocation = async () => {

  await syncLoggedInUsersWithBackend();
  isAnyUserLoggedIn = getLoggedInUsers().some(user => user.loggedIn);

  if (!window.location.hash) {
      const defaultRoute = isAnyUserLoggedIn ? "#menu" : "#login";
      history.replaceState(null, null, defaultRoute);
  }

  const hashParts = window.location.hash.split("?");
  const path = hashParts[0] || "#";
  const route = routes[path] || routes[404];
  const hideNavbarAndFooter = ["#login", "#register", "", "#game", "#userstats", "#gamestats", "#profile"].includes(path) || window.location.hash === "";

  const navbar = document.getElementById("tr-navbar-container");
  const footer = document.getElementById("tr-footer-container");
  const app = document.getElementById("app");

  if (navbar) navbar.classList.toggle("hidden", hideNavbarAndFooter);
  if (footer) footer.classList.toggle("hidden", hideNavbarAndFooter);

  // Check for protected routes
  if (protectedRoutes.includes(path) && !isAnyUserLoggedIn) {
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

      updateNavbar();

      if (isAnyUserLoggedIn) {
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

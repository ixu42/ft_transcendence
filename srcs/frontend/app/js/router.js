const routes = {
  "#": "/views/login.html",
  "#menu": "/views/menu.html",
  "#credits": "/views/credits.html",
  "#leaderboard": "/views/leaderboard.html",
  "#lobby": "/views/lobby.html",
  "#terms": "/views/terms-privacy.html",
  "#login": "/views/login.html",
  "#register": "/views/register.html",
  "#game": "/views/game.html",
  404: "/views/404.html",
};

const protectedRoutes = ["#leaderboard", "#lobby", "#game"];

const isUserLoggedIn = () => true;

const redirectToLogin = () => {
  window.location.hash = "#login";
};


//Game scripts are already loaded in index.html
// const loadGameScripts = () => {
//   const scriptPaths = [
//       "/js/game/ball.js",
//       "/js/game/controls.js",
//       "/js/game/paddle.js",
//       "/js/game/game.js",
//       "/js/game/main.js",
//   ];

//   scriptPaths.forEach((scriptPath) => {
//       const script = document.createElement("script");
//       script.src = scriptPath;
//       script.defer = true;
//       document.body.appendChild(script);
//   });
// };

const bindLobbyEventListeners = () => {
  const startLocalBtn = document.getElementById("start-local-btn");
  if (startLocalBtn) {
      startLocalBtn.addEventListener("click", () => {
          window.location.hash = "#game";
      });
  }

  const startOnlineBtn = document.getElementById("start-online-btn");
  if (startOnlineBtn) {
      startOnlineBtn.addEventListener("click", () => {
          alert("Online game functionality is coming soon!");
      });
  }
};

//This function exists in game/main.js
// const initializeGame = () => {
//   const gameContainer = document.getElementById("pong");
//   if (gameContainer) {
//       const game = createGame();
//       setupControls(game.player, game.player2, game);
//       resetBall(drawBall, game.canvas);

//       function gameLoop() {
//           updateGame(game);
//           drawGame(game);
//           requestAnimationFrame(gameLoop);
//       }
//       gameLoop();
//   }
// };

const toggleNavFooterVisibility = (isVisible) => {
  const navbar = document.getElementById("navbar-container");
  const footer = document.getElementById("footer-container");
  if (navbar) navbar.style.display = isVisible ? "block" : "none";
  if (footer) footer.style.display = isVisible ? "block" : "none";
};

const handleLocation = async () => {
  const path = window.location.hash || "#";
  const route = routes[path] || routes[404];

  console.log(`Navigating to: ${path}`); // Debug here

  const navbar = document.getElementById("navbar-container");
  const footer = document.getElementById("footer-container");

  // Set isLoggedIn to true for guest access
  const isLoggedIn = true; // isUserLoggedIn();

  const hideNavbarAndFooter = ["#login", "#register"].includes(path);
  if (navbar) navbar.style.display = hideNavbarAndFooter ? "none" : "block";
  if (footer) footer.style.display = hideNavbarAndFooter ? "none" : "block";

  if (protectedRoutes.includes(path) && !isLoggedIn) {
      redirectToLogin();
      return;
  }

  try {
      const html = await fetch(route).then((data) => data.text());
      document.getElementById("app").innerHTML = html;

      if (path === "#game") {
          setTimeout(() => initializeGame(), 100);
      } else if (path === "#lobby") {
          bindLobbyEventListeners();
      }

      console.log(`Loaded route content: ${path}`); // Debug here
  } catch (error) {
      document.getElementById("app").innerHTML = "<h1>Error loading page</h1>";
      console.error(`Failed to load route ${path}:`, error);
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



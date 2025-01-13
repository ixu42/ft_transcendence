const routes = {
    "#": "/views/menu.html",
    "#menu": "/views/menu.html",
    "#credits": "/views/credits.html",
    "#leaderboard": "/views/leaderboard.html",
    "#lobby": "/views/lobby.html",
    "#terms": "/views/terms-privacy.html",
    "#login": "/views/login.html",
    404: "/views/404.html",
  };
  
  const protectedRoutes = ["#leaderboard", "#lobby"];
  
  // Authenticated routes add later
  const isUserLoggedIn = () => true;
  const redirectToLogin = () => {
    window.location.hash = "#login";
  };
  

  const handleLocation = async () => {
    const path = window.location.hash || "#";
    const route = routes[path] || routes[404];
  
    try {
      const html = await fetch(route).then((data) => data.text());
      document.getElementById("app").innerHTML = html;
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



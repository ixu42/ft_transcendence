// popups.js

export function showPopup() {
    const existingPopup = document.getElementById("generic-popup");
    if (existingPopup) return; // Prevent multiple popups
  
    // Create overlay to detect outside clicks
    const overlay = document.createElement("div");
    overlay.id = "popup-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "999";
  
    // Create popup container
    const popup = document.createElement("div");
    popup.id = "generic-popup";
    popup.style.background = "green";
    popup.style.padding = "20px";
    popup.style.borderRadius = "8px";
    popup.style.textAlign = "center";
    popup.style.width = "320px";
    popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  
    // Add dynamic message text based on current route
    const messageText = document.createElement("p");
    messageText.color = "white";
    messageText.innerText = "🔒 Please login or register to view this page!";
    messageText.style.marginBottom = "20px";
    messageText.style.fontSize = "16px";
    messageText.style.color = "#333";
    popup.appendChild(messageText);
  
    // Create button
    const button = document.createElement("button");
    button.innerText = "Login / Register";
    button.style.padding = "10px 15px";
    button.style.background = "#007bff";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.fontSize = "16px";
  
    button.addEventListener("click", () => {
      overlay.remove();
      window.location.hash = "#login";
    });
  
    popup.appendChild(button);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  
    // Close popup when clicking outside of it
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        overlay.remove();
      }
    });
  }
  
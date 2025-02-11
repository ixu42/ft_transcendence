
const logout = async () => {
    console.log("Logout button clicked");

    const csrfToken = await getCSRFCookie();
    if (!csrfToken) {
        return console.error("❌ CSRF Token is missing.");
    }
    const response = await fetch("http://localhost:8000/users/logout/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        credentials: "include",
    });

    if (response.ok) {
        console.log("✅ Logout successful");
        document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.setItem("isLoggedIn", "false");
        updateNavbar();
        window.location.hash = "#login";
    } else {
        const { errors } = await response.json();
        console.error("❌ Logout failed:", errors);
    }
};

const setupProfilePage = () => {
    console.log("⚡ setupProfilePage() called!");

    fetchProfileData();
    setupAvatarUpload();
    setupButtons();
};

const fetchProfileData = async () => {
    try {
        const response = await fetch("http://localhost:8000/users/profile/", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            console.error("❌ Failed to fetch profile data:", response.status);
            return;
        }

        const data = await response.json();
        console.log("✅ Profile data fetched:", data);

        updateProfileUI(data);
    } catch (error) {
        console.error("❌ Error fetching profile data:", error);
    }
};

// Update profile UI elements
const updateProfileUI = (data) => {
    const avatarUrl = data.avatar.startsWith("/") 
        ? `http://localhost:8000${data.avatar}` 
        : data.avatar;

    const elementsToUpdate = [
        { selector: ".profile-avatar", value: avatarUrl, type: "src" },
        { selector: ".profile-username", value: data.username || "Username", type: "text" },
        { selector: ".profile-email", value: data.email || "Email", type: "text" },
        { selector: ".profile-first-name", value: data.first_name || "First Name", type: "text" },
        { selector: ".profile-last-name", value: data.last_name || "Last Name", type: "text" }
    ];

    elementsToUpdate.forEach(({ selector, value, type }) => {
        const element = document.querySelector(selector);
        if (element) {
            if (type === "src") {
                element.src = value;
            } else if (type === "text") {
                element.textContent = value;
            }
        }
    });
    updateTournamentsList(data.participated_tournaments);
};


// Update tournaments list
const updateTournamentsList = (tournaments) => {
    const tournamentsElement = document.querySelector(".profile-tournaments");
    if (!tournamentsElement) return;

    tournamentsElement.innerHTML = (tournaments && tournaments.length > 0)
        ? tournaments.map(tournament => `
            <div class="tournament-item">
                <strong>${tournament.name}</strong>
                <span>Status: ${tournament.status}</span>
                <span>Started at: ${new Date(tournament.started_at).toLocaleDateString()}</span>
            </div>
        `).join("")
        : "<p>No tournaments participated yet.</p>";
};


const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const csrfToken = await getCSRFCookie();
        const response = await fetch("http://localhost:8000/users/avatar/", {
            method: "POST",
            headers: { "X-CSRFToken": csrfToken },
            body: formData,
            credentials: "include",
        });

        if (!response.ok) {
            const data = await response.json();
            console.error("❌ Failed to update avatar:", data.errors);
            return;
        }

        const data = await response.json();
        console.log("✅ Avatar updated:", data.message);

        setElementSrc(".profile-avatar", `http://localhost:8000${data.avatar_url}`);
        fetchProfileData(); // Refresh profile data
    } catch (error) {
        console.error("❌ Error updating avatar:", error);
    }
};


const setupAvatarUpload = () => {
    const avatarUpload = document.getElementById("avatar-upload");
    if (avatarUpload) {
        avatarUpload.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) handleAvatarUpload(file);
        });
    }
};

const setupButtons = () => {
    [
        { selector: "#profile-logout-btn", callback: logout, message: "✅ Found logout button" },
        { selector: "#profile-menu-btn", callback: () => {
            console.log("📌 Menu button clicked");
            window.location.hash = "#menu";
        }, message: "✅ Found menu button" }
    ].forEach(({ selector, callback, message }) => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(message);
            element.addEventListener("click", callback);
        } else {
            console.warn(`⚠️ ${selector} not found.`);
        }
    });
};


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

    try {
        fetchProfileData(); // Ensure this does not overwrite the whole page
        setupAvatarUpload();
        setupButtons();
        setupEditProfile();
        setupMatchHistoryModal();
    } catch (error) {
        console.error("❌ Error in setupProfilePage:", error);
    }
};


const fetchProfileData = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        console.error("❌ User ID not found in localStorage. Redirecting to login...");
        window.location.hash = "#login";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/users/${userId}/`, {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Failed to fetch profile data:", data.errors || response.status);
            
            if (response.status === 403 || response.status === 401) {
                alert("❌ You are not authorized. Redirecting to login.");
                localStorage.removeItem("user_id");
                localStorage.removeItem("isLoggedIn");
                window.location.hash = "#login";
            }
            return;
        }

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
        : data.avatar || '/static/avatars/default.png';

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
};


const setupMatchHistoryModal = () => {
    const matchHistoryModal = document.getElementById("profile-match-history-modal");
    const closeMatchHistoryModalButton = document.getElementById("close-match-history-modal");
    const matchHistoryContainer = document.querySelector(".profile-match-history");
    const viewMatchHistoryButton = document.getElementById("profile-view-match-history-btn");

    viewMatchHistoryButton.addEventListener("click", async () => {
        matchHistoryContainer.innerHTML = "<p>Loading match history...</p>";
        matchHistoryModal.classList.add("profile-match-history-modal-visible");
        matchHistoryModal.classList.remove("profile-match-history-modal-hidden");
        
        await fetchMatchHistory();
    });

    closeMatchHistoryModalButton.addEventListener("click", () => {
        matchHistoryModal.classList.remove("profile-match-history-modal-visible");
        matchHistoryModal.classList.add("profile-match-history-modal-hidden");
        matchHistoryContainer.innerHTML = "";
    });

    matchHistoryModal.addEventListener("click", (event) => {
        if (event.target === matchHistoryModal) {
            matchHistoryModal.classList.remove("profile-match-history-modal-visible");
            matchHistoryModal.classList.add("profile-match-history-modal-hidden");
            matchHistoryContainer.innerHTML = "";
        }
    });

    const fetchMatchHistory = async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            console.error("❌ User ID not found in localStorage.");
            return;
        }

        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`http://localhost:8000/users/${userId}/match-history/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error fetching match history:", errorData.errors);
                matchHistoryContainer.innerHTML = `<p class="error-message">${errorData.errors}</p>`;
                return;
            }

            const data = await response.json();
            displayMatchHistory(data.match_history);
        } catch (error) {
            console.error("Network error fetching match history:", error);
            matchHistoryContainer.innerHTML = `<p class="error-message">Failed to load match history. Please try again.</p>`;
        }
    };

    const displayMatchHistory = (matches) => {
        if (matches.length === 0) {
            matchHistoryContainer.innerHTML = "<p>No match history found.</p>";
            return;
        }

        matchHistoryContainer.innerHTML = matches.map(match => `
            <div class="match-history-item">
                <p><strong>Game ID:</strong> ${match.game_id}</p>
                <p><strong>Date:</strong> ${new Date(match.date_played).toLocaleString()}</p>
                <p><strong>Players:</strong> ${match.player1} vs ${match.player2}</p>
                <p><strong>Winner:</strong> ${match.winner}</p>
                <p><strong>Score:</strong> ${match.player1_score} - ${match.player2_score}</p>
            </div>
        `).join("");
    };
};

// Function to handle account deletion
const handleAccountDeletion = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("User not logged in.");
        return;
    }

    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

    if (isConfirmed) {
        try {
            const csrfToken = await getCSRFCookie(); // If using CSRF protection
            const response = await fetch(`http://localhost:8000/users/${userId}/`, {
                method: "DELETE",
                headers: { "X-CSRFToken": csrfToken },
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                alert("❌ Failed to delete account: " + (data.errors || "Unknown error"));
                return;
            }

            alert("✅ Account deleted successfully.");
            localStorage.clear();
            window.location.hash = "#login";
        } catch (error) {
            console.error("❌ Error deleting account:", error);
            alert("❌ Error deleting account.");
        }
    }
};

// Button callbacks for profile page
const setupButtons = () => {
    [
        { selector: "#profile-logout-btn", callback: logout, message: "✅ Found logout button" },
        { selector: "#profile-menu-btn", callback: () => {
            console.log("📌 Menu button clicked");
            window.location.hash = "#menu";
        }, message: "✅ Found menu button" },
        { selector: "#delete-account-btn", callback: handleAccountDeletion, message: "✅ Found delete account button" },
        { selector: "#edit-profile-btn", callback: () => {
            console.log("📌 Edit Profile button clicked");
            document.getElementById("profile-edit-modal").classList.add("profile-edit-modal-visible");
        }, message: "✅ Found edit profile button" },
        { selector: "#profile-view-match-history-btn", callback: () => {
            console.log("📌 View Match History button clicked");
            const matchHistoryModal = document.querySelector("#profile-match-history-modal");
            matchHistoryModal.classList.add("profile-match-history-modal-visible");
            matchHistoryModal.classList.remove("profile-match-history-modal-hidden");
        }, message: "✅ Found match history button" }
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




// Setup for edit profile modal
const setupEditProfile = () => {
    const editProfileBtn = document.getElementById("edit-profile-btn");
    const profileEditModal = document.getElementById("profile-edit-modal");
    const closeProfileModal = document.getElementById("close-profile-modal");
    const saveProfileBtn = document.getElementById("save-profile-btn");

    editProfileBtn.addEventListener("click", () => {
        document.getElementById("edit-username").value = document.querySelector(".profile-username").textContent;
        document.getElementById("edit-email").value = document.querySelector(".profile-email").textContent;
        document.getElementById("edit-first-name").value = document.querySelector(".profile-first-name").textContent;
        document.getElementById("edit-last-name").value = document.querySelector(".profile-last-name").textContent;

        profileEditModal.classList.add("profile-edit-modal-visible"); // Show modal with animation
    });
    closeProfileModal.addEventListener("click", () => {
        profileEditModal.classList.remove("profile-edit-modal-visible"); // Hide modal with animation
    });
    profileEditModal.addEventListener("click", (event) => {
        if (event.target === profileEditModal) { // Only close when clicking outside the modal content
            profileEditModal.classList.remove("profile-edit-modal-visible");
        }
    });
    saveProfileBtn.addEventListener("click", async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        const updatedData = {
            username: document.getElementById("edit-username").value,
            email: document.getElementById("edit-email").value,
            first_name: document.getElementById("edit-first-name").value,
            last_name: document.getElementById("edit-last-name").value,
        };

        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`http://localhost:8000/users/${userId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify(updatedData),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Failed to update profile:", data.errors);
                alert("❌ Failed to update profile: " + (data.errors || "Unknown error"));
                return;
            }

            console.log("✅ Profile updated successfully:", data);
            alert("✅ Profile updated successfully!");
            fetchProfileData();
            profileEditModal.classList.remove("profile-edit-modal-visible");
        } catch (error) {
            console.error("❌ Error updating profile:", error);
            alert("❌ Error updating profile.");
        }
    });
};


// Function to handle avatar upload
const setupAvatarUpload = () => {

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
    
            const data = await response.json();
    
            if (!response.ok) {
                console.error("❌ Failed to update avatar:", data.errors);
                return;
            }
    
            console.log("✅ Avatar updated:", data.message);
            const newAvatarUrl = `http://localhost:8000${data.avatar_url}`;
    
            document.querySelector(".profile-avatar").src = newAvatarUrl;
            localStorage.setItem("user_avatar", newAvatarUrl);
            fetchProfileData(); 
        } catch (error) {
            console.error("❌ Error updating avatar:", error);
        }
    };

    const avatarUpload = document.getElementById("avatar-upload");
    if (avatarUpload) {
        avatarUpload.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) handleAvatarUpload(file);
        });
    }
};


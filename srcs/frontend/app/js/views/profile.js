
const logout = async () => {
    console.log("Logout button clicked");

    try {
        const csrfToken = await getCSRFCookie();
        console.log("CSRF Token:", csrfToken);

        if (!csrfToken) {
            console.error("❌ CSRF Token is missing.");
            return;
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
            const data = await response.json();
            console.error("❌ Logout failed:", data.errors);
        }
    } catch (error) {
        console.error("❌ Error during logout:", error);
    }
};



const setupProfilePage = () => {
    console.log("⚡ setupProfilePage() called!");

    // Fetch profile data and update the DOM
    const fetchProfileData = async () => {
        try {
            const response = await fetch("http://localhost:8000/users/profile/", {
                method: "GET",
                credentials: "include", // Include cookies for authentication
            });

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Profile data fetched:", data);

                // Update the avatar image in the DOM
                const avatarElement = document.querySelector(".profile-avatar");
                if (data.avatar) {
                    avatarElement.src = data.avatar; // Set the avatar URL
                } else {
                    avatarElement.src = "/static/avatars/default.png"; // Fallback to default avatar
                }

                // Update the username
                const usernameElement = document.querySelector(".profile-username");
                if (usernameElement) {
                    usernameElement.textContent = data.username || "Username";
                }

                // Update the email
                const emailElement = document.querySelector(".profile-email");
                if (emailElement) {
                    emailElement.textContent = data.email || "Email";
                }

                // Update the first name
                const firstNameElement = document.querySelector(".profile-first-name");
                if (firstNameElement) {
                    firstNameElement.textContent = data.first_name || "First Name";
                }

                // Update the last name
                const lastNameElement = document.querySelector(".profile-last-name");
                if (lastNameElement) {
                    lastNameElement.textContent = data.last_name || "Last Name";
                }

                // Update the participated tournaments
                const tournamentsElement = document.querySelector(".profile-tournaments");
                if (tournamentsElement) {
                    if (data.participated_tournaments && data.participated_tournaments.length > 0) {
                        // Create a list of tournaments
                        const tournamentList = data.participated_tournaments
                            .map(tournament => `
                                <div class="tournament-item">
                                    <strong>${tournament.name}</strong>
                                    <span>Status: ${tournament.status}</span>
                                    <span>Started at: ${new Date(tournament.started_at).toLocaleDateString()}</span>
                                </div>
                            `)
                            .join("");

                        // Insert the list into the tournaments container
                        tournamentsElement.innerHTML = tournamentList;
                    } else {
                        // Display a message if no tournaments are found
                        tournamentsElement.innerHTML = "<p>No tournaments participated yet.</p>";
                    }
                }
            } else {
                console.error("❌ Failed to fetch profile data:", response.status);
            }
        } catch (error) {
            console.error("❌ Error fetching profile data:", error);
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = async (file) => {
        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch("http://localhost:8000/users/avatar/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Avatar updated:", data.message);

                // Update the avatar image in the DOM
                const avatarElement = document.querySelector(".profile-avatar");
                avatarElement.src = data.avatar_url;

                // Refetch the profile data to update other fields
                fetchProfileData();
            } else {
                const data = await response.json();
                console.error("❌ Failed to update avatar:", data.errors);
            }
        } catch (error) {
            console.error("❌ Error updating avatar:", error);
        }
    };

    // Add event listener to the file input for avatar upload
    const avatarUpload = document.getElementById("avatar-upload");
    if (avatarUpload) {
        avatarUpload.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                handleAvatarUpload(file);
            }
        });
    }

    // Add event listeners for logout and menu buttons
    const logoutButton = document.getElementById("profile-logout-btn");
    const menuButton = document.getElementById("profile-menu-btn");

    if (logoutButton) {
        console.log("✅ Found logout button, adding event listener...");
        logoutButton.addEventListener("click", logout);
    } else {
        console.warn("⚠️ Logout button not found.");
    }

    if (menuButton) {
        menuButton.addEventListener("click", () => {
            console.log("📌 Menu button clicked");
            window.location.hash = "#menu";
        });
    } else {
        console.warn("⚠️ Menu button not found.");
    }

    // Fetch profile data when the profile page is loaded
    fetchProfileData();
};
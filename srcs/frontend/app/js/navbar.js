async function updateNavbar() {
    console.log("Updating navbar...");

    const authButton = document.getElementById("tr-auth-btn");
    const homeButton = document.getElementById("tr-home-btn");
    const friendsButton = document.getElementById("tr-friends-btn");
    const friendsDropdown = document.getElementById("friends-dropdown");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    console.log("Is logged in?", isLoggedIn);

    if (authButton) {
        if (isLoggedIn) {
            authButton.innerHTML = '<img src="static/icons/profile30x30.png" alt="Profile" class="tr-navbar-icon"> Profile';
            authButton.onclick = () => (window.location.hash = "#profile");
        } else {
            authButton.innerHTML = '<img src="static/icons/login32x32.png" alt="Login" class="tr-navbar-icon"> Login / Register';
            authButton.onclick = () => (window.location.hash = "#login");
        }
    }

    if (homeButton) {
        homeButton.innerHTML = '<img src="static/icons/home30x30.svg" alt="Home" class="tr-navbar-icon"> Home';
        homeButton.onclick = () => (window.location.hash = "#menu");
    }

    if (friendsButton) {
        if (isLoggedIn) {
            console.log("User is logged in. Enabling friends dropdown...");
            friendsDropdown.style.display = "inline-block";

            // Set up the friends button logic
            setupFriendsButton(friendsButton);
        } else {
            console.log("User is not logged in. Hiding friends dropdown...");
            friendsDropdown.style.display = "none";
        }
    }
}

async function setupFriendsButton(friendsButton) {
    const friendsDropdownContent = document.getElementById("friends-dropdown-content");
    const sendFriendRequestBtn = document.getElementById("send-friend-request-btn");
    let isFetching = false;

    // Fetch friends on hover
    friendsButton.addEventListener("mouseenter", async () => {
        if (isFetching) return;
        isFetching = true;

        console.log("Friends button hovered. Fetching friends...");

        const userId = localStorage.getItem("user_id");
        console.log("User ID:", userId);

        if (userId) {
            const friends = await fetchFriends(userId);
            console.log("Fetched friends:", friends);
            populateFriendsDropdown(friendsDropdownContent, friends);
        }
        isFetching = false;
    });

    // Send friend request
    if (sendFriendRequestBtn) {
        sendFriendRequestBtn.replaceWith(sendFriendRequestBtn.cloneNode(true));
        const newSendFriendRequestBtn = document.getElementById("send-friend-request-btn");

        newSendFriendRequestBtn.addEventListener("click", async () => {

            const userIdInput = document.getElementById("friend-id-input");
            const friendId = userIdInput.value.trim();

            if (!friendId) {
                alert("Please enter a valid User ID.");
                return;
            }

            try {
                const response = await fetch(`/api/users/${friendId}/friends/`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": await getCSRFCookie(),
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.errors || "Failed to send friend request.");
                }

                const data = await response.json();
                alert(data.message || "Friend request sent successfully!");
                userIdInput.value = "";
            } catch (error) {
                console.error("Error sending friend request:", error);
                alert(error.message);
            }
        });
    }
}

// Function to fetch friends
async function fetchFriends(userId) {
    try {
        console.log("Fetching friends for user ID:", userId);

        const response = await fetch(`/api/users/${userId}/friends/`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": await getCSRFCookie(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch friends: ${response.status}`);
        }

        const data = await response.json();
        console.log("Friends data:", data);
        return data.friends;
    } catch (error) {
        console.error("Error fetching friends:", error);
        return [];
    }
}

function populateFriendsDropdown(container, friends) {
    if (!container) return;

    let friendListContainer = container.querySelector('.friend-list-container');

    if (!friendListContainer) {
        friendListContainer = document.createElement('div');
        friendListContainer.className = 'friend-list-container';
        container.appendChild(friendListContainer);
    }
    friendListContainer.innerHTML = "";
    if (friends.length === 0) {
        const noFriendsMessage = document.createElement("div");
        noFriendsMessage.className = "friend-item";
        noFriendsMessage.textContent = "No friends found.";
        friendListContainer.appendChild(noFriendsMessage);
    } else {
        friends.forEach(friend => {
            const friendItem = document.createElement("div");
            friendItem.className = "friend-item";
            friendItem.innerHTML = `
                <img src="${friend.avatar}" alt="${friend.username}" class="friend-avatar">
                <span>${friend.username} (ID: ${friend.id})</span>
            `;
            friendListContainer.appendChild(friendItem);
        });
    }
}

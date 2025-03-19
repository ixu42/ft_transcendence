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

        console.log("Friends button hovered. Fetching friends and requests...");

        const userId = localStorage.getItem("user_id");
        console.log("User ID:", userId);

        if (userId) {
            // Fetch friends
            const friendsSection = document.getElementById("friends-section");
            const friends = await fetchFriends(userId);
            console.log("Fetched friends:", friends);
            populateFriendsDropdown(friendsSection, friends);

            // Fetch friend requests
            const friendRequestsSection = document.getElementById("friend-requests-section");
            const friendRequests = await fetchFriendRequests(userId);
            console.log("Fetched friend requests:", friendRequests);
            populateFriendRequests(friendRequestsSection, friendRequests);
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

// Function to fetch friend requests
async function fetchFriendRequests(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/friends/requests/`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": await getCSRFCookie(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch friend requests: ${response.status}`);
        }

        const data = await response.json();
        return data.friend_requests;
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        return [];
    }
}

function populateFriendRequests(container, requests) {
    if (!container) return;
    
    async function handleFriendRequestAction(requestId, action) {
        try {
            const userId = localStorage.getItem("user_id");
            const accepted = action === 'accept';
    
            const response = await fetch(`/api/users/${userId}/friends/requests/${requestId}/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': await getCSRFCookie(),
                },
                body: JSON.stringify({ accepted: accepted }), 
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors || `Failed to ${action} friend request.`);
            }
    
            const data = await response.json();
            alert(data.message || `Friend request ${action}ed.`);
    
        } catch (error) {
            console.error(`Error ${action}ing friend request:`, error);
            alert(error.message);
        }
    }
    
    container.innerHTML = ""; 

    if (requests.length === 0) {
        const noRequestsMessage = document.createElement("div");
        noRequestsMessage.className = "friend-item";
        noRequestsMessage.textContent = "No friend requests.";
        container.appendChild(noRequestsMessage);
    } else {
        requests.forEach(request => {
            const requestItem = document.createElement("div");
            requestItem.className = "friend-item";
            requestItem.innerHTML = `
                <span>${request.sender}</span>
                <button class="accept-request-btn" data-id="${request.id}">Accept</button>
                <button class="decline-request-btn" data-id="${request.id}">Decline</button>
            `;
            container.appendChild(requestItem);
        });
        // Add event listeners for accept and decline buttons
        container.querySelectorAll('.accept-request-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const requestId = button.dataset.id;
                await handleFriendRequestAction(requestId, 'accept');
            });
        });

        container.querySelectorAll('.decline-request-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const requestId = button.dataset.id;
                await handleFriendRequestAction(requestId, 'decline');
            });
        });
    }
}

function populateFriendsDropdown(container, friends) {
    if (!container) return;

    async function handleUnfriend(friendId) {
        try {
            const userId = localStorage.getItem("user_id");
    
            const response = await fetch(`/api/users/${userId}/friends/${friendId}/`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': await getCSRFCookie(),
                },
            });
    
            if (!response.ok) {
                // Check for 204 No Content
                if (response.status === 204) {
                    alert("Friend removed successfully.");
                    return; // Exit the function early
                }
    
                // Handle other errors
                const errorData = await response.json();
                throw new Error(errorData.errors || "Failed to unfriend.");
            }
    
            alert("Friend removed successfully.");
    
        } catch (error) {
            console.error("Error unfriending:", error);
            alert(error.message);
        }
    }

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
            const onlineIndicator = friend.online 
                ? `<span style="color:green;">Online</span>` 
                : `<span style="color:red;">Offline</span>`;
            const friendItem = document.createElement("div");
            friendItem.className = "friend-item";
            friendItem.innerHTML = `
                <img src="${fixAvatarURL(friend.avatar)}" alt="${friend.username}" class="friend-avatar">
                <span>${friend.username} - ${onlineIndicator}</span>
                <button class="unfriend-btn" data-id="${friend.id}">Unfriend</button>
            `;
            friendListContainer.appendChild(friendItem);
        });
        friendListContainer.querySelectorAll('.unfriend-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const friendId = button.dataset.id;
                await handleUnfriend(friendId);
                const userId = localStorage.getItem("user_id");
                const friends = await fetchFriends(userId);
                populateFriendsDropdown(container, friends);
            });
        });
    }
}


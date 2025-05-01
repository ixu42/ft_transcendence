
async function updateNavbar() {

    const authButton = document.getElementById("tr-auth-btn");
    const profileDropdown = document.getElementById("profile-dropdown");
    const homeButton = document.getElementById("tr-home-btn");
    const friendsButton = document.getElementById("tr-friends-btn");
    const friendsDropdown = document.getElementById("friends-dropdown");

    if (authButton) {
        authButton.innerHTML = '<img src="static/icons/profile30x30.png" alt="Profile" class="tr-navbar-icon"> Users';
        profileDropdown.style.display = "inline-block";
        setupProfileButton(authButton);
    }

    if (homeButton) {
        homeButton.innerHTML = '<img src="static/icons/home30x30.svg" alt="Home" class="tr-navbar-icon"> Home';
        homeButton.onclick = () => (window.location.hash = "#menu");
    }

    const isAnyUserLoggedIn = getLoggedInUsers().some(user => user.loggedIn);

    if (friendsButton) {
        if (isAnyUserLoggedIn) {
            friendsDropdown.style.display = "inline-block";
            setupFriendsButton(friendsButton);
        } else {
            friendsDropdown.style.display = "none";
        }
    }
}


function handleLogout(userId) {
    logoutUser(userId);
    const dropdown = document.querySelector('.profile-list-container');
    if (dropdown) {
        dropdown.parentElement.style.display = 'none';
    }
}

function populateProfileDropdown(container, userDataArray) {

    const activeUsers = getLoggedInUsers().filter(user => user.loggedIn && user.id);


    const userEntries = activeUsers.length > 0
        ? activeUsers.map(user => {
            const userData = userDataArray && userDataArray.find(data => data && data.id === user.id);
            const avatar = userData ? fixAvatarURL(userData.avatar) : "api/static/avatars/default.png";
            return `
                <div class="profile-item">
                    <img src="${avatar}" alt="${user.username}" class="profile-avatar-dropdown">
                    <span>${user.username}</span>
                    <button class="profile-link-btn tr-nav-btn" onclick="window.location.hash='#profile?user_id=${user.id}'">
                        <img src="static/icons/profile30x30.png" alt="Profile" class="tr-navbar-icon"> Profile
                    </button>
                    <button class="profile-link-btn tr-nav-btn" onclick="handleLogout('${user.id}')">
                        Logout
                    </button>
                </div>
            `;
        }).join("")
        : `<div class="profile-item no-profile">No logged-in users</div>`;

    const otherEntry = `
        <div class="profile-item">
            <img src="api/static/avatars/default.png" alt="Empty Profile" class="profile-avatar-dropdown">
            <span>Other User?</span>
            <button class="profile-link-btn tr-nav-btn" onclick="window.location.hash='#login'">
                <img src="static/icons/login32x32.png" alt="Login" class="tr-navbar-icon"> Login / Register
            </button>
        </div>
    `;

    container.innerHTML = `
        <div class="profile-list-container">
            ${userEntries}
            ${otherEntry}
        </div>
        <hr style="width: 90%; height: 2px; background-color: #ccc; margin: 0 5px;">
    `;
}

 
  
async function setupProfileButton(profileButton) {
    const dropdown = document.getElementById("profile-dropdown-content");
    const friendsDropdownContent = document.getElementById("friends-dropdown-content");
    let isOpen = false;

    profileButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (isOpen)
        {
            dropdown.style.display = "none";
            isOpen = false;
        }
        else
        {
            if (friendsDropdownContent) 
                friendsDropdownContent.style.display = "none";
            const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn && user.id);
            const userDataArray = loggedInUsers.length > 0
                ? await Promise.all(loggedInUsers.map(user => fetchProfileDataById(user.id)))
                : [];

            populateProfileDropdown(dropdown, userDataArray);
            dropdown.style.display = "block";
            isOpen = true;
        }
    });
    document.addEventListener("click", (event) => {
        if (isOpen && !dropdown.contains(event.target) && !profileButton.contains(event.target)) {
            dropdown.style.display = "none";
            isOpen = false;
        }
    });
    dropdown.addEventListener("click", (event) => {
        event.stopPropagation();
    });
}

async function setupFriendsButton(friendsButton) {
    const friendsDropdownContent = document.getElementById("friends-dropdown-content");
    const profileDropdown = document.getElementById("profile-dropdown-content");
    const sendFriendRequestBtn = document.getElementById("send-friend-request-btn");
    let isOpen = false;
    let isFetching = false;
    const loggedInUsers = getLoggedInUsers().filter(user => user.loggedIn);
    let userSelectorHtml = "";

    if (loggedInUsers.length > 1) {
        userSelectorHtml = `
            <div id="friends-user-selector-container" style="margin-bottom: 10px;">
                <select id="friends-user-selector" style="padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff; font-size: 1rem;">
                    ${loggedInUsers.map(user => `<option value="${user.id}">${user.username}</option>`).join("")}
                </select>
            </div>
        `;
    } else if (loggedInUsers.length === 1) {
        userSelectorHtml = `
            <div id="friends-user-selector-container" style="margin-bottom: 10px;">
                <span id="friends-user-selector" data-user-id="${loggedInUsers[0].id}" style="display: inline-block; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff; font-size: 1rem;">
                    ${loggedInUsers[0].username}
                </span>
            </div>
        `;
    }

    async function updateFriendsForUser(userId) {
        const friendsSection = document.getElementById("friends-section");
        const friendRequestsSection = document.getElementById("friend-requests-section");
        try {
            const friends = await fetchFriends(userId);
            populateFriendsDropdown(friendsSection, friends, userId);
            const friendRequests = await fetchFriendRequests(userId);
            populateFriendRequests(friendRequestsSection, friendRequests, userId);
        } catch (error) {
            console.error(`Error fetching friends for user ${userId}:`, error);
        }
    }

    friendsButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (isOpen)
        {
            friendsDropdownContent.style.display = "none";
            isOpen = false;
        }
        else
        {
            if (isFetching) return;
            isFetching = true;

            if (profileDropdown) 
                profileDropdown.style.display = "none";
            if (!document.getElementById("friends-user-selector") && userSelectorHtml) {
                friendsDropdownContent.insertAdjacentHTML("afterbegin", userSelectorHtml);
                const selector = document.getElementById("friends-user-selector");
                if (selector.tagName.toLowerCase() === "select") {
                    selector.addEventListener("change", () => updateFriendsForUser(selector.value));
                }
            }

            let currentUserId;
            const selector = document.getElementById("friends-user-selector");
            if (selector)
            {
                if (selector.tagName.toLowerCase() === "select")
                    currentUserId = selector.value;
                else
                    currentUserId = selector.getAttribute("data-user-id");
            }
            if (currentUserId)
                await updateFriendsForUser(currentUserId);
            friendsDropdownContent.style.display = "block";
            isOpen = true;
            isFetching = false;
        }
    });

    document.addEventListener("click", (event) => {
        if (isOpen && !friendsDropdownContent.contains(event.target) && !friendsButton.contains(event.target))
        {
            friendsDropdownContent.style.display = "none";
            isOpen = false;
        }
    });

    friendsDropdownContent.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    if (sendFriendRequestBtn) {
        const newSendBtn = sendFriendRequestBtn.cloneNode(true);
        sendFriendRequestBtn.parentNode.replaceChild(newSendBtn, sendFriendRequestBtn);
        newSendBtn.addEventListener("click", async () => {
            const friendUsername = document.getElementById("friend-username-input").value.trim();
            if (!friendUsername) {
                alert("Please enter a valid username.");
                return;
            }
            let currentUserId;
            const selector = document.getElementById("friends-user-selector");
            if (selector) {
                if (selector.tagName.toLowerCase() === "select") {
                    currentUserId = selector.value;
                } else {
                    currentUserId = selector.getAttribute("data-user-id");
                }
            }
            if (!currentUserId) {
                alert("No user selected for sending friend request.");
                return;
            }
            try {
                const response = await fetch(
                    `api/users/${currentUserId}/friends/requests/?recipient_username=${encodeURIComponent(friendUsername)}`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: { "X-CSRFToken": await getCSRFCookie() },
                    }
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error:", errorData);
                    alert(`Error: ${errorData.errors || response.statusText}`);
                    return;
                }
                alert("Friend request sent!");
            } catch (error) {
                console.error("Friend request error:", error);
                alert("Something went wrong. Please try again.");
            }
        });
    }
}

// Function to fetch friends
async function fetchFriends(userId) {
    try {

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

function populateFriendRequests(container, requests, userId) {
    if (!container) return;
    
    async function handleFriendRequestAction(requestId, action) {
        try {
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

function populateFriendsDropdown(container, friends, userId) {
    if (!container) return;

    async function handleUnfriend(friendId) {
        try {
    
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
                const friends = await fetchFriends(userId);
                populateFriendsDropdown(container, friends);
            });
        });
    }
}


async function listAndSelectLoggedInUser() {
    try {
        const loggedInUsers = getLoggedInUsers();
        const activeUsers = loggedInUsers.filter(user => user.loggedIn);

        if (activeUsers.length === 0) {
            console.error("❌ No logged-in users found.");
            return null;
        }
        if (activeUsers.length === 1) {
            return activeUsers[0].id;
        }

        const promptUser = async () => {
            const userList = activeUsers
                .map((user, index) => `${index + 1}. ${user.username}`)
                .join('\n');
            const promptMessage = `Select a logged-in user by entering the number:\n${userList}\n\nEnter number (1-${activeUsers.length}) or Cancel to exit:`;

            return new Promise((resolve) => {
                const userInput = prompt(promptMessage);
                if (userInput === null || userInput.trim().toLowerCase() === 'cancel') {
                    resolve(null);
                    return;
                }
                const selectedIndex = parseInt(userInput, 10) - 1;
                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= activeUsers.length) {
                    console.error(`❌ Invalid selection: ${userInput}. Please try again.`);
                    resolve(promptUser()); // Recursively prompt again
                    return;
                }
                const selectedUserId = activeUsers[selectedIndex].id;
                resolve(selectedUserId);
            });
        };

        return await promptUser();
    } catch (error) {
        console.error("Error listing logged-in users:", error);
        return null;
    }
}

function getLoggedInUsers() {
    return JSON.parse(localStorage.getItem('loggedInUsers') || '[]');
}

async function syncLoggedInUsersWithBackend() {
    try {
        const response = await apiRequest('users/', 'GET');
        if (response.error) {
            console.error('Failed to sync with backend:', response.error);
            return getLoggedInUsers();
        }
        
        const backendUsers = response.users || [];
        for (const user of backendUsers) {
            await addOrUpdateLoggedInUser({
                id: user.id,
                username: user.username,
                loggedIn: true
            });
        }

        return getLoggedInUsers();
    } catch (error) {
        console.error('Sync error:', error);
        return getLoggedInUsers();
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function addOrUpdateLoggedInUser(user) {
    const sanitizedUser = {
        id: user.id,
        username: user.username,
        loggedIn: user.loggedIn
    };

    const users = getLoggedInUsers();
    const index = users.findIndex(u => u.id === sanitizedUser.id);
    if (index > -1) {
        users[index] = sanitizedUser;
    } else {
        users.push(sanitizedUser);
    }
    localStorage.setItem('loggedInUsers', JSON.stringify(users));
}

async function removeLoggedInUser(userId) {
    await syncLoggedInUsersWithBackend();

    const users = getLoggedInUsers();
    const updatedUsers = users.filter(u => u.id.toString() !== userId.toString());
    localStorage.setItem('loggedInUsers', JSON.stringify(updatedUsers));
}

async function getCSRFCookie() {
    try {
        const response = await fetch("/api/get-csrf-token/", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch CSRF token: ${response.status}`);
        }

        const csrfToken = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        if (!csrfToken) {
            return "";
        }

        return csrfToken;
    } catch (error) {
        console.error("❌ CSRF Token fetch error:", error);
        return "";
    }
}

async function apiRequest(endpoint, method, body = null) {
    const url = `api/${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
    };
    const csrfToken = await getCSRFCookie();
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }
    const options = {
        method: method,
        headers: headers,
        credentials: "include",
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${JSON.stringify(errorData.errors || errorData.message)}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Request failed:', error);
        return { error: error.message };
    }
}

function getErrorMsgFromResponse(errorData, defaultMessage = "Unknown error") {
    let errorMessage = defaultMessage;

    if (errorData && typeof errorData === "object") {
        const firstField = Object.keys(errorData)[0];
        if (firstField && Array.isArray(errorData[firstField]) && errorData[firstField].length > 0) {
            errorMessage = errorData[firstField][0];
        } else {
            errorMessage = JSON.stringify(errorData);
        }
    }
    console.error(`❌ ${defaultMessage}: ${errorMessage}`);
    return errorMessage;
}

async function fetchProfileDataById(userId) {
    if (!userId) {
        console.error("User ID is missing.");
        return null;
    }
    try {
        const response = await fetch(`/api/users/${userId}/`, {
            method: "GET",
            credentials: "include",
            headers: {
                "X-CSRFToken": await getCSRFCookie(),
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("Failed to fetch profile data:", data.errors || response.status);
            return null;
        }
        return data;
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return null;
    }
}

const fixAvatarURL = (avatarPath) => {

    if (avatarPath.startsWith("avatars/")) {
        return `/api/media/${avatarPath}`;
    }
    return `/api${avatarPath}`;
};

const safeParseJSON = async response => {
    try {
        const clonedResponse = response.clone();
        data = await clonedResponse.json();
    } catch (err) {
        console.warn("⚠️ Failed to parse JSON, returning text:", err);
        data = await response.text();
    }
    return data;
};

const session_check = async () => {
    const users = getLoggedInUsers();
    const validUsers = [];

    for (const user of users) {
        const userId = user.id;
        if (!userId) continue;

        try {
            const response = await fetch(`/api/session-check/${userId}/`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                validUsers.push(user);
            } else {
                console.warn(`⚠️ Session expired for user ${userId}`);
            }
        } catch (err) {
            console.error(`❌ Error checking session for user ${userId}:`, err);
        }
    }
    if (users.length !== validUsers.length) {
        localStorage.setItem('loggedInUsers', JSON.stringify(validUsers));
    }
}


document.addEventListener("DOMContentLoaded", session_check);
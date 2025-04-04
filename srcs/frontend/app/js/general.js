

function getLoggedInUsers() {
    return JSON.parse(localStorage.getItem('loggedInUsers') || '[]');
}

function addOrUpdateLoggedInUser(user) {
    const sanitizedUser = {
        id: user.id,
        username: user.username,
        loggedIn: user.loggedIn
    };

    const users = getLoggedInUsers();
    const index = users.findIndex(u => u.username === sanitizedUser.username);
    if (index > -1) {
        users[index] = sanitizedUser;
    } else {
        users.push(sanitizedUser);
    }
    localStorage.setItem('loggedInUsers', JSON.stringify(users));
}

function removeLoggedInUser(userId) {
    const users = getLoggedInUsers();
    console.log("Before removal:", users);
    const updatedUsers = users.filter(u => u.id.toString() !== userId.toString());
    console.log("After removal:", updatedUsers);
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
            console.log("❌ CSRF Token not found.");
            return "";
        }

        console.log("🔑 CSRF Token fetched:", csrfToken);
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
    return `/api/${avatarPath}`;
};


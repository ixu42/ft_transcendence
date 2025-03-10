




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


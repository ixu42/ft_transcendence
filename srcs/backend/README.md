# API Documentation

A brief description of the API and example responses.

## Base URL

http://localhost:8000/api/

## Endpoints

### Admin panel

Access the Django Admin interface for managing the system and users.

<code>GET</code><code><b>admin/</b></code>

---

### User registration

Register a new user in the system.

<details>
    <summary><code>POST</code><code><b>users/register/</b></code></summary>

- **Expected Request Body**:
    ```json
    {
        "username": "user1",
        "password1": "securepassword123",
        "password2": "securepassword123"
    }
    ```
- **Response**
    - **201**
        ```json
        {
            "id": 1,
            "username": "user1",
            "message": "User created."
        }
        ```
    - **400**
        ```json
        {
            "errors": {"username": ["A user with that username already exists."]}
        }
        ```

</details>

---

### User login

Authenticate a user and logs them in. If a user fails to log in with incorrect credentials 5 times in a row, their account will be temporarily locked for 15 minutes to prevent brute-force attacks.

<details>
    <summary><code>POST</code><code><b>users/login/</b></code></summary>

- **Expected Request Body**:
    ```json
    {
        "username": "user1",
        "password": "securepassword123"
    }
    ```
- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "message": "Login successful."
        }
        ```
    - **400**
        - When the user is already logged in
            ```json
            {
                "errors": "User is already authenticated."
            }
            ```
    - **401**
            ```json
            {
                "errors": "Invalid password."
            }
            ```
            ```json
            {
                "errors": "Username does not exist."
            }
            ```
        - When username and/or password are/is missing
            ```json
            {
                "errors": "Username and password are required."
            }
            ```
    - **403**
        - When the user fails to log in due to incorrect credentials 5 times in a row
            ```json
            {
                "error": "Locked out due to too many login failures."
            }
            ```

</details>

---

### User logout

For the currently authenticated user to log out.

<details>
    <summary><code>POST</code><code><b>users/logout/</b></code></summary>

- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "message": "Logout successful."
        }
        ```
    - **401**
        - When the user is not logged in
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```

</details>

---

### User avatar upload

Allow users to upload a new avatar image.

<details>
    <summary><code>POST</code><code><b>users/avatar/</b></code></summary>

- **Expected Request Body**:
    The request should be a `multipart/form-data` request with the following field:
    `avatar: The avatar image file (JPG, JPEG, PNG) to be uploaded.`
- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "message": "Avatar updated.",
            "avatar_url": "/media/avatars/1/<filename>"
        }
        ```
    - **400**
        - When the file extension is not allowed
            ```json
            {
                "errors": {
                    "avatar": [
                        "File extension “gif” is not allowed. Allowed extensions are: jpg, jpeg, png."
                    ]
                }
            }
            ```
        - When the file size exceeds the limit
            ```json
            {
                "errors": {
                    "avatar": [
                        "File size exceeds the limit <MAX_FILE_SIZE> MB."
                    ]
                }
            }
            ```
        - When no file is uploaded
            ```json
            {
                "errors": "No file uploaded."
            }
            ```

</details>

---

### User profile info

Get details of the authenticated user's profile.

<details>
    <summary><code>GET</code><code><b>users/&lt;user_id&gt;/</b></code></summary>

- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "avatar": "/media/avatars/1/<filename>",
            "email": "<email>",
            "extra_fields": "..."
        }
        ```
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
            ```json
            {
                "errors": "You do not have permission to access this user's profile."
            }
            ```

</details>

---

### User profile update

Update details of the authenticated user's profile, include username, email, first_name, last_name.


<details>
    <summary><code>PATCH</code><code><b>users/&lt;user_id&gt;/</b></code></summary>

- **Expected Request Body**:
    ```json
    {
        "username": "test_update",
        "email": "test_update@email.com",
        "first_name": "test_update",
        "last_name": "test_update"
    }
- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "test_update",
            "message": "User profile updated."
        }
        ```
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
            ```json
            {
                "errors": "You do not have permission to access this user's profile."
            }
            ```

</details>

---

### User password update

Update the password of the authenticated user.

<details>
    <summary><code>POST</code><code><b>users/&lt;user_id&gt;/password/</b></code></summary>

- **Expected Request Body**:
    ```json
    {
        "old_password": "securepassword123",
        "new_password1": "securepassword456",
        "new_password2": "securepassword456"
    }
- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "message": "User password updated."
        }
        ```
    - **400**
        ```json
        {
            "errors": {
                "new_password2": [
                    "The two password fields didn’t match."
                ]
            }
        }
        ```
        ```json
        {
            "errors": {
                "new_password1": [
                    "New password cannot be the same as the old one."
                ]
            }
        }
        ```
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
            ```json
            {
                "errors": "You do not have permission to update password of this user."
            }
            ```

</details>

---

### User account deactivation

For the authenticated user to deactivate their account. Recommended by Django instead of deleting user account, as the related data to the user won't be affected.

<details>
    <summary><code>PATCH</code><code><b>users/&lt;user_id&gt;/</b></code></summary>

- **Expected Request Body**:
    ```json
    {
        "deactivate": true
    }
    ```
- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "message": "Account deactivated."
        }
        ```
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
            ```json
            {
                "errors": "You do not have permission to access this user's profile."
            }
            ```

</details>

---

### User account deletion

For the authenticated user to delete its account. In this case, user object and related data will be deleted from the database.

<details>
    <summary><code>DELETE</code><code><b>users/&lt;user_id&gt;/</b></code></summary>

- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "message": "Account deleted."
        }
        ```
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
            ```json
            {
                "errors": "You do not have permission to access this user's profile."
            }
            ```

</details>

---

### Participated tournaments

For the authenticated user to view their participated tournaments related info, including id, name, status, started_at, players.

<details>
    <summary><code>GET</code><code><b>users/&lt;user_id&gt;/tournaments/</b></code></summary>

- **Response** 
    - **200**
        ```json
        {
            "participated_tournaments": [
                {
                    "id": 1,
                    "name": "Player1's game",
                    "status": "PENDING",
                    "started_at": null,
                    "players": [
                        "user1",
                        "user2",
                        "user3"
                    ]
                }
                "... more items ..."
            ]
        }
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
            ```json
            {
                "errors": "You do not have permission to view participated tournaments of this user."
            }
            ```

</details>

---

### Match history

For the authenticated user to view their match history including date, winner, players and their scores.

<details>
    <summary><code>GET</code><code><b>users/&lt;user_id&gt;/match-history/</b></code></summary>

- **Response**
    - **200**
        ```json
        {
            "match_history": [
                {
                    "game_id": 2,
                    "date_played": "YYYY-MM-DDTHH:MM:SS.sssZ",
                    "player1:": "user1",
                    "player2": "user2",
                    "winner": "user2",
                    "player1_score": 7,
                    "player2_score": 10
                },
                {
                    "game_id": 1,
                    "date_played": "YYYY-MM-DDTHH:MM:SS.sssZ",
                    "player1:": "user1",
                    "player2": "user2",
                    "winner": "user1",
                    "player1_score": 10,
                    "player2_score": 8
                }
                "... more items ..."
            ]
        }
        ```
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
            ```json
            {
                "errors": "You do not have permission to view match history of this user."
            }
            ```

</details>

---

### Leaderboard

Get basic user info and game stats for all users.

<details>
    <summary><code>GET</code><code><b>users/leaderboard/</b></code></summary>

- **Response**
    - **200**
        ```json
        [
            {
                "id": 1,
                "username": "user1",
                "avatar": "/media/avatars/1/<filename>",
                "score": 100,
                "rank": 1,
                "extra_fields": "..."
            },
            {
                "id": 2,
                "username": "user2",
                "avatar": "/media/avatars/2/<filename>",
                "score": 80,
                "rank": 2,
                "extra_fields": "..."
            }
            "... more items ..."
        ]
        ```

</details>

---

### Listing friends

List all the friends of currently authenticated user.

<details>
    <summary>
        <code>GET</code>
        <code><b>users/&lt;user_id&gt;/friends/</b></code>
    </summary>

- **Response**
    - **200**
        ```json
        {
            "friends": [
                {
                    "id": 2,
                    "username": "user2",
                    "avatar": "/media/avatars/2/<filename>"
                }
                "... more items ..."
            ]
        }
        ```
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
            ```json
            {
                "errors": "You do not have permission to view friends of this user."
            }
            ```

</details>

---

### Friend request

Send a friend request to another user. Note that the user_id in url is the id of the recipient of this friend request.

<details>
    <summary>
        <code>POST</code>
        <code><b>users/&lt;user_id&gt;/friends/</b></code>
    </summary>

- **Response**
    - **201**
        ```json
        {
            "message": "Friend request sent."
        }
        ```
    - **400**
        - When the user_id in url matches the authenticated user's id
            ```json
            {
                "errors": "You cannot send a friend request to yourself."
            }
            ```
    - **401**
        - When the user is not authenticated
            ```json
            {
                "errors": "User is not authenticated."
            }
            ```
    - **404**
        - When the recipient's id does not exist in database
            ```json
            {
                "errors": "Recipient of the friend request not found."
            }
            ```

</details>

---

### Listing friend requests

List all the pending friend requests received by the authenticated user.

<details>
    <summary>
        <code>GET</code>
        <code><b>users/&lt;user_id&gt;/friends/requests/</b></code>
    </summary>

- **Response**
    - **200**
        ```json
        {
            "friend_requests": [
                {
                    "id": 1,
                    "sender": "user1",
                    "sent at": "YYYY-MM-DDTHH:MM:SS.sssZ"
                }
                "... more items ..."
            ]
        }
        ```
    - **401**
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```
    - **403**
        ```json
        {
            "errors": "You do not have permission to view another user's friend requests."
        }
        ```

</details>

---

### Friend request handling

Accept or reject a friend request.

<details>
    <summary>
        <code>POST</code>
        <code><b>users/&lt;user_id&gt;/friends/requests/&lt;request_id&gt;/</b></code>
    </summary>

- **Expected Request Body**:
    ```json
    {
        "accepted": true
    }
    ```
    - `accepted` (**boolean**): Can be **true** or **false** depending on whether the user accepts or rejects.
- **Response**
    - **200**
        ```json
        {
            "message": "Friend request accepted/rejected."
        }
        ```
    - **401**
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```
    - **403**
        ```json
        {
            "errors": "You do not have permission to handle another user's friend request."
        }
        ```
    - **404**
        ```json
        {
            "errors": "friend request not found"
        }
        ```

</details>

---

### Friend removal

Unfriend someone.

<details>
    <summary>
        <code>DELETE</code>
        <code><b>users/&lt;user_id&gt;/friends/requests/&lt;request_id&gt;/</b></code>
    </summary>

- **Response**
    - **204**
    - **400**
        ```json
        {
            "errors": "Not friends with this user(id=5)."
        }
        ```
    - **401**
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```
    - **403**
        ```json
        {
            "errors": "You do not have permission to remove any friend of this user."
        }
        ```

</details>

---

### Local 1v1 game creation

Create a local 1v1 game for a logged-in user.

<details>
    <summary>
        <code>POST</code>
        <code><b>games/local/</b></code>
    </summary>

- **Response**
    - **201**
        ```json
        {
            "message": "Local game created.",
            "game_id": 1
        }
        ```
    - **401**
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```

</details>

---

### Local AI game creation

Create a local 1v1 game against AI for a logged-in user.

<details>
    <summary>
        <code>POST</code>
        <code><b>games/ai/</b></code>
    </summary>

- **Response**
    - **201**
        ```json
        {
            "message": "AI game created.",
            "game_id": 2
        }
        ```
    - **401**
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```

</details>

---

### Saving game stats

Save the stats for a completed game for a logged-in user.

<details>
    <summary>
        <code>PATCH</code>
        <code><b>games/&lt;game_id&gt;/stats/</b></code>
    </summary>

- **Expected Request Body**:
    ```json
    {
        "player1_score": 6,
        "player2_score": 10
    }
    ```
- **Response**
    - **200**
        ```json
        {
            "message": "Game stats saved."
        }
        ```
    - **400**
        - When the data in Json payload is malformed
            ```json
            {
                "errors": "Invalid JSON input."
            }
            ```
        - When errors occur during the form validation
            ```json
            {
                "errors": {
                    "player2_score": [
                        "This field is required."
                    ]
                }
            }
            ```
    - **401**
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```
    - **403**
        - When the logged-in user is not a player of the game
            ```json
            {
                "errors": "You are not part of this game."
            }
            ```
    - **404**
        ```json
        {
            "errors": "Game not found."
        }
        ```

</details>
# Backend API Endpoints

A brief description of the API and example responses.

## Base URL

http://localhost:8000/

## Endpoints Overview

- **Admin panel**
    - **URL**: `admin/`
    - **Method**: `GET`
    - **Description**: Access the Django Admin interface for managing the system and users.

- [**User registration**](#User-registration)
    - **URL**: `users/register/`
    - **Method**: `POST`
    - **Description**: Register a new user in the system.

- [**User login**](#User-login)
    - **URL**: `users/login/`
    - **Method**: `POST`
    - **Description**: Authenticate a user and logs them in. If a user fails to log in with incorrect credentials 5 times in a row, their account will be temporarily locked for 15 minutes to prevent brute-force attacks.

- [**User logout**](#User-logout)
    - **URL**: `users/logout/`
    - **Method**: `POST`
    - **Description**: For the currently authenticated user to log out.

- [**User avatar upload**](#User-avatar-upload)
    - **URL**: `users/avatar/`
    - **Method**: `POST`
    - **Description**: Allow users to upload a new avatar image.

- [**User profile info**](#User-profile-info)
    - **URL**: `users/<user_id>/`
    - **Method**: `GET`
    - **Description**: Get details of the authenticated user's profile.

- [**User profile Update**](#User-profile-update)
    - **URL**: `users/<user_id>/`
    - **Method**: `PATCH`
    - **Description**: Update details of the authenticated user's profile, include username, email, first_name, last_name.

- [**User account deactivation**](#User-account-deactivation)
    - **URL**: `users/<user_id>/`
    - **Method**: `PATCH`
    - **Description**: For the authenticated user to deactivate their account. Recommended by Django instead of deleting user account, as the related data to the user won't be affected.

- [**User account deletion**](#User-account-deletion)
    - **URL**: `users/<user_id>/`
    - **Method**: `DELETE`
    - **Description**: For the authenticated user to delete its account. In this case, user object and related data will be deleted from the database.

- [**Leaderboard**](#Leaderboard)
    - **URL**: `users/leaderboard/`
    - **Method**: `GET`
    - **Description**: Get basic user info and game stats for all users.

## Endpoints specifications

### User registration
#### POST users/register/
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

### User login
#### POST users/login/
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

### User logout
#### POST users/logout/
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

### User avatar upload
#### POST users/avatar/
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

### User profile info
#### GET users/<user_id>/
- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "avatar": "/media/avatars/1/<filename>",
            "email": "<email>",
            ...
        }
        ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
        ```json
        {
            "errors": "You do not have permission to access this user's profile."
        }
        ```
    - **401**
        - When the user is not authenticated
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```

### User profile Update
#### PATCH user/<user_id>
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
            "message": "User Profile updated."
        }
        ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
        ```json
        {
            "errors": "You do not have permission to access this user's profile."
        }
        ```
    - **401**
        - When the user is not authenticated
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```

### User account deactivation
#### PATCH users/<user_id>/
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
    - **403**
        - When the user_id in url does not match the authenticated user's id
        ```json
        {
            "errors": "You do not have permission to access this user's profile."
        }
        ```
    - **401**
        - When the user is not authenticated
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```

### User account deletion
#### DELETE users/<user_id>/
- **Response**
    - **200**
        ```json
        {
            "id": 1,
            "username": "user1",
            "message": "Account deleted."
        }
        ```
    - **403**
        - When the user_id in url does not match the authenticated user's id
        ```json
        {
            "errors": "You do not have permission to access this user's profile."
        }
        ```
    - **401**
        - When the user is not authenticated
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```

### Leaderboard
#### GET users/leaderboard/
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
                ...
            }
            {
                "id": 2,
                "username": "user2",
                "avatar": "/media/avatars/2/<filename>",
                "score": 80,
                "rank": 2,
                ...
            }
            ...
        ]
        ```

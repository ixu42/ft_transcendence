# Backend API Endpoints

A brief description of the API and example responses.

## Base URL

http://localhost:8000/

## Endpoints Overview

- **Admin Panel**
    - **URL**: `/admin/`
    - **Method**: `GET`
    - **Description**: Access the Django Admin interface for managing the system and users.

- **User Registration**
    - **URL**: `/users/register/`
    - **Method**: `POST`
    - **Description**: Register a new user in the system.

- **User Login**
    - **URL**: `/users/login/`
    - **Method**: `POST`
    - **Description**: Authenticate a user and logs them in. If a user fails to log in with incorrect credentials 5 times in a row, their account will be temporarily locked for 15 minutes to prevent brute-force attacks.

- **Set Display Name**
    - **URL**: `/users/set-display-name/`
    - **Method**: `POST`
    - **Description**: Set a unique display name for the logged in user.

## Endpoints specifications

### `/users/register/`
- **Expected Request Body**:
    ```json
    {
        "username": "newuser",
        "password1": "securepassword123",
        "password2": "securepassword123",
    }
    ```
- **Response**
    - **201**
        ```json
        {
            "message": "User created"
        }
        ```
    - **400**
        ```json
        {
            "errors": {"username": ["A user with that username already exists."]}
        }
        ```

### `/users/login/`
- **Expected Request Body**:
    ```json
    {
        "username": "existinguser",
        "password": "securepassword123"
    }
    ```
- **Response**
    - **200**
        ```json
        {
            "message": "Login successful"
        }
        ```
    - **401**
        ```json
        {
            "errors": "Invalid password"
        }
        ```
        ```json
        {
            "errors": "Username does not exist"
        }
        ```
        - When username and/or password are/is missing
        ```json
        {
            "errors": "Username and password are required."
        }
        ```

### `/users/set-display-name/`
- **Expected Request Body**:
    ```json
    {
        "display_name": "display_name42"
    }
    ```
- **Response**
    - **200**
        - When the display name is successfully set:
        ```json
        {
            "message": "Display name set"
        }
        ```
        - When the display name is unchanged (no update made, because the input is the same as the current value):
        ```json
        {
            "message": "Display name is unchanged"
        }
        ```
    - **400**
        - When the display name is already taken:
        ```json
        {
            "errors": {
                "display_name": [
                    "Display name already taken. Please choose another one."
                ]
            }
        }
        ```
        - When the display name is missing or invalid:
        ```json
        {
            "errors": {
                "display_name": [
                    "Display name is required to join tournaments."
                ]
            }
        }
        ```

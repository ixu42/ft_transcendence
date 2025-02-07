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

- **User Logout**
    - **URL**: `/users/logout/`
    - **Method**: `POST`
    - **Description**: For the currently authenticated user to log out.

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
            "message": "User created."
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

### `/users/logout/`
- **Response**
    - **200**
        ```json
        {
            "message": "Logout successful."
        }
        ```
    - **401**
        When the user is not logged in
        ```json
        {
            "errors": "User is not authenticated."
        }
        ```

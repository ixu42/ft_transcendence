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

## Endpoints specifications

### `/users/register/`
- **Expected Request Body**:
    ```json
    {
        "username": "newuser",
        "password1": "securepassword123",
        "password2": "securepassword123",
        "display_name": "foo"
    }
    ```
    display_name is optional - if no display_name is provided, it is set to username.
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


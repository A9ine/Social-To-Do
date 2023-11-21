# Setting Up Backend

## Prerequisites

- Python (3.6 or higher is recommended)
- Flask
- SQLite

## Getting Started

1. **Install Dependencies**:

    Install flask
    ```
    pip install flask
    ```
    or 
    ```
    pip3 install flask
    ```
3. **Setting Up the Database**:
    Before running the application for the first time, ensure the SQLite database `social-to-do.sqlite` is set up is created. 
    * Make sure you are in the api directory
    ```
    python3 database/db.py
    ```

4. **Running the Application**:
    With everything set up, run the application using:
    ```
    python3 app.py
    ```
    This will start the Flask server, and the API will be accessible at `http://127.0.0.1:2323/`.

## API Endpoints

Below are the details of the API endpoints including the URL, method, data parameters, and possible responses.

### Register User

- **URL**: `/register`
- **Method**: `POST`
- **Data Params**:
  - `first_name`: First name of the user.
  - `last_name`: Last name of the user.
  - `email`: Email address of the user.
  - `username`: Desired username.
  - `password`: Password for the account.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "message": "User registered successfully" }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "All fields are required and must not be blank." }`
  - **Code**: 409 CONFLICT
  - **Content**: `{ "error": "Username or email already exists." }`
  - **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "error": "Database error occurred." }`

### User Login

- **URL**: `/login`
- **Method**: `POST`
- **Data Params**:
  - `username_or_email`: Username or email address of the user.
  - `password`: Password for the account.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "authenticated": true }` or `{ "authenticated": false }`
- **Error Response**:
  - **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "error": "Database error occurred." }`

### Get Verification Code

- **URL**: `/getVerification`
- **Method**: `POST`
- **Data Params**:
  - `email`: Email address of the user to send the verification code.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "message": "Verification email sent successfully" }`
- **Error Response**:
  - **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "error": "Database error occurred." }`

### Change Password

- **URL**: `/changePassword`
- **Method**: `POST`
- **Data Params**:
  - `email`: Email address of the user.
  - `new_password`: New password to set for the user.
  - `verification_code`: Verification code sent to the user's email.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "success": "Password updated successfully" }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "Email, new password, and verification code are required." }`
  - **Code**: 401 UNAUTHORIZED
  - **Content**: `{ "error": "Invalid email or verification code." }`
  - **Code**: 500 INTERNAL SERVER ERROR
  - **Content**: `{ "error": "Database error occurred." }`

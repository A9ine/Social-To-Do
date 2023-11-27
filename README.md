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
  
### Add Friend

- **URL**: `/addFriend`
- **Method**: `POST`
- **Data Params**:
  - `user1`: The username of the first user.
  - `user2`: The username of the second user.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "message": "Friendship added successfully" }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "2 users are required." }`
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "One or more of the users do not exist" }`
  - **Code**: 409 CONFLICT
  - **Content**: `{ "error": "Friendship Already Exists" }`

### Delete Friend

- **URL**: `/deleteFriend`
- **Method**: `POST`
- **Data Params**:
  - `user1`: The username of the first user.
  - `user2`: The username of the second user.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "message": "Friendship deleted successfully" }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "2 users are required." }`
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "One or more of the users do not exist" }`
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "Friendship Does Not Exist" }`

### Get Friends

- **URL**: `/getFriends`
- **Method**: `GET`
- **URL Params**:
  - `username`: The username of the user whose friends list is to be retrieved.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "friends": [ { "friend_id": 12, "friend_username": "john_doe" }, ... ] }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "User Does Not Exist" }`

### Add Task

- **URL**: `/addTask`
- **Method**: `POST`
- **Data Params**:
  - `username`: The username of the user to whom the task belongs.
  - `task`: The description of the task.
  - `due_date`: The due date for the task.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "message": "Task added successfully" }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "All fields need to be filled" }`
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "User Does Not Exist" }`

### Mark Task as Done

- **URL**: `/markTaskAsDone`
- **Method**: `POST`
- **Data Params**:
  - `task_id`: The ID of the task to be marked as done.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "message": "Task marked as done successfully" }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "Task Does Not Exist" }`

### Get All Tasks

- **URL**: `/getAllTasks`
- **Method**: `GET`
- **URL Params**:
  - `username`: The username of the user whose tasks are to be retrieved.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "tasks": [ { "task_id": 10, "task_description": "Finish report", ... }, ... ] }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "User Does Not Exist" }`

### Send Chat

- **URL**: `/sendChat`
- **Method**: `POST`
- **Data Params**:
  - `username`: The username of the user sending the message.
  - `group_id`: The ID of the group to which the message is sent.
  - `message`: The content of the chat message.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: `{ "message": "Chat Sent Successfully" }`
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: `{ "error": "Missing Data" }`
  - **Code**: 400 BAD REQUEST
  - **

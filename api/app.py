from datetime import datetime
from flask import Flask, request, jsonify
import sqlite3
import collections
import smtplib, ssl
import math
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


app = Flask(__name__)

def db_connection():
    """
    Establishes a connection to the SQLite database.

    :return: connection object if successful, None otherwise
    """
    conn = None
    try:
        conn = sqlite3.connect('social-to-do.sqlite')
    except sqlite3.error as e:
        print(e)
    return conn

@app.route('/register', methods=['POST'])
def register():
    conn = db_connection()
    cursor = conn.cursor()

    # Extract user details from the request
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email').lower()
    username = data.get('username').lower()
    password = data.get('password')

    # Validate input fields
    if not first_name or not last_name or not email or not username or not password:
        return jsonify({"error": "All fields are required and must not be blank."}), 400

    # Check if the username or email already exists
    cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, email))
    existing_user = cursor.fetchone()
    if existing_user:
        return jsonify({"error": "Username or email already exists."}), 409  # 409 Conflict

    try:
        # Rest of your code to insert data into the database
        sql = """INSERT INTO users (first_name, last_name, email, username, password, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?)"""
        timestamp = datetime.now().isoformat()
        cursor.execute(sql, (first_name, last_name, email, username, password, timestamp))
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 200
    except sqlite3.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred."}), 500
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    conn = db_connection()
    cursor = conn.cursor()

    # Get credentials from request arguments
    data = request.get_json()
    username_or_email = data['username_or_email'].lower()
    password = data['password']

    field = 'email' if '@' in username_or_email and '.' in username_or_email else 'username'

    try:
        # Query the database to find a user
        cursor.execute(f"SELECT user_id, username, first_name FROM users WHERE {field} = ? AND password = ?", (username_or_email, password))
        user = cursor.fetchone()

        if user:
            user_id, username, first_name = user
            return jsonify({"authenticated": True, "user_id": user_id, "username": username, "first_name": first_name}), 200
        else:
            return jsonify({"authenticated": False}), 200
    except sqlite3.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred."}), 500
    finally:
        conn.close()



@app.route('/getVerification', methods=['POST'])
def sendEmail():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    email = data.get('email').lower()

    # Generate verification code
    string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    verification_code = ""
    length = len(string)
    for i in range(6):
        verification_code += string[math.floor(random.random() * length)]

    cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
    user_id = cursor.fetchone()

    # Update or insert verification code in the database
    if user_id:
        # Check if a verification code already exists for this user
        cursor.execute("SELECT * FROM verification_codes WHERE user_id = ?", (user_id[0],))
        if cursor.fetchone():
            # Update existing verification code
            cursor.execute("UPDATE verification_codes SET verification_code = ? WHERE user_id = ?", (verification_code, user_id[0]))
        else:
            # Insert new verification code
            cursor.execute("INSERT INTO verification_codes (user_id, verification_code) VALUES (?, ?)", (user_id[0], verification_code))

        conn.commit()

    # Read email template and replace placeholder with actual verification code
    with open('./templates/verification_email.html', 'r', encoding='utf-8') as file:
        email_content = file.read()
        email_content = email_content.replace('{{verification_code}}', verification_code)

    # Email sending setup
    sender_email = "socialtodobot@gmail.com"  
    receiver_email = email
    password = "sppg zywg yzqu dymu"  

    message = MIMEMultipart("alternative")
    message["Subject"] = "Your Verification Code"
    message["From"] = sender_email
    message["To"] = email

    # Add HTML content to email
    part = MIMEText(email_content, "html")
    message.attach(part)

    # Create secure SSL context and send the email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:  # Replace smtp server and port
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())

    return jsonify({"message": "Verification email sent successfully"}), 200

        


@app.route('/changePassword', methods=['POST'])
def changePassword():
    conn = db_connection()
    cursor = conn.cursor()

    # Get credentials from request arguments
    data = request.get_json()
    email = data.get('email').lower()
    new_password = data.get('new_password')
    verification_code = data.get('verification_code')

    # Check for missing data
    if not email or not new_password or not verification_code:
        return jsonify({"error": "Email, new password, and verification code are required."}), 400

    try:
        # Verify the verification code
        cursor.execute("SELECT user_id FROM verification_codes WHERE verification_code = ?", (verification_code,))
        verification_data = cursor.fetchone()

        if verification_data:
            user_id = verification_data[0]

            # Verify the email and get the corresponding user_id
            cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
            user_data = cursor.fetchone()

            if user_data and user_id == user_data[0]:
                # Update the password
                cursor.execute("UPDATE users SET password = ? WHERE user_id = ?", (new_password, user_id))
                conn.commit()
                return jsonify({"success": "Password updated successfully"}), 200
            else:
                return jsonify({"error": "Invalid email or verification code."}), 401
        else:
            return jsonify({"error": "Invalid verification code."}), 401

    except sqlite3.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred."}), 500
    finally:
        conn.close()

# add friend
@app.route('/addFriend', methods=['POST'])
def addFriend():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    user1 = data.get('user1')
    user2 = data.get('user2')
    
    # Check for missing data
    if not user1 or not user2:
        return jsonify({"error": "2 users are required."}), 400
    
    cursor.execute("SELECT user_id FROM users WHERE username = ?",(user1,))
    user1_id = cursor.fetchone()
    cursor.execute("SELECT user_id FROM users WHERE username = ?",(user2,))
    user2_id = cursor.fetchone()

    if not user1_id or not user2_id:
        return jsonify({"error": "One or more of the users do not exist"}), 400
    
    #check if friendship already exist 
    cursor.execute("SELECT * FROM friends WHERE(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", (user1_id[0], user2_id[0], user2_id[0], user1_id[0]))
    if cursor.fetchone():
        return jsonify({"error": "Friendship Already Exists"}), 400
    
    #add new friendship
    cursor.execute("INSERT INTO friends (user_id, friend_id, status, created_at, updated_at) VALUES (?, ?, 'accepted', datetime('now'), datetime('now'))", (user1_id[0], user2_id[0]))
    conn.commit()
    return jsonify({"message": "Friendship added sucessfully"}), 200

# delete friend
@app.route('/deleteFriend', methods=['POST'])
def deleteFriend():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    user1 = data.get('user1')
    user2 = data.get('user2')
    
    # Check for missing data
    if not user1 or not user2:
        return jsonify({"error": "2 users are required."}), 400
    
    cursor.execute("SELECT user_id FROM users WHERE username = ?",(user1,))
    user1_id = cursor.fetchone()
    cursor.execute("SELECT user_id FROM users WHERE username = ?",(user2,))
    user2_id = cursor.fetchone()

    if not user1_id or not user2_id:
        return jsonify({"error": "One or more of the users do not exist"}), 400
    
    cursor.execute("SELECT * FROM friends WHERE(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", (user1_id[0], user2_id[0], user2_id[0], user1_id[0]))
    if not cursor.fetchone():
        return jsonify({"error": "Friendship Does Not Exists"}), 400
    
    cursor.execute("DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?),(user1_id[0], user2_id[0], user2_id[0], user1_id[0]) ")
    conn.commit()

    return jsonify({"message": "Friendship deleted sucessfully"}), 200

# get friends
@app.route('/getFriends', methods=['GET'])
def getFriends():
    conn = db_connection()
    cursor = conn.cursor()
    user = request.args.get('username')

    cursor.execute("SELECT user_id FROM users WHERE username = ?",(user,))
    user_id_record = cursor.fetchone()
    
    user_id = user_id_record[0]

    if not user_id:
        return jsonify({"error": "User Does Not Exist"}), 400

    cursor.execute("""
        SELECT u.user_id, u.username
        FROM users u
        JOIN friends f ON u.user_id = f.friend_id OR u.user_id = f.user_id
        WHERE (f.user_id = ? OR f.friend_id = ?) AND u.user_id != ?
    """, (user_id, user_id, user_id))

    friends = cursor.fetchall()

    friend_list = [
        {
            'friend_id' : friend[0],
            'friend_username' : friend[1]
        }
        for friend in friends
    ]

    return jsonify({"friends": friend_list}), 200


# add tasks
@app.route('/addTask', methods=['POST'])
def addTask():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    user = data.get('username').lower()
    task = data.get('task')
    due_date = data.get("due_date")

    if not user or not task or not due_date:
        return jsonify({"error": "all fields need to be filled"}), 400

    cursor.execute("SELECT user_id FROM users WHERE username = ?",(user,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("INSERT INTO tasks(user_id, task, created_at, updated_at, due_date, completed) VALUES (?, ?, datetime('now'), datetime('now'), ?, ?)", (user_id, task, due_date, False))
    conn.commit()
    return jsonify({"message": "Task added sucessfully"}), 200

    
# mark task as done

# retrieve tasks 
@app.route('/getIncompletedTasks', methods=['GET'])
def getIncompletedTasks():
    conn = db_connection()
    cursor = conn.cursor()

    user = request.args.get('username')
    cursor.execute("SELECT user_id FROM users WHERE username = ?",(user,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("SELECT * FROM tasks WHERE (user_id = ? AND completed = ?)", (user_id, False))
    tasks = cursor.fetchall()

    tasks_list = [
        {
            'task_id' : task[0],
            'task_description' : task[2],
            'due_date' : task[5],
            'completed': task[6],
            'created_at' : task[3]
        }
        for task in tasks
    ]
    
    return jsonify({"tasks":tasks_list}), 200


@app.route('/markTaskAsDone', methods = ['POST'])
def markTaskAsDone():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    task_id = data.get('task_id')
    task_id = int(task_id)
    cursor.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
    task = cursor.fetchone()
    if not task:
        return jsonify({"error": "Task Does Not Exist"}), 400
    
    cursor.execute("UPDATE tasks SET completed = ? WHERE task_id = ?", (True, task_id))
    conn.commit()

    return jsonify({'message': "Task marked as done successfully"}), 200
    


@app.route('/getAllTasks', methods=['GET'])
def getAllTasks():
    conn = db_connection()
    cursor = conn.cursor()

    user = request.args.get('username').lower()
    cursor.execute("SELECT user_id FROM users WHERE username = ?",(user,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("SELECT * FROM tasks WHERE user_id = ?", (user_id,))
    tasks = cursor.fetchall()

    tasks_list = [
        {
            'task_id' : task[0],
            'task_description' : task[2],
            'due_date' : task[5],
            'completed': task[6],
            'created_at' : task[3]
        }
        for task in tasks
    ]
    
    return jsonify({"tasks":tasks_list}), 200


# send chat
@app.route('/sendChat', methods=['POST'])
def sendChat():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    username = data.get('username').lower()
    group_id = data.get('group_id')
    message = data.get('message')

    if not username or not group_id or not message:
        return jsonify({"error": "Missing Data"}), 400
    
    cursor.execute("SELECT user_id FROM users WHERE username = ?",(username,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("INSERT INTO chat_messages(group_id, user_id, message) VALUES (?, ?, ?)", (group_id, user_id, message))
    conn.commit()

    return jsonify({"message": "Chat Sent Successfully"}), 200


# Retrieve chat
@app.route('/getChat', methods=['GET'])
def getChat():
    conn = db_connection()
    cursor = conn.cursor()
    group_id = request.args.get('group_id')
    
    if not group_id:
        return jsonify({"error": "group_id Does Not Exist"}), 400
    
    cursor.execute("SELECT user_id, message, sent_at FROM chat_messages WHERE group_id = ? ORDER BY sent_at DESC", (group_id,))
    messages = cursor.fetchall()

    usernames = []
    for message in messages:
        user_id = message[0]
        cursor.execute("SELECT username FROM users WHERE user_id = ?",(user_id,))
        user_id_record = cursor.fetchone()
        if not user_id_record:
            return jsonify({"error": "User Does Not Exist"}), 400
        username = user_id_record[0]
        usernames.append(username)
    
    

    messages_list = [
        {
            'user_id' : message[0],
            'message' : message[1],
            'sent_at' : message[2]
        }
        for message in messages
    ]

    for i in range(len(messages_list)):
        messages_list[i]['usernames'] = usernames[i]

    return jsonify({"messages": messages_list}), 200


# Start groupchat
@app.route('/startChat', methods=['POST'])
def startChat():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    group_name = data.get('group_name')
    created_by = data.get('created_by')
    members = data.get('members') # list of members

    if not group_name or not created_by or not members:
        return jsonify({"error": "Missing Info"}), 400

    cursor.execute("SELECT user_id FROM users WHERE username = ?",(created_by,))
    created_by_record = cursor.fetchone()
    
    if not created_by_record:
        return jsonify({"error": "User Does Not Exist 1"}), 400
    created_by = created_by_record[0]
    
    cursor.execute("INSERT INTO groups(group_name, created_by, created_at) VALUES (?,?, datetime('now'))", (group_name, created_by))
    group_id = cursor.lastrowid

    user_ids = []

    for username in members:
        cursor.execute("SELECT user_id FROM users WHERE username = ?",(username,))
        user_id_record = cursor.fetchone()
        
        if not user_id_record:
            return jsonify({"error": "User Does Not Exist"}), 400
        user_id = user_id_record[0]
        user_ids.append(user_id)

    user_ids.append(created_by)

    for user_id in user_ids:
        cursor.execute("INSERT INTO group_members (group_id, user_id, joined_at) VALUES (?,?, datetime('now'))", (group_id, user_id))
    
    conn.commit()

    return jsonify({"message": "Group chat started successfully", "group_id": group_id})


# post
@app.route('/makePost', methods=['POST'])
def makePost():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()

    url = data.get('url')
    print(data.get('task'))
    task = int(data.get('task'))
    username = data.get('username').lower()

    cursor.execute("SELECT user_id FROM users WHERE username = ?", (username,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("SELECT task FROM tasks WHERE task_id = ?", (task,))

    task_record = cursor.fetchone()
    if not task_record:
        return jsonify({"error": "Task Does Not Exist"}), 400
    task_content = task_record[0]

    # Insert the new post into the posts table
    cursor.execute("""
        INSERT INTO posts (user_id, content, picture, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
    """, (user_id, f'{username} completed: {task_content}', url))

    cursor.execute("UPDATE tasks SET completed = ? WHERE task_id = ?", (True, task))
    conn.commit()
    return jsonify({"message": "Post created successfully"}), 200


@app.route('/retrievePosts', methods=['GET'])
def retrievePosts():
    conn = db_connection()
    cursor = conn.cursor()

    # Assuming the username is passed as a query parameter
    username = request.args.get('username')
    username = str(username).lower()

    # First, get the user_id of the requesting user
    cursor.execute("SELECT user_id FROM users WHERE username = ?", (username,))
    user_id_record = cursor.fetchone()

    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    # Retrieve posts from the user and their friends
    cursor.execute("""
        SELECT p.post_id, p.content, p.picture, p.created_at, u.username
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN friends f ON p.user_id = f.friend_id OR p.user_id = f.user_id
        WHERE f.user_id = ? OR f.friend_id = ? OR p.user_id = ?
        ORDER BY p.created_at DESC
    """, (user_id, user_id, user_id))

    posts = cursor.fetchall()

    # Convert the posts to a list of dicts to jsonify the response properly
    posts_list = [
        {
            'post_id': post[0],
            'content': post[1],
            'picture': post[2],
            'created_at': post[3],
            'author_username': post[4]
        }
        for post in posts
    ]

    return jsonify({"posts": posts_list}), 200

@app.route('/searchUser', methods=['GET'])
def searchUser():
    conn = db_connection()
    cursor = conn.cursor()
    query = request.args.get('query')
    current_user_id = request.args.get('user_id')  # Assuming the user_id is being sent as a query parameter

    # Ensure the current user_id is present
    if not current_user_id:
        return jsonify({"error": "Current user ID is required."}), 400

    # Convert current_user_id to int to prevent SQL injection
    try:
        current_user_id = int(current_user_id)
    except ValueError:
        return jsonify({"error": "Invalid user ID."}), 400

    # The SQL query to search for users, excluding the current user and their friends
    search_query = """
        SELECT u.user_id, u.username
        FROM users u
        WHERE u.username LIKE ?
        AND u.user_id != ?
        AND NOT EXISTS (
            SELECT 1 FROM friends f
            WHERE (f.user_id = u.user_id AND f.friend_id = ?)
            OR (f.friend_id = u.user_id AND f.user_id = ?)
        )
    """

    cursor.execute(search_query, ('%' + query + '%', current_user_id, current_user_id, current_user_id))
    users = cursor.fetchall()
    conn.close()

    users_list = [{'user_id': user[0], 'username': user[1]} for user in users]

    return jsonify({"users": users_list}), 200


if __name__ == '__main__':
    app.run(port=2323)
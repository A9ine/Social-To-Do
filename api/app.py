from datetime import datetime
from flask import Flask, request, jsonify
import sqlite3
import smtplib, ssl
import math
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import mysql.connector
from datetime import datetime


app = Flask(__name__)

def db_connection():
    """
    Establishes a connection to the MySQL database.

    :return: connection object if successful, None otherwise
    """
    conn = None
    hostname = "socialtodo.mysql.database.azure.com"
    username = "azhang237"
    password = "Y8@dcb!#"
    database = "social-to-do"

    try:
        conn = mysql.connector.connect(
            host=hostname,
            user=username,
            passwd=password,
            database=database
        )
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    return conn


@app.route('/register', methods=['POST'])
def register():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email').lower()
    username = data.get('username').lower()
    password = data.get('password')

    if not first_name or not last_name or not email or not username or not password:
        return jsonify({"error": "All fields are required and must not be blank."}), 400

    if '@' not in email or '.' not in email:
        return jsonify({"error": "Invalid email format."}), 400

    try:
        cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({"error": "Username or email already exists."}), 409

        sql = """INSERT INTO users (first_name, last_name, email, username, password, timestamp)
                 VALUES (%s, %s, %s, %s, %s, %s)"""
        timestamp = datetime.now().isoformat()
        cursor.execute(sql, (first_name, last_name, email, username, password, timestamp))
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 200
    except mysql.connector.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred."}), 500
    finally:
        conn.close()


@app.route('/login', methods=['POST'])
def login():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    username_or_email = data['username_or_email'].lower()
    password = data['password']

    field = 'email' if '@' in username_or_email and '.' in username_or_email else 'username'

    try:
        cursor.execute(f"SELECT user_id, username, first_name FROM users WHERE {field} = %s AND password = %s", (username_or_email, password))
        user = cursor.fetchone()

        if user:
            user_id, username, first_name = user
            return jsonify({"authenticated": True, "user_id": user_id, "username": username, "first_name": first_name}), 200
        else:
            return jsonify({"authenticated": False}), 200
    except mysql.connector.Error as e:
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

    cursor.execute("SELECT user_id FROM users WHERE email =  %s", (email,))
    user_id = cursor.fetchone()

    # Update or insert verification code in the database
    if user_id:
        # Check if a verification code already exists for this user
        cursor.execute("SELECT * FROM verification_codes WHERE user_id =  %s", (user_id[0],))
        if cursor.fetchone():
            # Update existing verification code
            cursor.execute("UPDATE verification_codes SET verification_code =  %s WHERE user_id =  %s", (verification_code, user_id[0]))
        else:
            # Insert new verification code
            cursor.execute("INSERT INTO verification_codes (user_id, verification_code) VALUES ( %s,  %s)", (user_id[0], verification_code))

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
        cursor.execute("SELECT user_id FROM verification_codes WHERE verification_code =  %s", (verification_code,))
        verification_data = cursor.fetchone()

        if verification_data:
            user_id = verification_data[0]

            # Verify the email and get the corresponding user_id
            cursor.execute("SELECT user_id FROM users WHERE email =  %s", (email,))
            user_data = cursor.fetchone()

            if user_data and user_id == user_data[0]:
                # Update the password
                cursor.execute("UPDATE users SET password =  %s WHERE user_id =  %s", (new_password, user_id))
                conn.commit()
                return jsonify({"success": "Password updated successfully"}), 200
            else:
                return jsonify({"error": "Invalid email or verification code."}), 401
        else:
            return jsonify({"error": "Invalid verification code."}), 401

    except mysql.connector.Error as e:
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
    user1 = data.get('user1').lower()
    user2 = data.get('user2').lower()
    
    # Check for missing data
    if not user1 or not user2:
        return jsonify({"error": "2 users are required."}), 400
    
    cursor.execute("SELECT user_id FROM users WHERE username = %s",(user1,))
    user1_id = cursor.fetchone()
    cursor.execute("SELECT user_id FROM users WHERE username = %s",(user2,))
    user2_id = cursor.fetchone()

    if not user1_id or not user2_id:
        return jsonify({"error": "One or more of the users do not exist"}), 400
    
    #check if friendship already exist 
    cursor.execute("SELECT * FROM friends WHERE(user_id = %s AND friend_id = %s) OR (user_id = %s AND friend_id = %s)", (user1_id[0], user2_id[0], user2_id[0], user1_id[0]))
    if cursor.fetchone():
        return jsonify({"error": "Friendship Already Exists"}), 400
    
    #add new friendship
    cursor.execute("INSERT INTO friends (user_id, friend_id, status, created_at, updated_at) VALUES (%s, %s, 'pending', NOW(), NOW())", (user1_id[0], user2_id[0]))
    conn.commit()
    return jsonify({"message": "Friendship added sucessfully"}), 200

# delete friend
@app.route('/deleteFriend', methods=['POST'])
def deleteFriend():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    user1 = data.get('user1').lower()
    user2 = data.get('user2').lower()
    
    # Check for missing data
    if not user1 or not user2:
        return jsonify({"error": "Both users are required."}), 400
    
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (user1,))
    user1_id = cursor.fetchone()
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (user2,))
    user2_id = cursor.fetchone()

    if not user1_id or not user2_id:
        return jsonify({"error": "One or more of the users do not exist"}), 400
    
    # Check if friendship exists
    cursor.execute("""
        SELECT * FROM friends 
        WHERE (user_id = %s AND friend_id = %s) 
        OR (user_id = %s AND friend_id = %s)
    """, (user1_id[0], user2_id[0], user2_id[0], user1_id[0]))
    if not cursor.fetchone():
        return jsonify({"error": "Friendship does not exist"}), 400
    
    # Delete the friendship
    cursor.execute("""
        DELETE FROM friends 
        WHERE (user_id = %s AND friend_id = %s) 
        OR (user_id = %s AND friend_id = %s)
    """, (user1_id[0], user2_id[0], user2_id[0], user1_id[0]))
    conn.commit()

    return jsonify({"message": "Friendship deleted successfully"}), 200

@app.route('/acceptFriend', methods=['POST'])
def acceptFriend():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    user1 = data.get('user1').lower()  # Username of the user accepting the friend request
    user2 = data.get('user2').lower()  # Username of the user who sent the friend request

    if not user1 or not user2:
        return jsonify({"error": "Both usernames are required."}), 400

    try:
        # Get user IDs from usernames
        cursor.execute("SELECT user_id FROM users WHERE username = %s", (user1,))
        user1_id = cursor.fetchone()
        cursor.execute("SELECT user_id FROM users WHERE username = %s", (user2,))
        user2_id = cursor.fetchone()

        if not user1_id or not user2_id:
            return jsonify({"error": "One or more users not found"}), 404

        # Check if the friendship is in a 'pending' state
        cursor.execute("SELECT * FROM friends WHERE user_id = %s AND friend_id = %s AND status = 'pending'", (user2_id[0], user1_id[0]))
        if not cursor.fetchone():
            return jsonify({"error": "No pending friendship request found"}), 404

        # Update the status of the friendship to 'accepted'
        cursor.execute("UPDATE friends SET status = 'accepted', updated_at = NOW() WHERE user_id = %s AND friend_id = %s", (user2_id[0], user1_id[0]))
        conn.commit()

        return jsonify({"message": "Friend request accepted"}), 200

    except mysql.connector.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred"}), 500

    finally:
        conn.close()



# get friends
@app.route('/getFriends', methods=['GET'])
def getFriends():
    conn = db_connection()
    cursor = conn.cursor()
    username = request.args.get('username')

    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400

    user_id = user_id_record[0]

    cursor.execute("""
        SELECT u.user_id, u.username, u.profile_pic
        FROM users u
        JOIN friends f ON u.user_id = f.friend_id OR u.user_id = f.user_id
        WHERE (f.user_id = %s OR f.friend_id = %s) AND u.user_id != %s AND f.status = 'accepted'
    """, (user_id, user_id, user_id))

    friends = cursor.fetchall()

    friend_list = [
        {
            'friend_id': friend[0],
            'friend_username': friend[1],
            'friend_profile_pic': friend[2]
        }
        for friend in friends
    ]

    return jsonify({"friends": friend_list}), 200

@app.route('/getPendingFriends', methods=['GET'])
def getPendingFriends():
    conn = db_connection()
    cursor = conn.cursor()
    username = request.args.get('username')

    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400

    user_id = user_id_record[0]

    # Adjusted query to select pending friend requests where the user is the recipient
    cursor.execute("""
        SELECT u.user_id, u.username, u.profile_pic
        FROM users u
        JOIN friends f ON u.user_id = f.user_id
        WHERE f.friend_id = %s AND f.status = 'pending'
    """, (user_id,))

    pending_friends = cursor.fetchall()

    pending_friend_list = [
        {
            'friend_id': friend[0],
            'friend_username': friend[1],
            'profile_pic': friend[2]
        }
        for friend in pending_friends
    ]

    print(pending_friend_list)

    conn.close()
    return jsonify({"pending_friends": pending_friend_list}), 200


@app.route('/denyFriend', methods=['POST'])
def denyFriend():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    user1 = data.get('user1')  # Username of the user denying the friend request
    user2 = data.get('user2')  # Username of the user who sent the friend request

    if not user1 or not user2:
        return jsonify({"error": "Both usernames are required."}), 400

    try:
        # Get user IDs from usernames
        cursor.execute("SELECT user_id FROM users WHERE username = %s", (user1,))
        user1_id = cursor.fetchone()
        cursor.execute("SELECT user_id FROM users WHERE username = %s", (user2,))
        user2_id = cursor.fetchone()

        if not user1_id or not user2_id:
            return jsonify({"error": "One or more users not found"}), 404

        # Check if the friendship is in a 'pending' state
        cursor.execute("SELECT * FROM friends WHERE user_id = %s AND friend_id = %s AND status = 'pending'", (user2_id[0], user1_id[0]))
        if not cursor.fetchone():
            return jsonify({"error": "No pending friendship request found"}), 404

        # Update the status of the friendship to 'denied'
        cursor.execute("UPDATE friends SET status = 'denied', updated_at = NOW() WHERE user_id = %s AND friend_id = %s", (user2_id[0], user1_id[0]))
        conn.commit()

        return jsonify({"message": "Friend request denied"}), 200

    except mysql.connector.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred"}), 500

    finally:
        conn.close()




# add tasks
@app.route('/addTask', methods=['POST'])
def addTask():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    user = data.get('username').lower()
    task = data.get('task').strip()
    task_category = data.get('task_category')
    due_date = data.get("due_date")

    due_date_mysql_format = datetime.fromisoformat(due_date.replace("Z", "+00:00")).strftime('%Y-%m-%d %H:%M:%S')

    if not user or not task or not task_category or not due_date:
        return jsonify({"error": "all fields need to be filled"}), 400

    cursor.execute("SELECT user_id FROM users WHERE username = %s",(user,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("INSERT INTO tasks(user_id, task, task_category, created_at, updated_at, due_date, completed) VALUES (%s, %s, %s, NOW(), NOW(), %s, %s)", (user_id, task, task_category, due_date_mysql_format, False))
    conn.commit()
    return jsonify({"message": "Task added sucessfully"}), 200

# Helper method for match_tasks
def get_friends_list(user_id):
    conn = db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT u.user_id, u.username
        FROM users u
        JOIN friends f ON u.user_id = f.friend_id OR u.user_id = f.user_id
        WHERE (f.user_id = %s OR f.friend_id = %s) AND u.user_id != %s AND f.status = 'accepted'
    """, (user_id, user_id, user_id))

    friends = cursor.fetchall()
    return friends
    
# Helper method for match_tasks
def get_incompleted_tasks(user_id):
    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tasks WHERE (user_id = %s AND completed = %s)", (user_id, False))
    tasks = cursor.fetchall()

    # tasks_list = []
    # for task in tasks:
    #      tasks_list.append((task[2],task[3],task[7],task[6]))
    return tasks

# match tasks
@app.route('/matchTasks', methods=['GET'])
def matchTasks():
    conn = db_connection()
    cursor = conn.cursor()
    username = request.args.get('username', '').lower()

    # Get the user ID for the given username
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id_record = cursor.fetchone()
    if not user_id_record:
        return jsonify({"error": "User not found"}), 404
    user_id = user_id_record[0]

    user_tasks = get_incompleted_tasks(user_id)
    friends_list = get_friends_list(user_id)

    # add due date
    match_tasks = []
    for user_task in user_tasks:
        for friend_id, friend_username in friends_list:
            friend_tasks = get_incompleted_tasks(friend_id)
            for friend_task in friend_tasks:
                if user_task[2] == friend_task[2]:
                    cursor.execute("SELECT category_name FROM task_categories WHERE category_id = %s", (user_task[2],))
                    category_name = cursor.fetchone()
                    user_task_reformat = ({
                        f"Your task": {
                            "task_id": user_task[0],
                            "description": user_task[3],
                            "category": category_name[0],
                            "due date": user_task[6]
                        }
                    })
                    if match_tasks.count(user_task_reformat) < 1:
                        match_tasks.append(user_task_reformat)
                    match_tasks.append ({
                        f"{friend_username}'s task": {
                            "task_id": friend_task[0],
                            "description": friend_task[3],
                            "category": category_name[0],
                            "due date": friend_task[6]
                        }
                    })
    return jsonify(match_tasks)

    #return jsonify({"matched_tasks": matched_tasks}), 200

    # #cursor.execute("""
    # #    SELECT t1.task, t1.task_category, t2.task AS friend_task, t2.task_category
    # #    FROM tasks t1
    # #    JOIN friends f ON (t1.user_id = f.user_id OR t1.user_id = f.friend_id)
    # #    JOIN tasks t2 ON (f.friend_id = t2.user_id OR f.user_id = t2.user_id) AND t1.task_category = t2.task_category
    # #    WHERE (t1.user_id = %s) AND t1.task_id != t2.task_id AND f.status = 'accepted'
    # #""", (user_id,))

    # cursor.execute("""
    #     SELECT t1.task AS user_task, t1.task_category, t2.task AS friend_task, t2.task_category, u.username AS friend_username
    #     FROM tasks t1
    #     JOIN friends f ON (t1.user_id = f.user_id OR t1.user_id = f.friend_id)
    #     JOIN tasks t2 ON (f.friend_id = t2.user_id OR f.user_id = t2.user_id) AND t1.task_category = t2.task_category
    #     JOIN users u ON (t2.user_id = u.user_id OR t2.user_id = f.friend_id)  -- Make sure this line is correctly joining the users table
    #     WHERE t1.user_id = %s AND t1.task_id != t2.task_id AND f.status = 'accepted'
    # """, (user_id,))
    
    # matched_tasks = cursor.fetchall()
    # formatted_tasks = []



    # for task in matched_tasks:
    #     formatted_task = {
    #         "Your task": {
    #             "category": task[1],
    #             "description": task[0]
    #         },
    #         f"{task[4]}'s task": {  # Ensure task[4] is correctly retrieving the friend's username
    #             "category": task[3],
    #             "description": task[2]
    #         }
    #     }
    # formatted_tasks.append(formatted_task)
    # return jsonify({"matched_tasks": formatted_tasks}), 200

# Retrive Task Categories
@app.route('/getTaskCategories', methods=['GET'])
def getTaskCategories():
    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM task_categories")
    task_categories = cursor.fetchall()
    task_cats = []
    for cat_id, cat_name in task_categories:
        task_cats.append({
            "category_id": cat_id,
            "category_name": cat_name
        })
    return jsonify(task_cats)

# mark task as done

# retrieve tasks 
@app.route('/getIncompletedTasks', methods=['GET'])
def getIncompletedTasks():
    conn = db_connection()
    cursor = conn.cursor()

    user = request.args.get('username')
    cursor.execute("SELECT user_id FROM users WHERE username = %s",(user,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("SELECT * FROM tasks WHERE (user_id = %s AND completed = %s)", (user_id, False))
    tasks = cursor.fetchall()

    tasks_list = [
        {
            'task_id' : task[0],
            'task_category' : task[2],
            'task_description' : task[3],
            'due_date' : task[6],
            'completed': task[7],
            'created_at' : task[4]
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
    cursor.execute("SELECT * FROM tasks WHERE task_id = %s", (task_id,))
    task = cursor.fetchone()
    if not task:
        return jsonify({"error": "Task Does Not Exist"}), 400
    
    cursor.execute("UPDATE tasks SET completed = %s WHERE task_id = %s", (True, task_id))
    conn.commit()

    return jsonify({'message': "Task marked as done successfully"}), 200
    


@app.route('/getAllTasks', methods=['GET'])
def getAllTasks():
    conn = db_connection()
    cursor = conn.cursor()

    user = request.args.get('username').lower()
    cursor.execute("SELECT user_id FROM users WHERE username = %s",(user,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("SELECT * FROM tasks WHERE user_id = %s", (user_id,))
    tasks = cursor.fetchall()

    tasks_list = [
        {
            'task_id' : task[0],
            'task_category' : task[2],
            'task_description' : task[3].strip(),
            'due_date' : task[6],
            'completed': task[7],
            'created_at' : task[4]
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
    
    cursor.execute("SELECT user_id FROM users WHERE username = %s",(username,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("INSERT INTO chat_messages(group_id, user_id, message) VALUES (%s, %s, %s)", (group_id, user_id, message))
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

    # Retrieve messages and user_ids
    cursor.execute("SELECT user_id, message, sent_at FROM chat_messages WHERE group_id = %s ORDER BY sent_at ASC", (group_id,))
    messages = cursor.fetchall()

    messages_list = []
    for message in messages:
        user_id = message[0]

        # Retrieve username and profile picture for each user_id
        cursor.execute("SELECT username, profile_pic FROM users WHERE user_id = %s", (user_id,))
        user_record = cursor.fetchone()

        if not user_record:
            return jsonify({"error": "User Does Not Exist"}), 400

        # Append each message with its corresponding user info
        messages_list.append({
            'user_id': user_id,
            'username': user_record[0],
            'profile_pic': user_record[1],
            'message': message[1],
            'sent_at': message[2]
        })

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

    cursor.execute("SELECT user_id FROM users WHERE username = %s",(created_by,))
    created_by_record = cursor.fetchone()
    
    if not created_by_record:
        return jsonify({"error": "User Does Not Exist 1"}), 400
    created_by = created_by_record[0]
    
    cursor.execute("INSERT INTO `groups`(group_name, created_by, created_at) VALUES (%s,%s, NOW())", (group_name, created_by))
    group_id = cursor.lastrowid

    user_ids = []

    for username in members:
        cursor.execute("SELECT user_id FROM users WHERE username = %s",(username,))
        user_id_record = cursor.fetchone()
        
        if not user_id_record:
            return jsonify({"error": "User Does Not Exist"}), 400
        user_id = user_id_record[0]
        user_ids.append(user_id)

    user_ids.append(created_by)

    for user_id in user_ids:
        cursor.execute("INSERT INTO group_members (group_id, user_id, joined_at) VALUES (%s,%s, NOW())", (group_id, user_id))
    
    conn.commit()

    return jsonify({"message": "Group chat started successfully", "group_id": group_id})

@app.route('/getUserChats', methods=['GET'])
def getUserChats():
    conn = db_connection()
    cursor = conn.cursor()
    username = request.args.get('username')

    if not username:
        return jsonify({"error": "Username is required."}), 400

    try:
        cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
        user_id_record = cursor.fetchone()

        if not user_id_record:
            return jsonify({"error": "User not found."}), 404

        user_id = user_id_record[0]

        cursor.execute("""
            SELECT g.group_id, g.group_name
            FROM `groups` g
            JOIN group_members gm ON g.group_id = gm.group_id
            WHERE gm.user_id = %s
        """, (user_id,))

        groups = cursor.fetchall()

        group_list = [{"group_id": group[0], "group_name": group[1]} for group in groups]

        return jsonify({"groups": group_list}), 200

    except mysql.connector.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred."}), 500

    finally:
        conn.close()

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
    loc = data.get('location')

    print(loc)

    if loc == None:
        loc = None

    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("SELECT task FROM tasks WHERE task_id = %s", (task,))

    task_record = cursor.fetchone()
    if not task_record:
        return jsonify({"error": "Task Does Not Exist"}), 400
    task_content = task_record[0]

    # Insert the new post into the posts table
    cursor.execute("""
        INSERT INTO posts (user_id, content, picture, location, created_at, updated_at)
        VALUES (%s, %s, %s, %s, NOW(), NOW())
    """, (user_id, f'{username} completed: {task_content}', url, loc))

    cursor.execute("UPDATE tasks SET completed = %s WHERE task_id = %s", (True, task))
    conn.commit()
    return jsonify({"message": "Post created successfully"}), 200


@app.route('/retrievePosts', methods=['GET'])
def retrievePosts():
    conn = db_connection()
    cursor = conn.cursor()

    username = request.args.get('username')
    username = str(username).lower()

    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id_record = cursor.fetchone()

    if not user_id_record:
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("""
    SELECT DISTINCT p.post_id, p.content, p.picture, p.created_at, u.username, p.location, u.profile_pic, p.created_at
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN friends f ON ((p.user_id = f.friend_id AND f.user_id = %s) OR (p.user_id = f.user_id AND f.friend_id = %s))
    WHERE (p.user_id = %s OR f.status = 'accepted') 
    ORDER BY p.created_at DESC
""", (user_id, user_id, user_id))

    posts = cursor.fetchall()
    
    posts_list = []
    for post in posts:
        # Check if the user has liked the post
        cursor.execute("""
        SELECT COUNT(1) FROM post_likes WHERE post_id = %s AND user_id = %s
        """, (post[0], user_id))
        liked = cursor.fetchone()[0] > 0

        # Get like count for the post
        cursor.execute("""
        SELECT COUNT(*) FROM post_likes WHERE post_id = %s
        """, (post[0],))
        like_count = cursor.fetchone()[0]

        # Retrieve all comments for the post
        cursor.execute("""
        SELECT u.username, c.comment, c.created_at, u.profile_pic
        FROM post_comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.post_id = %s
        ORDER BY c.created_at ASC
        """, (post[0],))
        
        comments = cursor.fetchall()
        comments_list = [{
            'username': comment[0],
            'comment': comment[1],
            'created_at': comment[2],
            'profile_pic': comment[3]
        } for comment in comments]

        posts_list.append({
            'post_id': post[0],
            'content': post[1],
            'picture': post[2],
            'created_at': post[3],
            'author_username': post[4],
            'liked_by_user': liked,
            'like_count': like_count,  # Add like count here
            'comments': comments_list,
            'location': post[5],
            'profile_pic': post[6],
            'created_at': post[7]
        })

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
        SELECT u.user_id, u.username, u.profile_pic
        FROM users u
        WHERE u.username LIKE %s
        AND u.user_id != %s
        AND NOT EXISTS (
            SELECT 1 FROM friends f
            WHERE (f.user_id = u.user_id AND f.friend_id = %s)
            OR (f.friend_id = u.user_id AND f.user_id = %s)
        )
    """

    cursor.execute(search_query, ('%' + query + '%', current_user_id, current_user_id, current_user_id))
    users = cursor.fetchall()
    conn.close()

    users_list = [{'user_id': user[0], 'username': user[1], 'profile_pic': user[2]} for user in users]

    return jsonify({"users": users_list}), 200

# update password
@app.route('/updatePassword', methods=['POST'])
def updatePassword():
    conn = db_connection()
    cursor = conn.cursor()

    # Get credentials from request arguments
    data = request.get_json()
    username = data.get('username').lower()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not username or not old_password or not new_password:
        return jsonify({"error": "All fields are required."}), 400

    try:
        # Check if the old password is correct
        cursor.execute("SELECT password FROM users WHERE username = %s", (username,))
        user_record = cursor.fetchone()

        if not user_record:
            return jsonify({"error": "User not found."}), 404

        if user_record[0] != old_password:
            return jsonify({"error": "Incorrect old password."}), 401

        # Update the password
        cursor.execute("UPDATE users SET password = %s WHERE username = %s", (new_password, username))
        conn.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except mysql.connector.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred."}), 500

    finally:
        conn.close()

@app.route('/updateEmail', methods=['POST'])
def updateEmail():
    conn = db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    username = data.get('username').lower()
    new_email = data.get('new_email').lower()
    verification_code = data.get('verification_code')

    if not username or not new_email or not verification_code:
        return jsonify({"error": "All fields are required."}), 400

    try:
        cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
        user_id_record = cursor.fetchone()

        if not user_id_record:
            return jsonify({"error": "User not found."}), 404
        
        user_id = user_id_record[0]

        cursor.execute("SELECT verification_code FROM verification_codes WHERE user_id = %s", (user_id,))
        code_record = cursor.fetchone()

        if not code_record or code_record[0] != verification_code:
            print(code_record)
            print(code_record[0])
            return jsonify({"error": "Invalid verification code."}), 401

        # Update the email
        cursor.execute("UPDATE users SET email = %s WHERE username = %s", (new_email, username))
        conn.commit()

        return jsonify({"message": "Email updated successfully"}), 200

    except mysql.connector.Error as e:
        print(e)
        return jsonify({"error": "Database error occurred."}), 500

    finally:
        conn.close()
    
@app.route('/getVerificationChangeEmail', methods=['POST'])
def sendVerificationEmail():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()

    new_email = data.get('new_email').lower()
    username = data.get('username').lower()

    # Generate verification code
    string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    verification_code = ""
    length = len(string)
    for i in range(6):
        verification_code += string[math.floor(random.random() * length)]

    # Retrieve user_id using username
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id = cursor.fetchone()

    if not user_id:
        print(user_id)
        return jsonify({"error": "User not found"}), 404

    # Update or insert verification code in the database
    cursor.execute("SELECT * FROM verification_codes WHERE user_id = %s", (user_id[0],))
    if cursor.fetchone():
        cursor.execute("UPDATE verification_codes SET verification_code = %s WHERE user_id = %s", (verification_code, user_id[0]))
    else:
        cursor.execute("INSERT INTO verification_codes (user_id, verification_code) VALUES (%s, %s)", (user_id[0], verification_code))
    
    conn.commit()

    # Read email template and replace placeholder with actual verification code
    with open('./templates/verification_email.html', 'r', encoding='utf-8') as file:
        email_content = file.read()
        email_content = email_content.replace('{{verification_code}}', verification_code)

    # Email sending setup
    sender_email = "socialtodobot@gmail.com"
    receiver_email = new_email  # Use the new email provided
    password = "sppg zywg yzqu dymu"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Your Verification Code"
    message["From"] = sender_email
    message["To"] = receiver_email

    # Add HTML content to email
    part = MIMEText(email_content, "html")
    message.attach(part)

    # Create secure SSL context and send the email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())

    return jsonify({"message": "Verification email sent successfully"}), 200

@app.route('/likePost', methods=['POST'])
def like_post():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    post_id = data.get('post_id')
    username = data.get('username').lower()
    print(username)

    cursor.execute("SELECT user_id FROM users WHERE username = %s",(username,))
    user_id_record = cursor.fetchone()
    
    if not user_id_record:
        print("1")
        return jsonify({"error": "User Does Not Exist"}), 400
    user_id = user_id_record[0]

    cursor.execute("SELECT * FROM post_likes WHERE post_id=%s AND user_id=%s", (post_id, user_id))
    like = cursor.fetchone()

    if like:
        print("2")
        return jsonify({"message": "User has already liked this post"}), 400

    cursor.execute("INSERT INTO post_likes (post_id, user_id) VALUES (%s, %s)", (post_id, user_id))
    conn.commit()
    return jsonify({"message": "Post liked successfully"}), 200


@app.route('/commentOnPost', methods=['POST'])
def comment_on_post():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    post_id = data.get('post_id')
    username = data.get('username')
    comment = data.get('comment')
    # Convert username to user_id
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id_record = cursor.fetchone()
    if not user_id_record:
        return jsonify({"error": "User does not exist"}), 400
    user_id = user_id_record[0]


    cursor.execute("INSERT INTO post_comments (post_id, user_id, comment) VALUES (%s, %s, %s)", (post_id, user_id, comment))
    conn.commit()
    return jsonify({"message": "Comment added successfully"}), 200

@app.route('/unlikePost', methods=['POST'])
def unlike_post():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()

    username = data.get('username')
    post_id = data.get('post_id')

    # Convert username to user_id
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id_record = cursor.fetchone()
    if not user_id_record:
        return jsonify({"error": "User does not exist"}), 400
    user_id = user_id_record[0]

    # Remove the like from the post_likes table
    cursor.execute("DELETE FROM post_likes WHERE user_id = %s AND post_id = %s", (user_id, post_id))
    conn.commit()

    return jsonify({"message": "Post unliked successfully"}), 200

@app.route('/getPostLikes', methods=['GET'])
def get_post_likes():
    conn = db_connection()
    cursor = conn.cursor()
    post_id = request.args.get('post_id')

    if not post_id:
        return jsonify({"error": "Missing post_id parameter"}), 400

    try:
        # Cast post_id to integer to prevent SQL injection
        post_id = int(post_id)
    except ValueError:
        return jsonify({"error": "Invalid post_id parameter"}), 400

    cursor.execute("SELECT COUNT(*) FROM post_likes WHERE post_id = %s", (post_id,))
    likes_count = cursor.fetchone()[0]

    return jsonify({"post_id": post_id, "likes_count": likes_count}), 200


@app.route('/editTask', methods=['PUT'])
def edit_task():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    
    # Extract the data needed to update the task
    task_id = data.get('task_id')
    new_description = data.get('new_description')
    new_due_date = data.get('new_due_date') 
    new_task_category = data.get('new_task_category') 
    due_date_mysql_format = datetime.fromisoformat(new_due_date.replace("Z", "+00:00")).strftime('%Y-%m-%d %H:%M:%S')



    # Check if the task exists
    cursor.execute("SELECT * FROM tasks WHERE task_id = %s", (task_id,))
    task = cursor.fetchone()
    
    if task:
        # Update the task if it exists
        cursor.execute("""
            UPDATE tasks
            SET task = %s,
                due_date = %s,
                task_category = %s
            WHERE task_id = %s
        """, (new_description, due_date_mysql_format, task_id, new_task_category))
        
        conn.commit()
        return jsonify({"message": "Task updated successfully"}), 200
    else:
        # Task does not exist
        return jsonify({"error": "Task not found"}), 404

@app.route('/updateProfilePic', methods=['PUT'])
def update_profile_pic():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    
    # Extract the data needed to update the profile picture
    profile_pic_url = data.get('profile_pic_url')
    username = data.get('username')

    # Check if the user exists and get their user_id
    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    user_id_record = cursor.fetchone()
    if not user_id_record:
        return jsonify({"error": "User does not exist"}), 400
    user_id = user_id_record[0]

    # Update the user's profile picture URL
    try:
        cursor.execute("UPDATE users SET profile_pic = %s WHERE user_id = %s", (profile_pic_url, user_id))
        conn.commit()
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    
    # Close the database connection
    cursor.close()
    conn.close()

    return jsonify({"message": "Profile picture updated successfully"}), 200

@app.route('/getProfilePicture', methods=['GET'])
def get_profile_pic():
    conn = db_connection()
    cursor = conn.cursor()

    username = request.args.get('username')

    if not username:
        return jsonify({"error": "Username parameter is missing"}), 400

    cursor.execute("SELECT user_id FROM users WHERE username =  %s", (username,))
    user_id_record = cursor.fetchone()
    if not user_id_record:
        return jsonify({"error": "User does not exist"}), 400
    user_id = user_id_record[0]

    # Update the user's profile picture
    try:
        cursor.execute("SELECT profile_pic FROM users WHERE user_id =  %s", (user_id,))
        pic_record = cursor.fetchone()
        if pic_record:
            pic = pic_record[0]
            if pic:
                return jsonify(pic), 200
            else:
                return jsonify(None), 200  # Returning None when the profile picture is empty
        else:
            return jsonify({"message": "User does not have a profile picture"}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    
    # Close the database connection
    cursor.close()
    conn.close()

@app.route('/deleteTask', methods=['POST'])
def deleteTask():
    conn = db_connection()
    cursor = conn.cursor()
    data = request.get_json()

    task_id = data.get('task_id')

    if not task_id:
        return jsonify({"error": "Task ID is required"}), 400

    cursor.execute("SELECT * FROM tasks WHERE task_id = %s", (task_id,))
    task = cursor.fetchone()

    if not task:
        return jsonify({"error": "Task not found"}), 404

    cursor.execute("DELETE FROM tasks WHERE task_id = %s", (task_id,))
    conn.commit()

    return jsonify({"message": "Task deleted successfully"}), 200






if __name__ == '__main__':
    app.run(port=2323)
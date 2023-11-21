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
    email = data.get('email')
    username = data.get('username')
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
    username_or_email = data['username_or_email']
    password = data['password']

    if '@' in username_or_email and '.' in username_or_email:
        field = 'email'
    else:
        field = 'username'

    try:
        # Query the database to find a user
        cursor.execute(f"SELECT * FROM users WHERE {field} = ? AND password = ?", (username_or_email, password))
        user = cursor.fetchone()

        # Check if user was found and return appropriate response
        if user:
            return jsonify({"authenticated": True}), 200
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
    email = data.get('email')

    # Generate verification code
    string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    verification_code = ""
    length = len(string)
    for i in range(6):
        verification_code += string[math.floor(random.random() * length)]

    cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
    user_id = cursor.fetchone()
    print(email)
    print(user_id)

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
    email = data.get('email')
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


if __name__ == '__main__':
    app.run(port=2323)
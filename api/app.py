from datetime import datetime
from flask import Flask, request, jsonify
import sqlite3
import collections

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

@app.route('/login', methods=['GET'])
def login():
    conn = db_connection()
    cursor = conn.cursor()

    # Get credentials from request arguments
    username_or_email = request.args.get('username_or_email')
    password = request.args.get('password')

    # Determine if the input is an email or a username
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


if __name__ == '__main__':
    app.run(port=2323)
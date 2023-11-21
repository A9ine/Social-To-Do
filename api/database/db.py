import sqlite3

# Establish a connection to the SQLite database named 'social-to-do.sqlite'
conn = sqlite3.connect("social-to-do.sqlite")
cursor = conn.cursor()

# SQL query to create the 'users' table
create_users_table = """
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        timestamp TEXT NOT NULL
    );
"""

# SQL query to create the 'verification_codes' table
create_verification_codes_table = """
    CREATE TABLE IF NOT EXISTS verification_codes (
        code_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        verification_code TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""

# Execute each SQL statement
cursor.execute(create_users_table)
cursor.execute(create_verification_codes_table)

# Commit the changes and close the connection
conn.commit()
conn.close()

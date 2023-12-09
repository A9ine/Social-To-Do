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
        timestamp TEXT NOT NULL,
        profile_pic TEXT,
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

# SQL query to create the 'friends' table
create_friends_table = """
    CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (friend_id) REFERENCES users(user_id)
    );
"""

create_tasks_table = """
    CREATE TABLE IF NOT EXISTS tasks (
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task_category TEXT NOT NULL,
        task TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        due_date DATETIME NOT NULL,
        completed BOOLEAN NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""

# Task Category Table
create_task_category_table = """
     CREATE TABLE IF NOT EXISTS task_categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_name TEXT NOT NULL UNIQUE
    );
"""

create_groups_table = """
    CREATE TABLE IF NOT EXISTS groups (
        group_id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id)
    );
"""

create_group_members_table = """
    CREATE TABLE IF NOT EXISTS group_members (
        group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at DATETIME NOT NULL,
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        FOREIGN KEY (group_id) REFERENCES groups(group_id)
    );
"""

create_chat_messages_table = """
    CREATE TABLE IF NOT EXISTS chat_messages (
        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        FOREIGN KEY (group_id) REFERENCES groups(group_id)
    );
"""

create_posts_table = """
    CREATE TABLE IF NOT EXISTS posts (
        post_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        picture TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        location TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""

create_post_likes_table = """
    CREATE TABLE IF NOT EXISTS post_likes (
        like_id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(post_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""

create_post_comments_table = """
    CREATE TABLE IF NOT EXISTS post_comments (
        comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(post_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""


# Execute each SQL statement
cursor.execute(create_users_table)
cursor.execute(create_verification_codes_table)
cursor.execute(create_friends_table)
cursor.execute(create_tasks_table)
cursor.execute(create_task_category_table)
# Inserting categories into table
initial_categories = ["Work", "Home", "Personal Development", "Gym", 
"Family", "Social", "Errands", "School", "Leisure", "Activities", "Sports", "Travel", "Appointments",
"Projects", "Cooking", "Lunch", "Dinner"]
for category in initial_categories:
    cursor.execute("INSERT INTO task_categories (category_name) VALUES (?)", (category,))

cursor.execute(create_groups_table)
cursor.execute(create_group_members_table)
cursor.execute(create_chat_messages_table)
cursor.execute(create_posts_table)
cursor.execute(create_post_likes_table)
cursor.execute(create_post_comments_table)

# Commit the changes and close the connection
conn.commit()
conn.close()
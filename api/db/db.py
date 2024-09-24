import mysql.connector

hostname = "socialtodo-db.mysql.database.azure.com"
username = "taenam"
password = "Seshim38"
database = "socialtodo-db"

try:
    conn = mysql.connector.connect(
        host=hostname,
        user=username,
        passwd=password,
        database=database
    )
    cursor = conn.cursor()
    print("Connection established successfully.")
except mysql.connector.Error as err:
    print(f"Error: {err}")
    cursor = None


# SQL query to create the 'users' table
create_users_table = """
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        timestamp DATETIME NOT NULL,
        profile_pic TEXT
    );
"""

# SQL query to create the 'verification_codes' table
create_verification_codes_table = """
    CREATE TABLE IF NOT EXISTS verification_codes (
        code_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        verification_code TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""

# SQL query to create the 'friends' table
create_friends_table = """
    CREATE TABLE IF NOT EXISTS friends (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        friend_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (friend_id) REFERENCES users(user_id)
    );
"""

create_tasks_table = """
    CREATE TABLE IF NOT EXISTS tasks (
        task_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        task_category VARCHAR(255) NOT NULL,
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
        category_id INT AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL UNIQUE
    );
"""

create_groups_table = """
    CREATE TABLE IF NOT EXISTS `groups` (
        group_id INT AUTO_INCREMENT PRIMARY KEY,
        group_name VARCHAR(255) NOT NULL,
        created_by INT NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id)
    );
"""

create_group_members_table = """
    CREATE TABLE IF NOT EXISTS group_members (
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at DATETIME NOT NULL,
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (group_id) REFERENCES `groups`(group_id)
    );
"""

create_chat_messages_table = """
    CREATE TABLE IF NOT EXISTS chat_messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (group_id) REFERENCES `groups`(group_id)
    );
"""

create_posts_table = """
    CREATE TABLE IF NOT EXISTS posts (
        post_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        picture TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        location TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""

create_post_likes_table = """
    CREATE TABLE IF NOT EXISTS post_likes (
        like_id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(post_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""

create_post_comments_table = """
    CREATE TABLE IF NOT EXISTS post_comments (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(post_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
"""

# Execute each SQL statement
try:
    cursor.execute(create_users_table)
    cursor.execute(create_verification_codes_table)
    cursor.execute(create_friends_table)
    cursor.execute(create_tasks_table)
    cursor.execute(create_task_category_table)
    
    # Inserting categories into the table
    initial_categories = ["Work", "Home", "Personal Development", "Gym", 
    "Family", "Social", "Errands", "School", "Leisure", "Activities", "Sports", "Travel", "Appointments",
    "Projects", "Cooking", "Lunch", "Dinner"]
    for category in initial_categories:
        cursor.execute("INSERT INTO task_categories (category_name) VALUES (%s)", (category,))
    
    cursor.execute(create_groups_table)
    cursor.execute(create_group_members_table)
    cursor.execute(create_chat_messages_table)
    cursor.execute(create_posts_table)
    cursor.execute(create_post_likes_table)
    cursor.execute(create_post_comments_table)

    # Commit the changes
    conn.commit()
except mysql.connector.Error as err:
    print(f"Error: {err}")

# Close the cursor and connection
if cursor:
    cursor.close()
conn.close()
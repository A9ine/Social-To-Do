import sqlite3

# Establish a connection to the SQLite database named 'social-to-do.sqlite'
conn = sqlite3.connect("social-to-do.sqlite")

cursor = conn.cursor()
sql_query =  """ CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    timestamp TEXT NOT NULL
);
 """
cursor.execute(sql_query)
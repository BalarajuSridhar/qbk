import mysql.connector
from mysql.connector import Error

def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='bulk_questions'
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def init_db():
    connection = create_connection()
    if connection:
        cursor = connection.cursor()
        
        # Create questions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question_text TEXT NOT NULL,
                question_html TEXT,
                question_type ENUM('multiple_choice', 'integer', 'fill_ups', 'true_false', 'comprehension') NOT NULL,
                options JSON,
                correct_answer VARCHAR(500),
                solution TEXT,
                marks INT,
                image_path VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ''')
        
        connection.commit()
        cursor.close()
        connection.close()
        print("Database initialized successfully")
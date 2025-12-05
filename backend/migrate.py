from database import create_connection

def migrate_database():
    connection = create_connection()
    if not connection:
        print("❌ Failed to connect to database")
        return
    
    cursor = connection.cursor()
    
    try:
        # Check if solution_image_path column exists
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'questions' 
            AND COLUMN_NAME = 'solution_image_path'
        """)
        
        result = cursor.fetchone()
        if result[0] == 0:
            print("🔧 Adding solution_image_path column...")
            cursor.execute('ALTER TABLE questions ADD COLUMN solution_image_path VARCHAR(500)')
            connection.commit()
            print("✅ Added solution_image_path column to questions table")
        else:
            print("✅ solution_image_path column already exists")
        
        # Also check for language column
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'questions' 
            AND COLUMN_NAME = 'language'
        """)
        
        result = cursor.fetchone()
        if result[0] == 0:
            print("🔧 Adding language column...")
            cursor.execute('ALTER TABLE questions ADD COLUMN language VARCHAR(20)')
            connection.commit()
            print("✅ Added language column to questions table")
        else:
            print("✅ language column already exists")
            
    except Exception as e:
        print(f"❌ Migration error: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    migrate_database()
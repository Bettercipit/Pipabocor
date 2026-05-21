import mysql.connector

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "leak_detection_db"
}

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    print("--- Columns in 'alerts' table ---")
    cursor.execute("DESCRIBE alerts")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Columns in 'sensor_readings' table ---")
    cursor.execute("DESCRIBE sensor_readings")
    for row in cursor.fetchall():
        print(row)
        
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")

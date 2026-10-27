import psycopg

def ensure_database():
    try:
        conn = psycopg.connect("postgresql://postgres:postgres@localhost:5432/postgres", autocommit=True)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname = 'riseupzed_db'")
        exists = cur.fetchone()
        if not exists:
            cur.execute("CREATE DATABASE riseupzed_db")
            print("Database 'riseupzed_db' created successfully.")
        else:
            print("Database 'riseupzed_db' already exists.")
        conn.close()
    except Exception as e:
        print(f"Could not connect to PostgreSQL server: {e}")

if __name__ == "__main__":
    ensure_database()

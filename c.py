import sqlite3

DB_PATH = r"\\10.23.107.200\share\卒業研究2025\01作業用フォルダ\12_S3A1\Calorie Canvas\作業管理\履歴画面\b\bin\mydatabase.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

print("修復前テーブル:")
cur.execute("PRAGMA table_info(users)")
print(cur.fetchall())

# 1️⃣ 新しい users_new テーブルを正しい形で作成
cur.execute("""
CREATE TABLE IF NOT EXISTS users_new (
    accountId INTEGER PRIMARY KEY,
    password TEXT,
    age INTEGER,
    weight FLOAT,
    height FLOAT,
    gender TEXT,
    birthdate DATE,
    allergy TEXT
)
""")

# 2️⃣ 元のデータを移行（name カラムは不要なので捨てます）
cur.execute("""
INSERT INTO users_new (accountId, age, weight, height, gender, birthdate, allergy)
SELECT accountId, age, weight, height, gender, birthdate, allergy
FROM users
""")

# 3️⃣ 古いテーブルを削除
cur.execute("DROP TABLE users")

# 4️⃣ 新しいテーブルをリネーム
cur.execute("ALTER TABLE users_new RENAME TO users")

conn.commit()
conn.close()

print("修復完了")

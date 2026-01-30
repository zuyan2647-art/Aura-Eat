import os
import datetime
import sqlite3
import requests
import json
from flask import Flask, render_template, request, jsonify, session, url_for


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "static"),
    template_folder=os.path.join(BASE_DIR, "templates")
)
app.secret_key = "your-secret-key"

DB_PATH = os.path.join(BASE_DIR, "mydatabase.db")

# APIキー（そのまま引き継ぎ）
GEMINI_API_KEY = "AIzaSyDMnnsEhow2f-jBcCHhP04PApOY2h808ag"
RAKUTEN_APP_ID = "1040440591394275196"
PLACEHOLDER_ID = "YOUR_RAKUTEN_APP_ID_HERE"
PLACEHOLDER_KEY = "YOUR_GEMINI_API_KEY_HERE"

# DB接続
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ---------- 画面表示 ----------


@app.route("/")
def start():
    return render_template("start.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/sentaku")
def sentaku():
    return render_template("sentaku.html")

@app.route("/menu")
def menu():
    return render_template("menu.html")

@app.route("/curry")
def curry():
    return render_template("curry.html")

@app.route("/suggestion")
def suggestion():
    return render_template("suggestion.html")

@app.route("/profile_input")
def profile_input():
    accountId = session.get("accountId")
    user_data = {}
    
    if accountId:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        # usersテーブルから現在のプロフィール情報を取得
        cur.execute("""
            SELECT age, weight, height, gender, birthdate, allergy
            FROM users WHERE accountId=?
        """, (accountId,))
        row = cur.fetchone()
        conn.close()

        if row:
            # 取得したデータをディクショナリに格納
            user_data = {
                "age": row[0],
                "weight": row[1],
                "height": row[2],
                "gender": row[3],
                "birthdate": row[4],
                "allergy": row[5]
            }
            # birthdateが 'YYYY-MM-DD HH:MM:SS' 形式の場合に備え、日付部分のみ抽出
            if user_data.get("birthdate") and len(user_data["birthdate"]) > 10:
                user_data["birthdate"] = user_data["birthdate"][:10]
        
    # user_data をテンプレートに渡す
    return render_template("profile_input.html", user=user_data)

# ---------- 食事履歴 (ソート機能追加) ----------
@app.route("/rireki")
def rireki():
    accountId = session.get("accountId")
    if not accountId:
        return "ログイン情報がありません", 400

    conn = get_db_connection()
    cur = conn.cursor()

    period = request.args.get('period', 'today')
    today = datetime.date.today()
    start_date = None

    if period == 'week':
        start_date = today - datetime.timedelta(days=6)
    elif period == 'month':
        start_date = today - datetime.timedelta(days=30)
    elif period == 'today':
        start_date = today

    meal_query = """
        SELECT record_date, food_item, calories, protein, fat, carb, image
        FROM meal
        WHERE accountId = ?
    """
    params = [accountId]

    if start_date:
        meal_query += " AND record_date >= ? "
        params.append(start_date.strftime('%Y-%m-%d') + ' 00:00:00')

    meal_query += " ORDER BY record_date DESC"

    cur.execute(meal_query, params)
    filtered_meals = cur.fetchall()

    # 本日分合計
    today_str = today.strftime('%Y-%m-%d')
    cur.execute("""
        SELECT calories, protein, fat, carb
        FROM meal
        WHERE accountId = ?
        AND strftime('%Y-%m-%d', record_date) = ?
    """, (accountId, today_str))
    today_meals = cur.fetchall()
    conn.close()

    total_cal = sum(m['calories'] or 0 for m in today_meals)
    total_pro = sum(m['protein'] or 0 for m in today_meals)
    total_fat = sum(m['fat'] or 0 for m in today_meals)
    total_carb = sum(m['carb'] or 0 for m in today_meals)

    return render_template(
        "rireki.html",
        meals=filtered_meals,
        total_cal=total_cal,
        total_pro=total_pro,
        total_fat=total_fat,
        total_carb=total_carb,
        current_period=period
    )

# ---------- 新規：食事削除 API ----------
@app.route("/delete_meal", methods=["POST"])
def delete_meal():
    try:
        accountId = session.get("accountId")
        if not accountId:
            return jsonify({"success": False, "error": "ログイン情報なし"}), 400

        data = request.json
        # 削除対象の record_date のリストを受け取る
        record_dates = data.get("recordDates") 

        if not record_dates:
            return jsonify({"success": False, "error": "削除対象が指定されていません"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        # 複数のレコードを一度に削除するために、IN句を使用
        # プレースホルダ (?) の数を作成: (1, 2, 3, ...)
        placeholders = ','.join('?' for _ in record_dates)
        
        # SQLITEの record_date は主キーですが、accountId との組み合わせで確実に特定
        sql = f"""
            DELETE FROM meal
            WHERE accountId = ? AND record_date IN ({placeholders})
        """
        
        # 実行: accountId と record_dates の値をタプルで渡す
        params = (accountId,) + tuple(record_dates)
        cur.execute(sql, params)
        
        deleted_count = cur.rowcount
        conn.commit()
        conn.close()

        if deleted_count > 0:
            return jsonify({"success": True, "deleted_count": deleted_count})
        else:
            return jsonify({"success": False, "error": "削除対象のレコードが見つかりませんでした"}), 404

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

# ---------- 新規 登録API ----------
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json

        accountId = data.get("accountId")
        password = data.get("password")
        age = int(data.get("age"))
        weight = float(data.get("weight"))
        height = float(data.get("height"))
        gender = data.get("gender")
        birth = data.get("birth")
        birthdate = f"{birth['year']}-{birth['month']}-{birth['day']}"
        allergy = data.get("allergy")

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO users (accountId, password, age, weight, height, gender, birthdate, allergy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (accountId, password, age, weight, height, gender, birthdate, allergy))
        conn.commit()
        conn.close()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# ---------- ログイン ----------
@app.route("/login_check", methods=["POST"])
def login_check():
    try:
        data = request.json
        accountId = data.get("accountId")
        password = data.get("password")

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            SELECT accountId FROM users WHERE accountId = ? AND password = ?
        """, (accountId, password))
        user = cur.fetchone()
        conn.close()

        if user:
            session["accountId"] = accountId
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "ID またはパスワードが違います"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# ---------- プロフィール確認画面に進む ----------
@app.route("/profile_check", methods=["POST"])
def profile_check():
    return render_template(
        "profile_check.html",
        age=request.form.get("age"),
        gender=request.form.get("gender"),
        birthday=request.form.get("birthday"),
        allergy=request.form.get("allergy"),
        height=request.form.get("height"),
        weight=request.form.get("weight")
    )

# ---------- プロフィール保存（名前なし） ----------
@app.route("/update_profile_from_check", methods=["POST"])
def update_profile_from_check():
    try:
        accountId = session.get("accountId")
        if not accountId:
            return "ログイン情報がありません", 400

        age = request.form.get("age")
        gender = request.form.get("gender")
        birthday = request.form.get("birthday")
        allergy = request.form.get("allergy")
        height = request.form.get("height")
        weight = request.form.get("weight")

        try:
            age_int = int(age)
            height_float = float(height)
            weight_float = float(weight)
        except:
            return "数値の形式が正しくありません", 400

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            UPDATE users SET
                age=?, weight=?, height=?, gender=?, birthdate=?, allergy=?
            WHERE accountId=?
        """, (age_int, weight_float, height_float, gender, birthday, allergy, accountId))

        if cur.rowcount == 0:
            cur.execute("""
                INSERT INTO users (accountId, password, age, weight, height, gender, birthdate, allergy)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (accountId, "TEMP_PASS", age_int, weight_float, height_float, gender, birthday, allergy))

        conn.commit()
        conn.close()

        return render_template("profile_view.html", user={
            "accountId": accountId,
            "age": age,
            "gender": gender,
            "birthdate": birthday,
            "allergy": allergy,
            "height": height,
            "weight": weight
        })

    except Exception as e:
        return f"エラー: {e}", 500

# ---------- プロフィール閲覧 ----------
@app.route("/profile_view")
def profile_view():
    accountId = session.get("accountId")
    if not accountId:
        return "ログイン情報がありません", 400

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        SELECT accountId, age, weight, height, gender, birthdate, allergy
        FROM users WHERE accountId=?
    """, (accountId,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return "ユーザーが見つかりません", 404

    user = {
        "accountId": row[0],
        "age": row[1],
        "weight": row[2],
        "height": row[3],
        "gender": row[4],
        "birthdate": row[5],
        "allergy": row[6]
    }

    return render_template("profile_view.html", user=user)

# ---------- 食事保存 ----------
@app.route("/save_meal", methods=["POST"])
def save_meal():
    try:
        accountId = session.get("accountId")
        if not accountId:
            return jsonify({"success": False, "error": "ログイン情報なし"})

        data = request.json
        food_item = data.get("foodName")
        calories = data.get("calories")
        protein = data.get("protein")
        fat = data.get("fat")
        carb = data.get("carb")

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO meal (record_date, calories, food_item, protein, fat, carb, accountId)
            VALUES (datetime('now','localtime'), ?, ?, ?, ?, ?, ?)
        """, (calories, food_item, protein, fat, carb, accountId))
        conn.commit()
        conn.close()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# --------------------------------------
# APIエンドポイント
# --------------------------------------


# 1. ユーザー情報の取得 API (DBから取得)
@app.route('/api/user')
def get_user():
    """
    データベースからログイン中のユーザー設定をフェッチし、JSON形式で返す。
    """
    accountId = session.get("accountId")
    conn = get_db_connection()
    
    user_data = None
    if accountId:
        # ログイン中のユーザー情報を取得
        user_data = conn.execute(
            # 取得するカラムに accountId を追加
            "SELECT accountId, weight, height, age, gender, allergy FROM users WHERE accountId = ?", 
            (accountId,)
        ).fetchone()
    
    # ログインユーザーのデータがない場合、最初のユーザーを試みる
    if not user_data:
        user_data = conn.execute(
            # 取得するカラムに accountId を追加
            "SELECT accountId, weight, height, age, gender, allergy FROM users LIMIT 1"
        ).fetchone()

    conn.close()

    if user_data:
        # usersテーブルではアレルギーの列名が 'allergy'
        return jsonify({
            # accountId をレスポンスに追加
            "accountId": user_data['accountId'],
            "weight": user_data['weight'],
            "height": user_data['height'],
            "age": user_data['age'],
            "gender": user_data['gender'],
            "allergies": user_data['allergy'] or "なし" # app1.pyのkeyspaceに合わせる
        })
    else:
        # データが見つからない場合のフォールバック
        return jsonify({
            # accountId をフォールバックに追加
            "accountId": "ゲスト", 
            "weight": 0, "height": 0, "age": 0, "gender": "male", "allergies": "なし"
        }), 404

# 2. 本日の摂取履歴の取得 API (DBから取得)
@app.route('/api/intake')
def get_intake():
    """
    データベースの 'meal' テーブルから本日の栄養摂取履歴を合計し、JSON形式で返す。
    """
    today_str = datetime.date.today().strftime('%Y-%m-%d')
    accountId = session.get("accountId")
    
    # 未ログインの場合、データベースに記録されている適当なユーザーのIDを仮で使う（暫定対応）
    if not accountId:
        conn_temp = get_db_connection()
        temp_user = conn_temp.execute("SELECT accountId FROM users LIMIT 1").fetchone()
        conn_temp.close()
        accountId = temp_user['accountId'] if temp_user else None
        
    conn = get_db_connection()
    
    if accountId:
        # mealテーブルから今日の摂取履歴を合計して取得
        intake_data = conn.execute(
            """
            SELECT 
                SUM(calories) AS calories, 
                SUM(protein) AS protein, 
                SUM(fat) AS fat, 
                SUM(carb) AS carbs 
            FROM meal 
            WHERE record_date LIKE ? AND accountId = ?
            """, 
            (today_str + '%', accountId) # SQLiteでは日付を文字列として扱うため、LIKEを使うか、strftimeで比較する
        ).fetchone()
    else:
        intake_data = None
    
    conn.close()

    if intake_data and intake_data['calories'] is not None:
        # SUM結果がNoneでないことを確認
        data = {
            'date': today_str,
            'calories': float(intake_data['calories']),
            'protein': float(intake_data['protein']),
            'fat': float(intake_data['fat']),
            'carbs': float(intake_data['carbs'])
        }
        return jsonify(data)
    else:
        # 今日のデータがない場合は、すべて0として返す
        return jsonify({
            "date": today_str,
            "calories": 0.0,
            "protein": 0.0,
            "fat": 0.0,
            "carbs": 0.0
        })

# 3. 楽天レシピランキング取得 API (外部API)
@app.route('/api/rakuten_ranking')
def get_ranking():
    """
    楽天レシピ カテゴリランキングAPIからデータを取得します。
    """
    if RAKUTEN_APP_ID == PLACEHOLDER_ID:
        # APIキーがない場合のダミーデータ
        return jsonify({
            "result": [
                {"recipeTitle": "ダミーレシピ1：鶏むね肉で高タンパク", "foodImageUrl": "https://placehold.co/100x100/9b59b6/ffffff?text=P1", "recipeUrl": "#"},
                {"recipeTitle": "ダミーレシピ2：野菜たっぷり低カロリー", "foodImageUrl": "https://placehold.co/100x100/2ecc71/ffffff?text=C2", "recipeUrl": "#"},
                {"recipeTitle": "ダミーレシピ3：疲労回復スープ", "foodImageUrl": "https://placehold.co/100x100/e67e22/ffffff?text=V3", "recipeUrl": "#"},
                {"recipeTitle": "ダミーレシピ4：お手軽サラダ", "foodImageUrl": "https://placehold.co/100x100/3498db/ffffff?text=S4", "recipeUrl": "#"}
            ]
        })
        
    url = f"https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?format=json&applicationId=1040440591394275196"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        print(f"楽天APIエラー: {e}")
        return jsonify({"error": "楽天ランキングの取得に失敗しました。"}), 500

# 4. Gemini AIによるレシピ提案 API (外部API)
@app.route('/api/propose', methods=['POST'])
def propose_recipes():
    """
    Gemini APIを呼び出し、不足栄養素に基づいたレシピを提案します。
    エラー発生時も必ずJSON形式で詳細を返します。
    """
    # どんなエラーが起きてもキャッチできるように全体をtryで囲む
    try:
        # --- ダミーデータ処理 ---
        if GEMINI_API_KEY == PLACEHOLDER_KEY:
            dummy_data_str = json.dumps([
                { "meal": "朝食", "recipeName": "AI提案なし（設定必要）", "description": "APIキーを設定してください。", "mainIngredient": "設定", "prepTimeMinutes": 5, "rakutenSearchUrl": "#" },
                { "meal": "昼食", "recipeName": "AI提案なし（設定必要）", "description": "APIキーを設定してください。", "mainIngredient": "設定", "prepTimeMinutes": 5, "rakutenSearchUrl": "#" },
                { "meal": "夕食", "recipeName": "AI提案なし（設定必要）", "description": "APIキーを設定してください。", "mainIngredient": "設定", "prepTimeMinutes": 5, "rakutenSearchUrl": "#" }
            ])
            return jsonify({"result": dummy_data_str}), 200 

        # --- リクエストデータの取得 ---
        data = request.json
        deficits = data.get('deficits', 'カロリー')
        allergies = data.get('allergies', 'なし')
        ranking_context = data.get('rankingContext', '')
        # ★ 追加：目標カロリーを取得
        meal_target_calories = data.get('mealTargetCalories', {}) #
        
        # --- プロンプト作成 (JSONのカンマ位置は正しく修正済み) ---
        prompt = f"""
        あなたはプロの栄養士であり、人気レシピサイト「楽天レシピ」のデータベース専門家です。
        以下の不足栄養素を補うため、**朝食・昼食・夕食**のレシピを提案してください。
        
        【条件】
        1. 不足栄養素: {deficits}
        2. アレルギー: {allergies} (アレルギー食材は絶対に使用しないこと)
        3. **【最重要指示】提案するレシピ名（recipeName）は、必ず以下の楽天レシピの人気トレンド情報（ranking_context）に記載されているレシピ名、あるいは楽天レシピ内で完全に一致する検索結果が確実に見つかる具体的な料理名にしてください。**
        4. **【厳禁】AIが独自に考えた創作的なレシピ名、抽象的な名前、または一言一句たがう名前は一切使用しないでください。**
        5. 朝食は「調理時間が短い」ものにすること。
        6. **参考データ：楽天レシピの人気トレンド情報**: {ranking_context}
        7. 前回提案したかもしれない内容とは異なる、新しい視点や食材の組み合わせを意識して、多様なレシピを提案すること。
        8. **重要: 提案する料理名（recipeName）をそのまま使用して、楽天レシピで最も近いレシピを検索し、その検索結果ページURL（rakutenSearchUrl）を必ず含めること。**
        
        出力は以下のJSONスキーマに従ってください:
        [
            {{
                "meal": "朝食",
                "recipeName": "具体的な料理名（楽天レシピに存在する名前を一言一句そのまま）",
                "description": "短くて具体的な説明",
                "mainIngredient": "主要食材(楽天検索用)",
                "prepTimeMinutes": 5,
                "rakutenSearchUrl": "https://recipe.rakuten.co.jp/search/一言一句たがわない料理名/"
            }},
            {{
                "meal": "昼食",
                "recipeName": "具体的な料理名（楽天レシピに存在する名前を一言一句そのまま）",
                "description": "短くて具体的な説明",
                "mainIngredient": "主要食材(楽天検索用)",
                "prepTimeMinutes": 10,
                "rakutenSearchUrl": "https://recipe.rakuten.co.jp/search/一言一句たがわない料理名/"
            }},
            {{
                "meal": "夕食",
                "recipeName": "具体的な料理名（楽天レシピに存在する名前を一言一句そのまま）",
                "description": "短くて具体的な説明",
                "mainIngredient": "主要食材(楽天検索用)",
                "prepTimeMinutes": 20,
                "rakutenSearchUrl": "https://recipe.rakuten.co.jp/search/一言一句たがわない料理名/"
            }}
        ]
        """
        
        # --- Gemini API 設定 ---
        # ユーザー指定のモデル名 'gemini-2.5-flash' を使用
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.8,
                "response_mime_type": "application/json" # JSONモード強制
            }
        }
        
        # --- APIリクエスト実行 ---
        response = requests.post(url, json=payload, timeout=30)
        
        # HTTPエラー（400や500）があれば例外を発生させる
        try:
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            # APIがエラーを返した場合、その内容を読み取って表示する
            error_detail = response.text if response else "No response body"
            print(f"Gemini API Error Detail: {error_detail}")
            return jsonify({"error": f"APIエラー: {str(e)} 詳細: {error_detail}"}), 500
        
        # --- 応答データの解析 ---
        gemini_response_data = response.json()
        
        # 安全に応答テキストを取り出す
        try:
            candidates = gemini_response_data.get('candidates', [])
            if not candidates:
                # 候補がない場合（ブロックされた場合など）
                return jsonify({"error": "AIが回答を生成できませんでした（安全フィルター等の可能性）。"}), 500
                
            json_string = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            
            # 念のため空チェック
            if not json_string:
                return jsonify({"error": "AIからの応答が空でした。"}), 500
            
            json_string = json_string.strip()
            if json_string.startswith("```json"):
                json_string = json_string[7:].strip()
            if json_string.endswith("```"):
                json_string = json_string[:-3].strip()

            # JSONとして有効かチェック（パース試験）
            json.loads(json_string) 

            return jsonify({"result": json_string})

        except (IndexError, KeyError, AttributeError) as e:
             return jsonify({"error": f"AI応答の構造が予期せぬ形式でした: {str(e)}"}), 500

    except Exception as e:
        # コード内のあらゆるクラッシュをここでキャッチし、JSONでブラウザに返します。
        import traceback
        traceback.print_exc() # サーバーのコンソールに詳細を表示
        return jsonify({"error": f"サーバー内部エラー（プログラム修正が必要）: {str(e)}"}), 500
    
@app.route("/api/propose_recipe", methods=["POST"])
def propose_recipe():
    prompt = None 
    
    try:
        # 1. クライアントからのデータ取得
        data = request.get_json()
        prompt = data.get("prompt", "")
        if not prompt:
            return jsonify({"error": "プロンプトが提供されていません。"}), 400
        
        # 2. Gemini APIの設定
        model = "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={GEMINI_API_KEY}"
        
        # 3. APIリクエストボディの構築 (400 Bad Requestを完全に解消する最終版)
        system_instruction = "あなたはプロの栄養士であり、ユーザーの要求に従って健康的なレシピを提案します。あなたの回答は、必ず単一のJSON配列としてフォーマットされなければなりません。JSON以外の前後のテキストや説明は一切含めないでください。"
        headers = {"Content-Type": "application/json"}

        # リクエストデータ構造: System InstructionをContentsの最初のPartとして組み込む
        request_data = {
            # Contentsにシステム命令とユーザープロンプトの両方を含める
            "contents": [
                {"role": "user", "parts": [{"text": f"[SYSTEM INSTRUCTION] {system_instruction}"}]},
                {"role": "user", "parts": [{"text": prompt}]}
            ],
            # generationConfig から systemInstruction を削除し、temperatureのみ残す
            "generationConfig": {
                "temperature": 0.2, 
            }
        }
        
        # 4. APIコールの実行
        response = None
        try:
            response = requests.post(url, headers=headers, json=request_data)
            response.raise_for_status() # HTTPエラー（4xx, 5xx）を捕捉
        
        except requests.exceptions.RequestException as e:
            error_detail = response.text if response is not None else "No response body"
            print(f"Gemini API Error Detail: {error_detail}")
            return jsonify({"error": f"API呼び出しエラー: APIエラー: {str(e)} 詳細: {error_detail}"}), 500
        
        # 5. 応答データの解析 (500エラー対策)
        gemini_response_data = response.json()
        
        try:
            candidates = gemini_response_data.get('candidates', [])
            if not candidates:
                return jsonify({"error": "AIが回答を生成できませんでした（安全フィルター等の可能性）。"}), 500
                
            json_string = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            
            if not json_string or json_string.strip() == "": 
                return jsonify({"error": "AIからの応答が空でした。"}, 500)
            
            # JSONマークダウンブロックの除去 (```json ... ```)
            json_string = json_string.strip() 
            if json_string.startswith("```json"):
                json_string = json_string[7:].strip()
            if json_string.endswith("```"):
                json_string = json_string[:-3].strip()

            # JSONとして有効かチェック
            json.loads(json_string) 

            return jsonify({"result": json_string})

        except (IndexError, KeyError, AttributeError, json.JSONDecodeError) as e:
             print(f"AI応答のパースエラー: {str(e)} - 生の応答: {gemini_response_data}")
             return jsonify({"error": f"AI応答の構造が予期せぬ形式でした、または無効なJSONです: {str(e)}"}), 500

    except Exception as e:
        print(f"サーバー内部エラー: {str(e)}")
        return jsonify({"error": f"サーバー内部エラーが発生しました: {str(e)}"}), 500
    
# ---------- curry.html 写真保存 API（meal.images に保存） ----------
@app.route("/save_meal_with_image", methods=["POST"])
def save_meal_with_image():
    accountId = session.get("accountId")
    if not accountId:
        return jsonify({"success": False})

    data = request.json

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO meal (
            record_date, food_item,
            calories, protein, fat, carb,
            accountId, image
        )
        VALUES (datetime('now','localtime'), ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["foodName"],
        data["calories"],
        data["protein"],
        data["fat"],
        data["carb"],
        accountId,
        data["image"]
    ))

    conn.commit()
    conn.close()

    return jsonify({"success": True})


@app.route("/get_meal_history")
def get_meal_history():
    accountId = session.get("accountId")
    if not accountId:
        return jsonify([])

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        SELECT
            record_date,
            food_item,
            calories,
            protein,
            fat,
            carb,
            image
        FROM meal
        WHERE accountId = ?
        ORDER BY id DESC
    """, (accountId,))

    rows = cur.fetchall()
    conn.close()

    history = []
    for r in rows:
        history.append({
            "record_date": r[0],
            "food_item": r[1],
            "calories": r[2],
            "protein": r[3],
            "fat": r[4],
            "carb": r[5],
            "image": r[6]
        })

    return jsonify(history)



# ---------- 起動 ----------
# app.py の末尾（確認）
if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
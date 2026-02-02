from flask import Flask, render_template

app = Flask(__name__)

# スタート画面（start.html）
@app.route("/")
def start_page():
    return render_template("start.html")

# 新規登録画面（sentaku.html）
@app.route("/sentaku")
def sentaku():
    return render_template("sentaku.html")

# ログイン画面（login.html）
@app.route("/login")
def login():
    return render_template("login.html")


if __name__ == "__main__":
    app.run(debug=True)

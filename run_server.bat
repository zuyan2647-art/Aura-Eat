@echo off
cd /d %~dp0
:: Pythonの仮想環境を使っている場合はここでアクティベート（使っていなければ不要）
:: call .venv\Scripts\activate
python app.py
pause
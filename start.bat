@echo off
REM Скрипт для швидкого запуску проекту з CRUD операціями на Windows

echo.
echo 🚀 Запуск проекту з REST API на Windows...
echo.

REM Перевірити чи встановлений json-server
where json-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ json-server не встановлений
    echo 📦 Встановлення json-server...
    call npm install -g json-server
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Не вдалося встановити json-server
        pause
        exit /b 1
    )
    echo ✅ json-server встановлений
)

echo.
echo 📂 Запуск REST API сервера на портові 3000...
echo    Команда: json-server --watch db.json --port 3000
echo.
echo ⏳ json-server запускається...

REM Запустити json-server в окремому вікні
start cmd /k "json-server --watch db.json --port 3000"

REM Дати серверу час на запуск
timeout /t 2 /nobreak

echo.
echo 📱 Запуск веб-сервера на портові 8000...
echo    Команда: python -m http.server 8000
echo.
echo 🌐 Відкрийте браузер на адресі: http://localhost:8000
echo 📖 Каталог доступний на: http://localhost:8000/pages/catalog.html
echo.
echo ⚠️  Закрийте вікна для зупинки серверів
echo.

REM Запустити веб-сервер
python -m http.server 8000

pause

#!/bin/bash

# Скрипт для швидкого запуску проекту з CRUD операціями

echo "🚀 Запуск проекту з REST API..."
echo ""

# Перевірити чи встановлений json-server
if ! command -v json-server &> /dev/null; then
    echo "❌ json-server не встановлений"
    echo "📦 Встановлення json-server..."
    npm install -g json-server
    if [ $? -ne 0 ]; then
        echo "❌ Не вдалося встановити json-server"
        exit 1
    fi
    echo "✅ json-server встановлений"
fi

echo ""
echo "📂 Запуск REST API сервера на портові 3000..."
echo "   Команда: json-server --watch db.json --port 3000"
echo ""
echo "⏳ json-server запускається в фоновому режимі..."

# Запустити json-server в фоні
json-server --watch db.json --port 3000 &
JSON_SERVER_PID=$!

echo "✅ json-server запущений (PID: $JSON_SERVER_PID)"
echo ""

# Дати серверу час на запуск
sleep 2

echo "📱 Запуск веб-сервера на портові 8000..."
echo "   Команда: python -m http.server 8000"
echo ""
echo "🌐 Відкрийте браузер на адресі: http://localhost:8000"
echo "📖 Каталог доступний на: http://localhost:8000/pages/catalog.html"
echo ""
echo "⚠️  Для зупинки натисніть Ctrl+C"
echo ""

# Запустити веб-сервер
python3 -m http.server 8000

# Коли користувач натисне Ctrl+C, зупинити json-server
trap "kill $JSON_SERVER_PID" EXIT

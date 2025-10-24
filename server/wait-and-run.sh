#!/bin/sh
# Script chờ MySQL rồi mới chạy Node app

echo "⏳ Waiting for MySQL to be ready..."
until nc -z -v -w30 semi-db 3306
do
  echo "⚠️  MySQL is unavailable - sleeping"
  sleep 5
done

echo "✅ MySQL is up - starting app..."
exec npm start

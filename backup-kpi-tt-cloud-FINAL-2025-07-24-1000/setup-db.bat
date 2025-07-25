@echo off
echo =====================================================
echo KPI TT Cloud - Database Setup
echo =====================================================
echo.

echo Connecting to MySQL and creating database...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)

echo Database created successfully!
echo.

echo Importing schema and data...
"C:\xampp\mysql\bin\mysql.exe" -u root users_db < simple-setup.sql

if %errorlevel% neq 0 (
    echo ERROR: Failed to import schema
    pause
    exit /b 1
)

echo.
echo =====================================================
echo Database setup completed successfully!
echo =====================================================
echo.

echo Verifying setup...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "USE users_db; SELECT COUNT(*) as user_count FROM users; SELECT username, full_name FROM users;"

echo.
echo ✅ Database: users_db
echo ✅ Users: 5 demo accounts
echo ✅ Ready for API server
echo.
echo Next step: cd api && npm start
echo.
pause

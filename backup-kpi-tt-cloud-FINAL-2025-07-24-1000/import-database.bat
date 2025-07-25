@echo off
echo =====================================================
echo KPI TT Cloud - Database Import Script
echo =====================================================
echo.

echo Checking MySQL connection...
mysql -u root -e "SELECT 'MySQL connection successful' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL with user 'root' and no password
    echo.
    echo Please try one of these options:
    echo 1. If you have a password: mysql -u root -p ^< database/users_db_schema.sql
    echo 2. Use phpMyAdmin: http://localhost/phpmyadmin
    echo 3. Check if MySQL service is running
    echo.
    pause
    exit /b 1
)

echo MySQL connection successful!
echo.

echo Importing database schema...
mysql -u root < database/users_db_schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to import database schema
    pause
    exit /b 1
)

echo.
echo =====================================================
echo Database import completed successfully!
echo =====================================================
echo.
echo Database: users_db
echo Tables created: users, roles, teams, user_roles, user_teams, user_sessions
echo Sample data: 5 users, 8 roles, 14 teams
echo.
echo Next step: Start API server
echo Command: cd api && npm start
echo.
pause

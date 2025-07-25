@echo off
echo =====================================================
echo KPI TT Cloud - Task Management Schema Import
echo =====================================================

set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_USER=root
set MYSQL_PASSWORD=root123
set MYSQL_DATABASE=users_db

echo.
echo Importing Task Management Schema...
echo Host: %MYSQL_HOST%:%MYSQL_PORT%
echo Database: %MYSQL_DATABASE%
echo.

:: Import task management schema
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < task_management_schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Task Management Schema imported successfully!
    echo.
    echo Created tables:
    echo - task_categories
    echo - tasks
    echo - task_approvals
    echo - task_dependencies
    echo - task_comments
    echo - task_attachments
    echo - task_history
    echo - approval_history
    echo - task_notifications
    echo.
    echo Created views:
    echo - v_task_hierarchy
    echo - v_pending_approvals
    echo.
    echo Created procedures:
    echo - CalculateParentProgress
    echo - ProcessTaskApproval
    echo - CreateApprovalRequest
    echo.
    echo Created triggers:
    echo - tr_task_progress_update
    echo.
) else (
    echo.
    echo ❌ Error importing schema. Please check the error messages above.
    echo.
)

echo Press any key to continue...
pause > nul

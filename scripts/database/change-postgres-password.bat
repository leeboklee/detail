@echo off
echo PostgreSQL 비밀번호 변경 스크립트
echo ================================

echo.
echo 현재 PostgreSQL 서비스 상태를 확인합니다...
sc query postgresql-x64-17

echo.
echo PostgreSQL에 연결하여 비밀번호를 변경합니다...
echo 새 비밀번호를 입력하세요 (기본값: postgres):

set /p NEW_PASSWORD="새 비밀번호 (Enter시 'postgres' 사용): "
if "%NEW_PASSWORD%"=="" set NEW_PASSWORD=postgres

echo.
echo 비밀번호를 변경하는 SQL 명령을 실행합니다...

psql -U postgres -h localhost -c "ALTER USER postgres PASSWORD '%NEW_PASSWORD%';"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 성공! PostgreSQL 비밀번호가 변경되었습니다.
    echo 새 비밀번호: %NEW_PASSWORD%
    echo.
    echo .env.local 파일을 업데이트합니다...
    
    echo DATABASE_URL="postgresql://postgres:%NEW_PASSWORD%@localhost:5432/detail_db" > .env.local
    echo.
    echo .env.local 파일이 업데이트되었습니다.
) else (
    echo.
    echo 오류: 비밀번호 변경에 실패했습니다.
    echo 관리자 권한으로 실행하거나 다른 방법을 시도해보세요.
)

echo.
pause 
@echo off
echo DATABASE_URL 환경변수 설정 스크립트
echo.
echo 현재 DATABASE_URL: %DATABASE_URL%
echo.
echo Neon PostgreSQL 연결 문자열을 입력하세요:
echo 예: postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
echo.
set /p DB_URL="DATABASE_URL: "

if "%DB_URL%"=="" (
    echo 입력이 비어있습니다. 스크립트를 종료합니다.
    pause
    exit /b 1
)

set DATABASE_URL=%DB_URL%
echo.
echo DATABASE_URL이 설정되었습니다: %DATABASE_URL%
echo.
echo 이제 'npm run s' 명령으로 서버를 시작하세요.
echo.
pause 
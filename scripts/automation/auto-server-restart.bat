@echo off
echo 🚀 자동 서버 재시작 시스템 시작
echo.

:check_server
echo 🔍 서버 상태 확인 중...
curl -I http://localhost:3900 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 서버 정상 동작 중
    timeout /t 10 /nobreak >nul
    goto check_server
) else (
    echo ⚠️ 서버 응답 없음. 재시작 시작...
    goto restart_server
)

:restart_server
echo 🔄 서버 재시작 중...
echo.

echo 1. Node 프로세스 종료...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. 서버 시작...
start /B npm run dev

echo 3. 서버 시작 대기 중...
timeout /t 15 /nobreak >nul

echo 4. 서버 상태 확인...
curl -I http://localhost:3900 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 서버 재시작 성공!
    goto check_server
) else (
    echo ❌ 서버 재시작 실패. 다시 시도...
    timeout /t 5 /nobreak >nul
    goto restart_server
)
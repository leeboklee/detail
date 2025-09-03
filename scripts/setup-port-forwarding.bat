@echo off
echo 🔧 WSL 포트 포워딩 설정 중...
echo 📍 포트: 3900
echo 🌐 WSL IP: 172.19.254.74
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ 관리자 권한이 필요합니다!
    echo 💡 Windows 키 + X → "Windows PowerShell (관리자)" 선택 후 다시 실행하세요.
    pause
    exit /b 1
)

echo ✅ 관리자 권한 확인됨
echo.

REM 기존 포트 포워딩 제거
echo 🧹 기존 포트 포워딩 정리 중...
netsh interface portproxy delete v4tov4 listenport=3900 listenaddress=0.0.0.0 >nul 2>&1

REM 새로운 포트 포워딩 설정
echo 🔗 포트 포워딩 설정 중...
netsh interface portproxy add v4tov4 listenport=3900 listenaddress=0.0.0.0 connectport=3900 connectaddress=172.19.254.74

REM 방화벽 규칙 추가
echo 🔒 방화벽 규칙 추가 중...
netsh advfirewall firewall add rule name="WSL Detail Port 3900" dir=in action=allow protocol=TCP localport=3900 >nul 2>&1

REM 설정 확인
echo 📋 포트 포워딩 설정 확인:
netsh interface portproxy show all

echo.
echo 🎉 포트 포워딩 설정 완료!
echo 🌐 이제 http://localhost:3900 으로 접속할 수 있습니다!
echo.

REM 브라우저 자동 열기
echo 🌐 브라우저를 자동으로 열까요? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    start http://localhost:3900
    echo ✅ 브라우저가 열렸습니다!
) else (
    echo 💡 수동으로 http://localhost:3900 접속하세요.
)

pause

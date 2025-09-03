@echo off
echo 🌐 WSL 서버 연결 테스트
echo 📍 포트: 3900
echo 🌐 WSL IP: 172.19.254.74
echo.

echo 🔍 연결 테스트 중...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://172.19.254.74:3900' -TimeoutSec 5; Write-Host '✅ 연결 성공!' -ForegroundColor Green; Write-Host '📄 응답 길이:' $response.Content.Length; } catch { Write-Host '❌ 연결 실패:' $_.Exception.Message -ForegroundColor Red; }"

echo.
echo 💡 만약 연결 실패라면:
echo 1. WSL에서 서버가 실행 중인지 확인
echo 2. 포트 포워딩 설정 필요 (setup-port-forwarding.bat 실행)
echo.

pause

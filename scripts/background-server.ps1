# PowerShell 포그라운드 서버 실행 스크립트
param(
    [string]$Port = "3900"
)

Write-Host "🚀 포그라운드 서버 시작 중..." -ForegroundColor Green

# 포트 사용 중인 프로세스 종료
$portProcess = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($portProcess) {
    Write-Host "⚠️ 포트 $Port 사용 중인 프로세스 종료 중..." -ForegroundColor Yellow
    Stop-Process -Id $portProcess.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 프로젝트 디렉토리로 이동
Set-Location $PSScriptRoot\..

Write-Host "✅ 포그라운드에서 서버를 실행합니다." -ForegroundColor Green
Write-Host "🔗 서버 주소: http://localhost:$Port" -ForegroundColor Blue
Write-Host "💡 이 창을 닫으면 서버가 종료됩니다" -ForegroundColor Cyan

# 포그라운드에서 npm 실행 (백그라운드 방지)
try {
    npm run dev:basic
}
catch {
    Write-Host "❌ 서버 실행 실패: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Write-Host "🔚 서버 종료됨" -ForegroundColor Red
} 
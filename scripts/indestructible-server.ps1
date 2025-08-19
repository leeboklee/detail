# PowerShell 스크립트 - 포그라운드 실행 서버
# 관리자 권한으로 실행 필요

$ErrorActionPreference = "Stop"

# 프로젝트 디렉토리
$projectDir = "C:\codist\detail"
$port = 3900

Write-Host "🚀 포그라운드 서버 시작..." -ForegroundColor Green
Write-Host "📁 프로젝트: $projectDir" -ForegroundColor Yellow
Write-Host "🔌 포트: $port" -ForegroundColor Yellow

# Next.js 서버 시작 함수
function Start-NextJSServer {
    Write-Host "🔄 Next.js 서버 시작 중..." -ForegroundColor Cyan
    
    try {
        # 프로젝트 디렉트리로 이동
        Set-Location $projectDir
        
        Write-Host "✅ Next.js 서버 시작됨" -ForegroundColor Green
        
        # 브라우저 열기
        Start-Sleep -Seconds 5
        Start-Process "http://localhost:$port"
        
        # 포그라운드에서 npm 실행
        npm run dev:basic
        
        return $true
    }
    catch {
        Write-Host "❌ Next.js 서버 시작 실패: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 메인 실행
try {
    # 기존 프로세스 정리
    Write-Host "🧹 기존 프로세스 정리 중..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    # Next.js 서버 시작
    $success = Start-NextJSServer
    
    if ($success) {
        Write-Host "🎯 서버가 포그라운드에서 실행 중입니다" -ForegroundColor Green
        Write-Host "💡 이 창을 닫으면 서버가 종료됩니다" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "❌ 서버 실행 실패: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Write-Host "🔚 서버 종료됨" -ForegroundColor Red
} 
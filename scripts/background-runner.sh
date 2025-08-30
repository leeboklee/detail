#!/bin/bash

# 백그라운드 실행 스크립트
# 서버와 모니터링을 자동으로 실행

# 로그 디렉토리 생성
mkdir -p logs

# 현재 시간
echo "=== $(date) ===" >> logs/background-runner.log

# 기존 프로세스 정리
echo "기존 프로세스 정리 중..." >> logs/background-runner.log
pkill -f "next dev" 2>/dev/null
pkill -f "pm2" 2>/dev/null

# 잠시 대기
sleep 3

# PM2로 서버 시작
echo "PM2로 서버 시작 중..." >> logs/background-runner.log
pm2 start ecosystem.config.js >> logs/background-runner.log 2>&1

# 서버 시작 대기
echo "서버 시작 대기 중..." >> logs/background-runner.log
sleep 15

# 서버 상태 확인
if ss -tlnp | grep :3900 > /dev/null; then
    echo "✅ 서버가 정상적으로 실행 중입니다" >> logs/background-runner.log
    
    # 자동 테스트 실행
    echo "자동 테스트 실행 중..." >> logs/background-runner.log
    npm run test:booking:basic >> logs/background-runner.log 2>&1 &
    
    # 모니터링 시작
    echo "모니터링 시작..." >> logs/background-runner.log
    nohup node scripts/auto-monitor.js >> logs/background-runner.log 2>&1 &
    
    echo "🎉 백그라운드 실행 완료!" >> logs/background-runner.log
    echo "📋 로그 확인: tail -f logs/background-runner.log" >> logs/background-runner.log
    echo "📋 서버 상태: pm2 status" >> logs/background-runner.log
    
else
    echo "❌ 서버 시작 실패" >> logs/background-runner.log
    exit 1
fi

#!/bin/bash

# 간단한 백그라운드 실행 스크립트
# 서버와 모니터링을 자동으로 실행

echo "=== $(date) ===" >> logs/simple-background.log
echo "🚀 간단한 백그라운드 실행 시작..." >> logs/simple-background.log

# 로그 디렉토리 생성
mkdir -p logs

# 기존 프로세스 정리
echo "기존 프로세스 정리 중..." >> logs/simple-background.log
pkill -f "next dev" 2>/dev/null
sleep 2

# PM2로 서버 시작
echo "PM2로 서버 시작 중..." >> logs/simple-background.log
pm2 start ecosystem.config.js >> logs/simple-background.log 2>&1

# 서버 시작 대기
echo "서버 시작 대기 중..." >> logs/simple-background.log
sleep 20

# 서버 상태 확인
if ss -tlnp | grep :3900 > /dev/null; then
    echo "✅ 서버가 정상적으로 실행 중입니다" >> logs/simple-background.log
    
    # 자동 테스트 실행
    echo "자동 테스트 실행 중..." >> logs/simple-background.log
    nohup npm run test:booking:basic >> logs/auto-test.log 2>&1 &
    
    # 간단한 모니터링 시작
    echo "간단한 모니터링 시작..." >> logs/simple-background.log
    nohup bash -c '
        while true; do
            if ! ss -tlnp | grep :3900 > /dev/null; then
                echo "$(date): ⚠️ 서버가 중단됨, 재시작 시도..." >> logs/simple-background.log
                pm2 restart detail-dev >> logs/simple-background.log 2>&1
                sleep 20
            else
                echo "$(date): ✅ 서버 정상 실행 중" >> logs/simple-background.log
            fi
            sleep 60
        done
    ' >> logs/monitor.log 2>&1 &
    
    echo "🎉 백그라운드 실행 완료!" >> logs/simple-background.log
    echo "📋 로그 확인: tail -f logs/simple-background.log" >> logs/simple-background.log
    echo "📋 서버 상태: pm2 status" >> logs/simple-background.log
    echo "📋 모니터링 로그: tail -f logs/monitor.log" >> logs/simple-background.log
    
else
    echo "❌ 서버 시작 실패" >> logs/simple-background.log
    exit 1
fi

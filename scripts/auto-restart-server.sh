#!/bin/bash
# 자동 서버 재시작 스크립트
echo "🚀 자동 서버 재시작 스크립트 시작"

# 프로젝트 디렉토리로 이동
cd /home/rsvshop/projects/detail

# 무한 루프로 서버 모니터링 및 재시작
while true; do
    echo "🔍 서버 상태 확인 중..."
    
    # 서버가 실행 중인지 확인
    if ! pgrep -f "next dev" > /dev/null; then
        echo "❌ 서버가 실행되지 않음. 재시작 중..."
        
        # 기존 프로세스 정리
        pkill -f "next dev" 2>/dev/null || true
        sleep 2
        
        # 서버 시작
        echo "📡 서버 시작 중..."
        NEXT_TELEMETRY_DISABLED=1 npx next dev --port 3900 --hostname 0.0.0.0 --turbo > server.log 2>&1 &
        
        # 서버 시작 확인
        sleep 5
        if netstat -tln | grep -q ":3900"; then
            echo "✅ 서버가 성공적으로 시작되었습니다!"
            echo "🌐 접속 주소: http://localhost:3900"
        else
            echo "❌ 서버 시작 실패"
        fi
    else
        echo "✅ 서버가 정상 실행 중"
    fi
    
    # 30초마다 확인
    sleep 30
done

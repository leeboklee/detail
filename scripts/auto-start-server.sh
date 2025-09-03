#!/bin/bash

# 자동 서버 시작 스크립트
echo "🚀 자동으로 Next.js 서버를 시작합니다..."

# 포트 3900에서 서버 시작
cd /home/rsvshop/projects/detail

# 기존 프로세스 정리
pkill -f "next dev" 2>/dev/null || true
sleep 2

# 서버 시작 (백그라운드)
echo "📡 포트 3900에서 서버 시작 중..."
npx next dev -H 0.0.0.0 -p 3900 > server.log 2>&1 &

# 서버 시작 확인
sleep 5
if netstat -tln | grep -q ":3900"; then
    echo "✅ 서버가 성공적으로 시작되었습니다!"
    echo "🌐 접속 주소: http://172.19.254.74:3900"
    echo "📝 로그 파일: server.log"
else
    echo "❌ 서버 시작 실패"
    echo "📝 로그 확인: cat server.log"
fi

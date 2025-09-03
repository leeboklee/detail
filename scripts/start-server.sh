#!/bin/bash
# 간단한 서버 시작 스크립트
echo "🚀 detail 프로젝트 서버 시작"

# 프로젝트 디렉토리로 이동
cd /home/rsvshop/projects/detail

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리 중..."
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
    echo "📝 로그 파일: server.log"
    echo "🛑 서버 종료: Ctrl+C 또는 pkill -f 'next dev'"
else
    echo "❌ 서버 시작 실패"
    echo "📝 로그 확인: cat server.log"
fi

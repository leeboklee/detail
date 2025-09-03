#!/bin/bash

# 프로젝트 격리 스크립트
# 다른 프로젝트의 프로세스와 격리하여 현재 프로젝트만 실행

PROJECT_DIR="/home/rsvshop/projects/detail"
PROJECT_NAME="detail-page"
PORT="3900"

echo "🔒 프로젝트 격리 시작: $PROJECT_NAME"

# 1. 다른 프로젝트의 프로세스 정리
echo "🧹 다른 프로젝트 프로세스 정리 중..."
pkill -f "/home/rsvshop/projects/rsvshop" 2>/dev/null || true
# pkill -f "port 4900" 2>/dev/null || true

# 2. 현재 프로젝트 디렉토리로 이동
cd "$PROJECT_DIR" || exit 1

# 3. 포트 사용 확인
if ss -tlnp | grep -q ":$PORT "; then
    echo "⚠️  포트 $PORT가 이미 사용 중입니다."
    ss -tlnp | grep ":$PORT "
    echo "🔄 포트를 정리합니다..."
    pkill -f ":$PORT" 2>/dev/null || true
    sleep 2
fi

# 4. nodemon으로 서버 시작
echo "🚀 $PROJECT_NAME 서버 시작 (포트: $PORT)..."
npx nodemon --config ./nodemon.json

echo "✅ 프로젝트 격리 완료"

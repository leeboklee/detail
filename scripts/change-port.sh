#!/bin/bash

# 포트 변경 스크립트
# 사용법: ./scripts/change-port.sh [새포트번호]

DEFAULT_PORT=3900
NEW_PORT=${1:-$DEFAULT_PORT}

echo "🔧 포트 변경 스크립트 실행 중..."
echo "📍 현재 기본 포트: $DEFAULT_PORT"
echo "🎯 변경할 포트: $NEW_PORT"

# .env 파일 업데이트
if [ -f ".env" ]; then
    echo "📝 .env 파일 업데이트 중..."
    sed -i "s/PORT=.*/PORT=$NEW_PORT/" .env
    echo "✅ .env 파일 업데이트 완료: PORT=$NEW_PORT"
else
    echo "📝 .env 파일 생성 중..."
    echo "PORT=$NEW_PORT" > .env
    echo "✅ .env 파일 생성 완료: PORT=$NEW_PORT"
fi

# package.json의 dev 스크립트 업데이트
if [ -f "package.json" ]; then
    echo "📝 package.json 업데이트 중..."
    sed -i "s/scripts\/wsl-dev.js [0-9]*/scripts\/wsl-dev.js $NEW_PORT/" package.json
    echo "✅ package.json 업데이트 완료"
fi

echo ""
echo "🎉 포트 변경 완료!"
echo "📍 새 포트: $NEW_PORT"
echo "🚀 서버 재시작: npm run dev"
echo "💡 환경변수로 포트 변경: PORT=$NEW_PORT npm run dev"

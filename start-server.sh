#!/bin/bash

# 서버 자동 실행 및 재시작 스크립트
cd /home/rsvshop/projects/detail

echo "서버를 시작합니다..."

# 기존 프로세스 종료
pkill -f "npm run dev" 2>/dev/null

# 서버 시작
while true; do
    echo "$(date): 서버 시작 중..."
    npm run dev
    
    if [ $? -eq 0 ]; then
        echo "$(date): 서버가 정상적으로 종료되었습니다."
        break
    else
        echo "$(date): 서버가 오류로 종료되었습니다. 5초 후 재시작합니다..."
        sleep 5
    fi
done

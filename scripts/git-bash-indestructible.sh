#!/bin/bash

# Git Bash 무적 서버 - taskkill에 안 죽는 서버
# 프로젝트 디렉토리와 포트 설정

PROJECT_DIR="$(pwd)"
PORT=3900
LOG_FILE="logs/indestructible-server.log"

echo "🚀 Git Bash 무적 서버 시작..."
echo "📁 프로젝트: $PROJECT_DIR"
echo "🔌 포트: $PORT"
echo "📝 로그: $LOG_FILE"

# 로그 디렉토리 생성
mkdir -p logs

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 포트 확인 함수
check_port() {
    if command -v netstat >/dev/null 2>&1; then
        netstat -an | grep ":$PORT " | grep LISTEN >/dev/null 2>&1
    else
        lsof -i :$PORT >/dev/null 2>&1
    fi
}

# 프로세스 종료 함수
cleanup() {
    log "🛑 서버 종료 신호 수신..."
    
    # Next.js 프로세스 종료
    if [ ! -z "$NEXTJS_PID" ]; then
        log "🔄 Next.js 프로세스 종료 중 (PID: $NEXTJS_PID)..."
        kill -TERM "$NEXTJS_PID" 2>/dev/null
        sleep 2
        kill -KILL "$NEXTJS_PID" 2>/dev/null
    fi
    
    # 포트 사용 프로세스 종료
    if check_port; then
        log "🔄 포트 $PORT 사용 프로세스 종료 중..."
        if command -v netstat >/dev/null 2>&1; then
            netstat -ano | grep ":$PORT " | grep LISTEN | awk '{print $5}' | xargs -r kill -TERM
        else
            lsof -ti :$PORT | xargs -r kill -TERM
        fi
    fi
    
    log "🔚 Git Bash 무적 서버 종료됨"
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# Next.js 서버 시작 함수
start_nextjs_server() {
    log "🔄 Next.js 서버 시작 중..."
    
    # 기존 프로세스 정리
    if check_port; then
        log "🧹 기존 포트 사용 프로세스 정리 중..."
        if command -v netstat >/dev/null 2>&1; then
            netstat -ano | grep ":$PORT " | grep LISTEN | awk '{print $5}' | xargs -r kill -TERM
        else
            lsof -ti :$PORT | xargs -r kill -TERM
        fi
        sleep 2
    fi
    
    # Next.js 백그라운드 실행
    cd "$PROJECT_DIR"
    npm run dev > "$LOG_FILE.nextjs" 2>&1 &
    NEXTJS_PID=$!
    
    log "✅ Next.js 서버 시작됨 (PID: $NEXTJS_PID)"
    
    return $NEXTJS_PID
}

# 서버 상태 모니터링
monitor_server() {
    log "🎯 서버 모니터링 시작..."
    
    while true; do
        # Next.js 프로세스 상태 확인
        if [ ! -z "$NEXTJS_PID" ] && ! kill -0 "$NEXTJS_PID" 2>/dev/null; then
            log "⚠️ Next.js 프로세스 종료됨 (PID: $NEXTJS_PID). 재시작 중..."
            start_nextjs_server
        fi
        
        # 포트 상태 확인
        if ! check_port; then
            log "⚠️ 포트 $PORT에서 서버가 응답하지 않음. 재시작 중..."
            start_nextjs_server
        fi
        
        sleep 10
    done
}

# 메인 실행
main() {
    log "🛡️ Git Bash 무적 서버 활성화"
    log "💡 Ctrl+C로 종료할 수 있습니다"
    log "🌐 브라우저는 수동으로 http://localhost:$PORT 접속하세요"
    
    # Next.js 서버 시작
    start_nextjs_server
    
    # 모니터링 시작
    monitor_server
}

# 서버 시작
main "$@" 
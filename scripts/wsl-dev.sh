#!/usr/bin/env bash
set -euo pipefail

# WSL2 전용 Next.js 개발 서버 실행 스크립트
# - 0.0.0.0:3900에서 리슨
# - 기존 포트 점유 프로세스 정리
# - 포그라운드 실행 강제 (백그라운드 방지)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 경로 문제 해결: Windows 마운트 경로와 WSL 내부 경로 동기화
WINDOWS_MOUNT="/mnt/c/codist/detail"
OPT_DETAIL="/opt/detail"

# Windows 마운트 경로가 존재하고 현재 경로와 다른 경우 경로 통일
if [[ -d "$WINDOWS_MOUNT" && "$REPO_ROOT" != "$WINDOWS_MOUNT" ]]; then
  echo "[WSL] Windows mount path detected: $WINDOWS_MOUNT"
  echo "[WSL] Current path: $REPO_ROOT"
  echo "[WSL] Switching to Windows mount path for consistency"
  REPO_ROOT="$WINDOWS_MOUNT"

  # /opt/detail 심볼릭 링크가 올바르게 설정되어 있는지 확인 (비대화식 sudo가 가능할 때만)
  if sudo -n true 2>/dev/null; then
    if [[ -L "$OPT_DETAIL" ]]; then
      LINK_TARGET=$(readlink -f "$OPT_DETAIL")
      if [[ "$LINK_TARGET" != "$WINDOWS_MOUNT" ]]; then
        echo "[WSL] Fixing /opt/detail symlink: $LINK_TARGET -> $WINDOWS_MOUNT"
        sudo -n rm -f "$OPT_DETAIL" 2>/dev/null || true
        sudo -n ln -s "$WINDOWS_MOUNT" "$OPT_DETAIL" 2>/dev/null || true
      fi
    elif [[ ! -e "$OPT_DETAIL" ]]; then
      echo "[WSL] Creating /opt/detail symlink to $WINDOWS_MOUNT"
      sudo -n ln -s "$WINDOWS_MOUNT" "$OPT_DETAIL" 2>/dev/null || true
    fi
  else
    echo "[WSL] Skipping /opt/detail symlink (no sudo without password)"
  fi
fi

cd "$REPO_ROOT"
echo "[WSL] Working directory: $(pwd)"

PORT=3900
PID_FILE=".wsl-next.pid"
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/wsl-dev.log"
# 포그라운드 실행 강제
FOREGROUND=1
# Turbopack 사용 여부 (기본: 환경변수 USE_TURBO=1이면 사용)
USE_TURBO=${USE_TURBO:-0}

if [[ "${1:-}" == "--turbo" ]]; then
  USE_TURBO=1
fi

mkdir -p "$LOG_DIR"

# 1) nginx가 포트를 잡고 있으면 중지 시도(있어도 되고 없어도 됨)
# nginx 정지는 비대화식 sudo 가능할 때만 시도
if sudo -n true 2>/dev/null; then
  if command -v systemctl >/dev/null 2>&1; then
    sudo -n systemctl stop nginx >/dev/null 2>&1 || true
  fi
  sudo -n service nginx stop >/dev/null 2>&1 || true
  sudo -n pkill -f nginx >/dev/null 2>&1 || true
fi

# 2) 기존 next(dev) 종료 및 포트 점유 프로세스 종료(안전 스크립트 사용)
echo "[WSL] Stopping existing Next.js processes..."
pkill -f "node_modules/.bin/next" >/dev/null 2>&1 || true
pkill -f "next dev" >/dev/null 2>&1 || true
pkill -f "next-server" >/dev/null 2>&1 || true

# 포트 점유 프로세스 강제 종료
if [[ -f "scripts/kill-port-safe.sh" ]]; then
  bash scripts/kill-port-safe.sh >/dev/null 2>&1 || true
else
  echo "[WSL] kill-port-safe.sh not found, using direct port kill (if sudo available)"
  if sudo -n true 2>/dev/null; then
    sudo -n fuser -k 3900/tcp 2>/dev/null || true
  fi
fi

sleep 2

# 3) 의존성 준비(있는 그대로 사용; 필요한 경우 ci로 교체 가능)
if [[ ! -d node_modules ]]; then
  echo "[WSL] Installing dependencies..."
  npm install --no-audit --no-fund
fi

# 4) 포그라운드로 Next dev 실행 (백그라운드 방지)
echo "[WSL] Starting Next dev (foreground only) on http://localhost:${PORT}"
echo "[WSL] Working directory: $(pwd)"
echo "[WSL] Logs: $LOG_FILE (also mirrored here via tee)"
echo "[WSL] Running in foreground mode (no background processes)"

# 종료 시 포트 자동 정리
trap "echo '[WSL] Cleaning up...'; bash scripts/kill-port-safe.sh >/dev/null 2>&1 || true" EXIT INT TERM

set +e
if [[ "$USE_TURBO" -eq 1 ]]; then
  ./node_modules/.bin/next dev -H 0.0.0.0 -p "$PORT" --turbo 2>&1 | tee -a "$LOG_FILE"
else
  ./node_modules/.bin/next dev -H 0.0.0.0 -p "$PORT" 2>&1 | tee -a "$LOG_FILE"
fi
EXIT_CODE=${PIPESTATUS[0]}
set -e

echo "[WSL] Next dev is ready at http://localhost:${PORT}"
echo "[WSL] Working directory: $(pwd)"
echo "[WSL] Server running in foreground mode"

exit "$EXIT_CODE"



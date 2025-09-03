#!/usr/bin/env bash
set -euo pipefail

# 다중 포트 안전 정리 스크립트 (WSL 친화)
# - 우선 fuser, 보조로 ss/lsof를 사용하여 좀비/잔여 리스너를 제거

PORTS=(3900)
CURRENT_PID=$$

echo "[kill-port-safe] clearing: ${PORTS[*]}"

for PORT in "${PORTS[@]}"; do
  # 1) fuser로 즉시 종료 시도 (root 필요 없음인 경우가 많음)
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
  fi

  # 2) lsof로 PID 조회 후 종료
  if command -v lsof >/dev/null 2>&1; then
    while read -r PID; do
      [ -z "${PID}" ] && continue
      [ "${PID}" = "${CURRENT_PID}" ] && continue
      kill -9 "${PID}" 2>/dev/null || true
    done < <(lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN -t 2>/dev/null || true)
  fi

  # 3) ss로 PID 파싱 후 종료(이중 안전)
  if command -v ss >/dev/null 2>&1; then
    while read -r LINE; do
      if [[ $LINE =~ pid=([0-9]+) ]]; then
        PID="${BASH_REMATCH[1]}"
        [ -z "${PID}" ] && continue
        [ "${PID}" = "${CURRENT_PID}" ] && continue
        kill -9 "${PID}" 2>/dev/null || true
      fi
    done < <(ss -ltnp 2>/dev/null | grep ":${PORT}" || true)
  fi
done

echo "[kill-port-safe] done"
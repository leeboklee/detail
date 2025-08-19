#!/usr/bin/env bash
set -euo pipefail

# WSL에서 페이지 열림 검증(Playwright 사용)
# 사용: bash scripts/wsl-open-and-verify.sh [path]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

TARGET_PATH="${1:-/}"

export BASE_URL="http://localhost:3900"

# Playwright 설치 확인(최초 1회 필요할 수 있음)
if ! npx --yes playwright --version >/dev/null 2>&1; then
  npm i -D @playwright/test >/dev/null 2>&1 || true
  npx --yes playwright install --with-deps chromium
fi

node scripts/wsl-verify.js "$TARGET_PATH"



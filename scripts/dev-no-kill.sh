#!/bin/sh

echo "Starting server without port killer..."

# 포트 킬러 없이 직접 서버 시작
exec next dev -p 3900 
#!/bin/sh

echo "Killing processes on port 3900..."

# 간단한 포트 킬러
lsof -ti:3900 | xargs kill -9 2>/dev/null || echo "No processes found on port 3900"

echo "Port 3900 cleared" 
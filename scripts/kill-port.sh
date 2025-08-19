#!/bin/bash

echo "Killing processes on port 3900..."

# 포트 3900을 사용하는 프로세스 찾기 및 종료
PIDS=$(netstat -tulpn 2>/dev/null | grep :3900 | awk '{print $7}' | cut -d'/' -f1 | grep -v "^-$")

if [ -n "$PIDS" ]; then
    echo "Found processes: $PIDS"
    for PID in $PIDS; do
        if [ -n "$PID" ] && [ "$PID" != "-" ]; then
            echo "Killing process $PID"
            kill -9 $PID 2>/dev/null
        fi
    done
else
    echo "No processes found on port 3900"
fi

echo "Port 3900 cleared" 
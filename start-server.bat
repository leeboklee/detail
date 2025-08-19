@echo off
cd /d "C:\codist\detail"
set SERVER_PORT=3900
node scripts/auto-restart-server.cjs

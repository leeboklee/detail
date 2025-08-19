@echo off
echo Killing processes on port 3900...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3900') do (
    echo Killing process %%a
    taskkill /f /pid %%a 2>nul
)
echo Port 3900 cleared

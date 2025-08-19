@echo off
set PORT=%1
if "%PORT%"=="" (
  echo Port number is required. Example: kill-port-safe.bat 4200
  exit /b 1
)

echo Searching for Node.js processes on port %PORT%...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr LISTENING ^| findstr :%PORT%') do (
  for /f "tokens=1" %%b in ('tasklist /FI "PID eq %%a" ^| findstr node.exe') do (
    echo Terminating Node.js process with PID: %%a
    taskkill /F /PID %%a
  )
)

echo Process termination attempted for port %PORT% 
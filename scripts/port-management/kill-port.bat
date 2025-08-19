@echo off
set PORT=%1
if "%PORT%"=="" (
  echo Port number is required. Example: kill-port.bat 4200
  exit /b 1
)

echo Finding process on port %PORT%...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr /R ":%PORT% .*LISTENING"') DO (
  echo Found process PID: %%P
  taskkill /F /PID %%P
  if errorlevel 0 (
    echo Process terminated
  ) else (
    echo Failed to terminate process
  )
  exit /b 0
)

echo No process found on port %PORT% 
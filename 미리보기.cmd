@echo off
chcp 65001 >nul
title subProject 미리보기 (이 창을 닫으면 꺼집니다)
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js가 필요합니다. https://nodejs.org 에서 설치한 뒤 다시 실행하세요. & pause & exit /b 1)
for /l %%p in (4173,1,4183) do (
  curl -fs --max-time 1 http://127.0.0.1:%%p/ 2>nul | findstr /c:"<title>subProject" >nul && (
    echo 이미 켜진 미리보기가 있습니다: http://127.0.0.1:%%p/
    start "" http://127.0.0.1:%%p/
    timeout /t 2 >nul
    exit /b 0
  )
)
set PORT=4173
for /l %%p in (4183,-1,4173) do (netstat -ano | findstr /c:"127.0.0.1:%%p " | findstr LISTENING >nul || set PORT=%%p)
node scripts\build.mjs || (echo 빌드에 실패했습니다. & pause & exit /b 1)
echo 미리보기: http://127.0.0.1:%PORT%/   (끄려면 이 창을 닫거나 Ctrl+C)
start "" cmd /c "timeout /t 1 >nul & start "" http://127.0.0.1:%PORT%/"
node scripts\serve.mjs --watch
echo 미리보기가 꺼졌습니다.
pause

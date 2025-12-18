@echo off
chcp 65001 >nul
echo ====================================
echo    启动开发服务器
echo ====================================
echo.
cd /d %~dp0
echo 当前目录: %CD%
echo.
echo 正在启动 Vite 开发服务器...
echo 请稍候...
echo.
call npm run dev
pause


@echo off
chcp 65001 >nul
color 0A
cls

echo ========================================
echo    好游 - 移动端开发服务器启动工具
echo ========================================
echo.
echo 正在启动服务器，请稍候...
echo.

:: 启动开发服务器
start /B npm run dev

:: 等待服务器启动
timeout /t 3 /nobreak >nul

echo ========================================
echo    服务器已启动！
echo ========================================
echo.
echo 📱 请在手机浏览器中访问以下地址：
echo.

:: 获取本机IP地址并显示访问链接
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4" ^| findstr /V "127.0.0.1"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo    http://%%b:3000
    )
)

echo.
echo ========================================
echo.
echo ✅ 提示事项：
echo    1. 确保手机和电脑连接同一个WiFi
echo    2. 如无法访问，请检查电脑防火墙设置
echo    3. 按 Ctrl+C 可停止服务器
echo.
echo 💡 功能说明：
echo    - 未登录自动显示登录页面
echo    - 登录有效期为7天
echo    - 超过7天自动退出登录
echo.
echo 🔑 演示验证码：123456
echo.
echo ========================================
echo.
pause



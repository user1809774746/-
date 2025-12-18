@echo off
chcp 65001 >nul
color 0E
cls

echo ========================================
echo    好游 - 网络诊断工具
echo ========================================
echo.

echo 🔍 正在诊断网络连接问题...
echo.

echo ----------------------------------------
echo 1. 检查IP配置
echo ----------------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4" ^| findstr /V "127.0.0.1"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo ✅ 电脑IP地址: %%b
        set COMPUTER_IP=%%b
    )
)
echo.

echo ----------------------------------------
echo 2. 检查端口监听状态
echo ----------------------------------------
netstat -an | findstr :3000 >nul
if %errorlevel%==0 (
    echo ✅ 端口3000正在监听
    netstat -an | findstr :3000
) else (
    echo ❌ 端口3000未监听 - 请先启动开发服务器
)
echo.

echo ----------------------------------------
echo 3. 检查防火墙规则
echo ----------------------------------------
netsh advfirewall firewall show rule name="好游前端开发服务器" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 防火墙规则已配置
) else (
    echo ❌ 防火墙规则未配置
    echo 正在添加防火墙规则...
    netsh advfirewall firewall add rule name="好游前端开发服务器" dir=in action=allow protocol=TCP localport=3000 >nul
    echo ✅ 防火墙规则已添加
)
echo.

echo ----------------------------------------
echo 4. 测试本地访问
echo ----------------------------------------
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5 -UseBasicParsing; Write-Host '✅ 本地访问正常 - 状态码:' $response.StatusCode } catch { Write-Host '❌ 本地访问失败:' $_.Exception.Message }"
echo.

echo ----------------------------------------
echo 5. 测试网络访问
echo ----------------------------------------
if defined COMPUTER_IP (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://%COMPUTER_IP%:3000' -TimeoutSec 5 -UseBasicParsing; Write-Host '✅ 网络访问正常 - 状态码:' $response.StatusCode } catch { Write-Host '❌ 网络访问失败:' $_.Exception.Message }"
) else (
    echo ❌ 无法获取IP地址
)
echo.

echo ----------------------------------------
echo 6. 访问地址信息
echo ----------------------------------------
if defined COMPUTER_IP (
    echo 📱 手机访问地址: http://%COMPUTER_IP%:3000
    echo 💻 电脑访问地址: http://localhost:3000
) else (
    echo ❌ 无法确定访问地址
)
echo.

echo ----------------------------------------
echo 7. 诊断建议
echo ----------------------------------------
netstat -an | findstr :3000 >nul
if %errorlevel%==0 (
    echo ✅ 服务器运行正常
    echo 💡 如果手机仍无法访问，请检查：
    echo    - 手机和电脑是否在同一WiFi
    echo    - 路由器是否启用AP隔离
    echo    - 手机浏览器是否支持
) else (
    echo ❌ 服务器未启动
    echo 💡 请先运行: 启动局域网服务器.bat
)
echo.

echo ========================================
echo 诊断完成！
echo ========================================
echo.
pause

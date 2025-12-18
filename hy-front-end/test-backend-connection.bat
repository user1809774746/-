@echo off
chcp 65001 >nul
echo =====================================
echo 🔍 后端连接快速测试
echo =====================================
echo.

echo 📋 检查清单:
echo.
echo [1] 检查后端端口 8082
netstat -ano | findstr :8082
if errorlevel 1 (
    echo ❌ 端口 8082 未监听
    echo 💡 请先启动后端服务
) else (
    echo ✅ 端口 8082 已监听
)
echo.

echo [2] 检查前端端口 3000
netstat -ano | findstr :3000
if errorlevel 1 (
    echo ❌ 端口 3000 未监听
    echo 💡 需要运行: npm run dev
) else (
    echo ✅ 端口 3000 已监听
)
echo.

echo [3] 测试后端连接
echo 尝试连接到 http://localhost:8082 ...
curl -s -o nul -w "状态码: %%{http_code}\n" http://localhost:8082 2>nul
if errorlevel 1 (
    echo ❌ 无法连接到后端
    echo 💡 请确认后端服务已启动
) else (
    echo ✅ 后端服务可访问
)
echo.

echo [4] 测试API端点
echo 测试: http://localhost:8082/api/auth/profile
curl -s -o nul -w "状态码: %%{http_code}\n" http://localhost:8082/api/auth/profile 2>nul
echo.

echo =====================================
echo 📝 诊断建议
echo =====================================
echo.
echo 💡 下一步操作:
echo.
echo 如果端口 3000 未监听:
echo   1. 打开新终端
echo   2. 运行: npm run dev
echo   3. 访问: http://localhost:3000/websocket-diagnostic.html
echo.
echo 如果端口 8082 未监听:
echo   1. 启动后端服务
echo   2. 确认端口配置为 8082
echo.
echo 运行详细诊断:
echo   node backend-diagnostic.js
echo.
echo 查看完整指南:
echo   后端连接问题修复指南.md
echo.

pause

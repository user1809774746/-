@echo off
chcp 65001 >nul
echo =====================================
echo    后端服务启动脚本
echo =====================================
echo.

echo [1] 检查 Maven 环境...
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到 Maven，请先安装 Maven 并配置环境变量
    echo 下载地址：https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo ✅ Maven 环境正常

echo.
echo [2] 检查 Java 环境...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到 Java，请先安装 JDK 17
    echo 下载地址：https://adoptium.net/
    pause
    exit /b 1
)
echo ✅ Java 环境正常

echo.
echo [3] 正在启动后端服务...
echo    端口：8081
echo    按 Ctrl+C 停止服务
echo.
echo =====================================
echo.

mvn spring-boot:run

echo.
echo =====================================
echo    后端服务已停止
echo =====================================
pause


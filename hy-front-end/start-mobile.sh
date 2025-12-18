#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear

echo "========================================"
echo -e "${GREEN}   好游 - 移动端开发服务器启动工具${NC}"
echo "========================================"
echo ""
echo "正在启动服务器，请稍候..."
echo ""

# 启动开发服务器（后台运行）
npm run dev &

# 等待服务器启动
sleep 3

echo "========================================"
echo -e "${GREEN}   服务器已启动！${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}📱 请在手机浏览器中访问以下地址：${NC}"
echo ""

# 获取IP地址（支持Mac和Linux）
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

if [ -n "$IP" ]; then
    echo -e "   ${YELLOW}http://$IP:3000${NC}"
else
    echo "   无法自动获取IP地址，请手动查看"
fi

echo ""
echo "========================================"
echo ""
echo "✅ 提示事项："
echo "   1. 确保手机和电脑连接同一个WiFi"
echo "   2. 如无法访问，请检查电脑防火墙设置"
echo "   3. 按 Ctrl+C 可停止服务器"
echo ""
echo "💡 功能说明："
echo "   - 未登录自动显示登录页面"
echo "   - 登录有效期为7天"
echo "   - 超过7天自动退出登录"
echo ""
echo "🔑 演示验证码：123456"
echo ""
echo "========================================"
echo ""

# 等待用户按键
read -p "按任意键继续..."



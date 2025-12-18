# WebSocket 网络配置说明

## 📡 服务器地址配置

### 当前配置
- **服务器IP**: `192.168.1.132`
- **端口**: `8082`
- **WebSocket地址**: `ws://192.168.1.132:8082/ws/chat/native?userId={userId}`

---

## 🔌 不同场景的连接方式

### 1. 本机访问（服务器本地）
```javascript
// 可以使用 localhost 或 IP 地址
ws://localhost:8082/ws/chat/native?userId=1
// 或
ws://192.168.1.132:8082/ws/chat/native?userId=1
```

### 2. 局域网内其他设备访问
**必须使用服务器IP地址**：
```javascript
ws://192.168.1.132:8082/ws/chat/native?userId=1
```

**支持的设备**：
- ✅ 同一WiFi下的手机
- ✅ 同一WiFi下的平板
- ✅ 同一局域网的其他电脑
- ✅ 连接同一路由器的所有设备

### 3. 外网访问（如果需要）
需要配置以下内容：
1. **路由器端口映射**（将 8082 端口映射到服务器）
2. **动态域名**（使用 DDNS 服务）
3. **防火墙规则**（开放 8082 端口）

```javascript
// 使用公网IP或域名
ws://your-public-ip:8082/ws/chat/native?userId=1
// 或使用域名
ws://your-domain.com:8082/ws/chat/native?userId=1
```

---

## 🛠️ 防火墙配置

### Windows 防火墙

确保端口 8082 已开放：

```powershell
# 允许入站连接（管理员权限运行）
netsh advfirewall firewall add rule name="WebSocket 8082" dir=in action=allow protocol=TCP localport=8082
```

或通过图形界面：
1. 打开 **Windows Defender 防火墙**
2. 点击 **高级设置**
3. 选择 **入站规则** → **新建规则**
4. 选择 **端口** → **TCP** → **特定本地端口** → 输入 `8082`
5. 选择 **允许连接**
6. 完成配置

### Linux 防火墙（如果服务器是Linux）

```bash
# 使用 ufw
sudo ufw allow 8082/tcp

# 使用 firewalld
sudo firewall-cmd --permanent --add-port=8082/tcp
sudo firewall-cmd --reload
```

---

## 📱 移动端测试

### Android / iOS 浏览器测试

1. **确保设备连接到同一WiFi**
2. **打开浏览器控制台**（如 Safari/Chrome DevTools）
3. **测试连接**：

```javascript
// 在浏览器控制台运行
const ws = new WebSocket('ws://192.168.1.132:8082/ws/chat/native?userId=1');
ws.onopen = () => console.log('✅ 连接成功');
ws.onerror = (e) => console.error('❌ 连接失败', e);
```

### 使用 Postman Mobile

1. 安装 Postman App
2. 创建 WebSocket Request
3. 连接地址：`ws://192.168.1.132:8082/ws/chat/native?userId=1`

---

## 🌐 前端应用配置

### Vue / React 应用

**开发环境配置**（`.env.development`）：
```env
VITE_WS_URL=ws://192.168.1.132:8082
VITE_API_URL=http://192.168.1.132:8082
```

**使用示例**：
```javascript
// Vue3
const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/chat/native?userId=${userId}`);

// React
const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/ws/chat/native?userId=${userId}`);
```

### 环境切换

创建多个环境配置文件：

**.env.local**（本机开发）：
```env
VITE_WS_URL=ws://localhost:8082
```

**.env.lan**（局域网测试）：
```env
VITE_WS_URL=ws://192.168.1.132:8082
```

**.env.production**（生产环境）：
```env
VITE_WS_URL=wss://your-domain.com
```

运行时指定环境：
```bash
# 本机开发
npm run dev

# 局域网测试
npm run dev --mode lan

# 生产构建
npm run build --mode production
```

---

## 🔍 网络连通性测试

### 1. Ping 测试

```bash
# 从其他设备测试服务器连通性
ping 192.168.1.132
```

预期结果：
```
Reply from 192.168.1.132: bytes=32 time<1ms TTL=128
```

### 2. 端口测试

```bash
# Windows (PowerShell)
Test-NetConnection -ComputerName 192.168.1.132 -Port 8082

# Linux / Mac
telnet 192.168.1.132 8082
# 或
nc -zv 192.168.1.132 8082
```

### 3. HTTP 接口测试

```bash
# 测试后端服务是否运行
curl http://192.168.1.132:8082/api/auth/check-auto-login

# 应该返回 JSON 响应
```

### 4. WebSocket 测试工具

推荐工具：
- **Postman** - 支持WebSocket测试
- **WebSocket King** - Chrome扩展
- **wscat** - 命令行工具

```bash
# 安装 wscat
npm install -g wscat

# 测试连接
wscat -c ws://192.168.1.132:8082/ws/chat/native?userId=1
```

---

## 🐛 常见问题排查

### 问题1：无法从其他设备连接

**可能原因**：
- ❌ 防火墙阻止了端口
- ❌ 设备不在同一局域网
- ❌ 后端服务未启动
- ❌ IP地址不正确

**解决方案**：
```bash
# 1. 检查服务器IP
ipconfig  # Windows
ifconfig  # Linux/Mac

# 2. 确认端口监听
netstat -ano | findstr :8082  # Windows
lsof -i :8082                 # Linux/Mac

# 3. 测试端口开放
telnet 192.168.1.132 8082
```

### 问题2：连接后立即断开

**可能原因**：
- ❌ userId参数缺失或无效
- ❌ Spring Security拦截了请求
- ❌ 网络不稳定

**解决方案**：
1. 确认URL包含有效的userId参数
2. 检查后端日志中的错误信息
3. 查看 SecurityConfig 是否包含 `/ws/**` 白名单

### 问题3：跨域问题（CORS）

如果前端运行在不同域名：

**后端配置** (`WebSocketConfig.java`)：
```java
@Override
public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(chatWebSocketHandler, "/ws/chat/native")
            .setAllowedOrigins("*")  // 允许所有来源（开发环境）
            // .setAllowedOrigins("http://192.168.1.100:3000")  // 指定来源（生产环境）
            ;
}
```

### 问题4：移动端无法连接

**检查清单**：
- ✅ 移动设备与服务器在同一WiFi
- ✅ 使用 `192.168.1.132` 而不是 `localhost`
- ✅ 使用 `ws://` 而不是 `wss://`（开发环境）
- ✅ 确认防火墙已开放端口

---

## 📝 最佳实践

### 1. 使用环境变量

不要硬编码IP地址，使用环境变量：

```javascript
// ✅ 好的做法
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://192.168.1.132:8082';
const ws = new WebSocket(`${WS_URL}/ws/chat/native?userId=${userId}`);

// ❌ 不好的做法
const ws = new WebSocket('ws://192.168.1.132:8082/ws/chat/native?userId=1');
```

### 2. 添加连接状态检测

```javascript
function createWebSocket() {
    const urls = [
        'ws://192.168.1.132:8082/ws/chat/native',  // 局域网
        'ws://localhost:8082/ws/chat/native'        // 本地
    ];
    
    for (const url of urls) {
        try {
            const ws = new WebSocket(`${url}?userId=${userId}`);
            ws.onopen = () => {
                console.log(`✅ 连接成功: ${url}`);
                return ws;
            };
        } catch (e) {
            console.warn(`❌ 连接失败: ${url}`, e);
        }
    }
}
```

### 3. 添加重连机制

```javascript
let reconnectAttempts = 0;
const maxReconnects = 5;

function connect() {
    const ws = new WebSocket('ws://192.168.1.132:8082/ws/chat/native?userId=1');
    
    ws.onclose = () => {
        if (reconnectAttempts < maxReconnects) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`${delay}ms 后重连...`);
            setTimeout(connect, delay);
        }
    };
    
    ws.onopen = () => {
        reconnectAttempts = 0; // 重置计数器
    };
}
```

---

## 📊 网络拓扑示例

```
路由器 (192.168.1.1)
    │
    ├─── 服务器 (192.168.1.132:8082) ← 后端服务
    │
    ├─── 电脑1 (192.168.1.100) ← 开发机
    │
    ├─── 手机1 (192.168.1.101) ← 测试设备
    │
    └─── 平板1 (192.168.1.102) ← 测试设备
```

所有设备都可以通过 `ws://192.168.1.132:8082` 访问WebSocket服务。

---

## ✅ 验证清单

测试前请确认：
- [ ] 后端服务已启动（端口8082）
- [ ] 防火墙已开放8082端口
- [ ] 设备在同一局域网
- [ ] WebSocket地址使用服务器IP（192.168.1.132）
- [ ] userId参数正确传递
- [ ] 前端代码已更新IP地址

---

## 🎯 快速测试命令

```bash
# 1. 查看服务器IP
ipconfig | findstr IPv4

# 2. 测试端口监听
netstat -ano | findstr :8082

# 3. 测试HTTP服务
curl http://192.168.1.132:8082/api/auth/check-auto-login

# 4. Postman测试WebSocket
# 连接地址: ws://192.168.1.132:8082/ws/chat/native?userId=1
# 发送消息: {"type":"heartbeat","timestamp":1700000000000}
```

---

## 📞 技术支持

如果按照以上步骤仍无法连接，请提供以下信息：
1. 服务器操作系统和IP地址
2. 客户端设备类型和IP地址
3. ping 和端口测试结果
4. 后端日志中的错误信息
5. 浏览器控制台错误信息

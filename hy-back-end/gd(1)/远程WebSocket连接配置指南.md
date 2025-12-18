# 远程 WebSocket 连接配置指南

## 🎯 问题描述
从局域网其他设备连接 WebSocket 时提示"连接被重置"。

## ✅ 解决方案

### 1. 后端配置（已完成）

**文件**: `src/main/resources/application.properties`

已添加配置：
```properties
server.port=8082
server.address=0.0.0.0  # 监听所有网络接口
```

**说明**：
- `server.address=0.0.0.0` 使服务器监听所有网络接口
- 默认值为 `localhost`（只能本机访问）
- 改为 `0.0.0.0` 后可以从局域网其他设备访问

---

## 🔥 2. 配置 Windows 防火墙

### 方法一：使用 PowerShell（推荐）

**以管理员权限运行 PowerShell**，执行以下命令：

```powershell
# 允许端口 8082 的入站连接
New-NetFirewallRule -DisplayName "Spring Boot WebSocket 8082" -Direction Inbound -LocalPort 8082 -Protocol TCP -Action Allow

# 验证规则是否创建成功
Get-NetFirewallRule -DisplayName "Spring Boot WebSocket 8082"
```

### 方法二：使用图形界面

1. **打开防火墙设置**
   - 按 `Win + R`，输入 `wf.msc`，回车
   - 或搜索"高级安全 Windows Defender 防火墙"

2. **创建入站规则**
   - 点击左侧 **入站规则**
   - 点击右侧 **新建规则**

3. **配置规则**
   - 规则类型：选择 **端口** → 下一步
   - 协议和端口：
     - 选择 **TCP**
     - 特定本地端口：输入 `8082`
     - 下一步
   - 操作：选择 **允许连接** → 下一步
   - 配置文件：全部勾选（域、专用、公用）→ 下一步
   - 名称：输入 `Spring Boot WebSocket 8082` → 完成

4. **验证规则**
   - 在"入站规则"列表中找到刚创建的规则
   - 确认"启用"状态为"是"

---

## 🔄 3. 重启后端服务

**必须重启后端服务**才能使配置生效：

### 如果使用 IDE（推荐）
1. 停止当前运行的应用
2. 重新启动应用
3. 查看启动日志

### 如果使用命令行
```bash
# 停止服务（Ctrl+C）
# 重新启动
mvn spring-boot:run
```

### 验证启动日志

重启后，查看控制台输出，应该看到：
```
Tomcat started on port(s): 8082 (http) with context path ''
```

如果看到以下信息，说明配置生效：
```
o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8082 (http)
```

---

## 🧪 4. 测试连接

### 测试1：本机测试（确保服务正常）

**在服务器本机**打开 PowerShell 或命令提示符：

```powershell
# 测试端口是否监听
netstat -ano | findstr :8082
```

预期输出：
```
TCP    0.0.0.0:8082           0.0.0.0:0              LISTENING       12345
```

**注意**：`0.0.0.0:8082` 表示监听所有网络接口，如果显示 `127.0.0.1:8082` 则配置未生效。

### 测试2：局域网测试

**从其他设备**（手机、另一台电脑）测试：

#### A. Ping 测试
```bash
ping 192.168.1.132
```

预期结果：
```
Reply from 192.168.1.132: bytes=32 time<1ms TTL=128
```

#### B. 端口测试

**Windows（在另一台设备）**：
```powershell
Test-NetConnection -ComputerName 192.168.1.132 -Port 8082
```

预期输出：
```
TcpTestSucceeded : True
```

**Linux/Mac**：
```bash
telnet 192.168.1.132 8082
# 或
nc -zv 192.168.1.132 8082
```

#### C. HTTP API 测试
```bash
# 测试HTTP接口
curl http://192.168.1.132:8082/api/auth/check-auto-login
```

应该返回 JSON 响应（即使是错误响应也说明服务可访问）。

### 测试3：WebSocket 连接测试

#### 使用 Postman
1. 打开 Postman
2. 创建 WebSocket Request
3. 连接地址：`ws://192.168.1.132:8082/ws/chat/native?userId=1`
4. 点击 **Connect**
5. 如果连接成功，发送心跳：
   ```json
   {
       "type": "heartbeat",
       "timestamp": 1700000000000
   }
   ```

#### 使用浏览器控制台
在另一台设备的浏览器控制台运行：
```javascript
const ws = new WebSocket('ws://192.168.1.132:8082/ws/chat/native?userId=1');
ws.onopen = () => console.log('✅ WebSocket连接成功');
ws.onerror = (e) => console.error('❌ WebSocket连接失败', e);
ws.onmessage = (e) => console.log('📨 收到消息:', e.data);

// 发送心跳测试
ws.send(JSON.stringify({
    type: 'heartbeat',
    timestamp: Date.now()
}));
```

---

## 🔍 5. 故障排查

### 问题1：端口显示 127.0.0.1 而不是 0.0.0.0

**原因**：配置未生效或未重启服务

**解决**：
1. 确认 `application.properties` 中有 `server.address=0.0.0.0`
2. 重启后端服务
3. 再次检查端口监听状态

### 问题2：防火墙规则创建失败

**原因**：权限不足

**解决**：
1. 以**管理员身份**运行 PowerShell 或命令提示符
2. 重新执行防火墙配置命令
3. 或使用图形界面创建规则

### 问题3：仍然无法连接

**检查清单**：

```powershell
# 1. 确认服务器IP地址
ipconfig

# 2. 确认端口监听状态
netstat -ano | findstr :8082

# 3. 确认防火墙规则
Get-NetFirewallRule -DisplayName "Spring Boot WebSocket 8082" | Select-Object Name,Enabled,Action

# 4. 测试本机连接
curl http://localhost:8082/api/auth/check-auto-login

# 5. 从其他设备测试连接
# （在另一台设备上运行）
Test-NetConnection -ComputerName 192.168.1.132 -Port 8082
```

### 问题4：连接成功但立即断开

**可能原因**：
- ❌ userId 参数无效
- ❌ 后端日志有错误

**解决**：
1. 检查 WebSocket URL 包含正确的 userId
2. 查看后端控制台日志
3. 确认用户ID在数据库中存在

---

## 📱 6. 移动设备连接

### Android / iOS 手机测试

1. **确保手机连接到同一WiFi**
   - 查看WiFi设置，确认连接到同一路由器
   - 手机IP应该在 `192.168.1.x` 段

2. **使用浏览器测试**
   - 打开手机浏览器
   - 访问：`http://192.168.1.132:8082/api/auth/check-auto-login`
   - 如果能看到响应，说明HTTP可访问

3. **测试 WebSocket**
   - 在手机浏览器打开开发者工具（Chrome/Safari）
   - 运行上面的 JavaScript 测试代码

---

## 🌐 7. 前端应用配置

### 更新前端 WebSocket 地址

**方法一：直接修改代码**
```javascript
// 开发环境 - 本机
const WS_URL = 'ws://localhost:8082';

// 开发环境 - 局域网测试
const WS_URL = 'ws://192.168.1.132:8082';

// 动态判断
const WS_URL = window.location.hostname === 'localhost' 
    ? 'ws://localhost:8082' 
    : 'ws://192.168.1.132:8082';

const ws = new WebSocket(`${WS_URL}/ws/chat/native?userId=${userId}`);
```

**方法二：使用环境变量**

创建 `.env.local`（本机开发）：
```env
VITE_WS_URL=ws://localhost:8082
VITE_API_URL=http://localhost:8082
```

创建 `.env.lan`（局域网测试）：
```env
VITE_WS_URL=ws://192.168.1.132:8082
VITE_API_URL=http://192.168.1.132:8082
```

代码中使用：
```javascript
const WS_URL = import.meta.env.VITE_WS_URL;
const ws = new WebSocket(`${WS_URL}/ws/chat/native?userId=${userId}`);
```

运行时切换环境：
```bash
# 本机开发
npm run dev

# 局域网测试
npm run dev -- --mode lan
```

---

## ✅ 验证清单

完成配置后，请确认：

- [ ] `application.properties` 中添加了 `server.address=0.0.0.0`
- [ ] Windows 防火墙已开放端口 8082
- [ ] 后端服务已重启
- [ ] `netstat` 显示监听 `0.0.0.0:8082` 而不是 `127.0.0.1:8082`
- [ ] 从其他设备可以 ping 通 `192.168.1.132`
- [ ] 从其他设备可以访问 HTTP API
- [ ] WebSocket 可以成功连接
- [ ] 前端代码已更新为使用服务器IP

---

## 📊 网络架构图

```
路由器 (192.168.1.1)
    │
    ├─── 服务器 (192.168.1.132)
    │    ├─ 后端服务 (0.0.0.0:8082) ✅ 监听所有接口
    │    └─ 防火墙规则 ✅ 允许端口 8082
    │
    ├─── 电脑1 (192.168.1.100)
    │    └─ 浏览器/Postman → ws://192.168.1.132:8082
    │
    └─── 手机1 (192.168.1.101)
         └─ 前端应用 → ws://192.168.1.132:8082
```

---

## 🎯 常用命令速查

```powershell
# ========== 服务器端（192.168.1.132） ==========

# 1. 查看IP地址
ipconfig

# 2. 查看端口监听状态（应该看到 0.0.0.0:8082）
netstat -ano | findstr :8082

# 3. 创建防火墙规则
New-NetFirewallRule -DisplayName "Spring Boot WebSocket 8082" -Direction Inbound -LocalPort 8082 -Protocol TCP -Action Allow

# 4. 查看防火墙规则
Get-NetFirewallRule -DisplayName "Spring Boot WebSocket 8082"

# 5. 测试本机连接
curl http://localhost:8082/api/auth/check-auto-login


# ========== 客户端（其他设备） ==========

# 1. 测试网络连通性
ping 192.168.1.132

# 2. 测试端口（PowerShell）
Test-NetConnection -ComputerName 192.168.1.132 -Port 8082

# 3. 测试HTTP接口
curl http://192.168.1.132:8082/api/auth/check-auto-login

# 4. 测试WebSocket（浏览器控制台）
const ws = new WebSocket('ws://192.168.1.132:8082/ws/chat/native?userId=1');
ws.onopen = () => console.log('✅ 连接成功');
```

---

## 📞 技术支持

如果按照以上步骤配置后仍无法连接，请提供：

1. **服务器端**：
   - `netstat -ano | findstr :8082` 的输出
   - 后端启动日志
   - 防火墙规则截图

2. **客户端**：
   - Ping 测试结果
   - 端口测试结果
   - 浏览器控制台错误信息

3. **网络信息**：
   - 服务器IP：192.168.1.132
   - 客户端IP：?
   - 是否在同一WiFi/局域网

---

## 🚀 下一步

配置完成后：
1. 使用 Postman 测试 WebSocket 连接
2. 更新前端代码使用服务器IP
3. 在移动设备上测试聊天功能
4. 配置生产环境（如需要）

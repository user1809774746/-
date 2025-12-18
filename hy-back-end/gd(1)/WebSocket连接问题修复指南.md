# WebSocket连接问题修复指南

## 🚨 问题描述
前端WebSocket连接失败，错误信息：
```
WebSocket connection to 'ws://localhost:8080/ws/chat/native?userId=1' failed
```

## 🔍 问题原因
**端口不匹配**：前端尝试连接8080端口，但后端实际运行在8082端口。

## ✅ 解决方案

### 1. 修复前端WebSocket配置

在前端项目中找到WebSocket相关配置文件（通常是`WebSocketService.js`或类似文件），将连接URL从：
```javascript
// ❌ 错误的配置
const ws = new WebSocket('ws://localhost:8080/ws/chat/native?userId=1');
```

修改为：
```javascript
// ✅ 正确的配置
const ws = new WebSocket('ws://localhost:8082/ws/chat/native?userId=1');
```

### 2. 检查前端API配置

确保前端的API配置文件中WebSocket相关配置使用正确端口：
```javascript
// config.js 或类似配置文件
export const WEBSOCKET_CONFIG = {
  BASE_URL: 'ws://localhost:8082',
  ENDPOINTS: {
    CHAT: '/ws/chat/native',
    CHAT_SOCKJS: '/ws/chat'
  }
};
```

### 3. 验证后端服务状态

确认后端服务正在8082端口运行：
```bash
# 检查端口占用
netstat -an | findstr :8082

# 或者访问后端健康检查
curl http://localhost:8082/api/user-chat/swagger-ui.html
```

### 4. 测试WebSocket连接

使用提供的测试页面验证连接：
1. 打开 `test-chat-api.html`
2. 点击"连接WebSocket"按钮
3. 查看连接状态

## 🔧 快速修复步骤

1. **找到前端WebSocket服务文件**
   - 通常位于 `src/services/WebSocketService.js`
   - 或者 `src/utils/websocket.js`

2. **修改连接URL**
   ```javascript
   // 将所有 ws://localhost:8080 改为 ws://localhost:8082
   ```

3. **重启前端开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

4. **测试连接**
   - 刷新页面
   - 尝试发送消息
   - 检查浏览器控制台是否还有错误

## 📝 正确的WebSocket使用示例

### 基础连接
```javascript
const userId = 1;
const ws = new WebSocket(`ws://localhost:8082/ws/chat/native?userId=${userId}`);

ws.onopen = function(event) {
    console.log('✅ WebSocket连接成功');
};

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('📨 收到消息:', message);
};

ws.onerror = function(error) {
    console.error('❌ WebSocket错误:', error);
};

ws.onclose = function(event) {
    console.log('🔌 WebSocket连接关闭:', event.code);
};
```

### 发送消息
```javascript
// 发送心跳
ws.send(JSON.stringify({
    type: 'heartbeat',
    timestamp: Date.now()
}));

// 发送聊天消息
ws.send(JSON.stringify({
    type: 'send_message',
    data: {
        receiverId: 2,
        messageType: 'text',
        content: '你好！'
    }
}));
```

## 🚀 验证修复结果

修复后，WebSocket连接应该成功，浏览器控制台会显示：
```
🔌 连接WebSocket: ws://localhost:8082/ws/chat/native?userId=1
✅ WebSocket连接成功
```

## 📞 如果问题仍然存在

1. **检查防火墙设置** - 确保8082端口未被阻止
2. **检查后端日志** - 查看是否有WebSocket相关错误
3. **验证用户ID** - 确保传递的userId有效
4. **检查网络连接** - 确保本地网络正常

---

**修复完成后，聊天功能应该可以正常工作！** 🎉

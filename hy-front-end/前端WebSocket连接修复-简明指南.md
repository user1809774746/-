# 前端WebSocket连接修复 - 简明指南

## 🚨 问题原因

前端使用HTTPS运行，但WebSocket尝试连接`ws://localhost:8082`（非加密），浏览器安全策略阻止了混合内容连接。

## ✅ 解决方案：使用Vite代理

### 1️⃣ 找到WebSocket连接代码

在前端项目中找到文件：`src/components/ChatPage.jsx`

搜索关键词：`new WebSocket`

### 2️⃣ 修改连接代码

**原代码（错误）**：
```javascript
const ws = new WebSocket(`ws://localhost:8082/ws/chat/native?userId=${userId}`);
```

**修改为（正确）**：
```javascript
// 自动适配HTTP/HTTPS协议，使用Vite代理
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/native?userId=${userId}`;
const ws = new WebSocket(wsUrl);

console.log('🔌 连接WebSocket:', wsUrl);
```

### 3️⃣ 完整示例代码

找到类似这样的函数：

```javascript
const initWebSocket = async () => {
  try {
    // 旧代码
    const ws = new WebSocket(`ws://localhost:8082/ws/chat/native?userId=${userId}`);
    // ... 其他代码
  } catch (error) {
    console.error('WebSocket初始化失败:', error);
  }
};
```

**修改为**：

```javascript
const initWebSocket = async () => {
  try {
    // 获取当前用户ID（假设你已经有获取用户信息的方法）
    const userInfo = await getUserProfile(); // 或其他获取用户信息的方法
    const userId = userInfo.data.userId || userInfo.data.UserID;
    
    // 使用代理连接WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/native?userId=${userId}`;
    
    console.log('🔌 连接WebSocket:', wsUrl);
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('✅ WebSocket连接成功');
      setWsConnected(true);
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 收到WebSocket消息:', data);
        
        if (data.type === 'new_message') {
          // 收到新消息，添加到消息列表
          setMessages(prevMessages => [...prevMessages, data.data]);
        } else if (data.type === 'heartbeat_response') {
          // 心跳响应
          console.log('💓 心跳正常');
        }
      } catch (error) {
        console.error('处理WebSocket消息失败:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('❌ WebSocket错误:', error);
      setWsConnected(false);
    };
    
    websocket.onclose = (event) => {
      console.log('🔌 WebSocket连接关闭:', event.code);
      setWsConnected(false);
      
      // 3秒后自动重连
      setTimeout(() => {
        console.log('🔄 尝试重新连接WebSocket...');
        initWebSocket();
      }, 3000);
    };
    
    setWs(websocket);
    
  } catch (error) {
    console.error('WebSocket初始化失败:', error);
  }
};
```

## 🎯 修改后的连接地址

| 环境 | 原地址（错误） | 新地址（正确） |
|------|--------------|--------------|
| HTTP | `ws://localhost:8082/ws/...` | `ws://localhost:3000/ws/...` |
| HTTPS | `ws://localhost:8082/ws/...` | `wss://localhost:3000/ws/...` |

**关键点**：
- ✅ 端口从8082改为3000（前端端口）
- ✅ 协议自动匹配（http用ws，https用wss）
- ✅ Vite会自动代理到后端8082端口

## 📋 完整修改步骤

### Step 1: 打开文件
```
e:\FE-HaoY\1\hy-front-end\src\components\ChatPage.jsx
```

### Step 2: 找到WebSocket连接代码
搜索：`new WebSocket`

### Step 3: 替换整个initWebSocket函数

```javascript
// ===== 在ChatPage组件中找到initWebSocket函数，替换为以下代码 =====

const initWebSocket = async () => {
  try {
    // 获取当前用户ID
    const response = await getUserProfile();
    const userId = response.data.userId || response.data.UserID;
    
    if (!userId) {
      console.error('❌ 无法获取用户ID');
      return;
    }
    
    // 自动适配协议，使用Vite代理
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/native?userId=${userId}`;
    
    console.log('🔌 连接WebSocket:', wsUrl);
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('✅ WebSocket连接成功');
      setWsConnected(true);
      // 发送心跳保持连接
      const heartbeat = setInterval(() => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30000); // 每30秒发送一次心跳
      
      // 保存心跳定时器ID，用于清理
      websocket.heartbeatInterval = heartbeat;
    };
    
    websocket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log('📨 收到WebSocket消息:', response);
        
        if (response.type === 'new_message') {
          // 收到新消息
          const newMessage = response.data;
          setMessages(prevMessages => [...prevMessages, newMessage]);
          
          // 播放提示音（可选）
          // playNotificationSound();
        } else if (response.type === 'heartbeat_response') {
          console.log('💓 心跳响应');
        }
      } catch (error) {
        console.error('❌ 处理WebSocket消息失败:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('❌ WebSocket错误:', error);
      setWsConnected(false);
    };
    
    websocket.onclose = (event) => {
      console.log('🔌 WebSocket连接关闭, code:', event.code);
      setWsConnected(false);
      
      // 清理心跳定时器
      if (websocket.heartbeatInterval) {
        clearInterval(websocket.heartbeatInterval);
      }
      
      // 3秒后自动重连（除非是正常关闭）
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log('🔄 尝试重新连接WebSocket...');
          initWebSocket();
        }, 3000);
      }
    };
    
    setWs(websocket);
    
  } catch (error) {
    console.error('❌ WebSocket初始化失败:', error);
  }
};
```

### Step 4: 保存文件

### Step 5: 刷新浏览器页面（不需要重启服务）

## 🧪 验证结果

打开浏览器控制台，应该看到：

```
🔌 连接WebSocket: ws://localhost:3000/ws/chat/native?userId=1
✅ WebSocket连接成功
💓 心跳响应
```

## 📝 注意事项

1. **不要重启前端服务** - 直接刷新浏览器页面即可
2. **检查userId** - 确保获取到真实的数字用户ID，不是字符串"test"
3. **查看控制台** - 如果还有问题，查看浏览器控制台的错误信息

## ❓ 如果还是不行

### 检查清单：

1. **Vite代理配置是否正确**
   - 打开 `vite.config.js`
   - 确认第47-56行有WebSocket代理配置

2. **后端服务是否运行**
   ```bash
   # 检查8082端口
   netstat -ano | findstr :8082
   ```

3. **用户ID是否正确**
   - 在`initWebSocket`函数开始处添加：
   ```javascript
   console.log('当前用户ID:', userId);
   ```

4. **浏览器控制台完整错误信息**
   - 复制完整的错误堆栈给我

## ✅ 成功标志

修复成功后，你应该看到：

**浏览器控制台**：
```
🔌 连接WebSocket: ws://localhost:3000/ws/chat/native?userId=1
✅ WebSocket连接成功
```

**聊天界面**：
- ✅ 发送消息后立即显示
- ✅ 对方立即收到消息
- ✅ 双向实时通信正常

---

**按照以上步骤修改后，聊天功能应该完全正常！** 🎉

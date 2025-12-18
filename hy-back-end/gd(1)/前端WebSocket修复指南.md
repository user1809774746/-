# 前端WebSocket修复指南

## 🚨 问题诊断

消息能发送成功，但对方看不到，原因：
1. ✅ **后端已修复** - 添加了WebSocket实时推送功能
2. ❌ **前端问题** - WebSocket连接失败或参数错误

前端错误信息：
```
WebSocket connection to 'ws://localhost:8082/ws/chat/native?userId=test' failed
```

## ✅ 前端修复方案

### 问题1：userId参数错误

**错误配置**：
```javascript
// ❌ 错误：使用了字符串 "test"
ws://localhost:8082/ws/chat/native?userId=test
```

**正确配置**：
```javascript
// ✅ 正确：使用真实的数字用户ID
ws://localhost:8082/ws/chat/native?userId=1
```

### 问题2：端口配置错误

**错误配置**：
```javascript
// ❌ 错误：使用了8080端口
ws://localhost:8080/ws/chat/native?userId=1
```

**正确配置**：
```javascript
// ✅ 正确：使用8082端口
ws://localhost:8082/ws/chat/native?userId=1
```

## 🔧 具体修复步骤

### 步骤1：找到WebSocket连接代码

在前端项目中搜索WebSocket相关代码，通常在以下位置：
- `src/services/WebSocketService.js`
- `src/utils/websocket.js`
- `src/components/ChatPage.jsx`

### 步骤2：修复WebSocket连接URL

找到类似这样的代码：

```javascript
// 可能的错误写法
const initWebSocket = () => {
  const ws = new WebSocket(`ws://localhost:8080/ws/chat/native?userId=test`);
  // 或
  const ws = new WebSocket(`ws://localhost:8082/ws/chat/native?userId=test`);
};
```

**修改为**：

```javascript
// 正确写法
const initWebSocket = (userId) => {
  // 从用户认证信息获取真实userId
  const ws = new WebSocket(`ws://localhost:8082/ws/chat/native?userId=${userId}`);
  
  ws.onopen = () => {
    console.log('✅ WebSocket连接成功');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📨 收到消息:', data);
    
    // 处理不同类型的消息
    if (data.type === 'new_message') {
      // 添加新消息到聊天列表
      handleNewMessage(data.data);
    }
  };
  
  ws.onerror = (error) => {
    console.error('❌ WebSocket错误:', error);
  };
  
  ws.onclose = (event) => {
    console.log('🔌 WebSocket连接关闭:', event.code);
  };
};
```

### 步骤3：获取真实用户ID

在ChatPage组件中，从用户认证信息获取真实的userId：

```javascript
// ChatPage.jsx 或类似组件

import { getUserProfile } from '../api/config';

const ChatPage = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [ws, setWs] = useState(null);
  
  useEffect(() => {
    // 获取当前登录用户信息
    const fetchUserInfo = async () => {
      try {
        const response = await getUserProfile();
        const userId = response.data.userId; // 或 response.data.UserID
        setCurrentUserId(userId);
        
        // 使用真实userId连接WebSocket
        const websocket = new WebSocket(`ws://localhost:8082/ws/chat/native?userId=${userId}`);
        
        websocket.onopen = () => {
          console.log('✅ WebSocket连接成功');
        };
        
        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message') {
            // 更新消息列表
            setMessages(prev => [...prev, data.data]);
          }
        };
        
        setWs(websocket);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };
    
    fetchUserInfo();
    
    // 清理WebSocket连接
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);
  
  // ... 其他代码
};
```

### 步骤4：处理接收到的消息

确保正确处理WebSocket推送的消息：

```javascript
websocket.onmessage = (event) => {
  try {
    const response = JSON.parse(event.data);
    console.log('📨 收到WebSocket消息:', response);
    
    // 后端推送的消息格式
    if (response.type === 'new_message') {
      const newMessage = response.data;
      
      // 只有当消息的接收者是当前用户时，才添加到消息列表
      if (newMessage.receiverId === currentUserId) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // 可选：播放提示音
        playNotificationSound();
        
        // 可选：显示桌面通知
        showNotification(`${newMessage.senderName}发来新消息`);
      }
    }
  } catch (error) {
    console.error('处理WebSocket消息失败:', error);
  }
};
```

## 📝 完整示例代码

### WebSocket Service封装

```javascript
// src/services/WebSocketService.js

class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
  }
  
  connect(userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket已连接');
      return;
    }
    
    this.ws = new WebSocket(`ws://localhost:8082/ws/chat/native?userId=${userId}`);
    
    this.ws.onopen = () => {
      console.log('✅ WebSocket连接成功');
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('解析消息失败:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('❌ WebSocket错误:', error);
    };
    
    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket连接关闭:', event.code);
      // 自动重连
      setTimeout(() => this.connect(userId), 3000);
    };
  }
  
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();
```

### 在组件中使用

```javascript
// src/components/ChatPage.jsx

import { useEffect, useState } from 'react';
import WebSocketService from '../services/WebSocketService';
import { getUserProfile, sendMessage } from '../api/config';

const ChatPage = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // 初始化
    const init = async () => {
      try {
        // 获取用户信息
        const response = await getUserProfile();
        const userId = response.data.userId;
        setCurrentUserId(userId);
        
        // 连接WebSocket
        WebSocketService.connect(userId);
        
        // 监听新消息
        WebSocketService.onMessage((data) => {
          if (data.type === 'new_message') {
            setMessages(prev => [...prev, data.data]);
          }
        });
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };
    
    init();
    
    return () => {
      WebSocketService.disconnect();
    };
  }, []);
  
  const handleSendMessage = async (content) => {
    try {
      const response = await sendMessage({
        senderId: currentUserId,
        receiverId: selectedFriend.userId,
        messageType: 'text',
        content: content
      });
      
      if (response.success) {
        // 消息发送成功，添加到列表
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };
  
  return (
    <div>
      {/* 聊天界面 */}
    </div>
  );
};
```

## 🧪 测试步骤

1. **修改代码后重启前端服务**
   ```bash
   npm run dev
   ```

2. **打开浏览器控制台**
   - 查看是否有 `✅ WebSocket连接成功` 日志

3. **发送测试消息**
   - 用户A发送消息给用户B
   - 检查用户B是否立即收到消息

4. **验证双向通信**
   - 用户B回复消息
   - 检查用户A是否立即收到

## ✅ 验证结果

修复后应该看到：

**浏览器控制台**：
```
🔌 连接WebSocket: ws://localhost:8082/ws/chat/native?userId=1
✅ WebSocket连接成功
📨 收到WebSocket消息: {type: 'new_message', data: {...}}
```

**聊天界面**：
- ✅ 发送消息后立即显示
- ✅ 对方立即收到消息
- ✅ 消息实时更新

---

**修复完成后，聊天功能应该完全正常，双方都能实时看到消息！** 🎉

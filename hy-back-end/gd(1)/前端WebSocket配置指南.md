# 前端WebSocket配置指南

## 1. 连接WebSocket

### 原生WebSocket连接
```javascript
const userId = 123; // 当前登录用户ID
const ws = new WebSocket(`ws://192.168.1.132:8082/ws/chat/native?userId=${userId}`);

// 或通过Header传递（需要后端支持）
const ws = new WebSocket('ws://192.168.1.132:8082/ws/chat/native');
// 连接建立后在handshake中包含: X-User-Id: 123
```

### 使用SockJS（支持降级）
```javascript
const userId = 123;
const socket = new SockJS(`http://192.168.1.132:8082/ws/chat?userId=${userId}`);
```

## 2. 事件监听

```javascript
// 连接成功
ws.onopen = () => {
    console.log('WebSocket连接成功');
    startHeartbeat(); // 启动心跳
};

// 接收消息
ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    handleMessage(response);
};

// 连接错误
ws.onerror = (error) => {
    console.error('WebSocket错误:', error);
};

// 连接关闭
ws.onclose = () => {
    console.log('WebSocket连接关闭');
    reconnect(); // 重连逻辑
};
```

## 3. 发送消息格式

### 消息结构
```javascript
{
    "type": "消息类型",
    "data": { /* 消息数据 */ },
    "timestamp": 1700000000000,
    "requestId": "唯一请求ID（可选）"
}
```

### 支持的消息类型

#### 心跳消息
```javascript
function sendHeartbeat() {
    ws.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: Date.now()
    }));
}

// 每30秒发送一次心跳
setInterval(sendHeartbeat, 30000);
```

#### 发送聊天消息
```javascript
function sendMessage(receiverId, content, messageType = 'text') {
    ws.send(JSON.stringify({
        type: 'send_message',
        data: {
            receiverId: receiverId,
            content: content,
            messageType: messageType // text/image/voice/video/file
        },
        timestamp: Date.now()
    }));
}

// 示例：发送文本消息
sendMessage(456, '你好！', 'text');
```

#### 发送群聊消息
```javascript
function sendGroupMessage(groupId, content, messageType = 'text') {
    ws.send(JSON.stringify({
        type: 'send_message',
        data: {
            groupId: groupId,
            content: content,
            messageType: messageType
        },
        timestamp: Date.now()
    }));
}
```

#### 输入状态提示
```javascript
function sendTypingStatus(targetId, targetType, isTyping) {
    ws.send(JSON.stringify({
        type: 'typing',
        data: {
            targetId: targetId,      // 对方ID或群组ID
            targetType: targetType,  // 'user' 或 'group'
            isTyping: isTyping       // true/false
        },
        timestamp: Date.now()
    }));
}

// 示例：开始输入
sendTypingStatus(456, 'user', true);
```

#### 标记消息已读
```javascript
function markMessageAsRead(messageId, conversationId) {
    ws.send(JSON.stringify({
        type: 'read_message',
        data: {
            messageId: messageId,
            conversationId: conversationId
        },
        timestamp: Date.now()
    }));
}
```

#### 加入/离开群组
```javascript
function joinGroup(groupId) {
    ws.send(JSON.stringify({
        type: 'join_group',
        data: { groupId: groupId },
        timestamp: Date.now()
    }));
}

function leaveGroup(groupId) {
    ws.send(JSON.stringify({
        type: 'leave_group',
        data: { groupId: groupId },
        timestamp: Date.now()
    }));
}
```

## 4. 接收消息处理

### 响应格式
```javascript
{
    "type": "响应类型",
    "data": { /* 响应数据 */ },
    "success": true,
    "message": "操作消息",
    "error": "错误信息（如果有）",
    "timestamp": 1700000000000,
    "requestId": "对应的请求ID"
}
```

### 消息处理示例
```javascript
function handleMessage(response) {
    switch (response.type) {
        case 'heartbeat_response':
            // 心跳响应
            console.log('心跳正常');
            break;
            
        case 'new_message':
            // 收到新消息
            displayNewMessage(response.data);
            playNotificationSound();
            break;
            
        case 'new_group_message':
            // 收到群聊消息
            displayGroupMessage(response.data);
            break;
            
        case 'typing_status':
            // 对方输入状态
            showTypingIndicator(response.data.userId, response.data.isTyping);
            break;
            
        case 'friend_online_status':
            // 好友在线状态变化
            updateFriendStatus(response.data.userId, response.data.isOnline);
            break;
            
        case 'success':
            // 操作成功
            console.log('操作成功:', response.message);
            break;
            
        case 'error':
            // 错误消息
            console.error('操作失败:', response.message);
            showErrorToast(response.message);
            break;
            
        default:
            console.warn('未知消息类型:', response.type);
    }
}
```

## 5. 完整示例（Vue3）

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export default {
    setup() {
        const ws = ref(null);
        const isConnected = ref(false);
        const messages = ref([]);
        
        // 连接WebSocket
        function connect() {
            const userId = localStorage.getItem('userId');
            ws.value = new WebSocket(`ws://192.168.1.132:8082/ws/chat/native?userId=${userId}`);
            
            ws.value.onopen = () => {
                isConnected.value = true;
                console.log('WebSocket已连接');
                startHeartbeat();
            };
            
            ws.value.onmessage = (event) => {
                const response = JSON.parse(event.data);
                handleMessage(response);
            };
            
            ws.value.onerror = (error) => {
                console.error('WebSocket错误:', error);
            };
            
            ws.value.onclose = () => {
                isConnected.value = false;
                console.log('WebSocket已断开');
                setTimeout(connect, 3000); // 3秒后重连
            };
        }
        
        // 心跳机制
        let heartbeatTimer = null;
        function startHeartbeat() {
            heartbeatTimer = setInterval(() => {
                if (ws.value?.readyState === WebSocket.OPEN) {
                    ws.value.send(JSON.stringify({
                        type: 'heartbeat',
                        timestamp: Date.now()
                    }));
                }
            }, 30000);
        }
        
        // 发送消息
        function sendMessage(receiverId, content) {
            if (ws.value?.readyState === WebSocket.OPEN) {
                ws.value.send(JSON.stringify({
                    type: 'send_message',
                    data: {
                        receiverId: receiverId,
                        content: content,
                        messageType: 'text'
                    },
                    timestamp: Date.now()
                }));
            }
        }
        
        // 处理接收消息
        function handleMessage(response) {
            if (response.type === 'new_message') {
                messages.value.push(response.data);
            }
        }
        
        // 组件挂载时连接
        onMounted(() => {
            connect();
        });
        
        // 组件卸载时断开
        onUnmounted(() => {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            if (ws.value) ws.value.close();
        });
        
        return {
            isConnected,
            messages,
            sendMessage
        };
    }
};
```

## 6. 完整示例（React）

```javascript
import { useState, useEffect, useRef } from 'react';

function useChatWebSocket(userId) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);
    const heartbeatTimer = useRef(null);
    
    useEffect(() => {
        // 连接WebSocket
        ws.current = new WebSocket(`ws://192.168.1.132:8082/ws/chat/native?userId=${userId}`);
        
        ws.current.onopen = () => {
            setIsConnected(true);
            console.log('WebSocket已连接');
            
            // 启动心跳
            heartbeatTimer.current = setInterval(() => {
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        type: 'heartbeat',
                        timestamp: Date.now()
                    }));
                }
            }, 30000);
        };
        
        ws.current.onmessage = (event) => {
            const response = JSON.parse(event.data);
            
            if (response.type === 'new_message') {
                setMessages(prev => [...prev, response.data]);
            }
        };
        
        ws.current.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };
        
        ws.current.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket已断开');
        };
        
        // 清理
        return () => {
            if (heartbeatTimer.current) {
                clearInterval(heartbeatTimer.current);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [userId]);
    
    // 发送消息
    const sendMessage = (receiverId, content) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'send_message',
                data: {
                    receiverId: receiverId,
                    content: content,
                    messageType: 'text'
                },
                timestamp: Date.now()
            }));
        }
    };
    
    return { isConnected, messages, sendMessage };
}

export default useChatWebSocket;
```

## 7. 注意事项

### 连接参数
- **必须传递userId**：通过URL参数 `?userId=123` 或Header `X-User-Id: 123`
- **连接地址**：
  - 开发环境：`ws://192.168.1.132:8082`
  - 生产环境：`wss://your-domain.com`（使用WSS加密）

### 心跳机制
- **必须实现心跳**：每30秒发送一次 `heartbeat` 消息
- **作用**：保持连接活跃，防止被服务器或代理关闭

### 重连机制
```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function reconnect() {
    if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`${delay}ms 后尝试重连...`);
        setTimeout(connect, delay);
    } else {
        console.error('重连失败，已达到最大重连次数');
    }
}
```

### 连接状态
- **0 (CONNECTING)** - 连接中
- **1 (OPEN)** - 已连接
- **2 (CLOSING)** - 关闭中
- **3 (CLOSED)** - 已关闭

### 消息发送前检查
```javascript
function safeSend(message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.warn('WebSocket未连接，消息未发送');
        // 可以将消息加入队列，连接恢复后重发
    }
}
```

## 8. 调试技巧

### Chrome DevTools
1. 打开 DevTools → Network → WS
2. 查看WebSocket连接状态和消息收发
3. 可以看到每条消息的内容和时间戳

### 日志输出
```javascript
ws.onmessage = (event) => {
    console.log('📨 收到消息:', event.data);
    const response = JSON.parse(event.data);
    handleMessage(response);
};

// 发送消息时也打印日志
function safeSend(message) {
    console.log('📤 发送消息:', message);
    ws.send(JSON.stringify(message));
}
```

# WebSocket 消息格式说明

## 问题分析

### 错误信息
```
TypeError: Cannot read properties of undefined (reading 'message')
at GroupChatConversationPage.jsx:182:24
```

### 问题原因
前端在处理 WebSocket 消息时，尝试读取 `undefined.message`，说明：
1. 后端返回的消息结构与前端预期不匹配
2. 前端代码假设存在某个对象但实际为 undefined

---

## 后端 WebSocket 消息格式

### 标准消息结构
后端通过 `ChatWebSocketHandler.pushMessageToUser()` 发送的消息格式：

```json
{
  "type": "new_group_message",
  "data": {
    "messageId": 1001,
    "senderId": 1,
    "senderName": "张三",
    "senderAvatar": "http://...",
    "groupId": 1,
    "messageType": "text",
    "content": "大家好！",
    "sentTime": "2025-12-10 16:00:00",
    "isRead": false
  },
  "success": true,
  "message": null,
  "timestamp": 1702195200000
}
```

### 关键字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| type | String | 消息类型 | "new_group_message" |
| data | Object | 实际的消息数据（MessageDTO） | 见下文 |
| success | Boolean | 是否成功 | true |
| message | String | 提示消息（可能为null） | null |
| timestamp | Long | 时间戳（毫秒） | 1702195200000 |

### MessageDTO 结构

```json
{
  "messageId": 1001,
  "senderId": 1,
  "senderName": "张三",
  "senderAvatar": "http://example.com/avatar.jpg",
  "groupId": 1,
  "messageType": "text",
  "content": "消息内容",
  "mediaUrl": null,
  "sentTime": "2025-12-10 16:00:00",
  "isRead": false
}
```

---

## 前端处理方式

### ❌ 错误的处理方式

```javascript
// 错误1：假设 data 有 message 属性
wsService.on('new_group_message', (data) => {
  console.log(data.message);  // ❌ data 是 MessageDTO，没有 message 字段
});

// 错误2：没有检查 data 是否存在
wsService.on('new_group_message', (data) => {
  console.log(data.content);  // ❌ 如果 data 是 undefined 会报错
});

// 错误3：混淆了外层的 message 和 data
wsService.on('new_group_message', (response) => {
  console.log(response.data.message);  // ❌ response.data 是 MessageDTO
});
```

### ✅ 正确的处理方式

```javascript
// 方式1：完整的 WebSocket 消息处理
wsService.on('new_group_message', (response) => {
  // response 是完整的 WebSocketResponse
  console.log('消息类型:', response.type);           // "new_group_message"
  console.log('是否成功:', response.success);        // true
  console.log('时间戳:', response.timestamp);        // 1702195200000
  
  // response.data 是 MessageDTO
  if (response.data) {
    console.log('消息ID:', response.data.messageId);
    console.log('发送者:', response.data.senderId);
    console.log('消息内容:', response.data.content);  // ✅ 这才是消息内容
    
    // 添加到消息列表
    setMessages(prev => [...prev, response.data]);
  }
});

// 方式2：只处理 data 部分（如果库已经解包）
wsService.on('new_group_message', (messageDTO) => {
  // 如果 WebSocket 库已经提取了 data 字段
  if (messageDTO) {
    console.log('消息内容:', messageDTO.content);    // ✅ 正确
    setMessages(prev => [...prev, messageDTO]);
  } else {
    console.error('收到空消息');
  }
});

// 方式3：使用可选链操作符
wsService.on('new_group_message', (response) => {
  const content = response?.data?.content;          // ✅ 安全访问
  if (content) {
    console.log('消息内容:', content);
  }
});
```

---

## 完整的前端示例代码

### React 完整示例

```javascript
import { useEffect, useState } from 'react';
import wsService from './WebSocketService';

function GroupChatConversationPage({ groupId, currentUserId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 连接 WebSocket
    wsService.connect(currentUserId);

    // 监听群消息
    const handleGroupMessage = (response) => {
      console.log('收到 WebSocket 消息:', response);

      // 检查消息结构
      if (!response) {
        console.error('❌ 收到空响应');
        return;
      }

      if (!response.data) {
        console.error('❌ 响应中没有 data 字段:', response);
        return;
      }

      // 提取消息数据
      const messageData = response.data;

      // 检查是否是当前群的消息
      if (messageData.groupId !== groupId) {
        console.log('不是当前群的消息，忽略');
        return;
      }

      // 添加到消息列表
      setMessages(prev => {
        // 防止重复
        if (prev.some(msg => msg.messageId === messageData.messageId)) {
          return prev;
        }
        return [...prev, messageData];
      });

      console.log('✅ 成功处理消息:', {
        messageId: messageData.messageId,
        content: messageData.content,
        sender: messageData.senderId
      });
    };

    // 注册消息处理器
    wsService.on('new_group_message', handleGroupMessage);

    // 清理
    return () => {
      wsService.off('new_group_message', handleGroupMessage);
    };
  }, [groupId, currentUserId]);

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.messageId}>
          <span>{msg.senderName}: </span>
          <span>{msg.content}</span>
        </div>
      ))}
    </div>
  );
}
```

### Vue 3 完整示例

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import wsService from './WebSocketService';

export default {
  setup() {
    const messages = ref([]);
    const groupId = ref(1);
    const currentUserId = ref(1);

    const handleGroupMessage = (response) => {
      console.log('收到 WebSocket 消息:', response);

      // 安全检查
      if (!response?.data) {
        console.error('❌ 无效的消息格式');
        return;
      }

      const messageData = response.data;

      // 检查群ID
      if (messageData.groupId !== groupId.value) {
        return;
      }

      // 添加消息
      messages.value.push(messageData);

      console.log('✅ 成功处理消息');
    };

    onMounted(() => {
      wsService.connect(currentUserId.value);
      wsService.on('new_group_message', handleGroupMessage);
    });

    onUnmounted(() => {
      wsService.off('new_group_message', handleGroupMessage);
    });

    return {
      messages
    };
  }
};
```

---

## WebSocket 消息类型列表

### 群聊相关消息

| 消息类型 | 说明 | data 内容 |
|---------|------|-----------|
| new_group_message | 新群消息 | MessageDTO |
| group_invitation | 群邀请通知 | GroupChatDTO |
| member_joined | 新成员加入 | { groupId, userId, username } |
| member_left | 成员退出 | { groupId, userId, username } |
| member_kicked | 成员被踢 | { groupId, userId, reason } |
| group_disbanded | 群解散 | { groupId, operatorId } |
| typing_status | 正在输入 | { userId, groupId, isTyping } |

### 私聊相关消息

| 消息类型 | 说明 | data 内容 |
|---------|------|-----------|
| new_message | 新私聊消息 | MessageDTO |
| message_recalled | 消息撤回 | { messageId } |
| friend_online_status | 好友上线状态 | { userId, isOnline } |

---

## 调试技巧

### 1. 打印完整的消息结构

```javascript
wsService.on('new_group_message', (response) => {
  console.log('=== WebSocket 消息详情 ===');
  console.log('完整响应:', JSON.stringify(response, null, 2));
  console.log('类型:', response?.type);
  console.log('数据:', response?.data);
  console.log('成功状态:', response?.success);
  console.log('=======================');
});
```

### 2. 使用类型检查

```javascript
wsService.on('new_group_message', (response) => {
  console.log('response 类型:', typeof response);
  console.log('response.data 类型:', typeof response?.data);
  console.log('response.data 内容:', response?.data);
  
  if (!response) {
    console.error('❌ response 是 undefined 或 null');
    return;
  }
  
  if (!response.data) {
    console.error('❌ response.data 不存在，完整 response:', response);
    return;
  }
});
```

### 3. 捕获错误

```javascript
wsService.on('new_group_message', (response) => {
  try {
    // 安全的访问方式
    const content = response?.data?.content ?? '(无内容)';
    const senderId = response?.data?.senderId ?? 0;
    
    console.log(`收到消息: ${content} (来自 ${senderId})`);
    
    // 业务逻辑
    if (response?.data) {
      setMessages(prev => [...prev, response.data]);
    }
  } catch (error) {
    console.error('❌ 处理消息时出错:', error);
    console.error('问题消息:', response);
  }
});
```

---

## 常见问题排查

### Q1: 为什么 response.data 是 undefined？

**可能原因**：
1. 后端发送消息时 data 字段为 null
2. WebSocket 库解析消息失败
3. 消息在传输过程中被截断

**排查方法**：
```javascript
ws.onmessage = (event) => {
  console.log('原始消息:', event.data);
  
  try {
    const parsed = JSON.parse(event.data);
    console.log('解析后:', parsed);
  } catch (e) {
    console.error('解析失败:', e);
  }
};
```

### Q2: 为什么消息重复收到？

**可能原因**：
1. 多次注册了相同的处理器
2. 没有正确清理旧的监听器

**解决方案**：
```javascript
useEffect(() => {
  const handler = (response) => { /* ... */ };
  
  wsService.on('new_group_message', handler);
  
  // 清理：必须！
  return () => {
    wsService.off('new_group_message', handler);
  };
}, []);  // 确保依赖项正确
```

### Q3: 如何知道后端发送的消息格式？

**方法1**：查看后端日志
```java
log.info("推送群消息: {}", objectMapper.writeValueAsString(response));
```

**方法2**：使用浏览器开发者工具
1. 打开 Network 标签
2. 筛选 WS (WebSocket)
3. 查看 Messages 子标签
4. 点击消息查看原始内容

---

## 后端需要修改的地方

### ✅ 已修复

1. **添加了 GroupMemberRepository 依赖**
   ```java
   private final GroupMemberRepository groupMemberRepository;
   ```

2. **完善了 pushMessageToGroup 方法**
   ```java
   public void pushMessageToGroup(Long groupId, String messageType, Object data) {
       List<GroupMember> members = groupMemberRepository.findByGroupIdAndMemberStatus(groupId, "active");
       members.forEach(member -> {
           pushMessageToUser(member.getUserId(), messageType, data);
       });
   }
   ```

### 建议改进

1. **添加更多日志**
   ```java
   public void pushMessageToUser(Long userId, String messageType, Object data) {
       log.info("推送消息给用户: userId={}, type={}, data={}", 
                userId, messageType, 
                data != null ? data.getClass().getSimpleName() : "null");
       // ... 现有代码
   }
   ```

2. **统一消息格式**
   ```java
   WebSocketResponse response = WebSocketResponse.builder()
           .type(messageType)
           .data(data)
           .success(true)
           .message("消息推送成功")  // 添加 message 字段
           .timestamp(System.currentTimeMillis())
           .build();
   ```

---

## 前端需要修改的地方

### GroupChatConversationPage.jsx 第182行

**修改前（错误）**：
```javascript
wsService.on('new_group_message', (data) => {
  console.log(data.message);  // ❌ data 可能是 undefined
});
```

**修改后（正确）**：
```javascript
wsService.on('new_group_message', (response) => {
  if (!response?.data) {
    console.error('❌ 无效的消息格式:', response);
    return;
  }
  
  const messageData = response.data;
  console.log('✅ 收到消息:', messageData.content);
  
  // 继续处理...
});
```

---

## 测试步骤

### 1. 测试后端 WebSocket

使用浏览器控制台：
```javascript
const ws = new WebSocket('ws://localhost:8082/ws/chat?userId=1&token=xxx');

ws.onopen = () => {
  console.log('✅ WebSocket 连接成功');
};

ws.onmessage = (event) => {
  console.log('📨 收到消息:', event.data);
  const data = JSON.parse(event.data);
  console.log('解析后:', data);
};

ws.onerror = (error) => {
  console.error('❌ WebSocket 错误:', error);
};
```

### 2. 测试发送群消息

```bash
curl -X POST http://localhost:8082/api/group/1/send-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "senderId": 1,
    "messageType": "text",
    "content": "测试消息"
  }'
```

### 3. 检查后端日志

应该看到类似的日志：
```
推送群消息: groupId=1, messageType=new_group_message, memberCount=5
推送消息给用户: userId=2, type=new_group_message
推送消息给用户: userId=3, type=new_group_message
```

---

## 总结

### 问题根源
- ✅ 后端 `pushMessageToGroup` 方法未实现（已修复）
- ⚠️ 前端处理 WebSocket 消息时没有做 null/undefined 检查

### 解决方案
1. **后端**：完善 `pushMessageToGroup` 方法（已完成）
2. **前端**：添加消息格式验证和 null 检查

### 正确的消息访问路径
```javascript
// ✅ 正确
response.data.content        // 消息内容
response.data.messageId      // 消息ID
response.data.senderId       // 发送者ID

// ❌ 错误
response.message             // 这是提示消息，可能为 null
response.data.message        // MessageDTO 没有这个字段
data.content                 // data 可能是 undefined
```

---

**文档更新时间**：2025-12-10 15:35

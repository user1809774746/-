# WebSocket 消息格式修复说明

## ✅ 已修复的问题

### 问题描述
之前后端通过 WebSocket 发送的消息缺少关键字段：
- ❌ `data.senderId` - 发送者ID
- ❌ `data.messageId` - 消息ID
- ❌ `data.timestamp` - 消息时间戳

### 修复内容

#### 1. **修改 `ChatWebSocketHandler.handleSendMessage` 方法**
**文件**: `src/main/java/com/example/chat/websocket/ChatWebSocketHandler.java`

**修改前**：
```java
// 直接推送原始数据（Map），缺少 messageId 和 senderId
pushMessageToUser(receiverId, "new_message", data);
```

**修改后**：
```java
// 调用 ChatService 保存消息，获取完整的 MessageDTO
com.example.chat.dto.ChatDTOs.SendMessageRequest request = 
    new com.example.chat.dto.ChatDTOs.SendMessageRequest();
request.setSenderId(userId);
request.setReceiverId(receiverId);
request.setContent(content);
request.setMessageType(messageType);

com.example.common.result.Result<?> result = chatService.sendMessage(request);
com.example.chat.dto.ChatDTOs.MessageDTO messageDTO = 
    (com.example.chat.dto.ChatDTOs.MessageDTO) result.getData();

// 推送完整的 MessageDTO（包含所有字段）
pushMessageToUser(receiverId, "new_message", messageDTO);
```

#### 2. **在 `MessageDTO` 中添加 `timestamp` 字段**
**文件**: `src/main/java/com/example/chat/dto/ChatDTOs.java`

```java
public static class MessageDTO {
    private Long messageId;
    private Long senderId;        // ✅ 已有
    private String senderName;
    private Long receiverId;
    private String messageType;
    private String content;
    private LocalDateTime sentTime;
    private Long timestamp;       // ✅ 新增：毫秒级时间戳
    private Long replyToMessageId;
    private Boolean isRead;
    // ... 其他字段
}
```

#### 3. **在 `ChatServiceImpl.sendMessage` 中设置 `timestamp`**
**文件**: `src/main/java/com/example/chat/service/impl/ChatServiceImpl.java`

```java
MessageDTO messageDTO = MessageDTO.builder()
    .messageId(savedMessage.getId())
    .senderId(savedMessage.getSenderId())
    .receiverId(savedMessage.getReceiverId())
    .content(savedMessage.getContent())
    .messageType(savedMessage.getMessageType())
    .sentTime(savedMessage.getCreatedAt())
    .timestamp(System.currentTimeMillis())  // ✅ 新增
    .senderName(sender.getUsername())
    .isRead(false)
    .build();
```

---

## 📋 现在的消息格式

### 1. 新消息通知 (`new_message`)

```json
{
  "type": "new_message",
  "success": true,
  "timestamp": 1763539646940,
  "data": {
    "messageId": 123456,           // ✅ 消息ID
    "senderId": 1,                 // ✅ 发送者ID
    "senderName": "张三",           // ✅ 发送者昵称
    "receiverId": 3,               // ✅ 接收者ID
    "messageType": "text",         // ✅ 消息类型
    "content": "你好你好",          // ✅ 消息内容
    "sentTime": "2025-11-19 16:14:06",  // ✅ 格式化时间
    "timestamp": 1763539646940,    // ✅ 毫秒时间戳
    "replyToMessageId": null,      // ✅ 回复的消息ID
    "isRead": false                // ✅ 是否已读
  }
}
```

### 2. 消息发送成功响应 (`send_message_success`)

```json
{
  "type": "send_message_success",
  "success": true,
  "message": "消息发送成功",
  "timestamp": 1763539646940,
  "data": {
    "messageId": 123456,
    "senderId": 1,
    "senderName": "张三",
    "receiverId": 3,
    "messageType": "text",
    "content": "你好你好",
    "sentTime": "2025-11-19 16:14:06",
    "timestamp": 1763539646940,
    "isRead": false
  }
}
```

### 3. 群消息通知 (`new_group_message`)

```json
{
  "type": "new_group_message",
  "success": true,
  "timestamp": 1763539646940,
  "data": {
    "messageId": 123456,
    "senderId": 1,
    "senderName": "张三",
    "groupId": 10,
    "messageType": "text",
    "content": "大家好！",
    "sentTime": "2025-11-19 16:14:06",
    "timestamp": 1763539646940,
    "isRead": false
  }
}
```

---

## 🧪 测试步骤

### 1. 重启后端服务
修改代码后需要重启后端服务：
```bash
# 停止当前服务
# 重新启动
mvn spring-boot:run
```

### 2. 使用 Postman 测试

#### 步骤1：连接 WebSocket
```
ws://localhost:8082/ws/chat/native?userId=1
```

#### 步骤2：发送测试消息
```json
{
  "type": "send_message",
  "data": {
    "receiverId": 2,
    "content": "测试消息格式",
    "messageType": "text"
  },
  "timestamp": 1763539646940
}
```

#### 步骤3：检查响应

**发送者收到的响应**：
```json
{
  "type": "send_message_success",
  "success": true,
  "message": "消息发送成功",
  "timestamp": 1763539646940,
  "data": {
    "messageId": 123,          // ✅ 有消息ID
    "senderId": 1,             // ✅ 有发送者ID
    "senderName": "用户1",     // ✅ 有发送者昵称
    "receiverId": 2,
    "content": "测试消息格式",
    "messageType": "text",
    "timestamp": 1763539646940 // ✅ 有时间戳
  }
}
```

**接收者收到的消息**（如果userId=2也在线）：
```json
{
  "type": "new_message",
  "success": true,
  "timestamp": 1763539646940,
  "data": {
    "messageId": 123,
    "senderId": 1,
    "senderName": "用户1",
    "receiverId": 2,
    "content": "测试消息格式",
    "messageType": "text",
    "timestamp": 1763539646940
  }
}
```

### 3. 验证字段完整性

确认返回的消息包含以下关键字段：
- ✅ `data.messageId` - 消息唯一ID
- ✅ `data.senderId` - 发送者用户ID
- ✅ `data.senderName` - 发送者用户名
- ✅ `data.receiverId` 或 `data.groupId` - 接收者或群组ID
- ✅ `data.content` - 消息内容
- ✅ `data.messageType` - 消息类型
- ✅ `data.timestamp` - 毫秒级时间戳
- ✅ `data.sentTime` - 格式化时间（可选）

---

## 🔍 调试技巧

### 查看后端日志

在后端控制台中应该看到：

```
收到WebSocket消息: {"type":"send_message","data":{...}}
消息类型: [send_message], 数据: {...}
消息发送成功: messageId=123
WebSocket消息发送成功: messageId=123
已推送消息给用户: receiverId=2
```

### 使用 Postman 的 Console

打开 Postman Console（View → Show Postman Console）查看：
- 发送的消息内容
- 接收到的响应
- WebSocket 连接状态

---

## 📝 字段说明

| 字段名 | 类型 | 必须 | 说明 |
|--------|------|------|------|
| `messageId` | Long | ✅ | 消息唯一ID，用于去重和已读回执 |
| `senderId` | Long | ✅ | 发送者用户ID |
| `senderName` | String | ✅ | 发送者用户名 |
| `receiverId` | Long | ⚠️ | 接收者ID（私聊必须） |
| `groupId` | Long | ⚠️ | 群组ID（群聊必须） |
| `messageType` | String | ✅ | 消息类型：text/image/voice/video/file |
| `content` | String | ✅ | 消息内容 |
| `timestamp` | Long | ✅ | 毫秒级时间戳 |
| `sentTime` | String | 可选 | 格式化时间字符串 |
| `replyToMessageId` | Long | 可选 | 回复的消息ID |
| `isRead` | Boolean | ✅ | 是否已读 |

---

## ⚠️ 注意事项

### 1. 数据库持久化
确保消息已正确保存到数据库，包含：
- `message_id` (主键)
- `sender_id` (发送者)
- `receiver_id` (接收者)
- `content` (内容)
- `message_type` (类型)
- `created_at` (创建时间)

### 2. 并发处理
- 同一用户可能有多个 WebSocket 连接（多设备）
- 所有连接都会收到新消息通知
- 使用 `Map<Long, Set<WebSocketSession>>` 管理连接

### 3. 消息去重
- 前端使用 `messageId` 进行去重
- 确保每条消息的 `messageId` 唯一
- 数据库主键保证唯一性

### 4. 已读回执
- 前端发送 `read_message` 时使用 `messageId`
- 后端更新数据库的 `is_read` 状态
- 通知发送者消息已读

---

## ✅ 验收标准

修复完成后，WebSocket 消息应满足：
- ✅ 包含 `data.senderId`
- ✅ 包含 `data.messageId`
- ✅ 包含 `data.timestamp`
- ✅ 前端能正确显示消息
- ✅ 消息不会重复显示
- ✅ 已读回执功能正常
- ✅ 发送者能收到完整的消息确认

---

## 🎯 前端兼容性

修复后的消息格式完全兼容前端需求，前端可以：

```javascript
// 接收新消息
ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    
    if (response.type === 'new_message') {
        const message = response.data;
        
        // ✅ 所有字段都存在
        console.log('消息ID:', message.messageId);
        console.log('发送者:', message.senderId, message.senderName);
        console.log('内容:', message.content);
        console.log('时间:', message.timestamp);
        
        // 添加到聊天记录
        addMessageToChat(message);
    }
};
```

---

## 📞 问题反馈

如果测试中发现问题，请检查：
1. 后端服务是否已重启
2. 后端日志中是否有错误信息
3. Postman Console 中的完整消息内容
4. 数据库中消息是否正确保存

提供以下信息有助于排查：
- 完整的 WebSocket 请求消息
- 完整的响应消息
- 后端日志片段
- 数据库中的消息记录

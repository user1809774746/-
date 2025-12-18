# 🔧 N8N接口格式完全适配说明

> **修改日期**: 2025-11-02  
> **修改内容**: 完全适配n8n要求的接口格式  
> **状态**: ✅ 已完成

---

## 📋 修改概述

### n8n要求的输入格式

```json
{
  "sessionId": "20ad2be816034cfb8bb6de6685d61445",
  "action": "sendMessage",
  "chatInput": "你好"
}
```

**说明**:
- `sessionId` - 会话ID（由前端提供）
- `action` - 固定值 `"sendMessage"`
- `chatInput` - 用户输入的聊天内容（由前端提供）

### 前端发送的数据格式

```json
{
  "user_id": "a123",
  "sessionId": "20ad2be816034cfb8bb6de6685d61445",
  "chatInput": "你好"
}
```

**说明**:
- `user_id` - 用户ID（用于数据库存储）
- `sessionId` - 会话ID
- `chatInput` - 聊天内容

---

## 🔧 代码修改详情

### 1️⃣ ChatRequest.java - DTO字段调整

**修改前**:
```java
@Data
public class ChatRequest {
    private String userId;
    private String sessionId;
    private String message;
}
```

**修改后**:
```java
@Data
public class ChatRequest {
    @JsonProperty("user_id")
    private String userId;  // JSON字段名为user_id，Java字段名为userId
    
    private String sessionId;
    
    @JsonProperty("chatInput")
    private String chatInput;  // 改为chatInput
}
```

**关键改变**:
- ✅ 使用 `@JsonProperty("user_id")` 支持前端的 `user_id` 字段名
- ✅ 将 `message` 改为 `chatInput`
- ✅ Java内部仍使用驼峰命名（userId），JSON序列化时自动转换

### 2️⃣ ChatService.java - n8n调用格式调整

**修改前**:
```java
Map<String, Object> payload = Map.of(
    "sessionId", request.getSessionId(),
    "message", request.getMessage()
);
```

**修改后**:
```java
Map<String, Object> payload = Map.of(
    "sessionId", request.getSessionId(),
    "action", "sendMessage",  // ✅ 添加固定的action字段
    "chatInput", request.getChatInput()  // ✅ 使用chatInput
);
```

**发送给n8n的完整数据**:
```json
{
  "sessionId": "20ad2be816034cfb8bb6de6685d61445",
  "action": "sendMessage",
  "chatInput": "你好"
}
```

### 3️⃣ ChatController.java - 参数验证更新

**修改前**:
```java
if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
    return ResponseDTO.error(400, "消息内容不能为空");
}
```

**修改后**:
```java
if (request.getChatInput() == null || request.getChatInput().trim().isEmpty()) {
    return ResponseDTO.error(400, "消息内容不能为空");
}
```

---

## 📊 完整的数据流

### 数据流转图

```
前端发送:
{
  "user_id": "a123",
  "sessionId": "20ad2be816034cfb8bb6de6685d61445",
  "chatInput": "你好"
}
  ↓
后端接收 (ChatController)
  - userId: "a123"  (Java字段名)
  - sessionId: "20ad2be816034cfb8bb6de6685d61445"
  - chatInput: "你好"
  ↓
保存到数据库 (chat_history表)
  - user_id: "a123"  ✅
  - session_id: "20ad2be816034cfb8bb6de6685d61445"  ✅
  - message: "你好"  ✅
  ↓
发送给n8n webhook:
{
  "sessionId": "20ad2be816034cfb8bb6de6685d61445",  ✅
  "action": "sendMessage",  ✅ 固定值
  "chatInput": "你好"  ✅
}
  ↓
n8n处理并返回:
{
  "text": "你好！我是AI助手..."
}
  ↓
保存AI回复到数据库:
  - user_id: "a123"  ✅
  - session_id: "20ad2be816034cfb8bb6de6685d61445"  ✅
  - message: "你好！我是AI助手..."  ✅
  ↓
返回给前端:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "reply": "你好！我是AI助手...",
    "sessionId": "20ad2be816034cfb8bb6de6685d61445"
  }
}
```

---

## 🧪 测试指南

### Step 1: 重启后端服务 ⏱️ 30秒

```bash
# 在IDEA中重启Spring Boot应用
```

### Step 2: 使用Postman测试 ⏱️ 1分钟

**请求配置**:
```
Method: POST
URL: http://localhost:8081/api/chat/send

Headers:
Content-Type: application/json

Body (raw, JSON):
{
  "user_id": "a123",
  "sessionId": "20ad2be816034cfb8bb6de6685d61445",
  "chatInput": "你好"
}
```

**预期响应** ✅:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "reply": "你好！我是AI助手...",
    "sessionId": "20ad2be816034cfb8bb6de6685d61445"
  }
}
```

### Step 3: 查看后端日志 ⏱️ 30秒

**预期日志**:
```
=== 发送聊天消息 ===
SessionId: 20ad2be816034cfb8bb6de6685d61445
UserId: a123  ✅ 接收到user_id
ChatInput: 你好  ✅ 使用chatInput字段
n8n配置: 已启用
n8n URL: https://a001.app.n8n.cloud/...
✅ 用户消息已保存到数据库
⏳ 正在调用n8n webhook...
📤 发送给n8n的数据: {sessionId=20ad2be816034cfb8bb6de6685d61445, action=sendMessage, chatInput=你好}
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                     ✅ 包含sessionId, action, chatInput三个字段
✅ n8n响应成功: 你好！我是AI助手...
✅ AI回复已保存到数据库
===================
```

**关键验证点**:
- ✅ 后端正确接收 `user_id` 字段（显示为 UserId）
- ✅ 后端正确接收 `chatInput` 字段
- ✅ 发送给n8n的数据包含 `action: "sendMessage"`
- ✅ 三个字段顺序正确：sessionId, action, chatInput

### Step 4: 验证数据库记录

```sql
-- 查询最新的聊天记录
SELECT 
    id,
    session_id,
    user_id,
    message,
    created_at
FROM chat_history 
ORDER BY created_at DESC 
LIMIT 2;

-- 预期结果：
-- 记录1: session_id=20ad2be816034cfb8bb6de6685d61445, user_id=a123, message=你好
-- 记录2: session_id=20ad2be816034cfb8bb6de6685d61445, user_id=a123, message=你好！我是AI助手...
```

---

## 📄 API接口文档更新

### POST /api/chat/send

#### 请求格式

```json
{
  "user_id": "string (必填)",
  "sessionId": "string (必填)",
  "chatInput": "string (必填)"
}
```

#### 请求参数说明

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| user_id | String | ✅ | 用户ID（下划线命名） | "a123" |
| sessionId | String | ✅ | 会话ID（驼峰命名） | "20ad2be816034cfb8bb6de6685d61445" |
| chatInput | String | ✅ | 聊天内容（驼峰命名） | "你好" |

#### 发送给n8n的数据（自动转换）

```json
{
  "sessionId": "20ad2be816034cfb8bb6de6685d61445",
  "action": "sendMessage",
  "chatInput": "你好"
}
```

**转换规则**:
- `user_id` → 不传递给n8n，仅用于数据库
- `sessionId` → 直接传递给n8n
- `chatInput` → 直接传递给n8n
- `action` → 后端自动添加固定值 `"sendMessage"`

#### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "reply": "你好！我是AI助手，有什么可以帮助您的？",
    "sessionId": "20ad2be816034cfb8bb6de6685d61445"
  }
}
```

#### 失败响应

```json
{
  "code": 400,
  "message": "消息内容不能为空",
  "data": null
}
```

---

## 🎯 字段命名对照表

### 前端 ↔ 后端 ↔ n8n

| 前端字段名 | 后端Java字段名 | 数据库字段名 | 传给n8n | 说明 |
|-----------|--------------|-------------|---------|------|
| `user_id` | `userId` | `user_id` | ❌ | 用户ID，下划线命名 |
| `sessionId` | `sessionId` | `session_id` | ✅ | 会话ID，驼峰命名 |
| `chatInput` | `chatInput` | `message` | ✅ | 聊天内容，驼峰命名 |
| - | - | - | ✅ `action` | 固定值，后端添加 |

### 命名规则说明

1. **前端 JSON 字段**:
   - `user_id` - 下划线命名（与数据库一致）
   - `sessionId` - 驼峰命名（RESTful风格）
   - `chatInput` - 驼峰命名（RESTful风格）

2. **后端 Java 字段**:
   - 全部使用驼峰命名（Java规范）
   - 使用 `@JsonProperty` 注解映射JSON字段名

3. **数据库字段**:
   - 全部使用下划线命名（SQL规范）
   - `user_id`, `session_id`, `message`

4. **n8n webhook**:
   - 使用驼峰命名（RESTful风格）
   - `sessionId`, `action`, `chatInput`

---

## 💡 设计说明

### 为什么 user_id 使用下划线？

**原因**: 与数据库字段保持一致
- 数据库表 `chat_history` 中字段为 `user_id`
- 前端传递 `user_id` 更直观
- 通过 `@JsonProperty` 注解实现JSON和Java命名的转换

### 为什么添加固定的 action 字段？

**原因**: n8n workflow的要求
- n8n需要通过 `action` 字段区分不同的操作类型
- 目前只有一种操作：发送消息
- 固定值 `"sendMessage"` 由后端自动添加，前端无需传递

### 字段转换的实现

使用 Jackson 的 `@JsonProperty` 注解：

```java
@JsonProperty("user_id")
private String userId;  // JSON: user_id ↔ Java: userId
```

**优点**:
- ✅ 前端使用 `user_id`（与数据库一致）
- ✅ Java代码使用 `userId`（符合规范）
- ✅ 自动转换，无需手动处理

---

## 🔍 前端调用示例

### JavaScript / TypeScript

```javascript
// 前端代码（完整示例）
async function sendChatMessage(userId, sessionId, message) {
  try {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,      // ✅ 下划线命名
        sessionId: sessionId,  // ✅ 驼峰命名
        chatInput: message     // ✅ 驼峰命名（注意字段名）
      })
    });

    const data = await response.json();
    
    if (data.code === 200) {
      console.log('AI回复:', data.data.reply);
      return data.data.reply;
    } else {
      console.error('发送失败:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// 使用示例
sendChatMessage('a123', '20ad2be816034cfb8bb6de6685d61445', '你好')
  .then(reply => {
    console.log('收到回复:', reply);
  })
  .catch(error => {
    console.error('发送消息失败:', error);
  });
```

### React 示例

```jsx
import React, { useState } from 'react';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const userId = 'a123';
  const sessionId = '20ad2be816034cfb8bb6de6685d61445';

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,      // ✅ 注意字段名
          sessionId: sessionId,
          chatInput: message    // ✅ 注意字段名
        })
      });

      const data = await response.json();

      if (data.code === 200) {
        // 添加用户消息
        setChatHistory(prev => [...prev, {
          type: 'user',
          content: message
        }]);

        // 添加AI回复
        setChatHistory(prev => [...prev, {
          type: 'ai',
          content: data.data.reply
        }]);

        setMessage('');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  return (
    <div>
      <div className="chat-history">
        {chatHistory.map((item, index) => (
          <div key={index} className={item.type}>
            {item.content}
          </div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>发送</button>
    </div>
  );
}
```

---

## ⚠️ 重要注意事项

### 1. 字段名必须精确匹配

**正确** ✅:
```json
{
  "user_id": "a123",      // 下划线
  "sessionId": "xxx",     // 驼峰
  "chatInput": "你好"     // 驼峰
}
```

**错误** ❌:
```json
{
  "userId": "a123",       // ❌ 应该是 user_id
  "session_id": "xxx",    // ❌ 应该是 sessionId
  "message": "你好"       // ❌ 应该是 chatInput
}
```

### 2. n8n webhook配置

确保n8n workflow配置为接收：
```json
{
  "sessionId": "string",
  "action": "string",
  "chatInput": "string"
}
```

并返回：
```json
{
  "text": "AI的回复内容"
}
```

### 3. 数据库表结构

确保 `chat_history` 表包含以下字段：
```sql
CREATE TABLE chat_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ 修改确认清单

### 代码修改

- [x] 修改 `ChatRequest.java` - 添加 @JsonProperty 注解
- [x] 修改 `ChatService.java` - 更新字段引用和n8n payload
- [x] 修改 `ChatController.java` - 更新参数验证
- [x] 添加 `action: "sendMessage"` 固定字段
- [x] 代码编译通过

### 测试验证

- [ ] 重启后端服务
- [ ] 测试前端发送 `user_id` 字段
- [ ] 验证后端日志显示正确的字段
- [ ] 验证n8n收到正确的格式
- [ ] 检查数据库记录正确保存

### 文档更新

- [x] 创建接口格式适配说明文档
- [x] 更新API文档
- [x] 提供前端调用示例
- [x] 说明字段命名规则

---

## 🎉 总结

### 核心改变

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| 前端字段 | `userId`, `message` | `user_id`, `chatInput` |
| n8n字段 | `sessionId`, `message` | `sessionId`, `action`, `chatInput` |
| action字段 | ❌ 无 | ✅ 固定值 `"sendMessage"` |

### 数据流

```
前端 (user_id, sessionId, chatInput)
  ↓
后端 (userId, sessionId, chatInput)
  ↓
数据库 (user_id, session_id, message)
  ↓
n8n (sessionId, action, chatInput)
```

### 关键点

1. ✅ 使用 `@JsonProperty` 支持不同命名风格
2. ✅ `action` 固定值由后端自动添加
3. ✅ `user_id` 不传递给n8n
4. ✅ 数据库完整保存所有信息

---

**修改完成时间**: 2025-11-02  
**修改状态**: ✅ 已完成  
**需要重启**: ✅ 是  
**文档版本**: v1.0


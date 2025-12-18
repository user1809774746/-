# 🚀 N8N新格式 - 快速测试（3分钟）

> **更新时间**: 2025-11-02  
> **字段变化**: `user_id`, `chatInput`, `action`  
> **测试时间**: 3分钟

---

## ⚡ 快速测试（2步）

### Step 1: 重启后端 ⏱️ 30秒

```bash
# 在IDEA中重启Spring Boot应用
```

### Step 2: Postman测试 ⏱️ 1分钟

**复制这个请求**:

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

**点击 Send**

---

## ✅ 成功标志

### 1. API响应 ✅

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

### 2. 后端日志 ✅

```
=== 发送聊天消息 ===
SessionId: 20ad2be816034cfb8bb6de6685d61445
UserId: a123  ✅
ChatInput: 你好  ✅
📤 发送给n8n的数据: {sessionId=20ad2be816034cfb8bb6de6685d61445, action=sendMessage, chatInput=你好}
                                                                   ^^^^^^^^^^^^^^^^^^^^^^
                                                                   ✅ action字段已添加
✅ n8n响应成功
```

**关键验证点**:
- ✅ UserId 显示为 `a123`
- ✅ ChatInput 显示为 `你好`
- ✅ 发送给n8n的数据包含 `action=sendMessage`

---

## 🎯 字段对照表（必看）

### 前端发送格式（新）

```json
{
  "user_id": "a123",        ✅ 下划线命名
  "sessionId": "xxx",       ✅ 驼峰命名
  "chatInput": "你好"       ✅ 驼峰命名（改了！）
}
```

### 发送给n8n的格式（新）

```json
{
  "sessionId": "xxx",       ✅
  "action": "sendMessage",  ✅ 固定值（新增！）
  "chatInput": "你好"       ✅
}
```

---

## ❌ 常见错误

### 错误1: 使用旧字段名

```json
{
  "userId": "a123",    ❌ 应该是 user_id
  "message": "你好"    ❌ 应该是 chatInput
}
```

**解决**: 必须使用新字段名！

### 错误2: 后端未重启

**症状**: 仍然显示旧字段名

**解决**: 
```bash
1. 停止后端（IDEA中点击红色方块）
2. 重新启动（点击绿色三角）
```

### 错误3: n8n收不到数据

**检查**: 后端日志应该显示
```
📤 发送给n8n的数据: {..., action=sendMessage, chatInput=...}
```

如果没有这行日志，说明后端未重启。

---

## 📋 完整测试用例

### 测试1: 基础对话

**请求**:
```json
{
  "user_id": "a123",
  "sessionId": "test001",
  "chatInput": "你好"
}
```

**预期**: AI正常回复

### 测试2: 长文本

**请求**:
```json
{
  "user_id": "a123",
  "sessionId": "test002",
  "chatInput": "帮我规划一下去京都的三日游，包括住宿、交通和必去景点"
}
```

**预期**: AI详细回复旅游规划

### 测试3: 连续对话

发送多条消息，验证sessionId保持对话上下文：

```json
// 消息1
{
  "user_id": "a123",
  "sessionId": "session123",
  "chatInput": "我想去日本旅游"
}

// 消息2（相同sessionId）
{
  "user_id": "a123",
  "sessionId": "session123",
  "chatInput": "推荐一下京都的景点"
}

// 消息3（相同sessionId）
{
  "user_id": "a123",
  "sessionId": "session123",
  "chatInput": "住宿推荐呢？"
}
```

AI应该能记住前面的对话内容。

---

## 🔍 验证数据库

```sql
-- 查询最新记录
SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 2;

-- 应该看到：
-- user_id = a123  ✅
-- session_id = 你发送的sessionId  ✅
-- message = 聊天内容  ✅
```

---

## 🎓 前端集成示例

### 基础版本

```javascript
async function sendMessage(message) {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: 'a123',              // ✅ 注意下划线
      sessionId: 'session123',
      chatInput: message            // ✅ 注意字段名
    })
  });
  
  const data = await response.json();
  console.log('AI回复:', data.data.reply);
}
```

### 完整版本（带错误处理）

```javascript
async function sendChatMessage(userId, sessionId, message) {
  try {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,           // ✅
        sessionId: sessionId,
        chatInput: message         // ✅
      })
    });

    const data = await response.json();

    if (data.code === 200) {
      return {
        success: true,
        reply: data.data.reply,
        sessionId: data.data.sessionId
      };
    } else {
      return {
        success: false,
        error: data.message
      };
    }
  } catch (error) {
    console.error('发送失败:', error);
    return {
      success: false,
      error: '网络错误'
    };
  }
}

// 使用
const result = await sendChatMessage('a123', 'session123', '你好');
if (result.success) {
  console.log('AI:', result.reply);
} else {
  console.error('错误:', result.error);
}
```

---

## 💡 重要提示

### 字段名对照

| 旧字段名 | 新字段名 | 说明 |
|---------|---------|------|
| `userId` | `user_id` | 改为下划线 |
| `message` | `chatInput` | 改为驼峰 |
| - | `action` | 后端自动添加 |

### 前端需要改的地方

```javascript
// ❌ 旧代码
{
  userId: "a123",
  message: "你好"
}

// ✅ 新代码
{
  user_id: "a123",     // 改了！
  chatInput: "你好"    // 改了！
}
```

### 后端自动处理

- ✅ 自动添加 `action: "sendMessage"`
- ✅ 自动保存到数据库
- ✅ user_id 不传给n8n

---

## ⏱️ 测试检查清单

### 启动前

- [ ] 代码已编译
- [ ] 后端服务已停止

### 测试中

- [ ] 后端已重新启动
- [ ] 发送测试消息（包含 user_id 和 chatInput）
- [ ] 查看后端日志
- [ ] 验证n8n收到正确格式

### 成功标准

- [ ] API返回 code: 200
- [ ] 日志显示 action=sendMessage
- [ ] AI正常回复
- [ ] 数据库正确保存

---

## 🆘 遇到问题？

### 问题：字段名错误

**错误信息**: "用户ID不能为空" 或 "消息内容不能为空"

**原因**: 使用了旧字段名

**解决**: 检查字段名
- ✅ `user_id` (不是 userId)
- ✅ `chatInput` (不是 message)

### 问题：后端日志没有 action 字段

**原因**: 后端未重启

**解决**: 完全停止并重新启动后端

### 问题：n8n收不到消息

**检查**: 
1. 后端日志是否显示 "📤 发送给n8n的数据"
2. 数据中是否包含 `action=sendMessage`
3. n8n webhook地址是否正确

---

**测试指南版本**: v1.0  
**最后更新**: 2025-11-02  
**预计测试时间**: 3分钟

---

## 🎉 快速记忆

**三个关键字段**:
1. `user_id` - 下划线
2. `chatInput` - 驼峰
3. `action` - 后端自动加

**测试口诀**: 重启后端，改字段名，看日志有action！


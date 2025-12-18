# 聊天接口 API 文档

## 基础信息

**Base URL:** `http://your-backend-url/api/chat`

**认证方式:** Bearer Token (JWT)

**Content-Type:** `application/json`

---

## 接口列表

### 1. 发送聊天消息

**接口描述:** 发送用户消息到 n8n 工作流，获取 AI 回复；如生成旅行计划则返回对应的 travelPlanId 和 travelPlan 数据

**请求方式:** `POST /send`

**请求头:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sessionId | String | 是 | 会话ID，用于区分不同对话 |
| userId | String | 是 | 用户ID |
| chatInput | String | 是 | 用户输入的消息内容 |

**请求示例:**
```json
{
  "sessionId": "session_123456",
  "userId": "user_001",
  "chatInput": "我想去上海旅游，有什么推荐吗？"
}
```

**响应示例:**

成功响应 (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reply": "上海是一个非常适合旅游的城市...",
    "travelPlanId": 123,
    "travelPlan": {
      "title": "上海3日游轻松行程",
      "destination": "上海",
      "travel_days": 3
    }
  }
}
```

错误响应 (400):
```json
{
  "code": 400,
  "message": "消息内容不能为空",
  "data": null
}
```

错误响应 (401):
```json
{
  "code": 401,
  "message": "请先登录",
  "data": null
}
```

错误响应 (500):
```json
{
  "code": 500,
  "message": "发送消息失败: 连接超时",
  "data": null
}
```

---

### 2. 获取聊天历史记录

**接口描述:** 根据会话ID获取该会话的所有历史消息

**请求方式:** `GET /history`

**请求头:**
```
Authorization: Bearer {token}
```

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sessionId | String | 是 | 会话ID (Query参数) |

**请求示例:**
```
GET /api/chat/history?sessionId=session_123456
```

**响应示例:**

成功响应 (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sessionId": "session_123456",
    "total": 5,
    "messages": [
      {
        "id": 1,
        "sessionId": "session_123456",
        "userId": "user_001",
        "userMessage": "我想去上海旅游",
        "aiResponse": "上海是一个非常适合旅游的城市...",
        "timestamp": "2025-01-02T10:30:00"
      },
      {
        "id": 2,
        "sessionId": "session_123456",
        "userId": "user_001",
        "userMessage": "有什么景点推荐？",
        "aiResponse": "推荐您游览外滩、东方明珠...",
        "timestamp": "2025-01-02T10:31:00"
      }
    ]
  }
}
```

错误响应 (400):
```json
{
  "code": 400,
  "message": "会话ID不能为空",
  "data": null
}
```

错误响应 (500):
```json
{
  "code": 500,
  "message": "获取历史记录失败: 数据库连接错误",
  "data": null
}
```

---

### 3. 流式聊天（转发 n8n 流式响应）

**接口描述:** 将用户消息转发到支持流式输出的 n8n 工作流，后端不解析响应体，而是直接将 n8n 的 HTTP 响应流转发给前端，前端可以逐字接收并渲染。

**请求方式:** `POST /stream`

**请求头:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sessionId | String | 是 | 会话ID，用于区分不同对话 |
| userId | String | 是 | 用户ID |
| chatInput | String | 是 | 用户输入的消息内容 |

**请求示例:**
```json
{
  "sessionId": "session_123456",
  "userId": "user_001",
  "chatInput": "请逐字输出给我一个上海三日游的行程建议"
}
```

**响应说明:**

- 本接口不返回包装好的 JSON，而是直接将 n8n 的 HTTP 响应流（如 `text/event-stream` 或 chunked 文本）原样透传给前端。
- 前端可通过 `fetch` + `ReadableStream` 或 SSE (`EventSource`) 等方式逐块读取并展示内容。
- 若 n8n 未启用或配置错误，接口会返回 `503 Service Unavailable` 文本提示；调用失败时可能返回 `500` 文本错误信息。

---

## 数据模型

### ChatMessage 对象

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 消息ID |
| sessionId | String | 会话ID |
| userId | String | 用户ID |
| userMessage | String | 用户发送的消息 |
| aiResponse | String | AI的回复 |
| timestamp | DateTime | 消息时间戳 |
| createdAt | DateTime | 创建时间 |

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 500 | 服务器内部错误 |

---

## 使用示例

### JavaScript (Fetch API)

```javascript
// 发送消息
async function sendMessage(sessionId, userId, message) {
  const response = await fetch('http://your-backend-url/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sessionId: sessionId,
      userId: userId,
      chatInput: message
    })
  });
  
  const data = await response.json();
  return data;
}

// 流式聊天（逐字输出示例）
async function streamChat(sessionId, userId, message) {
  const response = await fetch('http://your-backend-url/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sessionId: sessionId,
      userId: userId,
      chatInput: message
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    // 将 chunk 追加到页面上，实现逐字显示
    console.log(chunk);
  }
}

// 获取历史记录
async function getChatHistory(sessionId) {
  const response = await fetch(
    `http://your-backend-url/api/chat/history?sessionId=${sessionId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data;
}
```

### Python (Requests)

```python
import requests

# 发送消息
def send_message(session_id, user_id, message, token):
    url = "http://your-backend-url/api/chat/send"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    data = {
        "sessionId": session_id,
        "userId": user_id,
        "chatInput": message
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# 获取历史记录
def get_chat_history(session_id, token):
    url = f"http://your-backend-url/api/chat/history?sessionId={session_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(url, headers=headers)
    return response.json()
```

---

## 注意事项

1. **会话管理**: 
   - sessionId 用于区分不同的对话会话
   - 建议在前端生成唯一的 sessionId (如 UUID)
   - 同一个 sessionId 的消息会被关联在一起

2. **认证要求**:
   - 所有接口都需要在请求头中携带有效的 JWT Token
   - Token 通过登录接口获取

3. **消息限制**:
   - 单条消息建议不超过 2000 字符
   - 历史记录默认返回该会话的所有消息

4. **n8n 集成**:
   - 后端会将消息转发到 n8n 工作流
   - 确保 n8n 服务正常运行
   - 响应时间取决于 n8n 处理速度
   - 当使用 `/stream` 接口时，后端会直接转发 n8n 的流式 HTTP 响应（例如 SSE / chunked 文本），不做结构解析

5. **错误处理**:
   - 建议在前端实现重试机制
   - 超时时间建议设置为 30 秒

### /send 与 /stream 使用建议

- **优先使用 `/send` 的场景**:
  - 需要一个结构化的 JSON 响应（包含 `reply`、`travelPlanId`、`travelPlan` 等字段），便于前端直接解析和展示；
  - 希望所有问答都自动写入数据库历史记录，便于后续查询；
  - 对实时逐字显示没有强需求，只需要一次性拿到完整回答即可。

- **优先使用 `/stream` 的场景**:
  - 希望前端实现类似“逐字输出 / 打字机”效果，需要实时接收 n8n 的流式响应；
  - 能接受后端不返回包装好的 JSON，而是直接接收 n8n 的原始流（例如 SSE / 文本流），由前端自行解析和渲染；
  - 当前实现中，`/stream` 只负责转发流式响应，不会自动保存聊天历史或旅行计划，如需落库可在流式结束后根据需要自行调用其他接口或触发保存逻辑。

---

## 更新日志

### v1.1.0 (2025-11-27)
- 新增 `/api/chat/stream` 流式聊天接口，用于转发 n8n 的流式 HTTP 响应
- 文档补充流式聊天接口的说明及前端使用示例

### v1.0.0 (2025-01-02)
- 初始版本发布
- 支持发送消息和获取历史记录功能

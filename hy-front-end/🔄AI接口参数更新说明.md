# 🔄 AI接口参数更新说明

## 📝 更新内容

### 后端要求的新参数格式

```json
{
  "user_id": "a123",                                    // ⚠️ 改为 user_id（下划线命名）
  "sessionId": "20ad2be816034cfb8bb6de6685d61445",     // ✅ 保持不变
  "chatInput": "你好"                                   // ⚠️ 改为 chatInput
}
```

### 原来的参数格式

```json
{
  "userId": "user_001",        // ❌ 旧名称
  "sessionId": "abc123",       // ✅ 保持不变
  "message": "帮我规划一下"     // ❌ 旧名称
}
```

---

## 🔧 修改内容

### 文件：`src/api/config.js`

#### 修改位置：第946-955行

**修改前：**
```javascript
export const sendChatMessage = async (userId, sessionId, message) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_SEND, {
    method: 'POST',
    body: JSON.stringify({
      userId,        // ❌ 旧参数名
      sessionId,
      message        // ❌ 旧参数名
    })
  });
};
```

**修改后：**
```javascript
export const sendChatMessage = async (userId, sessionId, message) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_SEND, {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,      // ✅ 新参数名（下划线命名）
      sessionId: sessionId,
      chatInput: message    // ✅ 新参数名
    })
  });
};
```

---

## 📊 参数对照表

| 功能 | 原参数名 | 新参数名 | 类型 | 说明 |
|------|---------|---------|------|------|
| 用户ID | `userId` | `user_id` | string | 改为下划线命名 |
| 会话ID | `sessionId` | `sessionId` | string | **保持不变** |
| 消息内容 | `message` | `chatInput` | string | 改为 chatInput |

---

## ✅ 兼容性说明

### 前端代码无需修改

**为什么？** 因为我们保持了函数签名不变：

```javascript
// ✅ 前端调用方式完全不变
sendChatMessage(userId, sessionId, message)
```

**内部处理：** 函数内部自动将参数映射到后端要求的格式：
- `userId` → `user_id`
- `message` → `chatInput`

### 现有代码继续有效

所有使用 `sendChatMessage` 的地方都无需修改：

```javascript
// ✅ AiPage_N8N.jsx - 无需修改
const response = await sendChatMessage(userId, sessionId, currentInput);

// ✅ 测试连接 - 无需修改
const response = await sendChatMessage(userId, testSessionId, '你好');
```

---

## 🧪 测试验证

### 测试步骤

1. **打开 AI 助手页面**
   - 点击首页的 AI 规划助手

2. **查看控制台输出**
   ```
   📤 发送消息到后端: {
     userId: "user_1234567890",
     sessionId: "user_1234567890_1699876543210",
     message: "你好"
   }
   ```

3. **验证网络请求**
   - 打开浏览器开发者工具 → Network
   - 发送一条消息
   - 查看 `POST /api/chat/send` 请求
   - 点击 "Payload" 或 "请求负载"

4. **确认请求参数**
   ```json
   {
     "user_id": "user_1234567890",           // ✅ 正确
     "sessionId": "user_1234567890_...",     // ✅ 正确
     "chatInput": "你好"                      // ✅ 正确
   }
   ```

---

## 🔍 调试技巧

### 查看实际发送的数据

在 `config.js` 的 `apiRequest` 函数中添加日志：

```javascript
export const apiRequest = async (url, options = {}) => {
  // 🔥 添加日志查看实际请求数据
  if (options.body) {
    console.log('📦 实际发送的请求体:', JSON.parse(options.body));
  }
  
  // ... 原有代码
};
```

### 预期控制台输出

```
📤 发送消息到后端: {
  userId: "user_1234567890",
  sessionId: "user_1234567890_1699876543210", 
  message: "你好"
}

📦 实际发送的请求体: {
  user_id: "user_1234567890",           // ✅ 已转换
  sessionId: "user_1234567890_...",
  chatInput: "你好"                      // ✅ 已转换
}
```

---

## 🐛 常见问题

### Q1: 后端返回 400 错误？
**可能原因：** 后端参数名不匹配

**检查：**
1. 浏览器开发者工具 → Network
2. 找到失败的请求
3. 查看 Request Payload
4. 确认是否为：`user_id`、`sessionId`、`chatInput`

### Q2: 控制台显示参数错误？
**解决：** 检查后端日志，确认后端期望的参数名

### Q3: 旧代码还在发送 `userId` 和 `message`？
**原因：** 缓存问题

**解决：**
1. 清除浏览器缓存
2. 强制刷新（Ctrl + Shift + R）
3. 重启开发服务器

---

## 📝 后端接口文档

### POST /api/chat/send

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| user_id | string | 是 | 用户ID | "a123" |
| sessionId | string | 是 | 会话ID | "20ad2be816034cfb8bb6de6685d61445" |
| chatInput | string | 是 | 用户输入的消息 | "你好" |

#### 请求示例

```bash
curl -X POST https://your-api.com/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "a123",
    "sessionId": "20ad2be816034cfb8bb6de6685d61445",
    "chatInput": "你好"
  }'
```

#### 响应格式

```json
{
  "code": 200,
  "data": {
    "reply": "你好！我是AI助手，很高兴为您服务。"
  }
}
```

或者：

```json
{
  "reply": "你好！我是AI助手，很高兴为您服务。"
}
```

---

## 🎯 命名规范说明

### 为什么后端使用 `user_id` 而不是 `userId`？

#### 两种命名风格

1. **驼峰命名（camelCase）** - JavaScript 常用
   ```javascript
   userId, sessionId, chatInput
   ```

2. **蛇形命名（snake_case）** - Python/数据库常用
   ```javascript
   user_id, session_id, chat_input
   ```

#### 后端框架决定

- **Node.js/Express**：通常用 `camelCase`
- **Python/Flask/Django**：通常用 `snake_case`
- **PHP**：通常用 `snake_case`
- **Java/Spring**：通常用 `camelCase`

#### 前端适配方案

**方案 1：前端适配后端**（当前方案）✅
```javascript
// 前端转换
{
  user_id: userId,
  chatInput: message
}
```

**方案 2：后端适配前端**
```javascript
// 后端接收驼峰命名
{
  userId: "a123",
  message: "你好"
}
```

**方案 3：统一转换**
```javascript
// 使用工具库自动转换（如 lodash）
import { snakeCase } from 'lodash';
```

---

## ✅ 更新完成

### 修改文件
- ✅ `src/api/config.js` - 更新 `sendChatMessage` 函数

### 影响范围
- ✅ `src/components/AiPage_N8N.jsx` - 无需修改（自动适配）
- ✅ 其他调用 `sendChatMessage` 的地方 - 无需修改

### 测试状态
- ⏳ 等待测试：发送消息功能
- ⏳ 等待测试：后端响应是否正常

---

## 🚀 快速测试

### 一键测试脚本

在浏览器控制台执行：

```javascript
// 1. 导入函数（如果在模块外）
const { sendChatMessage } = await import('./src/api/config.js');

// 2. 发送测试消息
const result = await sendChatMessage(
  'test_user_123',
  'test_session_' + Date.now(),
  '你好，这是测试消息'
);

// 3. 查看结果
console.log('测试结果:', result);
```

---

## 📞 需要帮助？

如果遇到问题：

1. **检查网络请求**
   - F12 → Network → 找到 chat/send 请求
   - 查看 Request Payload

2. **检查后端日志**
   - 确认后端收到的参数格式

3. **验证参数映射**
   - 在 `sendChatMessage` 中添加 `console.log`

4. **清除缓存**
   - Ctrl + Shift + R 强制刷新

---

**更新完成！现在前端会按照后端要求的格式发送参数。** ✅


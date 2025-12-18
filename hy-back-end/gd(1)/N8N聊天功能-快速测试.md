# 🚀 N8N聊天功能 - 快速测试（3分钟）

> **n8n地址**: https://a001.app.n8n.cloud/webhook/663ada4d-edd9-42f0-a2e7-fea4a42a7419/chat  
> **配置状态**: ✅ 已启用  
> **测试时间**: 3分钟

---

## ⚡ 快速测试（2步）

### Step 1: 重启后端 ⏱️ 30秒

```bash
# 在IDEA中：
1. 点击停止按钮（红色方块）
2. 点击启动按钮（绿色三角）
3. 等待看到 "Started AuthApplication"
```

### Step 2: 测试聊天 ⏱️ 1分钟

#### 方法A: 使用Postman（推荐）

**快速配置**:
```
Method: POST
URL: http://localhost:8081/api/chat/send

Headers:
Content-Type: application/json

Body (raw, JSON):
{
  "sessionId": "test123",
  "userId": "testuser",
  "message": "你好"
}
```

**点击 Send**

**预期响应** ✅:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "reply": "你好！我是AI助手，有什么可以帮助您的？",
    "sessionId": "test123"
  }
}
```

#### 方法B: 使用前端页面

1. 打开聊天页面
2. 输入: `你好`
3. 按回车
4. 查看AI回复

---

## 🔍 验证成功的标志

### ✅ 成功标志

#### 1. 后端日志显示

```
=== 发送聊天消息 ===
SessionId: test123
UserId: testuser
Message: 你好
n8n配置: 已启用  ✅ 关键！
n8n URL: https://a001.app.n8n.cloud/webhook/...
✅ 用户消息已保存到数据库
⏳ 正在调用n8n webhook...
✅ n8n响应成功: 你好！我是AI助手...  ✅ 关键！
✅ AI回复已保存到数据库
===================
```

**关键日志**:
- ✅ `n8n配置: 已启用` - 说明配置生效
- ✅ `✅ n8n响应成功` - 说明连接成功

#### 2. 前端显示

```
用户: 你好
AI: 你好！我是AI助手，有什么可以帮助您的？
```

#### 3. 数据库记录

```sql
SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 2;

-- 应该看到两条记录
-- 1. 用户消息: "你好"
-- 2. AI回复: "你好！我是AI助手..."
```

---

## ❌ 失败标志（需要检查）

### 标志1: 使用了模拟响应

**后端日志**:
```
💡 n8n未配置，使用模拟响应  ❌
或
❌ 调用n8n失败: ...
💡 使用模拟响应
```

**原因**:
- 后端未重启
- 配置文件未生效
- n8n服务不可用

**解决**: 见下方"故障排查"

### 标志2: 500错误

**响应**:
```json
{
  "code": 500,
  "message": "发送消息失败: ...",
  "data": null
}
```

**原因**: n8n连接超时或响应格式错误

**解决**: 检查n8n服务状态

---

## 🔧 故障排查

### 问题1: 仍然使用模拟响应

**症状**:
```
后端日志: 💡 n8n未配置，使用模拟响应
AI回复: 收到您的消息：「你好」。我是AI旅游助手...
```

**检查清单**:

#### ✓ 检查1: 配置文件是否正确

```bash
# 打开 src/main/resources/application.properties
# 检查这两行：
n8n.enabled=true  ✅ 必须是true
n8n.webhook.url=https://a001.app.n8n.cloud/webhook/663ada4d-edd9-42f0-a2e7-fea4a42a7419/chat
```

#### ✓ 检查2: 后端是否真的重启了

```bash
# 查看IDEA控制台，应该看到最新启动时间
2025-11-02 16:30:00.123  INFO ... : Started AuthApplication
```

如果启动时间不对，说明没有重启！

#### ✓ 检查3: 查看后端启动日志

启动时应该能看到配置加载：
```
n8n配置: 已启用
n8n URL: https://a001.app.n8n.cloud/...
```

### 问题2: n8n连接失败

**症状**:
```
❌ 调用n8n失败: Connection timeout
💡 使用模拟响应
```

**检查**:

#### ✓ 测试n8n是否可访问

```bash
# 使用curl测试
curl -X POST https://a001.app.n8n.cloud/webhook/663ada4d-edd9-42f0-a2e7-fea4a42a7419/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionId":"test","userId":"test"}'

# 应该返回JSON响应
```

如果返回错误，说明n8n webhook有问题。

#### ✓ 检查网络连接

```bash
# ping测试
ping a001.app.n8n.cloud

# 应该能ping通
```

### 问题3: n8n响应格式错误

**症状**:
```
⚠️ n8n响应格式错误，使用默认回复
```

**原因**: n8n返回的JSON不包含 `text` 字段

**n8n应该返回的格式**:
```json
{
  "text": "AI的回复内容"
}
```

**如何修复**: 检查n8n workflow的输出节点

---

## 📊 测试用例

### 测试1: 基础对话

**输入**: `你好`  
**预期**: AI正常回复  
**验证**: 后端日志显示 "n8n响应成功"

### 测试2: 获取历史记录

**请求**:
```
GET http://localhost:8081/api/chat/history?sessionId=test123
```

**预期响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "sessionId": "test123",
    "total": 2,
    "messages": [
      {
        "id": 1,
        "message": "你好",
        "sessionId": "test123",
        "userId": "testuser",
        "createdAt": "2025-11-02T16:30:00"
      },
      {
        "id": 2,
        "message": "你好！我是AI助手...",
        "sessionId": "test123",
        "userId": "testuser",
        "createdAt": "2025-11-02T16:30:05"
      }
    ]
  }
}
```

### 测试3: 连续对话

发送3条消息，验证上下文是否保持：

```
消息1: "你好"
消息2: "推荐北京景点"
消息3: "谢谢"
```

每次都应该收到正确的AI回复。

---

## 🎯 一键测试脚本

### Postman Collection JSON

```json
{
  "info": {
    "name": "N8N聊天测试",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "发送消息",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"sessionId\": \"test123\",\n  \"userId\": \"testuser\",\n  \"message\": \"你好\"\n}"
        },
        "url": {
          "raw": "http://localhost:8081/api/chat/send",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8081",
          "path": ["api", "chat", "send"]
        }
      }
    },
    {
      "name": "获取历史",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8081/api/chat/history?sessionId=test123",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8081",
          "path": ["api", "chat", "history"],
          "query": [
            {
              "key": "sessionId",
              "value": "test123"
            }
          ]
        }
      }
    }
  ]
}
```

### curl测试脚本

```bash
#!/bin/bash

echo "=== N8N聊天功能测试 ==="

# 测试1: 发送消息
echo "测试1: 发送消息"
curl -X POST http://localhost:8081/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test123",
    "userId": "testuser",
    "message": "你好"
  }' | jq

echo ""

# 测试2: 获取历史
echo "测试2: 获取历史"
curl -X GET "http://localhost:8081/api/chat/history?sessionId=test123" | jq

echo ""
echo "=== 测试完成 ==="
```

---

## 📝 测试检查清单

### 启动前检查

- [ ] `application.properties` 中 `n8n.enabled=true`
- [ ] `application.properties` 中 `n8n.webhook.url` 已配置
- [ ] 后端代码已编译
- [ ] 数据库 `chat_history` 表存在

### 测试中检查

- [ ] 后端服务已启动
- [ ] 后端日志显示 "n8n配置: 已启用"
- [ ] 发送测试消息
- [ ] 查看后端日志
- [ ] 验证响应格式

### 成功标准

- [ ] API返回 `code: 200`
- [ ] AI回复来自真实n8n（不是模拟响应）
- [ ] 后端日志显示 "n8n响应成功"
- [ ] 消息已保存到数据库
- [ ] 可以获取历史记录

---

## 🎉 成功确认

### 看到这些就说明成功了

#### ✅ 后端日志关键词

```
✅ n8n配置: 已启用
✅ ⏳ 正在调用n8n webhook...
✅ ✅ n8n响应成功
```

#### ✅ API响应格式

```json
{
  "code": 200,
  "data": {
    "reply": "[来自n8n的AI回复]"
  }
}
```

#### ✅ 前端显示

AI能正常回复，不显示"模拟响应"或"暂时无法回复"。

---

## 🆘 还有问题？

### 联系信息

查看这些文档：
- `N8N聊天功能配置完成报告.md` - 详细配置说明
- `N8N聊天接口返回格式错误修复报告.md` - 接口格式问题
- `Postman登录接口调试完整指南.md` - Postman使用

### 提供信息

如果还有问题，请提供：
1. 后端完整日志（从启动到发送消息）
2. API完整响应
3. `application.properties` 中n8n相关配置
4. n8n webhook的测试结果

---

**测试指南版本**: v1.0  
**最后更新**: 2025-11-02  
**预计测试时间**: 3分钟

---

## 💡 温馨提示

### 如果n8n暂时不可用

**不用担心！** 系统会自动降级到模拟AI：

```
用户: 你好
AI: 你好！我是AI旅游助手，很高兴为您服务...
```

虽然不是真实AI，但聊天功能仍然可用，不会影响用户体验。

等n8n恢复后，只需：
1. 确认 `n8n.enabled=true`
2. 重启后端
3. 就会自动切换到真实AI

### 切换模式

**启用真实AI**:
```properties
n8n.enabled=true
```

**使用模拟AI**:
```properties
n8n.enabled=false
```

修改后记得重启后端！🔄


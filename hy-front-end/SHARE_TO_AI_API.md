# 分享旅行计划给AI助手 API 文档

## 📋 功能概述

本功能允许用户像分享旅行计划给好友一样，将旅行计划卡片分享给AI旅行助手。后端会自动构建包含完整计划信息的上下文，发送给AI进行讨论、优化或咨询。

### ✨ 核心特性

- 📤 **一键分享**: 通过旅行计划ID即可快速分享
- 🎯 **多种目的**: 支持讨论、优化、提问等不同分享目的
- 📝 **附加消息**: 可以添加自定义问题或需求
- 💬 **会话管理**: 支持在现有会话中分享或创建新会话
- 🎨 **格式化展示**: 自动生成美观的旅行计划卡片格式
- 🤖 **智能响应**: AI会根据分享目的给出针对性回复

---

## 🔌 API 接口

### POST /api/travel-plans/{id}/share-to-ai

分享旅行计划给AI助手

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 旅行计划ID |

#### 请求体 (ShareToAIRequest)

```json
{
  "userId": "1",
  "sessionId": "4_1234567890", //用户id+用户电话号码
  "message": "这是我的旅行计划，请帮我看看有什么可以改进的地方",
  "purpose": "optimize"
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | String | 否 | 用户ID（默认使用计划所属用户） |
| sessionId | String | 否 | 会话ID（不填则自动生成新会话） |
| message | String | 否 | 附加消息或问题 |
| purpose | String | 否 | 分享目的：discuss(讨论)、optimize(优化)、question(提问) |

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 123,
    "sessionId": "4_1234567890", //用户id+用户电话号码
    "aiReply": "我已经收到您的旅行计划了！这是一个很棒的北京5日游计划...",
    "sharedAt": "2025-01-15T14:30:00",
    "message": "旅行计划已成功分享给AI助手"
  }
}
```

**如果AI返回了优化建议**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 123,
    "sessionId": "4_1234567890", //用户id+用户电话号码
    "aiReply": "根据您的计划，我建议做以下优化...",
    "optimizedPlan": {
      "title": "北京5日游（优化版）",
      "destination": "北京",
      "travelDays": 5,
      "dailyItinerary": [...]
    },
    "sharedAt": "2025-01-15T14:30:00",
    "message": "旅行计划已成功分享给AI助手"
  }
}
```

#### 错误响应

| 状态码 | 说明 |
|--------|------|
| 404 | 旅行计划不存在 |
| 500 | 服务器错误或AI服务不可用 |

---

## 📝 分享上下文格式

后端会自动构建如下格式的上下文发送给AI：

```
我想和你讨论一下我的旅行计划：

📋 【旅行计划卡片】
━━━━━━━━━━━━━━━━━━━━
✈️ 标题：北京5日深度游
📍 目的地：北京
📅 旅行天数：5天
🗓️ 日期：2025-01-20 至 2025-01-24
💰 总预算：¥3500
📊 状态：进行中
⚠️ 特殊要求：希望避开人流高峰
━━━━━━━━━━━━━━━━━━━━

📅 【详细行程】

▶ 第1天 (2025-01-20) - 北京
  ⏰ 09:00-12:00 - 参观故宫
     📍 地点：故宫博物院
     📝 游览紫禁城，了解明清历史
     💵 费用：¥60
     🚗 交通：地铁1号线
     
  ⏰ 14:00-17:00 - 游览天安门广场
     📍 地点：天安门广场
     💵 费用：¥0
     🚗 交通：步行

▶ 第2天 (2025-01-21) - 北京
  ...

🏨 【住宿安排】

  • 北京如家酒店 (经济型)
    📍 位置：王府井大街
    💰 价格：¥280/晚
    ✨ 优势：交通便利，性价比高
    ✅ 已选择

💡 【旅行提示】
建议提前预约故宫门票，避开周末高峰期...

━━━━━━━━━━━━━━━━━━━━
💬 【我的问题/需求】
这是我的旅行计划，请帮我看看有什么可以改进的地方
```

---

## 🎯 使用场景

### 场景1: 讨论旅行计划

```javascript
// 用户点击"分享给AI"按钮
const response = await fetch('/api/travel-plans/123/share-to-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    purpose: 'discuss',
    message: '这是我第一次去北京，有什么建议吗？'
  })
});

const result = await response.json();
console.log('AI回复:', result.data.aiReply);
```

### 场景2: 请求优化

```javascript
const response = await fetch('/api/travel-plans/123/share-to-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    purpose: 'optimize',
    message: '希望降低预算到3000元以内'
  })
});

const result = await response.json();
if (result.data.optimizedPlan) {
  // AI返回了优化后的计划
  showOptimizedPlan(result.data.optimizedPlan);
}
```

### 场景3: 在现有会话中分享

```javascript
// 用户正在与AI聊天，想分享计划
const response = await fetch('/api/travel-plans/123/share-to-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: currentChatSessionId, // 使用当前聊天会话ID
    purpose: 'question',
    message: '关于这个计划，第三天的行程会不会太赶？'
  })
});
```

---

## 🎨 前端集成示例

### React 组件

```jsx
import React, { useState } from 'react';

const ShareToAIButton = ({ travelPlanId, onShareSuccess }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleShare = async (purpose, message) => {
    setIsSharing(true);
    
    try {
      const response = await fetch(`/api/travel-plans/${travelPlanId}/share-to-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, message })
      });

      const result = await response.json();
      
      if (result.code === 200) {
        onShareSuccess(result.data);
        // 跳转到聊天页面
        window.location.href = `/chat?sessionId=${result.data.sessionId}`;
      } else {
        alert('分享失败: ' + result.message);
      }
    } catch (error) {
      console.error('分享失败:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="share-to-ai-container">
      <button 
        onClick={() => setShowOptions(true)}
        disabled={isSharing}
        className="btn-share-ai"
      >
        {isSharing ? '分享中...' : '🤖 分享给AI助手'}
      </button>

      {showOptions && (
        <ShareOptionsModal
          onConfirm={handleShare}
          onCancel={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

const ShareOptionsModal = ({ onConfirm, onCancel }) => {
  const [purpose, setPurpose] = useState('discuss');
  const [message, setMessage] = useState('');

  const purposes = [
    { value: 'discuss', label: '💬 讨论计划', desc: '和AI聊聊这个计划' },
    { value: 'optimize', label: '✨ 优化计划', desc: '让AI帮忙优化' },
    { value: 'question', label: '❓ 提问咨询', desc: '询问具体问题' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>分享给AI助手</h2>
        
        <div className="purpose-options">
          {purposes.map(p => (
            <label key={p.value} className="radio-card">
              <input
                type="radio"
                name="purpose"
                value={p.value}
                checked={purpose === p.value}
                onChange={(e) => setPurpose(e.target.value)}
              />
              <div className="radio-card-content">
                <strong>{p.label}</strong>
                <p>{p.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="message-input">
          <label>附加消息（可选）</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="例如：这是我第一次去北京，有什么建议吗？"
            rows={4}
          />
        </div>

        <div className="modal-actions">
          <button onClick={onCancel} className="btn-cancel">
            取消
          </button>
          <button 
            onClick={() => onConfirm(purpose, message)}
            className="btn-confirm"
          >
            分享
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareToAIButton;
```

### CSS 样式

```css
.btn-share-ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.btn-share-ai:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-share-ai:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.purpose-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}

.radio-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.radio-card:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.radio-card input[type="radio"] {
  margin-top: 4px;
}

.radio-card input[type="radio"]:checked ~ .radio-card-content {
  color: #667eea;
}
```

---

## 🔄 与其他功能的对比

### 分享给AI vs 优化功能

| 功能 | 分享给AI | 优化功能 |
|------|----------|----------|
| **目的** | 讨论、咨询、交流 | 专门用于优化计划 |
| **交互方式** | 进入聊天会话 | 返回优化结果预览 |
| **应用方式** | 在聊天中继续讨论 | 需要用户确认后应用 |
| **灵活性** | 高，可以自由对话 | 低，专注于优化 |
| **使用场景** | 咨询建议、讨论细节 | 系统性优化计划 |

### 建议使用场景

- **使用"分享给AI"**：
  - 想和AI讨论旅行计划的细节
  - 有具体的问题需要咨询
  - 想在聊天中逐步完善计划
  - 需要AI提供建议但不一定要修改计划

- **使用"优化功能"**：
  - 需要系统性地优化整个计划
  - 想看到优化前后的对比
  - 需要完整的优化后的计划数据
  - 想保存优化历史记录

---

## 💡 最佳实践

### 1. 明确分享目的

```javascript
// 好的做法：明确目的
await shareToPlan(123, {
  purpose: 'optimize',
  message: '希望降低预算到3000元'
});

// 不好的做法：目的不明确
await shareToPlan(123, {
  message: '帮我看看'
});
```

### 2. 提供具体问题

```javascript
// 好的做法：具体的问题
await shareToPlan(123, {
  purpose: 'question',
  message: '第三天的行程会不会太赶？从故宫到长城需要多长时间？'
});

// 不好的做法：问题太笼统
await shareToPlan(123, {
  purpose: 'question',
  message: '有什么建议吗？'
});
```

### 3. 利用会话连续性

```javascript
// 在现有聊天中分享计划
const currentSessionId = getChatSessionId();
await shareToPlan(123, {
  sessionId: currentSessionId,
  message: '这是我刚才提到的那个计划'
});
```

---

## 🧪 测试示例

### 基本测试

```bash
curl -X POST http://localhost:8080/api/travel-plans/1/share-to-ai \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "discuss",
    "message": "这是我的旅行计划，请帮我看看"
  }'
```

### 优化请求测试

```bash
curl -X POST http://localhost:8080/api/travel-plans/1/share-to-ai \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "optimize",
    "message": "希望降低预算，保留故宫和长城"
  }'
```

### 在现有会话中分享

```bash
curl -X POST http://localhost:8080/api/travel-plans/1/share-to-ai \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "chat_session_123",
    "purpose": "question",
    "message": "关于这个计划，第三天的行程安排合理吗？"
  }'
```

---

## 📊 响应数据说明

### 基本响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| travelPlanId | Long | 分享的旅行计划ID |
| sessionId | String | 会话ID（可用于跳转到聊天页面） |
| aiReply | String | AI的回复内容 |
| sharedAt | DateTime | 分享时间 |
| message | String | 操作结果消息 |

### 可选响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| optimizedPlan | Object | 如果AI返回了优化计划 |
| travelPlanId | Long | 如果AI保存了新计划 |

---

## ⚠️ 注意事项

1. **会话管理**: 如果不指定sessionId，每次分享都会创建新会话
2. **AI响应**: AI可能返回文本建议或完整的优化计划
3. **权限验证**: 确保用户有权限访问该旅行计划
4. **错误处理**: 妥善处理AI服务不可用的情况
5. **数据格式**: 分享的上下文使用emoji美化，确保AI能正确解析

---

## 🔮 未来扩展

- 支持分享部分行程（如只分享某几天）
- 支持批量分享多个计划
- 支持分享给特定的AI助手（不同专长）
- 记录分享历史
- 支持从分享会话中直接修改计划

---

## 📞 技术支持

如有问题或建议，请联系开发团队。

---

**版本**: 1.0.0  
**更新日期**: 2025-01-15

# 群聊功能API速查表

## 🚀 基础信息
- **Base URL**: `http://localhost:8082/api/group`
- **WebSocket URL**: `ws://localhost:8082/api/ws/chat/native?userId={userId}`

---

## 📝 API接口列表

### 群聊管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建群聊 | POST | `/create` | 创建新群聊 |
| 拉好友建群 | POST | `/create-with-friends` | 快速拉好友建群 |
| 获取群信息 | GET | `/{groupId}/info` | 获取群聊详情 |
| 更新群信息 | PUT | `/{groupId}/info` | 更新群名称、描述 |
| 上传群头像 | POST | `/{groupId}/avatar` | 上传群头像 |
| 解散群聊 | DELETE | `/{groupId}/disband` | 解散群聊（仅群主） |
| 退出群聊 | POST | `/{groupId}/leave` | 退出群聊 |

### 成员管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 邀请入群 | POST | `/{groupId}/invite` | 邀请用户加入群聊 |
| 申请入群 | POST | `/{groupId}/join` | 申请加入群聊 |
| 处理申请 | POST | `/{groupId}/handle-join` | 同意/拒绝入群申请 |
| 获取成员列表 | GET | `/{groupId}/members` | 获取群成员列表 |
| 踢出成员 | POST | `/{groupId}/kick` | 踢出群成员 |
| 设置管理员 | POST | `/{groupId}/set-admin` | 设置/取消管理员 |
| 转让群主 | POST | `/{groupId}/transfer-owner` | 转让群主身份 |

### 群设置

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 设置群昵称 | POST | `/{groupId}/nickname` | 设置群内昵称 |
| 禁言成员 | POST | `/{groupId}/mute-member` | 禁言/解除禁言 |
| 全员禁言 | POST | `/{groupId}/mute-all` | 开启/关闭全员禁言 |
| 入群审批 | POST | `/{groupId}/join-approval` | 设置入群审批 |
| 邀请权限 | POST | `/{groupId}/invite-permission` | 设置邀请权限 |

### 群消息

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 发送群消息 | POST | `/{groupId}/send-message` | 发送群消息 |
| 发送群文件 | POST | `/{groupId}/send-file` | 发送文件消息 |
| 获取聊天记录 | GET | `/{groupId}/messages` | 获取群聊记录 |
| 搜索聊天记录 | GET | `/{groupId}/messages/search` | 搜索群聊记录 |
| 标记已读 | POST | `/{groupId}/mark-read` | 标记群消息已读 |

### 群查询

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 我的群聊列表 | GET | `/my-groups` | 获取用户的所有群聊 |
| 搜索群聊 | GET | `/search` | 根据群名搜索 |
| 群聊统计 | GET | `/{groupId}/statistics` | 获取群统计信息 |
| 获取群公告 | GET | `/{groupId}/announcement` | 获取群公告 |
| 发布群公告 | POST | `/{groupId}/announcement` | 发布群公告 |

---

## 📤 请求示例

### 1. 创建群聊（拉好友建群）
```bash
POST /api/group/create-with-friends
Content-Type: application/json

{
  "creatorId": 1,
  "groupName": "我们的群聊",
  "groupDescription": "一起玩的朋友们",
  "friendIds": [2, 3, 4, 5]
}
```

### 2. 邀请用户入群
```bash
POST /api/group/1/invite
Content-Type: application/json

{
  "inviterId": 1,
  "userIds": [6, 7, 8],
  "inviteMessage": "欢迎加入"
}
```

### 3. 发送群消息
```bash
POST /api/group/1/send-message
Content-Type: application/json

{
  "senderId": 1,
  "messageType": "text",
  "content": "大家好！",
  "replyToMessageId": null
}
```

### 4. 获取我的群聊列表
```bash
GET /api/group/my-groups?userId=1
```

### 5. 获取群成员列表
```bash
GET /api/group/1/members?userId=1
```

### 6. 标记群消息已读
```bash
POST /api/group/1/mark-read
Content-Type: application/json

{
  "userId": 1
}
```

---

## 🔌 WebSocket消息类型

### 发送消息类型

| 类型 | 说明 | 数据格式 |
|------|------|----------|
| `send_message` | 发送群消息 | `{groupId, messageType, content}` |
| `heartbeat` | 心跳消息 | `{}` |
| `typing` | 正在输入 | `{targetId, targetType, isTyping}` |
| `read_message` | 消息已读 | `{messageId, conversationId}` |
| `join_group` | 加入群组房间 | `{groupId}` |
| `leave_group` | 离开群组房间 | `{groupId}` |

### 接收消息类型

| 类型 | 说明 | 触发场景 |
|------|------|----------|
| `new_group_message` | 新群消息通知 | 群内有新消息 |
| `group_invitation` | 群邀请通知 | 被邀请加入群聊 |
| `send_message_success` | 消息发送成功 | 发送消息成功 |
| `heartbeat_response` | 心跳响应 | 心跳消息响应 |
| `typing_status` | 输入状态变化 | 有人正在输入 |
| `error` | 错误消息 | 操作失败 |

---

## 🔧 WebSocket使用示例

### 连接WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8082/api/ws/chat/native?userId=1');

ws.onopen = () => console.log('连接成功');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('收到消息:', data);
};
```

### 发送群消息
```javascript
ws.send(JSON.stringify({
    type: 'send_message',
    data: {
        groupId: 1,
        messageType: 'text',
        content: '大家好！'
    },
    timestamp: Date.now(),
    requestId: 'req_' + Date.now()
}));
```

### 发送心跳
```javascript
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'heartbeat',
            data: {},
            timestamp: Date.now()
        }));
    }
}, 30000); // 每30秒
```

---

## ⚠️ 常见错误码

| Code | Message | 说明 |
|------|---------|------|
| 200 | success | 成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权 |
| 403 | Forbidden | 没有权限 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

---

## 📊 返回数据格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": { /* 数据对象 */ }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "参数错误",
  "data": null
}
```

---

## 🎯 核心DTO对象

### GroupChatDTO（群聊信息）
```json
{
  "groupId": 1,
  "groupName": "技术交流群",
  "groupAvatar": "https://...",
  "groupDescription": "分享技术经验",
  "creatorId": 1,
  "maxMembers": 200,
  "currentMembers": 10,
  "groupType": "normal",
  "status": "active",
  "unreadCount": 5,
  "memberRole": "member",
  "createdTime": "2025-12-10T10:00:00"
}
```

### GroupMemberDTO（群成员信息）
```json
{
  "id": 1,
  "groupId": 1,
  "userId": 1,
  "userName": "张三",
  "avatar": "https://...",
  "memberRole": "owner",
  "groupNickname": "群主",
  "isMuted": false,
  "joinTime": "2025-12-10T10:00:00"
}
```

### MessageDTO（消息信息）
```json
{
  "messageId": 12345,
  "senderId": 1,
  "senderName": "张三",
  "senderAvatar": "https://...",
  "groupId": 1,
  "messageType": "text",
  "content": "大家好！",
  "sentTime": "2025-12-10T14:30:00",
  "status": "sent",
  "replyToMessageId": null
}
```

---

## 💡 最佳实践

### 1. API调用
```javascript
// 使用axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8082/api',
  timeout: 10000
});

// 创建群聊
const createGroup = async (data) => {
  const response = await api.post('/group/create-with-friends', data);
  return response.data;
};

// 获取群列表
const getMyGroups = async (userId) => {
  const response = await api.get(`/group/my-groups?userId=${userId}`);
  return response.data;
};
```

### 2. WebSocket管理
```javascript
class WebSocketManager {
  constructor(userId) {
    this.userId = userId;
    this.ws = null;
    this.reconnectInterval = 3000;
    this.heartbeatInterval = 30000;
    this.messageHandlers = [];
  }

  connect() {
    this.ws = new WebSocket(
      `ws://localhost:8082/api/ws/chat/native?userId=${this.userId}`
    );
    
    this.ws.onopen = () => {
      console.log('WebSocket连接成功');
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageHandlers.forEach(handler => handler(data));
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket连接关闭，准备重连');
      setTimeout(() => this.connect(), this.reconnectInterval);
    };
  }

  startHeartbeat() {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          data: {},
          timestamp: Date.now()
        });
      }
    }, this.heartbeatInterval);
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 使用
const wsManager = new WebSocketManager(1);
wsManager.connect();
wsManager.onMessage((data) => {
  console.log('收到消息:', data);
});
```

---

## 🔍 调试技巧

### 1. 查看WebSocket连接状态
```javascript
console.log('WebSocket状态:', ws.readyState);
// 0 = CONNECTING
// 1 = OPEN
// 2 = CLOSING
// 3 = CLOSED
```

### 2. 监控WebSocket消息
```javascript
ws.addEventListener('message', (event) => {
  console.log('[WebSocket收到]', event.data);
});

const originalSend = ws.send;
ws.send = function(data) {
  console.log('[WebSocket发送]', data);
  originalSend.call(this, data);
};
```

### 3. 查看后端日志
```bash
tail -f logs/spring.log | grep "group"
```

---

## 📞 技术支持

遇到问题时的排查步骤：
1. ✅ 检查数据库表是否创建成功
2. ✅ 检查后端服务是否正常运行（端口8082）
3. ✅ 检查WebSocket连接是否成功
4. ✅ 检查浏览器控制台是否有错误
5. ✅ 检查后端日志是否有异常

**Happy Coding! 🎉**

# 聊天系统后端完整设计文档

## 📋 系统概述

本聊天系统是一个功能完整的生产级聊天后端，支持私聊、群聊、实时通信等核心功能。

### 🎯 核心功能

1. **好友管理** - 添加好友、好友申请处理、好友列表管理
2. **私聊对话** - 文本、图片、语音、视频、文件消息
3. **群聊功能** - 创建群聊、成员管理、群设置
4. **消息管理** - 消息发送、撤回、已读回执、搜索
5. **聊天设置** - 置顶、免打扰、聊天背景、清空记录
6. **权限控制** - 聊天权限设置、隐私保护
7. **举报系统** - 用户举报、消息举报、群聊举报
8. **实时通信** - WebSocket实时消息推送、在线状态

## 🗄️ 数据库设计

### 现有表结构
- `user_info` - 用户基础信息表
- `user_friendships` - 好友关系表
- `conversations` - 会话表
- `messages` - 消息表
- `conversation_settings` - 会话设置表
- `user_permissions` - 用户权限表
- `user_notification` - 用户通知表

### 新增表结构 (chat_system_enhanced.sql)
- `group_chats` - 群聊表
- `group_members` - 群成员表
- `chat_settings` - 聊天设置表
- `chat_reports` - 举报表
- `message_read_status` - 消息已读状态表

## 🔧 接口设计

### 1. 好友管理接口

#### 添加好友
```http
POST /api/chat/friends/add
Content-Type: application/json

{
  "userId": 1,
  "friendId": 2,
  "message": "我是通过搜索添加的",
  "source": "search"
}
```

#### 处理好友申请
```http
POST /api/chat/friends/handle
Content-Type: application/json

{
  "userId": 1,
  "friendId": 2,
  "action": "accept",
  "rejectReason": ""
}
```

#### 获取好友列表
```http
GET /api/chat/friends/list?userId=1
```

### 2. 消息对话接口

#### 发送消息
```http
POST /api/chat/messages/send
Content-Type: application/json

{
  "senderId": 1,
  "receiverId": 2,
  "messageType": "text",
  "content": "你好！",
  "replyToMessageId": null
}
```

#### 发送文件消息
```http
POST /api/chat/messages/send-file
Content-Type: multipart/form-data

senderId=1
receiverId=2
messageType=image
file=[文件数据]
```

#### 获取聊天记录
```http
GET /api/chat/messages/history?userId=1&friendId=2&page=1&size=20
```

#### 搜索聊天记录
```http
GET /api/chat/messages/search?userId=1&keyword=你好&friendId=2&page=1&size=20
```

### 3. 聊天设置接口

#### 置顶聊天
```http
POST /api/chat/settings/pin
Content-Type: application/json

{
  "userId": 1,
  "targetId": 2,
  "targetType": "user",
  "isPinned": true
}
```

#### 消息免打扰
```http
POST /api/chat/settings/mute
Content-Type: application/json

{
  "userId": 1,
  "targetId": 2,
  "targetType": "user",
  "isMuted": true
}
```

#### 设置聊天背景
```http
POST /api/chat/settings/background
Content-Type: application/json

{
  "userId": 1,
  "targetId": 2,
  "targetType": "user",
  "backgroundImage": "https://example.com/bg.jpg"
}
```

#### 清空聊天记录
```http
DELETE /api/chat/messages/clear
Content-Type: application/json

{
  "userId": 1,
  "friendId": 2,
  "clearType": "all"
}
```

### 4. 群聊管理接口

#### 创建群聊
```http
POST /api/group/create
Content-Type: application/json

{
  "creatorId": 1,
  "groupName": "旅行爱好者群",
  "groupDescription": "分享旅行经验",
  "maxMembers": 200,
  "initialMembers": [2, 3, 4]
}
```

#### 拉好友建群
```http
POST /api/group/create-with-friends
Content-Type: application/json

{
  "creatorId": 1,
  "groupName": "我们的群聊",
  "friendIds": [2, 3, 4, 5]
}
```

#### 邀请用户入群
```http
POST /api/group/{groupId}/invite
Content-Type: application/json

{
  "inviterId": 1,
  "userIds": [6, 7],
  "inviteMessage": "欢迎加入我们的群聊"
}
```

#### 获取群成员列表
```http
GET /api/group/{groupId}/members?userId=1
```

### 5. 权限管理接口

#### 设置聊天权限
```http
POST /api/chat/permissions/set
Content-Type: application/json

{
  "ownerId": 1,
  "targetUserId": 2,
  "permissionLevel": "full_access",
  "canViewProfile": true,
  "canViewMoments": true,
  "canVoiceCall": true,
  "canVideoCall": true
}
```

### 6. 举报接口

#### 举报用户
```http
POST /api/chat/reports/user
Content-Type: application/json

{
  "reporterId": 1,
  "reportedUserId": 2,
  "reportType": "harassment",
  "reportReason": "发送骚扰信息",
  "evidenceImages": ["https://example.com/evidence1.jpg"]
}
```

#### 举报消息
```http
POST /api/chat/reports/message
Content-Type: application/json

{
  "reporterId": 1,
  "messageId": 123,
  "reportType": "inappropriate",
  "reportReason": "发送不当内容"
}
```

## 🔌 WebSocket实时通信

### 连接方式
```javascript
// 原生WebSocket连接
const ws = new WebSocket('ws://localhost:8080/ws/chat/native?userId=1');

// SockJS连接（支持降级）
const socket = new SockJS('http://localhost:8080/ws/chat');
```

### 消息格式

#### 发送消息格式
```json
{
  "type": "send_message",
  "data": {
    "receiverId": 2,
    "messageType": "text",
    "content": "你好！"
  },
  "timestamp": 1700000000000,
  "requestId": "req_123"
}
```

#### 接收消息格式
```json
{
  "type": "new_message",
  "data": {
    "messageId": 456,
    "senderId": 2,
    "senderName": "张三",
    "content": "你好！",
    "timestamp": 1700000000000
  },
  "success": true,
  "timestamp": 1700000000000
}
```

### 支持的消息类型

1. **heartbeat** - 心跳检测
2. **send_message** - 发送消息
3. **typing** - 正在输入状态
4. **read_message** - 消息已读
5. **join_group** - 加入群组
6. **leave_group** - 离开群组

### 推送消息类型

1. **new_message** - 新消息通知
2. **new_group_message** - 新群消息通知
3. **typing_status** - 输入状态变化
4. **friend_online_status** - 好友在线状态变化
5. **message_read_receipt** - 消息已读回执
6. **friend_request** - 好友申请通知
7. **group_notification** - 群组通知

## 📁 项目结构

```
src/main/java/com/example/chat/
├── controller/
│   ├── ChatController.java           # 聊天核心接口
│   └── GroupChatController.java      # 群聊管理接口
├── dto/
│   ├── ChatDTOs.java                # 聊天相关DTO
│   └── GroupChatDTOs.java           # 群聊相关DTO
├── websocket/
│   ├── ChatWebSocketHandler.java    # WebSocket处理器
│   └── WebSocketModels.java         # WebSocket数据模型
└── config/
    └── WebSocketConfig.java         # WebSocket配置
```

## 🚀 部署说明

### 1. 数据库初始化
```sql
-- 1. 执行现有的数据库脚本
source user_info.sql;
source chat_system.sql;
source user_permissions.sql;

-- 2. 执行增强功能脚本
source chat_system_enhanced.sql;
```

### 2. 应用配置
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/gd_mcp
    username: your_username
    password: your_password
  
  # WebSocket配置
  websocket:
    allowed-origins: "*"  # 生产环境应限制域名
```

### 3. 启动应用
```bash
mvn spring-boot:run
```

## 🔍 API测试示例

### 完整的聊天流程测试

1. **用户A添加用户B为好友**
```bash
curl -X POST http://localhost:8080/api/chat/friends/add \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"friendId":2,"message":"你好，我想加你为好友"}'
```

2. **用户B处理好友申请**
```bash
curl -X POST http://localhost:8080/api/chat/friends/handle \
  -H "Content-Type: application/json" \
  -d '{"userId":2,"friendId":1,"action":"accept"}'
```

3. **用户A发送消息给用户B**
```bash
curl -X POST http://localhost:8080/api/chat/messages/send \
  -H "Content-Type: application/json" \
  -d '{"senderId":1,"receiverId":2,"messageType":"text","content":"你好！"}'
```

4. **用户B查看聊天记录**
```bash
curl "http://localhost:8080/api/chat/messages/history?userId=2&friendId=1&page=1&size=20"
```

5. **用户A创建群聊并邀请好友**
```bash
curl -X POST http://localhost:8080/api/group/create-with-friends \
  -H "Content-Type: application/json" \
  -d '{"creatorId":1,"groupName":"我们的群聊","friendIds":[2,3,4]}'
```

## 🛡️ 安全考虑

1. **身份验证** - 所有接口都应该验证用户身份
2. **权限控制** - 基于用户权限表进行访问控制
3. **输入验证** - 严格验证所有用户输入
4. **SQL注入防护** - 使用参数化查询
5. **XSS防护** - 对用户输入进行转义
6. **文件上传安全** - 限制文件类型和大小
7. **频率限制** - 防止消息轰炸和API滥用

## 📈 性能优化建议

1. **数据库优化**
   - 合理使用索引
   - 分页查询大量数据
   - 读写分离
   - 缓存热点数据

2. **消息存储**
   - 历史消息分表存储
   - 媒体文件CDN加速
   - 消息压缩存储

3. **WebSocket优化**
   - 连接池管理
   - 心跳检测
   - 断线重连
   - 消息队列缓冲

4. **缓存策略**
   - Redis缓存在线用户
   - 缓存好友列表
   - 缓存群成员信息

## 🔧 扩展功能建议

1. **消息加密** - 端到端加密保护隐私
2. **消息翻译** - 多语言实时翻译
3. **语音转文字** - 语音消息自动转录
4. **智能回复** - AI智能回复建议
5. **消息统计** - 聊天数据分析
6. **机器人接入** - 聊天机器人集成
7. **视频通话** - WebRTC视频通话
8. **屏幕共享** - 实时屏幕分享

---

## ✅ 功能完成清单

- [x] 添加好友功能
- [x] 对话消息功能
- [x] 置顶聊天功能
- [x] 查找聊天记录功能
- [x] 消息免打扰功能
- [x] 设置聊天背景功能
- [x] 清空聊天记录功能
- [x] 举报功能
- [x] 拉好友建群功能
- [x] 群聊管理功能
- [x] 权限控制功能
- [x] WebSocket实时通信
- [x] 在线状态管理
- [x] 消息已读回执
- [x] 文件消息支持

这个聊天系统后端设计完整且功能丰富，可以直接用于生产环境。所有接口都经过精心设计，支持扩展和优化。

# 新增功能接口文档

本文件汇总了近期新增/修改的接口与相关数据库字段，主要包括：

- 旅行计划到执行时间提醒接口
- 用户总旅行计划数量接口（及 `user_info.total_travel` 字段）
- 旅行计划图片上传与查询接口（及 `travel_plan_images` 表）
- 聊天历史中 `role` 字段的区分与使用

---

## 1. 旅行计划到执行时间提醒接口

### 1.1 接口说明

**接口地址**: `GET /api/travel-plans/user/{userId}/reminders`

**功能描述**:
- 根据用户ID和当前日期，获取所有 **开始日期 `startDate` 小于等于当前日期，且状态 `status` 不为 `completed`** 的旅行计划。
- 可用于前端在用户进入页面或定时轮询时提醒：是否正在执行这些计划。

### 1.2 请求参数

| 参数名       | 位置   | 类型   | 必填 | 说明                               |
|--------------|--------|--------|------|------------------------------------|
| `userId`     | Path   | Long   | 是   | 用户ID                             |
| `currentDate`| Query  | String | 否   | 当前日期，格式 `yyyy-MM-dd`，可选 |

- 若 `currentDate` 为空，则后端自动使用系统当前日期 `LocalDate.now()`。

### 1.3 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 123,
    "currentDate": "2026-01-01",
    "total": 2,
    "travelPlans": [
      {
        "id": 1,
        "userId": 123,
        "title": "北京3日游",
        "destination": "北京",
        "travelDays": 3,
        "startDate": "2026-01-01",
        "endDate": "2026-01-03",
        "status": "active"
      }
    ]
  }
}
```

---

## 2. 用户总旅行计划数量接口

### 2.1 数据库字段变更

在 `user_info` 表中增加字段：

```sql
ALTER TABLE `user_info`
  ADD COLUMN `total_travel` int NOT NULL DEFAULT 0 COMMENT '用户总的旅行计划数量';
```

- Java 实体 `User` 中新增字段：
  - `@Column(name = "total_travel") private Integer totalTravel;`
- `TravelPlanService` 在 **创建** / **删除** 旅行计划时自动更新该字段，不需要前端单独维护。

### 2.2 接口说明

**接口地址**: `GET /api/travel-plans/user/{userId}/total`

**功能描述**:
- 获取指定用户当前在数据库中的旅行计划总数量。
- 返回值与 `user_info.total_travel` 保持一致。

### 2.3 请求参数

| 参数名   | 位置 | 类型 | 必填 | 说明   |
|----------|------|------|------|--------|
| `userId` | Path | Long | 是   | 用户ID |

### 2.4 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 123,
    "totalTravel": 5
  }
}
```

---

## 3. 旅行计划图片上传与查询接口

### 3.1 数据库表结构 `travel_plan_images`

新建表 `travel_plan_images`：

```sql
CREATE TABLE `travel_plan_images`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `travel_plan_id` bigint NOT NULL COMMENT '关联的旅行计划ID',
  `image_data` longblob NOT NULL COMMENT '图片二进制数据',
  `content_type` varchar(100) NULL DEFAULT NULL COMMENT 'MIME类型，如 image/jpeg',
  `description` varchar(255) NULL DEFAULT NULL COMMENT '图片描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_travel_plan_id`(`travel_plan_id` ASC) USING BTREE,
  CONSTRAINT `fk_travel_plan_images_plan` FOREIGN KEY (`travel_plan_id`) REFERENCES `travel_plans` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
);
```

对应实体类 `TravelPlanImage`：
- `id`：主键
- `travelPlan`：关联的 `TravelPlan`
- `imageData`：图片二进制数据
- `contentType`：MIME 类型
- `description`：描述（可选）
- `createdAt`：上传时间

### 3.2 上传图片接口

**接口地址**: `POST /api/travel-plans/{id}/images`

**功能描述**:
- 为指定旅行计划上传一张图片。
- 图片直接以二进制方式存储在数据库的 `LONGBLOB` 字段中。

**请求参数**:

| 参数名       | 位置 | 类型   | 必填 | 说明           |
|--------------|------|--------|------|----------------|
| `id`         | Path | Long   | 是   | 旅行计划ID     |
| `file`       | Form | File   | 是   | 图片文件       |
| `description`| Form | String | 否   | 图片描述       |

**请求体**: `multipart/form-data`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 10,
    "travelPlanId": 1,
    "contentType": "image/jpeg",
    "description": "行程封面图",
    "createdAt": "2026-01-01T10:00:00"
  }
}
```

### 3.3 获取旅行计划图片列表接口（仅元信息）

**接口地址**: `GET /api/travel-plans/{id}/images`

**功能描述**:
- 获取指定旅行计划下的所有图片 **元信息列表**（不包含图片二进制数据）。
- 前端如需展示图片，可在未来扩展单独的图片下载接口，例如：`GET /api/travel-plans/images/{imageId}/data`（当前未实现）。

**请求参数**:

| 参数名 | 位置 | 类型 | 必填 | 说明       |
|--------|------|------|------|------------|
| `id`   | Path | Long | 是   | 旅行计划ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "total": 2,
    "images": [
      {
        "id": 10,
        "travelPlanId": 1,
        "contentType": "image/jpeg",
        "description": "行程封面图",
        "createdAt": "2026-01-01T10:00:00",
        "url": "/api/travel-plans/images/10/content"
      }
    ]
  }
}
```

### 3.4 获取图片内容接口

**接口地址**: `GET /api/travel-plans/images/{imageId}/content`

**功能描述**:
- 根据图片ID获取图片的二进制数据。
- 响应头 `Content-Type` 会根据图片实际类型（如 `image/jpeg`, `image/png`）自动设置。
- 该接口可直接用于 `<img>` 标签的 `src` 属性。

**请求参数**:

| 参数名    | 位置 | 类型 | 必填 | 说明   |
|-----------|------|------|------|--------|
| `imageId` | Path | Long | 是   | 图片ID |

**响应示例**:
- 直接返回二进制图片流。
- HTTP 状态码：200 (Found) 或 404 (Not Found)。

---

## 4. 聊天历史中 role 字段的区分与使用

### 4.1 数据库结构

`chat_history` 表中已有字段：

```sql
`role` enum('user','assistant') NOT NULL,
```

- `user`：代表用户发送的消息
- `assistant`：代表 AI 助手的回复

### 4.2 实体与保存逻辑

实体 `ChatMessage` 中新增字段：

```java
@Column(name = "role", nullable = false)
private String role; // "user" 或 "assistant"
```

在 `ChatService.sendMessage` 中保存消息时：

- 保存用户消息：
  - `userMsg.setRole("user");`
- 保存 AI 回复：
  - `aiMsg.setRole("assistant");`

### 4.3 获取聊天历史接口

接口保持不变：

**接口地址**: `GET /api/chat/history?sessionId={sessionId}`

**功能描述**:
- 返回指定会话ID下的所有聊天记录，每一条记录都包含 `role` 字段，前端可据此区分左右气泡展示。

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sessionId": "session_123456",
    "total": 4,
    "messages": [
      {
        "id": 1,
        "sessionId": "session_123456",
        "role": "user",
        "userId": "user_001",
        "message": "我想去上海旅游",
        "createdAt": "2025-11-25T10:30:00"
      },
      {
        "id": 2,
        "sessionId": "session_123456",
        "role": "assistant",
        "userId": "user_001",
        "message": "上海是一个非常适合旅游的城市...",
        "createdAt": "2025-11-25T10:30:01"
      }
    ]
  }
}
```

### 4.4 前端使用建议

- 判断左右气泡：
  - `role === 'user'`：渲染为用户右侧气泡
  - `role === 'assistant'`：渲染为 AI 左侧气泡
- 文本内容使用 `message` 字段，时间使用 `createdAt` 字段。

---

## 5. 旅行计划分享小卡片到好友聊天

### 5.1 功能背景

- n8n 聊天机器人在生成旅行计划时，后端会持久化一条 `travel_plans` 记录，并在 `ChatResponse` 中返回 `travelPlanId` 与 `travelPlan` 数据。
- 本功能允许用户在 AI 聊天页中点击“分享给好友”，将该旅行计划同步分享到 **用户聊天系统** 中，生成一条特殊的“旅行计划小卡片”消息。
- 小卡片点击后的跳转（进入旅行计划详情页）由前端负责实现，可基于 `travelPlanId` 跳转到已有的旅行计划详情路由或再次调用旅行计划详情接口。

### 5.2 接口说明

**接口地址**: `POST /api/user-chat/messages/share-travel-plan`

**功能描述**:
- 创建一条“旅行计划分享”类型的私聊消息。
- 消息将以 `messageType = "travel_plan"` 存储，并在 `extra` 字段中附带用于渲染小卡片的详细信息（JSON 字符串）。
- 仅支持 **一对一好友聊天**（`senderId` 与 `receiverId`）。如后续需要支持群聊，可扩展 `groupId` 参数。

**认证方式**: Bearer Token (JWT)

### 5.3 请求参数

请求体为 `application/json`：

| 参数名        | 类型  | 必填 | 说明                                     |
|---------------|-------|------|------------------------------------------|
| `senderId`    | Long  | 是   | 发起分享的用户ID（当前登录用户）        |
| `receiverId`  | Long  | 是   | 接收分享的好友用户ID                     |
| `travelPlanId`| Long  | 是   | 要分享的旅行计划ID（n8n 生成后返回的ID） |


**请求示例**:

```json
{
  "senderId": 1001,
  "receiverId": 1002,
  "travelPlanId": 123
}
```

### 5.4 响应示例

成功时返回一条标准的聊天消息 `MessageDTO`，其中：

 - `messageType` 固定为 `travel_plan`
 - `extra` 为 JSON 字符串，包含用于渲染卡片的旅行计划关键信息（如标题、封面图、开始/结束日期等）

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "messageId": 9876,
    "senderId": 1001,
    "senderName": "alice",
    "receiverId": 1002,
    "messageType": "travel_plan",
    "isRecalled": false,
    "sentTime": "2026-01-01 10:30:00",
    "timestamp": 1767244200000,
    "isRead": false,
    "travelPlanId": 123,
    "extra": "{\n      \"cardType\": \"travel_plan\",\n      \"title\": \"上海3日游轻松行程\",\n      \"destination\": \"上海\",\n      \"travelDays\": 3,\n      \"coverImageUrl\": \"https://example.com/images/plan-123-cover.jpg\",\n      \"startDate\": \"2026-01-01\",\n      \"endDate\": \"2026-01-03\",\n      \"createdBy\": \"alice\"\n    }"
  }
}
```

### 5.5 前端展示与跳转建议

- **卡片渲染条件**：
  - 当 `messageType === 'travel_plan'` 且 `extra` 能成功解析为 JSON 时，渲染为旅行计划分享小卡片。
- **推荐使用字段**（来自 `extra`）：
  - `title`：卡片主标题（旅行计划标题）
  - `destination`：目的地
  - `travelDays`：行程天数
  - `coverImageUrl`：封面图片 URL（如无可使用占位图）
  - `startDate` / `endDate`：行程时间范围
  - `createdBy`：计划创建者昵称
- **点击行为**：
  - 从响应中的 `travelPlanId` 读取旅行计划ID，跳转到前端已有的“旅行计划详情”页面。
  - 路由和页面实现由前端决定，可选择直接基于路由参数加载，也可在进入详情页前调用既有接口（如 `GET /api/travel-plans/{id}`）获取详情。
- **与旅行计划图片的结合**：
  - 若已通过 `travel_plan_images` 接口为旅行计划配置封面图，可在服务端生成卡片数据时优先填充 `coverImageUrl` 字段；如未配置封面图，可默认取该旅行计划下的第一张景点图片作为封面，前端直接展示。

---

如需将上述接口合并进现有的 `API接口文档.md` 或 `CHAT_API_DOCUMENTATION.md` 中，可直接复制相关章节或进一步精简说明。

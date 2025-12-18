# 用户通知系统 API 文档

## 概述

用户通知系统提供了完整的通知功能，用于通知帖子作者其他用户的互动行为，包括：
- 评论通知：其他用户评论了该用户的帖子
- 收藏通知：其他用户收藏了该用户的帖子
- 浏览通知：其他用户浏览了该用户的帖子

## 基础信息

**Base URL**: `http://localhost:8080/api`

**认证方式**: Bearer Token (JWT)

所有接口都需要在请求头中携带有效的JWT Token：
```
Authorization: Bearer <your_jwt_token>
```

## 数据库设计

### 用户通知表 (user_notification)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | bigint | 通知ID（主键） |
| receiver_id | bigint | 接收者用户ID |
| sender_id | bigint | 触发者用户ID |
| sender_username | varchar(100) | 触发者用户名 |
| sender_avatar | longblob | 触发者头像 |
| notification_type | varchar(50) | 通知类型：COMMENT/FAVORITE/VIEW |
| post_id | bigint | 关联的帖子ID |
| post_title | varchar(200) | 帖子标题 |
| post_cover_image | varchar(500) | 帖子封面图 |
| comment_id | bigint | 评论ID（仅评论通知有值） |
| comment_content | text | 评论内容（仅评论通知有值） |
| is_read | tinyint(1) | 是否已读：0-未读，1-已读 |
| read_time | datetime | 阅读时间 |
| status | varchar(20) | 通知状态：active/deleted |
| is_deleted | tinyint(1) | 是否已删除（软删除） |
| created_time | datetime | 创建时间 |
| updated_time | datetime | 更新时间 |
| deleted_time | datetime | 删除时间 |

## API 接口

### 1. 获取用户的所有通知

获取当前用户的所有通知列表（按创建时间倒序）

**接口地址**: `GET /api/notifications/list`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "receiverId": 1,
      "senderId": 5,
      "senderUsername": "张三",
      "senderAvatarBase64": "base64_encoded_image_string",
      "notificationType": "COMMENT",
      "notificationTypeDesc": "评论了你的帖子",
      "postId": 2,
      "postTitle": "美丽的桂林之旅",
      "postCoverImage": "http://example.com/image.jpg",
      "commentId": 10,
      "commentContent": "这个地方太美了！",
      "isRead": false,
      "readTime": null,
      "status": "active",
      "createdTime": "2025-11-03T10:30:00",
      "updatedTime": "2025-11-03T10:30:00",
      "timeDesc": "2小时前"
    },
    {
      "id": 2,
      "receiverId": 1,
      "senderId": 3,
      "senderUsername": "李四",
      "senderAvatarBase64": "base64_encoded_image_string",
      "notificationType": "FAVORITE",
      "notificationTypeDesc": "收藏了你的帖子",
      "postId": 2,
      "postTitle": "美丽的桂林之旅",
      "postCoverImage": "http://example.com/image.jpg",
      "commentId": null,
      "commentContent": null,
      "isRead": true,
      "readTime": "2025-11-03T11:00:00",
      "status": "active",
      "createdTime": "2025-11-03T08:15:00",
      "updatedTime": "2025-11-03T11:00:00",
      "timeDesc": "4小时前"
    }
  ]
}
```

---

### 2. 获取用户的未读通知

获取当前用户的未读通知列表

**接口地址**: `GET /api/notifications/unread`

**请求头**:
```
Authorization: Bearer <token>
```

**响应格式**: 同上（仅返回未读通知）

---

### 3. 获取指定类型的通知

获取当前用户指定类型的通知列表

**接口地址**: `GET /api/notifications/type/{type}`

**路径参数**:
- `type`: 通知类型，可选值：`COMMENT`、`FAVORITE`、`VIEW`

**示例**: `GET /api/notifications/type/COMMENT`

**请求头**:
```
Authorization: Bearer <token>
```

**响应格式**: 同上（仅返回指定类型的通知）

---

### 4. 获取通知统计信息

获取当前用户的通知统计数据

**接口地址**: `GET /api/notifications/stats`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCount": 25,
    "unreadCount": 5,
    "commentCount": 15,
    "favoriteCount": 8,
    "viewCount": 2
  }
}
```

**响应字段说明**:
- `totalCount`: 总通知数（不包括已删除的）
- `unreadCount`: 未读通知数
- `commentCount`: 评论通知数
- `favoriteCount`: 收藏通知数
- `viewCount`: 浏览通知数

---

### 5. 获取未读通知数量

轻量级接口，用于前端角标显示

**接口地址**: `GET /api/notifications/unread-count`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "unreadCount": 5
  }
}
```

---

### 6. 标记单个通知为已读

将指定的通知标记为已读

**接口地址**: `PUT /api/notifications/{id}/read`

**路径参数**:
- `id`: 通知ID

**示例**: `PUT /api/notifications/1/read`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "标记成功"
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "标记失败，通知不存在或无权限",
  "data": null
}
```

---

### 7. 标记所有通知为已读

将当前用户的所有未读通知标记为已读

**接口地址**: `PUT /api/notifications/read-all`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 5,
    "message": "已标记 5 条通知为已读"
  }
}
```

---

### 8. 删除单个通知

删除指定的通知（软删除）

**接口地址**: `DELETE /api/notifications/{id}`

**路径参数**:
- `id`: 通知ID

**示例**: `DELETE /api/notifications/1`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "删除成功"
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "删除失败，通知不存在或无权限",
  "data": null
}
```

---

### 9. 删除所有已读通知

删除当前用户的所有已读通知（软删除）

**接口地址**: `DELETE /api/notifications/read-all`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 10,
    "message": "已删除 10 条已读通知"
  }
}
```

---

## 通知类型说明

| 类型 | 代码 | 描述 | 触发场景 |
|------|------|------|----------|
| 评论通知 | COMMENT | 评论了你的帖子 | 其他用户评论了该用户发布的帖子 |
| 收藏通知 | FAVORITE | 收藏了你的帖子 | 其他用户收藏了该用户发布的帖子 |
| 浏览通知 | VIEW | 浏览了你的帖子 | 其他用户浏览了该用户发布的帖子 |

## 自动通知机制

系统会在以下场景自动创建通知：

### 1. 评论通知
当用户A评论了用户B的帖子时，系统会自动：
- 创建一条COMMENT类型的通知
- 通知接收者为帖子作者（用户B）
- 通知触发者为评论者（用户A）
- 包含评论内容和评论ID
- **注意**：如果评论者是帖子作者本人，不会创建通知

### 2. 收藏通知
当用户A收藏了用户B的帖子时，系统会自动：
- 创建一条FAVORITE类型的通知
- 通知接收者为帖子作者（用户B）
- 通知触发者为收藏者（用户A）
- **注意**：如果收藏者是帖子作者本人，不会创建通知

### 3. 浏览通知
当用户A浏览了用户B的帖子时，可以调用通知服务创建VIEW类型的通知（需要在帖子详情接口中集成）

## 防重复机制

系统会检查是否已存在相同的通知（相同的接收者、发送者、通知类型和帖子ID），避免重复创建通知。

## 时间描述格式

`timeDesc` 字段会根据通知创建时间自动生成友好的时间描述：
- 小于1分钟：刚刚
- 1-59分钟：X分钟前
- 1-23小时：X小时前
- 1-6天：X天前
- 7天及以上：显示具体日期（yyyy-MM-dd）

## 使用场景示例

### 前端页面通知列表展示

```javascript
// 1. 获取所有通知
fetch('/api/notifications/list', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(res => res.json())
.then(data => {
  // 显示通知列表
  console.log(data.data);
});

// 2. 获取未读数量（角标）
fetch('/api/notifications/unread-count', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(res => res.json())
.then(data => {
  // 更新角标数字
  updateBadge(data.data.unreadCount);
});

// 3. 标记单个通知为已读
function markAsRead(notificationId) {
  fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('已标记为已读');
  });
}

// 4. 标记所有为已读
function markAllAsRead() {
  fetch('/api/notifications/read-all', {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log(`已标记 ${data.data.count} 条通知为已读`);
  });
}
```

### 通知类型筛选

```javascript
// 只查看评论通知
fetch('/api/notifications/type/COMMENT', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(res => res.json())
.then(data => {
  // 显示评论通知列表
  console.log(data.data);
});
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问（未登录或token无效） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有接口都需要用户登录后才能访问
2. 用户只能查看、操作自己的通知
3. 删除操作为软删除，数据不会真正从数据库中删除
4. 通知列表默认按创建时间倒序排列（最新的在前）
5. 系统会自动过滤已删除的通知
6. 通知的头像字段使用Base64编码，可直接在前端显示

## 数据库初始化

在使用通知系统前，请执行以下SQL脚本创建通知表：

```sql
-- 执行 user_notification.sql 文件
```

该SQL文件包含：
- 表结构定义
- 索引创建（优化查询性能）
- 外键约束（确保数据完整性）

## 测试建议

### Postman 测试步骤

1. **登录获取Token**
   - POST `/api/auth/login`
   - 保存返回的token

2. **查看通知列表**
   - GET `/api/notifications/list`
   - Headers: `Authorization: Bearer <token>`

3. **查看未读通知**
   - GET `/api/notifications/unread`
   - Headers: `Authorization: Bearer <token>`

4. **标记通知为已读**
   - PUT `/api/notifications/{id}/read`
   - Headers: `Authorization: Bearer <token>`

5. **删除通知**
   - DELETE `/api/notifications/{id}`
   - Headers: `Authorization: Bearer <token>`

## 常见问题

**Q: 为什么我看不到任何通知？**
A: 通知是由其他用户的互动行为触发的。请确保：
   - 有其他用户评论或收藏了你的帖子
   - 你已经发布了帖子
   - 通知没有被删除

**Q: 如何防止通知重复？**
A: 系统内置了防重复机制，相同的用户对同一帖子的相同类型操作不会重复创建通知。

**Q: 浏览通知什么时候会产生？**
A: 需要在帖子详情接口中调用 `notificationService.createViewNotification()` 方法来创建浏览通知。

**Q: 通知会自动过期吗？**
A: 通知不会自动过期，但用户可以手动删除已读通知。

## 联系方式

如有问题或建议，请联系开发团队。


# 旅游行程规划系统 - API接口文档

## 项目信息

- **项目名称**: Amap-MCP-Travel-Planner Backend
- **版本**: 1.0.0
- **基础URL**: `http://localhost:8081`
- **数据库**: MySQL (gd_mcp)
- **认证方式**: JWT Token (Bearer Token)

---

## 目录

1. [用户认证模块](#1-用户认证模块)
2. [帖子管理模块](#2-帖子管理模块)
3. [收藏管理模块](#3-收藏管理模块)
4. [路线管理模块](#4-路线管理模块)
5. [通知管理模块](#5-通知管理模块)
6. [反馈管理模块](#6-反馈管理模块)
7. [AI聊天模块](#7-ai聊天模块)
8. [管理员审核模块](#8-管理员审核模块)
9. [测试工具模块](#9-测试工具模块)

---

## 通用说明

### 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 错误响应格式

```json
{
  "code": 400,
  "message": "错误信息描述",
  "data": null
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

### 认证说明

需要认证的接口需要在请求头中携带JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. 用户认证模块

基础路径: `/api/auth`

### 1.1 发送验证码

**接口**: `POST /api/auth/send-verification-code`

**说明**: 发送手机验证码（用于注册和登录）

**请求体**:
```json
{
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": null
}
```

---

### 1.2 用户注册

**接口**: `POST /api/auth/register`

**说明**: 用户/管理员注册

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "password123",
  "confirmPassword": "password123",
  "verificationCode": "123456",
  "userType": "user",
  "userProfilePic": "base64_image_data"
}
```

**参数说明**:
- `userType`: `user` (普通用户) 或 `admin` (管理员)
- `userProfilePic`: 可选，Base64编码的头像

**响应**:
```json
{
  "code": 200,
  "message": "用户注册成功",
  "data": null
}
```

---

### 1.3 管理员快速注册

**接口**: `POST /api/auth/admin/quick-register`

**说明**: 管理员快速注册（无需验证码）

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "admin123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "phone": "13800138000",
    "message": "管理员注册成功"
  }
}
```

---

### 1.4 密码登录

**接口**: `POST /api/auth/login`

**说明**: 用户名密码登录

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "password123",
  "userType": "user"
}
```

**参数说明**:
- `userType`: `user` 或 `admin`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userType": "user",
    "phone": "13800138000"
  }
}
```

---

### 1.5 验证码登录

**接口**: `POST /api/auth/login-by-code`

**说明**: 使用验证码登录

**请求体**:
```json
{
  "phone": "13800138000",
  "verificationCode": "123456",
  "userType": "user"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userType": "user",
    "phone": "13800138000"
  }
}
```

---

### 1.6 七天免密登录

**接口**: `POST /api/auth/auto-login`

**说明**: 使用已有Token进行七天免密登录

**请求体**:
```json
{
  "phone": "13800138000",
  "userType": "user",
  "token": "previous-jwt-token"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "new-jwt-token",
    "userType": "user",
    "phone": "13800138000",
    "loginType": "auto_login"
  }
}
```

---

### 1.7 检查七天免密登录状态

**接口**: `POST /api/auth/check-auto-login`

**请求体**:
```json
{
  "phone": "13800138000",
  "userType": "user"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "canAutoLogin": true,
    "phone": "13800138000",
    "userType": "user"
  }
}
```

---

### 1.8 获取用户信息

**接口**: `GET /api/auth/user-info`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "phone": "13800138000",
    "userType": "user",
    "userRole": "普通用户",
    "isAdmin": false
  }
}
```

---

### 1.9 获取用户资料

**接口**: `GET /api/auth/profile`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "phone": "13800138000",
    "authorities": ["ROLE_USER"]
  }
}
```

---

### 1.10 上传头像

**接口**: `POST /api/auth/upload-avatar`

**认证**: 需要Token

**请求体**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "imageFormat": "jpeg"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "头像上传成功",
  "data": null
}
```

---

### 1.11 获取头像（二进制）

**接口**: `GET /api/auth/avatar`

**认证**: 需要Token

**响应**: 返回图片二进制数据

---

### 1.12 获取头像（Base64）

**接口**: `GET /api/auth/avatar-base64`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "phone": "13800138000"
  }
}
```

---

### 1.13 注销登录

**接口**: `POST /api/auth/logout`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "注销成功",
  "data": null
}
```

---

### 1.14 获取用户列表（管理员）

**接口**: `GET /api/auth/admin/users`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user1": "普通用户",
    "user2": "VIP用户"
  }
}
```

---

### 1.15 获取令牌统计（管理员）

**接口**: `GET /api/auth/admin/token-stats`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalTokens": 150,
    "activeTokens": 120,
    "expiredTokens": 30
  }
}
```

---

### 1.16 清理过期令牌（管理员）

**接口**: `POST /api/auth/admin/cleanup-tokens`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "过期令牌清理完成",
    "timestamp": 1699200000000
  }
}
```

---

## 2. 帖子管理模块

基础路径: `/api/post`

### 2.1 创建帖子

**接口**: `POST /api/post/create`

**认证**: 需要Token

**请求体**:
```json
{
  "title": "我的北京之旅",
  "content": "这是一次美好的旅行...",
  "contentType": "richtext",
  "postType": "travel_note",
  "destinationCity": "北京",
  "tags": "旅游,美食,景点",
  "isPublic": true,
  "allowComments": true,
  "allowShares": true,
  "coverImage": "base64_image_data",
  "attachments": ["image1_base64", "image2_base64"]
}
```

**参数说明**:
- `contentType`: `richtext` (富文本) 或 `markdown`
- `postType`: `travel_note` (游记) / `strategy` (攻略) / `qa` (问答) / `share` (分享)
- `isPublic`: 是否公开
- `allowComments`: 是否允许评论
- `allowShares`: 是否允许分享

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "我的北京之旅",
    "status": "draft",
    "createdAt": "2025-11-05T10:00:00"
  }
}
```

---

### 2.2 发布帖子

**接口**: `POST /api/post/{postId}/publish`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "status": "pending_review",
    "publishedAt": "2025-11-05T10:05:00"
  }
}
```

---

### 2.3 更新帖子

**接口**: `PUT /api/post/{postId}`

**认证**: 需要Token

**请求体**: 同创建帖子

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "我的北京之旅（已更新）",
    "updatedAt": "2025-11-05T11:00:00"
  }
}
```

---

### 2.4 删除帖子

**接口**: `DELETE /api/post/{postId}`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "帖子删除成功",
  "data": null
}
```

---

### 2.5 获取帖子详情

**接口**: `GET /api/post/{postId}`

**认证**: 可选

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "我的北京之旅",
    "content": "这是一次美好的旅行...",
    "authorPhone": "13800138000",
    "postType": "travel_note",
    "viewCount": 120,
    "likeCount": 45,
    "commentCount": 12,
    "isLiked": false,
    "createdAt": "2025-11-05T10:00:00"
  }
}
```

---

### 2.6 获取我的帖子列表

**接口**: `GET /api/post/my?status={status}`

**认证**: 需要Token

**查询参数**:
- `status`: 可选，`draft` / `published` / `pending_review` / `rejected`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "list": [
      {
        "id": 1,
        "title": "我的北京之旅",
        "status": "published",
        "viewCount": 120,
        "likeCount": 45,
        "createdAt": "2025-11-05T10:00:00"
      }
    ]
  }
}
```

---

### 2.7 获取公开帖子列表

**接口**: `GET /api/post/public?postType={type}&destinationCity={city}`

**认证**: 可选

**查询参数**:
- `postType`: 可选，帖子类型
- `destinationCity`: 可选，目的地城市

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "list": [...]
  }
}
```

---

### 2.8 搜索帖子

**接口**: `GET /api/post/search?keyword={keyword}`

**认证**: 可选

**查询参数**:
- `keyword`: 搜索关键词

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "keyword": "北京",
    "list": [...]
  }
}
```

---

### 2.9 点赞/取消点赞帖子

**接口**: `POST /api/post/{postId}/like`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "isLiked": true,
    "likeCount": 46
  }
}
```

---

### 2.10 获取帖子评论列表

**接口**: `GET /api/post/{postId}/comments`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 12,
    "list": [
      {
        "id": 1,
        "userId": 100,
        "userName": "张三",
        "commentContent": "写得真好！",
        "createdAt": "2025-11-05T11:30:00"
      }
    ]
  }
}
```

---

### 2.11 添加评论

**接口**: `POST /api/post/comment`

**认证**: 需要Token

**请求体**:
```json
{
  "postId": 1,
  "commentContent": "写得真好！",
  "parentCommentId": null
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "commentContent": "写得真好！",
    "createdAt": "2025-11-05T11:30:00"
  }
}
```

---

### 2.12 保存草稿

**接口**: `POST /api/post/draft/save`

**认证**: 需要Token

**请求体**:
```json
{
  "title": "草稿标题",
  "content": "草稿内容",
  "contentType": "richtext"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "draftId": 1,
    "message": "草稿保存成功"
  }
}
```

---

### 2.13 获取我的草稿列表

**接口**: `GET /api/post/draft/my`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "list": [
      {
        "draftId": 1,
        "title": "草稿标题",
        "updatedAt": "2025-11-05T12:00:00"
      }
    ]
  }
}
```

---

### 2.14 草稿转为帖子并发布

**接口**: `POST /api/post/draft/{draftId}/convert-and-publish`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 1,
    "status": "pending_review"
  }
}
```

---

### 2.15 删除草稿

**接口**: `DELETE /api/post/draft/{draftId}`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "草稿删除成功",
  "data": null
}
```

---

### 2.16 测试创建帖子

**接口**: `POST /api/post/test-create`

**认证**: 需要Token

**说明**: 开发测试用接口，自动创建测试帖子

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {...}
}
```

---

## 3. 收藏管理模块

基础路径: `/api/favorite`

### 3.1 获取收藏的景点列表

**接口**: `GET /api/favorite/attractions?attractionType={type}&visitStatus={status}&city={city}`

**认证**: 需要Token

**查询参数**:
- `attractionType`: 可选，景点类型
- `visitStatus`: 可选，访问状态（`visited` / `not_visited` / `planning`）
- `city`: 可选，城市

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "filters": {
      "attractionType": "scenic_spot",
      "visitStatus": "not_visited",
      "city": "北京"
    },
    "list": [
      {
        "id": 1,
        "attractionName": "故宫",
        "attractionType": "scenic_spot",
        "city": "北京",
        "visitStatus": "not_visited",
        "favoritedAt": "2025-11-01T10:00:00"
      }
    ]
  }
}
```

---

### 3.2 获取收藏的帖子列表

**接口**: `GET /api/favorite/posts?postType={type}&favoriteCategory={category}&readStatus={status}&destinationCity={city}&priorityLevel={level}`

**认证**: 需要Token

**查询参数**:
- `postType`: 可选，帖子类型
- `favoriteCategory`: 可选，收藏分类
- `readStatus`: 可选，阅读状态（`read` / `unread`）
- `destinationCity`: 可选，目的地城市
- `priorityLevel`: 可选，优先级（1-5）

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 30,
    "filters": {...},
    "list": [
      {
        "id": 1,
        "postId": 10,
        "postTitle": "北京三日游攻略",
        "postType": "strategy",
        "favoriteCategory": "travel_plan",
        "readStatus": "unread",
        "priorityLevel": 3,
        "favoritedAt": "2025-11-01T10:00:00"
      }
    ]
  }
}
```

---

### 3.3 获取收藏统计信息

**接口**: `GET /api/favorite/stats`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalAttractions": 25,
    "totalPosts": 30,
    "visitedAttractions": 10,
    "unreadPosts": 15
  }
}
```

---

### 3.4 获取收藏概览

**接口**: `GET /api/favorite/overview`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "recentAttractions": [...],
    "recentPosts": [...],
    "stats": {...}
  }
}
```

---

### 3.5 添加帖子收藏

**接口**: `POST /api/favorite/post/{postId}?favoriteCategory={category}&favoriteTags={tags}&userNotes={notes}&priorityLevel={level}`

**认证**: 需要Token

**查询参数**:
- `favoriteCategory`: 可选，收藏分类
- `favoriteTags`: 可选，标签
- `userNotes`: 可选，备注
- `priorityLevel`: 可选，优先级（1-5）

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "postId": 10,
    "favoritedAt": "2025-11-05T10:00:00"
  }
}
```

---

### 3.6 取消帖子收藏

**接口**: `DELETE /api/favorite/post/{postId}`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "取消收藏成功",
    "postId": 10
  }
}
```

---

### 3.7 检查帖子收藏状态

**接口**: `GET /api/favorite/post/{postId}/status`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 10,
    "isFavorited": true
  }
}
```

---

## 4. 路线管理模块

### 4.1 路线历史记录

基础路径: `/api/route`

#### 4.1.1 保存路线查询记录

**接口**: `POST /api/route/save-search`

**认证**: 需要Token

**请求体**:
```json
{
  "departure": "北京",
  "destination": "上海",
  "travelMode": "driving",
  "routeDetails": "具体路线信息...",
  "estimatedTime": "10小时",
  "estimatedDistance": "1200公里"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "路线查询记录已保存",
    "historyId": 1,
    "history": {...}
  }
}
```

---

#### 4.1.2 获取路线历史记录

**接口**: `GET /api/route/history`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "list": [
      {
        "id": 1,
        "departure": "北京",
        "destination": "上海",
        "travelMode": "driving",
        "isFavorite": false,
        "searchedAt": "2025-11-05T10:00:00"
      }
    ]
  }
}
```

---

#### 4.1.3 获取收藏的路线

**接口**: `GET /api/route/favorites`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "list": [...]
  }
}
```

---

#### 4.1.4 删除历史记录

**接口**: `DELETE /api/route/history/{historyId}`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "历史记录已删除",
  "data": null
}
```

---

#### 4.1.5 切换收藏状态

**接口**: `POST /api/route/history/{historyId}/toggle-favorite`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "已添加到收藏",
    "history": {...}
  }
}
```

---

### 4.2 路线收藏（行程方案）

基础路径: `/api/favorites/route`

#### 4.2.1 收藏行程方案

**接口**: `POST /api/favorites/route/favorite`

**认证**: 需要Token

**请求体**:
```json
{
  "origin": "北京",
  "destination": "上海",
  "routeData": {
    "waypoints": [...],
    "totalDistance": "1200km",
    "totalTime": "10h"
  }
}
```

**响应**:
```json
{
  "code": 200,
  "message": "Trip scheme favorited successfully.",
  "data": null
}
```

---

#### 4.2.2 取消收藏行程方案

**接口**: `POST /api/favorites/route/unfavorite/{routeId}`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "Trip scheme unfavorited successfully.",
  "data": null
}
```

---

#### 4.2.3 获取我的收藏路线

**接口**: `GET /api/favorites/route/my-favorites`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "routeId": 1,
      "origin": "北京",
      "destination": "上海",
      "favoritedAt": "2025-11-05T10:00:00"
    }
  ]
}
```

---

## 5. 通知管理模块

基础路径: `/api/notifications`

### 5.1 获取所有通知

**接口**: `GET /api/notifications/list`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "type": "COMMENT",
      "title": "新评论提醒",
      "content": "用户张三评论了你的帖子",
      "isRead": false,
      "createdAt": "2025-11-05T10:00:00"
    }
  ]
}
```

---

### 5.2 获取未读通知

**接口**: `GET /api/notifications/unread`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [...]
}
```

---

### 5.3 按类型获取通知

**接口**: `GET /api/notifications/type/{type}`

**认证**: 需要Token

**路径参数**:
- `type`: `COMMENT` / `FAVORITE` / `VIEW`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [...]
}
```

---

### 5.4 获取通知统计

**接口**: `GET /api/notifications/stats`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCount": 50,
    "unreadCount": 12,
    "commentCount": 30,
    "favoriteCount": 15,
    "viewCount": 5
  }
}
```

---

### 5.5 获取未读数量（轻量级）

**接口**: `GET /api/notifications/unread-count`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "unreadCount": 12
  }
}
```

---

### 5.6 标记单个通知为已读

**接口**: `PUT /api/notifications/{id}/read`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "标记成功",
  "data": null
}
```

---

### 5.7 标记所有通知为已读

**接口**: `PUT /api/notifications/read-all`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 12,
    "message": "已标记 12 条通知为已读"
  }
}
```

---

### 5.8 删除单个通知

**接口**: `DELETE /api/notifications/{id}`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 5.9 删除所有已读通知

**接口**: `DELETE /api/notifications/read-all`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 8,
    "message": "已删除 8 条已读通知"
  }
}
```

---

## 6. 反馈管理模块

基础路径: `/api/feedback`

### 6.1 提交反馈

**接口**: `POST /api/feedback/submit`

**认证**: 可选（支持匿名）

**请求体**:
```json
{
  "feedbackType": "bug",
  "feedbackContent": "发现一个bug...",
  "contactInfo": "13800138000",
  "attachments": ["screenshot_base64"]
}
```

**参数说明**:
- `feedbackType`: `bug` / `suggestion` / `complaint` / `praise` / `other`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "feedbackId": 1,
    "message": "反馈提交成功，感谢您的宝贵意见！",
    "status": "pending"
  }
}
```

---

### 6.2 获取所有反馈（管理员）

**接口**: `GET /api/feedback/list`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "feedbackType": "bug",
        "feedbackContent": "发现一个bug...",
        "status": "pending",
        "submittedAt": "2025-11-05T10:00:00"
      }
    ]
  }
}
```

---

### 6.3 按状态获取反馈（管理员）

**接口**: `GET /api/feedback/status/{status}`

**认证**: 需要管理员Token

**路径参数**:
- `status`: `pending` / `processing` / `resolved` / `rejected`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "status": "pending",
    "list": [...]
  }
}
```

---

### 6.4 按类型获取反馈（管理员）

**接口**: `GET /api/feedback/type/{type}`

**认证**: 需要管理员Token

**路径参数**:
- `type`: 反馈类型

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "type": "bug",
    "list": [...]
  }
}
```

---

### 6.5 获取我的反馈

**接口**: `GET /api/feedback/my`

**认证**: 需要Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "list": [...]
  }
}
```

---

### 6.6 更新反馈状态（管理员）

**接口**: `PUT /api/feedback/{id}/status?status={status}&handlerNotes={notes}`

**认证**: 需要管理员Token

**查询参数**:
- `status`: 新状态
- `handlerNotes`: 可选，处理备注

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "status": "resolved",
    "handlerNotes": "问题已修复"
  }
}
```

---

### 6.7 删除反馈（管理员）

**接口**: `DELETE /api/feedback/{id}`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 7. AI聊天模块

基础路径: `/api/chat`

### 7.1 发送消息

**接口**: `POST /api/chat/send`

**说明**: 发送消息到AI（通过n8n）

**请求体**:
```json
{
  "sessionId": "session_123456",
  "userId": "user_001",
  "chatInput": "帮我规划北京三日游"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reply": "好的，为您推荐以下行程...",
    "sessionId": "session_123456"
  }
}
```

---

### 7.2 获取聊天历史

**接口**: `GET /api/chat/history?sessionId={sessionId}`

**查询参数**:
- `sessionId`: 会话ID

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sessionId": "session_123456",
    "total": 10,
    "messages": [
      {
        "id": 1,
        "role": "user",
        "content": "帮我规划北京三日游",
        "timestamp": "2025-11-05T10:00:00"
      },
      {
        "id": 2,
        "role": "assistant",
        "content": "好的，为您推荐以下行程...",
        "timestamp": "2025-11-05T10:00:05"
      }
    ]
  }
}
```

---

## 8. 管理员审核模块

基础路径: `/api/admin/posts`

### 8.1 获取待审核帖子列表

**接口**: `GET /api/admin/posts/pending?page={page}&pageSize={pageSize}`

**认证**: 需要管理员Token

**查询参数**:
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "title": "北京游记",
        "authorPhone": "13800138000",
        "auditStatus": "pending_review",
        "createdAt": "2025-11-05T10:00:00"
      }
    ]
  }
}
```

---

### 8.2 获取所有帖子列表

**接口**: `GET /api/admin/posts/list?auditStatus={status}&status={status}&page={page}&pageSize={pageSize}`

**认证**: 需要管理员Token

**查询参数**:
- `auditStatus`: 可选，审核状态（`pending_review` / `approved` / `rejected`）
- `status`: 可选，帖子状态（`draft` / `published`）
- `page`: 页码
- `pageSize`: 每页数量

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 200,
    "page": 1,
    "pageSize": 10,
    "list": [...]
  }
}
```

---

### 8.3 获取帖子详情（管理员）

**接口**: `GET /api/admin/posts/{postId}`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "北京游记",
    "content": "...",
    "authorPhone": "13800138000",
    "auditStatus": "pending_review",
    "auditHistory": [...]
  }
}
```

---

### 8.4 审核通过

**接口**: `POST /api/admin/posts/{postId}/approve`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 1,
    "auditStatus": "approved",
    "approvedAt": "2025-11-05T10:00:00"
  }
}
```

---

### 8.5 审核拒绝

**接口**: `POST /api/admin/posts/{postId}/reject`

**认证**: 需要管理员Token

**请求体**:
```json
{
  "reason": "内容不符合社区规范"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 1,
    "auditStatus": "rejected",
    "reason": "内容不符合社区规范"
  }
}
```

---

### 8.6 删除帖子（管理员）

**接口**: `DELETE /api/admin/posts/{postId}`

**认证**: 需要管理员Token

**请求体**:
```json
{
  "reason": "违规内容"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 1,
    "message": "帖子已删除"
  }
}
```

---

### 8.7 设置精选

**接口**: `POST /api/admin/posts/{postId}/feature`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 1,
    "isFeatured": true,
    "message": "已设置为精选帖子"
  }
}
```

---

### 8.8 取消精选

**接口**: `DELETE /api/admin/posts/{postId}/feature`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 1,
    "isFeatured": false,
    "message": "已取消精选"
  }
}
```

---

### 8.9 设置置顶

**接口**: `POST /api/admin/posts/{postId}/top`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 1,
    "isTop": true,
    "message": "已设置为置顶帖子"
  }
}
```

---

### 8.10 取消置顶

**接口**: `DELETE /api/admin/posts/{postId}/top`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 1,
    "isTop": false,
    "message": "已取消置顶"
  }
}
```

---

### 8.11 获取审核统计

**接口**: `GET /api/admin/posts/statistics`

**认证**: 需要管理员Token

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPosts": 500,
    "pendingReview": 50,
    "approved": 400,
    "rejected": 50,
    "featured": 20,
    "topped": 5
  }
}
```

---

## 9. 测试工具模块

基础路径: `/api/test`

### 9.1 模拟发送验证码

**接口**: `POST /api/test/verification-code`

**说明**: 模拟第三方验证码平台，用于开发测试

**请求体**:
```json
{
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "code": 200,
  "msg": "验证码已发送到手机号",
  "phone": "13800138000",
  "expireTime": "5分钟"
}
```

**注意**: 验证码会打印在控制台，不会真实发送到手机

---

### 9.2 获取已发送的验证码

**接口**: `GET /api/test/get-sent-code/{phone}`

**说明**: 开发测试用，获取已发送的验证码

**响应**:
```json
{
  "code": 200,
  "phone": "13800138000",
  "verificationCode": "123456",
  "msg": "获取成功（仅用于开发测试）"
}
```

---

### 9.3 模拟验证码平台204响应

**接口**: `POST /api/test/verification-code-204`

**说明**: 模拟第三方平台返回204状态

**请求体**:
```json
{
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "code": 204,
  "msg": "请求成功，但未匹配到推送对象",
  "phone": "13800138000"
}
```

---

## 附录

### A. 数据字典

#### 用户类型（userType）
- `user`: 普通用户
- `admin`: 管理员

#### 帖子类型（postType）
- `travel_note`: 游记
- `strategy`: 攻略
- `qa`: 问答
- `share`: 分享

#### 帖子状态（status）
- `draft`: 草稿
- `published`: 已发布
- `pending_review`: 待审核
- `approved`: 审核通过
- `rejected`: 审核拒绝

#### 审核状态（auditStatus）
- `pending_review`: 待审核
- `approved`: 已通过
- `rejected`: 已拒绝

#### 通知类型（notificationType）
- `COMMENT`: 评论通知
- `FAVORITE`: 收藏通知
- `VIEW`: 浏览通知

#### 反馈类型（feedbackType）
- `bug`: Bug报告
- `suggestion`: 建议
- `complaint`: 投诉
- `praise`: 表扬
- `other`: 其他

#### 反馈状态（feedbackStatus）
- `pending`: 待处理
- `processing`: 处理中
- `resolved`: 已解决
- `rejected`: 已拒绝

#### 访问状态（visitStatus）
- `visited`: 已访问
- `not_visited`: 未访问
- `planning`: 计划中

#### 阅读状态（readStatus）
- `read`: 已读
- `unread`: 未读

#### 内容类型（contentType）
- `richtext`: 富文本
- `markdown`: Markdown格式

#### 旅行方式（travelMode）
- `driving`: 驾车
- `transit`: 公交
- `walking`: 步行
- `cycling`: 骑行

---

### B. 错误码对照表

| 错误码 | 说明 | 常见原因 |
|--------|------|----------|
| 400 | 请求参数错误 | 缺少必填参数、参数格式错误 |
| 401 | 未认证 | Token缺失、Token过期、Token无效 |
| 403 | 权限不足 | 需要管理员权限、无访问权限 |
| 404 | 资源不存在 | 帖子ID不存在、用户不存在 |
| 409 | 资源冲突 | 重复收藏、重复注册 |
| 500 | 服务器内部错误 | 数据库异常、第三方服务异常 |

---

### C. 环境配置

#### 开发环境
- 服务器地址: `http://localhost:8081`
- 数据库: `gd_mcp`
- JWT过期时间: 7天

#### 生产环境
- 服务器地址: `https://api.yourdomain.com`
- 数据库: 生产数据库
- JWT过期时间: 7天

---

### D. 常见问题

#### Q1: Token如何获取？
A: 通过登录接口（`/api/auth/login` 或 `/api/auth/login-by-code`）获取Token。

#### Q2: Token如何使用？
A: 在请求头中添加 `Authorization: Bearer <token>`。

#### Q3: Token过期怎么办？
A: 使用七天免密登录接口（`/api/auth/auto-login`）刷新Token。

#### Q4: 如何区分用户和管理员？
A: 通过 `userType` 字段区分，登录时返回的Token包含角色信息。

#### Q5: 如何测试验证码功能？
A: 使用测试接口 `/api/test/get-sent-code/{phone}` 获取已发送的验证码。

---

### E. 更新日志

#### 2025-11-05
- 初始版本发布
- 包含10个功能模块
- 支持用户认证、帖子管理、收藏、路线规划、通知、反馈、AI聊天等功能

---

## 联系方式

如有问题，请联系开发团队：
- 项目地址: https://codeup.aliyun.com/6708806c1c80af57f902d17f/23-S5-PBL/Amap-MCP-Travel-Planner/back-end
- 团队: 23-S5-PBL

---

**文档结束**


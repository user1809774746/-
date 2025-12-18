# 帖子收藏功能 API 文档

## 📋 目录

1. [概述](#概述)
2. [数据库表结构](#数据库表结构)
3. [API 接口列表](#api-接口列表)
4. [接口详细说明](#接口详细说明)
5. [数据模型](#数据模型)
6. [使用示例](#使用示例)
7. [错误码说明](#错误码说明)

---

## 概述

帖子收藏功能允许用户收藏感兴趣的旅游帖子，并支持分类管理、添加备注、设置优先级等个性化功能。

### 主要功能
- ✅ 添加帖子收藏
- ✅ 取消帖子收藏
- ✅ 检查收藏状态
- ✅ 获取收藏列表（支持多条件筛选）
- ✅ 收藏分类管理
- ✅ 添加个人备注和标签

---

## 数据库表结构

### travel_post_favorite 表

```sql
CREATE TABLE travel_post_favorite (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏记录ID',
    
    -- 关联信息
    user_id BIGINT NOT NULL COMMENT '收藏用户ID',
    post_id BIGINT NOT NULL COMMENT '帖子ID',
    publisher_id BIGINT NOT NULL COMMENT '帖子发布者ID',
    
    -- 帖子基本信息（冗余存储）
    post_title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    post_type VARCHAR(50) COMMENT '帖子类型',
    cover_image VARCHAR(500) COMMENT '帖子封面图片URL',
    
    -- 目的地信息
    destination_name VARCHAR(200) COMMENT '目的地名称',
    destination_city VARCHAR(100) COMMENT '目的地城市',
    destination_province VARCHAR(100) COMMENT '目的地省份',
    destination_country VARCHAR(100) DEFAULT 'China' COMMENT '目的地国家',
    
    -- 旅行相关信息
    travel_days INT COMMENT '旅行天数',
    travel_budget DECIMAL(10,2) COMMENT '旅行预算',
    travel_season VARCHAR(50) COMMENT '旅行季节',
    travel_style VARCHAR(100) COMMENT '旅行风格',
    
    -- 收藏相关信息
    favorite_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    favorite_category VARCHAR(50) DEFAULT 'general' COMMENT '收藏分类',
    favorite_tags VARCHAR(500) COMMENT '个人标签',
    user_notes TEXT COMMENT '用户备注',
    
    -- 状态和优先级
    priority_level TINYINT DEFAULT 3 COMMENT '优先级（1-5）',
    read_status VARCHAR(20) DEFAULT 'unread' COMMENT '阅读状态',
    is_archived BOOLEAN DEFAULT FALSE COMMENT '是否已归档',
    
    -- 提醒功能
    reminder_enabled BOOLEAN DEFAULT FALSE COMMENT '是否启用提醒',
    reminder_date DATETIME COMMENT '提醒时间',
    reminder_message VARCHAR(200) COMMENT '提醒消息',
    
    -- 社交功能
    is_shared BOOLEAN DEFAULT FALSE COMMENT '是否已分享',
    share_count INT DEFAULT 0 COMMENT '分享次数',
    
    -- 数据状态
    status VARCHAR(20) DEFAULT 'active' COMMENT '收藏状态',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否已删除',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_time DATETIME COMMENT '删除时间',
    
    -- 索引
    UNIQUE INDEX idx_user_post (user_id, post_id),
    INDEX idx_user_status (user_id, status, is_deleted),
    INDEX idx_favorite_time (favorite_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API 接口列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/favorite/post/{postId}` | 添加帖子收藏 | ✅ 需要 |
| DELETE | `/api/favorite/post/{postId}` | 取消帖子收藏 | ✅ 需要 |
| GET | `/api/favorite/post/{postId}/status` | 检查收藏状态 | ✅ 需要 |
| GET | `/api/favorite/posts` | 获取收藏列表 | ✅ 需要 |

---

## 接口详细说明

### 1. 添加帖子收藏

#### 基本信息
- **接口地址**: `/api/favorite/post/{postId}`
- **请求方法**: `POST`
- **需要认证**: 是

#### 请求参数

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| favoriteCategory | String | 否 | 收藏分类 | general |
| favoriteTags | String | 否 | 个人标签（逗号分隔） | - |
| userNotes | String | 否 | 用户备注 | - |
| priorityLevel | Integer | 否 | 优先级（1-5） | 3 |

**收藏分类说明**:
- `general`: 通用
- `inspiration`: 灵感
- `planning`: 规划参考
- `experience`: 经验分享

#### 请求示例

```bash
# 基本收藏
POST /api/favorite/post/123
Authorization: Bearer {token}

# 带分类和备注的收藏
POST /api/favorite/post/123?favoriteCategory=planning&favoriteTags=美食,摄影&userNotes=下次去北京参考&priorityLevel=5
Authorization: Bearer {token}
```

#### 响应示例

**成功响应** (200 OK):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 10001,
    "postId": 123,
    "publisherId": 20001,
    "postTitle": "北京三日游完整攻略",
    "postType": "strategy",
    "coverImage": "https://example.com/images/beijing.jpg",
    "destinationName": "北京",
    "destinationCity": "北京",
    "destinationProvince": "北京",
    "destinationCountry": "China",
    "travelDays": 3,
    "travelBudget": 3000.00,
    "travelSeason": "春季",
    "travelStyle": "深度游",
    "favoriteTime": "2025-10-29 16:00:00",
    "favoriteCategory": "planning",
    "favoriteTags": "美食,摄影",
    "userNotes": "下次去北京参考",
    "priorityLevel": 5,
    "readStatus": "unread",
    "isArchived": false,
    "reminderEnabled": false,
    "isShared": false,
    "shareCount": 0,
    "status": "active",
    "isDeleted": false,
    "createdTime": "2025-10-29 16:00:00",
    "updatedTime": "2025-10-29 16:00:00"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "您已经收藏过这个帖子了",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "帖子不存在",
  "data": null
}
```

```json
{
  "code": 401,
  "message": "请先登录",
  "data": null
}
```

---

### 2. 取消帖子收藏

#### 基本信息
- **接口地址**: `/api/favorite/post/{postId}`
- **请求方法**: `DELETE`
- **需要认证**: 是

#### 请求参数

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

#### 请求示例

```bash
DELETE /api/favorite/post/123
Authorization: Bearer {token}
```

#### 响应示例

**成功响应** (200 OK):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "取消收藏成功",
    "postId": 123
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "未找到收藏记录",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "该收藏已被取消",
  "data": null
}
```

---

### 3. 检查收藏状态

#### 基本信息
- **接口地址**: `/api/favorite/post/{postId}/status`
- **请求方法**: `GET`
- **需要认证**: 是

#### 请求参数

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

#### 请求示例

```bash
GET /api/favorite/post/123/status
Authorization: Bearer {token}
```

#### 响应示例

**成功响应** (200 OK):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 123,
    "isFavorited": true
  }
}
```

**未收藏**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 123,
    "isFavorited": false
  }
}
```

---

### 4. 获取收藏列表

#### 基本信息
- **接口地址**: `/api/favorite/posts`
- **请求方法**: `GET`
- **需要认证**: 是

#### 请求参数

**查询参数** (所有参数都是可选的，支持多条件组合筛选):
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| postType | String | 否 | 帖子类型 | strategy |
| favoriteCategory | String | 否 | 收藏分类 | planning |
| readStatus | String | 否 | 阅读状态 | unread |
| destinationCity | String | 否 | 目的地城市 | 北京 |
| priorityLevel | Integer | 否 | 优先级 | 5 |

**帖子类型说明**:
- `travel_note`: 游记
- `strategy`: 攻略
- `photo_share`: 照片分享
- `video_share`: 视频分享
- `qa`: 问答

**阅读状态说明**:
- `unread`: 未读
- `reading`: 阅读中
- `read`: 已读

#### 请求示例

```bash
# 获取所有收藏
GET /api/favorite/posts
Authorization: Bearer {token}

# 获取攻略类型的收藏
GET /api/favorite/posts?postType=strategy
Authorization: Bearer {token}

# 获取未读的规划参考收藏
GET /api/favorite/posts?favoriteCategory=planning&readStatus=unread
Authorization: Bearer {token}

# 多条件筛选：北京的高优先级攻略
GET /api/favorite/posts?postType=strategy&destinationCity=北京&priorityLevel=5
Authorization: Bearer {token}
```

#### 响应示例

**成功响应** (200 OK):
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 10001,
      "postId": 123,
      "publisherId": 20001,
      "postTitle": "北京三日游完整攻略",
      "postType": "strategy",
      "coverImage": "https://example.com/images/beijing.jpg",
      "destinationName": "北京",
      "destinationCity": "北京",
      "destinationProvince": "北京",
      "destinationCountry": "China",
      "travelDays": 3,
      "travelBudget": 3000.00,
      "travelSeason": "春季",
      "travelStyle": "深度游",
      "favoriteTime": "2025-10-29 16:00:00",
      "favoriteCategory": "planning",
      "favoriteTags": "美食,摄影",
      "userNotes": "下次去北京参考",
      "priorityLevel": 5,
      "readStatus": "unread",
      "isArchived": false,
      "status": "active",
      "createdTime": "2025-10-29 16:00:00",
      "updatedTime": "2025-10-29 16:00:00"
    },
    {
      "id": 2,
      "userId": 10001,
      "postId": 124,
      "publisherId": 20002,
      "postTitle": "上海美食探店指南",
      "postType": "travel_note",
      "coverImage": "https://example.com/images/shanghai.jpg",
      "destinationName": "上海",
      "destinationCity": "上海",
      "destinationProvince": "上海",
      "destinationCountry": "China",
      "travelDays": 2,
      "travelBudget": 2000.00,
      "favoriteTime": "2025-10-28 10:00:00",
      "favoriteCategory": "inspiration",
      "favoriteTags": "美食",
      "userNotes": "收藏了好多餐厅",
      "priorityLevel": 4,
      "readStatus": "read",
      "isArchived": false,
      "status": "active",
      "createdTime": "2025-10-28 10:00:00",
      "updatedTime": "2025-10-28 10:00:00"
    }
  ]
}
```

---

## 数据模型

### TravelPostFavoriteResponse

收藏帖子的响应对象。

```json
{
  "id": "收藏记录ID",
  "userId": "用户ID",
  "postId": "帖子ID",
  "publisherId": "发布者ID",
  "postTitle": "帖子标题",
  "postType": "帖子类型",
  "coverImage": "封面图片URL",
  "destinationName": "目的地名称",
  "destinationCity": "目的地城市",
  "destinationProvince": "目的地省份",
  "destinationCountry": "目的地国家",
  "travelDays": "旅行天数",
  "travelBudget": "旅行预算",
  "travelSeason": "旅行季节",
  "travelStyle": "旅行风格",
  "favoriteTime": "收藏时间",
  "favoriteCategory": "收藏分类",
  "favoriteTags": "个人标签",
  "userNotes": "用户备注",
  "priorityLevel": "优先级",
  "readStatus": "阅读状态",
  "isArchived": "是否归档",
  "reminderEnabled": "是否启用提醒",
  "reminderDate": "提醒日期",
  "reminderMessage": "提醒消息",
  "isShared": "是否已分享",
  "shareCount": "分享次数",
  "status": "收藏状态",
  "isDeleted": "是否已删除",
  "createdTime": "创建时间",
  "updatedTime": "更新时间",
  "deletedTime": "删除时间"
}
```

---

## 使用示例

### 前端集成示例 (JavaScript)

```javascript
// API 配置
const API_BASE_URL = 'http://localhost:8081/api';
const token = localStorage.getItem('token');

// 1. 添加收藏
async function addFavorite(postId, options = {}) {
  const params = new URLSearchParams();
  if (options.favoriteCategory) params.append('favoriteCategory', options.favoriteCategory);
  if (options.favoriteTags) params.append('favoriteTags', options.favoriteTags);
  if (options.userNotes) params.append('userNotes', options.userNotes);
  if (options.priorityLevel) params.append('priorityLevel', options.priorityLevel);

  const url = `${API_BASE_URL}/favorite/post/${postId}${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例
const result = await addFavorite(123, {
  favoriteCategory: 'planning',
  favoriteTags: '美食,摄影',
  userNotes: '下次去北京参考',
  priorityLevel: 5
});

if (result.code === 200) {
  console.log('收藏成功', result.data);
} else {
  console.error('收藏失败', result.message);
}

// 2. 取消收藏
async function removeFavorite(postId) {
  const response = await fetch(`${API_BASE_URL}/favorite/post/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例
const result = await removeFavorite(123);
if (result.code === 200) {
  console.log('取消收藏成功');
}

// 3. 检查收藏状态
async function checkFavoriteStatus(postId) {
  const response = await fetch(`${API_BASE_URL}/favorite/post/${postId}/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例
const result = await checkFavoriteStatus(123);
console.log('是否已收藏:', result.data.isFavorited);

// 4. 获取收藏列表
async function getFavoriteList(filters = {}) {
  const params = new URLSearchParams();
  if (filters.postType) params.append('postType', filters.postType);
  if (filters.favoriteCategory) params.append('favoriteCategory', filters.favoriteCategory);
  if (filters.readStatus) params.append('readStatus', filters.readStatus);
  if (filters.destinationCity) params.append('destinationCity', filters.destinationCity);
  if (filters.priorityLevel) params.append('priorityLevel', filters.priorityLevel);

  const url = `${API_BASE_URL}/favorite/posts${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 使用示例：获取所有攻略类的收藏
const favorites = await getFavoriteList({ postType: 'strategy' });
console.log('收藏列表:', favorites.data);
```

### React 组件示例

```jsx
import React, { useState, useEffect } from 'react';

function FavoriteButton({ postId }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // 检查收藏状态
  useEffect(() => {
    checkFavoriteStatus();
  }, [postId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorite/post/${postId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.code === 200) {
        setIsFavorited(result.data.isFavorited);
      }
    } catch (error) {
      console.error('检查收藏状态失败', error);
    }
  };

  const toggleFavorite = async () => {
    setLoading(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/favorite/post/${postId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      if (result.code === 200) {
        setIsFavorited(!isFavorited);
        alert(isFavorited ? '取消收藏成功' : '收藏成功');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('操作失败', error);
      alert('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFavorite} 
      disabled={loading}
      className={isFavorited ? 'favorited' : ''}
    >
      {loading ? '处理中...' : (isFavorited ? '已收藏' : '收藏')}
    </button>
  );
}

export default FavoriteButton;
```

---

## 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未登录或Token失效 | 重新登录获取Token |
| 404 | 资源不存在 | 检查帖子ID是否正确 |
| 500 | 服务器内部错误 | 联系技术支持 |

### 常见错误消息

| 错误消息 | 原因 | 解决方案 |
|----------|------|----------|
| "请先登录" | 未提供认证Token | 先调用登录接口获取Token |
| "用户不存在" | Token对应的用户不存在 | 重新登录 |
| "帖子不存在" | 帖子ID无效或已被删除 | 检查帖子ID |
| "您已经收藏过这个帖子了" | 重复收藏 | 先检查收藏状态 |
| "未找到收藏记录" | 取消不存在的收藏 | 先检查是否已收藏 |
| "该收藏已被取消" | 重复取消收藏 | 无需处理 |

---

## 注意事项

### 1. 认证要求
- 所有接口都需要在请求头中携带有效的 JWT Token
- Token 格式: `Authorization: Bearer {token}`

### 2. 收藏去重
- 系统会自动检查重复收藏，同一用户不能重复收藏同一帖子
- 如果已收藏，再次收藏会返回错误提示

### 3. 软删除机制
- 取消收藏采用软删除方式，数据不会真正删除
- 软删除的收藏记录 `is_deleted = true`, `status = 'deleted'`

### 4. 收藏计数
- 添加收藏时，帖子的 `favorite_count` 会自动 +1
- 取消收藏时，帖子的 `favorite_count` 会自动 -1

### 5. 数据冗余
- 收藏表中冗余存储了帖子的基本信息，提高查询效率
- 如果原帖子被修改，收藏记录中的信息不会自动更新

### 6. 分类和标签
- `favoriteCategory` 使用预定义的分类值
- `favoriteTags` 是用户自定义的标签，用逗号分隔

---

## 更新日志

### v1.0.0 (2025-10-29)
- ✅ 实现添加收藏接口
- ✅ 实现取消收藏接口
- ✅ 实现检查收藏状态接口
- ✅ 支持收藏分类管理
- ✅ 支持个人标签和备注
- ✅ 支持优先级设置
- ✅ 实现多条件筛选查询

---

## 技术支持

如有问题，请联系技术支持团队。

**文档版本**: v1.0.0  
**最后更新**: 2025-10-29


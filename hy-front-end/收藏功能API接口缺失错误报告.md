# 收藏功能API接口缺失错误报告

## 错误概述

前端"我的收藏"功能已开发完成，但在测试过程中发现后端缺少以下API接口，导致功能无法正常使用。所有接口都返回404错误。

## 缺失的API接口列表

### 1. 获取收藏概览接口
- **接口地址**: `GET /api/favorite/overview`
- **错误信息**: `HTTP 404: Not Found`
- **用途**: 获取用户收藏的概览信息，包括最近收藏的景点和帖子各5条，以及统计信息

### 2. 获取收藏统计接口
- **接口地址**: `GET /api/favorite/stats`
- **错误信息**: `HTTP 404: Not Found`
- **用途**: 获取用户的收藏统计信息，包括总数、分类统计、目的地统计等

### 3. 获取景点收藏列表接口
- **接口地址**: `GET /api/favorite/attractions`
- **错误信息**: `HTTP 404: Not Found`
- **用途**: 获取用户收藏的所有景点，支持按景点类型、游览状态、城市等条件筛选

### 4. 获取帖子收藏列表接口
- **接口地址**: `GET /api/favorite/posts`
- **错误信息**: `HTTP 404: Not Found`
- **用途**: 获取用户收藏的所有旅游帖子，支持按帖子类型、收藏分类、阅读状态等条件筛选

## 详细错误日志

```
config.js:126 📨 响应数据: {timestamp: '2025-10-28T07:52:05.530+00:00', status: 404, error: 'Not Found', path: '/api/favorite/overview'}
config.js:154 ❌ API请求失败: /api/favorite/overview Error: HTTP 404: Not Found

config.js:126 📨 响应数据: {timestamp: '2025-10-28T07:52:05.530+00:00', status: 404, error: 'Not Found', path: '/api/favorite/stats'}
config.js:154 ❌ API请求失败: /api/favorite/stats Error: HTTP 404: Not Found

config.js:126 📨 响应数据: {timestamp: '2025-10-28T07:52:05.536+00:00', status: 404, error: 'Not Found', path: '/api/favorite/attractions'}
config.js:154 ❌ API请求失败: /api/favorite/attractions Error: HTTP 404: Not Found
```

## 需要实现的接口详细规范

### 1. 获取景点收藏列表
```
GET /api/favorite/attractions
Authorization: Bearer <JWT Token>

Query Parameters:
- attractionType (可选): natural, cultural, historical, entertainment, religious
- visitStatus (可选): not_visited, visited, planned
- city (可选): 城市名称

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "filters": {
      "attractionType": "historical",
      "city": "北京市"
    },
    "list": [
      {
        "id": 1,
        "userId": 10001,
        "attractionName": "故宫博物院",
        "attractionNameEn": "Forbidden City",
        "attractionAddress": "北京市东城区景山前街4号",
        "attractionLat": 39.9163,
        "attractionLng": 116.3972,
        "attractionType": "historical",
        "attractionLevel": "5A",
        "attractionRating": 4.8,
        "attractionDescription": "中国明清两朝的皇家宫殿，世界文化遗产",
        "attractionImageUrl": "https://example.com/images/forbidden-city.jpg",
        "ticketPrice": 60.00,
        "openingHours": "08:30-17:00",
        "contactPhone": "010-85007421",
        "officialWebsite": "https://www.dpm.org.cn",
        "favoriteTime": "2024-10-15T09:30:00",
        "visitStatus": "visited",
        "visitDate": "2024-10-20",
        "userRating": 5,
        "userNotes": "一定要提前网上预约门票！建议游览4-6小时",
        "tags": "历史,文化,摄影,必游,世界遗产",
        "isPublic": false,
        "viewCount": 0,
        "shareCount": 0,
        "dataSource": "user_input",
        "externalId": null,
        "createdTime": "2024-10-15T09:30:00",
        "updatedTime": "2024-10-20T18:00:00"
      }
    ]
  }
}
```

### 2. 获取帖子收藏列表
```
GET /api/favorite/posts
Authorization: Bearer <JWT Token>

Query Parameters:
- postType (可选): travel_note, strategy, photo_share, video_share, qa
- favoriteCategory (可选): general, inspiration, planning, experience
- readStatus (可选): unread, read, reading
- destinationCity (可选): 目的地城市
- priorityLevel (可选): 1, 2, 3, 4, 5

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 2,
    "filters": {
      "postType": "strategy",
      "readStatus": "unread"
    },
    "list": [
      {
        "id": 1,
        "userId": 10001,
        "postId": 1001,
        "publisherId": 20001,
        "postTitle": "北京三日游完美攻略",
        "postType": "strategy",
        "coverImage": "https://example.com/images/beijing-cover.jpg",
        "destinationName": "北京",
        "destinationCity": "北京市",
        "destinationProvince": "北京市",
        "destinationCountry": "China",
        "travelDays": 3,
        "travelBudget": 1500.00,
        "travelSeason": "autumn",
        "travelStyle": "family",
        "favoriteTime": "2024-10-15T14:30:00",
        "favoriteCategory": "planning",
        "favoriteTags": "攻略,家庭游,经典路线,省钱",
        "userNotes": "准备国庆带家人去北京，这个攻略很实用",
        "priorityLevel": 5,
        "readStatus": "unread",
        "isArchived": false,
        "reminderEnabled": true,
        "reminderDate": "2024-10-25T09:00:00",
        "reminderMessage": "国庆出行前再看一遍攻略",
        "isShared": false,
        "shareCount": 0,
        "status": "active",
        "createdTime": "2024-10-15T14:30:00",
        "updatedTime": "2024-10-15T14:30:00"
      }
    ]
  }
}
```

### 3. 获取收藏统计信息
```
GET /api/favorite/stats
Authorization: Bearer <JWT Token>

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "totalAttractions": 5,
    "totalPosts": 8,
    "totalFavorites": 13,
    "attractionTypeStats": {
      "historical": 2,
      "cultural": 2,
      "natural": 1
    },
    "postTypeStats": {
      "strategy": 3,
      "travel_note": 4,
      "photo_share": 1
    },
    "destinationStats": {
      "北京市": 4,
      "上海市": 2,
      "西藏自治区": 1,
      "云南省": 1
    }
  }
}
```

### 4. 获取收藏概览
```
GET /api/favorite/overview
Authorization: Bearer <JWT Token>

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "recentAttractions": [
      {
        "id": 1,
        "attractionName": "故宫博物院",
        "attractionType": "historical",
        "favoriteTime": "2024-10-15T09:30:00",
        "visitStatus": "visited"
      }
    ],
    "recentPosts": [
      {
        "id": 1,
        "postTitle": "北京三日游完美攻略",
        "postType": "strategy",
        "favoriteTime": "2024-10-15T14:30:00",
        "readStatus": "unread"
      }
    ],
    "stats": {
      "totalAttractions": 5,
      "totalPosts": 8,
      "totalFavorites": 13,
      "attractionTypeStats": {
        "historical": 2,
        "cultural": 2,
        "natural": 1
      },
      "postTypeStats": {
        "strategy": 3,
        "travel_note": 4,
        "photo_share": 1
      }
    }
  }
}
```

## 数据库表结构建议

### 景点收藏表 (attraction_favorites)
```sql
CREATE TABLE attraction_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    attraction_name VARCHAR(200) NOT NULL,
    attraction_name_en VARCHAR(200),
    attraction_address VARCHAR(500),
    attraction_lat DOUBLE,
    attraction_lng DOUBLE,
    attraction_type VARCHAR(50),
    attraction_level VARCHAR(20),
    attraction_rating DECIMAL(3,2),
    attraction_description TEXT,
    attraction_image_url VARCHAR(500),
    ticket_price DECIMAL(10,2),
    opening_hours VARCHAR(200),
    contact_phone VARCHAR(50),
    official_website VARCHAR(500),
    favorite_time DATETIME NOT NULL,
    visit_status VARCHAR(20) DEFAULT 'not_visited',
    visit_date DATE,
    user_rating INT,
    user_notes TEXT,
    tags VARCHAR(500),
    is_public BOOLEAN DEFAULT false,
    view_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    data_source VARCHAR(50) DEFAULT 'user_input',
    external_id VARCHAR(100),
    created_time DATETIME NOT NULL,
    updated_time DATETIME NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_favorite_time (favorite_time),
    INDEX idx_attraction_type (attraction_type),
    INDEX idx_visit_status (visit_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 帖子收藏表 (post_favorites)
```sql
CREATE TABLE post_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    publisher_id BIGINT,
    post_title VARCHAR(200) NOT NULL,
    post_type VARCHAR(50),
    cover_image VARCHAR(500),
    destination_name VARCHAR(100),
    destination_city VARCHAR(100),
    destination_province VARCHAR(100),
    destination_country VARCHAR(100),
    travel_days INT,
    travel_budget DECIMAL(10,2),
    travel_season VARCHAR(20),
    travel_style VARCHAR(50),
    favorite_time DATETIME NOT NULL,
    favorite_category VARCHAR(50) DEFAULT 'general',
    favorite_tags VARCHAR(500),
    user_notes TEXT,
    priority_level INT DEFAULT 3,
    read_status VARCHAR(20) DEFAULT 'unread',
    is_archived BOOLEAN DEFAULT false,
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_date DATETIME,
    reminder_message VARCHAR(200),
    is_shared BOOLEAN DEFAULT false,
    share_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_time DATETIME NOT NULL,
    updated_time DATETIME NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_favorite_time (favorite_time),
    INDEX idx_post_type (post_type),
    INDEX idx_read_status (read_status),
    INDEX idx_priority_level (priority_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 错误码规范

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误或业务逻辑错误 |
| 401 | 未登录或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 认证要求

所有收藏相关接口都需要用户登录认证，请在请求头中验证JWT Token：
```
Authorization: Bearer <JWT Token>
```

## 优先级建议

1. **高优先级**: `/api/favorite/overview` - 用于首页展示
2. **高优先级**: `/api/favorite/stats` - 用于统计展示
3. **中优先级**: `/api/favorite/attractions` - 景点收藏列表
4. **中优先级**: `/api/favorite/posts` - 帖子收藏列表

## 测试建议

实现接口后，建议使用以下测试数据进行验证：
1. 创建几条测试收藏数据
2. 验证筛选参数是否生效
3. 验证分页功能（如果需要）
4. 验证权限控制（用户只能看到自己的收藏）

## 联系方式

如有技术问题或需要进一步澄清，请联系前端开发团队。

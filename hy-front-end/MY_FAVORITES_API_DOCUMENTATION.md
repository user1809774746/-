# "我的收藏" API 接口文档

## 概述
本文档描述了"我的收藏"功能的接口，包括景点收藏和帖子收藏两个核心模块。用户可以查看、筛选和管理自己收藏的景点和旅游帖子。

---

## 接口列表

### 1. 获取景点收藏列表

**接口描述**  
获取当前用户收藏的所有景点，支持按景点类型、游览状态、城市等条件筛选。

**接口地址**  
`GET /api/favorite/attractions`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**请求参数（Query Parameters）**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| attractionType | String | 否 | 景点类型筛选 | natural, cultural, historical, entertainment, religious |
| visitStatus | String | 否 | 游览状态筛选 | not_visited, visited, planned |
| city | String | 否 | 城市筛选 | 北京市, 上海市 |

**景点类型说明**
- `natural`: 自然景观
- `cultural`: 文化景观  
- `historical`: 历史遗迹
- `entertainment`: 娱乐场所
- `religious`: 宗教场所

**游览状态说明**
- `not_visited`: 未游览
- `visited`: 已游览
- `planned`: 计划游览

**请求示例**

```bash
# 获取所有景点收藏
GET /api/favorite/attractions

# 按景点类型筛选
GET /api/favorite/attractions?attractionType=historical

# 按游览状态筛选
GET /api/favorite/attractions?visitStatus=not_visited

# 按城市筛选
GET /api/favorite/attractions?city=北京市

# 组合筛选
GET /api/favorite/attractions?attractionType=cultural&city=北京市
```

**响应参数**

成功响应（200）：

```json
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
      },
      {
        "id": 2,
        "userId": 10001,
        "attractionName": "天安门广场",
        "attractionNameEn": "Tiananmen Square",
        "attractionAddress": "北京市东城区东长安街",
        "attractionLat": 39.9042,
        "attractionLng": 116.4074,
        "attractionType": "cultural",
        "attractionLevel": "无等级",
        "attractionRating": 4.7,
        "attractionDescription": "世界上最大的城市广场之一，中华人民共和国的象征",
        "attractionImageUrl": "https://example.com/images/tiananmen.jpg",
        "ticketPrice": 0.00,
        "openingHours": "全天开放",
        "contactPhone": null,
        "officialWebsite": null,
        "favoriteTime": "2024-10-14T16:20:00",
        "visitStatus": "visited",
        "visitDate": "2024-10-20",
        "userRating": 4,
        "userNotes": "早上可以看升旗仪式，建议5点到达",
        "tags": "历史,文化,免费,必游,升旗仪式",
        "isPublic": true,
        "viewCount": 2,
        "shareCount": 1,
        "dataSource": "user_input",
        "externalId": null,
        "createdTime": "2024-10-14T16:20:00",
        "updatedTime": "2024-10-20T18:30:00"
      }
    ]
  }
}
```

错误响应：

```json
{
  "code": 401,
  "message": "请先登录",
  "data": null
}
```

---

### 2. 获取帖子收藏列表

**接口描述**  
获取当前用户收藏的所有旅游帖子，支持按帖子类型、收藏分类、阅读状态、目的地、优先级等条件筛选。

**接口地址**  
`GET /api/favorite/posts`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**请求参数（Query Parameters）**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| postType | String | 否 | 帖子类型筛选 | travel_note, strategy, photo_share, video_share, qa |
| favoriteCategory | String | 否 | 收藏分类筛选 | general, inspiration, planning, experience |
| readStatus | String | 否 | 阅读状态筛选 | unread, read, reading |
| destinationCity | String | 否 | 目的地城市筛选 | 北京市, 上海市 |
| priorityLevel | Integer | 否 | 优先级筛选 | 1, 2, 3, 4, 5 |

**帖子类型说明**
- `travel_note`: 游记
- `strategy`: 攻略
- `photo_share`: 照片分享
- `video_share`: 视频分享
- `qa`: 问答

**收藏分类说明**
- `general`: 通用
- `inspiration`: 灵感
- `planning`: 规划参考
- `experience`: 经验分享

**阅读状态说明**
- `unread`: 未读
- `read`: 已读
- `reading`: 阅读中

**请求示例**

```bash
# 获取所有帖子收藏
GET /api/favorite/posts

# 按帖子类型筛选
GET /api/favorite/posts?postType=strategy

# 按收藏分类筛选
GET /api/favorite/posts?favoriteCategory=planning

# 按阅读状态筛选
GET /api/favorite/posts?readStatus=unread

# 按目的地筛选
GET /api/favorite/posts?destinationCity=北京市

# 按优先级筛选
GET /api/favorite/posts?priorityLevel=5

# 组合筛选
GET /api/favorite/posts?postType=strategy&readStatus=unread&priorityLevel=4
```

**响应参数**

成功响应（200）：

```json
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
      },
      {
        "id": 2,
        "userId": 10001,
        "postId": 1002,
        "publisherId": 20002,
        "postTitle": "西藏自驾游记：追寻心中的净土",
        "postType": "travel_note",
        "coverImage": "https://example.com/images/tibet-cover.jpg",
        "destinationName": "西藏",
        "destinationCity": "拉萨市",
        "destinationProvince": "西藏自治区",
        "destinationCountry": "China",
        "travelDays": 15,
        "travelBudget": 8000.00,
        "travelSeason": "summer",
        "travelStyle": "solo",
        "favoriteTime": "2024-10-14T16:45:00",
        "favoriteCategory": "inspiration",
        "favoriteTags": "自驾,西藏,摄影,心灵之旅",
        "userNotes": "梦想中的西藏之旅，先收藏学习经验",
        "priorityLevel": 4,
        "readStatus": "reading",
        "isArchived": false,
        "reminderEnabled": false,
        "reminderDate": null,
        "reminderMessage": null,
        "isShared": true,
        "shareCount": 2,
        "status": "active",
        "createdTime": "2024-10-14T16:45:00",
        "updatedTime": "2024-10-16T10:20:00"
      }
    ]
  }
}
```

---

### 3. 获取收藏统计信息

**接口描述**  
获取当前用户的收藏统计信息，包括总数、分类统计、目的地统计等。

**接口地址**  
`GET /api/favorite/stats`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**请求参数**  
无

**响应参数**

成功响应（200）：

```json
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

---

### 4. 获取收藏概览

**接口描述**  
获取用户收藏的概览信息，包括最近收藏的景点和帖子（各5条），以及统计信息。适用于首页或概览页面展示。

**接口地址**  
`GET /api/favorite/overview`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**请求参数**  
无

**响应参数**

成功响应（200）：

```json
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

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误或业务逻辑错误 |
| 401 | 未登录或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 前端集成示例

### JavaScript/Vue.js 示例

```javascript
// 获取景点收藏列表
async function getAttractionFavorites(filters = {}) {
  const params = new URLSearchParams();
  if (filters.attractionType) params.append('attractionType', filters.attractionType);
  if (filters.visitStatus) params.append('visitStatus', filters.visitStatus);
  if (filters.city) params.append('city', filters.city);
  
  const response = await fetch(`/api/favorite/attractions?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 获取帖子收藏列表
async function getPostFavorites(filters = {}) {
  const params = new URLSearchParams();
  if (filters.postType) params.append('postType', filters.postType);
  if (filters.favoriteCategory) params.append('favoriteCategory', filters.favoriteCategory);
  if (filters.readStatus) params.append('readStatus', filters.readStatus);
  if (filters.destinationCity) params.append('destinationCity', filters.destinationCity);
  if (filters.priorityLevel) params.append('priorityLevel', filters.priorityLevel);
  
  const response = await fetch(`/api/favorite/posts?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 获取收藏统计
async function getFavoriteStats() {
  const response = await fetch('/api/favorite/stats', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 获取收藏概览
async function getFavoriteOverview() {
  const response = await fetch('/api/favorite/overview', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 使用示例
async function loadMyFavorites() {
  try {
    // 加载概览数据
    const overview = await getFavoriteOverview();
    console.log('收藏概览:', overview);
    
    // 加载景点收藏（筛选历史类景点）
    const attractions = await getAttractionFavorites({
      attractionType: 'historical'
    });
    console.log('历史景点收藏:', attractions);
    
    // 加载帖子收藏（筛选未读攻略）
    const posts = await getPostFavorites({
      postType: 'strategy',
      readStatus: 'unread'
    });
    console.log('未读攻略收藏:', posts);
    
    // 加载统计信息
    const stats = await getFavoriteStats();
    console.log('收藏统计:', stats);
    
  } catch (error) {
    console.error('加载收藏数据失败:', error.message);
  }
}
```

### React 示例

```jsx
import React, { useState, useEffect } from 'react';

const MyFavoritesPage = () => {
  const [attractions, setAttractions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // 并行加载数据
      const [attractionsData, postsData, statsData] = await Promise.all([
        getAttractionFavorites(),
        getPostFavorites(),
        getFavoriteStats()
      ]);
      
      setAttractions(attractionsData.list);
      setPosts(postsData.list);
      setStats(statsData);
    } catch (error) {
      console.error('加载收藏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="my-favorites">
      <h1>我的收藏</h1>
      
      {/* 统计信息 */}
      <div className="stats-section">
        <div className="stat-item">
          <span>景点收藏</span>
          <span>{stats.totalAttractions}</span>
        </div>
        <div className="stat-item">
          <span>帖子收藏</span>
          <span>{stats.totalPosts}</span>
        </div>
        <div className="stat-item">
          <span>总收藏</span>
          <span>{stats.totalFavorites}</span>
        </div>
      </div>
      
      {/* 景点收藏列表 */}
      <div className="attractions-section">
        <h2>收藏的景点</h2>
        {attractions.map(attraction => (
          <div key={attraction.id} className="attraction-item">
            <h3>{attraction.attractionName}</h3>
            <p>{attraction.attractionAddress}</p>
            <span className="type">{attraction.attractionType}</span>
            <span className="status">{attraction.visitStatus}</span>
          </div>
        ))}
      </div>
      
      {/* 帖子收藏列表 */}
      <div className="posts-section">
        <h2>收藏的帖子</h2>
        {posts.map(post => (
          <div key={post.id} className="post-item">
            <h3>{post.postTitle}</h3>
            <p>{post.destinationName} · {post.travelDays}天</p>
            <span className="type">{post.postType}</span>
            <span className="status">{post.readStatus}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFavoritesPage;
```

---

## 注意事项

1. **认证要求**：所有接口都需要用户登录，请在请求头中携带有效的JWT Token
2. **数据权限**：用户只能查看自己的收藏数据，不能访问其他用户的收藏
3. **筛选参数**：所有筛选参数都是可选的，不传参数时返回全部数据
4. **排序规则**：默认按收藏时间倒序排列，最新收藏的显示在最前面
5. **数据完整性**：返回的数据包含完整的收藏信息，前端可根据需要选择显示的字段
6. **性能优化**：概览接口限制返回最近5条数据，适用于首页快速展示
7. **错误处理**：请根据返回的错误码进行相应的错误处理和用户提示

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-10-28 | 初始版本，实现基础的收藏查询功能 |

---

## 联系方式

如有问题或建议，请联系开发团队。

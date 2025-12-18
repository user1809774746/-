# 用户发布帖子 API 接口文档

## 概述
本文档描述了用户发布帖子功能的完整接口，包括帖子创建、发布、编辑、删除、点赞、评论、草稿管理等功能。

---

## 接口列表

### 1. 创建帖子（保存为草稿）

**接口描述**  
创建一个新帖子并保存为草稿状态，用户可以稍后编辑和发布。

**接口地址**  
`POST /api/post/create`

**请求头**  
```
Authorization: Bearer <JWT Token>
Content-Type: application/json
```

**请求参数（Request Body）**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| title | String | 是 | 帖子标题 | "北京三日游完美攻略" |
| summary | String | 否 | 帖子摘要 | "详细介绍北京三天两夜的经典路线" |
| content | String | 是 | 帖子内容 | "# 北京三日游攻略\n\n..." |
| contentType | String | 否 | 内容类型 | "richtext", "markdown", "plain_text" |
| postType | String | 否 | 帖子类型 | "travel_note", "strategy", "photo_share", "video_share", "qa" |
| category | String | 否 | 帖子分类 | "domestic", "international", "city_walk", "adventure" |
| coverImage | String | 否 | 封面图片URL | "https://example.com/cover.jpg" |
| images | Array | 否 | 图片URL数组 | ["url1", "url2"] |
| videos | Array | 否 | 视频URL数组 | ["url1", "url2"] |
| destinationName | String | 否 | 目的地名称 | "北京" |
| destinationCity | String | 否 | 目的地城市 | "北京市" |
| destinationProvince | String | 否 | 目的地省份 | "北京市" |
| travelDays | Integer | 否 | 旅行天数 | 3 |
| travelBudget | Decimal | 否 | 旅行预算 | 1500.00 |
| actualCost | Decimal | 否 | 实际花费 | 1350.00 |
| travelSeason | String | 否 | 旅行季节 | "spring", "summer", "autumn", "winter" |
| travelStyle | String | 否 | 旅行风格 | "backpack", "luxury", "family", "couple", "solo" |
| tags | String | 否 | 标签 | "攻略,家庭游,经典路线" |
| keywords | String | 否 | 关键词 | "北京旅游,三日游,攻略" |
| isPublic | Boolean | 否 | 是否公开 | true |
| allowComments | Boolean | 否 | 是否允许评论 | true |
| allowShares | Boolean | 否 | 是否允许分享 | true |

**请求示例**

```json
{
  "title": "北京三日游完美攻略",
  "summary": "详细介绍北京三天两夜的经典路线，包含故宫、长城、颐和园等必游景点",
  "content": "# 北京三日游完美攻略\n\n## 第一天：天安门广场 - 故宫博物院\n\n早上5点到达天安门广场观看升旗仪式...",
  "contentType": "markdown",
  "postType": "strategy",
  "category": "domestic",
  "coverImage": "https://example.com/images/beijing-cover.jpg",
  "images": [
    "https://example.com/images/tiananmen.jpg",
    "https://example.com/images/forbidden-city.jpg"
  ],
  "destinationName": "北京",
  "destinationCity": "北京市",
  "destinationProvince": "北京市",
  "destinationCountry": "China",
  "travelDays": 3,
  "travelBudget": 1500.00,
  "actualCost": 1350.00,
  "travelSeason": "autumn",
  "travelStyle": "family",
  "tags": "攻略,家庭游,经典路线,省钱,必游",
  "keywords": "北京旅游,三日游,攻略,故宫,长城,颐和园",
  "isPublic": true,
  "allowComments": true,
  "allowShares": true
}
```

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "publisherId": 10001,
    "publisherNickname": "旅行达人小王",
    "title": "北京三日游完美攻略",
    "summary": "详细介绍北京三天两夜的经典路线，包含故宫、长城、颐和园等必游景点",
    "content": "# 北京三日游完美攻略\n\n...",
    "contentType": "markdown",
    "postType": "strategy",
    "category": "domestic",
    "coverImage": "https://example.com/images/beijing-cover.jpg",
    "images": ["https://example.com/images/tiananmen.jpg"],
    "destinationName": "北京",
    "destinationCity": "北京市",
    "destinationProvince": "北京市",
    "travelDays": 3,
    "travelBudget": 1500.00,
    "actualCost": 1350.00,
    "travelSeason": "autumn",
    "travelStyle": "family",
    "tags": "攻略,家庭游,经典路线,省钱,必游",
    "keywords": "北京旅游,三日游,攻略,故宫,长城,颐和园",
    "viewCount": 0,
    "likeCount": 0,
    "commentCount": 0,
    "shareCount": 0,
    "favoriteCount": 0,
    "rating": 0.0,
    "ratingCount": 0,
    "status": "draft",
    "auditStatus": "pending",
    "isPublic": true,
    "allowComments": true,
    "allowShares": true,
    "createdTime": "2024-10-28T15:30:00",
    "updatedTime": "2024-10-28T15:30:00"
  }
}
```

---

### 2. 发布帖子

**接口描述**  
将草稿状态的帖子发布为公开状态。

**接口地址**  
`POST /api/post/{postId}/publish`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

**请求示例**  
`POST /api/post/1/publish`

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "status": "published",
    "publishedTime": "2024-10-28T16:00:00",
    "auditStatus": "pending"
  }
}
```

---

### 3. 更新帖子

**接口描述**  
更新已存在的帖子内容。

**接口地址**  
`PUT /api/post/{postId}`

**请求头**  
```
Authorization: Bearer <JWT Token>
Content-Type: application/json
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

**请求参数**  
与创建帖子接口相同

**响应参数**  
与创建帖子接口相同

---

### 4. 删除帖子

**接口描述**  
删除指定的帖子（软删除）。

**接口地址**  
`DELETE /api/post/{postId}`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": "帖子删除成功"
}
```

---

### 5. 获取帖子详情

**接口描述**  
获取指定帖子的详细信息，会自动增加浏览量。

**接口地址**  
`GET /api/post/{postId}`

**请求头**  
```
Authorization: Bearer <JWT Token> (可选)
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "publisherId": 10001,
    "publisherNickname": "旅行达人小王",
    "publisherAvatarUrl": "https://example.com/avatar.jpg",
    "title": "北京三日游完美攻略",
    "content": "# 北京三日游完美攻略\n\n...",
    "viewCount": 125,
    "likeCount": 89,
    "commentCount": 23,
    "shareCount": 15,
    "favoriteCount": 156,
    "rating": 4.8,
    "status": "published",
    "publishedTime": "2024-10-28T16:00:00",
    "isLiked": false,
    "isFavorited": true
  }
}
```

---

### 6. 获取用户的帖子列表

**接口描述**  
获取当前用户发布的所有帖子。

**接口地址**  
`GET /api/post/my`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**请求参数（Query Parameters）**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| status | String | 否 | 帖子状态筛选 | "draft", "published", "deleted" |

**请求示例**

```bash
# 获取所有已发布的帖子
GET /api/post/my

# 获取草稿
GET /api/post/my?status=draft

# 获取已发布的帖子
GET /api/post/my?status=published
```

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "list": [
      {
        "id": 1,
        "title": "北京三日游完美攻略",
        "status": "published",
        "viewCount": 125,
        "likeCount": 89,
        "commentCount": 23,
        "publishedTime": "2024-10-28T16:00:00"
      }
    ]
  }
}
```

---

### 7. 获取公开帖子列表

**接口描述**  
获取所有公开发布的帖子，支持按类型和目的地筛选。

**接口地址**  
`GET /api/post/public`

**请求头**  
```
Authorization: Bearer <JWT Token> (可选)
```

**请求参数（Query Parameters）**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| postType | String | 否 | 帖子类型筛选 | "travel_note", "strategy", "photo_share", "video_share", "qa" |
| destinationCity | String | 否 | 目的地城市筛选 | "北京市", "上海市" |

**请求示例**

```bash
# 获取所有公开帖子
GET /api/post/public

# 按帖子类型筛选
GET /api/post/public?postType=strategy

# 按目的地筛选
GET /api/post/public?destinationCity=北京市

# 组合筛选
GET /api/post/public?postType=travel_note&destinationCity=上海市
```

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "list": [
      {
        "id": 1,
        "publisherId": 10001,
        "publisherNickname": "旅行达人小王",
        "title": "北京三日游完美攻略",
        "summary": "详细介绍北京三天两夜的经典路线",
        "coverImage": "https://example.com/images/beijing-cover.jpg",
        "postType": "strategy",
        "destinationCity": "北京市",
        "travelDays": 3,
        "viewCount": 125,
        "likeCount": 89,
        "commentCount": 23,
        "publishedTime": "2024-10-28T16:00:00",
        "isLiked": false,
        "isFavorited": true
      }
    ]
  }
}
```

---

### 8. 搜索帖子

**接口描述**  
根据关键词搜索公开的帖子。

**接口地址**  
`GET /api/post/search`

**请求头**  
```
Authorization: Bearer <JWT Token> (可选)
```

**请求参数（Query Parameters）**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| keyword | String | 是 | 搜索关键词 | "北京旅游" |

**请求示例**

```bash
GET /api/post/search?keyword=北京旅游
```

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 8,
    "keyword": "北京旅游",
    "list": [
      {
        "id": 1,
        "title": "北京三日游完美攻略",
        "summary": "详细介绍北京三天两夜的经典路线",
        "publisherNickname": "旅行达人小王",
        "viewCount": 125,
        "likeCount": 89,
        "publishedTime": "2024-10-28T16:00:00"
      }
    ]
  }
}
```

---

### 9. 点赞/取消点赞帖子

**接口描述**  
对帖子进行点赞或取消点赞操作。

**接口地址**  
`POST /api/post/{postId}/like`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

**请求示例**  
`POST /api/post/1/like`

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "isLiked": true,
    "likeCount": 90
  }
}
```

---

### 10. 获取帖子评论列表

**接口描述**  
获取指定帖子的所有评论，包括回复。

**接口地址**  
`GET /api/post/{postId}/comments`

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | Long | 是 | 帖子ID |

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "list": [
      {
        "id": 1,
        "postId": 1,
        "userId": 20001,
        "userNickname": "旅游爱好者",
        "userAvatarUrl": "https://example.com/avatar1.jpg",
        "commentContent": "这个攻略太实用了！准备按照这个路线去北京玩",
        "commentImages": [],
        "likeCount": 5,
        "replyCount": 2,
        "isAuthorReply": false,
        "createdTime": "2024-10-28T17:30:00",
        "isLiked": false,
        "replies": [
          {
            "id": 2,
            "parentCommentId": 1,
            "userId": 10001,
            "userNickname": "旅行达人小王",
            "commentContent": "谢谢支持！有问题随时问我",
            "isAuthorReply": true,
            "createdTime": "2024-10-28T18:00:00"
          }
        ]
      }
    ]
  }
}
```

---

### 11. 添加评论

**接口描述**  
对帖子添加评论或回复其他评论。

**接口地址**  
`POST /api/post/comment`

**请求头**  
```
Authorization: Bearer <JWT Token>
Content-Type: application/json
```

**请求参数（Request Body）**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| postId | Long | 是 | 帖子ID | 1 |
| parentCommentId | Long | 否 | 父评论ID（回复时填写） | 1 |
| commentContent | String | 是 | 评论内容 | "这个攻略很实用！" |
| commentImages | Array | 否 | 评论图片URL数组 | ["url1", "url2"] |

**请求示例**

```json
{
  "postId": 1,
  "commentContent": "这个攻略太实用了！准备按照这个路线去北京玩",
  "commentImages": []
}
```

**回复评论示例**

```json
{
  "postId": 1,
  "parentCommentId": 1,
  "commentContent": "谢谢支持！有问题随时问我"
}
```

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 3,
    "postId": 1,
    "userId": 20002,
    "userNickname": "新用户",
    "commentContent": "这个攻略太实用了！准备按照这个路线去北京玩",
    "commentImages": [],
    "likeCount": 0,
    "replyCount": 0,
    "isAuthorReply": false,
    "createdTime": "2024-10-28T19:00:00"
  }
}
```

---

### 12. 保存草稿

**接口描述**  
保存帖子草稿，支持自动保存和手动保存。

**接口地址**  
`POST /api/post/draft/save`

**请求头**  
```
Authorization: Bearer <JWT Token>
Content-Type: application/json
```

**请求参数（Request Body）**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| draftId | Long | 否 | 草稿ID（更新时填写） | 1 |
| draftTitle | String | 否 | 草稿标题 | "北京旅游攻略" |
| draftContent | String | 否 | 草稿内容 | "# 北京旅游..." |
| draftData | Object | 否 | 完整的帖子数据 | PostCreateRequest对象 |
| isAutoSave | Boolean | 否 | 是否为自动保存 | false |

**请求示例**

```json
{
  "draftTitle": "北京三日游攻略",
  "draftContent": "# 北京三日游攻略\n\n正在编写中...",
  "draftData": {
    "title": "北京三日游攻略",
    "content": "# 北京三日游攻略\n\n正在编写中...",
    "postType": "strategy",
    "destinationCity": "北京市"
  },
  "isAutoSave": false
}
```

**响应参数**

成功响应（200）：

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

### 13. 获取用户草稿列表

**接口描述**  
获取当前用户的所有草稿。

**接口地址**  
`GET /api/post/draft/my`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "list": [
      {
        "id": 1,
        "title": "北京三日游攻略",
        "content": "# 北京三日游攻略\n\n正在编写中...",
        "updatedTime": "2024-10-28T20:00:00",
        "autoSaveTime": "2024-10-28T19:55:00",
        "draftData": {
          "title": "北京三日游攻略",
          "content": "# 北京三日游攻略\n\n正在编写中...",
          "postType": "strategy",
          "destinationCity": "北京市"
        }
      }
    ]
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
// 创建帖子
async function createPost(postData) {
  const response = await fetch('/api/post/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 发布帖子
async function publishPost(postId) {
  const response = await fetch(`/api/post/${postId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 点赞帖子
async function toggleLike(postId) {
  const response = await fetch(`/api/post/${postId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 添加评论
async function addComment(commentData) {
  const response = await fetch('/api/post/comment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commentData)
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 保存草稿
async function saveDraft(draftData) {
  const response = await fetch('/api/post/draft/save', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(draftData)
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 获取公开帖子列表
async function getPublicPosts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.postType) params.append('postType', filters.postType);
  if (filters.destinationCity) params.append('destinationCity', filters.destinationCity);
  
  const response = await fetch(`/api/post/public?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 搜索帖子
async function searchPosts(keyword) {
  const response = await fetch(`/api/post/search?keyword=${encodeURIComponent(keyword)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}
```

### React 示例

```jsx
import React, { useState, useEffect } from 'react';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getPublicPosts();
      setPosts(data.list);
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await toggleLike(postId);
      // 更新帖子状态
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, isLiked: result.isLiked, likeCount: result.likeCount }
          : post
      ));
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="post-list">
      {posts.map(post => (
        <div key={post.id} className="post-item">
          <h3>{post.title}</h3>
          <p>{post.summary}</p>
          <div className="post-stats">
            <span>浏览: {post.viewCount}</span>
            <button 
              onClick={() => handleLike(post.id)}
              className={post.isLiked ? 'liked' : ''}
            >
              点赞 ({post.likeCount})
            </button>
            <span>评论: {post.commentCount}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
```

---

## 注意事项

1. **认证要求**：大部分接口需要用户登录，请在请求头中携带有效的JWT Token
2. **权限控制**：用户只能编辑、删除自己发布的帖子
3. **内容审核**：发布的帖子需要经过审核才能公开显示
4. **文件上传**：图片和视频需要先上传到文件服务器，然后将URL传递给接口
5. **自动保存**：建议在编辑器中实现自动保存草稿功能
6. **分页功能**：当前接口返回所有数据，实际使用时建议添加分页参数
7. **缓存策略**：公开帖子列表建议使用缓存提高性能

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-10-28 | 初始版本，实现完整的帖子发布功能 |

---

## 联系方式

如有问题或建议，请联系开发团队。

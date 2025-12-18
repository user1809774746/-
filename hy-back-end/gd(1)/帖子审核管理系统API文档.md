# 帖子审核管理系统 API 文档

## 📋 目录

1. [系统概述](#系统概述)
2. [业务流程](#业务流程)
3. [用户端接口](#用户端接口)
4. [管理员端接口](#管理员端接口)
5. [数据字段说明](#数据字段说明)
6. [前端集成指南](#前端集成指南)

---

## 系统概述

本系统实现了帖子的发布审核机制：

- **用户发布帖子** → 帖子进入待审核状态（`audit_status = pending`）
- **管理员审核** → 审核通过/拒绝
- **审核通过** → 帖子正式发布，其他用户可见
- **审核拒绝** → 帖子保持草稿状态，不对外显示

---

## 业务流程

### 帖子发布流程

```
1. 用户创建帖子（草稿）
   ├─ status = 'draft'
   └─ audit_status = 'pending'

2. 用户发布帖子
   ├─ status = 'published'
   ├─ audit_status = 'pending' (等待审核)
   └─ ⚠️ 其他用户暂时看不到此帖子

3. 管理员审核
   ├─ 选项A: 审核通过
   │  ├─ audit_status = 'approved'
   │  ├─ status = 'published'
   │  └─ ✅ 帖子正式发布，所有用户可见
   │
   └─ 选项B: 审核拒绝
      ├─ audit_status = 'rejected'
      ├─ status = 'draft'
      └─ ❌ 帖子不可见，用户需要修改后重新提交
```

### 审核状态说明

| 状态值 | 说明 | 用户可见 | 其他用户可见 |
|--------|------|----------|--------------|
| `pending` | 待审核 | ✅ 是 | ❌ 否 |
| `approved` | 审核通过 | ✅ 是 | ✅ 是 |
| `rejected` | 审核拒绝 | ✅ 是（需修改） | ❌ 否 |

---

## 用户端接口

### 1. 创建帖子（草稿）

**接口地址：** `POST /api/post/create`

**功能描述：** 用户创建帖子并保存为草稿

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "title": "我的旅行日记",
  "summary": "这是一次难忘的旅行",
  "content": "详细的旅行内容...",
  "contentType": "richtext",
  "postType": "travel_note",
  "category": "domestic",
  "coverImage": "http://example.com/image.jpg",
  "images": ["http://example.com/img1.jpg", "http://example.com/img2.jpg"],
  "destinationName": "西湖",
  "destinationCity": "杭州",
  "destinationProvince": "浙江",
  "travelStartDate": "2025-10-01",
  "travelEndDate": "2025-10-05",
  "travelDays": 5,
  "tags": "旅行,美食,摄影",
  "isOriginal": true
}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "title": "我的旅行日记",
    "status": "draft",
    "auditStatus": "pending",
    "createdTime": "2025-10-31T10:00:00",
    "message": "帖子已创建为草稿"
  }
}
```

---

### 2. 发布帖子

**接口地址：** `POST /api/post/{postId}/publish`

**功能描述：** 用户将草稿发布，提交审核

**请求头：**
```
Authorization: Bearer {token}
```

**路径参数：**
- `postId`: 帖子ID

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "title": "我的旅行日记",
    "status": "published",
    "auditStatus": "pending",
    "publishedTime": "2025-10-31T10:30:00",
    "message": "帖子已提交审核，等待管理员审核"
  }
}
```

**注意：** 
- 发布后帖子状态为 `status='published'`，`auditStatus='pending'`
- 此时其他用户暂时看不到此帖子，需要等待管理员审核通过

---

### 3. 查看自己的帖子（含审核状态）

**接口地址：** `GET /api/post/my-posts`

**功能描述：** 查看自己发布的所有帖子及审核状态

**请求头：**
```
Authorization: Bearer {token}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "posts": [
      {
        "id": 123,
        "title": "我的旅行日记",
        "status": "published",
        "auditStatus": "approved",
        "auditTime": "2025-10-31T11:00:00",
        "auditReason": "审核通过",
        "isVisible": true
      },
      {
        "id": 124,
        "title": "另一篇帖子",
        "status": "draft",
        "auditStatus": "rejected",
        "auditTime": "2025-10-31T11:05:00",
        "auditReason": "内容不符合规范，请修改后重新提交",
        "isVisible": false
      },
      {
        "id": 125,
        "title": "待审核的帖子",
        "status": "published",
        "auditStatus": "pending",
        "auditTime": null,
        "auditReason": null,
        "isVisible": false
      }
    ],
    "totalCount": 3
  }
}
```

---

## 管理员端接口

### 1. 获取待审核帖子列表

**接口地址：** `GET /api/admin/posts/pending`

**功能描述：** 管理员获取所有待审核的帖子

**权限要求：** 管理员

**请求头：**
```
Authorization: Bearer {admin_token}
```

**请求参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| pageSize | Integer | 否 | 10 | 每页数量 |

**请求示例：**
```
GET /api/admin/posts/pending?page=1&pageSize=10
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "posts": [
      {
        "id": 125,
        "title": "待审核的帖子",
        "summary": "帖子摘要",
        "coverImage": "http://example.com/cover.jpg",
        "publisherId": 1,
        "publisherPhone": "13800138000",
        "status": "published",
        "auditStatus": "pending",
        "viewCount": 0,
        "likeCount": 0,
        "commentCount": 0,
        "createdTime": "2025-10-31T10:00:00",
        "publishedTime": "2025-10-31T10:30:00"
      }
    ],
    "totalCount": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

---

### 2. 获取所有帖子列表（含筛选）

**接口地址：** `GET /api/admin/posts/list`

**功能描述：** 管理员获取所有帖子，可按审核状态和发布状态筛选

**权限要求：** 管理员

**请求头：**
```
Authorization: Bearer {admin_token}
```

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| auditStatus | String | 否 | 审核状态：pending/approved/rejected |
| status | String | 否 | 发布状态：draft/published/deleted |
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |

**请求示例：**
```
GET /api/admin/posts/list?auditStatus=pending&page=1&pageSize=10
GET /api/admin/posts/list?status=published&auditStatus=approved&page=1
GET /api/admin/posts/list?page=1&pageSize=20
```

**成功响应：** 同上

---

### 3. 获取帖子详情

**接口地址：** `GET /api/admin/posts/{postId}`

**功能描述：** 管理员查看帖子详细内容

**权限要求：** 管理员

**路径参数：**
- `postId`: 帖子ID

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 125,
    "title": "我的旅行日记",
    "summary": "这是一次难忘的旅行",
    "content": "详细的旅行内容...",
    "contentType": "richtext",
    "postType": "travel_note",
    "category": "domestic",
    "coverImage": "http://example.com/image.jpg",
    "images": ["http://example.com/img1.jpg"],
    "publisherId": 1,
    "status": "published",
    "auditStatus": "pending",
    "auditReason": null,
    "auditTime": null,
    "isFeatured": false,
    "isTop": false,
    "viewCount": 10,
    "likeCount": 5,
    "commentCount": 2,
    "favoriteCount": 3,
    "createdTime": "2025-10-31T10:00:00",
    "publishedTime": "2025-10-31T10:30:00",
    "publisherInfo": {
      "userId": 1,
      "phone": "13800138000"
    }
  }
}
```

---

### 4. 审核通过帖子

**接口地址：** `POST /api/admin/posts/{postId}/approve`

**功能描述：** 管理员审核通过帖子

**权限要求：** 管理员

**请求头：**
```
Authorization: Bearer {admin_token}
```

**路径参数：**
- `postId`: 帖子ID

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 125,
    "auditStatus": "approved",
    "status": "published",
    "auditTime": "2025-10-31T11:00:00",
    "message": "帖子审核通过"
  }
}
```

**失败响应：**
```json
{
  "code": 400,
  "message": "error",
  "data": "帖子已经审核通过"
}
```

---

### 5. 审核拒绝帖子

**接口地址：** `POST /api/admin/posts/{postId}/reject`

**功能描述：** 管理员拒绝帖子，需要提供拒绝原因

**权限要求：** 管理员

**请求头：**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**路径参数：**
- `postId`: 帖子ID

**请求体：**
```json
{
  "reason": "内容不符合规范，请修改后重新提交"
}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 125,
    "auditStatus": "rejected",
    "reason": "内容不符合规范，请修改后重新提交",
    "auditTime": "2025-10-31T11:05:00",
    "message": "帖子审核拒绝"
  }
}
```

---

### 6. 删除帖子

**接口地址：** `DELETE /api/admin/posts/{postId}`

**功能描述：** 管理员删除违规帖子

**权限要求：** 管理员

**请求头：**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**请求体（可选）：**
```json
{
  "reason": "违规内容"
}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 125,
    "message": "帖子已删除"
  }
}
```

---

### 7. 设置/取消精选

**设置精选：** `POST /api/admin/posts/{postId}/feature`

**取消精选：** `DELETE /api/admin/posts/{postId}/feature`

**功能描述：** 管理员设置或取消帖子为精选（只有审核通过的帖子才能设置）

**权限要求：** 管理员

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 125,
    "isFeatured": true,
    "message": "已设置为精选帖子"
  }
}
```

---

### 8. 设置/取消置顶

**设置置顶：** `POST /api/admin/posts/{postId}/top`

**取消置顶：** `DELETE /api/admin/posts/{postId}/top`

**功能描述：** 管理员设置或取消帖子置顶（只有审核通过的帖子才能置顶）

**权限要求：** 管理员

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 125,
    "isTop": true,
    "message": "已设置为置顶帖子"
  }
}
```

---

### 9. 获取审核统计信息

**接口地址：** `GET /api/admin/posts/statistics`

**功能描述：** 获取帖子审核相关的统计数据

**权限要求：** 管理员

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "pendingCount": 5,
    "approvedCount": 120,
    "rejectedCount": 10,
    "totalCount": 135,
    "publishedCount": 120,
    "draftCount": 10,
    "deletedCount": 5,
    "featuredCount": 15,
    "topCount": 3
  }
}
```

**字段说明：**
- `pendingCount`: 待审核数量
- `approvedCount`: 已通过数量
- `rejectedCount`: 已拒绝数量
- `totalCount`: 总帖子数
- `publishedCount`: 已发布数量
- `draftCount`: 草稿数量
- `deletedCount`: 已删除数量
- `featuredCount`: 精选数量
- `topCount`: 置顶数量

---

## 数据字段说明

### TravelPost 表字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 帖子ID |
| title | VARCHAR(200) | 帖子标题 |
| summary | LONGTEXT | 帖子摘要 |
| content | LONGTEXT | 帖子内容 |
| publisher_id | BIGINT | 发布者用户ID |
| status | VARCHAR(20) | 发布状态：draft/published/deleted |
| **audit_status** | VARCHAR(20) | **审核状态：pending/approved/rejected** |
| **audit_reason** | VARCHAR(500) | **审核原因（拒绝时填写）** |
| **audit_time** | DATETIME | **审核时间** |
| is_featured | TINYINT | 是否精选（0/1） |
| is_top | TINYINT | 是否置顶（0/1） |
| created_time | DATETIME | 创建时间 |
| published_time | DATETIME | 发布时间 |

### 审核状态流转

```
draft (草稿)
  ↓ 用户发布
published + pending (已发布，待审核) ← 初始状态
  ↓ 管理员审核
  ├→ published + approved (已发布，已通过) ← 正式发布
  └→ draft + rejected (草稿，已拒绝) ← 需要修改
```

---

## 前端集成指南

### 用户端集成

#### 1. 发布帖子流程

```javascript
// 1. 创建帖子草稿
async function createPost(postData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
        const postId = data.data.id;
        console.log('草稿创建成功:', postId);
        
        // 2. 立即发布（或者让用户选择）
        await publishPost(postId);
    }
}

// 2. 发布帖子（提交审核）
async function publishPost(postId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`/api/post/${postId}/publish`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
        // 提示用户：帖子已提交审核
        alert('您的帖子已提交审核，审核通过后将对外展示');
        window.location.href = '/my-posts';
    }
}

// 3. 查看自己的帖子和审核状态
async function getMyPosts() {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/post/my-posts', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
        const posts = data.data.posts;
        
        posts.forEach(post => {
            // 根据审核状态显示不同的标签
            if (post.auditStatus === 'pending') {
                console.log(`${post.title} - 待审核`);
            } else if (post.auditStatus === 'approved') {
                console.log(`${post.title} - 审核通过`);
            } else if (post.auditStatus === 'rejected') {
                console.log(`${post.title} - 审核拒绝：${post.auditReason}`);
            }
        });
    }
}
```

#### 2. 显示审核状态标签

```html
<div class="post-card">
    <h3>{{ post.title }}</h3>
    
    <!-- 审核状态标签 -->
    <span v-if="post.auditStatus === 'pending'" class="badge badge-warning">
        待审核
    </span>
    <span v-else-if="post.auditStatus === 'approved'" class="badge badge-success">
        审核通过
    </span>
    <span v-else-if="post.auditStatus === 'rejected'" class="badge badge-danger">
        审核拒绝
    </span>
    
    <!-- 显示拒绝原因 -->
    <div v-if="post.auditStatus === 'rejected'" class="alert alert-danger">
        拒绝原因：{{ post.auditReason }}
        <button @click="editPost(post.id)">修改帖子</button>
    </div>
</div>
```

---

### 管理员端集成

#### 1. 获取待审核帖子

```javascript
// 获取待审核帖子列表
async function getPendingPosts(page = 1) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`/api/admin/posts/pending?page=${page}&pageSize=10`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
        const posts = data.data.posts;
        const totalCount = data.data.totalCount;
        
        console.log(`待审核帖子数量: ${totalCount}`);
        return posts;
    } else if (data.code === 403) {
        alert('需要管理员权限');
        window.location.href = '/login';
    }
}
```

#### 2. 审核帖子

```javascript
// 审核通过
async function approvePost(postId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
        alert('审核通过');
        // 刷新列表
        getPendingPosts();
    }
}

// 审核拒绝
async function rejectPost(postId, reason) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`/api/admin/posts/${postId}/reject`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason })
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
        alert('审核拒绝');
        // 刷新列表
        getPendingPosts();
    }
}
```

#### 3. 管理员审核页面示例（Vue）

```vue
<template>
  <div class="admin-panel">
    <h2>帖子审核管理</h2>
    
    <!-- 统计信息 -->
    <div class="statistics">
      <div class="stat-card">
        <h4>待审核</h4>
        <p>{{ statistics.pendingCount }}</p>
      </div>
      <div class="stat-card">
        <h4>已通过</h4>
        <p>{{ statistics.approvedCount }}</p>
      </div>
      <div class="stat-card">
        <h4>已拒绝</h4>
        <p>{{ statistics.rejectedCount }}</p>
      </div>
    </div>
    
    <!-- 待审核帖子列表 -->
    <div class="pending-posts">
      <h3>待审核帖子</h3>
      
      <div v-for="post in pendingPosts" :key="post.id" class="post-item">
        <img :src="post.coverImage" alt="封面" />
        <div class="post-info">
          <h4>{{ post.title }}</h4>
          <p>发布者：{{ post.publisherPhone }}</p>
          <p>发布时间：{{ formatDate(post.publishedTime) }}</p>
          
          <div class="actions">
            <button @click="viewDetail(post.id)" class="btn btn-info">
              查看详情
            </button>
            <button @click="handleApprove(post.id)" class="btn btn-success">
              通过
            </button>
            <button @click="handleReject(post.id)" class="btn btn-danger">
              拒绝
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 拒绝原因弹窗 -->
    <div v-if="showRejectDialog" class="modal">
      <div class="modal-content">
        <h3>请输入拒绝原因</h3>
        <textarea v-model="rejectReason" placeholder="请详细说明拒绝原因..."></textarea>
        <button @click="submitReject">确认拒绝</button>
        <button @click="showRejectDialog = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pendingPosts: [],
      statistics: {},
      showRejectDialog: false,
      currentPostId: null,
      rejectReason: ''
    }
  },
  mounted() {
    this.loadPendingPosts();
    this.loadStatistics();
  },
  methods: {
    async loadPendingPosts() {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/posts/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.code === 200) {
        this.pendingPosts = data.data.posts;
      }
    },
    
    async loadStatistics() {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/posts/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.code === 200) {
        this.statistics = data.data;
      }
    },
    
    async handleApprove(postId) {
      if (!confirm('确认通过此帖子？')) return;
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.code === 200) {
        this.$message.success('审核通过');
        this.loadPendingPosts();
        this.loadStatistics();
      }
    },
    
    handleReject(postId) {
      this.currentPostId = postId;
      this.showRejectDialog = true;
      this.rejectReason = '';
    },
    
    async submitReject() {
      if (!this.rejectReason.trim()) {
        alert('请输入拒绝原因');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/posts/${this.currentPostId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: this.rejectReason })
      });
      
      const data = await response.json();
      if (data.code === 200) {
        this.$message.success('审核拒绝');
        this.showRejectDialog = false;
        this.loadPendingPosts();
        this.loadStatistics();
      }
    },
    
    viewDetail(postId) {
      this.$router.push(`/admin/posts/${postId}`);
    },
    
    formatDate(date) {
      return new Date(date).toLocaleString('zh-CN');
    }
  }
}
</script>
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误或业务逻辑错误 |
| 401 | 未登录或token失效 |
| 403 | 权限不足（需要管理员权限） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 常见问题

### Q1: 用户发布帖子后，其他用户能看到吗？

**A:** 不能。帖子需要管理员审核通过（`audit_status = 'approved'`）后，其他用户才能看到。

### Q2: 审核拒绝的帖子会怎样？

**A:** 审核拒绝后，帖子状态变为草稿（`status = 'draft'`），用户可以看到拒绝原因，修改后重新提交审核。

### Q3: 管理员可以删除帖子吗？

**A:** 可以。管理员可以删除违规帖子，删除后帖子状态变为 `status = 'deleted'`。

### Q4: 精选和置顶有什么区别？

**A:** 
- **精选**：优质帖子，显示在精选列表中
- **置顶**：重要帖子，显示在列表最上方
- 两者都只能应用于审核通过的帖子

### Q5: 如何判断当前用户是否为管理员？

**A:** 使用 `GET /api/auth/user-info` 接口，检查返回的 `isAdmin` 字段。

---

## 总结

**用户端流程：**
1. 创建帖子 → 发布 → 等待审核 → 收到审核结果
2. 如果被拒绝，可以修改后重新提交

**管理员端流程：**
1. 查看待审核帖子列表
2. 查看帖子详情
3. 审核通过/拒绝（需提供原因）
4. 可以设置精选、置顶
5. 可以删除违规帖子

**关键字段：**
- `audit_status`: 审核状态（pending/approved/rejected）
- `status`: 发布状态（draft/published/deleted）
- `audit_reason`: 审核原因（拒绝时填写）
- `audit_time`: 审核时间

---

**文档完成！所有接口已实现，可以直接使用！** ✨

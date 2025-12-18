# 旅游方案路线收藏功能 API 文档

## 📌 概述

本文档介绍旅游方案路线收藏功能的核心接口。系统支持两种收藏方式：
1. **收藏已有方案**：收藏数据库中预设的旅游方案（通过 `routeId`）
2. **收藏自定义路线**：收藏用户自己规划的路线（通过完整的路线数据）

所有接口均需要用户登录认证。

## 🔐 认证说明

所有接口都需要在请求头中携带有效的 JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

## 📊 数据库表结构

### trip_schemes 表（旅游方案表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键，自动递增 |
| trip_title | varchar(255) | 旅游方案标题 |
| total_days | int | 旅游总天数 |
| route_content | text | 路线内容（JSON格式） |
| summary | text | 旅游方案总结 |

### route_favorite 表（路线收藏关联表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 收藏记录唯一标识 |
| user_id | int | 收藏用户ID |
| route_id | int | 被收藏路线ID（关联trip_schemes.id） |
| create_time | datetime | 收藏时间 |
| is_valid | tinyint | 1=有效，0=已取消（软删除） |

## 📋 接口列表

### 1. 收藏已有的旅游方案

**接口地址**：`POST /api/favorites/route/{routeId}`

**接口说明**：收藏数据库中已存在的旅游方案。支持幂等性，重复收藏会直接返回成功。

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| routeId | Integer | 是 | 旅游方案ID（trip_schemes表的id） |

**请求示例**：

```bash
POST /api/favorites/route/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应** (200 OK)：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "routeId": 1,
    "userId": 10001,
    "createTime": "2025-11-05T17:30:00",
    "isValid": true,
    "trip_title": "天津3日经典文化游",
    "total_days": 3,
    "summary": "此行程全面覆盖天津历史文化、欧式建筑与自然风光...",
    "days": [
      {
        "day": 1,
        "theme": "欧式风情与历史建筑",
        "routes_used": ["五大道文化旅游区", "小白楼欧式风情"],
        "spots": ["天津五大道文化旅游区", "民园广场", "庆王府"],
        "time_schedule": "上午：五大道区域游览 → 下午：小白楼欧式风情",
        "highlights": "漫步五大道，感受万国建筑博览会的魅力",
        "photo": "http://store.is.autonavi.com/showpic/..."
      }
    ]
  }
}
```

**错误响应**：

| 错误码 | 说明 |
|--------|------|
| 401 | 用户未登录或不存在 |
| 400 | 旅游方案不存在 |
| 500 | 服务器错误 |

---

### 2. 收藏自定义规划路线

**接口地址**：`POST /api/favorites/route/custom`

**接口说明**：收藏用户自己规划的路线。系统会先创建新的旅游方案，然后将其添加到收藏列表。

**请求体**（JSON）：

```json
{
  "trip_title": "我的广州3日游",
  "total_days": 3,
  "summary": "自定义的广州深度游路线",
  "days": [
    {
      "day": 1,
      "theme": "历史文化之旅",
      "routes_used": ["陈家祠", "沙面"],
      "spots": ["陈家祠", "沙面建筑群", "上下九步行街"],
      "time_schedule": "上午：陈家祠 → 下午：沙面 → 晚上：上下九",
      "highlights": "感受广州传统文化与欧陆风情",
      "photo": "http://example.com/photo1.jpg"
    },
    {
      "day": 2,
      "theme": "现代都市体验",
      "routes_used": ["广州塔", "珠江夜游"],
      "spots": ["广州塔", "海心沙", "花城广场"],
      "time_schedule": "白天：广州塔 → 晚上：珠江夜游",
      "highlights": "领略现代广州的繁华",
      "photo": "http://example.com/photo2.jpg"
    }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| trip_title | String | 是 | 路线标题 |
| total_days | Integer | 是 | 旅游天数（必须>0） |
| summary | String | 否 | 路线总结 |
| days | Array | 否 | 每日行程详情 |

**days 数组字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| day | Integer | 第几天 |
| theme | String | 当日主题 |
| routes_used | Array | 使用的路线名称 |
| spots | Array | 景点列表 |
| time_schedule | String | 时间安排 |
| highlights | String | 亮点介绍 |
| photo | String | 照片URL |

**成功响应** (200 OK)：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 5,
    "routeId": 5,
    "userId": 10001,
    "createTime": "2025-11-05T17:35:00",
    "isValid": true,
    "trip_title": "我的广州3日游",
    "total_days": 3,
    "summary": "自定义的广州深度游路线",
    "days": [...]
  }
}
```

**错误响应**：

| 错误码 | 说明 |
|--------|------|
| 401 | 用户未登录 |
| 400 | 路线标题不能为空 / 旅游天数必须大于0 |
| 500 | 路线数据格式错误 / 服务器错误 |

---

### 3. 取消收藏路线

**接口地址**：`DELETE /api/favorites/route/{routeId}`

**接口说明**：取消收藏某个旅游方案（软删除，设置 `is_valid=0`）。

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| routeId | Integer | 是 | 旅游方案ID |

**请求示例**：

```bash
DELETE /api/favorites/route/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应** (200 OK)：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "取消路线收藏成功",
    "routeId": 1
  }
}
```

**错误响应**：

| 错误码 | 说明 |
|--------|------|
| 401 | 用户未登录 |
| 400 | 未找到该路线的收藏记录 / 该路线收藏已被取消 |
| 500 | 服务器错误 |

---

### 4. 检查路线收藏状态

**接口地址**：`GET /api/favorites/route/{routeId}/status`

**接口说明**：检查某个旅游方案是否已被当前用户收藏。

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| routeId | Integer | 是 | 旅游方案ID |

**请求示例**：

```bash
GET /api/favorites/route/1/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应** (200 OK)：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "routeId": 1,
    "isFavorited": true
  }
}
```

**错误响应**：

| 错误码 | 说明 |
|--------|------|
| 401 | 用户未登录 |
| 500 | 服务器错误 |

---

### 5. 获取用户的路线收藏列表

**接口地址**：`GET /api/favorites/route/list`

**接口说明**：获取当前用户的所有有效路线收藏（`is_valid=1`）。

**请求示例**：

```bash
GET /api/favorites/route/list
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应** (200 OK)：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 2,
    "list": [
      {
        "id": 1,
        "routeId": 1,
        "userId": 10001,
        "createTime": "2025-11-05T08:07:43",
        "isValid": true,
        "trip_title": "天津3日经典文化游",
        "total_days": 3,
        "summary": "此行程全面覆盖天津历史文化...",
        "days": [...]
      },
      {
        "id": 2,
        "routeId": 2,
        "userId": 10001,
        "createTime": "2025-11-05T10:15:20",
        "isValid": true,
        "trip_title": "呼伦贝尔海拉尔3日文化自然之旅",
        "total_days": 3,
        "summary": "此行程涵盖海拉尔主要文化场馆...",
        "days": [...]
      }
    ]
  }
}
```

**错误响应**：

| 错误码 | 说明 |
|--------|------|
| 401 | 用户未登录 |
| 500 | 服务器错误 |

---

## 🎯 业务逻辑说明

### 两种收藏方式对比

| 特性 | 收藏已有方案 | 收藏自定义路线 |
|------|-------------|---------------|
| **接口** | POST /api/favorites/route/{routeId} | POST /api/favorites/route/custom |
| **数据来源** | 数据库预设方案 | 用户自己规划 |
| **是否创建新方案** | 否，直接引用 | 是，先创建后收藏 |
| **适用场景** | 推荐路线、热门方案 | 个性化定制路线 |
| **参数** | 只需 routeId | 需要完整的路线数据 |

### 幂等性设计

**收藏接口**支持幂等性：
- ✅ 如果路线未收藏过，创建新的收藏记录
- ✅ 如果路线已收藏（`is_valid=1`），直接返回成功
- ✅ 如果路线曾被取消收藏（`is_valid=0`），恢复收藏状态并更新收藏时间

### 软删除机制

取消收藏采用**软删除**方式：
- 不会真正删除数据库记录
- 将 `is_valid` 字段设置为 `0`
- 可以通过重新收藏恢复

---

## 📱 前端集成示例

### Vue 3 组件示例

```vue
<template>
  <div class="route-card">
    <h3>{{ route.trip_title }}</h3>
    <p>{{ route.summary }}</p>
    <p>行程天数：{{ route.total_days }}天</p>
    
    <button 
      @click="toggleFavorite" 
      :class="{ 'favorited': isFavorited }"
      :disabled="loading"
    >
      {{ isFavorited ? '❤️ 已收藏' : '🤍 收藏' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  route: Object,  // 包含 id, trip_title, total_days, summary 等
  type: String    // 'existing' 或 'custom'
});

const isFavorited = ref(false);
const loading = ref(false);

// 检查收藏状态（仅适用于已有方案）
async function checkFavoriteStatus() {
  if (props.type === 'existing' && props.route.id) {
    try {
      const response = await axios.get(
        `/api/favorites/route/${props.route.id}/status`
      );
      isFavorited.value = response.data.data.isFavorited;
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  }
}

// 切换收藏状态
async function toggleFavorite() {
  loading.value = true;
  
  try {
    if (isFavorited.value) {
      // 取消收藏
      await axios.delete(`/api/favorites/route/${props.route.id}`);
      isFavorited.value = false;
    } else {
      // 添加收藏
      if (props.type === 'existing') {
        // 收藏已有方案
        await axios.post(`/api/favorites/route/${props.route.id}`);
      } else {
        // 收藏自定义路线
        await axios.post('/api/favorites/route/custom', props.route);
      }
      isFavorited.value = true;
    }
  } catch (error) {
    console.error('操作失败:', error.response?.data?.message || error.message);
    alert(error.response?.data?.message || '操作失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.type === 'existing') {
    checkFavoriteStatus();
  }
});
</script>

<style scoped>
.favorited {
  color: red;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### JavaScript/Fetch 示例

```javascript
// 1. 收藏已有方案
async function favoriteExistingRoute(routeId) {
  const response = await fetch(`/api/favorites/route/${routeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    console.log('收藏成功:', result.data);
  } else {
    console.error('收藏失败:', result.message);
  }
  return result;
}

// 2. 收藏自定义路线
async function favoriteCustomRoute(routeData) {
  const response = await fetch('/api/favorites/route/custom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(routeData)
  });
  
  const result = await response.json();
  return result;
}

// 3. 取消收藏
async function unfavoriteRoute(routeId) {
  const response = await fetch(`/api/favorites/route/${routeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const result = await response.json();
  return result;
}

// 4. 检查收藏状态
async function checkFavoriteStatus(routeId) {
  const response = await fetch(`/api/favorites/route/${routeId}/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const result = await response.json();
  return result.data?.isFavorited || false;
}

// 5. 获取收藏列表
async function getFavoriteRoutes() {
  const response = await fetch('/api/favorites/route/list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const result = await response.json();
  return result.data?.list || [];
}
```

---

## 🧪 测试用例

### 使用 cURL 测试

```bash
# 设置 Token 变量
TOKEN="your-jwt-token-here"

# 1. 收藏已有方案（ID=1）
curl -X POST "http://localhost:8081/api/favorites/route/1" \
  -H "Authorization: Bearer $TOKEN"

# 2. 收藏自定义路线
curl -X POST "http://localhost:8081/api/favorites/route/custom" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip_title": "测试路线",
    "total_days": 2,
    "summary": "这是一个测试路线",
    "days": []
  }'

# 3. 检查收藏状态
curl -X GET "http://localhost:8081/api/favorites/route/1/status" \
  -H "Authorization: Bearer $TOKEN"

# 4. 获取收藏列表
curl -X GET "http://localhost:8081/api/favorites/route/list" \
  -H "Authorization: Bearer $TOKEN"

# 5. 取消收藏
curl -X DELETE "http://localhost:8081/api/favorites/route/1" \
  -H "Authorization: Bearer $TOKEN"
```

### 使用 Postman 测试

#### Collection 配置

1. **设置环境变量**：
   - `base_url`: http://localhost:8081
   - `token`: 你的JWT Token

2. **收藏已有方案**：
   - Method: POST
   - URL: `{{base_url}}/api/favorites/route/1`
   - Headers: `Authorization: Bearer {{token}}`

3. **收藏自定义路线**：
   - Method: POST
   - URL: `{{base_url}}/api/favorites/route/custom`
   - Headers: 
     - `Authorization: Bearer {{token}}`
     - `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "trip_title": "我的自定义路线",
     "total_days": 3,
     "summary": "一个精彩的旅程",
     "days": []
   }
   ```

---

## ⚠️ 注意事项

1. **路线ID验证**：收藏已有方案时，系统会验证 `routeId` 是否存在
2. **必填字段**：收藏自定义路线时，`trip_title` 和 `total_days` 为必填
3. **Token认证**：所有接口都需要有效的 JWT Token
4. **幂等性**：重复收藏同一路线不会报错，会直接返回成功
5. **软删除**：取消收藏不会永久删除数据，可以重新收藏

---

## 🔄 接口路径总览

| 功能 | 方法 | 路径 |
|------|------|------|
| 收藏已有方案 | POST | /api/favorites/route/{routeId} |
| 收藏自定义路线 | POST | /api/favorites/route/custom |
| 取消收藏 | DELETE | /api/favorites/route/{routeId} |
| 检查收藏状态 | GET | /api/favorites/route/{routeId}/status |
| 获取收藏列表 | GET | /api/favorites/route/list |

---

## 📝 更新日志

### v1.0 (2025-11-05)
- ✅ 新增收藏已有方案接口
- ✅ 新增收藏自定义路线接口
- ✅ 新增取消收藏接口
- ✅ 新增检查收藏状态接口
- ✅ 新增获取收藏列表接口
- ✅ 支持幂等性设计
- ✅ 支持软删除机制
- ✅ 支持两种收藏模式

---

## 💡 常见问题

**Q1: 两种收藏方式有什么区别？**
- A: 收藏已有方案只需提供 `routeId`，适用于平台推荐的路线；收藏自定义路线需要提供完整数据，适用于用户自己规划的路线。

**Q2: 重复收藏会报错吗？**
- A: 不会，接口支持幂等性，重复收藏会直接返回成功。

**Q3: 取消收藏后数据还能恢复吗？**
- A: 可以，采用软删除机制，重新调用收藏接口即可恢复。

**Q4: 如何查看数据库中有哪些预设方案？**
- A: 直接查询 `trip_schemes` 表，目前有天津、呼伦贝尔、沈阳等城市的方案。

---

## 📞 技术支持

如有问题，请联系后端开发团队或提交 Issue。

---

**文档版本**: v1.0  
**创建时间**: 2025-11-05  
**功能状态**: ✅ 已完成并测试


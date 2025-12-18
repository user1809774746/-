# 景点收藏功能 API 文档

## 📌 概述

本文档介绍景点收藏功能的三个核心接口，支持用户添加、取消和查询景点收藏状态。所有接口均需要用户登录认证。

## 🔐 认证说明

所有接口都需要在请求头中携带有效的 JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

## 📋 接口列表

### 1. 添加景点收藏

**接口地址**：`POST /api/favorite/attraction`

**接口说明**：将景点添加到用户的收藏列表中。支持幂等性，重复收藏同一景点会直接返回成功。

**请求参数**（Query Parameters）：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| name | String | 是 | 景点名称 | "广州塔" |
| lat | Double | 是 | 景点纬度 | 23.105278 |
| lng | Double | 是 | 景点经度 | 113.324722 |
| icon | String | 否 | 景点类型图标（park/museum/landmark） | "landmark" |
| address | String | 否 | 景点地址 | "广东省广州市海珠区" |
| rating | Float | 否 | 景点评分（0-5） | 4.5 |
| distance | String | 否 | 距离用户的距离 | "2.5km" |

**请求示例**：

```bash
POST /api/favorite/attraction?name=广州塔&lat=23.105278&lng=113.324722&icon=landmark&address=广东省广州市海珠区&rating=4.5&distance=2.5km
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应** (200 OK)：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "index": 1,
    "name": "广州塔",
    "icon": "landmark",
    "address": "广东省广州市海珠区",
    "lng": 113.324722,
    "lat": 23.105278,
    "userId": 10001,
    "createTime": "2025-11-05T14:30:00",
    "isValid": 1,
    "rating": 4.5,
    "distance": "2.5km"
  }
}
```

**错误响应**：

| 错误码 | 说明 | 响应示例 |
|--------|------|----------|
| 401 | 用户未登录 | `{"code": 401, "message": "请先登录", "data": null}` |
| 400 | 参数错误 | `{"code": 400, "message": "景点名称不能为空", "data": null}` |
| 409 | 景点已收藏（幂等返回） | `{"code": 409, "message": "该景点已在收藏列表中", "data": null}` |
| 500 | 服务器错误 | `{"code": 500, "message": "添加景点收藏失败: ...", "data": null}` |

---

### 2. 取消景点收藏

**接口地址**：`DELETE /api/favorite/attraction`

**接口说明**：将景点从用户的收藏列表中移除（软删除，设置 `is_valid=0`）。

**请求参数**（Query Parameters）：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| name | String | 是 | 景点名称 | "广州塔" |
| lat | Double | 是 | 景点纬度 | 23.105278 |
| lng | Double | 是 | 景点经度 | 113.324722 |

**请求示例**：

```bash
DELETE /api/favorite/attraction?name=广州塔&lat=23.105278&lng=113.324722
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应** (200 OK)：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "取消景点收藏成功",
    "name": "广州塔",
    "lat": 23.105278,
    "lng": 113.324722
  }
}
```

**错误响应**：

| 错误码 | 说明 | 响应示例 |
|--------|------|----------|
| 401 | 用户未登录 | `{"code": 401, "message": "请先登录", "data": null}` |
| 400 | 未找到收藏记录 | `{"code": 400, "message": "未找到该景点的收藏记录", "data": null}` |
| 400 | 景点已取消收藏 | `{"code": 400, "message": "该景点收藏已被取消", "data": null}` |
| 500 | 服务器错误 | `{"code": 500, "message": "取消景点收藏失败: ...", "data": null}` |

---

### 3. 检查景点收藏状态

**接口地址**：`GET /api/favorite/attraction/status`

**接口说明**：检查某个景点是否已被当前用户收藏。

**请求参数**（Query Parameters）：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| name | String | 是 | 景点名称 | "广州塔" |
| lat | Double | 是 | 景点纬度 | 23.105278 |
| lng | Double | 是 | 景点经度 | 113.324722 |

**请求示例**：

```bash
GET /api/favorite/attraction/status?name=广州塔&lat=23.105278&lng=113.324722
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应** (200 OK)：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "name": "广州塔",
    "lat": 23.105278,
    "lng": 113.324722,
    "isFavorited": true
  }
}
```

**错误响应**：

| 错误码 | 说明 | 响应示例 |
|--------|------|----------|
| 401 | 用户未登录 | `{"code": 401, "message": "请先登录", "data": null}` |
| 400 | 参数错误 | `{"code": 400, "message": "用户不存在", "data": null}` |
| 500 | 服务器错误 | `{"code": 500, "message": "检查景点收藏状态失败: ...", "data": null}` |

---

## 🎯 业务逻辑说明

### 景点唯一性标识

景点通过以下四个字段的组合进行唯一标识：
- `user_id`（用户ID）
- `name`（景点名称）
- `lat`（纬度）
- `lng`（经度）

数据库表中设置了唯一索引：`UNIQUE INDEX uk_user_attraction(user_id, name, lat, lng)`

### 幂等性设计

**添加收藏接口**支持幂等性：
- ✅ 如果景点未收藏过，创建新的收藏记录
- ✅ 如果景点已收藏（`is_valid=1`），直接返回成功
- ✅ 如果景点曾被取消收藏（`is_valid=0`），恢复收藏状态并更新收藏时间

### 软删除机制

取消收藏采用**软删除**方式：
- 不会真正删除数据库记录
- 将 `is_valid` 字段设置为 `0`（0=已取消，1=有效）
- 可以通过添加收藏接口恢复之前取消的收藏

---

## 📱 前端集成示例

### JavaScript/Fetch 示例

```javascript
// 1. 添加景点收藏
async function addAttractionFavorite(attractionData) {
  const params = new URLSearchParams({
    name: attractionData.name,
    lat: attractionData.lat,
    lng: attractionData.lng,
    icon: attractionData.icon || '',
    address: attractionData.address || '',
    rating: attractionData.rating || '',
    distance: attractionData.distance || ''
  });

  const response = await fetch(`/api/favorite/attraction?${params}`, {
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

// 2. 取消景点收藏
async function removeAttractionFavorite(name, lat, lng) {
  const params = new URLSearchParams({ name, lat, lng });

  const response = await fetch(`/api/favorite/attraction?${params}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const result = await response.json();
  if (result.code === 200) {
    console.log('取消收藏成功');
  } else {
    console.error('取消收藏失败:', result.message);
  }
  return result;
}

// 3. 检查收藏状态
async function checkAttractionFavoriteStatus(name, lat, lng) {
  const params = new URLSearchParams({ name, lat, lng });

  const response = await fetch(`/api/favorite/attraction/status?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const result = await response.json();
  return result.data?.isFavorited || false;
}
```

### Vue 3 组件示例

```vue
<template>
  <div class="attraction-card">
    <h3>{{ attraction.name }}</h3>
    <p>{{ attraction.address }}</p>
    <button 
      @click="toggleFavorite" 
      :class="{ 'favorited': isFavorited }"
    >
      {{ isFavorited ? '❤️ 已收藏' : '🤍 收藏' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  attraction: Object
});

const isFavorited = ref(false);

// 检查收藏状态
async function checkFavoriteStatus() {
  try {
    const response = await axios.get('/api/favorite/attraction/status', {
      params: {
        name: props.attraction.name,
        lat: props.attraction.lat,
        lng: props.attraction.lng
      }
    });
    isFavorited.value = response.data.data.isFavorited;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
  }
}

// 切换收藏状态
async function toggleFavorite() {
  try {
    if (isFavorited.value) {
      // 取消收藏
      await axios.delete('/api/favorite/attraction', {
        params: {
          name: props.attraction.name,
          lat: props.attraction.lat,
          lng: props.attraction.lng
        }
      });
      isFavorited.value = false;
    } else {
      // 添加收藏
      await axios.post('/api/favorite/attraction', null, {
        params: {
          name: props.attraction.name,
          lat: props.attraction.lat,
          lng: props.attraction.lng,
          icon: props.attraction.icon,
          address: props.attraction.address,
          rating: props.attraction.rating,
          distance: props.attraction.distance
        }
      });
      isFavorited.value = true;
    }
  } catch (error) {
    console.error('操作失败:', error.response?.data?.message || error.message);
  }
}

onMounted(() => {
  checkFavoriteStatus();
});
</script>

<style scoped>
.favorited {
  color: red;
}
</style>
```

---

## 🧪 测试用例

### 使用 cURL 测试

```bash
# 1. 添加景点收藏
curl -X POST "http://localhost:8080/api/favorite/attraction?name=广州塔&lat=23.105278&lng=113.324722&icon=landmark&address=广东省广州市海珠区&rating=4.5&distance=2.5km" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. 检查收藏状态
curl -X GET "http://localhost:8080/api/favorite/attraction/status?name=广州塔&lat=23.105278&lng=113.324722" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. 取消景点收藏
curl -X DELETE "http://localhost:8080/api/favorite/attraction?name=广州塔&lat=23.105278&lng=113.324722" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 使用 Postman 测试

1. **设置环境变量**：
   - `base_url`: http://localhost:8080
   - `token`: 你的JWT Token

2. **添加景点收藏**：
   - Method: POST
   - URL: `{{base_url}}/api/favorite/attraction`
   - Params: name, lat, lng, icon, address, rating, distance
   - Headers: `Authorization: Bearer {{token}}`

3. **取消景点收藏**：
   - Method: DELETE
   - URL: `{{base_url}}/api/favorite/attraction`
   - Params: name, lat, lng
   - Headers: `Authorization: Bearer {{token}}`

---

## ⚠️ 注意事项

1. **经纬度精度**：建议保留 6 位小数，确保定位准确
2. **景点名称**：不能为空，建议使用官方标准名称
3. **Token 认证**：所有接口都需要有效的 JWT Token
4. **幂等性**：重复添加同一景点不会报错，会直接返回成功
5. **软删除**：取消收藏不会永久删除数据，可以重新收藏

---

## 🔄 与其他接口的关联

本功能与以下已有接口配合使用：

### 获取景点收藏列表

**接口地址**：`GET /api/favorite/attractions`

**接口说明**：查询用户的所有景点收藏（只返回 `is_valid=1` 的记录）

**请求参数**：
- `attractionType`（可选）：景点类型筛选
- `visitStatus`（可选）：访问状态筛选
- `city`（可选）：城市筛选

**示例**：
```bash
GET /api/favorite/attractions?city=广州
Authorization: Bearer YOUR_TOKEN
```

---

## 📊 数据库表结构参考

```sql
CREATE TABLE `attraction_favorite` (
  `index` int NOT NULL AUTO_INCREMENT COMMENT '收藏记录ID',
  `name` varchar(200) NOT NULL COMMENT '景点名称',
  `icon` varchar(255) DEFAULT NULL COMMENT '景点类型',
  `address` varchar(255) DEFAULT NULL COMMENT '景点地址',
  `lng` double DEFAULT NULL COMMENT '景点经度',
  `lat` double DEFAULT NULL COMMENT '景点纬度',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  `is_valid` int DEFAULT NULL COMMENT '1=有效，0=已取消',
  `rating` float DEFAULT NULL COMMENT '景点评分',
  `distance` varchar(255) DEFAULT NULL COMMENT '距离',
  PRIMARY KEY (`index`),
  UNIQUE KEY `uk_user_attraction` (`user_id`,`name`,`lat`,`lng`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📝 更新日志

### v1.0 (2025-11-05)
- ✅ 新增景点收藏接口（POST /api/favorite/attraction）
- ✅ 新增取消景点收藏接口（DELETE /api/favorite/attraction）
- ✅ 新增检查收藏状态接口（GET /api/favorite/attraction/status）
- ✅ 支持幂等性设计
- ✅ 支持软删除机制

---

## 💡 常见问题

**Q1: 为什么需要同时传 name、lat、lng 三个参数？**
- A: 因为同名景点可能有多个（如不同城市都有"人民公园"），经纬度用于精确定位唯一景点。

**Q2: 重复收藏同一景点会报错吗？**
- A: 不会，接口支持幂等性，重复收藏会直接返回成功。

**Q3: 取消收藏后数据还能恢复吗？**
- A: 可以，采用软删除机制，重新调用添加收藏接口即可恢复。

**Q4: icon 字段的有效值是什么？**
- A: 建议使用 `park`（公园）、`museum`（博物馆）、`landmark`（地标）等标准值。

---

## 📞 技术支持

如有问题，请联系后端开发团队或提交 Issue。


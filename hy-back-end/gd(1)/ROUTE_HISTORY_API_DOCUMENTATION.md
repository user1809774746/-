# 路线历史记录 API 接口文档

## 概述
本文档描述了路线历史记录功能的接口，包括保存路线查询记录和获取历史记录列表两个核心功能，以及删除记录和收藏管理等扩展功能。

## 数据库表设计

### route_history 表

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 主键ID | PRIMARY KEY, AUTO_INCREMENT |
| user_id | BIGINT | 用户ID | NOT NULL |
| departure | VARCHAR(500) | 出发地 | NOT NULL |
| destination | VARCHAR(500) | 目的地 | NOT NULL |
| departure_lat | DOUBLE | 出发地纬度 | 可选 |
| departure_lng | DOUBLE | 出发地经度 | 可选 |
| destination_lat | DOUBLE | 目的地纬度 | 可选 |
| destination_lng | DOUBLE | 目的地经度 | 可选 |
| distance | DOUBLE | 距离（千米） | 可选 |
| duration | INT | 预计时长（分钟） | 可选 |
| route_type | VARCHAR(50) | 路线类型 | 可选（driving/walking/transit/cycling） |
| search_time | DATETIME | 查询时间 | NOT NULL, 自动生成 |
| is_favorite | BOOLEAN | 是否收藏 | 默认 false |
| notes | VARCHAR(1000) | 备注信息 | 可选 |

### 建表 SQL

```sql
CREATE TABLE route_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    departure VARCHAR(500) NOT NULL,
    destination VARCHAR(500) NOT NULL,
    departure_lat DOUBLE,
    departure_lng DOUBLE,
    destination_lat DOUBLE,
    destination_lng DOUBLE,
    distance DOUBLE,
    duration INT,
    route_type VARCHAR(50),
    search_time DATETIME NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    notes VARCHAR(1000),
    INDEX idx_user_id (user_id),
    INDEX idx_search_time (search_time),
    INDEX idx_user_favorite (user_id, is_favorite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 接口列表

### 1. 保存路线查询记录

**接口描述**  
当用户在前端输入出发地和目的地并规划路线后，调用此接口将查询记录保存到数据库。

**接口地址**  
`POST /api/route/save-search`

**请求头**  
```
Authorization: Bearer <JWT Token>
Content-Type: application/json
```

**请求参数（Request Body）**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| departure | String | 是 | 出发地 | "北京市朝阳区" |
| destination | String | 是 | 目的地 | "北京市海淀区中关村" |
| departureLat | Double | 否 | 出发地纬度 | 39.9042 |
| departureLng | Double | 否 | 出发地经度 | 116.4074 |
| destinationLat | Double | 否 | 目的地纬度 | 39.9847 |
| destinationLng | Double | 否 | 目的地经度 | 116.3203 |
| distance | Double | 否 | 距离（千米） | 12.5 |
| duration | Integer | 否 | 预计时长（分钟） | 35 |
| routeType | String | 否 | 路线类型 | "driving" |
| notes | String | 否 | 备注信息 | "早高峰路线" |

**路线类型说明**
- `driving`: 驾车
- `walking`: 步行
- `transit`: 公交
- `cycling`: 骑行

**请求示例**

```json
{
  "departure": "北京市朝阳区",
  "destination": "北京市海淀区中关村",
  "departureLat": 39.9042,
  "departureLng": 116.4074,
  "destinationLat": 39.9847,
  "destinationLng": 116.3203,
  "distance": 12.5,
  "duration": 35,
  "routeType": "driving",
  "notes": "早高峰路线"
}
```

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "路线查询记录已保存",
    "historyId": 1,
    "history": {
      "id": 1,
      "userId": 10001,
      "departure": "北京市朝阳区",
      "destination": "北京市海淀区中关村",
      "departureLat": 39.9042,
      "departureLng": 116.4074,
      "destinationLat": 39.9847,
      "destinationLng": 116.3203,
      "distance": 12.5,
      "duration": 35,
      "routeType": "driving",
      "searchTime": "2025-10-28T14:30:00",
      "isFavorite": false,
      "notes": "早高峰路线"
    }
  }
}
```

错误响应：

```json
{
  "code": 400,
  "message": "出发地不能为空",
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

### 2. 获取历史记录列表

**接口描述**  
当用户点击历史记录时，调用此接口获取该用户所有的路线查询历史记录，按查询时间倒序排列。

**接口地址**  
`GET /api/route/history`

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
    "total": 3,
    "list": [
      {
        "id": 3,
        "userId": 10001,
        "departure": "上海市浦东新区",
        "destination": "上海市静安区",
        "departureLat": 31.2304,
        "departureLng": 121.4737,
        "destinationLat": 31.2277,
        "destinationLng": 121.4452,
        "distance": 8.3,
        "duration": 25,
        "routeType": "transit",
        "searchTime": "2025-10-28T16:45:00",
        "isFavorite": true,
        "notes": "地铁路线"
      },
      {
        "id": 2,
        "userId": 10001,
        "departure": "广州市天河区",
        "destination": "广州市越秀区",
        "departureLat": 23.1291,
        "departureLng": 113.2644,
        "destinationLat": 23.1291,
        "destinationLng": 113.2644,
        "distance": 10.2,
        "duration": 30,
        "routeType": "driving",
        "searchTime": "2025-10-28T15:20:00",
        "isFavorite": false,
        "notes": null
      },
      {
        "id": 1,
        "userId": 10001,
        "departure": "北京市朝阳区",
        "destination": "北京市海淀区中关村",
        "departureLat": 39.9042,
        "departureLng": 116.4074,
        "destinationLat": 39.9847,
        "destinationLng": 116.3203,
        "distance": 12.5,
        "duration": 35,
        "routeType": "driving",
        "searchTime": "2025-10-28T14:30:00",
        "isFavorite": false,
        "notes": "早高峰路线"
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

```json
{
  "code": 400,
  "message": "用户不存在",
  "data": null
}
```

---

### 3. 获取收藏的路线（扩展功能）

**接口描述**  
获取用户收藏的路线记录。

**接口地址**  
`GET /api/route/favorites`

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
    "total": 1,
    "list": [
      {
        "id": 3,
        "userId": 10001,
        "departure": "上海市浦东新区",
        "destination": "上海市静安区",
        "departureLat": 31.2304,
        "departureLng": 121.4737,
        "destinationLat": 31.2277,
        "destinationLng": 121.4452,
        "distance": 8.3,
        "duration": 25,
        "routeType": "transit",
        "searchTime": "2025-10-28T16:45:00",
        "isFavorite": true,
        "notes": "地铁路线"
      }
    ]
  }
}
```

---

### 4. 删除历史记录（扩展功能）

**接口描述**  
删除指定的历史记录。

**接口地址**  
`DELETE /api/route/history/{historyId}`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| historyId | Long | 是 | 历史记录ID |

**请求示例**  
`DELETE /api/route/history/1`

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": "历史记录已删除"
}
```

错误响应：

```json
{
  "code": 400,
  "message": "历史记录不存在",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "无权删除该历史记录",
  "data": null
}
```

---

### 5. 切换收藏状态（扩展功能）

**接口描述**  
切换历史记录的收藏状态（收藏/取消收藏）。

**接口地址**  
`POST /api/route/history/{historyId}/toggle-favorite`

**请求头**  
```
Authorization: Bearer <JWT Token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| historyId | Long | 是 | 历史记录ID |

**请求示例**  
`POST /api/route/history/1/toggle-favorite`

**响应参数**

成功响应（200）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "已添加到收藏",
    "history": {
      "id": 1,
      "userId": 10001,
      "departure": "北京市朝阳区",
      "destination": "北京市海淀区中关村",
      "departureLat": 39.9042,
      "departureLng": 116.4074,
      "destinationLat": 39.9847,
      "destinationLng": 116.3203,
      "distance": 12.5,
      "duration": 35,
      "routeType": "driving",
      "searchTime": "2025-10-28T14:30:00",
      "isFavorite": true,
      "notes": "早高峰路线"
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

## 使用流程示例

### 场景1：用户规划路线并保存

1. 用户在前端输入出发地"北京市朝阳区"和目的地"北京市海淀区中关村"
2. 前端调用地图API获取路线规划信息（距离、时长、坐标等）
3. 前端调用 `POST /api/route/save-search` 接口保存记录
4. 后端返回保存成功信息

```javascript
// 前端示例代码
const saveRouteSearch = async (routeData) => {
  const response = await fetch('http://api.example.com/api/route/save-search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      departure: "北京市朝阳区",
      destination: "北京市海淀区中关村",
      departureLat: 39.9042,
      departureLng: 116.4074,
      destinationLat: 39.9847,
      destinationLng: 116.3203,
      distance: 12.5,
      duration: 35,
      routeType: "driving"
    })
  });
  
  const result = await response.json();
  console.log(result);
};
```

### 场景2：用户查看历史记录

1. 用户点击"历史记录"按钮
2. 前端调用 `GET /api/route/history` 接口
3. 后端返回该用户所有历史记录列表（按时间倒序）
4. 前端展示历史记录列表

```javascript
// 前端示例代码
const getRouteHistory = async () => {
  const response = await fetch('http://api.example.com/api/route/history', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    const historyList = result.data.list;
    // 渲染历史记录列表
    renderHistoryList(historyList);
  }
};
```

### 场景3：用户收藏常用路线

1. 用户在历史记录列表中点击"收藏"按钮
2. 前端调用 `POST /api/route/history/{historyId}/toggle-favorite` 接口
3. 后端切换收藏状态并返回更新后的记录
4. 前端更新UI显示收藏状态

---

## 测试用例

### 测试用例1：保存路线查询记录

**前置条件**  
用户已登录，获得有效的JWT Token

**测试步骤**
1. 调用保存接口，传入出发地和目的地
2. 验证返回状态码为200
3. 验证返回的historyId不为空

**预期结果**  
记录成功保存到数据库，返回保存的记录信息

### 测试用例2：获取历史记录列表

**前置条件**  
用户已登录，且已有历史记录

**测试步骤**
1. 调用获取历史记录接口
2. 验证返回状态码为200
3. 验证返回的list不为空
4. 验证记录按时间倒序排列

**预期结果**  
成功返回用户的所有历史记录

### 测试用例3：未登录访问

**前置条件**  
不提供JWT Token

**测试步骤**
1. 调用任意需要认证的接口
2. 验证返回状态码为401

**预期结果**  
返回"请先登录"错误信息

---

## 注意事项

1. **认证要求**：所有接口都需要用户登录，请在请求头中携带有效的JWT Token
2. **必填字段**：保存记录时，出发地和目的地为必填项
3. **数据安全**：用户只能查看和操作自己的历史记录，不能访问其他用户的数据
4. **时间排序**：历史记录默认按查询时间倒序排列，最新的记录显示在最前面
5. **坐标精度**：经纬度使用Double类型，建议保留6位小数
6. **字符限制**：出发地和目的地最多500字符，备注信息最多1000字符

---

## 后续扩展建议

1. **分页功能**：当历史记录较多时，可以添加分页参数（page、pageSize）
2. **搜索功能**：支持按出发地或目的地搜索历史记录
3. **时间筛选**：支持按日期范围筛选历史记录
4. **批量操作**：支持批量删除或批量收藏
5. **统计分析**：统计用户最常去的地点、最常用的路线类型等
6. **路线分享**：支持将历史路线分享给其他用户

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2025-10-28 | 初始版本，实现基础的保存和查询功能 |

---

## 联系方式

如有问题或建议，请联系开发团队。


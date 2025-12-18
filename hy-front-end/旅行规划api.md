# 旅行计划管理系统 API 接口文档

## 概述

本文档描述了旅行计划管理系统的所有API接口，支持完整的旅行方案管理功能，包括旅行计划、日程安排、活动管理和住宿推荐等功能。

**基础URL**: `http://localhost:8082`  
**版本**: v1.1  
**更新时间**: 2025-11-18

---

## 1. 旅行计划管理 (TravelPlanController)

### 1.1 获取用户所有旅行方案

**接口地址**: `GET /api/travel-plans/user/{userId}`

**功能描述**: 获取指定用户的所有旅行计划列表

**请求参数**:
- `userId` (路径参数): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 123,
    "total": 3,
    "travelPlans": [
      {
        "id": 1,
        "userId": 123,
        "title": "北京文化探索之旅",
        "destination": "北京",
        "travelDays": 5,
        "startDate": "2026-01-01",
        "endDate": "2026-01-05",
        "totalBudget": 5000.00,
        "status": "active",
        "createdAt": "2025-11-14T10:00:00",
        "updatedAt": "2025-11-14T10:00:00"
      }
    ]
  }
}
```

**自动补充日程规则**:

- 后端根据更新后的 `startDate` 和 `endDate` 重新计算 `travelDays`（含首尾两天）。
- 若新的 `travelDays` 大于当前已有的日程数量，将自动追加对应数量的 `daily_itineraries` 记录：
  - 新增日程的 `dayNumber` 从 `当前日程数量 + 1` 开始递增，直到 `travelDays`；
  - 若 `startDate` 不为空，则 `date = startDate + (dayNumber - 1)`；
  - 仅负责“补齐缺少的天数”，**不会自动删除或调整已有日程**。

### 1.2 获取旅行计划详情

**接口地址**: `GET /api/travel-plans/{id}`

**功能描述**: 获取指定旅行计划的基本信息

**请求参数**:
- `id` (路径参数): 旅行计划ID

### 1.3 获取旅行计划完整详情

**接口地址**: `GET /api/travel-plans/{id}/full`

**功能描述**: 获取旅行计划的完整详情，包含所有日程和住宿信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlan": {
      "id": 1,
      "title": "北京文化探索之旅",
      "destination": "北京",
      "travelDays": 3,
      "startDate": "2026-01-01",
      "endDate": "2026-01-05",
      "totalBudget": 3000.00,
      "status": "active"
    },
    "dailyItineraries": [
      {
        "id": 1,
        "dayNumber": 1,
        "date": "2025-11-15",
        "activities": [...]
      }
    ],
    "accommodations": [...],
    "totalDays": 3,
    "totalAccommodations": 5
  }
}
```

### 1.4 更新旅行计划状态

**接口地址**: `PUT /api/travel-plans/{id}/status`

**功能描述**: 更新旅行计划的状态

**请求参数**:
- `id` (路径参数): 旅行计划ID
- `status` (查询参数): 新状态 (`draft`/`active`/`completed`)

**请求示例**:
```
PUT /api/travel-plans/1/status?status=completed
```

### 1.5 按状态获取旅行计划

**接口地址**: `GET /api/travel-plans/user/{userId}/status/{status}`

**功能描述**: 获取用户指定状态的旅行计划

**请求参数**:
- `userId` (路径参数): 用户ID
- `status` (路径参数): 状态 (`draft`/`active`/`completed`)

### 1.6 删除旅行计划

**接口地址**: `DELETE /api/travel-plans/{id}`

**功能描述**: 删除旅行计划及其所有相关数据（日程、活动、住宿）

### 1.7 更新旅行日期

**接口地址**: `PUT /api/travel-plans/{id}/dates`

**功能描述**: 更新旅行计划的开始日期和结束日期，并自动更新 `travelDays`。当新的日期范围变长时，会为该旅行计划**自动补充缺少的日程记录**。

**请求参数**:
- `id` (路径参数): 旅行计划ID

**请求体示例**:
```json
{
  "startDate": "2026-01-01",   // 可选：开始日期，格式 yyyy-MM-dd
  "endDate": "2026-01-05"      // 可选：结束日期，格式 yyyy-MM-dd
}
```

**说明**:
- `startDate` 和 `endDate` 至少提供一个，不能同时为空。
- 如果同时提供，则会根据两者之间的天数自动更新 `travelDays`（含首尾两天）。

### 1.8 获取需要提醒的旅行计划

**接口地址**: `GET /api/travel-plans/user/{userId}/reminders`

**功能描述**: 根据用户ID和当前日期，获取所有**已经到达或早于当前日期且未完成**的旅行计划，用于提醒用户是否正在执行该计划。

**请求参数**:
- `userId` (路径参数): 用户ID
- `currentDate` (查询参数，可选): 当前日期，格式 `yyyy-MM-dd`；若不传则默认使用系统当天日期

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 123,
    "currentDate": "2026-01-01",
    "total": 2,
    "travelPlans": [
      {
        "id": 1,
        "userId": 123,
        "title": "北京3日游",
        "destination": "北京",
        "travelDays": 3,
        "startDate": "2026-01-01",
        "endDate": "2026-01-03",
        "status": "draft"
      }
    ]
  }
}
```

**使用场景**:
- 前端在此接口返回数据后，可以弹窗提醒用户："您有旅行计划即将开始，是否要开始执行？"
- 用户确认后，调用 **1.14 更新旅行计划状态接口**，将状态从 `draft` 改为 `active`

---

### 1.9 更新旅行计划状态

**接口地址**: `PUT /api/travel-plans/{id}/status`

**功能描述**: 更新旅行计划的状态（草稿 → 进行中 → 已完成）

**请求参数**:
- `id` (路径参数): 旅行计划ID

**请求体**:
```json
{
  "status": "active"
}
```

**状态说明**:
- `draft`: 草稿（AI生成后的初始状态）
- `active`: 进行中（用户确认开始执行）
- `completed`: 已完成（旅行结束或用户手动完成）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "title": "北京3日游",
    "oldStatus": "draft",
    "newStatus": "active",
    "message": "旅行计划状态已更新"
  }
}
```

**自动化机制**:
- 系统每天凌晨2点会自动检查所有 `active` 状态的旅行计划
- 如果结束日期（`endDate`）早于当天，自动将状态改为 `completed`
- 无需手动操作，旅行结束后会自动完成

**典型流程**:
1. AI生成旅行计划 → 状态为 `draft`
2. 用户在旅行开始日期收到提醒
3. 用户确认开始 → 调用此接口，状态改为 `active`
4. 旅行结束日期到达 → 系统自动改为 `completed`

---

### 1.10 获取用户总的旅行计划数量

**接口地址**: `GET /api/travel-plans/user/{userId}/total`

**功能描述**: 获取指定用户的旅行计划总数量，同时数据库中 `user_info.total_travel` 字段会在创建/删除旅行计划时自动维护。

**请求参数**:
- `userId` (路径参数): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 123,
    "totalTravel": 5
  }
}
```

### 1.10 为旅行计划上传图片

**接口地址**: `POST /api/travel-plans/{id}/images`

**功能描述**: 为指定旅行计划上传图片，图片以二进制形式存储在 `travel_plan_images` 表中。

**请求参数**:
- `id` (路径参数): 旅行计划ID

**请求体 (multipart/form-data)**:
- `file` (必填): 要上传的图片文件
- `description` (可选): 图片描述

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 10,
    "travelPlanId": 1,
    "contentType": "image/jpeg",
    "description": "行程封面图",
    "createdAt": "2026-01-01T10:00:00"
  }
}
```

### 1.11 获取旅行计划的图片列表（元信息）

**接口地址**: `GET /api/travel-plans/{id}/images`

**功能描述**: 获取指定旅行计划下所有已上传图片的元信息列表（不直接返回图片二进制数据）。前端可根据返回的 `id` 再扩展单独的图片下载接口。

**请求参数**:
- `id` (路径参数): 旅行计划ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "total": 2,
    "images": [
      {
        "id": 10,
        "travelPlanId": 1,
        "contentType": "image/jpeg",
        "description": "行程封面图",
        "createdAt": "2026-01-01T10:00:00"
      }
    ]
  }
}
```

---

## 2. 日程管理 (DailyItineraryController)

### 2.1 获取旅行计划的所有日程

**接口地址**: `GET /api/daily-itineraries/travel-plan/{travelPlanId}`

**功能描述**: 获取指定旅行计划的所有日程安排

**请求参数**:
- `travelPlanId` (路径参数): 旅行计划ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "total": 3,
    "dailyItineraries": [
      {
        "id": 1,
        "travelPlanId": 1,
        "dayNumber": 1,
        "date": "2025-11-15",
        "city": "北京",
        "createdAt": "2025-11-14T10:00:00"
      }
    ]
  }
}
```

### 2.2 获取特定日程详情

**接口地址**: `GET /api/daily-itineraries/{id}`

**功能描述**: 获取指定日程的详细信息，包含所有活动

### 2.3 获取特定天数的日程

**接口地址**: `GET /api/daily-itineraries/travel-plan/{travelPlanId}/day/{dayNumber}`

**功能描述**: 获取旅行计划中指定天数的日程

**请求参数**:
- `travelPlanId` (路径参数): 旅行计划ID
- `dayNumber` (路径参数): 天数 (1, 2, 3...)

### 2.4 删除日程（按ID）

**接口地址**: `DELETE /api/daily-itineraries/{id}`

**功能描述**: 删除指定日程及其所有活动，同时会：
- 重新整理该旅行计划下剩余日程的 `dayNumber`（从 1 开始连续）
- 若 `startDate` 不为空，重新计算每一天的 `date`
- 自动更新 `travel_plans.travelDays` 和 `endDate`

---

### 2.5 新增一天（日程追加到最后）

**接口地址**: `POST /api/daily-itineraries/travel-plan/{travelPlanId}/add-day`

**功能描述**: 在指定旅行计划的最后追加一天日程，并自动更新 `travelDays` 和 `endDate`。

**请求参数**:
- `travelPlanId` (路径参数): 旅行计划ID

**自动更新规则**:
- 新增日程的 `dayNumber = 当前日程数量 + 1`（若当前没有日程则为 1）
- 新增日程的 `date` 计算优先级：
  1. 若 `startDate` 不为空，`date = startDate + (dayNumber - 1)`
  2. 否则若已存在日程且最后一天有 `date`，则 `date = 最后一天的 date + 1 天`
  3. 否则若 `endDate` 不为空，则 `date = endDate + 1 天`
- `travelDays = travelDays + 1`
- 若 `startDate` 不为空，`endDate = startDate + (travelDays - 1)`；否则若新增日程有 `date`，则用该 `date` 作为新的 `endDate`

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "dailyItinerary": {
      "id": 10,
      "dayNumber": 4,
      "date": "2026-01-04",
      "city": "北京"
    },
    "travelDays": 4,
    "startDate": "2026-01-01",
    "endDate": "2026-01-04"
  }
}
```

### 2.6 按天数删除一天

**接口地址**: `DELETE /api/daily-itineraries/travel-plan/{travelPlanId}/day/{dayNumber}`

**功能描述**: 删除指定旅行计划中第 `dayNumber` 天的日程及其所有活动，并触发与 2.4 相同的自动更新逻辑：
- 重新整理剩余日程的 `dayNumber`（从 1 开始连续）
- 若 `startDate` 不为空，重新计算每一天的 `date`
- 自动更新 `travel_plans.travelDays` 和 `endDate`

**请求参数**:
- `travelPlanId` (路径参数): 旅行计划ID
- `dayNumber` (路径参数): 天数 (1, 2, 3...)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "deletedDayNumber": 3,
    "travelDays": 3,
    "startDate": "2026-01-01",
    "endDate": "2026-01-03",
    "remainingDailyItineraries": [
      { "dayNumber": 1, "date": "2026-01-01" },
      { "dayNumber": 2, "date": "2026-01-02" },
      { "dayNumber": 3, "date": "2026-01-03" }
    ]
  }
}
```

---

## 3. 活动管理 (ItineraryActivityController) - 核心功能

### 3.1 获取某天的所有活动

**接口地址**: `GET /api/activities/daily-itinerary/{dailyItineraryId}`

**功能描述**: 获取指定日程的所有活动，按排序顺序返回

**请求参数**:
- `dailyItineraryId` (路径参数): 日程ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dailyItineraryId": 1,
    "total": 4,
    "activities": [
      {
        "id": 1,
        "dailyItineraryId": 1,
        "activityTime": "09:00-12:00",
        "activityName": "参观故宫",
        "location": "故宫博物院",
        "description": "游览紫禁城，了解明清历史",
        "cost": 60.00,
        "transportation": "地铁",
        "photoUrl": "http://example.com/photo.jpg",
        "sortOrder": 0,
        "isCustomized": false,
        "attraction": {
          "id": 1,
          "name": "故宫博物院",
          "ticketPriceAdult": 60.00,
          "ticketPriceStudent": 30.00,
          "ticketPriceElderly": 30.00,
          "longitude": 116.397128,
          "latitude": 39.916527,
          "openingHours": "08:30-17:00",
          "mustSeeSpots": ["太和殿", "乾清宫", "御花园"],
          "tips": "建议提前网上购票，避开周末高峰期"
        }
      }
    ]
  }
}
```

### 3.2 获取活动详情

**接口地址**: `GET /api/activities/{id}`

**功能描述**: 获取指定活动的详细信息

### 3.3 创建新活动

**接口地址**: `POST /api/activities`

**功能描述**: 在指定日程中创建新活动

**请求体**:
```json
{
  "dailyItineraryId": 1,
  "activityTime": "14:00-17:00",
  "activityName": "购物",
  "location": "王府井大街",
  "description": "购买纪念品和特产",
  "cost": 200.00,
  "transportation": "步行",
  "sortOrder": 2
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "activity": {
      "id": 5,
      "dailyItineraryId": 1,
      "activityTime": "14:00-17:00",
      "activityName": "购物",
      "location": "王府井大街",
      "cost": 200.00,
      "sortOrder": 2,
      "isCustomized": true
    },
    "message": "活动创建成功"
  }
}
```

### 3.4 更新活动信息

**接口地址**: `PUT /api/activities/{id}`

**功能描述**: 更新指定活动的信息

**请求参数**:
- `id` (路径参数): 活动ID

**请求体**:
```json
{
  "activityTime": "15:00-18:00",
  "activityName": "逛街购物",
  "cost": 250.00
}
```

### 3.5 删除活动

**接口地址**: `DELETE /api/activities/{id}`

**功能描述**: 删除指定活动

### 3.6 调整活动顺序 ⭐

**接口地址**: `PUT /api/activities/daily-itinerary/{dailyItineraryId}/sort`

**功能描述**: 调整指定日程中活动的排序顺序

**请求参数**:
- `dailyItineraryId` (路径参数): 日程ID

**请求体**:
```json
{
  "activityIds": [3, 1, 4, 2]
}
```

**说明**: `activityIds` 数组按新的排序顺序排列活动ID

### 3.7 按时间段获取活动

**接口地址**: `GET /api/activities/daily-itinerary/{dailyItineraryId}/by-time`

**功能描述**: 获取按时间段分组的活动

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dailyItineraryId": 1,
    "activitiesByTime": {
      "上午 (09:00-12:00)": [
        {
          "id": 1,
          "activityName": "参观故宫",
          "activityTime": "09:00-12:00"
        }
      ],
      "下午 (14:00-18:00)": [
        {
          "id": 2,
          "activityName": "购物",
          "activityTime": "14:00-17:00"
        }
      ]
    }
  }
}
```

---

## 4. 景点管理 (AttractionController) - 新增

### 4.1 获取所有景点

**接口地址**: `GET /api/attractions`

**功能描述**: 获取系统中所有景点信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "attractions": [
      {
        "id": 1,
        "name": "故宫博物院",
        "ticketPriceAdult": 60.00,
        "ticketPriceStudent": 30.00,
        "ticketPriceElderly": 30.00,
        "longitude": 116.397128,
        "latitude": 39.916527,
        "openingHours": "08:30-17:00",
        "mustSeeSpots": ["太和殿", "乾清宫", "御花园"],
        "tips": "建议提前网上购票，避开周末高峰期",
        "createdAt": "2025-11-18T10:00:00",
        "updatedAt": "2025-11-18T10:00:00"
      }
    ]
  }
}
```

### 4.2 获取景点详情

**接口地址**: `GET /api/attractions/{id}`

**功能描述**: 获取指定景点的详细信息

**请求参数**:
- `id` (路径参数): 景点ID（与活动ID相同）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "故宫博物院",
    "ticketPriceAdult": 60.00,
    "ticketPriceStudent": 30.00,
    "ticketPriceElderly": 30.00,
    "longitude": 116.397128,
    "latitude": 39.916527,
    "openingHours": "08:30-17:00",
    "mustSeeSpots": ["太和殿", "乾清宫", "御花园"],
    "tips": "建议提前网上购票，避开周末高峰期"
  }
}
```

### 4.3 通过活动ID获取景点信息

**接口地址**: `GET /api/attractions/activity/{activityId}`

**功能描述**: 通过活动ID获取关联的景点信息

**请求参数**:
- `activityId` (路径参数): 活动ID

### 4.4 创建或更新景点信息

**接口地址**: `POST /api/attractions`

**功能描述**: 为活动创建或更新景点详细信息。

- 若请求体中 **包含 `id`**，则视为对已有景点的创建/更新（`id` 与活动ID一致）。
- 若 **未提供 `id` 但提供了 `dailyItineraryId`**，则后端会自动在该日程下创建一条“游览该景点”的活动，并使用新活动的 ID 作为景点 ID 进行创建，实现“新增景点时自动新增一条活动”的效果。

**请求体**:
```json
{
  "id": 1,                          // 可选：景点ID（与活动ID相同）；若不提供则需提供dailyItineraryId
  "dailyItineraryId": 10,          // 可选：日程ID；当未提供id时必填，用于自动创建一条“游览该景点”的活动
  "activityTime": "09:00-12:00",   // 可选：自动创建活动时使用的时间段，默认 "09:00-12:00"
  "name": "故宫博物院",              // 可选：景点名称；自动创建活动时将作为活动名称和location
  "ticketPriceAdult": 60.00,        // 可选：成人票价，同时用于自动创建活动的cost
  "ticketPriceStudent": 30.00,      // 可选：学生票价
  "ticketPriceElderly": 30.00,      // 可选：老人票价
  "longitude": 116.397128,          // 可选：经度
  "latitude": 39.916527,            // 可选：纬度
  "openingHours": "08:30-17:00",    // 可选：开放时间
  "mustSeeSpots": ["太和殿", "乾清宫", "御花园"],  // 可选：必看景点数组
  "tips": "建议提前网上购票",        // 可选：温馨提示，同时用于自动创建活动的描述
  "photoUrl": "http://example.com/attraction.jpg" // 可选：景点/活动照片URL，将同步写入活动的photoUrl
}
```

### 4.5 删除景点信息

**接口地址**: `DELETE /api/attractions/{id}`

**功能描述**: 删除指定景点信息

**请求参数**:
- `id` (路径参数): 景点ID

### 4.6 按名称搜索景点

**接口地址**: `GET /api/attractions/search`

**功能描述**: 按景点名称模糊搜索

**请求参数**:
- `name` (查询参数): 景点名称关键词

**请求示例**:
```
GET /api/attractions/search?name=故宫
```

### 4.7 按位置范围获取景点

**接口地址**: `GET /api/attractions/nearby`

**功能描述**: 获取指定位置附近的景点

**请求参数**:
- `longitude` (查询参数): 经度
- `latitude` (查询参数): 纬度
- `radius` (查询参数): 半径（公里），默认5公里

**请求示例**:
```
GET /api/attractions/nearby?longitude=116.397128&latitude=39.916527&radius=10
```

### 4.8 获取旅行计划的所有景点

**接口地址**: `GET /api/attractions/travel-plan/{travelPlanId}`

**功能描述**: 获取指定旅行计划下涉及到的所有景点信息

**请求参数**:
- `travelPlanId` (路径参数): 旅行计划ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "total": 3,
    "attractions": [
      {
        "id": 1,
        "name": "故宫博物院",
        "ticketPriceAdult": 60.00,
        "ticketPriceStudent": 30.00,
        "ticketPriceElderly": 30.00,
        "longitude": 116.397128,
        "latitude": 39.916527,
        "openingHours": "08:30-17:00",
        "mustSeeSpots": ["太和殿", "乾清宫", "御花园"],
        "tips": "建议提前网上购票，避开周末高峰期"
      }
    ]
  }
}
```

---

## 5. 住宿管理 (AccommodationController)

### 4.1 获取旅行计划的所有住宿推荐

**接口地址**: `GET /api/accommodations/travel-plan/{travelPlanId}`

**功能描述**: 获取指定旅行计划的所有住宿推荐

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "total": 5,
    "accommodations": [
      {
        "id": 1,
        "travelPlanId": 1,
        "name": "北京饭店",
        "type": "豪华型",
        "location": "王府井大街",
        "pricePerNight": 800.00,
        "advantages": "地理位置优越，交通便利",
        "photo": "http://example.com/hotel-photo.jpg",
        "isSelected": false
      }
    ]
  }
}
```

### 4.2 获取住宿详情

**接口地址**: `GET /api/accommodations/{id}`

**功能描述**: 获取指定住宿的详细信息

### 4.3 选择住宿

**接口地址**: `PUT /api/accommodations/{id}/select`

**功能描述**: 选择指定住宿

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accommodation": {
      "id": 1,
      "name": "北京饭店",
      "isSelected": true
    },
    "message": "住宿选择成功"
  }
}
```

### 4.4 取消选择住宿

**接口地址**: `PUT /api/accommodations/{id}/unselect`

**功能描述**: 取消选择指定住宿

### 4.5 获取已选择的住宿

**接口地址**: `GET /api/accommodations/travel-plan/{travelPlanId}/selected`

**功能描述**: 获取用户已选择的住宿列表

### 4.6 按类型筛选住宿

**接口地址**: `GET /api/accommodations/travel-plan/{travelPlanId}/type/{type}`

**功能描述**: 按住宿类型筛选

**请求参数**:
- `type` (路径参数): 住宿类型 (`经济型`/`舒适型`/`豪华型`)

### 4.7 按价格范围筛选住宿

**接口地址**: `GET /api/accommodations/travel-plan/{travelPlanId}/price-range`

**功能描述**: 按价格范围筛选住宿

**请求参数**:
- `minPrice` (查询参数): 最低价格
- `maxPrice` (查询参数): 最高价格

**请求示例**:
```
GET /api/accommodations/travel-plan/1/price-range?minPrice=200&maxPrice=800
```

---

## 6. 数据传输对象 (DTO)

### 6.1 ActivityCreateDTO - 创建活动

```json
{
  "dailyItineraryId": 1,           // 必填：日程ID
  "activityTime": "09:00-12:00",   // 必填：活动时间
  "activityName": "参观博物馆",      // 必填：活动名称
  "location": "国家博物馆",         // 必填：活动地点
  "description": "了解历史文化",    // 可选：活动描述
  "cost": 50.00,                  // 可选：费用
  "transportation": "地铁",        // 可选：交通方式
  "photoUrl": "http://example.com/photo.jpg", // 可选：照片URL
  "sortOrder": 0                  // 可选：排序顺序
}
```

### 6.2 ActivityUpdateDTO - 更新活动

```json
{
  "activityTime": "10:00-13:00",   // 可选：活动时间
  "activityName": "参观艺术馆",      // 可选：活动名称
  "location": "国家艺术馆",         // 可选：活动地点
  "description": "欣赏艺术作品",    // 可选：活动描述
  "cost": 60.00,                  // 可选：费用
  "transportation": "公交",        // 可选：交通方式
  "photoUrl": "http://example.com/new-photo.jpg", // 可选：照片URL
  "sortOrder": 1                  // 可选：排序顺序
}
```

### 6.3 ActivitySortDTO - 活动排序

```json
{
  "activityIds": [3, 1, 2, 4]     // 必填：按新顺序排列的活动ID数组
}
```

### 6.4 AttractionDTO - 景点信息

```json
{
  "id": 1,                          // 景点ID（与活动ID相同）
  "name": "故宫博物院",              // 景点名称
  "ticketPriceAdult": 60.00,        // 成人票价
  "ticketPriceStudent": 30.00,      // 学生票价
  "ticketPriceElderly": 30.00,      // 老人票价
  "longitude": 116.397128,          // 经度
  "latitude": 39.916527,            // 纬度
  "openingHours": "08:30-17:00",    // 开放时间
  "mustSeeSpots": ["太和殿", "乾清宫", "御花园"],  // 必看景点（JSON数组）
  "tips": "建议提前网上购票",        // 温馨提示
  "photoUrl": "http://example.com/attraction.jpg", // 照片URL
  "createdAt": "2025-11-18T10:00:00",              // 创建时间
  "updatedAt": "2025-11-18T10:00:00"               // 更新时间
}
```

### 6.5 ActivityWithAttractionDTO - 活动及景点信息

```json
{
  "id": 1,
  "dailyItineraryId": 1,
  "activityTime": "09:00-12:00",
  "activityName": "参观故宫",
  "location": "故宫博物院",
  "description": "游览紫禁城",
  "cost": 60.00,
  "transportation": "地铁",
  "photoUrl": "http://example.com/photo.jpg",
  "sortOrder": 0,
  "isCustomized": false,
  "attraction": {                    // 可选：景点详情（如果活动关联了景点）
    "id": 1,
    "name": "故宫博物院",
    "ticketPriceAdult": 60.00,
    "ticketPriceStudent": 30.00,
    "ticketPriceElderly": 30.00,
    "longitude": 116.397128,
    "latitude": 39.916527,
    "openingHours": "08:30-17:00",
    "mustSeeSpots": ["太和殿", "乾清宫", "御花园"],
    "tips": "建议提前网上购票"
  }
}
```

---

## 7. 响应格式

### 7.1 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 具体数据内容
  }
}
```

### 7.2 错误响应

```json
{
  "code": 400,
  "message": "参数验证失败: 活动名称不能为空",
  "data": null
}
```

### 7.3 常见状态码

- `200`: 请求成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 8. 使用场景示例

### 8.1 前端获取用户旅行方案流程

```javascript
// 1. 获取用户所有旅行方案
const response = await fetch('/api/travel-plans/user/123');
const plans = await response.json();

// 2. 获取特定旅行方案的完整详情
const detailResponse = await fetch('/api/travel-plans/1/full');
const fullDetails = await detailResponse.json();

// 3. 更新旅行方案状态
await fetch('/api/travel-plans/1/status?status=completed', {
  method: 'PUT'
});
```

### 8.2 管理每天活动流程

```javascript
// 1. 获取第1天的所有活动
const activities = await fetch('/api/activities/daily-itinerary/1');

// 2. 创建新活动
await fetch('/api/activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dailyItineraryId: 1,
    activityTime: '14:00-17:00',
    activityName: '购物',
    location: '商业街'
  })
});

// 3. 调整活动顺序
await fetch('/api/activities/daily-itinerary/1/sort', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    activityIds: [3, 1, 4, 2]
  })
});
```

### 8.3 住宿选择流程

```javascript
// 1. 获取所有住宿推荐
const accommodations = await fetch('/api/accommodations/travel-plan/1');

// 2. 选择住宿
await fetch('/api/accommodations/5/select', {
  method: 'PUT'
});

// 3. 获取已选择的住宿
const selected = await fetch('/api/accommodations/travel-plan/1/selected');
```

### 8.4 景点信息管理流程

```javascript
// 1. 获取所有景点
const attractions = await fetch('/api/attractions');

// 2. 搜索景点
const searchResults = await fetch('/api/attractions/search?name=故宫');

// 3. 获取附近景点
const nearby = await fetch('/api/attractions/nearby?longitude=116.397128&latitude=39.916527&radius=10');

// 4. 为活动添加景点信息
await fetch('/api/attractions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 1,  // 活动ID
    name: '故宫博物院',
    ticketPriceAdult: 60.00,
    openingHours: '08:30-17:00',
    mustSeeSpots: ['太和殿', '乾清宫'],
    tips: '建议提前购票'
  })
});

// 5. 获取活动的景点信息
const attractionDetail = await fetch('/api/attractions/activity/1');
```

---

## 9. 注意事项

1. **时间格式**: 活动时间使用 `HH:mm-HH:mm` 格式，如 `09:00-12:00`
2. **状态枚举**: 旅行计划状态只能是 `draft`、`active`、`completed` 之一
3. **住宿类型**: 只支持 `经济型`、`舒适型`、`豪华型` 三种类型
4. **级联删除**: 删除旅行计划会自动删除所有相关的日程、活动和住宿数据
5. **排序顺序**: 活动的 `sortOrder` 从 0 开始，数值越小排序越靠前
6. **价格格式**: 所有价格使用 `BigDecimal` 类型，保留两位小数
7. **景点关联**: 景点表通过外键与活动表关联，景点ID与活动ID相同
8. **必看景点**: `mustSeeSpots` 字段为JSON数组格式，存储多个景点名称
9. **坐标格式**: 经度和纬度使用 `DECIMAL(10,6)` 类型，精确到小数点后6位
10. **照片URL**: 活动的 `photoUrl` 字段存储活动或景点的照片链接
11. **旅行计划标题**: `title` 字段为旅行计划的主题标题，如“北京文化探索之旅”
12. **旅行日期**: 使用 `startDate` 和 `endDate` 两个字段分别表示开始和结束日期，格式为 `yyyy-MM-dd`
13. **城市字段**: `city` 字段记录每天行程所在的城市，支持多城市旅行
14. **住宿照片**: `photo` 字段存储住宿的展示照片URL

---

## 10. 数据库表关系说明

### 10.1 表关系图

```
travel_plans (旅行计划)
    |
    |-- daily_itineraries (日程安排)
    |       |
    |       |-- itinerary_activities (活动)
    |               |
    |               |-- attractions (景点详情) [1:1关系，共享主键]
    |
    |-- accommodations (住宿推荐)
```

### 10.2 关键外键关系

1. **daily_itineraries.travel_plan_id** → travel_plans.id
2. **itinerary_activities.daily_itinerary_id** → daily_itineraries.id
3. **attractions.id** → itinerary_activities.id (共享主键，1:1关系)
4. **accommodations.travel_plan_id** → travel_plans.id

### 10.3 景点与活动的关系

- 景点表（attractions）与活动表（itinerary_activities）是**一对一关系**
- 它们共享相同的主键ID
- 不是所有活动都有景点详情，只有旅游景点类活动才需要关联景点信息
- 当查询活动时，可以通过JOIN获取关联的景点详情

---

## 11. 更新日志

- **v1.1** (2025-11-18): 
  - 新增景点管理模块（AttractionController）
  - 活动响应中新增景点详情字段
  - 新增景点搜索和位置查询功能
  - 更新数据库表关系说明
  - 新增 `photoUrl` 字段到活动响应
  - **旅行计划新增字段**: `title`（计划标题）、`date`（旅行日期）
  - **日程安排新增字段**: `city`（所在城市）
  - **住宿推荐新增字段**: `photo`（住宿照片）
- **v1.0** (2025-11-14): 初始版本，包含完整的旅行计划管理功能

---

**联系方式**: 如有问题请联系开发团队
**文档维护**: 请及时更新接口变更

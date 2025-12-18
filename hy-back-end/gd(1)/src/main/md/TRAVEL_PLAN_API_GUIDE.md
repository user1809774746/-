# Travel Plan API Integration Guide

## 概述

此文档说明如何将 n8n 工作流返回的旅行计划 JSON 数据存储到数据库中。

## 数据库结构

系统包含以下5个主要表：

1. **travel_plans** - 旅行计划主表
2. **daily_itineraries** - 每日行程表
3. **itinerary_activities** - 行程活动详情表
4. **accommodations** - 住宿推荐表
5. **attractions** - 景点详情表

## 已创建的文件

### 实体类 (Entity)
- `TravelPlan.java` - 旅行计划实体
- `DailyItinerary.java` - 每日行程实体
- `ItineraryActivity.java` - 行程活动实体
- `Accommodation.java` - 住宿实体
- `Attraction.java` - 景点实体

### 仓库接口 (Repository)
- `TravelPlanRepository.java`
- `DailyItineraryRepository.java`
- `ItineraryActivityRepository.java`
- `AccommodationRepository.java`
- `AttractionRepository.java`

### 数据传输对象 (DTO)
- `TravelPlanDTO.java` - 匹配 n8n 返回的 JSON 结构

### 服务层 (Service)
- `TravelPlanService.java` - 处理数据转换和保存逻辑

### 控制器 (Controller)
- `TravelPlanController.java` - 提供 REST API 端点

### 配置类 (Config)
- `JacksonConfig.java` - JSON 处理配置

## API 端点

### 1. 接收 n8n 数据 (Webhook)

**端点:** `POST /api/travel-plans/webhook`

**参数:**
- `userId` (可选) - 用户ID，默认为1

**请求体:** n8n 返回的 JSON 数组格式

```json
[
  {
    "travel_plan": {
      "title": "上海三日游",
      "destination": "上海",
      "travel_days": 3,
      "date": "2025.01.02-2025.01.04",
      "total_budget": 1780,
      "budget_breakdown": {...},
      "daily_itinerary": [...],
      "accommodation_recommendations": [...],
      "attraction_details": [...],
      "total_tips": "...",
      "special_requirements": "..."
    }
  }
]
```

**响应示例:**
```json
{
  "success": true,
  "message": "Travel plan saved successfully",
  "travelPlanId": 1,
  "title": "上海三日游"
}
```

### 2. 获取用户的所有旅行计划

**端点:** `GET /api/travel-plans/user/{userId}`

**响应:** 返回该用户的所有旅行计划列表

### 3. 获取特定旅行计划

**端点:** `GET /api/travel-plans/{id}`

**响应:** 返回指定ID的旅行计划详情

### 4. 测试端点

**端点:** `GET /api/travel-plans/test`

**响应:**
```json
{
  "status": "ok",
  "message": "Travel Plan Controller is working"
}
```

## 使用方法

### 方法1: 在 n8n 中配置 Webhook

1. 在 n8n 工作流的最后添加 HTTP Request 节点
2. 配置如下：
   - Method: POST
   - URL: `http://your-backend-url/api/travel-plans/webhook?userId=1`
   - Body Content Type: JSON
   - Body: 使用前一个节点的输出

### 方法2: 使用 Postman 或 curl 测试

```bash
curl -X POST http://localhost:8080/api/travel-plans/webhook?userId=1 \
  -H "Content-Type: application/json" \
  -d @travel_plan.json
```

### 方法3: 在前端调用

```javascript
fetch('http://your-backend-url/api/travel-plans/webhook?userId=1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(travelPlanData)
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## 数据流程

1. **n8n 工作流** 生成旅行计划 JSON
2. **发送到 Webhook** `/api/travel-plans/webhook`
3. **Controller** 接收并验证数据
4. **Service** 处理数据转换和保存
5. **Repository** 将数据持久化到数据库
6. **返回响应** 包含保存的旅行计划ID

## 事务管理

`TravelPlanService.saveTravelPlanFromN8n()` 方法使用 `@Transactional` 注解，确保：
- 所有数据要么全部保存成功
- 要么在出错时全部回滚
- 保证数据一致性

## 关系映射

- `TravelPlan` (1) → (N) `DailyItinerary`
- `TravelPlan` (1) → (N) `Accommodation`
- `DailyItinerary` (1) → (N) `ItineraryActivity`
- `Attraction` 表独立存储，通过名称关联

## 注意事项

1. **用户ID**: 默认使用 userId=1，实际使用时应从认证信息中获取
2. **日期格式**: 支持 "2025.01.02" 格式，会自动转换
3. **经纬度**: 从 "121.487899,31.227174" 格式解析
4. **景点去重**: 相同名称的景点会更新而不是重复插入
5. **级联删除**: 删除旅行计划会自动删除相关的行程和活动

## 错误处理

API 会返回详细的错误信息：
```json
{
  "success": false,
  "message": "Error saving travel plan: ...",
  "error": "ExceptionType"
}
```

## 下一步

1. 添加用户认证集成
2. 实现旅行计划的更新和删除功能
3. 添加数据验证和业务规则
4. 实现分页查询
5. 添加搜索和筛选功能

## 测试

启动应用后，访问测试端点验证：
```
GET http://localhost:8080/api/travel-plans/test
```

应该返回：
```json
{
  "status": "ok",
  "message": "Travel Plan Controller is working"
}
```

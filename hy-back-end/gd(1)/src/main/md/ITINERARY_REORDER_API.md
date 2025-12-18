# 行程活动拖拽排序 API 文档

## 📋 功能概述

支持前端拖拽行程活动进行排序，包括：
- ✅ **同一天内排序**：调整活动在当天的顺序
- ✅ **跨天移动**：将活动从一天拖到另一天

## 🏗️ 数据结构说明

- **TravelPlan**：旅行计划（整个旅行）
- **DailyItinerary**：每日行程（代表某一天，如"Day 1"）
- **ItineraryActivity**：具体活动（景点、餐厅等，可拖拽排序）

---

## 🔌 API 接口

### POST /api/travel-plans/{id}/reorder-itineraries

重新排序旅行计划的活动

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 旅行计划ID |

#### 请求体 (ReorderItineraryRequest)

```json
{
  "activities": [
    {
      "activityId": 101,
      "dailyItineraryId": 1,
      "sortOrder": 0
    },
    {
      "activityId": 102,
      "dailyItineraryId": 1,
      "sortOrder": 1
    },
    {
      "activityId": 103,
      "dailyItineraryId": 2,
      "sortOrder": 0
    }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| activities | Array | 是 | 活动列表（按新的顺序） |
| activities[].activityId | Long | 是 | 活动ID |
| activities[].dailyItineraryId | Long | 是 | 新的每日行程ID（移动到哪一天） |
| activities[].sortOrder | Integer | 是 | 新的排序索引（从0开始） |

#### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 10,
    "updatedCount": 3,
    "message": "行程活动排序已更新"
  }
}
```

#### 错误响应

**400 - 参数错误**
```json
{
  "code": 400,
  "message": "行程列表不能为空",
  "data": null
}
```

**400 - 行程不存在**
```json
{
  "code": 400,
  "message": "行程不存在: 101",
  "data": null
}
```

**400 - 行程不属于该计划**
```json
{
  "code": 400,
  "message": "行程不属于该旅行计划",
  "data": null
}
```

---

## 💡 使用场景

### 场景1：同一天内调整顺序

**原始顺序**：
- Day 1:
  - [0] 天安门广场
  - [1] 故宫
  - [2] 王府井

**拖拽操作**：将"故宫"拖到"天安门广场"前面

**请求数据**：
```json
{
  "itineraries": [
    {
      "itineraryId": 102,
      "dayNumber": 1,
      "orderIndex": 0
    },
    {
      "itineraryId": 101,
      "dayNumber": 1,
      "orderIndex": 1
    },
    {
      "itineraryId": 103,
      "dayNumber": 1,
      "orderIndex": 2
    }
  ]
}
```

**结果**：
- Day 1:
  - [0] 故宫
  - [1] 天安门广场
  - [2] 王府井

---

### 场景2：跨天移动

**原始顺序**：
- Day 1:
  - [0] 天安门广场
  - [1] 故宫
- Day 2:
  - [0] 颐和园

**拖拽操作**：将"故宫"从Day 1拖到Day 2

**请求数据**：
```json
{
  "itineraries": [
    {
      "itineraryId": 101,
      "dayNumber": 1,
      "orderIndex": 0
    },
    {
      "itineraryId": 103,
      "dayNumber": 2,
      "orderIndex": 0
    },
    {
      "itineraryId": 102,
      "dayNumber": 2,
      "orderIndex": 1
    }
  ]
}
```

**结果**：
- Day 1:
  - [0] 天安门广场
- Day 2:
  - [0] 颐和园
  - [1] 故宫

---

## 🎯 前端实现建议

### 使用 react-beautiful-dnd

```jsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const handleDragEnd = async (result) => {
  if (!result.destination) return;

  const { source, destination } = result;
  
  // 构建新的行程列表
  const newItineraries = [];
  
  // ... 根据拖拽结果重新计算每个行程的 dayNumber 和 orderIndex
  
  // 调用后端接口
  await fetch(`/api/travel-plans/${planId}/reorder-itineraries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itineraries: newItineraries })
  });
};
```

---

## ⚠️ 注意事项

1. **完整性**：必须传入所有需要更新的行程，不能只传部分
2. **索引连续**：同一天的 `orderIndex` 应该从0开始连续递增
3. **事务性**：所有更新在一个事务中完成，要么全部成功，要么全部失败
4. **权限验证**：确保行程属于指定的旅行计划

---

## 📊 数据库变更

更新的字段：
- `daily_itineraries.day_number` - 行程所属天数
- `daily_itineraries.order_index` - 行程在当天的排序索引

---

## 🔄 完整示例

### 请求

```bash
POST /api/travel-plans/10/reorder-itineraries
Content-Type: application/json

{
  "itineraries": [
    {
      "itineraryId": 101,
      "dayNumber": 1,
      "orderIndex": 0
    },
    {
      "itineraryId": 102,
      "dayNumber": 1,
      "orderIndex": 1
    },
    {
      "itineraryId": 103,
      "dayNumber": 2,
      "orderIndex": 0
    },
    {
      "itineraryId": 104,
      "dayNumber": 2,
      "orderIndex": 1
    }
  ]
}
```

### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 10,
    "updatedCount": 4,
    "message": "行程排序已更新"
  }
}
```

---

## 🎨 前端UI建议

1. **拖拽手柄**：添加明显的拖拽图标（如 ≡）
2. **拖拽反馈**：拖拽时显示半透明的占位符
3. **跨天提示**：跨天移动时显示确认提示
4. **加载状态**：保存时显示loading状态
5. **错误处理**：失败时恢复原始顺序并提示用户

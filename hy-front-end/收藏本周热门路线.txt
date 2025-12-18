# 热门旅行计划 API 文档

## 1. 保存或更新旅行计划

- **URL:** `/api/popular-travel-plans/save`
- **方法:** `POST`
- **描述:** 保存用户创建的旅行计划。如果 `planId` 存在，则更新现有计划；否则创建新计划。

### 请求体 (Request Body)

```json
{
  "planId": null,          // 可选，如果存在则为更新操作，否则为创建操作
  "trip_title": "北京3日深度文化游方案一", // 必填，旅行计划标题
  "total_days": 3,         // 必填，旅行总天数
  "days": [                // 必填，旅行的详细每日行程数据
    {
      "day": 1,
      "theme": "天安门广场与故宫皇家文化游",
      "routes_used": ["天安门广场-故宫文化游"],
      "spots": ["天安门广场", "故宫博物院"], // 已更新为字符串数组
      "highlights": "沉浸于天安门广场的庄严气氛，随后深入故宫博物院，领略明清皇家宫殿的宏伟与精美，最后登上景山公园俯瞰故宫全景，感受古都皇城的厚重历史。",
      "photo": "http://aos-cdn-image.amap.com/sns/ugccomment/fab72424-5643-4c14-9486-ae1c8475eab7.jpg" // 新增的photo字段
    },
    {
      "day": 2,
      "theme": "皇家园林与古都公园之旅",
      "routes_used": ["皇家园林经典游"],
      "spots": ["北海公园"],
      "highlights": "游览北海公园的水光山色，中山公园的静谧环境，以及太庙的庄严古朴，感受皇家园林的自然与文化融合。",
      "photo": "http://store.is.autonavi.com/showpic/68a92863a790f69d2221f7c53906c8c2"
    }
  ],
  "summary": "本方案以皇家文化和北京地标为主线，兼顾古典与现代，适合初次来北京的游客深度体验历史与城市风貌。建议春秋季节出行，搭配地铁出行方便快捷。", // 可选，旅行计划总结
  "is_favorited": false     // 可选，是否收藏，默认为 false
}
```

### 请求体字段说明

| 字段名         | 类型       | 必填 | 描述                                       | 示例值                                        |
| :------------- | :--------- | :--- | :----------------------------------------- | :-------------------------------------------- |
| `planId`       | `Long`     | 否   | 旅行计划ID（如果存在则为更新操作，否则为创建）       | `1`                                           |
| `trip_title`   | `String`   | 是   | 旅行计划标题                               | `"北京3日深度文化游方案一"`                       |
| `total_days`   | `Integer`  | 是   | 旅行总天数                                 | `3`                                           |
| `days`         | `List<DayInfo>` | 是   | 旅行的详细每日行程数据（请参阅 `DayInfo` 对象结构）   | `[...]`                                       |
| `summary`      | `String`   | 否   | 旅行计划总结                               | `"本方案适合初次来京游客。"`                       |
| `is_favorited` | `Boolean`  | 否   | 是否收藏，默认为 `false`                   | `true`                                        |

#### `DayInfo` 对象结构

| 字段名         | 类型        | 必填 | 描述                                       | 示例值                                        |
| :------------- | :---------- | :--- | :----------------------------------------- | :-------------------------------------------- |
| `day`          | `Integer`   | 是   | 第几天                                     | `1`                                           |
| `theme`        | `String`    | 是   | 当天主题                                   | `"天安门广场与故宫皇家文化游"`                       |
| `routes_used`  | `List<String>` | 是   | 采用的路线                                 | `["天安门广场-故宫文化游"]`                         |
| `spots`        | `List<String>` | 是   | 当天的景点名称列表                           | `["天安门广场", "故宫博物院"]`                      |
| `highlights`   | `String`    | 是   | 当天亮点描述                               | `"沉浸于天安门广场的庄严气氛..."`                |
| `photo`        | `String`    | 是   | 当天行程的代表性图片URL                      | `"http://aos-cdn-image.amap.com/...jpg"`           |

    **请求示例 (完整的):**

    ```json
    {
        "planId": null,
        "trip_title": "北京3日经典文化深度游",
        "total_days": 3,
        "days": [
            {
                "day": 1,
                "theme": "天安门广场与故宫皇家文化之旅",
                "routes_used": ["天安门广场-故宫文化游"],
                "spots": ["天安门广场", "天安门", "毛主席纪念堂", "中国国家博物馆", "故宫博物院", "故宫博物院-午门", "景山公园"],
                "highlights": "感受中国政治文化的心脏地带，参观象征国家权力的天安门广场及毛主席纪念堂，深入了解中华历史文明的故宫博物院，登临景山公园俯瞰紫禁城全景。",
                "photo": "http://store.is.autonavi.com/showpic/2f968490d105bb2741e17f90b85c6b79"
            },
            {
                "day": 2,
                "theme": "皇家园林与古都风情体验",
                "routes_used": ["皇家园林经典游"],
                "spots": ["北海公园", "中山公园", "太庙", "天坛公园"],
                "highlights": "游览北京古代皇家园林的典范北海公园和中山公园，感受古代皇家宗教祭祀场所太庙的庄严神圣，最后在天坛公园体验古代祭天文化与现代城市休闲的完美结合。",
                "photo": "http://store.is.autonavi.com/showpic/68a92863a790f69d2221f7c53906c8c2"
            },
            {
                "day": 3,
                "theme": "老北京胡同文化与现代商业结合之旅",
                "routes_used": ["北京胡同风情游", "北京地标深度游"],
                "spots": ["南锣鼓巷", "什刹海", "老舍故居", "前门大街", "王府井步行街", "国家大剧院"],
                "highlights": "体验北京老胡同的浓厚历史氛围与人文气息，参观著名作家老舍故居；随后游览前门大街和王府井步行街感受北京商业繁华与现代文化，最后欣赏国家大剧院的现代建筑艺术。",
                "photo": "http://store.is.autonavi.com/showpic/6aa94c24640267a56c22af0b9629030a"
            }
        ],
        "summary": "此行程合理串联北京核心文化地标、皇家园林及传统胡同文化，适合首次来北京的游客，交通便利，游览节奏适中。建议乘坐地铁出行，春秋季节天气宜人最佳旅游时间。"
    }
    ```

### 1.3. 请求 (Request)

*   **Header:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <Your_Auth_Token>` (如果需要认证)

*   **Body:** `application/json`

    | 字段名         | 类型     | 必填 | 描述                                       | 示例值                                        |
    | :------------- | :------- | :--- | :----------------------------------------- | :-------------------------------------------- |
    | `planId`       | `Long`   | 否   | 旅行计划ID（如果存在则为更新操作，否则为创建）       | `1`                                           |
    | `trip_title`   | `String` | 是   | 旅行计划标题                               | `"北京3日深度文化游方案一"`                       |
    | `total_days`   | `Integer`| 是   | 旅行总天数                                 | `3`                                           |
    | `days`         | `List<DayInfo>` | 是   | 旅行的详细每日行程数据（请参阅 `DayInfo` 对象结构）   | `[...]`                                       |
    | `summary`      | `String` | 否   | 旅行计划总结                               | `"本方案适合初次来京游客。"`                       |
    | `is_favorited` | `Boolean`| 否   | 是否收藏，默认为 `false`                   | `true`                                        |

    **请求示例:**

    ```json
    {
        "planId": null,
        "trip_title": "北京3日经典文化深度游",
        "total_days": 3,
        "days": [
            {
                "day": 1,
                "theme": "天安门广场与故宫皇家文化之旅",
                "routes_used": ["天安门广场-故宫文化游"],
                "spots": ["天安门广场", "天安门", "毛主席纪念堂", "中国国家博物馆", "故宫博物院", "故宫博物院-午门", "景山公园"],
                "highlights": "感受中国政治文化的心脏地带，参观象征国家权力的天安门广场及毛主席纪念堂，深入了解中华历史文明的故宫博物院，登临景山公园俯瞰紫禁城全景。",
                "photo": "http://store.is.autonavi.com/showpic/2f968490d105bb2741e17f90b85c6b79"
            },
            {
                "day": 2,
                "theme": "皇家园林与古都风情体验",
                "routes_used": ["皇家园林经典游"],
                "spots": ["北海公园", "中山公园", "太庙", "天坛公园"],
                "highlights": "游览北京古代皇家园林的典范北海公园和中山公园，感受古代皇家宗教祭祀场所太庙的庄严神圣，最后在天坛公园体验古代祭天文化与现代城市休闲的完美结合。",
                "photo": "http://store.is.autonavi.com/showpic/68a92863a790f69d2221f7c53906c8c2"
            },
            {
                "day": 3,
                "theme": "老北京胡同文化与现代商业结合之旅",
                "routes_used": ["北京胡同风情游", "北京地标深度游"],
                "spots": ["南锣鼓巷", "什刹海", "老舍故居", "前门大街", "王府井步行街", "国家大剧院"],
                "highlights": "体验北京老胡同的浓厚历史氛围与人文气息，参观著名作家老舍故居；随后游览前门大街和王府井步行街感受北京商业繁华与现代文化，最后欣赏国家大剧院的现代建筑艺术。",
                "photo": "http://store.is.autonavi.com/showpic/6aa94c24640267a56c22af0b9629030a"
            }
        ],
        "summary": "此行程合理串联北京核心文化地标、皇家园林及传统胡同文化，适合首次来北京的游客，交通便利，游览节奏适中。建议乘坐地铁出行，春秋季节天气宜人最佳旅游时间。"
    }
    ```

### 响应体 (Response Body)

**成功 (200 OK)**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "plan_id": 1,
    "user_id": 101,
    "trip_title": "北京3日深度文化游方案一",
    "total_days": 3,
    "days": [
      {
        "day": 1,
        "theme": "天安门广场与故宫皇家文化游",
        "routes_used": ["天安门广场-故宫文化游"],
        "spots": ["天安门广场"],
        "highlights": "沉浸于天安门广场的庄严气氛，随后深入故宫博物院，领略明清皇家宫殿的宏伟与精美，最后登上景山公园俯瞰故宫全景，感受古都皇城的厚重历史。",
        "photo": "http://aos-cdn-image.amap.com/sns/ugccomment/fab72424-5643-4c14-9486-ae1c8475eab7.jpg"
      }
    ],
    "summary": "本方案以皇家文化和北京地标为主线，兼顾古典与现代，适合初次来北京的游客深度体验历史与城市风貌。建议春秋季节出行，搭配地铁出行方便快捷.",
    "created_at": "2025-12-10T10:00:00",
    "is_favorited": false
  }
}
```

**失败 (400 Bad Request / 401 Unauthorized / 500 Internal Server Error)**

```json
{
  "code": 400,
  "message": "错误信息，例如：旅行计划标题不能为空"
}
```

## 2. 收藏/取消收藏旅行计划

- **URL:** `/api/popular-travel-plans/{planId}/toggle-favorite`
- **方法:** `POST`
- **描述:** 收藏或取消收藏指定的旅行计划。

### Path Parameters

| 名称    | 类型   | 描述       |
| ------- | ------ | ---------- |
| `planId` | `Long` | 旅行计划ID |

### 响应体 (Response Body)

**成功 (200 OK)**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "planId": 1,
    "userId": 101,
    "tripTitle": "我的欧洲十日游",
    "totalDays": 10,
    "tripData": "{ ... }",
    "summary": "一次难忘的欧洲文化探索之旅。",
    "isFavorited": true, // 根据操作结果，可能是 true 或 false
    "createdAt": "2025-12-10T10:00:00"
  }
}
```

**失败 (400 Bad Request / 401 Unauthorized / 500 Internal Server Error)**

```json
{
  "code": 400,
  "message": "错误信息，例如：旅行计划不存在或无权操作"
}
```

## 3. 获取旅行计划详情

- **URL:** `/api/popular-travel-plans/{planId}`
- **方法:** `GET`
- **描述:** 获取指定旅行计划的详细信息。

### Path Parameters

| 名称    | 类型   | 描述       |
| ------- | ------ | ---------- |
| `planId` | `Long` | 旅行计划ID |

### 响应体 (Response Body)

**成功 (200 OK)**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "planId": 1,
    "userId": 101,
    "tripTitle": "我的欧洲十日游",
    "totalDays": 10,
    "tripData": "{ "days": [{"dayNumber":1, "activities": [...]}] }",
    "summary": "一次难忘的欧洲文化探索之旅。",
    "isFavorited": false,
    "createdAt": "2025-12-10T10:00:00"
  }
}
```

**失败 (400 Bad Request / 401 Unauthorized / 500 Internal Server Error)**

```json
{
  "code": 400,
  "message": "错误信息，例如：旅行计划不存在"
}
```

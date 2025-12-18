# Coze 流式游记生成 API 文档

本文档描述了用于通过 Coze AI 平台流式生成旅行游记的后端 API 接口。此接口允许用户根据提供的旅行目的地或旅行计划，实时获取生成的游记内容。

**注意：** 此接口采用 Server-Sent Events (SSE) 方式进行流式传输，客户端应按流式事件处理。

---

## 1. 流式生成游记

### 1.1. 接口地址 (URL)

`POST /api/chat/travelogue/stream-generate`

### 1.2. 功能描述

根据用户提供的旅行目的地或详细旅行计划，通过 Coze AI 平台实时流式生成一篇生动的旅行游记。

### 1.3. 请求 (Request)

*   **Header:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <Your_Auth_Token>` (如果需要认证)

*   **Body:** `application/json`

    | 字段名         | 类型     | 必填 | 描述                                       | 示例值                                        |
    | :------------- | :------- | :--- | :----------------------------------------- | :-------------------------------------------- |
    | `userId`       | `String` | 是   | 用户ID，用于标识对话，建议唯一                   | `"user123"`                                   |
    | `destination`  | `String` | 否   | 旅行目的地（与 `travelPlan` 至少提供一项）       | `"北京"`                                      |
    | `travelPlan`   | `String` | 否   | 详细的旅行计划（与 `destination` 至少提供一项） | `"第一天：天安门，故宫；第二天：长城；第三天：颐和园"` |
    | `writingStyle` | `String` | 否   | 游记的文风，如“幽默风趣”、“详细纪实”等          | `"幽默风趣"`                                  |
    | `length`       | `String` | 否   | 游记的期望长度，如“短篇”、“长篇”等              | `"短篇"`                                      |

    **请求示例:**

    ```json
    {
        "userId": "3",
        "destination": "北京",
        "travelPlan": null,
        "writingStyle": "详细纪实",
        "length": "短篇"
    }
    ```

    ```json
    {
        "userId": "4",
        "destination": null,
        "travelPlan": "第一天：上午抵达上海，入住酒店。下午参观外滩，欣赏黄浦江两岸风光。晚上可在南京路步行街购物。
第二天：上午游览豫园和城隍庙，感受老上海风情。下午前往上海博物馆，了解城市历史文化。晚上可观看杂技表演或乘坐游船夜游黄浦江。
第三天：上午参观东方明珠电视塔，俯瞰上海全景。下午前往田子坊，体验上海小资情调。晚上可品尝特色上海菜。",
        "writingStyle": "幽默风趣",
        "length": "长篇"
    }
    ```

### 1.4. 响应 (Response)

此接口采用 Server-Sent Events (SSE) 格式进行流式传输。客户端将接收到一系列 `data` 事件，每个事件都包含部分生成的游记内容。当游记生成完毕时，将收到一个 `data: [DONE]` 事件，表示流的结束。

*   **Content-Type:** `text/event-stream`
*   **Encoding:** `UTF-8`

**响应事件示例:**

```
data: 这是游记的第一个片段...
data: 这是游记的第二个片段...
data: 这是游记的第三个片段...
...
data: 这是游记的最后一个片段。
data: [DONE]
```

**错误响应 (非流式错误):**

如果请求参数验证失败或Coze服务未启用，后端可能会在流开始前直接返回一个非流式的错误响应。

*   **Header:**
    *   `Content-Type: text/plain;charset=UTF-8`
    *   `Status: 400 Bad Request` 或 `500 Internal Server Error`

*   **Body:**

    ```
    用户ID不能为空
    ```
    或
    ```
    目的地或旅行计划详情至少填写一项
    ```
    或
    ```
    Coze游记服务暂时不可用或发生错误: <错误信息>
    ```

---

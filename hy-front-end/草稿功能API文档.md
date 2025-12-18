# 草稿功能 API 文档

## 📋 API 概述

草稿功能已完善，现在支持完整的草稿管理和发布流程。

---

## 🔧 新增/修改的接口

### 1. 保存草稿

**接口地址**: `POST /api/post/draft/save`

**功能**: 保存或更新草稿

**请求头**:
```
Authorization: Bearer <JWT Token>
Content-Type: application/json
```

**请求体**:
```json
{
  "draftId": 1,  // 可选，更新草稿时提供
  "draftTitle": "草稿标题",
  "draftContent": "草稿内容",
  "draftData": {  // 完整的帖子数据（重要！）
    "title": "草稿标题",
    "summary": "摘要",
    "content": "完整内容",
    "contentType": "richtext",
    "postType": "travel_note",
    "category": "domestic",
    "coverImage": "http://example.com/cover.jpg",
    "images": ["http://example.com/1.jpg"],
    "videos": [],
    "destinationName": "北京",
    "destinationCity": "北京",
    "destinationProvince": "北京",
    "destinationCountry": "China",
    "travelDays": 3,
    "travelBudget": 1500.00,
    "actualCost": 1350.00,
    "travelSeason": "spring",
    "travelStyle": "solo",
    "tags": "旅游,北京",
    "keywords": "故宫,长城",
    "isOriginal": true
  },
  "isAutoSave": false  // 是否自动保存
}
```

**响应示例**:
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

### 2. 获取草稿列表

**接口地址**: `GET /api/post/draft/my`

**功能**: 获取当前用户的所有草稿

**请求头**:
```
Authorization: Bearer <JWT Token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 2,
    "list": [
      {
        "id": 1,
        "title": "草稿标题",
        "content": "草稿内容",
        "updatedTime": "2025-10-29T16:00:00",
        "autoSaveTime": null,
        "draftData": {
          "title": "草稿标题",
          "content": "完整内容",
          "contentType": "richtext",
          // ... 完整的帖子数据
        }
      }
    ]
  }
}
```

---

### 3. 草稿转换并发布 🆕

**接口地址**: `POST /api/post/draft/{draftId}/convert-and-publish`

**功能**: 一步完成草稿转帖子并发布

**请求头**:
```
Authorization: Bearer <JWT Token>
```

**路径参数**:
- `draftId`: 草稿ID

**请求示例**:
```bash
POST /api/post/draft/1/convert-and-publish
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "title": "草稿标题",
    "summary": "摘要",
    "content": "内容",
    "contentType": "richtext",
    "postType": "travel_note",
    "status": "published",
    "publisherId": 1,
    "publisherNickname": "18831231517",
    "publishedTime": "2025-10-29T16:00:00",
    "createdTime": "2025-10-29T16:00:00",
    "updatedTime": "2025-10-29T16:00:00",
    "likeCount": 0,
    "commentCount": 0,
    "favoriteCount": 0,
    "viewCount": 0,
    "isLiked": false
  }
}
```

**说明**:
- ✅ 自动将草稿转换为帖子
- ✅ 直接发布（状态为 `published`）
- ✅ 发布成功后自动删除草稿
- ✅ 支持完整的 `draftData` 或仅基本字段（title + content）

---

### 4. 删除草稿 🆕

**接口地址**: `DELETE /api/post/draft/{draftId}`

**功能**: 删除指定草稿

**请求头**:
```
Authorization: Bearer <JWT Token>
```

**路径参数**:
- `draftId`: 草稿ID

**请求示例**:
```bash
DELETE /api/post/draft/1
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "草稿删除成功"
}
```

---

## 📊 完整的草稿发布流程

### 方案1: 草稿 → 发布（推荐）🌟

这是最简单的方式，一步完成发布。

```javascript
// 1. 保存草稿
const saveResponse = await saveDraft({
  draftTitle: "我的旅行",
  draftContent: "内容...",
  draftData: { /* 完整帖子数据 */ }
});

// 2. 发布草稿（一步完成）
const publishResponse = await fetch('/api/post/draft/' + draftId + '/convert-and-publish', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// 3. 发布成功！草稿已自动删除
```

### 方案2: 草稿 → 帖子 → 发布

如果需要分步操作，可以这样：

```javascript
// 1. 保存草稿
const saveResponse = await saveDraft({ ... });

// 2. 将草稿转为帖子（保存为草稿状态）
const createResponse = await createPost(draftData);

// 3. 发布帖子
const publishResponse = await publishPost(createResponse.data.id);

// 4. 手动删除草稿
await deleteDraft(draftId);
```

---

## 🔑 关键要点

### 1. draftData 字段的重要性

⚠️ **非常重要**：保存草稿时，务必将完整的帖子数据保存到 `draftData` 字段中！

```javascript
// ✅ 正确：保存完整数据
await saveDraft({
  draftTitle: "标题",
  draftContent: "内容",
  draftData: {
    title: "标题",
    content: "内容",
    images: [...],
    videos: [...],
    destinationCity: "北京",
    travelDays: 3,
    // ... 所有其他字段
  }
});

// ❌ 错误：只保存基本信息
await saveDraft({
  draftTitle: "标题",
  draftContent: "内容"
  // 缺少 draftData，发布时会丢失很多信息！
});
```

### 2. 草稿发布的容错性

后端已实现容错机制：

- ✅ 优先使用 `draftData` 字段
- ✅ 如果 `draftData` 为空，使用 `draftTitle` + `draftContent`
- ✅ 自动验证必填字段
- ✅ 详细的日志记录

### 3. 草稿ID vs 帖子ID

**重要区别**：

| 类型 | 来源 | 用途 |
|------|------|------|
| 草稿ID | `POST /api/post/draft/save` | 管理草稿、发布草稿 |
| 帖子ID | `POST /api/post/create` 或发布草稿后 | 管理已发布的帖子 |

---

## 🧪 测试流程

### 测试1: 保存并发布草稿

```bash
# 1. 保存草稿
curl -X POST http://localhost:8081/api/post/draft/save \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "draftTitle": "测试草稿",
    "draftContent": "测试内容",
    "draftData": {
      "title": "测试草稿",
      "content": "测试内容",
      "contentType": "richtext",
      "postType": "travel_note"
    }
  }'

# 2. 发布草稿
curl -X POST http://localhost:8081/api/post/draft/1/convert-and-publish \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. 验证发布结果
curl -X GET http://localhost:8081/api/post/my?status=published \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 测试2: 删除草稿

```bash
curl -X DELETE http://localhost:8081/api/post/draft/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ❌ 常见错误

### 错误1: 草稿不存在或无权限

```json
{
  "code": 400,
  "message": "草稿不存在或无权限",
  "data": null
}
```

**原因**: 
- 草稿ID错误
- 尝试操作其他用户的草稿

### 错误2: 草稿标题/内容不能为空

```json
{
  "code": 400,
  "message": "草稿标题不能为空",
  "data": null
}
```

**原因**: 
- `draftData` 为空或格式错误
- `draftTitle` 或 `draftContent` 为空

**解决方案**: 确保保存草稿时提供完整的 `draftData`

---

## 📝 前端集成示例

### React 示例

```javascript
// 保存草稿
const handleSaveDraft = async (formData) => {
  try {
    const response = await fetch('/api/post/draft/save', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        draftTitle: formData.title,
        draftContent: formData.content,
        draftData: formData, // 完整的表单数据
        isAutoSave: false
      })
    });
    
    const result = await response.json();
    if (result.code === 200) {
      alert('草稿保存成功');
      return result.data.draftId;
    }
  } catch (error) {
    alert('保存失败：' + error.message);
  }
};

// 发布草稿
const handlePublishDraft = async (draftId) => {
  try {
    const response = await fetch(`/api/post/draft/${draftId}/convert-and-publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    if (result.code === 200) {
      alert('发布成功！');
      // 刷新帖子列表
      loadPublishedPosts();
    }
  } catch (error) {
    alert('发布失败：' + error.message);
  }
};

// 删除草稿
const handleDeleteDraft = async (draftId) => {
  try {
    const response = await fetch(`/api/post/draft/${draftId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    if (result.code === 200) {
      alert('草稿已删除');
      // 刷新草稿列表
      loadDrafts();
    }
  } catch (error) {
    alert('删除失败：' + error.message);
  }
};
```

---

## ✅ 总结

### 新增功能
- ✅ 草稿转换并发布接口（一步完成）
- ✅ 草稿删除接口
- ✅ 完善的错误处理和日志

### 推荐使用方式
1. 保存草稿时，将完整的帖子数据存入 `draftData`
2. 发布时直接调用 `/api/post/draft/{draftId}/convert-and-publish`
3. 发布成功后草稿自动删除

### 优势
- 🚀 简化流程：一步完成发布
- 🔒 安全可靠：自动权限验证
- 📊 数据完整：支持完整帖子数据
- 🛡️ 容错性强：自动降级到基本字段

---

**更新时间**: 2025-10-29  
**版本**: v2.0  
**状态**: ✅ 已完成并测试


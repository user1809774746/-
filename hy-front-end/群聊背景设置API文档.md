# 群聊背景设置 API 文档

## 概述

用户可以直接使用图片URL设置群聊的聊天背景，无需上传文件到后端服务器。每个用户可以为同一个群聊设置不同的背景图片。

## 数据库补丁

在使用此功能前，请先执行数据库补丁：

```bash
mysql -u root -p gd_mcp < group_chat_background_url_patch.sql
```

## API 接口

### 1. 设置群聊背景

**接口地址：** `POST /api/group/{groupId}/settings/background`

**功能说明：**
- 直接使用图片URL设置群聊背景
- 支持任意外部图片链接（图床、CDN、网络图片等）
- 传入 `null` 可清除背景，恢复默认
- 每个用户的设置独立，不影响其他用户

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| groupId | Long | 是 | 群聊ID（路径参数） |
| userId | Long | 是 | 用户ID |
| backgroundUrl | String | 否 | 背景图片URL，传null清除背景 |

**请求示例：**

```json
POST /api/group/123/settings/background
Content-Type: application/json

{
  "userId": 1001,
  "backgroundUrl": "https://example.com/images/background.jpg"
}
```

**清除背景示例：**

```json
POST /api/group/123/settings/background
Content-Type: application/json

{
  "userId": 1001,
  "backgroundUrl": null
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "聊天背景设置成功",
  "data": null
}
```

### 2. 获取群聊设置

**接口地址：** `GET /api/group/{groupId}/settings?userId={userId}`

**功能说明：** 获取用户在该群聊的所有设置，包括背景图片URL

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "isPinned": false,
    "isDisturbFree": false,
    "chatBackground": "https://example.com/images/background.jpg",
    "clearHistoryTime": null
  }
}
```

## 使用场景

### 场景1：使用网络图片
```json
{
  "userId": 1001,
  "backgroundUrl": "https://picsum.photos/1920/1080"
}
```

### 场景2：使用图床图片
```json
{
  "userId": 1001,
  "backgroundUrl": "https://i.imgur.com/abc123.jpg"
}
```

### 场景3：使用CDN图片
```json
{
  "userId": 1001,
  "backgroundUrl": "https://cdn.example.com/images/backgrounds/nature.jpg"
}
```

### 场景4：使用Base64（不推荐，URL过长）
```json
{
  "userId": 1001,
  "backgroundUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

## 前端实现建议

### 1. 直接输入URL

```javascript
async function setGroupBackground(groupId, userId, imageUrl) {
  const response = await fetch(`/api/group/${groupId}/settings/background`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      backgroundUrl: imageUrl
    })
  });
  
  const result = await response.json();
  if (result.code === 200) {
    console.log('背景设置成功');
  }
}

// 使用示例
setGroupBackground(123, 1001, 'https://example.com/bg.jpg');
```

### 2. 从图片选择器获取URL

```javascript
// 用户从图片选择器选择图片后
function onImageSelected(imageUrl) {
  setGroupBackground(currentGroupId, currentUserId, imageUrl);
}
```

### 3. 清除背景

```javascript
async function clearGroupBackground(groupId, userId) {
  const response = await fetch(`/api/group/${groupId}/settings/background`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      backgroundUrl: null  // 传null清除背景
    })
  });
  
  const result = await response.json();
  if (result.code === 200) {
    console.log('背景已清除');
  }
}
```

### 4. 应用背景到聊天界面

```javascript
async function loadAndApplyBackground(groupId, userId) {
  // 获取群聊设置
  const response = await fetch(`/api/group/${groupId}/settings?userId=${userId}`);
  const result = await response.json();
  
  if (result.code === 200 && result.data.chatBackground) {
    // 应用背景图片
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.style.backgroundImage = `url('${result.data.chatBackground}')`;
    chatContainer.style.backgroundSize = 'cover';
    chatContainer.style.backgroundPosition = 'center';
  }
}
```

## 图片来源建议

### 推荐的图片来源：

1. **公共图床**
   - Imgur: https://imgur.com
   - 路过图床: https://imgse.com
   - SM.MS: https://sm.ms

2. **CDN服务**
   - 阿里云OSS
   - 腾讯云COS
   - 七牛云

3. **网络图片**
   - Unsplash: https://unsplash.com
   - Pexels: https://pexels.com
   - Pixabay: https://pixabay.com

4. **用户自己的图片存储服务**
   - 用户个人网站
   - 云存储服务
   - 任意可访问的图片URL

## 注意事项

1. **URL有效性**
   - 确保图片URL可以公开访问
   - 避免使用需要登录才能访问的图片
   - 建议使用HTTPS协议的图片链接

2. **性能优化**
   - 建议图片大小不超过2MB
   - 推荐使用压缩后的图片
   - 考虑使用CDN加速访问

3. **跨域问题**
   - 确保图片服务器允许跨域访问
   - 如果遇到跨域问题，建议使用代理

4. **隐私安全**
   - 不要使用包含敏感信息的图片
   - 注意图片URL可能会被其他用户看到
   - 建议使用公共的、合法的图片资源

## 错误处理

### 常见错误码：

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 参数错误 | 检查请求参数是否正确 |
| 404 | 群聊不存在 | 确认群聊ID是否正确 |
| 403 | 权限不足 | 确认用户是否为群成员 |
| 500 | 服务器错误 | 联系管理员 |

### 错误响应示例：

```json
{
  "code": 403,
  "message": "您不是该群成员",
  "data": null
}
```

## 测试建议

### 使用Postman测试：

1. 创建一个POST请求
2. URL: `http://localhost:8082/api/group/{groupId}/settings/background`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "userId": 1,
  "backgroundUrl": "https://picsum.photos/1920/1080"
}
```

### 使用curl测试：

```bash
curl -X POST "http://localhost:8082/api/group/1/settings/background" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "backgroundUrl": "https://picsum.photos/1920/1080"
  }'
```

## 总结

此方案的优势：

✅ **无需文件上传** - 直接使用URL，节省服务器存储空间  
✅ **性能更好** - 不会占用后端服务器资源  
✅ **更灵活** - 用户可以使用任意图片源  
✅ **易于维护** - 后端只存储URL字符串，数据库压力小  
✅ **用户体验好** - 每个用户可以设置个性化背景  

使用此方案，后端服务器不会因为存储大量图片文件而变慢，所有图片由第三方服务（图床、CDN等）提供，后端只负责存储和管理URL链接。

# DSreachPage (发现之旅搜索) 配置指南

## 🚨 重要提示

必须完成以下配置才能使用搜索功能，否则会出现 **400 Bad Request** 或 **CORS** 错误！

---

## 📋 配置步骤

### 第 1 步：获取 Dify 工作流ID

1. 登录 [Dify 平台](https://dify.ai/)
2. 进入你的工作流页面
3. 在浏览器地址栏复制工作流ID

**示例 URL：**
```
https://cloud.dify.ai/apps/{这里是你的工作流ID}/workflow
```

**工作流ID 示例：**
- `f5052e35-7b7c-4e1e-87e0-47013570d17d`
- `3d53d609-922a-42bc-92ff-3807de965a31`

### 第 2 步：获取 API 密钥

1. 在 Dify 工作流页面
2. 点击右上角 **"API"** 按钮
3. 复制 **API Key**（格式：`app-xxxxxxxxxx`）

### 第 3 步：配置 DSreachPage.jsx

打开文件：`src/components/DSreachPage.jsx`

找到这段代码（第 12-17 行）：

```javascript
const DIFY_CONFIG={
    // ⚠️ 请替换为你的实际工作流ID和API密钥
    workflowId: 'YOUR_WORKFLOW_ID',  // 🔴 必须填写！从 Dify 工作流页面获取
    apiKey:'app-91SvGUIqxZkhIyb7Ekglfrwu',  // 🔴 必须替换为你的 API 密钥
    baseUrl: 'https://api.dify.ai/v1/workflows'
};
```

**替换为你的实际配置：**

```javascript
const DIFY_CONFIG={
    workflowId: 'f5052e35-7b7c-4e1e-87e0-47013570d17d',  // ✅ 你的工作流ID
    apiKey:'app-KlMGfAYa04rXtZ8s5QFJVDbV',  // ✅ 你的 API 密钥
    baseUrl: 'https://api.dify.ai/v1/workflows'
};
```

---

## 🔧 Dify 工作流配置

### 输入变量配置

在 Dify 工作流中需要配置以下输入变量：

| 变量名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `keyword` | String | 是 | 搜索关键词（如"咖啡厅"、"景点"） |
| `location` | String | 否 | 用户位置（格式：`经度,纬度`） |

### 输出格式要求

工作流应该返回一个数组，每个元素包含：

```json
[
  {
    "id": "1",
    "name": "星巴克（国贸店）",
    "address": "北京市朝阳区建国门外大街1号",
    "photo": "https://example.com/photo.jpg"
  },
  {
    "id": "2", 
    "name": "瑞幸咖啡",
    "address": "北京市朝阳区东三环中路39号",
    "photo": "https://example.com/photo2.jpg"
  }
]
```

**字段说明：**
- `id` - 唯一标识符
- `name` - 地点名称
- `address` - 详细地址
- `photo` - 图片URL（可选）

---

## 🧪 测试配置

配置完成后，测试搜索功能：

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 访问页面

打开浏览器访问：`http://localhost:3000`

### 3. 测试搜索

1. 进入"发现"页面
2. 在搜索框输入关键词（如"咖啡厅"）
3. 按 Enter 或点击搜索

### 4. 检查控制台

按 `F12` 打开开发者工具，查看控制台输出：

**正常情况：**
```
开始搜索 咖啡厅
用户位置 null
请求URL: https://api.dify.ai/v1/workflows/YOUR_WORKFLOW_ID/run
请求体 {inputs: {keyword: "咖啡厅", location: ""}, ...}
响应状态 200
diffy数据完整 {...}
解析后的结果 [...]
```

**错误情况：**
```
❌ 错误：请先配置 Dify 工作流ID！
```
→ 说明你没有替换 `YOUR_WORKFLOW_ID`

---

## ❌ 常见错误及解决方案

### 错误 1: 400 Bad Request

**原因：**
- ❌ URL 缺少工作流ID
- ❌ 输入字段名称不匹配
- ❌ API 密钥错误

**解决方案：**
1. 检查 `workflowId` 是否正确填写
2. 检查 Dify 工作流的输入变量名是否为 `keyword` 和 `location`
3. 检查 `apiKey` 是否正确

### 错误 2: CORS 错误

**原因：**
- ❌ URL 不完整（如：`https://api.dify.ai/v1/workflows`）
- ❌ 工作流未发布

**解决方案：**
1. 确保 URL 格式正确：`https://api.dify.ai/v1/workflows/{工作流ID}/run`
2. 在 Dify 中发布工作流

### 错误 3: 未配置工作流ID

**错误信息：**
```
请先在代码中配置 Dify 工作流ID
```

**解决方案：**
替换 `workflowId: 'YOUR_WORKFLOW_ID'` 为你的实际工作流ID

### 错误 4: 搜索结果解析失败

**原因：**
- ❌ Dify 返回的数据格式不正确

**解决方案：**
检查 Dify 工作流的输出格式，应该返回数组格式

---

## 📝 完整的 URL 格式说明

### ❌ 错误的 URL
```
https://api.dify.ai/v1/workflows
```
→ 缺少工作流ID和端点

### ✅ 正确的 URL
```
https://api.dify.ai/v1/workflows/{工作流ID}/run
```

**示例：**
```
https://api.dify.ai/v1/workflows/f5052e35-7b7c-4e1e-87e0-47013570d17d/run
```

---

## 🎯 快速检查清单

配置前请确认：

- [ ] 已从 Dify 获取工作流ID
- [ ] 已从 Dify 获取 API 密钥
- [ ] 已在 `DSreachPage.jsx` 中替换 `workflowId`
- [ ] 已在 `DSreachPage.jsx` 中替换 `apiKey`
- [ ] Dify 工作流已配置输入变量 `keyword` 和 `location`
- [ ] Dify 工作流已发布
- [ ] 已测试搜索功能

---

## 💡 调试技巧

### 查看完整请求信息

在控制台查看：
```javascript
请求URL: https://api.dify.ai/v1/workflows/xxx/run
请求体 {inputs: {keyword: "...", location: "..."}, ...}
```

### 查看 API 错误详情

如果请求失败，控制台会显示：
```javascript
API错误详情: {code: "...", message: "..."}
```

### 查看返回的数据结构

```javascript
diffy数据完整 {...}
解析后的结果 [...]
```

---

## 📚 相关文档

- **AI接口说明.md** - 其他AI接口配置
- **Dify工作流配置指南.md** - Dify 详细配置步骤
- **src/components/DSreachPage.jsx** - 搜索页面源代码

---

## ✅ 配置完成后

成功配置后，你应该能：

1. ✅ 在搜索框输入关键词
2. ✅ 看到加载动画
3. ✅ 看到搜索结果列表（带图片、名称、地址）
4. ✅ 控制台无错误信息

---

**最后更新：** 2025-10-28
**适用版本：** DSreachPage v1.0


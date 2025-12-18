# 高德地图API配置指南

## ⚠️ 重要提示

您当前遇到的错误 `INVALID_USER_KEY` 表示高德地图API密钥无效。请按照以下步骤获取并配置正确的API Key。

## 📋 获取高德地图API Key步骤

### 1. 注册/登录高德开放平台

访问：https://lbs.amap.com/

- 如果没有账号，点击右上角"注册"
- 如果有账号，直接登录

### 2. 进入控制台

登录后，点击右上角头像 → **控制台**

### 3. 创建应用

1. 点击左侧菜单 **应用管理** → **我的应用**
2. 点击 **创建新应用** 按钮
3. 填写应用信息：
   - 应用名称：例如"我的旅游应用"
   - 应用类型：选择 **Web端（JS API）**
4. 点击 **提交**

### 4. 添加Key

1. 在刚创建的应用下，点击 **添加Key**
2. 填写Key信息：
   - Key名称：例如"Web应用Key"
   - 服务平台：选择 **Web端（JS API）**
   - 白名单：开发阶段可以填写 `*` 或留空
3. 点击 **提交**

### 5. 获取API Key

创建成功后，您会看到：
- **Key值**：一串32位的字符串（例如：abc123def456...）
- **安全密钥**（如果启用了）

**重要**：请复制您的Key值

## 🔧 配置API Key

### 方法一：修改配置文件（推荐）

打开文件：`src/config/amapConfig.js`

```javascript
const amapConfig = {
  // 将这里的值替换为您的API Key
  apiKey: '您的API_Key',  // ⬅️ 粘贴您复制的Key
  securityKey: '您的安全密钥', // 如果启用了安全密钥
  
  // 其他配置保持不变...
};
```

### 方法二：使用环境变量（更安全）

1. 在项目根目录创建 `.env` 文件：

```env
VITE_AMAP_API_KEY=您的API_Key
VITE_AMAP_SECURITY_KEY=您的安全密钥
```

2. 修改 `src/config/amapConfig.js`：

```javascript
const amapConfig = {
  apiKey: import.meta.env.VITE_AMAP_API_KEY || 'd6e8e47c2dec58d22cf2297a0a83df0a',
  securityKey: import.meta.env.VITE_AMAP_SECURITY_KEY || '',
  // ...
};
```

3. 添加 `.env` 到 `.gitignore`（避免泄露Key）

## ✅ 验证配置

1. 保存配置文件
2. 重启开发服务器：
   ```bash
   # 停止当前服务器 (Ctrl+C)
   # 重新启动
   npm run dev
   ```
3. 打开浏览器，访问应用
4. 打开开发者工具（F12），查看控制台
5. 如果看到 `✅ 高德地图API加载成功`，说明配置正确

## 🚨 常见问题

### 1. 还是提示 INVALID_USER_KEY

**原因**：
- API Key复制错误（有空格或遗漏字符）
- 使用了错误的Key类型（不是Web端JS API的Key）
- Key未启用或被删除

**解决方法**：
- 重新复制Key，确保完整无误
- 检查Key类型是否为"Web端（JS API）"
- 在高德控制台检查Key状态是否正常

### 2. 配额超限

**错误提示**：`DAILY_QUERY_OVER_LIMIT`

**原因**：免费额度用完（每天有调用次数限制）

**解决方法**：
- 等待第二天重置
- 升级为付费账号
- 优化代码减少不必要的API调用

### 3. 白名单限制

**错误提示**：`INVALID_USER_SCODE` 或 域名不在白名单

**解决方法**：
- 在控制台设置Key的白名单
- 开发阶段可以设置为 `*` 允许所有域名
- 生产环境请设置具体域名（如：yourdomain.com）

### 4. HTTPS要求

**提示**：某些功能需要HTTPS

**解决方法**：
- 本地开发使用 `localhost` 可以
- 生产环境部署到HTTPS域名

## 📝 配置文件位置

- **主配置文件**：`src/config/amapConfig.js`
- **使用的组件**：
  - `src/components/goHomePage.jsx` - 首页地图
  - `src/components/MapPage.jsx` - 路线页面

## 🔗 相关链接

- [高德开放平台](https://lbs.amap.com/)
- [高德JS API文档](https://lbs.amap.com/api/javascript-api/summary)
- [Key申请和配置](https://lbs.amap.com/api/javascript-api/guide/abc/prepare)
- [常见错误码](https://lbs.amap.com/api/javascript-api/guide/abc/error-code)

## 💡 提示

1. **不要在公开代码库中暴露API Key**
   - 使用环境变量
   - 添加 `.env` 到 `.gitignore`

2. **设置合理的白名单**
   - 开发：`localhost:3000` 或 `*`
   - 生产：您的实际域名

3. **监控使用量**
   - 定期查看控制台的调用统计
   - 避免超出配额

4. **保护您的Key**
   - 不要分享给他人
   - 定期更换Key（如果泄露）

## 🎯 快速测试

配置完成后，运行以下检查：

1. 打开浏览器控制台
2. 查看是否有以下日志：
   - `✅ 高德地图API加载成功`
   - `✅ 地图加载完成`
   - `定位成功`

如果看到这些信息，说明配置成功！

---

**需要帮助？**
- 查看高德开放平台官方文档
- 检查控制台错误信息
- 确认Key配置正确


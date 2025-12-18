# 项目重构说明

## 概述
本次重构将原有的纯HTML/JS应用改造为React应用，实现了统一的技术栈和更好的代码组织。

## 主要改动

### 1. 文件结构调整

#### 移动的文件
- `src/login.css` → `legacy/login.css` 
- `src/register.css` → `legacy/register.css`
- `login.html` → `legacy/login.html`
- `login.js` → `legacy/login.js`
- `register.html` → `legacy/register.html`
- `register.js` → `legacy/register.js`
- `app.js` → `legacy/app.js`

#### 新增的React组件
- `src/components/LoginPage.jsx` - 登录页面组件
- `src/components/RegisterPage.jsx` - 注册页面组件
- `src/components/AMapPage.jsx` - 高德地图页面组件
- `src/components/HomePage.jsx` - 首页组件（已更新）
- `src/components/MapPage.jsx` - Leaflet地图组件（已存在）

### 2. 功能改造

#### LoginPage.jsx
- ✅ 支持密码登录和验证码登录两种模式切换
- ✅ 手机号验证（11位，1开头）
- ✅ 验证码倒计时功能（60秒）
- ✅ 密码显示/隐藏切换
- ✅ 表单验证
- ✅ 登录成功后跳转到首页
- ✅ 导航到注册页

#### RegisterPage.jsx
- ✅ 手机号验证
- ✅ 验证码发送和倒计时
- ✅ 验证码自动验证（演示验证码：123456）
- ✅ 验证码正确后才能输入密码
- ✅ 两次密码输入验证
- ✅ 密码显示/隐藏切换（支持两个密码框）
- ✅ 注册成功后自动登录并跳转首页
- ✅ 导航到登录页

#### AMapPage.jsx
- ✅ 高德地图集成
- ✅ 地点搜索功能
- ✅ 搜索建议（自动完成）
- ✅ POI列表展示
- ✅ 分类快速搜索（景点、餐厅、酒店等）
- ✅ 定位当前位置
- ✅ 搜索附近景点
- ✅ 探索附近餐饮
- ✅ 地图标记点击
- ✅ Toast提示消息
- ✅ 底部导航栏（探索、收藏、我的）

#### HomePage.jsx 更新
- ✅ 显示用户手机号（脱敏显示）
- ✅ 添加退出登录按钮
- ✅ 添加跳转到高德地图的入口
- ✅ 保留原有的路线规划功能

#### App.jsx 更新
- ✅ 添加路由管理（登录、注册、首页、地图页）
- ✅ 身份认证检查
- ✅ 登录状态管理
- ✅ 页面跳转逻辑
- ✅ 支持两种地图（Leaflet和高德地图）

### 3. 样式处理

登录和注册页面的CSS文件已移至`legacy`文件夹，React组件通过相对路径引用：
- `LoginPage.jsx` 引用 `../../login.css`
- `RegisterPage.jsx` 引用 `../../register.css`

> **注意**: CSS文件保留在`legacy`文件夹是为了保持兼容性。未来可以考虑将这些样式迁移到CSS模块或Tailwind CSS。

### 4. 高德地图配置

在 `index.html` 中已添加高德地图SDK引用：

```html
<script type="text/javascript">
  window._AMapSecurityConfig = {
    securityJsCode: 'your_security_code_here',
  }
</script>
<script src="https://webapi.amap.com/maps?v=2.0&key=your_amap_key_here"></script>
```

**⚠️ 使用前需要配置**：
1. 在[高德开放平台](https://lbs.amap.com/)注册并创建应用
2. 获取 Web端(JS API) 的 Key 和安全密钥
3. 将上述代码中的 `your_amap_key_here` 和 `your_security_code_here` 替换为实际的值

## 目录结构

```
GDMCP/
├── src/
│   ├── components/
│   │   ├── HomePage.jsx        # 首页（路线规划）
│   │   ├── MapPage.jsx         # Leaflet地图页
│   │   ├── AMapPage.jsx        # 高德地图页
│   │   ├── LoginPage.jsx       # 登录页
│   │   └── RegisterPage.jsx    # 注册页
│   ├── App.jsx                 # 主应用（路由管理）
│   ├── main.jsx                # 入口文件
│   └── index.css               # 全局样式
├── legacy/                     # 旧版文件备份
│   ├── login.html
│   ├── login.js
│   ├── login.css
│   ├── register.html
│   ├── register.js
│   ├── register.css
│   └── app.js
├── imge/                       # 图片资源
│   ├── 小眼睛关闭-copy.png
│   └── 小眼睛打开-copy.png
├── index.html                  # HTML入口
├── package.json
└── vite.config.js
```

## 页面流程

```
登录页 (LoginPage)
    ↓ 登录成功
首页 (HomePage)
    ├─→ 路线规划 → Leaflet地图页 (MapPage)
    ├─→ 高德地图 → 高德地图页 (AMapPage)
    └─→ 退出 → 登录页

注册页 (RegisterPage)
    ↓ 注册成功
首页 (HomePage)
```

## 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式方案**: Tailwind CSS + 自定义CSS
- **地图服务**: 
  - Leaflet (用于路线规划展示)
  - 高德地图 (用于地点搜索和POI查询)
- **状态管理**: React Hooks (useState, useEffect)
- **本地存储**: localStorage

## 后续优化建议

1. **样式迁移**: 将 `login.css` 和 `register.css` 迁移到CSS模块或完全使用Tailwind CSS
2. **路由库**: 考虑使用 React Router 替代当前的简单状态管理
3. **状态管理**: 对于更复杂的应用，可以引入 Redux 或 Zustand
4. **API集成**: 将模拟的登录/注册接口替换为真实的后端API
5. **表单库**: 可以使用 React Hook Form 简化表单处理
6. **代码分割**: 使用 React.lazy 和 Suspense 实现路由级别的代码分割
7. **类型安全**: 考虑迁移到 TypeScript

## 注意事项

- 所有旧版HTML/JS文件已移至 `legacy` 文件夹，不会影响React应用运行
- 图片资源路径使用相对路径，确保在构建时正确处理
- 高德地图需要配置有效的API Key才能正常使用
- 当前使用localStorage存储登录状态，生产环境需要更安全的方案

---

**重构完成时间**: 2025年10月14日  
**重构内容**: 将纯HTML/JS应用完全迁移到React技术栈



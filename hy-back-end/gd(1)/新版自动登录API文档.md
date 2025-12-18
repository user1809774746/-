# 新版七天免密登录API文档

## 📌 API变更说明

本文档描述新版七天免密登录的API接口变更。

---

## 1. 登录接口（无变更）

### 1.1 密码登录

**接口：** `POST /api/auth/login`

**请求参数：**
```json
{
  "phone": "13800138000",
  "password": "123456",
  "userType": "user"
}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMzgwMDEzODAwMCIsInVzZXJUeXBlIjoidXNlciIsImlhdCI6MTYzNTc0MDAwMCwiZXhwIjoxNjM2MzQ0ODAwfQ.xxx",
    "userType": "user",
    "phone": "13800138000"
  }
}
```

**变更：** 无

---

### 1.2 验证码登录

**接口：** `POST /api/auth/login-by-code`

**请求参数：**
```json
{
  "phone": "13800138000",
  "code": "123456",
  "userType": "user"
}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userType": "user",
    "phone": "13800138000"
  }
}
```

**变更：** 无

---

## 2. 七天免密登录接口（⚠️ 有变更）

### 接口信息

**接口地址：** `POST /api/auth/auto-login`

**功能描述：** 使用已有的token进行七天免密登录

**请求头：**
```
Content-Type: application/json
```

### 请求参数（⚠️ 新增token字段）

```json
{
  "phone": "13800138000",
  "userType": "user",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | String | 是 | 用户手机号 |
| userType | String | 是 | 用户类型：user（普通用户）、admin（管理员） |
| token | String | 是 | ⚠️ **新增**：用户上次登录时获得的token |

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userType": "user",
    "phone": "13800138000",
    "loginType": "auto_login"
  }
}
```

**说明：** 返回的token与请求中的token相同，无需更新本地存储

### 失败响应

#### 1. Token无效（被顶号）

```json
{
  "code": 401,
  "message": "error",
  "data": "Token无效或已过期，请重新登录"
}
```

**原因：**
- 该账号在其他设备登录，旧token被覆盖（顶号）
- 用户主动登出，token被清除

**前端处理：**
```javascript
if (data.code === 401) {
    alert('您的账号已在其他设备登录，请重新登录');
    localStorage.clear();
    window.location.href = '/login';
}
```

#### 2. Token过期

```json
{
  "code": 401,
  "message": "error",
  "data": "Token无效或已过期，请重新登录"
}
```

**原因：** 距离上次登录超过7天

**前端处理：**
```javascript
if (data.code === 401) {
    alert('登录已过期，请重新登录');
    localStorage.clear();
    window.location.href = '/login';
}
```

#### 3. 参数错误

```json
{
  "code": 400,
  "message": "error",
  "data": "Token不能为空"
}
```

**可能的错误码：**
- `400`: 参数错误（手机号为空、格式错误、token为空等）
- `401`: Token无效或已过期
- `500`: 服务器内部错误

---

## 3. 检查自动登录状态接口（无变更）

**接口地址：** `POST /api/auth/check-auto-login`

**功能描述：** 检查用户是否可以使用七天免密登录

**请求参数：**
```json
{
  "phone": "13800138000",
  "userType": "user"
}
```

**成功响应（可以免密登录）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "canAutoLogin": true,
    "phone": "13800138000",
    "userType": "user"
  }
}
```

**失败响应（不可以免密登录）：**
```json
{
  "code": 403,
  "message": "七天免密登录已过期或用户不存在",
  "data": {
    "canAutoLogin": false,
    "phone": "13800138000",
    "userType": "user",
    "message": "七天免密登录已过期或用户不存在"
  }
}
```

**变更：** 无

---

## 4. 登出接口（无变更）

**接口地址：** `POST /api/auth/logout`

**功能描述：** 清除token，使其立即失效

**请求头：**
```
Authorization: Bearer {token}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": "注销成功"
}
```

**变更：** 无，但内部逻辑已更新为清除数据库中的activeToken

---

## 📊 新旧版本对比

| 项目 | 旧版本 | 新版本 |
|------|--------|--------|
| 自动登录请求参数 | `phone`, `userType` | `phone`, `userType`, `token` ⚠️ |
| 验证方式 | 基于lastLoginDate时间差 | 基于token验证 |
| 顶号检测 | tokenId比对 | activeToken直接覆盖 |
| 过期判断 | 计算时间差 | 检查token_expires_at |
| Token存储 | Redis | MySQL数据库 |

---

## 🔄 前端迁移指南

### 变更点1：自动登录接口调用

**旧版代码：**
```javascript
fetch('/api/auth/auto-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        phone: phone,
        userType: userType
        // ❌ 旧版不需要token
    })
});
```

**新版代码：**
```javascript
const token = localStorage.getItem('token'); // ⚠️ 从本地获取token

fetch('/api/auth/auto-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        phone: phone,
        userType: userType,
        token: token  // ✅ 新版必须携带token
    })
});
```

### 变更点2：登录成功后存储token

**必须添加：**
```javascript
// 登录成功后
localStorage.setItem('token', data.data.token);
localStorage.setItem('phone', data.data.phone);
localStorage.setItem('userType', data.data.userType);
```

### 变更点3：统一处理401错误

**建议添加全局拦截器：**
```javascript
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(url, options);
    
    // 401表示被顶号或token过期
    if (response.status === 401) {
        alert('您的账号已在其他设备登录，请重新登录');
        localStorage.clear();
        window.location.href = '/login';
        return null;
    }
    
    return response.json();
}
```

---

## 🧪 测试用例

### 用例1：正常自动登录

**步骤：**
1. 用户密码登录，获得token
2. 前端存储token到localStorage
3. 关闭浏览器
4. 7天内重新打开，调用自动登录接口，携带token

**预期结果：**
- 返回200成功
- 用户直接进入系统

### 用例2：被顶号

**步骤：**
1. 用户A在设备1登录，获得tokenA
2. 用户B在设备2用同一账号登录，获得tokenB
3. 用户A在设备1调用任何需要认证的接口，携带tokenA

**预期结果：**
- 返回401错误
- 提示"您的账号已在其他设备登录"

### 用例3：Token过期

**步骤：**
1. 用户登录，获得token
2. 等待超过7天
3. 调用自动登录接口，携带过期token

**预期结果：**
- 返回401错误
- 提示"Token已过期，请重新登录"

### 用例4：Token缺失

**步骤：**
1. 调用自动登录接口，不携带token字段

**预期结果：**
- 返回400错误
- 提示"Token不能为空"

---

## 💡 最佳实践

### 1. Token存储
```javascript
// ✅ 推荐：使用localStorage
localStorage.setItem('token', token);

// ❌ 不推荐：使用sessionStorage（浏览器关闭后丢失）
sessionStorage.setItem('token', token);

// ❌ 不推荐：使用Cookie（跨域问题）
document.cookie = `token=${token}`;
```

### 2. 自动登录流程
```javascript
// 页面加载时
window.addEventListener('load', async () => {
    const token = localStorage.getItem('token');
    const phone = localStorage.getItem('phone');
    const userType = localStorage.getItem('userType');
    
    if (token && phone && userType) {
        // 有token，尝试自动登录
        const success = await autoLogin(phone, userType, token);
        if (success) {
            goToDashboard();
        } else {
            showLoginForm();
        }
    } else {
        // 没有token，显示登录表单
        showLoginForm();
    }
});
```

### 3. 错误处理
```javascript
try {
    const data = await autoLogin(phone, userType, token);
    if (data.code === 200) {
        // 成功
        console.log('自动登录成功');
    } else if (data.code === 401) {
        // 被顶号或过期
        alert('登录已失效，请重新登录');
        localStorage.clear();
        showLoginForm();
    }
} catch (error) {
    // 网络错误
    console.error('自动登录失败：', error);
    showLoginForm();
}
```

---

## ⚠️ 注意事项

1. **Token必须携带**：新版自动登录接口必须在请求体中包含token字段
2. **401统一处理**：建议在全局拦截器中统一处理401错误
3. **本地存储**：使用localStorage确保浏览器关闭后仍能保持登录
4. **HTTPS**：生产环境必须使用HTTPS，防止token被窃取
5. **错误提示**：给用户友好的提示，区分"被顶号"和"token过期"

---

## 📞 常见问题

**Q: 为什么要传token？**  
A: 新版基于token验证，需要验证token是否有效、是否被顶号、是否过期。

**Q: Token会变化吗？**  
A: 自动登录时token不会变化，只有重新密码/验证码登录时才会生成新token。

**Q: 如何判断被顶号？**  
A: 后端会比对请求的token与数据库中的activeToken，不一致则说明被新登录覆盖（顶号）。

**Q: 七天如何计算？**  
A: 基于数据库的`token_expires_at`字段，登录时设置为当前时间+7天。

---

## 🎉 总结

新版七天免密登录的主要变更：
- ✅ 自动登录接口新增`token`参数（必填）
- ✅ 前端需要存储token到localStorage
- ✅ 需要统一处理401错误（被顶号）
- ✅ 基于token验证，更安全可靠

**前端只需做少量修改即可使用新版功能！**


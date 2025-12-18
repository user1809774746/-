# 📱 验证码登录功能使用指南

## 🎯 功能说明

新增了通过手机号和验证码登录的功能，用户无需输入密码，只需要：
1. 发送验证码到手机
2. 使用手机号 + 验证码即可登录

## 🚀 完整登录流程

### 方式1️⃣：验证码登录（新功能）

#### 步骤1：发送验证码
```http
POST /api/auth/send-verification-code
Content-Type: application/json

{
  "phone": "13800138000"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "success",
  "data": "验证码已发送"
}
```

#### 步骤2：使用验证码登录
```http
POST /api/auth/login-by-code
Content-Type: application/json

{
  "phone": "13800138000",
  "verificationCode": "123456",
  "userType": "user"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userType": "user",
    "username": "testuser",
    "phone": "13800138000"
  }
}
```

### 方式2️⃣：传统用户名密码登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "userType": "user"
}
```

## 📋 API接口详细说明

### 1. 发送验证码
- **接口**: `POST /api/auth/send-verification-code`
- **描述**: 发送6位数字验证码到指定手机号
- **请求参数**:
  - `phone`: 手机号（11位，以1开头）
- **返回**: 成功消息
- **验证码有效期**: 5分钟
- **注意**: 验证码会在控制台打印（开发环境）

### 2. 验证码登录
- **接口**: `POST /api/auth/login-by-code`
- **描述**: 使用手机号和验证码登录
- **请求参数**:
  - `phone`: 手机号
  - `verificationCode`: 验证码
  - `userType`: 用户类型（`user` 或 `admin`）
- **返回**: 包含JWT token的登录信息
- **前置条件**: 该手机号必须已注册

### 3. 传统登录
- **接口**: `POST /api/auth/login`
- **描述**: 使用用户名和密码登录
- **请求参数**:
  - `username`: 用户名
  - `password`: 密码
  - `userType`: 用户类型（`user` 或 `admin`）
- **返回**: 包含JWT token的登录信息

## 💻 使用示例

### cURL 命令行示例

#### 验证码登录完整流程
```bash
# 1. 发送验证码
curl -X POST http://localhost:8081/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'

# 2. 查看控制台获取验证码（开发环境）

# 3. 使用验证码登录
curl -X POST http://localhost:8081/api/auth/login-by-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "verificationCode": "123456",
    "userType": "user"
  }'
```

### JavaScript 前端示例

```javascript
// 发送验证码
async function sendCode(phone) {
  const response = await fetch('http://localhost:8081/api/auth/send-verification-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  const result = await response.json();
  console.log(result);
}

// 验证码登录
async function loginByCode(phone, code, userType) {
  const response = await fetch('http://localhost:8081/api/auth/login-by-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      verificationCode: code,
      userType
    })
  });
  const result = await response.json();
  if (result.code === 200) {
    // 保存token
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('username', result.data.username);
    console.log('登录成功！');
  }
  return result;
}

// 使用示例
await sendCode('13800138000');
// 用户输入验证码后
await loginByCode('13800138000', '123456', 'user');
```

### Vue/React 集成示例

```javascript
// 验证码登录组件
export default {
  data() {
    return {
      phone: '',
      verificationCode: '',
      countdown: 0,
      userType: 'user'
    }
  },
  methods: {
    // 发送验证码
    async sendVerificationCode() {
      if (this.countdown > 0) return;
      
      try {
        const res = await fetch('/api/auth/send-verification-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: this.phone })
        });
        const result = await res.json();
        
        if (result.code === 200) {
          this.$message.success('验证码已发送');
          this.countdown = 60;
          this.startCountdown();
        } else {
          this.$message.error(result.data);
        }
      } catch (error) {
        this.$message.error('发送失败');
      }
    },
    
    // 倒计时
    startCountdown() {
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    },
    
    // 登录
    async handleLogin() {
      try {
        const res = await fetch('/api/auth/login-by-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: this.phone,
            verificationCode: this.verificationCode,
            userType: this.userType
          })
        });
        const result = await res.json();
        
        if (result.code === 200) {
          localStorage.setItem('token', result.data.token);
          this.$router.push('/dashboard');
        } else {
          this.$message.error(result.data);
        }
      } catch (error) {
        this.$message.error('登录失败');
      }
    }
  }
}
```

## 🔐 安全特性

1. **验证码安全**
   - 6位随机数字
   - 5分钟有效期
   - 一次性使用（验证后自动删除）
   - 服务端存储和验证

2. **手机号验证**
   - 必须是11位数字
   - 必须以1开头
   - 符合中国手机号格式

3. **防暴力破解**
   - 验证码有效期限制
   - 一次性使用机制

## ⚠️ 注意事项

1. **手机号必须已注册**
   - 验证码登录要求手机号已在系统中注册
   - 如果手机号未注册，会返回"该手机号未注册"错误

2. **验证码有效期**
   - 验证码5分钟后自动过期
   - 过期后需要重新发送

3. **用户类型**
   - 必须正确指定用户类型（`user` 或 `admin`）
   - 普通用户用 `user`，管理员用 `admin`

4. **推送服务配置**
   - 确保在 `application.properties` 中配置了正确的推送URL
   - 即使推送失败，验证码仍会在控制台显示（开发环境）

## 🔧 错误处理

### 常见错误及解决方案

| 错误消息 | 原因 | 解决方案 |
|---------|------|---------|
| 手机号不能为空 | 未提供手机号 | 检查请求参数 |
| 手机号格式不正确 | 手机号格式错误 | 确保是11位数字，以1开头 |
| 验证码不能为空 | 未提供验证码 | 检查请求参数 |
| 验证码错误或已过期 | 验证码错误或超时 | 重新获取验证码 |
| 该手机号未注册 | 手机号未在系统注册 | 先注册账号 |
| 无效的用户类型 | userType参数错误 | 使用 `user` 或 `admin` |

## 📊 登录方式对比

| 特性 | 验证码登录 | 传统登录 |
|-----|----------|---------|
| 需要记住密码 | ❌ 否 | ✅ 是 |
| 安全性 | 🔒 高（一次性验证码） | 🔒 中（固定密码） |
| 便捷性 | 📱 高（无需记密码） | 📝 中（需输入密码） |
| 适用场景 | 移动端、快速登录 | 传统桌面端 |
| 依赖 | 手机号、推送服务 | 用户名、密码 |

## 🎨 前端UI建议

### 登录页面布局
```
┌─────────────────────────┐
│   欢迎回来               │
│                         │
│  [手机号输入框]          │
│  [验证码] [发送验证码60s] │
│                         │
│  [登录按钮]              │
│                         │
│  或 [用户名密码登录]     │
└─────────────────────────┘
```

### 交互流程
1. 用户输入手机号
2. 点击"发送验证码"按钮
3. 按钮变灰，显示倒计时（60秒）
4. 用户输入收到的验证码
5. 点击"登录"按钮
6. 登录成功，跳转到首页

## 📝 开发测试提示

1. **查看验证码**
   - 启动应用后，发送验证码
   - 在控制台查看打印的验证码
   - 格式: `=== 验证码发送成功 ===`

2. **测试流程**
   ```bash
   # 先注册一个账号
   POST /api/auth/register
   
   # 发送验证码
   POST /api/auth/send-verification-code
   
   # 使用验证码登录
   POST /api/auth/login-by-code
   ```

3. **Postman测试**
   - 导入提供的Postman集合
   - 按顺序执行：注册 → 发送验证码 → 验证码登录
   - 保存返回的token用于后续请求

## 🌟 最佳实践

1. **前端倒计时**：发送验证码后，按钮禁用60秒
2. **错误提示**：友好的错误提示信息
3. **自动填充**：支持验证码自动读取（移动端）
4. **快捷切换**：提供"用户名登录"和"验证码登录"快捷切换
5. **Token管理**：登录后保存token到localStorage或cookie


# 📱 验证码功能使用说明

## 🎯 功能概述

已完成注册和登录的验证码发送功能，使用推送服务发送验证码。

## 📋 配置说明

### 1. 推送服务配置

在 `application.properties` 中配置你的推送通道URL：

```properties
verification.api.url=https://push.spug.cc/send/你的推送通道ID
```

**重要**: 请将 `A27L****bgEY` 替换为你实际的推送通道ID（如图片中所示）。

### 2. URL格式

验证码推送使用GET请求，格式如下：
```
https://push.spug.cc/send/A27L****bgEY?name=验证码&code=153146&targets=18612345678
```

参数说明：
- `name`: 推送名称（固定为"验证码"）
- `code`: 6位数字验证码
- `targets`: 接收验证码的手机号

## 🚀 API接口使用

### 0. 验证码登录接口（新增 ⭐）

**接口**: `POST /api/auth/login-by-code`

**请求示例**:
```json
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

**说明**: 无需密码，只需手机号和验证码即可登录！

### 1. 发送验证码接口

**接口**: `POST /api/auth/send-verification-code`

**请求示例**:
```json
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

### 2. 注册接口（需要验证码）

**接口**: `POST /api/auth/register`

**请求示例**:
```json
{
  "username": "testuser",
  "phone": "13800138000",
  "verificationCode": "123456",
  "password": "password123",
  "confirmPassword": "password123",
  "userType": "user",
  "userProfilePic": "http://example.com/avatar.jpg"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "success",
  "data": "用户注册成功"
}
```

### 3. 传统登录接口（用户名密码，不需要验证码）

**接口**: `POST /api/auth/login`

**请求示例**:
```json
{
  "username": "testuser",
  "password": "password123",
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
    "username": "testuser"
  }
}
```

## 📝 完整使用流程

### 流程A: 验证码登录（⭐ 推荐）

#### 步骤1: 发送验证码
```bash
curl -X POST http://localhost:8081/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'
```

#### 步骤2: 使用验证码登录（无需密码）
```bash
curl -X POST http://localhost:8081/api/auth/login-by-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "verificationCode": "123456",
    "userType": "user"
  }'
```

### 流程B: 注册新账号

#### 步骤1: 发送验证码
```bash
curl -X POST http://localhost:8081/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'
```

### 步骤2: 使用验证码注册
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "phone": "13800138000",
    "verificationCode": "123456",
    "password": "password123",
    "confirmPassword": "password123",
    "userType": "user"
  }'
```

### 步骤3: 登录
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "userType": "user"
  }'
```

## ⚙️ 验证码功能特性

### 1. 安全特性
- ✅ 验证码为6位随机数字
- ✅ 有效期5分钟
- ✅ 一次性使用（验证后自动删除）
- ✅ 手机号格式验证（11位，以1开头）

### 2. 错误处理
- 如果推送服务失败，验证码仍会保存在服务器
- 可以在控制台看到验证码（开发调试用）
- 即使推送失败，注册流程仍可继续

### 3. 控制台日志示例

**发送成功时**:
```
=== 验证码发送成功 ===
手机号: 13800138000
验证码: 153146
响应: {"code":200,"msg":"发送成功"}
==================
```

**发送失败时**:
```
发送验证码失败: Connection refused
=== 验证码发送失败，但已保存在服务器 ===
手机号: 13800138000
验证码: 153146
==================
```

## 🔧 开发调试

### 方法1: 查看控制台日志
验证码会在控制台打印，方便开发测试。

### 方法2: 配置推送服务
1. 访问 https://push.spug.cc/
2. 登录账号
3. 获取你的推送通道ID
4. 将推送通道ID更新到 `application.properties`
5. 在推送服务中添加测试手机号

### 方法3: 使用测试控制器
如果推送服务不可用，可以使用内置的测试控制器：
```bash
# 获取已发送的验证码
curl http://localhost:8081/api/test/get-sent-code/13800138000
```

## 🌐 浏览器测试

在 Postman 或浏览器开发者工具中测试：

1. **打开 Postman**
2. **设置请求类型**: POST
3. **输入URL**: `http://localhost:8081/api/auth/send-verification-code`
4. **设置Headers**: `Content-Type: application/json`
5. **设置Body**: 
   ```json
   {
     "phone": "13800138000"
   }
   ```
6. **点击Send**
7. **查看后台控制台获取验证码**
8. **使用验证码完成注册**

## ⚠️ 注意事项

1. **推送通道ID**: 务必将 `application.properties` 中的 `A27L****bgEY` 替换为你实际的推送通道ID
2. **手机号格式**: 必须是11位数字，以1开头
3. **验证码有效期**: 5分钟，过期后需要重新发送
4. **验证码使用**: 每个验证码只能使用一次
5. **开发环境**: 即使推送失败，验证码仍会在控制台显示，方便测试

## 🎨 前端集成示例

```javascript
// 发送验证码
async function sendVerificationCode(phone) {
  const response = await fetch('http://localhost:8081/api/auth/send-verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone })
  });
  const result = await response.json();
  if (result.code === 200) {
    alert('验证码已发送！');
  } else {
    alert('发送失败：' + result.data);
  }
}

// 注册
async function register(data) {
  const response = await fetch('http://localhost:8081/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (result.code === 200) {
    alert('注册成功！');
  } else {
    alert('注册失败：' + result.data);
  }
}

// 使用示例
sendVerificationCode('13800138000');
// 然后用户输入验证码后
register({
  username: 'testuser',
  phone: '13800138000',
  verificationCode: '123456',
  password: 'password123',
  confirmPassword: 'password123',
  userType: 'user'
});
```


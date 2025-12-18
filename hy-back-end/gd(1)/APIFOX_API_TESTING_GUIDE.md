# 🦊 Apifox API 调试文档

## 📋 项目概述

基于手机号认证的Spring Boot用户认证系统，支持验证码注册、密码登录、验证码登录等功能。

## 🚀 快速开始

### 1️⃣ 环境配置

在Apifox中创建新项目：
- **项目名称**: `手机号认证系统`
- **Base URL**: `http://localhost:8081`

### 2️⃣ 环境变量设置

在Apifox项目设置中配置以下环境变量：

| 变量名 | 值 | 描述 |
|--------|----|----- |
| `baseUrl` | `http://localhost:8081` | 服务器地址 |
| `token` | `{{token}}` | JWT令牌（登录后自动设置） |
| `testPhone` | `13800138000` | 测试手机号 |
| `testPassword` | `password123` | 测试密码 |

## 📱 API接口列表

### 🔐 认证相关接口

#### 1️⃣ 发送验证码
```
POST {{baseUrl}}/api/auth/send-verification-code
```

**Headers:**
```json
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone": "{{testPhone}}"
}
```

**成功响应:**
```json
{
  "code": 200,
  "msg": "success",
  "data": "验证码已发送"
}
```

**后置脚本 (JavaScript):**
```javascript
// 无需脚本，验证码会在后台控制台显示
```

---

#### 2️⃣ 用户注册
```
POST {{baseUrl}}/api/auth/register
```

**Headers:**
```json
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone": "{{testPhone}}",
  "verificationCode": "123456",
  "password": "{{testPassword}}",
  "confirmPassword": "{{testPassword}}",
  "userType": "user",
  "userProfilePic": "https://example.com/avatar.jpg"
}
```

**成功响应:**
```json
{
  "code": 200,
  "msg": "success",
  "data": "用户注册成功"
}
```

---

#### 3️⃣ 手机号密码登录
```
POST {{baseUrl}}/api/auth/login
```

**Headers:**
```json
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone": "{{testPhone}}",
  "password": "{{testPassword}}",
  "userType": "user"
}
```

**成功响应:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "userType": "user",
    "phone": "13800138000"
  }
}
```

**后置脚本 (JavaScript):**
```javascript
// 自动保存token到环境变量
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.code === 200 && response.data.token) {
        pm.environment.set('token', response.data.token);
        console.log('Token已保存:', response.data.token);
    }
}
```

---

#### 4️⃣ 验证码登录
```
POST {{baseUrl}}/api/auth/login-by-code
```

**Headers:**
```json
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone": "{{testPhone}}",
  "verificationCode": "123456",
  "userType": "user"
}
```

**成功响应:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "userType": "user",
    "phone": "13800138000"
  }
}
```

**后置脚本 (JavaScript):**
```javascript
// 自动保存token到环境变量
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.code === 200 && response.data.token) {
        pm.environment.set('token', response.data.token);
        console.log('验证码登录成功，Token已保存:', response.data.token);
    }
}
```

---

#### 5️⃣ 管理员注册
```
POST {{baseUrl}}/api/auth/register
```

**Headers:**
```json
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone": "13900139000",
  "verificationCode": "123456",
  "password": "admin123",
  "confirmPassword": "admin123",
  "userType": "admin"
}
```

---

#### 6️⃣ 管理员登录
```
POST {{baseUrl}}/api/auth/login
```

**Headers:**
```json
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone": "13900139000",
  "password": "admin123",
  "userType": "admin"
}
```

**后置脚本 (JavaScript):**
```javascript
// 保存管理员token
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.code === 200 && response.data.token) {
        pm.environment.set('token', response.data.token);
        pm.environment.set('adminToken', response.data.token);
        console.log('管理员登录成功，Token已保存:', response.data.token);
    }
}
```

---

### 👤 用户信息接口

#### 7️⃣ 获取个人信息
```
GET {{baseUrl}}/api/auth/profile
```

**Headers:**
```json
Authorization: Bearer {{token}}
```

**成功响应:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "phone": "13800138000",
    "authorities": [
      {
        "authority": "ROLE_USER"
      }
    ]
  }
}
```

---

#### 8️⃣ 管理员获取用户列表
```
GET {{baseUrl}}/api/auth/admin/users
```

**Headers:**
```json
Authorization: Bearer {{token}}
```

**成功响应:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "user1": "普通用户",
    "user2": "VIP用户"
  }
}
```

## 🧪 完整测试流程

### 流程A：新用户完整注册登录流程

1. **步骤1：发送验证码**
   - 执行接口1️⃣ 
   - 查看后台控制台获取验证码

2. **步骤2：用户注册**
   - 执行接口2️⃣
   - 将控制台的验证码填入`verificationCode`字段

3. **步骤3：手机号密码登录**
   - 执行接口3️⃣
   - Token会自动保存到环境变量

4. **步骤4：获取个人信息**
   - 执行接口7️⃣
   - 验证JWT认证是否正常

### 流程B：验证码快速登录流程

1. **步骤1：发送验证码**
   - 执行接口1️⃣

2. **步骤2：验证码登录（无需密码）**
   - 执行接口4️⃣
   - 直接使用手机号+验证码登录

### 流程C：管理员权限测试流程

1. **步骤1：注册管理员**
   - 先发送验证码（接口1️⃣，手机号改为13900139000）
   - 执行管理员注册（接口5️⃣）

2. **步骤2：管理员登录**
   - 执行接口6️⃣

3. **步骤3：测试管理员权限**
   - 执行接口8️⃣
   - 验证管理员权限接口

## 📊 Apifox自动化测试

### 测试集合配置

在Apifox中创建测试集合，按以下顺序添加接口：

```
📁 手机号认证系统测试
├── 🔐 认证流程
│   ├── 1️⃣ 发送验证码
│   ├── 2️⃣ 用户注册
│   ├── 3️⃣ 手机号密码登录
│   └── 4️⃣ 验证码登录
├── 👤 用户接口
│   ├── 7️⃣ 获取个人信息
│   └── 8️⃣ 管理员用户列表
└── 👑 管理员流程
    ├── 5️⃣ 管理员注册
    └── 6️⃣ 管理员登录
```

### 全局前置脚本

```javascript
// 设置全局变量
pm.globals.set("timestamp", Date.now());
pm.globals.set("randomPhone", "138" + Math.floor(Math.random() * 100000000));
```

### 全局后置脚本

```javascript
// 全局响应处理
pm.test("响应状态码检查", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 400, 401, 403]);
});

pm.test("响应时间检查", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

// 记录测试日志
console.log("接口:", pm.info.requestName);
console.log("状态码:", pm.response.code);
console.log("响应时间:", pm.response.responseTime + "ms");
```

## 🎯 测试数据管理

### 测试用例数据

在Apifox中创建以下测试数据：

```json
{
  "用户数据": {
    "普通用户": {
      "phone": "13800138000",
      "password": "password123",
      "userType": "user"
    },
    "VIP用户": {
      "phone": "13800138001", 
      "password": "vip123",
      "userType": "user"
    },
    "管理员": {
      "phone": "13900139000",
      "password": "admin123", 
      "userType": "admin"
    }
  },
  "验证码": {
    "默认": "123456",
    "注意": "实际测试时请查看后台控制台获取真实验证码"
  }
}
```

## 🚨 错误处理测试

### 常见错误场景

#### 1. 手机号格式错误
```json
{
  "phone": "12345",
  "verificationCode": "123456",
  "password": "password123",
  "confirmPassword": "password123",
  "userType": "user"
}
```
**预期响应:** `400 - 手机号格式不正确`

#### 2. 验证码错误
```json
{
  "phone": "13800138000",
  "verificationCode": "000000",
  "password": "password123",
  "confirmPassword": "password123", 
  "userType": "user"
}
```
**预期响应:** `400 - 验证码错误或已过期`

#### 3. 密码不一致
```json
{
  "phone": "13800138000",
  "verificationCode": "123456",
  "password": "password123",
  "confirmPassword": "password456",
  "userType": "user"
}
```
**预期响应:** `400 - 密码和确认密码不一致`

#### 4. 重复注册
**预期响应:** `400 - 该手机号已注册`

#### 5. JWT认证失败
**Headers:**
```json
Authorization: Bearer invalid_token
```
**预期响应:** `401 - 未认证`

## 📈 性能测试配置

### 压力测试配置

在Apifox中设置性能测试：

1. **并发用户数**: 10-50
2. **持续时间**: 30秒-2分钟  
3. **目标接口**: 登录接口、获取用户信息接口
4. **成功率要求**: >95%
5. **平均响应时间**: <500ms

### 监控指标

- ✅ 响应时间
- ✅ 吞吐量(TPS)
- ✅ 错误率
- ✅ CPU使用率
- ✅ 内存使用情况

## 🔧 调试技巧

### 1. 查看完整请求/响应

在Apifox中启用：
- ✅ 请求详情显示
- ✅ 响应头显示
- ✅ 响应体格式化
- ✅ 网络耗时分析

### 2. 验证码获取

由于验证码会打印在后台控制台，建议：
1. 保持Spring Boot控制台开启
2. 发送验证码后立即查看控制台输出
3. 复制验证码到Apifox请求中

### 3. Token管理

使用Apifox的环境变量功能：
```javascript
// 在登录接口的后置脚本中
pm.environment.set('token', response.data.token);

// 在需要认证的接口中使用
// Headers: Authorization: Bearer {{token}}
```

### 4. 批量测试

使用Apifox的测试套件功能：
1. 创建测试套件
2. 按顺序添加接口
3. 设置接口间的依赖关系
4. 一键运行完整测试流程

## 📋 检查清单

### 测试前准备
- ✅ Spring Boot应用已启动（端口8081）
- ✅ MySQL数据库连接正常
- ✅ Apifox环境变量已配置
- ✅ 测试数据已准备

### 功能测试检查
- ✅ 验证码发送功能
- ✅ 用户注册功能
- ✅ 手机号密码登录
- ✅ 验证码登录  
- ✅ JWT令牌认证
- ✅ 用户信息获取
- ✅ 管理员权限验证

### 异常测试检查
- ✅ 无效手机号格式
- ✅ 错误验证码
- ✅ 密码不一致
- ✅ 重复注册
- ✅ 无效Token
- ✅ 权限不足

## 🎉 总结

使用Apifox测试本系统的优势：
1. **可视化界面** - 直观的请求/响应展示
2. **环境管理** - 轻松切换测试/生产环境
3. **自动化测试** - 支持测试套件和脚本
4. **团队协作** - 可以分享API文档和测试用例
5. **性能测试** - 内置压力测试功能

现在你可以在Apifox中导入这些接口，开始完整的API调试了！🚀

## 🔗 相关链接

- **项目地址**: http://localhost:8081
- **API文档**: 本文档
- **Swagger UI**: http://localhost:8081/swagger-ui.html (如已配置)
- **H2 Console**: http://localhost:8081/h2-console (如使用H2数据库)

---

**提示**: 记得在测试过程中查看Spring Boot后台日志，验证码会在那里显示！

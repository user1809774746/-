# 📱 Postman API 调试文档

## 🎯 概述

本文档提供了完整的Postman测试集合，用于调试修改后的认证系统。所有接口已改为基于手机号认证。

## 🚀 快速开始

### 环境配置

1. **导入Postman集合**：将下方的JSON内容保存为 `.json` 文件并导入Postman
2. **设置环境变量**：
   ```
   baseUrl: http://localhost:8081
   token: (登录成功后自动设置)
   ```

## 📋 接口列表

### 🔐 认证相关接口

1. **发送验证码** - `POST /api/auth/send-verification-code`
2. **用户注册** - `POST /api/auth/register` 
3. **手机号密码登录** - `POST /api/auth/login`
4. **验证码登录** - `POST /api/auth/login-by-code`
5. **获取用户信息** - `GET /api/auth/profile`
6. **管理员接口** - `GET /api/auth/admin/users`

## 🧪 测试流程

### 流程A：新用户注册 → 登录
```
1. 发送验证码
2. 用户注册
3. 手机号密码登录
```

### 流程B：验证码快速登录
```
1. 发送验证码
2. 验证码登录（无需密码）
```

## 📊 Postman集合JSON

```json
{
  "info": {
    "name": "Auth System API - 手机号认证版",
    "description": "基于手机号的用户认证系统API测试集合",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "🔐 认证接口",
      "item": [
        {
          "name": "1️⃣ 发送验证码",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"13800138000\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/send-verification-code",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "send-verification-code"]
            },
            "description": "向指定手机号发送6位数验证码"
          },
          "response": []
        },
        {
          "name": "2️⃣ 用户注册",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"13800138000\",\n  \"verificationCode\": \"123456\",\n  \"password\": \"password123\",\n  \"confirmPassword\": \"password123\",\n  \"userType\": \"user\",\n  \"userProfilePic\": \"https://example.com/avatar.jpg\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            },
            "description": "使用手机号和验证码注册新用户"
          },
          "response": []
        },
        {
          "name": "3️⃣ 管理员注册",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"13900139000\",\n  \"verificationCode\": \"123456\",\n  \"password\": \"admin123\",\n  \"confirmPassword\": \"admin123\",\n  \"userType\": \"admin\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            },
            "description": "注册管理员账号"
          },
          "response": []
        },
        {
          "name": "4️⃣ 手机号密码登录",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.code === 200 && response.data.token) {",
                  "        pm.environment.set('token', response.data.token);",
                  "        console.log('Token saved:', response.data.token);",
                  "    }",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"13800138000\",\n  \"password\": \"password123\",\n  \"userType\": \"user\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            },
            "description": "使用手机号和密码登录"
          },
          "response": []
        },
        {
          "name": "5️⃣ 管理员密码登录",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.code === 200 && response.data.token) {",
                  "        pm.environment.set('token', response.data.token);",
                  "        console.log('Admin token saved:', response.data.token);",
                  "    }",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"13900139000\",\n  \"password\": \"admin123\",\n  \"userType\": \"admin\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            },
            "description": "管理员登录"
          },
          "response": []
        },
        {
          "name": "6️⃣ 验证码登录",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.code === 200 && response.data.token) {",
                  "        pm.environment.set('token', response.data.token);",
                  "        console.log('Token saved via verification code:', response.data.token);",
                  "    }",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"13800138000\",\n  \"verificationCode\": \"123456\",\n  \"userType\": \"user\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login-by-code",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login-by-code"]
            },
            "description": "使用手机号和验证码登录（无需密码）"
          },
          "response": []
        }
      ]
    },
    {
      "name": "👤 用户接口",
      "item": [
        {
          "name": "7️⃣ 获取个人信息",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/auth/profile",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "profile"]
            },
            "description": "获取当前登录用户信息"
          },
          "response": []
        },
        {
          "name": "8️⃣ 管理员获取用户列表",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/auth/admin/users",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "admin", "users"]
            },
            "description": "管理员权限：获取用户列表"
          },
          "response": []
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8081"
    }
  ]
}
```

## 🔧 详细测试步骤

### 步骤1️⃣：设置Postman环境

1. **创建环境**：
   - 环境名称：`Auth System Local`
   - 变量：
     ```
     baseUrl: http://localhost:8081
     token: (空，登录后自动设置)
     ```

### 步骤2️⃣：完整测试流程

#### 🆕 新用户注册流程

1. **发送验证码**
   ```json
   POST /api/auth/send-verification-code
   {
     "phone": "13800138000"
   }
   ```
   ✅ 预期响应：`{"code":200,"msg":"success","data":"验证码已发送"}`

2. **查看控制台获取验证码**
   - 在后台控制台查看输出的验证码

3. **用户注册**
   ```json
   POST /api/auth/register
   {
     "phone": "13800138000",
     "verificationCode": "123456", // 使用实际验证码
     "password": "password123",
     "confirmPassword": "password123",
     "userType": "user",
     "userProfilePic": "https://example.com/avatar.jpg"
   }
   ```

4. **手机号密码登录**
   ```json
   POST /api/auth/login
   {
     "phone": "13800138000",
     "password": "password123",
     "userType": "user"
   }
   ```
   ✅ 成功后token会自动保存到环境变量

#### ⚡ 验证码快速登录流程

1. **发送验证码**（同上）
2. **验证码登录**
   ```json
   POST /api/auth/login-by-code
   {
     "phone": "13800138000",
     "verificationCode": "123456", // 使用实际验证码
     "userType": "user"
   }
   ```

#### 🔒 测试认证接口

5. **获取个人信息**
   ```
   GET /api/auth/profile
   Headers: Authorization: Bearer {{token}}
   ```

### 步骤3️⃣：管理员测试

1. **注册管理员**
   ```json
   POST /api/auth/register
   {
     "phone": "13900139000",
     "verificationCode": "123456",
     "password": "admin123",
     "confirmPassword": "admin123",
     "userType": "admin"
   }
   ```

2. **管理员登录**
   ```json
   POST /api/auth/login
   {
     "phone": "13900139000",
     "password": "admin123",
     "userType": "admin"
   }
   ```

3. **访问管理员接口**
   ```
   GET /api/auth/admin/users
   Headers: Authorization: Bearer {{token}}
   ```

## 📱 手动测试用例

### 测试用例1：验证手机号格式验证
```json
POST /api/auth/send-verification-code
{
  "phone": "12345" // 错误格式
}
```
预期：`{"code":400,"msg":"error","data":"手机号格式不正确"}`

### 测试用例2：验证密码一致性
```json
POST /api/auth/register
{
  "phone": "13800138001",
  "verificationCode": "123456",
  "password": "password123",
  "confirmPassword": "password456", // 不一致
  "userType": "user"
}
```
预期：`{"code":400,"msg":"error","data":"密码和确认密码不一致"}`

### 测试用例3：验证重复注册
```json
// 第二次使用相同手机号注册
POST /api/auth/register
{
  "phone": "13800138000", // 已存在
  "verificationCode": "123456",
  "password": "password123",
  "confirmPassword": "password123",
  "userType": "user"
}
```
预期：`{"code":400,"msg":"error","data":"该手机号已注册"}`

## 🚨 常见问题

### Q1: 验证码发送失败怎么办？
**A**: 验证码会在控制台打印，即使推送服务失败也能看到验证码

### Q2: Token无效怎么办？
**A**: 重新登录获取新token，token有效期1小时

### Q3: 手机号格式要求？
**A**: 11位数字，以1开头，如：13800138000

### Q4: 如何测试管理员权限？
**A**: 先注册管理员账号，登录后使用管理员token访问`/admin/users`接口

## 🎯 成功响应示例

### 登录成功响应
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

### 个人信息响应
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "phone": "13800138000",
    "authorities": [{"authority": "ROLE_USER"}]
  }
}
```

---

🎉 **准备完毕！** 将上述JSON内容导入Postman，设置好环境变量，即可开始测试！

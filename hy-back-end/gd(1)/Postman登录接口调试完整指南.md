# 📱 Postman 登录接口调试完整指南

> **文档版本**: v2.0  
> **更新日期**: 2025-11-02  
> **适用系统**: 旅游景点分享平台认证系统  
> **后端地址**: http://localhost:8081

---

## 📖 目录

1. [快速开始](#快速开始)
2. [环境配置](#环境配置)
3. [登录方式概览](#登录方式概览)
4. [接口详细说明](#接口详细说明)
5. [完整测试流程](#完整测试流程)
6. [Postman Collection](#postman-collection)
7. [常见问题解决](#常见问题解决)
8. [最佳实践](#最佳实践)

---

## 🚀 快速开始

### 三步快速测试

1. **导入Postman Collection** - 复制文档末尾的JSON并导入Postman
2. **设置环境变量** - 创建环境并设置 `baseUrl` 为 `http://localhost:8081`
3. **开始测试** - 按顺序执行测试用例

---

## ⚙️ 环境配置

### 1. 创建Postman环境

1. 点击Postman右上角的环境下拉菜单
2. 选择 "Create Environment"
3. 命名为: `旅游平台-本地开发`

### 2. 配置环境变量

| 变量名 | 初始值 | 说明 |
|--------|--------|------|
| `baseUrl` | `http://localhost:8081` | 后端API基础地址 |
| `token` | (留空) | 登录后自动设置 |
| `phone` | `13800138000` | 测试用手机号 |
| `adminPhone` | `18888888888` | 管理员测试手机号 |

### 3. 确认后端服务运行

```bash
# 检查服务是否启动
curl http://localhost:8081/api/auth/profile

# 应该返回 401 未认证错误（说明服务正常）
```

---

## 🔐 登录方式概览

系统支持 **5种登录方式**，适用于不同场景：

| 登录方式 | 接口路径 | 适用场景 | 是否需要验证码 |
|---------|----------|---------|--------------|
| **1️⃣ 密码登录** | `POST /api/auth/login` | 常规登录 | ❌ |
| **2️⃣ 验证码登录** | `POST /api/auth/login-by-code` | 快速登录/忘记密码 | ✅ |
| **3️⃣ 七天免密登录** | `POST /api/auth/auto-login` | 自动登录 | ❌ |
| **4️⃣ 管理员快速注册** | `POST /api/auth/admin/quick-register` | 管理员创建 | ❌ |
| **5️⃣ 用户注册** | `POST /api/auth/register` | 新用户注册 | ✅ |

---

## 📋 接口详细说明

### 🔹 方式一：密码登录（最常用）

#### 接口信息
- **路径**: `POST /api/auth/login`
- **描述**: 使用手机号+密码登录
- **适用**: 普通用户 & 管理员

#### 请求参数

```json
{
  "phone": "13800138000",        // 必填，11位手机号
  "password": "password123",      // 必填，密码
  "userType": "user"             // 必填，"user"或"admin"
}
```

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJwaG9u...",
    "userType": "user",
    "phone": "13800138000"
  }
}
```

#### Postman配置

**Method**: `POST`  
**URL**: `{{baseUrl}}/api/auth/login`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw, JSON):
```json
{
  "phone": "{{phone}}",
  "password": "password123",
  "userType": "user"
}
```

**Tests** (自动保存token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.code === 200 && response.data.token) {
        pm.environment.set('token', response.data.token);
        console.log('✅ Token已保存:', response.data.token);
    }
}
```

---

### 🔹 方式二：验证码登录

#### 接口信息
- **路径**: `POST /api/auth/login-by-code`
- **描述**: 使用验证码快速登录，无需密码
- **前置**: 需先调用发送验证码接口

#### 完整流程

##### Step 1: 发送验证码

**接口**: `POST /api/auth/send-verification-code`

**请求**:
```json
{
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": "验证码已发送"
}
```

**验证码查看**: 查看后端控制台日志
```
=== 发送验证码 ===
手机号: 13800138000
验证码: 123456
有效期: 5分钟
```

##### Step 2: 验证码登录

**请求**:
```json
{
  "phone": "13800138000",
  "verificationCode": "123456",  // 从控制台获取
  "userType": "user"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "userType": "user",
    "phone": "13800138000"
  }
}
```

---

### 🔹 方式三：七天免密登录

#### 接口信息
- **路径**: `POST /api/auth/auto-login`
- **描述**: 使用上次登录的token自动登录
- **适用**: 7天内登录过的用户

#### 使用场景
- App启动时自动登录
- 用户无需重复输入密码
- Token有效期7天

#### 请求参数

```json
{
  "phone": "13800138000",
  "token": "eyJhbGciOiJIUzUxMiJ9...",  // 上次登录的token
  "userType": "user"
}
```

#### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",  // 新的token
    "userType": "user",
    "phone": "13800138000",
    "loginType": "auto_login"
  }
}
```

#### 失败响应（Token已失效）

```json
{
  "code": 401,
  "message": "Token已过期或无效",
  "data": null
}
```

#### 测试步骤

1. 先用密码登录获取token
2. 保存token到环境变量
3. 调用七天免密登录接口
4. 验证返回新的token

---

### 🔹 方式四：管理员快速注册

#### 接口信息
- **路径**: `POST /api/auth/admin/quick-register`
- **描述**: 快速创建管理员账号（无需验证码）
- **适用**: 开发测试环境

#### 请求参数

```json
{
  "phone": "18888888888",
  "password": "123123"
}
```

#### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "phone": "18888888888",
    "message": "管理员注册成功"
  }
}
```

#### 注意事项

⚠️ **该接口仅用于测试环境**
- 生产环境应关闭或添加权限校验
- 不需要验证码，直接创建管理员
- 密码最少6位

---

### 🔹 方式五：用户注册

#### 接口信息
- **路径**: `POST /api/auth/register`
- **描述**: 注册新用户或管理员
- **前置**: 需先获取验证码

#### 请求参数

```json
{
  "phone": "13800138000",
  "verificationCode": "123456",
  "password": "password123",
  "confirmPassword": "password123",
  "userType": "user",              // "user"或"admin"
  "userProfilePic": "https://example.com/avatar.jpg"  // 可选
}
```

#### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | ✅ | 11位手机号 |
| verificationCode | String | ✅ | 6位验证码 |
| password | String | ✅ | 密码（≥6位） |
| confirmPassword | String | ✅ | 确认密码（需一致） |
| userType | String | ✅ | "user"或"admin" |
| userProfilePic | String | ❌ | 头像URL（仅用户需要） |

---

## 🧪 完整测试流程

### 📝 测试场景一：新用户注册并登录

```
1️⃣ 发送验证码
   POST /api/auth/send-verification-code
   Body: { "phone": "13800138888" }
   
2️⃣ 查看控制台获取验证码
   后端日志: 验证码: 123456
   
3️⃣ 用户注册
   POST /api/auth/register
   Body: {
     "phone": "13800138888",
     "verificationCode": "123456",
     "password": "test123456",
     "confirmPassword": "test123456",
     "userType": "user"
   }
   
4️⃣ 密码登录
   POST /api/auth/login
   Body: {
     "phone": "13800138888",
     "password": "test123456",
     "userType": "user"
   }
   
5️⃣ 验证Token
   GET /api/auth/profile
   Headers: Authorization: Bearer {{token}}
```

---

### 📝 测试场景二：验证码快速登录

```
1️⃣ 发送验证码
   POST /api/auth/send-verification-code
   Body: { "phone": "13800138000" }
   
2️⃣ 验证码登录（无需密码）
   POST /api/auth/login-by-code
   Body: {
     "phone": "13800138000",
     "verificationCode": "123456",
     "userType": "user"
   }
   
3️⃣ 访问用户信息
   GET /api/auth/user-info
   Headers: Authorization: Bearer {{token}}
```

---

### 📝 测试场景三：管理员完整流程

```
1️⃣ 快速注册管理员
   POST /api/auth/admin/quick-register
   Body: {
     "phone": "18888888888",
     "password": "123123"
   }
   
2️⃣ 管理员登录
   POST /api/auth/login
   Body: {
     "phone": "18888888888",
     "password": "123123",
     "userType": "admin"
   }
   
3️⃣ 访问管理员接口
   GET /api/auth/admin/users
   Headers: Authorization: Bearer {{token}}
   
4️⃣ 查看待审核帖子
   GET /api/admin/posts/pending
   Headers: Authorization: Bearer {{token}}
```

---

### 📝 测试场景四：七天免密登录

```
1️⃣ 密码登录获取Token
   POST /api/auth/login
   Body: {
     "phone": "13800138000",
     "password": "password123",
     "userType": "user"
   }
   保存返回的token
   
2️⃣ 检查是否可以自动登录
   POST /api/auth/check-auto-login
   Body: {
     "phone": "13800138000",
     "userType": "user"
   }
   
3️⃣ 执行自动登录
   POST /api/auth/auto-login
   Body: {
     "phone": "13800138000",
     "token": "之前保存的token",
     "userType": "user"
   }
   
4️⃣ 使用新Token访问接口
   GET /api/auth/profile
   Headers: Authorization: Bearer {{新token}}
```

---

## 📦 Postman Collection

### 完整可导入的JSON

将以下内容保存为 `旅游平台-登录接口测试.postman_collection.json`

```json
{
  "info": {
    "name": "旅游平台-登录接口完整测试",
    "description": "包含所有登录方式的完整测试集合",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "12345"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8081",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "1️⃣ 验证码相关",
      "item": [
        {
          "name": "发送验证码",
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
              "raw": "{\n  \"phone\": \"{{phone}}\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/send-verification-code",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "send-verification-code"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "2️⃣ 注册相关",
      "item": [
        {
          "name": "用户注册",
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
              "raw": "{\n  \"phone\": \"{{phone}}\",\n  \"verificationCode\": \"123456\",\n  \"password\": \"password123\",\n  \"confirmPassword\": \"password123\",\n  \"userType\": \"user\",\n  \"userProfilePic\": \"https://example.com/avatar.jpg\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          },
          "response": []
        },
        {
          "name": "管理员快速注册",
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
              "raw": "{\n  \"phone\": \"{{adminPhone}}\",\n  \"password\": \"123123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/admin/quick-register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "admin", "quick-register"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "3️⃣ 登录相关",
      "item": [
        {
          "name": "用户密码登录",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.code === 200 && response.data.token) {",
                  "        pm.environment.set('token', response.data.token);",
                  "        console.log('✅ Token已保存:', response.data.token);",
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
              "raw": "{\n  \"phone\": \"{{phone}}\",\n  \"password\": \"password123\",\n  \"userType\": \"user\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          },
          "response": []
        },
        {
          "name": "管理员密码登录",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.code === 200 && response.data.token) {",
                  "        pm.environment.set('token', response.data.token);",
                  "        console.log('✅ 管理员Token已保存:', response.data.token);",
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
              "raw": "{\n  \"phone\": \"{{adminPhone}}\",\n  \"password\": \"123123\",\n  \"userType\": \"admin\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          },
          "response": []
        },
        {
          "name": "验证码登录",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.code === 200 && response.data.token) {",
                  "        pm.environment.set('token', response.data.token);",
                  "        console.log('✅ 验证码登录成功，Token已保存');",
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
              "raw": "{\n  \"phone\": \"{{phone}}\",\n  \"verificationCode\": \"123456\",\n  \"userType\": \"user\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login-by-code",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login-by-code"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "4️⃣ 七天免密登录",
      "item": [
        {
          "name": "检查是否可以自动登录",
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
              "raw": "{\n  \"phone\": \"{{phone}}\",\n  \"userType\": \"user\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/check-auto-login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "check-auto-login"]
            }
          },
          "response": []
        },
        {
          "name": "执行七天免密登录",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.code === 200 && response.data.token) {",
                  "        pm.environment.set('token', response.data.token);",
                  "        console.log('✅ 自动登录成功，新Token已保存');",
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
              "raw": "{\n  \"phone\": \"{{phone}}\",\n  \"token\": \"{{token}}\",\n  \"userType\": \"user\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/auto-login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "auto-login"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "5️⃣ 用户信息",
      "item": [
        {
          "name": "获取个人信息",
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
            }
          },
          "response": []
        },
        {
          "name": "获取用户身份信息",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/auth/user-info",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "user-info"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "6️⃣ 管理员专用接口",
      "item": [
        {
          "name": "获取用户列表",
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
            }
          },
          "response": []
        },
        {
          "name": "获取待审核帖子",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/posts/pending",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "posts", "pending"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "7️⃣ 退出登录",
      "item": [
        {
          "name": "注销登录",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/auth/logout",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "logout"]
            }
          },
          "response": []
        }
      ]
    }
  ]
}
```

---

## ❓ 常见问题解决

### Q1: 验证码在哪里查看？

**A**: 验证码会在后端控制台打印

```bash
# 查看IDEA/Eclipse控制台输出
=== 发送验证码 ===
手机号: 13800138000
验证码: 123456
有效期: 5分钟
```

如果配置了真实的推送服务，验证码也会发送到指定的推送地址。

---

### Q2: Token无效或过期怎么办？

**症状**:
```json
{
  "code": 401,
  "message": "Token无效或已过期",
  "data": null
}
```

**解决方案**:
1. 重新执行登录接口获取新token
2. 确保请求头格式正确: `Authorization: Bearer {{token}}`
3. 检查token前后是否有多余空格

---

### Q3: 手机号格式验证失败

**错误信息**:
```json
{
  "code": 400,
  "message": "手机号格式不正确",
  "data": null
}
```

**要求**:
- 必须是11位数字
- 以1开头，第二位为3-9
- 正则: `^1[3-9]\d{9}$`

**正确示例**: `13800138000`, `18888888888`  
**错误示例**: `12345678901`, `1380013800`

---

### Q4: 密码登录失败

**错误信息**:
```json
{
  "code": 401,
  "message": "手机号或密码错误",
  "data": null
}
```

**检查清单**:
- [ ] 手机号是否已注册
- [ ] 密码是否正确（注意大小写）
- [ ] userType是否正确（user/admin）
- [ ] 是否用管理员密码登录普通用户

---

### Q5: 如何测试顶号机制？

**步骤**:

1. **第一次登录**
```json
POST /api/auth/login
{
  "phone": "13800138000",
  "password": "password123",
  "userType": "user"
}
// 得到 token1
```

2. **第二次登录（同一账号）**
```json
POST /api/auth/login
{
  "phone": "13800138000",
  "password": "password123",
  "userType": "user"
}
// 得到 token2
```

3. **使用旧token访问**
```
GET /api/auth/profile
Authorization: Bearer token1
// 应该返回401错误（被顶号）
```

4. **使用新token访问**
```
GET /api/auth/profile
Authorization: Bearer token2
// 成功返回用户信息
```

---

### Q6: 如何测试七天免密登录？

**完整步骤**:

```bash
# 1. 密码登录
POST /api/auth/login
{
  "phone": "13800138000",
  "password": "password123",
  "userType": "user"
}
# 保存返回的token

# 2. 检查是否可以自动登录
POST /api/auth/check-auto-login
{
  "phone": "13800138000",
  "userType": "user"
}
# 应返回 canAutoLogin: true

# 3. 执行自动登录
POST /api/auth/auto-login
{
  "phone": "13800138000",
  "token": "之前保存的token",
  "userType": "user"
}
# 返回新的token

# 4. 使用新token访问接口
GET /api/auth/profile
Authorization: Bearer 新token
```

---

### Q7: 验证码过期怎么办？

**验证码有效期**: 5分钟

**解决方案**: 重新发送验证码
```json
POST /api/auth/send-verification-code
{
  "phone": "13800138000"
}
```

---

### Q8: 如何区分普通用户和管理员？

**关键点**: `userType` 参数

| 用户类型 | userType值 | 数据库表 | 权限 |
|---------|------------|----------|------|
| 普通用户 | `"user"` | user_info | 查看、发布帖子 |
| 管理员 | `"admin"` | administrator_info | 审核帖子、管理用户 |

**测试管理员权限**:
```bash
# 1. 管理员登录
POST /api/auth/login
{
  "phone": "18888888888",
  "password": "123123",
  "userType": "admin"  # 必须是admin
}

# 2. 访问管理员接口
GET /api/auth/admin/users
Authorization: Bearer {{token}}
# 成功返回用户列表

# 3. 用普通用户token访问
GET /api/auth/admin/users
Authorization: Bearer {{普通用户token}}
# 返回403权限不足
```

---

## 🎯 最佳实践

### 1. Token管理

#### ✅ 正确做法

```javascript
// 登录成功后保存token
if (response.code === 200) {
    const { token, userType, phone } = response.data;
    
    // 保存到localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userType', userType);
    localStorage.setItem('phone', phone);
    
    // 设置过期时间提醒（7天）
    const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('tokenExpiry', expiryTime);
}

// 使用token前检查是否过期
function getToken() {
    const token = localStorage.getItem('token');
    const expiryTime = localStorage.getItem('tokenExpiry');
    
    if (!token || Date.now() > expiryTime) {
        // Token过期，跳转到登录页
        window.location.href = '/login.html';
        return null;
    }
    
    return token;
}
```

#### ❌ 错误做法

```javascript
// 不要把token放在URL参数中
❌ fetch(`/api/auth/profile?token=${token}`)

// 不要在控制台打印完整token
❌ console.log('Token:', token)

// 不要硬编码token
❌ const token = "eyJhbGciOiJIUz..."
```

---

### 2. Postman环境变量使用

#### 自动保存Token

在登录接口的 **Tests** 标签页添加：

```javascript
// 自动保存token到环境变量
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.code === 200 && response.data.token) {
        pm.environment.set('token', response.data.token);
        pm.environment.set('userType', response.data.userType);
        pm.environment.set('phone', response.data.phone);
        console.log('✅ Token已保存');
    } else {
        console.error('❌ 登录失败:', response.message);
    }
}
```

#### 请求前自动添加Token

在Collection设置中添加 **Pre-request Script**:

```javascript
// 自动给需要认证的接口添加token
const token = pm.environment.get('token');
if (token) {
    pm.request.headers.add({
        key: 'Authorization',
        value: `Bearer ${token}`
    });
}
```

---

### 3. 错误处理

#### 统一错误处理

```javascript
// 在Tests中添加统一的错误检查
const response = pm.response.json();

// 检查HTTP状态码
pm.test("HTTP状态码为200", function () {
    pm.response.to.have.status(200);
});

// 检查业务状态码
pm.test("业务操作成功", function () {
    pm.expect(response.code).to.equal(200);
});

// 登录成功时保存token
if (response.code === 200 && response.data.token) {
    pm.environment.set('token', response.data.token);
    console.log('✅ 登录成功');
} else {
    console.error('❌ 操作失败:', response.message);
}
```

---

### 4. 测试数据管理

#### 创建测试数据文件

创建 `test-data.json`:

```json
{
  "users": [
    {
      "phone": "13800138000",
      "password": "password123",
      "userType": "user"
    },
    {
      "phone": "13800138001",
      "password": "test123456",
      "userType": "user"
    }
  ],
  "admins": [
    {
      "phone": "18888888888",
      "password": "123123",
      "userType": "admin"
    }
  ]
}
```

#### 在Postman中使用

```javascript
// 在Pre-request Script中读取测试数据
const testData = pm.environment.get('testData');
if (!testData) {
    // 首次加载测试数据
    pm.environment.set('testData', JSON.stringify({
        "testUser": {
            "phone": "13800138000",
            "password": "password123"
        }
    }));
}

const data = JSON.parse(pm.environment.get('testData'));
pm.environment.set('phone', data.testUser.phone);
```

---

### 5. 接口测试顺序

#### 推荐测试顺序

```
📋 完整测试流程

1. 环境检查
   └─ GET /api/auth/profile (应返回401)

2. 用户注册流程
   ├─ POST /api/auth/send-verification-code
   ├─ POST /api/auth/register
   └─ POST /api/auth/login

3. 验证码登录流程
   ├─ POST /api/auth/send-verification-code
   └─ POST /api/auth/login-by-code

4. 七天免密登录流程
   ├─ POST /api/auth/login (获取token)
   ├─ POST /api/auth/check-auto-login
   └─ POST /api/auth/auto-login

5. 用户信息接口
   ├─ GET /api/auth/profile
   └─ GET /api/auth/user-info

6. 管理员流程
   ├─ POST /api/auth/admin/quick-register
   ├─ POST /api/auth/login (管理员)
   ├─ GET /api/auth/admin/users
   └─ GET /api/admin/posts/pending

7. 退出登录
   └─ POST /api/auth/logout
```

---

## 📊 测试用例表格

### 密码登录测试用例

| 用例ID | 测试场景 | 输入参数 | 预期结果 | 实际结果 |
|--------|---------|---------|---------|---------|
| TC001 | 用户正常登录 | phone: 13800138000<br>password: password123<br>userType: user | code: 200, 返回token | ✅ |
| TC002 | 管理员正常登录 | phone: 18888888888<br>password: 123123<br>userType: admin | code: 200, 返回token | ✅ |
| TC003 | 手机号不存在 | phone: 19999999999<br>password: xxx<br>userType: user | code: 401, 手机号或密码错误 | ✅ |
| TC004 | 密码错误 | phone: 13800138000<br>password: wrongpass<br>userType: user | code: 401, 手机号或密码错误 | ✅ |
| TC005 | userType错误 | phone: 13800138000<br>password: password123<br>userType: xxx | code: 400, 无效的用户类型 | ✅ |
| TC006 | 缺少phone | password: password123<br>userType: user | code: 400, 手机号不能为空 | ✅ |
| TC007 | 手机号格式错误 | phone: 12345<br>password: password123<br>userType: user | code: 400, 手机号格式不正确 | ✅ |

### 验证码登录测试用例

| 用例ID | 测试场景 | 输入参数 | 预期结果 | 实际结果 |
|--------|---------|---------|---------|---------|
| VC001 | 发送验证码成功 | phone: 13800138000 | code: 200, 验证码已发送 | ✅ |
| VC002 | 验证码登录成功 | phone: 13800138000<br>code: 123456<br>userType: user | code: 200, 返回token | ✅ |
| VC003 | 验证码错误 | phone: 13800138000<br>code: 000000<br>userType: user | code: 400, 验证码错误 | ✅ |
| VC004 | 验证码过期 | phone: 13800138000<br>code: (5分钟前的)<br>userType: user | code: 400, 验证码已过期 | ✅ |

---

## 📝 测试报告模板

```markdown
# API测试报告

## 测试信息
- **测试日期**: 2025-11-02
- **测试人员**: XXX
- **测试环境**: 本地开发环境
- **后端地址**: http://localhost:8081

## 测试结果汇总

| 模块 | 总用例数 | 通过 | 失败 | 通过率 |
|------|---------|------|------|--------|
| 密码登录 | 7 | 7 | 0 | 100% |
| 验证码登录 | 4 | 4 | 0 | 100% |
| 七天免密登录 | 3 | 3 | 0 | 100% |
| 用户注册 | 5 | 5 | 0 | 100% |
| **总计** | **19** | **19** | **0** | **100%** |

## 问题记录

### 问题1: 无

---

## 测试结论

✅ 所有登录接口功能正常，可以发布到生产环境。
```

---

## 🚀 高级技巧

### 1. 批量测试自动化

使用 Newman 命令行工具批量执行测试：

```bash
# 安装Newman
npm install -g newman

# 运行测试集合
newman run 旅游平台-登录接口测试.postman_collection.json \
  --environment 本地环境.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

---

### 2. 使用环境变量切换环境

创建多个环境：

**开发环境**:
```json
{
  "baseUrl": "http://localhost:8081"
}
```

**测试环境**:
```json
{
  "baseUrl": "http://test.example.com:8081"
}
```

**生产环境**:
```json
{
  "baseUrl": "https://api.example.com"
}
```

---

### 3. 使用Pre-request Script动态生成数据

```javascript
// 生成随机手机号
const randomPhone = '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
pm.environment.set('randomPhone', randomPhone);

// 生成时间戳
pm.environment.set('timestamp', Date.now());

// 使用
// Body中: { "phone": "{{randomPhone}}" }
```

---

## 🎓 学习资源

- [Postman官方文档](https://learning.postman.com/)
- [JWT Token详解](https://jwt.io/)
- [Spring Security文档](https://spring.io/projects/spring-security)

---

## 📞 技术支持

如有问题，请联系：
- 项目文档：查看项目根目录下的其他.md文件
- 后端日志：查看IDEA/Eclipse控制台输出

---

**文档结束** 🎉

**版本历史**:
- v2.0 (2025-11-02): 新增七天免密登录、完整测试流程、最佳实践
- v1.0 (2025-10-31): 初始版本


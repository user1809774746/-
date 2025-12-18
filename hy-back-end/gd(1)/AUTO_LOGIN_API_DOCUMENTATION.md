# 七天免密登录接口文档

## 概述

本文档描述了七天免密登录功能的相关API接口。用户在成功登录后，可以在七天内使用手机号直接登录，无需输入密码或验证码。

## 功能特性

- ✅ **自动过期机制**：基于用户最后登录时间，超过7天自动失效
- ✅ **安全验证**：每次免密登录都会更新最后登录时间，重置7天计时
- ✅ **JWT令牌**：免密登录成功后生成新的7天有效期JWT令牌
- ✅ **登录通知**：支持登录成功后的推送通知
- ✅ **用户类型支持**：同时支持普通用户和管理员

## 接口列表

### 1. 七天免密登录

**接口地址：** `POST /api/auth/auto-login`

**功能描述：** 使用手机号进行七天免密登录

**请求头：**
```
Content-Type: application/json
```

**请求参数：**
```json
{
  "phone": "13800138000",
  "userType": "user"
}
```

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| phone | String | 是 | 用户手机号 |
| userType | String | 是 | 用户类型，支持：user（普通用户）、admin（管理员） |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMzgwMDEzODAwMCIsInVzZXJUeXBlIjoidXNlciIsImlhdCI6MTYzNTc0MDAwMCwiZXhwIjoxNjM2MzQ0ODAwfQ.xxx",
    "userType": "user",
    "phone": "13800138000",
    "loginType": "auto_login"
  }
}
```

**错误响应：**
```json
{
  "code": 403,
  "message": "error",
  "data": "七天免密登录已过期或用户不存在，请重新登录"
}
```

**可能的错误码：**
- `400`: 参数错误（手机号为空、格式错误、用户类型错误等）
- `403`: 七天免密登录已过期或用户不存在
- `500`: 服务器内部错误

---

### 2. 检查七天免密登录状态

**接口地址：** `POST /api/auth/check-auto-login`

**功能描述：** 检查用户是否可以使用七天免密登录

**请求头：**
```
Content-Type: application/json
```

**请求参数：**
```json
{
  "phone": "13800138000",
  "userType": "user"
}
```

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| phone | String | 是 | 用户手机号 |
| userType | String | 是 | 用户类型，支持：user（普通用户）、admin（管理员） |

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
  "message": "error",
  "data": {
    "canAutoLogin": false,
    "phone": "13800138000",
    "userType": "user"
  }
}
```

**可能的错误码：**
- `400`: 参数错误
- `403`: 七天免密登录已过期或用户不存在
- `500`: 服务器内部错误

## 业务逻辑说明

### 1. 七天免密登录的触发条件

- 用户必须已经注册并至少成功登录过一次
- 距离上次登录时间不超过7天（7 × 24 × 60 × 60 × 1000 毫秒）
- 用户账号状态正常

### 2. 时间计算逻辑

```
当前时间 - 最后登录时间 ≤ 7天
```

### 3. 安全机制

- 每次免密登录成功后，会更新用户的最后登录时间
- 重新生成JWT令牌，令牌有效期为7天
- 发送登录通知到配置的推送服务

### 4. 过期处理

- 超过7天后，用户必须重新使用密码或验证码登录
- 登录成功后，七天免密登录功能重新激活

## 前端调用示例

### JavaScript/Ajax 示例

#### 1. 检查是否可以免密登录
```javascript
function checkAutoLogin(phone, userType) {
    return fetch('/api/auth/check-auto-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone: phone,
            userType: userType
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200 && data.data.canAutoLogin) {
            return true;
        }
        return false;
    })
    .catch(error => {
        console.error('检查免密登录状态失败:', error);
        return false;
    });
}
```

#### 2. 执行七天免密登录
```javascript
function autoLogin(phone, userType) {
    return fetch('/api/auth/auto-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone: phone,
            userType: userType
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            // 保存JWT令牌
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('userType', data.data.userType);
            localStorage.setItem('phone', data.data.phone);
            
            console.log('七天免密登录成功');
            return data.data;
        } else {
            throw new Error(data.data || '免密登录失败');
        }
    })
    .catch(error => {
        console.error('免密登录失败:', error);
        throw error;
    });
}
```

#### 3. 完整的登录流程示例
```javascript
async function smartLogin(phone, userType) {
    try {
        // 首先检查是否可以免密登录
        const canAutoLogin = await checkAutoLogin(phone, userType);
        
        if (canAutoLogin) {
            // 可以免密登录
            console.log('检测到七天免密登录可用');
            const loginResult = await autoLogin(phone, userType);
            return {
                success: true,
                loginType: 'auto_login',
                data: loginResult
            };
        } else {
            // 需要密码或验证码登录
            console.log('七天免密登录不可用，需要密码或验证码登录');
            return {
                success: false,
                loginType: 'manual_login',
                message: '需要密码或验证码登录'
            };
        }
    } catch (error) {
        console.error('智能登录检查失败:', error);
        return {
            success: false,
            loginType: 'error',
            message: error.message
        };
    }
}

// 使用示例
smartLogin('13800138000', 'user').then(result => {
    if (result.success) {
        // 免密登录成功，跳转到主页
        window.location.href = '/dashboard';
    } else {
        // 显示登录表单
        showLoginForm();
    }
});
```

### React 示例

```jsx
import React, { useState, useEffect } from 'react';

const SmartLogin = () => {
    const [phone, setPhone] = useState('');
    const [userType, setUserType] = useState('user');
    const [canAutoLogin, setCanAutoLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    // 检查免密登录状态
    const checkAutoLoginStatus = async () => {
        if (!phone) return;
        
        try {
            const response = await fetch('/api/auth/check-auto-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, userType })
            });
            
            const data = await response.json();
            setCanAutoLogin(data.code === 200 && data.data.canAutoLogin);
        } catch (error) {
            console.error('检查免密登录失败:', error);
            setCanAutoLogin(false);
        }
    };

    // 执行免密登录
    const handleAutoLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/auto-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, userType })
            });
            
            const data = await response.json();
            if (data.code === 200) {
                localStorage.setItem('token', data.data.token);
                alert('七天免密登录成功！');
                // 跳转到主页
                window.location.href = '/dashboard';
            } else {
                alert('免密登录失败：' + data.data);
            }
        } catch (error) {
            alert('免密登录失败：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAutoLoginStatus();
    }, [phone, userType]);

    return (
        <div>
            <h2>智能登录</h2>
            <input
                type="text"
                placeholder="手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
            </select>
            
            {canAutoLogin && (
                <div style={{color: 'green', margin: '10px 0'}}>
                    ✅ 检测到七天免密登录可用
                    <button 
                        onClick={handleAutoLogin} 
                        disabled={loading}
                        style={{marginLeft: '10px'}}
                    >
                        {loading ? '登录中...' : '一键登录'}
                    </button>
                </div>
            )}
            
            {!canAutoLogin && phone && (
                <div style={{color: 'orange', margin: '10px 0'}}>
                    ⚠️ 七天免密登录不可用，请使用密码或验证码登录
                </div>
            )}
        </div>
    );
};

export default SmartLogin;
```

## 注意事项

1. **时间精度**：基于毫秒级时间戳计算，确保时间判断的准确性
2. **安全性**：每次免密登录都会重新生成JWT令牌
3. **用户体验**：建议前端先调用检查接口，再决定是否显示免密登录选项
4. **错误处理**：免密登录失败时，应引导用户使用常规登录方式
5. **数据同步**：确保最后登录时间字段在数据库中正确更新

## 测试建议

1. 测试正常的七天免密登录流程
2. 测试超过7天后的过期处理
3. 测试不存在用户的处理
4. 测试网络异常情况的处理
5. 测试并发登录的安全性

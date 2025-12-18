# 顶号机制接口文档

## 概述

本文档描述了经典"顶号"机制的实现，即后登录者胜出的逻辑。当同一用户在不同设备或浏览器上登录时，新的登录会使之前的登录失效，确保同一用户同一时间只能在一个地方保持登录状态。

## 功能特性

- ✅ **后登录者胜出**：新登录会自动使旧登录失效
- ✅ **实时生效**：被顶掉的令牌立即失效，无需等待
- ✅ **用户类型隔离**：普通用户和管理员的令牌分别管理
- ✅ **令牌唯一标识**：每个JWT令牌都有唯一ID
- ✅ **内存管理**：活跃令牌存储在内存中，性能优异
- ✅ **主动注销**：支持用户主动注销当前令牌
- ✅ **管理员监控**：提供令牌统计和清理功能

## 实现原理

### 1. 令牌管理机制

```
用户标识 = 手机号 + ":" + 用户类型
例如：13800138000:user 或 13800138000:admin
```

### 2. 顶号流程

1. **用户登录** → 生成带唯一ID的JWT令牌
2. **检查旧令牌** → 如果该用户已有活跃令牌，则将其标记为失效
3. **设置新令牌** → 将新令牌设为该用户的唯一活跃令牌
4. **实时验证** → 每次API请求都会验证令牌是否为当前活跃令牌

### 3. 验证机制

```
请求 → JWT过滤器 → 验证令牌格式 → 验证令牌是否活跃 → 允许/拒绝访问
```

## 接口列表

### 1. 主动注销令牌

**接口地址：** `POST /api/auth/logout`

**功能描述：** 用户主动注销当前令牌

**请求头：**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**请求参数：** 无

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": "注销成功"
}
```

**错误响应：**
```json
{
  "code": 401,
  "message": "error",
  "data": "用户未登录"
}
```

---

### 2. 获取令牌统计信息（管理员专用）

**接口地址：** `GET /api/auth/admin/token-stats`

**功能描述：** 获取当前活跃令牌的统计信息

**请求头：**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**请求参数：** 无

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "activeTokenCount": 15,
    "totalTokenCount": 15
  }
}
```

**字段说明：**
- `activeTokenCount`: 当前活跃令牌数量
- `totalTokenCount`: 总令牌数量

---

### 3. 清理过期令牌（管理员专用）

**接口地址：** `POST /api/auth/admin/cleanup-tokens`

**功能描述：** 手动清理过期的令牌

**请求头：**
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**请求参数：** 无

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "过期令牌清理完成",
    "timestamp": 1635740000000
  }
}
```

## 顶号机制体验

### 场景演示

1. **用户A在设备1登录**
   ```bash
   POST /api/auth/login
   # 返回令牌A，用户A可以正常访问API
   ```

2. **用户A在设备2登录**
   ```bash
   POST /api/auth/login
   # 返回令牌B，令牌A自动失效
   ```

3. **设备1尝试访问API**
   ```bash
   GET /api/auth/profile
   Authorization: Bearer 令牌A
   # 返回401未授权，因为令牌A已被顶掉
   ```

4. **设备2正常访问API**
   ```bash
   GET /api/auth/profile
   Authorization: Bearer 令牌B
   # 正常返回用户信息
   ```

## 前端集成建议

### 1. 令牌失效处理

```javascript
// 全局axios拦截器
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // 令牌失效，可能被顶号
            console.log('登录已失效，可能在其他设备登录');
            
            // 清除本地存储的令牌
            localStorage.removeItem('token');
            
            // 跳转到登录页面
            window.location.href = '/login';
            
            // 可选：显示友好提示
            alert('您的账号在其他设备登录，当前登录已失效');
        }
        return Promise.reject(error);
    }
);
```

### 2. 主动注销

```javascript
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        if (data.code === 200) {
            console.log('注销成功');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('注销失败:', error);
    }
}
```

### 3. 登录状态检测

```javascript
// 定期检查登录状态
setInterval(async () => {
    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.status === 401) {
            // 令牌已失效
            handleTokenExpired();
        }
    } catch (error) {
        console.error('检查登录状态失败:', error);
    }
}, 60000); // 每分钟检查一次
```

## React示例

```jsx
import React, { useEffect, useState } from 'react';

const LoginManager = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    // 检查登录状态
    const checkLoginStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserInfo(data.data);
                setIsLoggedIn(true);
            } else {
                // 令牌失效
                handleLogout();
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
            handleLogout();
        }
    };

    // 处理注销
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('注销请求失败:', error);
        } finally {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUserInfo(null);
        }
    };

    // 组件挂载时检查登录状态
    useEffect(() => {
        checkLoginStatus();
        
        // 定期检查登录状态
        const interval = setInterval(checkLoginStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {isLoggedIn ? (
                <div>
                    <h3>欢迎，{userInfo?.phone}</h3>
                    <button onClick={handleLogout}>退出登录</button>
                </div>
            ) : (
                <div>
                    <h3>请登录</h3>
                    <button onClick={() => window.location.href = '/login'}>
                        去登录
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoginManager;
```

## 管理员监控示例

```jsx
import React, { useState, useEffect } from 'react';

const TokenManager = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // 获取令牌统计
    const fetchTokenStats = async () => {
        try {
            const response = await fetch('/api/auth/admin/token-stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (data.code === 200) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('获取统计失败:', error);
        }
    };

    // 清理过期令牌
    const cleanupTokens = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/admin/cleanup-tokens', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (data.code === 200) {
                alert('清理完成');
                fetchTokenStats(); // 刷新统计
            }
        } catch (error) {
            console.error('清理失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTokenStats();
        const interval = setInterval(fetchTokenStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h3>令牌管理</h3>
            {stats && (
                <div>
                    <p>活跃令牌数: {stats.activeTokenCount}</p>
                    <p>总令牌数: {stats.totalTokenCount}</p>
                </div>
            )}
            <button onClick={cleanupTokens} disabled={loading}>
                {loading ? '清理中...' : '清理过期令牌'}
            </button>
            <button onClick={fetchTokenStats}>刷新统计</button>
        </div>
    );
};

export default TokenManager;
```

## 注意事项

1. **内存存储**：令牌信息存储在内存中，应用重启后会丢失，用户需要重新登录
2. **集群部署**：如果是多实例部署，需要使用Redis等外部存储来共享令牌状态
3. **性能考虑**：大量用户时建议定期清理过期令牌
4. **安全性**：顶号机制提高了账号安全性，防止账号被盗用
5. **用户体验**：被顶号时应给用户友好的提示信息

## 测试建议

1. 测试同一用户多设备登录的顶号效果
2. 测试主动注销功能
3. 测试令牌过期后的自动清理
4. 测试管理员监控功能
5. 测试高并发登录场景

# 用户头像管理接口文档

## 概述

本文档描述了用户头像上传、获取和管理的相关API接口。所有头像数据直接存储在数据库中，支持jpg、jpeg、png、gif格式的图片。

## 前置条件

- 用户必须已注册并登录
- 请求头中必须包含有效的JWT令牌：`Authorization: Bearer {token}`
- 图片大小限制：最大5MB
- 支持的图片格式：jpg、jpeg、png、gif

## 接口列表

### 1. 上传头像

**接口地址：** `POST /api/auth/upload-avatar`

**功能描述：** 上传用户头像，图片以Base64格式传输并存储到数据库

**请求头：**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**请求参数：**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "imageFormat": "jpg"
}
```

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| imageBase64 | String | 是 | Base64编码的图片数据，可包含或不包含data URI前缀 |
| imageFormat | String | 是 | 图片格式，支持：jpg、jpeg、png、gif |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": "头像上传成功"
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "error",
  "data": "图片大小不能超过5MB"
}
```

**可能的错误码：**
- `401`: 未登录或令牌无效
- `400`: 参数错误（图片数据为空、格式不支持、大小超限等）
- `500`: 服务器内部错误

---

### 2. 获取头像（二进制格式）

**接口地址：** `GET /api/auth/avatar`

**功能描述：** 获取当前用户的头像，返回二进制图片数据

**请求头：**
```
Authorization: Bearer {JWT_TOKEN}
```

**请求参数：** 无

**成功响应：**
- **Content-Type:** `image/jpeg`
- **响应体：** 二进制图片数据

**错误响应：**
```json
{
  "code": 404,
  "message": "error",
  "data": "用户未设置头像"
}
```

**可能的错误码：**
- `401`: 未登录或令牌无效
- `404`: 用户未设置头像
- `500`: 服务器内部错误

---

### 3. 获取头像（Base64格式）

**接口地址：** `GET /api/auth/avatar-base64`

**功能描述：** 获取当前用户的头像，返回Base64编码的图片数据

**请求头：**
```
Authorization: Bearer {JWT_TOKEN}
```

**请求参数：** 无

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "phone": "13800138000"
  }
}
```

**错误响应：**
```json
{
  "code": 404,
  "message": "error",
  "data": "用户未设置头像"
}
```

**可能的错误码：**
- `401`: 未登录或令牌无效
- `404`: 用户未设置头像
- `500`: 服务器内部错误

## 前端调用示例

### JavaScript/Ajax 示例

#### 1. 上传头像
```javascript
// 获取文件输入元素
const fileInput = document.getElementById('avatar-input');
const file = fileInput.files[0];

if (file) {
    // 将文件转换为Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        
        // 获取文件扩展名
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // 发送上传请求
        fetch('/api/auth/upload-avatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                imageBase64: base64Data,
                imageFormat: fileExtension
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                alert('头像上传成功！');
            } else {
                alert('上传失败：' + data.data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('上传失败');
        });
    };
    reader.readAsDataURL(file);
}
```

#### 2. 获取并显示头像（Base64格式）
```javascript
fetch('/api/auth/avatar-base64', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
})
.then(response => response.json())
.then(data => {
    if (data.code === 200) {
        // 显示头像
        const imgElement = document.getElementById('user-avatar');
        imgElement.src = data.data.avatar;
    } else {
        console.log('获取头像失败：' + data.data);
    }
})
.catch(error => {
    console.error('Error:', error);
});
```

#### 3. 获取头像（直接显示二进制格式）
```javascript
// 直接设置img标签的src为接口地址
const imgElement = document.getElementById('user-avatar');
imgElement.src = '/api/auth/avatar';
imgElement.headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
};

// 或者使用fetch获取blob
fetch('/api/auth/avatar', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
})
.then(response => response.blob())
.then(blob => {
    const imageUrl = URL.createObjectURL(blob);
    document.getElementById('user-avatar').src = imageUrl;
})
.catch(error => {
    console.error('Error:', error);
});
```

### React 示例

```jsx
import React, { useState, useEffect } from 'react';

const AvatarUpload = () => {
    const [avatar, setAvatar] = useState(null);
    const [uploading, setUploading] = useState(false);

    // 获取头像
    const fetchAvatar = async () => {
        try {
            const response = await fetch('/api/auth/avatar-base64', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.code === 200) {
                setAvatar(data.data.avatar);
            }
        } catch (error) {
            console.error('获取头像失败:', error);
        }
    };

    // 上传头像
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result;
                const fileExtension = file.name.split('.').pop().toLowerCase();

                const response = await fetch('/api/auth/upload-avatar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        imageBase64: base64Data,
                        imageFormat: fileExtension
                    })
                });

                const data = await response.json();
                if (data.code === 200) {
                    alert('头像上传成功！');
                    fetchAvatar(); // 重新获取头像
                } else {
                    alert('上传失败：' + data.data);
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('上传失败:', error);
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchAvatar();
    }, []);

    return (
        <div>
            <div>
                {avatar ? (
                    <img src={avatar} alt="用户头像" style={{width: '100px', height: '100px', borderRadius: '50%'}} />
                ) : (
                    <div style={{width: '100px', height: '100px', backgroundColor: '#ccc', borderRadius: '50%'}}>
                        暂无头像
                    </div>
                )}
            </div>
            <input 
                type="file" 
                accept="image/jpg,image/jpeg,image/png,image/gif"
                onChange={handleFileUpload}
                disabled={uploading}
            />
            {uploading && <p>上传中...</p>}
        </div>
    );
};

export default AvatarUpload;
```

## 注意事项

1. **图片大小限制**：单个图片最大5MB，建议前端在上传前进行压缩
2. **格式支持**：仅支持jpg、jpeg、png、gif格式
3. **安全性**：所有接口都需要JWT令牌认证
4. **存储方式**：图片直接存储在数据库中，适合小流量应用
5. **性能考虑**：对于高并发场景，建议考虑使用文件存储或CDN
6. **Base64处理**：接口会自动处理带有data URI前缀的Base64数据

## 错误处理

建议前端实现以下错误处理逻辑：

1. **文件大小检查**：上传前检查文件大小
2. **格式验证**：上传前验证文件格式
3. **网络错误**：处理网络请求失败的情况
4. **令牌过期**：处理401错误，引导用户重新登录
5. **用户反馈**：提供清晰的成功/失败提示

## 测试建议

1. 测试不同格式的图片上传
2. 测试超大文件的处理
3. 测试无效Base64数据的处理
4. 测试未登录状态的访问
5. 测试获取不存在头像的情况

# 用户背景图片API文档

## 概述
用户背景图片功能允许用户上传、获取和删除个人主页的背景图片。

## 数据库表结构
表名：`user_background_image`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| user_id | bigint | 用户ID（唯一约束） |
| background_image | longblob | 背景图片数据 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## API接口列表

### 1. 上传/更新背景图片

**接口地址：** `POST /api/user/background-image`

**权限要求：** 需要登录

**请求头：**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体：**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "imageFormat": "jpeg"
}
```

**参数说明：**
- `imageBase64`: Base64编码的图片数据（可包含或不包含data URI前缀）
- `imageFormat`: 图片格式，支持 jpg, jpeg, png, gif

**成功响应：**
```json
{
  "code": 200,
  "message": "背景图片上传成功",
  "data": null
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "图片大小不能超过10MB",
  "data": null
}
```

**注意事项：**
- 图片大小限制：10MB
- 支持的格式：jpg, jpeg, png, gif
- 如果用户已有背景图片，将会更新为新图片

---

### 2. 获取当前用户背景图片（二进制格式）

**接口地址：** `GET /api/user/background-image`

**权限要求：** 需要登录

**请求头：**
```
Authorization: Bearer {token}
```

**成功响应：**
- Content-Type: image/jpeg
- Body: 图片的二进制数据

**使用示例：**
```html
<img src="http://localhost:8080/api/user/background-image" />
```

---

### 3. 获取当前用户背景图片（Base64格式）

**接口地址：** `GET /api/user/background-image-base64`

**权限要求：** 需要登录

**请求头：**
```
Authorization: Bearer {token}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "backgroundImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "phone": "13800138000"
  }
}
```

**使用示例：**
```html
<img :src="response.data.backgroundImage" />
```

---

### 4. 根据用户ID获取背景图片（Base64格式）

**接口地址：** `GET /api/user/{userId}/background-image-base64`

**权限要求：** 无需登录（公开接口）

**路径参数：**
- `userId`: 用户ID

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "backgroundImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "userId": 123
  }
}
```

**使用场景：** 查看其他用户的主页背景图片

---

### 5. 根据用户ID获取背景图片（二进制格式）

**接口地址：** `GET /api/user/{userId}/background-image`

**权限要求：** 无需登录（公开接口）

**路径参数：**
- `userId`: 用户ID

**成功响应：**
- Content-Type: image/jpeg
- Body: 图片的二进制数据

**使用示例：**
```html
<img src="http://localhost:8080/api/user/123/background-image" />
```

---

### 6. 删除当前用户背景图片

**接口地址：** `DELETE /api/user/background-image`

**权限要求：** 需要登录

**请求头：**
```
Authorization: Bearer {token}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "背景图片删除成功",
  "data": null
}
```

---

### 7. 检查当前用户是否已设置背景图片

**接口地址：** `GET /api/user/background-image/exists`

**权限要求：** 需要登录

**请求头：**
```
Authorization: Bearer {token}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "exists": true
  }
}
```

---

## 前端集成示例

### Vue.js 示例

#### 上传背景图片
```javascript
async function uploadBackgroundImage(file) {
  // 将文件转换为Base64
  const reader = new FileReader();
  reader.readAsDataURL(file);
  
  reader.onload = async () => {
    const base64String = reader.result;
    const imageFormat = file.type.split('/')[1]; // 获取图片格式
    
    const response = await fetch('http://localhost:8080/api/user/background-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        imageBase64: base64String,
        imageFormat: imageFormat
      })
    });
    
    const result = await response.json();
    if (result.code === 200) {
      console.log('背景图片上传成功');
    }
  };
}

// 使用示例
document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    uploadBackgroundImage(file);
  }
});
```

#### 获取并显示背景图片
```javascript
async function getBackgroundImage() {
  const response = await fetch('http://localhost:8080/api/user/background-image-base64', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    // 设置背景图片
    document.getElementById('profileBg').src = result.data.backgroundImage;
  }
}
```

### React 示例

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile() {
  const [backgroundImage, setBackgroundImage] = useState(null);
  
  // 获取背景图片
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/user/background-image-base64',
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setBackgroundImage(response.data.data.backgroundImage);
      } catch (error) {
        console.log('用户未设置背景图片');
      }
    };
    
    fetchBackgroundImage();
  }, []);
  
  // 上传背景图片
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      const imageFormat = file.type.split('/')[1];
      
      try {
        await axios.post(
          'http://localhost:8080/api/user/background-image',
          {
            imageBase64: reader.result,
            imageFormat: imageFormat
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setBackgroundImage(reader.result);
        alert('背景图片上传成功');
      } catch (error) {
        alert('上传失败: ' + error.response.data.message);
      }
    };
  };
  
  return (
    <div>
      <div 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          width: '100%',
          height: '300px'
        }}
      >
        <h1>用户主页</h1>
      </div>
      
      <input 
        type="file" 
        accept="image/jpeg,image/png,image/gif"
        onChange={handleUpload} 
      />
    </div>
  );
}

export default UserProfile;
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或token无效 |
| 404 | 用户未设置背景图片 |
| 500 | 服务器内部错误 |

---

## 注意事项

1. **图片大小限制**：背景图片最大10MB，超过限制将返回错误
2. **支持的格式**：仅支持 jpg, jpeg, png, gif 格式
3. **唯一性约束**：每个用户只能设置一张背景图片，重复上传会覆盖旧图片
4. **权限控制**：上传、删除需要登录；查看支持公开访问
5. **Base64传输**：上传时可以包含data URI前缀（如 `data:image/jpeg;base64,`），也可以不包含
6. **级联删除**：如果用户被删除，其背景图片记录也会自动删除

---

## 测试指南

### 使用 Postman 测试

#### 1. 上传背景图片
1. 创建POST请求：`http://localhost:8080/api/user/background-image`
2. 添加Header：`Authorization: Bearer {你的token}`
3. 选择Body -> raw -> JSON
4. 输入：
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "imageFormat": "jpeg"
}
```

#### 2. 获取背景图片（Base64）
1. 创建GET请求：`http://localhost:8080/api/user/background-image-base64`
2. 添加Header：`Authorization: Bearer {你的token}`
3. 发送请求

#### 3. 获取背景图片（二进制）
1. 创建GET请求：`http://localhost:8080/api/user/background-image`
2. 添加Header：`Authorization: Bearer {你的token}`
3. 发送请求
4. 在Preview标签页查看图片

---

## 部署说明

### 1. 执行SQL建表语句
```sql
-- 在数据库中执行 user_background_image.sql 文件
source user_background_image.sql;
```

### 2. 重启后端服务
```bash
mvn clean package
java -jar target/auth-system.jar
```

### 3. 验证接口
```bash
# 检查接口是否可用
curl -X GET http://localhost:8080/api/user/background-image/exists \
  -H "Authorization: Bearer {token}"
```

---

## 常见问题

### Q1: 上传失败，提示"图片数据不能为空"
**A:** 检查前端是否正确转换文件为Base64格式，确保`imageBase64`字段有值。

### Q2: 图片显示不完整或失真
**A:** 检查图片格式是否正确，建议使用jpg或png格式。确保Base64编码完整。

### Q3: 获取图片时返回404
**A:** 用户尚未上传背景图片，需要先调用上传接口。

### Q4: token无效
**A:** 检查token是否过期，或者用户是否已登录。需要先调用登录接口获取有效token。

---

## 更新日志

### v1.0.0 (2025-12-05)
- ✅ 创建用户背景图片数据表
- ✅ 实现背景图片上传/更新接口
- ✅ 实现背景图片获取接口（二进制和Base64两种格式）
- ✅ 实现背景图片删除接口
- ✅ 实现背景图片存在性检查接口
- ✅ 支持根据用户ID公开查看背景图片
- ✅ 添加完整的API文档和测试指南

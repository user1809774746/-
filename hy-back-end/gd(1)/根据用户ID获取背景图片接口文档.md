# 根据用户ID获取背景图片接口文档

## 接口概述
通过用户ID获取指定用户的背景图片，支持Base64格式和二进制格式两种返回方式。

---

## 1. 获取背景图片（Base64格式）

### 接口信息
**接口地址**：`GET /api/user/{userId}/background-image-base64`

**请求方式**：GET

**是否需要登录**：否

**接口说明**：根据用户ID获取该用户设置的背景图片，以Base64格式返回，适合前端直接使用在CSS或img标签中。

---

### 请求参数

#### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

#### 请求示例
```
GET /api/user/123/background-image-base64
```

---

### 响应结果

#### 成功响应（200）
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "backgroundImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCADIAMgDASIAAhEBAxEB...",
    "userId": 123
  }
}
```

#### 错误响应

**用户未设置背景图片（404）**
```json
{
  "code": 404,
  "message": "用户未设置背景图片",
  "data": null
}
```

**服务器错误（500）**
```json
{
  "code": 500,
  "message": "获取背景图片失败: 具体错误信息",
  "data": null
}
```

---

### 返回字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 响应状态码（200=成功，404=未找到，500=服务器错误） |
| message | String | 响应消息 |
| data | Object | 响应数据 |
| data.backgroundImage | String | Base64格式的背景图片（包含data:image/jpeg;base64,前缀） |
| data.userId | Long | 用户ID |

---

### 前端使用示例

#### JavaScript (Axios)
```javascript
// 获取用户ID为123的背景图片
axios.get('/api/user/123/background-image-base64')
  .then(response => {
    if (response.data.code === 200) {
      const bgImage = response.data.data.backgroundImage;
      console.log('背景图片获取成功');
      
      // 方式1：设置为div背景
      document.getElementById('userProfile').style.backgroundImage = `url(${bgImage})`;
      
      // 方式2：设置为img标签
      document.getElementById('bgImg').src = bgImage;
    }
  })
  .catch(error => {
    if (error.response?.data?.code === 404) {
      console.log('该用户未设置背景图片');
    } else {
      console.error('获取失败:', error);
    }
  });
```

#### Vue 3 示例
```vue
<template>
  <div class="user-profile" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="user-info">
      <h2>{{ username }}</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const backgroundImage = ref('');
const username = ref('');

const loadUserBackground = async (userId) => {
  try {
    const response = await axios.get(`/api/user/${userId}/background-image-base64`);
    if (response.data.code === 200) {
      backgroundImage.value = response.data.data.backgroundImage;
    }
  } catch (error) {
    if (error.response?.data?.code === 404) {
      // 使用默认背景
      backgroundImage.value = 'url(/default-bg.jpg)';
    }
  }
};

onMounted(() => {
  const userId = 123; // 从路由或props获取
  loadUserBackground(userId);
});
</script>

<style scoped>
.user-profile {
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
  position: relative;
}
</style>
```

#### React 示例
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile({ userId }) {
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const response = await axios.get(`/api/user/${userId}/background-image-base64`);
        if (response.data.code === 200) {
          setBackgroundImage(response.data.data.backgroundImage);
        }
      } catch (error) {
        if (error.response?.data?.code === 404) {
          // 使用默认背景
          setBackgroundImage('/default-bg.jpg');
        }
      }
    };

    fetchBackground();
  }, [userId]);

  return (
    <div 
      className="user-profile"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '300px'
      }}
    >
      <div className="user-info">
        {/* 用户信息 */}
      </div>
    </div>
  );
}

export default UserProfile;
```

---

## 2. 获取背景图片（二进制格式）

### 接口信息
**接口地址**：`GET /api/user/{userId}/background-image`

**请求方式**：GET

**是否需要登录**：否

**接口说明**：根据用户ID获取该用户设置的背景图片，以二进制数据流返回，适合直接在img标签的src中使用。

---

### 请求参数

#### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

#### 请求示例
```
GET /api/user/123/background-image
```

---

### 响应结果

#### 成功响应（200）
**响应头**：
- Content-Type: image/jpeg
- Content-Length: 图片字节大小

**响应体**：图片二进制数据

#### 错误响应（404）
```json
{
  "code": 404,
  "message": "用户未设置背景图片",
  "data": null
}
```

---

### 前端使用示例

#### HTML
```html
<!-- 直接在img标签中使用 -->
<img src="http://localhost:8080/api/user/123/background-image" 
     alt="用户背景图片" 
     style="width: 100%; height: 300px; object-fit: cover;">

<!-- 作为div背景 -->
<div style="background-image: url('http://localhost:8080/api/user/123/background-image'); 
            width: 100%; 
            height: 300px; 
            background-size: cover;">
</div>
```

#### Vue 示例
```vue
<template>
  <div>
    <!-- 方式1：直接使用 -->
    <img :src="getBackgroundImageUrl(userId)" alt="背景图片" />
    
    <!-- 方式2：动态背景 -->
    <div :style="{ backgroundImage: `url(${getBackgroundImageUrl(userId)})` }">
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['userId']);

const getBackgroundImageUrl = (userId) => {
  return `/api/user/${userId}/background-image`;
};
</script>
```

#### 图片加载处理
```javascript
// 检测图片是否加载成功
const img = new Image();
img.src = `/api/user/${userId}/background-image`;

img.onload = () => {
  console.log('背景图片加载成功');
  document.getElementById('userBg').src = img.src;
};

img.onerror = () => {
  console.log('背景图片加载失败，使用默认图片');
  document.getElementById('userBg').src = '/default-bg.jpg';
};
```

---

## 使用场景对比

### Base64格式（推荐场景）
✅ 需要在CSS中动态设置背景  
✅ 需要将图片数据缓存在localStorage/sessionStorage  
✅ 需要对图片数据进行进一步处理  
✅ 单页应用中频繁切换用户背景  

**优点**：
- 可以直接缓存到前端
- 便于在代码中处理
- 减少HTTP请求

**缺点**：
- 响应体积较大（Base64编码会增加约33%体积）
- 不利于浏览器缓存

### 二进制格式（推荐场景）
✅ 直接在HTML标签中使用  
✅ 利用浏览器图片缓存  
✅ 对性能要求较高的场景  

**优点**：
- 响应体积小
- 浏览器自动缓存
- 加载速度快

**缺点**：
- 每次都需要发起HTTP请求
- 不便于在JavaScript中处理

---

## 完整应用示例

### 用户个人主页背景图展示
```vue
<template>
  <div class="user-homepage">
    <!-- 背景图区域 -->
    <div 
      class="background-section"
      :style="backgroundStyle"
    >
      <div class="overlay"></div>
      <div class="user-header">
        <img :src="userAvatar" alt="头像" class="avatar" />
        <h1>{{ username }}</h1>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-section">
      <!-- 用户内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps(['userId']);

const backgroundImage = ref('');
const username = ref('');
const userAvatar = ref('');
const hasBackground = ref(false);

// 计算背景样式
const backgroundStyle = computed(() => {
  if (hasBackground.value && backgroundImage.value) {
    return {
      backgroundImage: `url(${backgroundImage.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  } else {
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
  }
});

// 加载用户背景图
const loadUserBackground = async () => {
  try {
    const response = await axios.get(`/api/user/${props.userId}/background-image-base64`);
    if (response.data.code === 200) {
      backgroundImage.value = response.data.data.backgroundImage;
      hasBackground.value = true;
    }
  } catch (error) {
    if (error.response?.data?.code === 404) {
      console.log('用户未设置背景图片，使用默认渐变背景');
      hasBackground.value = false;
    } else {
      console.error('加载背景图片失败:', error);
    }
  }
};

onMounted(() => {
  loadUserBackground();
});
</script>

<style scoped>
.background-section {
  width: 100%;
  height: 400px;
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
}

.user-header {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  margin-bottom: 20px;
}
</style>
```

---

## 注意事项

1. **无需登录**：此接口可以公开访问，任何人都可以查看其他用户的背景图片

2. **隐私考虑**：如果需要隐私保护，建议在后端添加权限检查

3. **图片大小**：后端限制单张背景图片最大10MB

4. **支持格式**：jpg、jpeg、png、gif

5. **错误处理**：前端应该处理404错误，提供默认背景图片

6. **性能优化**：
   - Base64格式适合需要缓存的场景
   - 二进制格式适合直接展示的场景
   - 建议根据实际需求选择合适的格式

7. **浏览器缓存**：二进制格式接口会自动利用浏览器缓存机制

---

## 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 成功 | 正常显示背景图片 |
| 404 | 用户未设置背景图片 | 显示默认背景或渐变色 |
| 500 | 服务器内部错误 | 提示用户稍后重试 |

---

## 相关接口

- `POST /api/user/background-image` - 上传/更新当前用户背景图片
- `GET /api/user/background-image-base64` - 获取当前登录用户背景图片（Base64）
- `GET /api/user/background-image` - 获取当前登录用户背景图片（二进制）
- `DELETE /api/user/background-image` - 删除当前用户背景图片
- `GET /api/user/background-image/exists` - 检查当前用户是否已设置背景图片

---

## 测试示例

### cURL 测试
```bash
# 测试Base64格式
curl -X GET "http://localhost:8080/api/user/123/background-image-base64"

# 测试二进制格式（下载到文件）
curl -X GET "http://localhost:8080/api/user/123/background-image" \
  -o user_background.jpg

# 测试不存在的用户
curl -X GET "http://localhost:8080/api/user/99999/background-image-base64"
```

### Postman 测试
1. 创建GET请求
2. 输入URL：`http://localhost:8080/api/user/123/background-image-base64`
3. 点击Send
4. 查看返回的JSON数据

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2024-12-06 | 1.0 | 初始版本，完整接口文档 |

---

## 技术支持

如有问题，请联系后端开发团队。

# 🖼️ 用户背景图片功能 - 快速开始

## ✅ 已完成的工作

### 1. 数据库表
- ✅ 创建 `user_background_image.sql` - 用户背景图片表结构

### 2. 后端代码
- ✅ `UserBackgroundImage.java` - 实体类
- ✅ `UserBackgroundImageRepository.java` - 数据访问层
- ✅ `UserBackgroundImageService.java` - 业务逻辑层
- ✅ `UserBackgroundImageController.java` - API控制器
- ✅ `BackgroundImageUploadRequest.java` - 请求DTO

### 3. 接口功能
- ✅ 上传/更新背景图片
- ✅ 获取当前用户背景图片（Base64格式）
- ✅ 获取当前用户背景图片（二进制格式）
- ✅ 根据用户ID获取背景图片（Base64格式）
- ✅ 根据用户ID获取背景图片（二进制格式）
- ✅ 删除背景图片
- ✅ 检查背景图片是否存在

### 4. 文档和测试工具
- ✅ `BACKGROUND_IMAGE_API_DOCUMENTATION.md` - 完整API文档
- ✅ `test_background_image.html` - 可视化测试工具

---

## 🚀 快速部署步骤

### 第一步：执行数据库建表语句

```bash
# 进入MySQL
mysql -u root -p

# 选择数据库
use gd_mcp;

# 执行建表语句
source user_background_image.sql;

# 验证表是否创建成功
DESC user_background_image;
```

或者在MySQL客户端中直接执行：
```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user_background_image`;
CREATE TABLE `user_background_image` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '背景图片记录ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `background_image` longblob NOT NULL COMMENT '背景图片数据',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_id` (`user_id`) USING BTREE COMMENT '每个用户只能有一张背景图',
  CONSTRAINT `fk_user_background_image_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户背景图片表' ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
```

### 第二步：重新编译项目

```bash
# 在项目根目录执行
mvn clean package

# 或者如果使用IDE，点击 Run -> Reload Maven Project
```

### 第三步：重启后端服务

```bash
# 停止当前运行的服务（如果有）
# 然后启动服务
java -jar target/auth-system.jar

# 或者在IDE中直接点击运行按钮
```

### 第四步：验证接口

打开 `test_background_image.html` 文件进行测试：

1. 双击打开 `test_background_image.html` 文件
2. 输入手机号和密码，点击"登录"获取token
3. 选择一张图片，点击"上传背景图片"
4. 点击"获取背景图片(Base64)"查看是否上传成功
5. 测试其他功能

---

## 📝 API接口速查

| 接口 | 方法 | 地址 | 需要登录 |
|------|------|------|---------|
| 上传背景图片 | POST | `/api/user/background-image` | ✅ |
| 获取背景图片(二进制) | GET | `/api/user/background-image` | ✅ |
| 获取背景图片(Base64) | GET | `/api/user/background-image-base64` | ✅ |
| 删除背景图片 | DELETE | `/api/user/background-image` | ✅ |
| 检查是否存在 | GET | `/api/user/background-image/exists` | ✅ |
| 查看他人背景(二进制) | GET | `/api/user/{userId}/background-image` | ❌ |
| 查看他人背景(Base64) | GET | `/api/user/{userId}/background-image-base64` | ❌ |

---

## 🧪 快速测试（使用curl）

### 1. 先登录获取token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"18831231517","password":"your_password"}'
```

### 2. 上传背景图片
```bash
# 先将图片转换为Base64
base64 your_image.jpg > image_base64.txt

# 然后上传
curl -X POST http://localhost:8080/api/user/background-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,YOUR_BASE64_STRING",
    "imageFormat": "jpeg"
  }'
```

### 3. 获取背景图片
```bash
curl -X GET http://localhost:8080/api/user/background-image-base64 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. 检查是否存在
```bash
curl -X GET http://localhost:8080/api/user/background-image/exists \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. 删除背景图片
```bash
curl -X DELETE http://localhost:8080/api/user/background-image \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 前端集成示例

### HTML + JavaScript
```html
<!-- 上传背景图片 -->
<input type="file" id="bgImageInput" accept="image/*">
<button onclick="uploadBgImage()">上传背景图片</button>

<!-- 显示背景图片 -->
<div id="profileBackground" style="width:100%; height:300px; background-size:cover;"></div>

<script>
async function uploadBgImage() {
  const file = document.getElementById('bgImageInput').files[0];
  const reader = new FileReader();
  
  reader.onload = async () => {
    const response = await fetch('http://localhost:8080/api/user/background-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        imageBase64: reader.result,
        imageFormat: file.type.split('/')[1]
      })
    });
    
    const result = await response.json();
    if (result.code === 200) {
      alert('上传成功');
      loadBgImage();
    }
  };
  
  reader.readAsDataURL(file);
}

async function loadBgImage() {
  const response = await fetch('http://localhost:8080/api/user/background-image-base64', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const result = await response.json();
  if (result.code === 200) {
    document.getElementById('profileBackground').style.backgroundImage = 
      `url(${result.data.backgroundImage})`;
  }
}
</script>
```

### Vue.js 3
```vue
<template>
  <div class="user-profile">
    <div 
      class="background-image"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    >
      <h1>用户主页</h1>
    </div>
    
    <input 
      type="file" 
      @change="handleUpload"
      accept="image/jpeg,image/png,image/gif"
    >
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const backgroundImage = ref('');
const API_BASE = 'http://localhost:8080/api/user';

// 加载背景图片
const loadBackgroundImage = async () => {
  try {
    const response = await axios.get(`${API_BASE}/background-image-base64`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data.code === 200) {
      backgroundImage.value = response.data.data.backgroundImage;
    }
  } catch (error) {
    console.log('用户未设置背景图片');
  }
};

// 上传背景图片
const handleUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.readAsDataURL(file);
  
  reader.onload = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/background-image`,
        {
          imageBase64: reader.result,
          imageFormat: file.type.split('/')[1]
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.code === 200) {
        backgroundImage.value = reader.result;
        alert('背景图片上传成功');
      }
    } catch (error) {
      alert('上传失败: ' + error.message);
    }
  };
};

onMounted(() => {
  loadBackgroundImage();
});
</script>

<style scoped>
.background-image {
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>
```

### React
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile() {
  const [backgroundImage, setBackgroundImage] = useState('');
  const API_BASE = 'http://localhost:8080/api/user';
  
  // 加载背景图片
  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/background-image-base64`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.code === 200) {
          setBackgroundImage(response.data.data.backgroundImage);
        }
      } catch (error) {
        console.log('用户未设置背景图片');
      }
    };
    
    fetchBackground();
  }, []);
  
  // 上传背景图片
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      try {
        await axios.post(
          `${API_BASE}/background-image`,
          {
            imageBase64: reader.result,
            imageFormat: file.type.split('/')[1]
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
        alert('上传失败: ' + error.message);
      }
    };
  };
  
  return (
    <div>
      <div 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
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

## ⚠️ 注意事项

1. **图片大小限制**：背景图片最大10MB
2. **支持格式**：jpg, jpeg, png, gif
3. **唯一性约束**：每个用户只能设置一张背景图片
4. **权限控制**：
   - 上传、删除、获取自己的背景图片需要登录
   - 查看他人的背景图片不需要登录（公开）
5. **级联删除**：用户被删除时，其背景图片也会自动删除

---

## 🐛 常见问题

### 问题1：建表失败，提示外键约束错误
**解决方案**：确保 `user_info` 表已存在，且 `UserID` 字段存在。

### 问题2：上传后无法获取图片
**解决方案**：检查token是否有效，可以先测试"检查是否存在"接口。

### 问题3：图片显示不出来
**解决方案**：
- 检查Base64数据是否完整
- 检查图片格式是否正确
- 尝试使用二进制接口获取

### 问题4：接口返回401未授权
**解决方案**：
- 检查token是否正确
- 检查token是否过期
- 重新登录获取新token

---

## 📞 支持

如果遇到问题，请检查：

1. ✅ 数据库表是否创建成功
2. ✅ 后端服务是否正常启动
3. ✅ Token是否有效
4. ✅ 图片格式和大小是否符合要求

详细文档请查看：`BACKGROUND_IMAGE_API_DOCUMENTATION.md`

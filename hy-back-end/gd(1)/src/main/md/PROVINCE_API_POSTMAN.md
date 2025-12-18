# 省份管理API - Postman调试文档

## 基础信息

**Base URL**: `http://localhost:8082`

**Content-Type**: `application/json`

---

## 1. 根据省份名称获取照片

### 请求信息
- **方法**: `GET`
- **URL**: `http://localhost:8082/api/provinces/photo?name=北京`
- **描述**: 根据省份名称获取该省份的照片URL

### 请求参数
| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| name | String | Query | 是 | 省份名称，如"北京" |

### Postman配置步骤
1. 创建新请求，选择 `GET` 方法
2. 输入URL: `http://localhost:8082/api/provinces/photo`
3. 在 `Params` 标签中添加：
   - Key: `name`
   - Value: `北京`

### 请求示例
```
GET http://localhost:8082/api/provinces/photo?name=北京
```

### 成功响应 (200)
```json
{
    "success": true,
    "provinceName": "北京",
    "photoUrl": "/images/provinces/BeiJing.jpg"
}
```

### 失败响应 (404)
```json
{
    "success": false,
    "message": "未找到该省份信息"
}
```

### 完整照片访问URL
```
http://localhost:8082/images/provinces/BeiJing.jpg
```

---

## 2. 获取完整省份信息

### 请求信息
- **方法**: `GET`
- **URL**: `http://localhost:8082/api/provinces/detail?name=北京`
- **描述**: 根据省份名称获取完整的省份信息（包含ID、创建时间等）

### 请求参数
| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| name | String | Query | 是 | 省份名称，如"北京" |

### Postman配置步骤
1. 创建新请求，选择 `GET` 方法
2. 输入URL: `http://localhost:8082/api/provinces/detail`
3. 在 `Params` 标签中添加：
   - Key: `name`
   - Value: `北京`

### 请求示例
```
GET http://localhost:8082/api/provinces/detail?name=北京
```

### 成功响应 (200)
```json
{
    "success": true,
    "data": {
        "provinceId": 1,
        "provinceName": "北京",
        "provincePhotoUrl": "/images/provinces/BeiJing.jpg",
        "createdAt": "2025-12-04T09:20:00",
        "updatedAt": "2025-12-04T09:20:00"
    }
}
```

### 失败响应 (404)
```json
{
    "success": false,
    "message": "未找到该省份信息"
}
```

---

## 3. 获取所有省份列表

### 请求信息
- **方法**: `GET`
- **URL**: `http://localhost:8082/api/provinces/all`
- **描述**: 获取数据库中所有省份的列表

### 请求参数
无

### Postman配置步骤
1. 创建新请求，选择 `GET` 方法
2. 输入URL: `http://localhost:8082/api/provinces/all`
3. 直接发送请求

### 请求示例
```
GET http://localhost:8082/api/provinces/all
```

### 成功响应 (200)
```json
{
    "success": true,
    "total": 26,
    "data": [
        {
            "provinceId": 1,
            "provinceName": "安徽",
            "provincePhotoUrl": "/images/provinces/AnHui.jpg",
            "createdAt": "2025-12-04T09:20:00",
            "updatedAt": "2025-12-04T09:20:00"
        },
        {
            "provinceId": 2,
            "provinceName": "北京",
            "provincePhotoUrl": "/images/provinces/BeiJing.jpg",
            "createdAt": "2025-12-04T09:20:00",
            "updatedAt": "2025-12-04T09:20:00"
        }
        // ... 其他省份
    ]
}
```

### 失败响应 (500)
```json
{
    "success": false,
    "message": "获取省份列表失败: [错误信息]"
}
```

---

## 4. 添加省份

### 请求信息
- **方法**: `POST`
- **URL**: `http://localhost:8082/api/provinces`
- **Content-Type**: `application/json`
- **描述**: 添加新的省份记录

### 请求参数
| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| provinceName | String | Body | 是 | 省份名称 |
| provincePhotoUrl | String | Body | 否 | 照片URL |

### Postman配置步骤
1. 创建新请求，选择 `POST` 方法
2. 输入URL: `http://localhost:8082/api/provinces`
3. 选择 `Body` 标签 → 选择 `raw` → 选择 `JSON`
4. 输入请求体

### 请求体示例
```json
{
    "provinceName": "广东",
    "provincePhotoUrl": "/images/provinces/GuangDong.jpg"
}
```

### 成功响应 (201)
```json
{
    "success": true,
    "message": "省份添加成功",
    "data": {
        "provinceId": 27,
        "provinceName": "广东",
        "provincePhotoUrl": "/images/provinces/GuangDong.jpg",
        "createdAt": "2025-12-04T09:25:00",
        "updatedAt": "2025-12-04T09:25:00"
    }
}
```

### 失败响应 (400)
```json
{
    "success": false,
    "message": "省份名称已存在"
}
```

---

## 5. 更新省份信息

### 请求信息
- **方法**: `PUT`
- **URL**: `http://localhost:8082/api/provinces/{id}`
- **Content-Type**: `application/json`
- **描述**: 更新指定ID的省份信息

### 请求参数
| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| id | Long | Path | 是 | 省份ID |
| provinceName | String | Body | 否 | 省份名称 |
| provincePhotoUrl | String | Body | 否 | 照片URL |

### Postman配置步骤
1. 创建新请求，选择 `PUT` 方法
2. 输入URL: `http://localhost:8082/api/provinces/1` （将1替换为实际ID）
3. 选择 `Body` 标签 → 选择 `raw` → 选择 `JSON`
4. 输入请求体

### 请求体示例
```json
{
    "provinceName": "北京市",
    "provincePhotoUrl": "/images/provinces/BeiJing-new.jpg"
}
```

或只更新照片URL：
```json
{
    "provincePhotoUrl": "/images/provinces/BeiJing-updated.jpg"
}
```

### 成功响应 (200)
```json
{
    "success": true,
    "message": "省份更新成功",
    "data": {
        "provinceId": 1,
        "provinceName": "北京市",
        "provincePhotoUrl": "/images/provinces/BeiJing-new.jpg",
        "createdAt": "2025-12-04T09:20:00",
        "updatedAt": "2025-12-04T09:30:00"
    }
}
```

### 失败响应 (400)
```json
{
    "success": false,
    "message": "省份不存在"
}
```

或
```json
{
    "success": false,
    "message": "省份名称已存在"
}
```

---

## 6. 删除省份

### 请求信息
- **方法**: `DELETE`
- **URL**: `http://localhost:8082/api/provinces/{id}`
- **描述**: 删除指定ID的省份记录

### 请求参数
| 参数名 | 类型 | 位置 | 必填 | 说明 |
|--------|------|------|------|------|
| id | Long | Path | 是 | 省份ID |

### Postman配置步骤
1. 创建新请求，选择 `DELETE` 方法
2. 输入URL: `http://localhost:8082/api/provinces/1` （将1替换为实际ID）
3. 直接发送请求

### 请求示例
```
DELETE http://localhost:8082/api/provinces/1
```

### 成功响应 (200)
```json
{
    "success": true,
    "message": "省份删除成功"
}
```

### 失败响应 (400)
```json
{
    "success": false,
    "message": "省份不存在"
}
```

---

## 完整测试流程

### 步骤1：导入SQL数据
```sql
INSERT INTO province_info (province_name, province_photo_url) VALUES 
('北京', '/images/provinces/BeiJing.jpg'),
('上海', '/images/provinces/ShangHai.jpg');
```

### 步骤2：测试获取所有省份
```
GET http://localhost:8082/api/provinces/all
```
验证是否成功返回所有省份列表。

### 步骤3：测试根据名称获取照片
```
GET http://localhost:8082/api/provinces/photo?name=北京
```
验证返回的photoUrl是否正确。

### 步骤4：测试照片访问
在浏览器中打开：
```
http://localhost:8082/images/provinces/BeiJing.jpg
```
验证照片是否能正常显示。

### 步骤5：测试添加省份
```
POST http://localhost:8082/api/provinces
Body: {"provinceName": "广东", "provincePhotoUrl": "/images/provinces/GuangDong.jpg"}
```

### 步骤6：测试更新省份
```
PUT http://localhost:8082/api/provinces/1
Body: {"provincePhotoUrl": "/images/provinces/BeiJing-updated.jpg"}
```

### 步骤7：测试删除省份
```
DELETE http://localhost:8082/api/provinces/27
```

---

## Postman Collection 导入

你可以创建一个Collection来组织这些请求：

1. 在Postman中点击 `New` → `Collection`
2. 命名为 "省份管理API"
3. 添加以下环境变量：
   - `baseUrl`: `http://localhost:8082`
   - `port`: `8082`

然后将所有请求的URL改为使用变量：
```
{{baseUrl}}/api/provinces/photo?name=北京
```

---

## 常见问题

### Q1: 照片无法访问（404错误）
**解决方案**：
- 确认照片文件放在 `src/main/resources/static/images/provinces/` 目录下
- 重启Spring Boot应用
- 检查文件名是否正确（区分大小写）

### Q2: 接口返回500错误
**解决方案**：
- 检查数据库连接是否正常
- 查看后端控制台的错误日志
- 确认province_info表已创建

### Q3: 中文省份名称乱码
**解决方案**：
- 确保数据库字符集为utf8mb4
- 检查application.properties中的编码配置

---

## 测试数据

### 所有省份名称列表
```
安徽、北京、重庆、福建、甘肃、广西、贵州、海南、
河北、河南、黑龙江、湖北、湖南、吉林、江苏、江西、
内蒙古、宁夏、山东、陕西、山西、上海、天津、西藏、
浙江、珠海
```

### 快速测试SQL
```sql
-- 查询所有省份
SELECT * FROM province_info;

-- 根据名称查询
SELECT * FROM province_info WHERE province_name = '北京';

-- 统计数量
SELECT COUNT(*) FROM province_info;
```

---

## 版本信息

- **文档版本**: v1.0
- **创建日期**: 2025-12-04
- **后端端口**: 8082
- **数据库**: MySQL

---

## 联系支持

如遇到问题，请检查：
1. 后端服务是否启动（端口8082）
2. 数据库连接是否正常
3. SQL数据是否已导入
4. 照片文件是否已放置在正确目录

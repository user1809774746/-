# Dify 工作流配置指南 - 返回经纬度坐标

## 🎯 目标
让 Dify 工作流返回包含经纬度坐标的路线规划数据，以便在地图上显示正确的路线。

## 📋 要求的返回格式

```json
{
  "fastest": {
    "time": "时间：20分钟",
    "description": "路径：经过3个红绿灯",
    "cost": "费用：停车费约￥10.00"
  },
  "cheapest": {
    "time": "时间：30分钟",
    "description": "路径：避开收费路段,经过4个红绿灯",
    "cost": "费用：停车费约￥8.00"
  },
  "coordinates": {
    "start": {
      "lng": 116.379028,
      "lat": 39.865042,
      "address": "北京长城"
    },
    "end": {
      "lng": 116.427281,
      "lat": 39.903719,
      "address": "北京天安门"
    }
  }
}
```

## 🔧 方案一：使用高德地图地理编码API（推荐）

### 步骤 1：创建工作流变量
1. 打开 Dify 工作流编辑器
2. 添加输入变量：
   - `user_question`（文本）：接收完整的用户问题

### 步骤 2：提取地址信息（LLM节点）
创建一个 LLM 节点来提取出发地和目的地：

**系统提示词：**
```
你是一个地址提取助手。从用户输入中提取出发地和目的地，以JSON格式返回。

要求：
1. 只返回JSON，不要其他内容
2. 格式：{"start": "出发地", "end": "目的地"}
3. 保持地址的完整性，包括城市名

示例：
用户输入：我要通过自驾从北京长城到北京天安门
返回：{"start": "北京长城", "end": "北京天安门"}
```

**输入：** `{{#sys.user_question#}}`

### 步骤 3：调用高德地图API获取起点坐标（HTTP节点）

**节点名称：** `获取起点坐标`

**请求配置：**
- 方法：GET
- URL：`https://restapi.amap.com/v3/geocode/geo`
- 查询参数：
  - `address`: `{{#提取地址.output#}}` 中的 start 字段
  - `key`: `你的高德地图API Key`

**注意：** 你需要先在[高德开放平台](https://lbs.amap.com/)申请Web服务API Key

**响应示例：**
```json
{
  "status": "1",
  "info": "OK",
  "geocodes": [{
    "formatted_address": "北京市延庆区八达岭镇",
    "province": "北京市",
    "city": [],
    "district": "延庆区",
    "location": "116.379028,40.359461"
  }]
}
```

### 步骤 4：调用高德地图API获取终点坐标（HTTP节点）

**节点名称：** `获取终点坐标`

**请求配置：**
- 方法：GET
- URL：`https://restapi.amap.com/v3/geocode/geo`
- 查询参数：
  - `address`: `{{#提取地址.output#}}` 中的 end 字段
  - `key`: `你的高德地图API Key`

### 步骤 5：生成路线方案（LLM节点）

**系统提示词：**
```
你是一个路线规划助手。根据用户的出行需求，生成两个路线方案：最快路线和最省钱路线。

要求：
1. 只返回JSON格式，不要其他内容
2. 格式必须严格遵守：
{
  "fastest": {
    "time": "时间：XX分钟",
    "description": "路径：详细路线描述",
    "cost": "费用：￥XX.XX"
  },
  "cheapest": {
    "time": "时间：XX分钟",
    "description": "路径：详细路线描述",
    "cost": "费用：￥XX.XX"
  }
}
```

**输入：** `{{#sys.user_question#}}`

### 步骤 6：组合数据（代码节点 - Python）

**代码：**
```python
import json

def main(arg1, arg2, arg3):
    # arg1: 起点坐标API响应
    # arg2: 终点坐标API响应
    # arg3: LLM生成的路线方案
    
    # 解析起点坐标
    start_data = json.loads(arg1)
    start_location = start_data['geocodes'][0]['location'].split(',')
    start_address = start_data['geocodes'][0]['formatted_address']
    
    # 解析终点坐标
    end_data = json.loads(arg2)
    end_location = end_data['geocodes'][0]['location'].split(',')
    end_address = end_data['geocodes'][0]['formatted_address']
    
    # 解析路线方案
    routes = json.loads(arg3)
    
    # 组合最终数据
    result = {
        "fastest": routes['fastest'],
        "cheapest": routes['cheapest'],
        "coordinates": {
            "start": {
                "lng": float(start_location[0]),
                "lat": float(start_location[1]),
                "address": start_address
            },
            "end": {
                "lng": float(end_location[0]),
                "lat": float(end_location[1]),
                "address": end_address
            }
        }
    }
    
    return {
        "result": json.dumps(result, ensure_ascii=False)
    }
```

### 步骤 7：输出节点

将代码节点的输出设置为工作流的输出：
- 输出变量名：`text`
- 值：`{{#组合数据.result#}}`

## 🔧 方案二：让LLM直接生成（简单但不够准确）

如果无法使用高德地图API，可以让LLM直接生成坐标（精度较低）：

**系统提示词：**
```
你是一个路线规划助手。根据用户的出行需求，生成包含经纬度坐标的路线方案。

要求：
1. 只返回JSON格式，不要其他内容
2. 坐标使用GCJ-02坐标系（中国火星坐标）
3. 格式：
{
  "fastest": {
    "time": "时间：XX分钟",
    "description": "路径：详细描述",
    "cost": "费用：￥XX.XX"
  },
  "cheapest": {
    "time": "时间：XX分钟",
    "description": "路径：详细描述",
    "cost": "费用：￥XX.XX"
  },
  "coordinates": {
    "start": {
      "lng": 经度,
      "lat": 纬度,
      "address": "地址名称"
    },
    "end": {
      "lng": 经度,
      "lat": 纬度,
      "address": "地址名称"
    }
  }
}

参考坐标（请根据实际地址调整）：
- 北京市中心：116.4074, 39.9042
- 上海市中心：121.4737, 31.2304
- 广州市中心：113.2644, 23.1291
- 深圳市中心：114.0579, 22.5431
```

## 📝 测试数据

### 测试输入
```
我要通过自驾从北京长城到北京天安门，给我生成两个方案：一个是最快路线方案一个是最省钱方案。需要的方案数据是：时间，详细路线，花费
```

### 期望输出
```json
{
  "fastest": {
    "time": "时间：1小时30分钟",
    "description": "路径：G6京藏高速→G7京新高速→德胜门→长安街",
    "cost": "费用：高速费约￥25.00，停车费约￥10.00"
  },
  "cheapest": {
    "time": "时间：2小时15分钟",
    "description": "路径：避开高速，走国道110→京藏高速辅路→德胜门→长安街",
    "cost": "费用：停车费约￥10.00"
  },
  "coordinates": {
    "start": {
      "lng": 116.379028,
      "lat": 40.359461,
      "address": "北京市延庆区八达岭长城"
    },
    "end": {
      "lng": 116.397428,
      "lat": 39.90923,
      "address": "北京市东城区天安门广场"
    }
  }
}
```

## 🚀 发布和测试

1. 在 Dify 中保存并发布工作流
2. 在浏览器中测试你的应用
3. 检查控制台日志，查看返回的数据格式是否正确
4. 如果有问题，检查：
   - `data.data.outputs` 中是否有数据
   - JSON 格式是否正确
   - 坐标范围是否合理

## ⚠️ 常见问题

### 1. 高德地图API返回空结果
- 检查地址是否准确
- 确保API Key有效
- 检查API调用配额

### 2. JSON解析失败
- 确保LLM输出纯JSON，没有额外的文字
- 检查JSON格式是否正确（特别注意引号和逗号）

### 3. 坐标不准确
- 方案一使用高德API，精度高
- 方案二LLM生成，精度低，仅供参考

## 📞 获取高德地图API Key

1. 访问：https://lbs.amap.com/
2. 注册/登录账号
3. 进入控制台
4. 创建应用
5. 添加 Key（选择"Web服务"类型）
6. 复制 Key 使用


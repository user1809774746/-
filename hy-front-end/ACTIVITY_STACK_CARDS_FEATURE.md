# 活动堆叠卡片功能说明

## 功能概述

实现了一个精美的3D堆叠卡片效果来展示精彩活动，最多显示3个未结束的活动。

## 视觉效果

- 📚 **3D堆叠效果** - 3张卡片以扇形堆叠排列
- 🎨 **渐变遮罩** - 底部有黑色渐变，确保文字清晰可读
- 🔄 **旋转角度** - 左卡片-15°，中间0°，右卡片+15°
- 📏 **缩放比例** - 从前到后依次缩小（1.0, 0.95, 0.9）
- ✨ **悬停效果** - 鼠标悬停时卡片放大并提升到最前层

## 数据加载逻辑

### 优先级策略
1. **优先加载推荐活动** - 获取前3个未结束的推荐活动
2. **降级到同城活动** - 如果推荐活动为空，加载前3个未结束的同城活动
3. **显示空状态** - 如果都没有数据，显示友好提示

### 过滤规则
自动过滤掉以下活动：
- ❌ 已结束的活动 (`endTime < 当前时间`)
- ❌ 已完成的活动 (`status === 'completed'`)
- ❌ 已取消的活动 (`status === 'cancelled'`)

## 文件结构

### 新增文件

**ActivityStackCards.jsx** - 堆叠卡片组件
```
src/components/ActivityStackCards.jsx
```

### 修改文件

**DiscoverPage.jsx**
- 导入 `ActivityStackCards` 组件
- 导入 `getLocalActivities` API
- 修改 `loadActivities` 函数，添加过滤和降级逻辑
- 替换活动列表UI为堆叠卡片

**index.css**
- 添加 `.perspective-1000` 类用于3D透视
- 添加 `.scrollbar-hide` 类用于隐藏滚动条

## 组件详情

### ActivityStackCards 组件

#### Props
- `activities` - 活动数组（最多3个）
- `onActivityClick` - 点击卡片的回调函数

#### 卡片信息展示
- **右上角日期标签**
  - 日期（大号数字）
  - 月份（英文缩写）
  - 年份（小号文字）

- **底部信息区**
  - 活动标题（最多2行）
  - 时间标签（带图标）
  - 地点标签（带图标）
  - 参与人数
  - 价格/免费标签

#### 样式特点
- 圆角：32px
- 阴影：2xl（大阴影）
- 背景：毛玻璃效果（backdrop-blur）
- 文字：白色 + 阴影，确保在图片上清晰可见

## 3D效果实现

### 卡片定位
```javascript
// 第1张卡片（左）
rotation: -15deg
translateX: -50px
translateY: 0px
scale: 1.0
zIndex: 3

// 第2张卡片（中）
rotation: 0deg
translateX: 0px
translateY: 10px
scale: 0.95
zIndex: 2

// 第3张卡片（右）
rotation: 15deg
translateX: 50px
translateY: 20px
scale: 0.9
zIndex: 1
```

### 交互效果
```css
hover:scale-105  /* 悬停放大 */
hover:z-50       /* 悬停提升到最前 */
transition-all duration-300  /* 平滑过渡 */
```

## 使用示例

```jsx
import ActivityStackCards from './ActivityStackCards';

<ActivityStackCards 
  activities={activities}
  onActivityClick={handleActivityClick}
/>
```

## 调试日志

### 推荐活动加载成功
```
✅ 加载推荐活动: 3 个
```

### 降级到同城活动
```
ℹ️ 推荐活动为空，尝试加载同城活动...
✅ 加载同城活动: 3 个
```

### 无数据
```
ℹ️ 推荐活动为空，尝试加载同城活动...
ℹ️ 同城活动也为空
```

## 响应式设计

- **容器高度**: 400px
- **卡片尺寸**: 320px × 380px
- **适配**: 自动居中，支持各种屏幕尺寸

## 性能优化

1. **数据过滤前置** - 在 `loadActivities` 中完成过滤，避免重复计算
2. **最多3张卡片** - 限制DOM元素数量
3. **CSS动画** - 使用transform而非position，性能更好
4. **条件渲染** - 只在有数据时渲染卡片

## 用户体验

### 加载状态
- 显示加载动画
- 提示文字："正在加载活动..."

### 成功状态
- 显示3D堆叠卡片
- 支持点击跳转到活动详情

### 错误状态
- 显示黄色警告框
- 提示具体错误信息

### 空状态
- 显示蓝色日历图标
- 提示："暂无进行中的活动"

## 技术亮点

1. **3D CSS变换** - 使用perspective和transform创建立体效果
2. **毛玻璃效果** - backdrop-blur创建现代感UI
3. **渐变遮罩** - 确保文字在任何背景上都清晰可读
4. **智能降级** - 自动从推荐活动降级到同城活动
5. **数据过滤** - 只显示有效的进行中活动
6. **响应式交互** - 悬停效果提升用户体验

## 注意事项

1. **图片资源** - 确保活动图片路径正确
2. **数据格式** - 活动对象需包含必要字段（title, startTime, locationName等）
3. **时区处理** - 日期比较使用本地时间
4. **浏览器兼容** - 现代浏览器支持，IE可能需要polyfill

## 未来优化方向

1. 添加左右滑动切换功能
2. 支持自定义卡片数量
3. 添加卡片翻转动画
4. 支持拖拽排序
5. 添加分享功能

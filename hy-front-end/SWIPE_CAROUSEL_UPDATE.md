# 活动卡片滑动轮播功能更新

## 更新内容

### 1. 尺寸优化 ✅
- **卡片尺寸**: 从 320×380px 缩小到 **240×280px**
- **容器高度**: 从 400px 缩小到 **280px**
- **整体更紧凑**，更适合移动端显示

### 2. 滑动轮播功能 ✅
实现了完整的左右滑动切换功能

#### 触摸滑动（移动端）
- **向左滑动** → 显示下一张卡片
- **向右滑动** → 显示上一张卡片
- **最小滑动距离**: 50px（防止误触）

#### 鼠标拖拽（桌面端）
- **鼠标按住拖动** → 支持左右切换
- **方便开发测试**

### 3. 轮播指示器 ✅
- **底部圆点指示器** - 显示当前是第几张
- **当前卡片**: 蓝色长条（宽度6）
- **其他卡片**: 灰色圆点（宽度2）
- **平滑过渡动画**

### 4. 卡片动画优化 ✅
- **过渡时长**: 从 300ms 增加到 **500ms**
- **缓动函数**: ease-out（更自然的减速效果）
- **循环轮播**: 支持无限循环

## 技术实现

### 状态管理
```javascript
const [currentIndex, setCurrentIndex] = useState(0);  // 当前显示的卡片索引
const [touchStart, setTouchStart] = useState(null);   // 触摸/拖拽起始位置
const [touchEnd, setTouchEnd] = useState(null);       // 触摸/拖拽结束位置
const [isDragging, setIsDragging] = useState(false);  // 是否正在拖拽
```

### 卡片位置计算
```javascript
// 计算每张卡片相对于当前索引的显示顺序
const getCardOrder = (index) => {
  const total = displayActivities.length;
  const position = (index - currentIndex + total) % total;
  return position;
};

// 基于顺序计算样式
const order = getCardOrder(index);
const rotation = (order - 1) * 12;      // -12°, 0°, 12°
const translateX = (order - 1) * 35;    // -35px, 0px, 35px
const translateY = order * 8;           // 0px, 8px, 16px
const scale = 1 - order * 0.06;         // 1, 0.94, 0.88
const opacity = order === 0 ? 1 : 0.85; // 第一张完全不透明
```

### 滑动检测逻辑
```javascript
// 触摸/鼠标事件
onTouchStart / onMouseDown  → 记录起始位置
onTouchMove / onMouseMove   → 记录当前位置
onTouchEnd / onMouseUp      → 计算滑动距离和方向

// 判断滑动方向
const distance = touchStart - touchEnd;
if (distance > 50) {
  // 向左滑动 → 下一张
  setCurrentIndex((prev) => (prev + 1) % activities.length);
} else if (distance < -50) {
  // 向右滑动 → 上一张
  setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length);
}
```

## 样式细节优化

### 卡片内容尺寸调整
| 元素 | 原尺寸 | 新尺寸 |
|------|--------|--------|
| 日期数字 | 5xl (48px) | 3xl (30px) |
| 月份文字 | sm (14px) | xs (12px) |
| 年份文字 | xs (12px) | 10px |
| 标题文字 | 2xl (24px) | lg (18px) |
| 时间/地点标签 | sm (14px) | xs (12px) |
| 参与人数 | sm (14px) | xs (12px) |
| 价格标签 | sm (14px) | xs (12px) |
| 圆角 | 32px | 24px |
| 内边距 | p-6 | p-4 |

### 3D效果参数调整
| 参数 | 原值 | 新值 |
|------|------|------|
| 旋转角度 | ±15° | ±12° |
| 水平位移 | ±50px | ±35px |
| 垂直位移 | 0/10/20px | 0/8/16px |
| 缩放比例 | 1/0.95/0.9 | 1/0.94/0.88 |

## 交互优化

### 点击限制
```javascript
pointerEvents: order === 0 ? 'auto' : 'none'
```
- **只有第一张卡片可点击** - 防止误触后面的卡片
- **其他卡片禁用点击** - 只能通过滑动切换

### 拖拽体验
- **鼠标离开容器** → 自动结束拖拽
- **防止文本选中** → `select-none` 类
- **平滑过渡** → `transition-all duration-500 ease-out`

## 使用方法

### 移动端
1. 手指按住卡片
2. 向左滑动 → 下一张
3. 向右滑动 → 上一张
4. 松开手指完成切换

### 桌面端
1. 鼠标按住卡片
2. 向左拖动 → 下一张
3. 向右拖动 → 上一张
4. 松开鼠标完成切换

### 点击查看详情
- 点击**最前面的卡片** → 跳转到活动详情页
- 后面的卡片不可点击

## 指示器说明

底部的圆点指示器：
- **蓝色长条** - 当前显示的卡片
- **灰色圆点** - 其他卡片
- **自动更新** - 随滑动实时变化

## 循环逻辑

支持无限循环轮播：
```
卡片1 → 卡片2 → 卡片3 → 卡片1 → ...
卡片1 ← 卡片3 ← 卡片2 ← 卡片1 ← ...
```

使用取模运算实现：
```javascript
// 下一张
(currentIndex + 1) % total

// 上一张
(currentIndex - 1 + total) % total
```

## 性能优化

1. **CSS Transform** - 使用 transform 而非 position，GPU 加速
2. **条件渲染** - 只渲染最多3张卡片
3. **事件节流** - 滑动距离小于50px不触发切换
4. **状态复用** - 复用 touchStart/touchEnd 状态

## 兼容性

### 触摸事件
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ 微信内置浏览器

### 鼠标事件
- ✅ Chrome
- ✅ Firefox
- ✅ Edge
- ✅ Safari

## 调试提示

### 查看当前索引
```javascript
console.log('当前索引:', currentIndex);
console.log('总卡片数:', activities.length);
```

### 查看滑动距离
```javascript
console.log('滑动距离:', touchStart - touchEnd);
```

### 测试循环
- 连续向左滑动，观察是否从最后一张回到第一张
- 连续向右滑动，观察是否从第一张回到最后一张

## 已知限制

1. **最多3张卡片** - 超过3张只显示前3张
2. **单卡片不显示指示器** - 只有1张卡片时不显示底部圆点
3. **最小滑动距离** - 小于50px的滑动会被忽略

## 未来优化方向

1. 自动轮播（可选）
2. 滑动速度检测（快速滑动切换多张）
3. 自定义滑动灵敏度
4. 添加左右箭头按钮
5. 支持键盘方向键控制

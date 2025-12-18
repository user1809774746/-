# 活动卡片自动轮播功能

## 功能概述

实现了活动卡片的自动轮播功能，每2秒自动切换到下一张卡片，同时保留手动滑动控制。

## 核心特性

### 1. 自动轮播 ✅
- **轮播间隔**: 2秒（2000毫秒）
- **轮播方向**: 自动向下一张切换
- **循环播放**: 到达最后一张后自动回到第一张
- **智能启动**: 只有2张或以上卡片时才启动

### 2. 智能暂停 ✅

#### 用户交互时自动暂停
- **触摸滑动** → 暂停自动轮播
- **鼠标拖拽** → 暂停自动轮播
- **鼠标悬停** → 暂停自动轮播

#### 自动恢复
- **恢复时间**: 用户交互结束后3秒
- **智能重置**: 每次交互都会重置恢复计时器

### 3. 用户体验优化 ✅
- **手动优先**: 用户操作时立即暂停自动播放
- **无缝切换**: 自动播放和手动切换使用相同的动画
- **防止冲突**: 暂停期间不会自动切换

## 技术实现

### 状态管理
```javascript
const [isPaused, setIsPaused] = useState(false);  // 是否暂停自动轮播
const autoPlayTimerRef = useRef(null);            // 自动轮播定时器
const pauseTimerRef = useRef(null);               // 暂停恢复定时器
```

### 自动轮播逻辑
```javascript
useEffect(() => {
  // 条件检查
  if (!activities || activities.length <= 1) return;  // 少于2张不轮播
  if (isPaused) return;                                // 暂停时不轮播

  // 启动定时器
  autoPlayTimerRef.current = setInterval(() => {
    handleNext();  // 每2秒切换下一张
  }, 2000);

  // 清理定时器
  return () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
  };
}, [currentIndex, isPaused, activities]);
```

### 暂停和恢复逻辑
```javascript
const pauseAutoPlay = () => {
  setIsPaused(true);  // 立即暂停
  
  // 清除之前的恢复定时器
  if (pauseTimerRef.current) {
    clearTimeout(pauseTimerRef.current);
  }
  
  // 3秒后自动恢复
  pauseTimerRef.current = setTimeout(() => {
    setIsPaused(false);
  }, 3000);
};
```

### 触发暂停的事件
```javascript
// 触摸事件
onTouchStart={onTouchStart}  // 触摸开始 → pauseAutoPlay()

// 鼠标事件
onMouseDown={onMouseDown}    // 鼠标按下 → pauseAutoPlay()
onMouseEnter={pauseAutoPlay} // 鼠标悬停 → pauseAutoPlay()
```

## 工作流程

### 正常自动轮播
```
卡片1 (显示2秒) → 卡片2 (显示2秒) → 卡片3 (显示2秒) → 卡片1 ...
```

### 用户交互时
```
1. 用户触摸/拖拽/悬停
2. 立即暂停自动轮播
3. 用户完成操作
4. 等待3秒
5. 恢复自动轮播
```

### 连续交互
```
1. 用户触摸 → 暂停 → 开始3秒倒计时
2. 用户再次触摸 → 重置倒计时 → 重新开始3秒倒计时
3. 3秒内无操作 → 恢复自动轮播
```

## 配置参数

### 可调整的参数
```javascript
// 自动轮播间隔（毫秒）
const autoPlayInterval = 2000;  // 当前: 2秒

// 暂停后恢复时间（毫秒）
pauseTimerRef.current = setTimeout(() => {
  setIsPaused(false);
}, 3000);  // 当前: 3秒
```

### 修改轮播速度
```javascript
// 更快: 1秒切换一次
const autoPlayInterval = 1000;

// 更慢: 5秒切换一次
const autoPlayInterval = 5000;
```

### 修改恢复时间
```javascript
// 更快恢复: 2秒后恢复
setTimeout(() => {
  setIsPaused(false);
}, 2000);

// 更慢恢复: 5秒后恢复
setTimeout(() => {
  setIsPaused(false);
}, 5000);
```

## 边界情况处理

### 单张卡片
```javascript
if (!activities || activities.length <= 1) return;
```
- **不启动自动轮播** - 只有1张卡片时没有意义

### 无卡片
```javascript
if (!activities || activities.length === 0) {
  return <EmptyState />;
}
```
- **显示空状态** - 没有卡片时显示提示

### 组件卸载
```javascript
return () => {
  if (autoPlayTimerRef.current) {
    clearInterval(autoPlayTimerRef.current);
  }
};
```
- **清理定时器** - 防止内存泄漏

## 性能优化

### 1. 使用 useRef 存储定时器
```javascript
const autoPlayTimerRef = useRef(null);
const pauseTimerRef = useRef(null);
```
- **避免重新渲染** - ref 变化不会触发组件更新
- **持久化引用** - 定时器ID在组件生命周期内保持

### 2. 依赖数组优化
```javascript
useEffect(() => {
  // ...
}, [currentIndex, isPaused, activities]);
```
- **精确依赖** - 只在必要时重新创建定时器
- **避免过度更新** - 减少不必要的effect执行

### 3. 清理机制
```javascript
return () => {
  clearInterval(autoPlayTimerRef.current);
};
```
- **防止内存泄漏** - 组件卸载时清理定时器
- **避免错误** - 防止在已卸载组件上更新状态

## 用户体验细节

### 1. 交互优先
- 用户操作时**立即暂停**，不会等到当前轮播周期结束
- 避免用户操作和自动切换冲突

### 2. 智能恢复
- 用户停止操作后**3秒恢复**，给用户足够的查看时间
- 连续操作会**重置计时器**，不会过早恢复

### 3. 悬停暂停
- 鼠标悬停时**自动暂停**，方便用户查看详情
- 鼠标移开后**自动恢复**，无需额外操作

### 4. 平滑过渡
- 自动切换和手动切换使用**相同的动画**
- 500ms的过渡时间，视觉效果流畅

## 调试方法

### 查看轮播状态
```javascript
console.log('当前索引:', currentIndex);
console.log('是否暂停:', isPaused);
console.log('活动数量:', activities.length);
```

### 测试自动轮播
1. 打开页面，不要触摸卡片
2. 观察卡片是否每2秒自动切换
3. 检查是否循环播放

### 测试暂停功能
1. 触摸/拖拽卡片
2. 观察自动轮播是否立即停止
3. 等待3秒，观察是否恢复

### 测试悬停暂停
1. 鼠标移到卡片上
2. 观察自动轮播是否暂停
3. 鼠标移开，等待3秒
4. 观察是否恢复

## 常见问题

### Q: 为什么只有一张卡片时不自动轮播？
A: 只有一张卡片时轮播没有意义，所以自动跳过。

### Q: 可以修改轮播速度吗？
A: 可以，修改 `autoPlayInterval` 的值（单位：毫秒）。

### Q: 为什么触摸后要等3秒才恢复？
A: 给用户足够的时间查看卡片内容，避免过快恢复影响体验。

### Q: 可以禁用自动轮播吗？
A: 可以，添加一个 `autoPlay` prop，默认为 true：
```javascript
const ActivityStackCards = ({ activities, onActivityClick, autoPlay = true }) => {
  // 在 useEffect 中检查 autoPlay
  if (!autoPlay) return;
  // ...
}
```

### Q: 自动轮播会影响性能吗？
A: 不会，使用了 `setInterval` 和 `useRef`，性能开销很小。

## 未来优化方向

1. **可配置轮播间隔** - 通过 props 传入
2. **可配置恢复时间** - 通过 props 传入
3. **暂停/播放按钮** - 手动控制自动轮播
4. **进度条指示器** - 显示当前轮播进度
5. **轮播方向控制** - 支持向前/向后轮播
6. **触摸速度检测** - 快速滑动时跳过多张

## 完整特性列表

| 功能 | 状态 | 说明 |
|------|------|------|
| 自动轮播 | ✅ | 每2秒切换 |
| 循环播放 | ✅ | 无限循环 |
| 触摸暂停 | ✅ | 触摸时暂停 |
| 拖拽暂停 | ✅ | 拖拽时暂停 |
| 悬停暂停 | ✅ | 鼠标悬停暂停 |
| 自动恢复 | ✅ | 3秒后恢复 |
| 智能启动 | ✅ | 2张以上才启动 |
| 内存清理 | ✅ | 卸载时清理定时器 |

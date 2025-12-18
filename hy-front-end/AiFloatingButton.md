# AiFloatingButton 组件说明

## 1. 组件功能概览

`AiFloatingButton` 是一个 **可拖动的 AI 悬浮按钮** 组件，用于在任意页面悬浮显示一个小浮标：

- 固定在屏幕上（`position: fixed`），不随页面滚动。
- 支持鼠标 / 触摸拖动，**松手后自动吸附到左侧或右侧边缘**。
- 点击（没有明显拖动）时：
  - 清理 `localStorage` 中的 `aiDialogInput`。
  - 调用外部传入的 `onNavigateToAi` 函数，跳转到 `AiPage_N8N`。

组件文件位置：

```text
d:/Haoyou/hy-front-end/src/components/AiFloatingButton.jsx
```

导出为默认组件：

```js
export default function AiFloatingButton({ onNavigateToAi, initialTop = 300 }) { ... }
```

---

## 2. 实现原理说明

### 2.1 状态与引用

组件内部主要状态：

```js
const aiFloatDragRef = useRef({
  offsetX: 0,
  offsetY: 0,
  startX: 0,
  startY: 0,
  moved: false,
});

const [aiFloatLeft, setAiFloatLeft] = useState(0);        // 当前左侧位置
const [aiFloatTop, setAiFloatTop] = useState(initialTop); // 当前顶部位置
```

- `aiFloatDragRef`：记录拖动起点、相对偏移以及是否发生“明显移动”（区分拖动和点击）。
- `aiFloatLeft` / `aiFloatTop`：控制浮标在屏幕上的具体位置。
- `initialTop` 是一个 props，默认 `300`，用来控制初始高度。

### 2.2 点击跳转逻辑

```js
const handleClickNavigate = () => {
  if (onNavigateToAi) {
    localStorage.removeItem('aiDialogInput');
    onNavigateToAi('');
  }
};
```

- 如果外部传入了 `onNavigateToAi`：
  - 先清掉之前 AI 对话框存的初始输入。
  - 调用 `onNavigateToAi('')` 跳转到 `AiPage_N8N`。

### 2.3 拖动逻辑（鼠标）

`onMouseDown` 时：

1. 记录按下时的鼠标位置和按钮相对位置：

   ```js
   const rect = e.currentTarget.getBoundingClientRect();
   aiFloatDragRef.current.startX = e.clientX;
   aiFloatDragRef.current.startY = e.clientY;
   aiFloatDragRef.current.offsetX = e.clientX - rect.left;
   aiFloatDragRef.current.offsetY = e.clientY - rect.top;
   aiFloatDragRef.current.moved = false;
   ```

2. 绑定全局事件：

   ```js
   document.addEventListener('mousemove', handleMove);
   document.addEventListener('mouseup', handleUp);
   ```

`handleMove` 中：

- 根据当前鼠标坐标更新 `aiFloatLeft` / `aiFloatTop`。
- 如果移动距离超过 3 像素，认为是“拖动”，`moved = true`。

`handleUp` 中：

- 移除事件监听。
- 根据当前位置 **自动吸附** 到左/右边缘：

  ```js
  const viewportWidth = window.innerWidth;
  setAiFloatLeft((prevLeft) => {
    const centerX = prevLeft + 24; // 24 约等于半径
    return centerX < viewportWidth / 2 ? 16 : viewportWidth - 16 - 48;
  });
  ```

- 如果整个过程 `moved === false`，说明几乎没移动，当作点击，调用 `handleClickNavigate()`。

### 2.4 拖动逻辑（触摸）

`onTouchStart` 的逻辑和鼠标完全一样，只是监听的是：

- `document.addEventListener('touchmove', handleMove)`
- `document.addEventListener('touchend', handleEnd)`

`handleMove` / `handleEnd` 中同样执行：位置更新、左右吸附和点击判断。

### 2.5 渲染结构

```jsx
return (
  <div
    className="fixed z-30 flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-white/90 border border-blue-200"
    style={{
      top: aiFloatTop,
      left: aiFloatLeft,
      transform: aiFloatLeft === 0 ? 'none' : 'translateX(-50%)',
    }}
    onMouseDown={attachMouseHandlers}
    onTouchStart={attachTouchHandlers}
  >
    <img
      src="./imge/AI助手@2x.png"
      alt="AI助手"
      className="w-10 h-10"
      draggable="false"
    />
  </div>
);
```

- `position: fixed` + `z-30`：始终悬浮在屏幕上方。
- 使用 `./imge/AI助手@2x.png` 作为按钮图标。
- `transform` 保证在初始化时不偏移，拖动后以中心计算位置。

---

## 3. 在页面中如何使用

### 3.1 在 goHomePage.jsx 中的使用方式

顶部引入：

```js
import AiFloatingButton from './AiFloatingButton';
```

在 JSX 中（通常放在页面主容器中）：

```jsx
<div className="flex-grow bg-gray-100 relative">
  {/* 页面或地图内容 ... */}

  {/* AI 悬浮按钮 */}
  <AiFloatingButton onNavigateToAi={onNavigateToAi} />
</div>
```

说明：

- `onNavigateToAi` 由父级（如路由容器）传入，负责从当前页面跳转到 `AiPage_N8N`。
- 点击浮标时会执行 `onNavigateToAi('')`，打开 AI 助手页面。

### 3.2 在其他页面中插入该组件

假设你要在 `MyTravalPlanPage.jsx` 中添加这个浮标：

#### 第一步：引入组件

```js
import AiFloatingButton from './AiFloatingButton';
```

> 注意：如果文件路径不同，请根据相对位置调整，例如：
>
> ```js
> import AiFloatingButton from '../components/AiFloatingButton';
> ```

#### 第二步：准备跳转函数

**情况 A：页面通过 props 获取 `onNavigateToAi`**

```jsx
function MyTravalPlanPage({ onNavigateToAi, ...props }) {
  return (
    <>
      {/* 页面内容 */}
      <AiFloatingButton onNavigateToAi={onNavigateToAi} />
    </>
  );
}
```

**情况 B：页面自己使用路由跳转（例如 react-router）**

```jsx
import { useNavigate } from 'react-router-dom';
import AiFloatingButton from '../components/AiFloatingButton';

function MyTravalPlanPage() {
  const navigate = useNavigate();

  const handleNavigateToAi = () => {
    // 根据你项目的路由配置调整路径
    navigate('/ai');
  };

  return (
    <>
      {/* 页面内容 */}
      <AiFloatingButton onNavigateToAi={handleNavigateToAi} />
    </>
  );
}
```

#### 第三步：调整初始上下位置（可选）

如果默认的 `top = 300` 不合适，可以传 `initialTop`：

```jsx
<AiFloatingButton
  onNavigateToAi={onNavigateToAi}
  initialTop={200}  // 越小越靠上，越大越靠下
/>
```

---

## 4. 快速总结

- `AiFloatingButton` 封装了：**悬浮 + 拖动 + 左右吸附 + 点击跳转 AI 页面**。
- 复用步骤：
  1. `import AiFloatingButton from '...';`
  2. 在 JSX 中插入 `<AiFloatingButton onNavigateToAi={...} initialTop={300} />`。
  3. 确保传入的 `onNavigateToAi` 能正确导航到 `AiPage_N8N`。

你可以在 VS Code 里通过 `docs/AiFloatingButton.md` 随时查阅本说明文档。

import React, { useState, useRef } from 'react';

// 通用滑动删除组件：
// - 从右向左滑动时，右侧出现删除按钮（垃圾桶）
// - 再从左向右滑动时，卡片恢复原位，删除按钮消失
// 使用方式：
// <SwipeableItem onDelete={...}>
//   {/* 这里放你的卡片内容 */}
// </SwipeableItem>

export default function SwipeableItem({ children, onDelete }) {
  const touchStartXRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const [opened, setOpened] = useState(false);

  const MAX_OFFSET = 80;     // 内容最多左移 80px
  const TRIGGER_OFFSET = 30; // 超过 30px 认为触发展开，更容易触发

  // 记录每次手势开始时的偏移量，支持从已展开状态往回滑动关闭
  const startOffsetRef = useRef(0);

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    startOffsetRef.current = offsetX || 0;
    touchStartXRef.current = touch.clientX;
  };

  const handleTouchMove = (e) => {
    if (touchStartXRef.current == null || !e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const diff = touch.clientX - touchStartXRef.current;

    // 基于本次手势开始时的偏移量做相对位移，既可以左滑展开，也可以右滑收回
    const baseOffset = startOffsetRef.current || 0;
    let newOffset = baseOffset + diff;

    if (newOffset < -MAX_OFFSET) newOffset = -MAX_OFFSET;
    if (newOffset > 0) newOffset = 0;

    setOffsetX(newOffset);
  };

  const handleTouchEnd = () => {
    // 根据偏移距离决定：展开 or 关闭
    if (offsetX < -TRIGGER_OFFSET) {
      setOffsetX(-MAX_OFFSET);
      setOpened(true);
    } else {
      setOffsetX(0);
      setOpened(false);
    }
    touchStartXRef.current = null;
  };

  const handleContentClick = () => {
    // 如果已经展开，点击内容时收回（可选）
    if (opened) {
      setOffsetX(0);
      setOpened(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 底层：右侧的删除按钮区域 */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
        <button
          className="flex items-center"
          onClick={onDelete}
        >
          <img
            className="w-6 h-6 cursor-pointer"
            src="/垃圾桶.png"
            alt="删除"
          />
        </button>
      </div>

      {/* 上层：真正的内容区域，整体左移来露出右侧按钮
          具体的背景颜色、圆角、阴影由外部 children 自己决定 */}
      <div
        className="transform transition-transform duration-200"
        style={{ transform: `translateX(${offsetX}px)` }}
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
}

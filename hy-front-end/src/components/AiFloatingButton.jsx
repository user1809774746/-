import React, { useState, useRef } from 'react';

export default function AiFloatingButton({ onNavigateToAi, initialTop = 300 }) {
  const aiFloatDragRef = useRef({
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    moved: false,
  });

  const [aiFloatLeft, setAiFloatLeft] = useState(0);
  const [aiFloatTop, setAiFloatTop] = useState(initialTop);

  const handleClickNavigate = () => {
    if (onNavigateToAi) {
      localStorage.removeItem('aiDialogInput');
      onNavigateToAi('');
    }
  };

  const attachMouseHandlers = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    aiFloatDragRef.current.startX = e.clientX;
    aiFloatDragRef.current.startY = e.clientY;
    aiFloatDragRef.current.offsetX = e.clientX - rect.left;
    aiFloatDragRef.current.offsetY = e.clientY - rect.top;
    aiFloatDragRef.current.moved = false;

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      const clientX = moveEvent.clientX;
      const clientY = moveEvent.clientY;
      const deltaX = clientX - aiFloatDragRef.current.startX;
      const deltaY = clientY - aiFloatDragRef.current.startY;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        aiFloatDragRef.current.moved = true;
      }
      setAiFloatLeft(clientX - aiFloatDragRef.current.offsetX);
      setAiFloatTop(clientY - aiFloatDragRef.current.offsetY);
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);

      const viewportWidth = window.innerWidth;
      setAiFloatLeft((prevLeft) => {
        const centerX = prevLeft + 24;
        return centerX < viewportWidth / 2 ? 16 : viewportWidth - 48 - 16;
      });

      if (!aiFloatDragRef.current.moved) {
        handleClickNavigate();
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const attachTouchHandlers = (e) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    aiFloatDragRef.current.startX = touch.clientX;
    aiFloatDragRef.current.startY = touch.clientY;
    aiFloatDragRef.current.offsetX = touch.clientX - rect.left;
    aiFloatDragRef.current.offsetY = touch.clientY - rect.top;
    aiFloatDragRef.current.moved = false;

    const handleMove = (moveEvent) => {
      const t = moveEvent.touches[0];
      const deltaX = t.clientX - aiFloatDragRef.current.startX;
      const deltaY = t.clientY - aiFloatDragRef.current.startY;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        aiFloatDragRef.current.moved = true;
      }
      setAiFloatLeft(t.clientX - aiFloatDragRef.current.offsetX);
      setAiFloatTop(t.clientY - aiFloatDragRef.current.offsetY);
    };

    const handleEnd = () => {
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);

      const viewportWidth = window.innerWidth;
      setAiFloatLeft((prevLeft) => {
        const centerX = prevLeft + 24;
        return centerX < viewportWidth / 2 ? 16 : viewportWidth - 48 - 16;
      });

      if (!aiFloatDragRef.current.moved) {
        handleClickNavigate();
      }
    };

    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  return (
    <div
      className="fixed z-30 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border"
      style={{
        top: aiFloatTop,
        left: aiFloatLeft,
      }}
      onMouseDown={attachMouseHandlers}
      onTouchStart={attachTouchHandlers}
    >
      <img
        src="可爱图标.png"
        alt="AI助手"
        className="w-12 h-12"
        draggable="false"
      />
    </div>
  );
}
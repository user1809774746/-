import React, { useEffect, useState } from 'react';

/**
 * 全局全屏切换悬浮按钮
 *
 * - 检测 Fullscreen API 是否可用
 * - 检测是否运行在 PWA standalone 模式
 * - 点击进入/退出全屏
 */
const FullscreenToggle = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 检查 Fullscreen API 支持情况
    const doc = document;
    const enabled =
      doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled;

    setIsSupported(!!enabled);

    // 检查是否已经是 PWA / standalone 模式
    const standalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;

    setIsStandalone(standalone);

    const handleChange = () => {
      const fsElement =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };

    doc.addEventListener('fullscreenchange', handleChange);
    doc.addEventListener('webkitfullscreenchange', handleChange);
    doc.addEventListener('mozfullscreenchange', handleChange);
    doc.addEventListener('MSFullscreenChange', handleChange);

    // 初始化一次状态
    handleChange();

    return () => {
      doc.removeEventListener('fullscreenchange', handleChange);
      doc.removeEventListener('webkitfullscreenchange', handleChange);
      doc.removeEventListener('mozfullscreenchange', handleChange);
      doc.removeEventListener('MSFullscreenChange', handleChange);
    };
  }, []);

  const requestFullscreen = async () => {
    const elem = document.documentElement;
    const req =
      elem.requestFullscreen ||
      elem.webkitRequestFullscreen ||
      elem.mozRequestFullScreen ||
      elem.msRequestFullscreen;

    if (req) {
      try {
        await req.call(elem);
        
        // 🌟 进入全屏后，锁定屏幕方向为竖屏
        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock('portrait-primary');
            console.log('✅ 屏幕方向已锁定为竖屏');
          } catch (orientationError) {
            console.warn('⚠️ 屏幕方向锁定失败:', orientationError.message);
            // 某些浏览器可能不支持或需要用户交互，这不是致命错误
          }
        }
      } catch (err) {
        console.error('进入全屏失败:', err);
      }
    }
  };

  const exitFullscreen = async () => {
    const doc = document;
    const exit =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (exit) {
      try {
        await exit.call(doc);
        
        // 🌟 退出全屏后，解锁屏幕方向
        if (screen.orientation && screen.orientation.unlock) {
          try {
            screen.orientation.unlock();
            console.log('✅ 屏幕方向已解锁');
          } catch (orientationError) {
            console.warn('⚠️ 屏幕方向解锁失败:', orientationError.message);
          }
        }
      } catch (err) {
        console.error('退出全屏失败:', err);
      }
    }
  };

  if (!isSupported) {
    // 不支持 Fullscreen API 时不渲染按钮
    return null;
  }

  // 在 PWA standalone 模式下，可以选择弱化按钮表现（例如缩小文案）
  const label = isFullscreen ? '退出沉浸' : '沉浸模式';
  const subLabel = isStandalone ? 'App 模式' : '全屏浏览';

  return (
    <button
      type="button"
      onClick={isFullscreen ? exitFullscreen : requestFullscreen}
      className="fixed right-4 bottom-20 z-40 px-3 py-2 rounded-full shadow-lg bg-white/90 backdrop-blur flex items-center space-x-2 text-xs text-gray-700 border border-gray-200 hover:bg-white active:scale-95 transition transform"
    >
      <i className="fa-solid fa-maximize text-[10px]" />
      <span className="flex flex-col items-start leading-tight">
        <span className="font-medium">{label}</span>
        <span className="text-[10px] text-gray-400">{subLabel}</span>
      </span>
    </button>
  );
};

export default FullscreenToggle;

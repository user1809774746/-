import React, { useState, useRef, useEffect } from 'react';
import API_CONFIG from '../api/config';

/**
 * 活动堆叠卡片组件 - 3D堆叠效果
 * 显示最多3个活动，以堆叠卡片的形式展示
 */
const ActivityStackCards = ({ activities, onActivityClick }) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // 是否暂停自动轮播
  const containerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const pauseTimerRef = useRef(null);

  // 最小滑动距离（像素）
  const minSwipeDistance = 50;
  // 自动轮播间隔（毫秒）
  const autoPlayInterval = 3000;

  const DEFAULT_ACTIVITY_IMAGES = [
    '/活动图片1.jpg',
    '/活动图片2.jpg',
    '/活动图片3.jpg'
  ];

  const buildActivityMediaUrl = (url) => {
    if (!url || typeof url !== 'string') {
      return '';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/api/')) {
      return `${API_CONFIG.BASE_URL || ''}${url}`;
    }
    return url;
  };

  const getPrimaryImageUrl = (activity, fallbackIndex) => {
    if (!activity) {
      return DEFAULT_ACTIVITY_IMAGES[fallbackIndex % DEFAULT_ACTIVITY_IMAGES.length];
    }

    const rawImages = typeof activity.images === 'string' ? activity.images : '';
    const imageUrls = rawImages
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .map((url) => buildActivityMediaUrl(url));

    if (activity.coverImage && activity.coverImage.trim().length > 0) {
      return buildActivityMediaUrl(activity.coverImage.trim());
    }

    if (imageUrls.length > 0) {
      return imageUrls[0];
    }

    return DEFAULT_ACTIVITY_IMAGES[fallbackIndex % DEFAULT_ACTIVITY_IMAGES.length];
  };



  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return { day: '', month: '', year: '' };
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear()
    };
  };

  // 格式化时间
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // 自动轮播
  useEffect(() => {
    // 如果没有活动或只有一个活动，不需要轮播
    if (!activities || activities.length <= 1) return;

    // 如果暂停，不启动轮播
    if (isPaused) return;

    // 启动自动轮播
    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    // 清理定时器
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [currentIndex, isPaused, activities]);

  // 暂停自动轮播（用户交互时）
  const pauseAutoPlay = () => {
    setIsPaused(true);
    
    // 清除之前的恢复定时器
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    
    // 3秒后恢复自动轮播
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  // 处理触摸开始
  const onTouchStart = (e) => {
    pauseAutoPlay(); // 暂停自动轮播
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // 处理触摸移动
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // 处理触摸结束
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // 向左滑动 - 下一张
      handleNext();
    } else if (isRightSwipe) {
      // 向右滑动 - 上一张
      handlePrev();
    }
  };

  // 下一张
  const handleNext = () => {
    if (activities.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activities.length);
  };

  // 上一张
  const handlePrev = () => {
    if (activities.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length);
  };

  // 鼠标拖拽开始
  const onMouseDown = (e) => {
    pauseAutoPlay(); // 暂停自动轮播
    setIsDragging(true);
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  // 鼠标拖拽移动
  const onMouseMove = (e) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  // 鼠标拖拽结束
  const onMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // 如果没有活动，返回空状态
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <i className="fa-solid fa-calendar-days text-4xl text-blue-200 mb-3"></i>
        <p className="text-gray-500">暂无进行中的活动</p>
      </div>
    );
  }

  // 只取前3个活动
  const displayActivities = activities.slice(0, 3);

  // 计算每张卡片的显示顺序
  const getCardOrder = (index) => {
    const total = displayActivities.length;
    const position = (index - currentIndex + total) % total;
    return position;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[320px] flex items-center justify-center perspective-1000 select-none touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseEnter={pauseAutoPlay}
    >
      {displayActivities.map((activity, index) => {
        const dateInfo = formatDate(activity.startTime);
        const timeInfo = formatTime(activity.startTime);
        const coverImageUrl = getPrimaryImageUrl(activity, index);
        
        // 计算卡片的显示位置（基于当前索引）

        const order = getCardOrder(index);
        const zIndex = displayActivities.length - order;
        const rotation = (order - 1) * 12; // -12deg, 0deg, 12deg
        const translateX = (order - 1) * 35; // -35px, 0px, 35px
        const translateY = order * 8; // 0px, 8px, 16px
        const scale = 1 - order * 0.06; // 1, 0.94, 0.88
        const opacity = order === 0 ? 1 : 0.85; // 第一张完全不透明

        return (
          <div
            key={activity.id || index}
            className="absolute w-[240px] h-[280px] cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-50"
            style={{
              zIndex: zIndex,
              opacity: opacity,
              transform: `
                translateX(${translateX}px) 
                translateY(${translateY}px) 
                rotate(${rotation}deg) 
                scale(${scale})
              `,
              pointerEvents: order === 0 ? 'auto' : 'none', // 只有第一张可点击
            }}
            onClick={() => onActivityClick && onActivityClick(activity)}
          >
            {/* 卡片容器 */}
            <div className="w-full h-full rounded-[24px] overflow-hidden shadow-2xl bg-white">
              {/* 背景图片 */}
              <div className="relative w-full h-full">
                <img
                  src={coverImageUrl}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />

                
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>

                {/* 日期标签 - 右上角 */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 text-center shadow-lg">
                  <div className="text-3xl font-bold text-gray-800 leading-none">
                    {dateInfo.day}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 uppercase">
                    {dateInfo.month}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {dateInfo.year}
                  </div>
                </div>

                {/* 底部信息区域 */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {/* 活动标题 */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
                    {activity.title}
                  </h3>

                  {/* 时间和地点 */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* 时间 */}
                    {timeInfo && (
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                        <i className="fa-solid fa-clock text-white text-xs"></i>
                        <span className="text-white text-xs font-medium">
                          {timeInfo}
                        </span>
                      </div>
                    )}

                    {/* 地点 */}
                    {activity.locationName && (
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 max-w-[120px]">
                        <i className="fa-solid fa-location-dot text-white text-xs"></i>
                        <span className="text-white text-xs font-medium truncate">
                          {activity.locationName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 底部信息栏 */}
                  <div className="flex items-center justify-between">
                    {/* 参与人数 */}
                    <div className="flex items-center gap-1.5 text-white">
                      <i className="fa-solid fa-users text-xs"></i>
                      <span className="text-xs font-medium">
                        {activity.currentParticipants || 0}
                        {activity.maxParticipants > 0 && `/${activity.maxParticipants}`}
                      </span>
                    </div>

                    {/* 价格 */}
                    <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1">
                      {activity.price > 0 ? (
                        <span className="text-red-500 font-bold text-xs">
                          ¥{activity.price}
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold text-xs">免费</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        );
      })}

      {/* 指示器 - 显示当前是第几张 */}
      {displayActivities.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
          {displayActivities.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-500 w-6' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityStackCards;

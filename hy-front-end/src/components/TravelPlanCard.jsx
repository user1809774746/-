import React from 'react';

/**
 * 旅行计划卡片组件
 * 用于在AI对话中显示分享的旅行计划
 */
const TravelPlanCard = ({ travelPlan, onCardClick }) => {
  if (!travelPlan) return null;

  const {
    title,
    destination,
    travelDays,
    coverImageUrl,
    startDate,
    endDate,
    createdBy,
    id
  } = travelPlan;

  const handleClick = () => {
    if (onCardClick && id) {
      onCardClick({ id });
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 max-w-sm cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      {/* 封面图片 */}
      {coverImageUrl ? (
        <div className="w-full h-32 overflow-hidden bg-gray-100">
          <img 
            src={coverImageUrl} 
            alt={title || destination || '旅行计划'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center" style={{ display: 'none' }}>
            <i className="fa-solid fa-map-location-dot text-white text-3xl"></i>
          </div>
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
          <i className="fa-solid fa-map-location-dot text-white text-3xl"></i>
        </div>
      )}

      {/* 卡片内容 */}
      <div className="p-3">
        {/* 标题 */}
        <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-1">
          {title || destination || '旅行计划'}
        </h3>

        {/* 信息列表 */}
        <div className="space-y-1.5">
          {destination && (
            <div className="flex items-center text-sm text-gray-600">
              <i className="fa-solid fa-location-dot text-blue-500 mr-2 w-4"></i>
              <span className="truncate">{destination}</span>
            </div>
          )}

          {travelDays && (
            <div className="flex items-center text-sm text-gray-600">
              <i className="fa-regular fa-calendar text-green-500 mr-2 w-4"></i>
              <span>{travelDays}天</span>
            </div>
          )}

          {(startDate || endDate) && (
            <div className="flex items-center text-sm text-gray-600">
              <i className="fa-solid fa-clock text-orange-500 mr-2 w-4"></i>
              <span>
                {startDate && endDate 
                  ? `${startDate} 至 ${endDate}`
                  : startDate || endDate
                }
              </span>
            </div>
          )}

          {createdBy && (
            <div className="flex items-center text-sm text-gray-500">
              <i className="fa-solid fa-user text-purple-500 mr-2 w-4"></i>
              <span className="truncate">创建者：{createdBy}</span>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">点击查看详情</span>
            <i className="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanCard;


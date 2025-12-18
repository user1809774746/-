import React from 'react';
import API_CONFIG from '../api/config';

const ActivityListItem = ({ activity, onClick, showStatus = false, imageIndex = 0 }) => {
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

  const getPrimaryImageUrl = () => {
    if (!activity) {
      return DEFAULT_ACTIVITY_IMAGES[imageIndex % DEFAULT_ACTIVITY_IMAGES.length];
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

    return DEFAULT_ACTIVITY_IMAGES[imageIndex % DEFAULT_ACTIVITY_IMAGES.length];
  };


  const coverImageUrl = getPrimaryImageUrl();

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getStatusKey = (status, auditStatus) => {
    if (auditStatus === 'rejected') {
      if (status === 'cancelled') {
        return 'reported';
      }
      return 'rejected';
    }
    return status;
  };

  const getStatusColor = (status, auditStatus) => {
    const key = getStatusKey(status, auditStatus);
    const colorMap = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      ongoing: 'bg-blue-100 text-blue-700',
      completed: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700',
      postponed: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      reported: 'bg-red-100 text-red-700'
    };
    return colorMap[key] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status, auditStatus) => {
    const key = getStatusKey(status, auditStatus);
    const statusMap = {
      draft: '草稿',
      published: '已发布',
      ongoing: '进行中',
      completed: '已完成',
      cancelled: '已取消',
      postponed: '已延期',
      rejected: '审核未通过',
      reported: '活动被举报'
    };
    return statusMap[key] || key;
  };

  const isExpired = (endTime) => {
    return new Date(endTime) < new Date();
  };

  const isRegistrationOpen = (registrationStart, registrationEnd) => {
    const now = new Date();
    const start = registrationStart ? new Date(registrationStart) : null;
    const end = registrationEnd ? new Date(registrationEnd) : null;
    
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-80"
      onClick={() => onClick && onClick(activity)}
    >
      {/* 活动图片 */}
      <div className="flex-[3] relative overflow-hidden bg-gray-100">
        <img 
          src={coverImageUrl} 
          alt={activity.title}
          className="w-full h-full object-cover"
        />

        {/* 日期标签（右上角） */}
        {activity.startTime && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 text-center shadow-lg">
            <div className="text-3xl font-bold text-gray-800">
              {new Date(activity.startTime).getDate()}
            </div>
            <div className="text-xs text-gray-600 uppercase">
              {new Date(activity.startTime).toLocaleDateString('zh-CN', { month: 'short' })}
            </div>
          </div>
        )}
        {/* 地点标签（左下角） */}
        {activity.locationName && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center shadow-lg">
            <i className="fa-solid fa-location-dot text-red-500 mr-2"></i>
            <span className="text-sm font-medium text-gray-800 max-w-[150px] truncate">
              {activity.locationName}
            </span>
          </div>
        )}
      </div>

      {/* 活动信息 - 白色底部 */}
      <div className="flex-[1] bg-white flex flex-col justify-between p-3">
        {/* 活动标题 */}
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
          {activity.title}
        </h3>

        {/* 时间信息 */}
        {activity.startTime && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <i className="fa-solid fa-clock mr-2 text-blue-500"></i>
            <span>{formatDateTime(activity.startTime)}</span>
          </div>
        )}

        {/* 地点信息 */}
        {activity.city && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <i className="fa-solid fa-map-marker-alt mr-2 text-red-500"></i>
            <span className="line-clamp-1">{activity.city}</span>
          </div>
        )}

        {/* 底部信息：参与人数和价格 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <i className="fa-solid fa-users mr-2 text-green-500"></i>
            <span>
              {activity.currentParticipants || 0}
              {activity.maxParticipants > 0 && `/${activity.maxParticipants}`}人
            </span>
          </div>
          {activity.price > 0 ? (
            <span className="text-lg font-bold text-red-500">
              ¥{activity.price}
            </span>
          ) : (
            <span className="text-sm font-medium text-green-600">免费</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityListItem;

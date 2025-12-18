import React, { useState, useEffect } from 'react';
import {
  getNotificationList,
  getNotificationsByType,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getUnreadCount as getChatUnreadCount
} from '../api/config';

const NotificationPage = ({ onBack, onNavigateToPostDetail, onNavigateToActivityDetail, onNavigateToCommunity, onUnreadChange }) => {
  const [currentTab, setCurrentTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    unreadCount: 0,
    commentCount: 0,
    favoriteCount: 0,
    viewCount: 0,
    activityCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    loadStats();
    loadNotifications();
    loadChatUnread();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [currentTab]);

  // 加载聊天未读汇总
  const loadChatUnread = async () => {
    try {
      const response = await getChatUnreadCount();
      if (response && response.code === 200 && response.data) {
        const data = response.data;
        const count =
          (typeof data.friendUnreadCount === 'number' ? data.friendUnreadCount : null) ??
          (typeof data.totalUnreadCount === 'number' ? data.totalUnreadCount : 0);
        setChatUnreadCount(count || 0);
      }
    } catch (error) {
      console.error('获取聊天未读汇总失败:', error);
    }
  };

  // 加载统计信息
  const loadStats = async () => {
    try {
      const response = await getNotificationStats();
      if (response.code === 200) {
        setStats(response.data);

        // 即时把最新未读数同步给父组件（App），用于刷新右上角铃铛角标
        if (typeof onUnreadChange === 'function') {
          const data = response.data || {};
          const unread = typeof data.unreadCount === 'number' ? data.unreadCount : 0;
          onUnreadChange(unread);
        }
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  // 加载通知列表
  const loadNotifications = async () => {
    try {
      setLoading(true);
      let response;
      
      if (currentTab === 'all') {
        response = await getNotificationList();
      } else {
        response = await getNotificationsByType(currentTab);
      }

      if (response.code === 200) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('获取通知列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 标记单条通知为已读
  const handleMarkAsRead = async (notificationId, e) => {
    e?.stopPropagation();
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.code === 200) {
        await loadNotifications();
        await loadStats();
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.code === 200) {
        alert(response.data.message || '已全部标记为已读');
        await loadNotifications();
        await loadStats();
      }
    } catch (error) {
      console.error('全部已读失败:', error);
      alert('操作失败：' + error.message);
    }
  };

  // 删除单条通知
  const handleDeleteNotification = async (notificationId, e) => {
    e?.stopPropagation();
    if (!window.confirm('确定要删除这条通知吗？')) return;

    try {
      const response = await deleteNotification(notificationId);
      if (response.code === 200) {
        await loadNotifications();
        await loadStats();
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败：' + error.message);
    }
  };

  // 清空所有已读通知
  const handleDeleteAllRead = async () => {
    if (!window.confirm('确定要清空所有已读通知吗？')) return;

    try {
      const response = await deleteAllReadNotifications();
      if (response.code === 200) {
        alert(response.data.message || '已清空已读通知');
        await loadNotifications();
        await loadStats();
      }
    } catch (error) {
      console.error('清空失败:', error);
      alert('操作失败：' + error.message);
    }
  };

  // 点击通知
  const handleNotificationClick = async (notification) => {
    // 如果未读，先标记为已读
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // 跳转到活动详情页
    if (notification.activityId && onNavigateToActivityDetail) {
      onNavigateToActivityDetail(notification.activityId);
      return;
    }

    // 跳转到帖子详情页
    if (notification.postId && onNavigateToPostDetail) {
      onNavigateToPostDetail({ id: notification.postId });
    }
  };

  // Tab配置
  const tabs = [
    { key: 'all', label: '全部', count: stats.totalCount },
    { key: 'COMMENT', label: '评论', count: stats.commentCount },
    { key: 'FAVORITE', label: '收藏', count: stats.favoriteCount },
    { key: 'VIEW', label: '浏览', count: stats.viewCount },
    { key: 'ACTIVITY_SIGNUP', label: '活动', count: stats.activityCount }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3">
              <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">通知中心</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-xs text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            >
              全部已读
            </button>
            <button
              onClick={handleDeleteAllRead}
              className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              清空已读
            </button>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="flex items-center px-4 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                currentTab === tab.key
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label} ({tab.count})
              {currentTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-32 pb-4">
        {chatUnreadCount > 0 && (
          <div className="mx-4 mb-3 px-4 py-2 bg-indigo-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-indigo-700">
              你有 <span className="font-semibold">{chatUnreadCount}</span> 条未读私信
            </span>
            {onNavigateToCommunity && (
              <button
                onClick={onNavigateToCommunity}
                className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                去聊天查看
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <i className="text-3xl text-gray-400 fa-solid fa-spinner fa-spin"></i>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <i className="text-5xl text-gray-300 mb-4 fa-solid fa-bell-slash"></i>
            <p className="text-gray-500">暂无通知</p>
          </div>
        ) : (
          <div className="space-y-2 px-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start">
                  {/* 用户头像 */}
                  <div className="flex-shrink-0 mr-3">
                    {notification.senderAvatarBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${notification.senderAvatarBase64}`}
                        alt="头像"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {notification.senderUsername?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>

                  {/* 通知内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm text-gray-800 flex-1">
                        <span className="font-medium text-blue-600">
                          {notification.senderUsername || '匿名用户'}
                        </span>
                        <span className="text-gray-600 mx-1">
                          {notification.notificationTypeDesc}
                        </span>
                        {notification.activityTitle && (
                          <span className="text-gray-800 font-medium">
                            《{notification.activityTitle}》
                          </span>
                        )}
                        {notification.postTitle && (
                          <span className="text-gray-800 font-medium">
                            《{notification.postTitle}》
                          </span>
                        )}
                      </p>
                    </div>

                    {/* 评论内容 */}
                    {notification.commentContent && (
                      <div className="bg-gray-50 rounded px-3 py-2 mb-2 text-sm text-gray-700">
                        {notification.commentContent}
                      </div>
                    )}

                    {/* 时间和操作 */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {notification.timeDesc}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            标记已读
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;


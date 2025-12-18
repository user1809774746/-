import React, { useState, useEffect } from 'react';

import API_CONFIG, { 
  getActivityDetail, 
  registerForActivity, 
  quitActivity, 
  reportActivity,
  getFriendsList,
  sendMessage
} from '../api/config';


const ActivityDetailPage = ({ activityId, onBack }) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [registrationData, setRegistrationData] = useState({
    emergencyContact: '',
    emergencyPhone: '',
    specialRequirements: '',
    message: ''
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);
  const [sharingToFriend, setSharingToFriend] = useState(false);

  const DEFAULT_ACTIVITY_IMAGES = ['/活动图片1.jpg', '/活动图片2.jpg', '/活动图片3.jpg'];

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

  const getMediaFromActivity = (activityData) => {
    if (!activityData) {
      return {
        imageUrls: [],
        videoUrls: [],
        coverImageUrl: DEFAULT_ACTIVITY_IMAGES[0]
      };
    }

    const rawImages = typeof activityData.images === 'string' ? activityData.images : '';
    const rawVideos = typeof activityData.videos === 'string' ? activityData.videos : '';

    const imageUrls = Array.from(new Set(
      rawImages
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
        .map((url) => buildActivityMediaUrl(url))
    ));

    const videoUrls = Array.from(new Set(
      rawVideos
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
        .map((url) => buildActivityMediaUrl(url))
    ));


    const defaultCover =
      DEFAULT_ACTIVITY_IMAGES[(activityData.id || 0) % DEFAULT_ACTIVITY_IMAGES.length];

    const primaryCover =
      (activityData.coverImage && activityData.coverImage.trim().length > 0
        ? activityData.coverImage.trim()
        : null) ||
      (imageUrls.length > 0 ? imageUrls[0] : null) ||
      defaultCover;

    const coverImageUrl = buildActivityMediaUrl(primaryCover);

    return { imageUrls, videoUrls, coverImageUrl };
  };

  useEffect(() => {
    if (activityId) {
      loadActivityDetail();
    }
  }, [activityId]);


  const loadActivityDetail = async () => {
    try {
      setLoading(true);
      const response = await getActivityDetail(activityId);
      if (response.code === 200) {
        // 后端返回的数据结构为 { code, message, data: { activity: {...} } }
        // 这里做一层兼容处理，优先取 data.activity，其次直接取 data
        const data = response.data || {};
        const activityData = data.activity || data;
        setActivity(activityData);
      } else {
        setError('获取活动详情失败: ' + response.message);
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
      setError('获取活动详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendsForShare = async () => {
    try {
      setFriendsLoading(true);
      setFriendsError(null);
      const response = await getFriendsList();
      if (response.code === 200) {
        const raw = (response.data && response.data.list) || response.data || [];
        const list = (raw || []).map((friend) => ({
          id: friend.userId || friend.id,
          nickname: friend.nickname || friend.username || '',
          phone: friend.phone,
          avatarUrl: friend.avatar || friend.avatarUrl
        }));
        setFriends(list);
      } else {
        setFriends([]);
        setFriendsError(response.message || '获取好友列表失败');
      }
    } catch (err) {
      setFriends([]);
      setFriendsError(err.message || '获取好友列表失败');
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleShareToFriend = async (friend) => {
    if (!activity || !friend) return;
    const summarySource = activity.summary || activity.description || '';
    const { coverImageUrl } = getMediaFromActivity(activity);
    const payload = {
      activityId: activity.id,
      title: activity.title,
      summary: summarySource ? summarySource.slice(0, 15) : '',
      coverImage: coverImageUrl || null
    };

    const content = '__ACTIVITY_SHARE__' + JSON.stringify(payload);
    try {
      setSharingToFriend(true);
      const response = await sendMessage(friend.id, 'text', content, null);
      if (response.code === 200) {
        setShowShareModal(false);
        alert('已分享给好友');
      } else {
        alert('分享失败：' + (response.message || ''));
      }
    } catch (err) {
      alert('分享失败：' + err.message);
    } finally {
      setSharingToFriend(false);
    }
  };

  const handleShare = () => {
    if (!activity) {
      alert('活动信息尚未加载完成，请稍后再试');
      return;
    }
    setShowShareModal(true);
    if (!friends || friends.length === 0) {
      loadFriendsForShare();
    }
  };

  const handleRegister = async () => {
    try {
      setActionLoading(true);
      // 仅发送后端支持的字段，避免400反序列化错误
      const payload = {
        emergencyContact: registrationData.emergencyContact,
        emergencyPhone: registrationData.emergencyPhone,
        notes: [
          registrationData.specialRequirements && `特殊需求：${registrationData.specialRequirements}`,
          registrationData.message && `留言：${registrationData.message}`
        ]
          .filter(Boolean)
          .join('\n')
      };

      const response = await registerForActivity(activityId, payload);
      if (response.code === 200) {
        if (activity && activity.autoApprove) {
          alert('报名成功！已自动通过，无需审核。');
        } else {
          alert('报名成功！请等待组织者审核。');
        }
        setShowRegisterForm(false);
        loadActivityDetail(); // 刷新活动详情
      } else {
        alert('报名失败: ' + response.message);
      }
    } catch (error) {
      console.error('报名失败:', error);
      alert('报名失败: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    const reason = reportReason.trim();
    if (!reason) {
      alert('请填写举报理由');
      return;
    }

    if (!confirm('确定要举报该活动吗？')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await reportActivity(activityId, reason);
      if (response.code === 200) {
        alert('举报已提交，管理员会尽快审核。');
        setShowReportForm(false);
        setReportReason('');
      } else {
        alert('举报失败: ' + response.message);
      }
    } catch (error) {
      console.error('举报失败:', error);
      alert('举报失败: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuit = async () => {
    if (!confirm('确定要退出这个活动吗？')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await quitActivity(activityId);
      if (response.code === 200) {
        alert('已成功退出活动');
        loadActivityDetail(); // 刷新活动详情
      } else {
        alert('退出失败: ' + response.message);
      }
    } catch (error) {
      console.error('退出失败:', error);
      alert('退出失败: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status, auditStatus) => {
    const key = auditStatus === 'rejected'
      ? (status === 'cancelled' ? 'reported' : 'rejected')
      : status;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">活动不存在</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const { imageUrls, videoUrls, coverImageUrl } = getMediaFromActivity(activity);

  return (

    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800 flex-1">活动详情</h1>
          <button
            onClick={handleShare}
            disabled={actionLoading || !activity}
            className="ml-2 px-3 py-1.5 text-sm rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <i className="fa-solid fa-share-nodes mr-1"></i>
            <span>分享</span>
          </button>
          <button
            onClick={() => setShowReportForm(true)}
            disabled={actionLoading}
            className="ml-2 px-3 py-1.5 text-sm rounded-full border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <i className="fa-solid fa-flag mr-1"></i>
            <span>举报</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 活动媒体展示 */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="relative w-full h-56 bg-gray-100">
            <img
              src={coverImageUrl}
              alt={activity.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          {(imageUrls.length > 1 || videoUrls.length > 0) && (
            <div className="p-3 space-y-3">
              {imageUrls.length > 1 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">活动图片</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {imageUrls.slice(1).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`活动图片 ${index + 2}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
              {videoUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">活动视频</h3>
                  <div className="space-y-2">
                    {videoUrls.map((url, index) => (
                      <video
                        key={index}
                        src={url}
                        controls
                        className="w-full max-h-40 bg-black rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 活动基本信息 */}

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{activity.title}</h2>
            {activity.subtitle && (
              <p className="text-gray-600 mb-2">{activity.subtitle}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {getStatusText(activity.status, activity.auditStatus)}
              </span>
            </div>
          </div>

          {activity.summary && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">{activity.summary}</p>
            </div>
          )}

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
          </div>
        </div>

        {/* 时间信息 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3">时间安排</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">开始时间：</span>
              <span className="font-medium">{formatDateTime(activity.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">结束时间：</span>
              <span className="font-medium">{formatDateTime(activity.endTime)}</span>
            </div>
            {activity.durationHours && (
              <div className="flex justify-between">
                <span className="text-gray-600">活动时长：</span>
                <span className="font-medium">{activity.durationHours} 小时</span>
              </div>
            )}
            {activity.registrationStart && (
              <div className="flex justify-between">
                <span className="text-gray-600">报名开始：</span>
                <span className="font-medium">{formatDateTime(activity.registrationStart)}</span>
              </div>
            )}
            {activity.registrationEnd && (
              <div className="flex justify-between">
                <span className="text-gray-600">报名截止：</span>
                <span className="font-medium">{formatDateTime(activity.registrationEnd)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 地点信息 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3">地点信息</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">目的地：</span>
              <span className="font-medium">{activity.locationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">城市：</span>
              <span className="font-medium">{activity.city}</span>
            </div>
            {activity.province && (
              <div className="flex justify-between">
                <span className="text-gray-600">省份：</span>
                <span className="font-medium">{activity.province}</span>
              </div>
            )}
            {activity.address && (
              <div className="flex justify-between">
                <span className="text-gray-600">详细地址：</span>
                <span className="font-medium">{activity.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* 参与信息 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3">参与信息</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">当前参与：</span>
              <span className="font-medium">
                {activity.currentParticipants || 0}
                {activity.maxParticipants > 0 && ` / ${activity.maxParticipants}`} 人
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最少人数：</span>
              <span className="font-medium">{activity.minParticipants} 人</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">年龄限制：</span>
              <span className="font-medium">{activity.ageMin} - {activity.ageMax} 岁</span>
            </div>
          </div>
        </div>

        {/* 费用信息 */}
        {(activity.price > 0 || activity.originalPrice > 0) && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-3">费用信息</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">活动价格：</span>
                <span className="font-medium text-red-600">
                  {activity.price > 0 ? `¥${activity.price}` : '免费'}
                </span>
              </div>
              {activity.originalPrice > 0 && activity.originalPrice !== activity.price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">原价：</span>
                  <span className="text-gray-500 line-through">¥{activity.originalPrice}</span>
                </div>
              )}
              {activity.refundPolicy && (
                <div className="mt-3">
                  <span className="text-gray-600">退款政策：</span>
                  <p className="text-sm text-gray-700 mt-1">{activity.refundPolicy}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 组织者信息 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3">组织者信息</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">组织者：</span>
              <span className="font-medium">{activity.organizerName}</span>
            </div>
            {activity.contactPhone && (
              <div className="flex justify-between">
                <span className="text-gray-600">联系电话：</span>
                <span className="font-medium">{activity.contactPhone}</span>
              </div>
            )}
            {activity.contactEmail && (
              <div className="flex justify-between">
                <span className="text-gray-600">联系邮箱：</span>
                <span className="font-medium">{activity.contactEmail}</span>
              </div>
            )}
            {activity.contactWechat && (
              <div className="flex justify-between">
                <span className="text-gray-600">微信号：</span>
                <span className="font-medium">{activity.contactWechat}</span>
              </div>
            )}
          </div>
        </div>

        {/* 其他信息 */}
        {(activity.requirements || activity.equipment || activity.notes || activity.tags) && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-3">其他信息</h3>
            <div className="space-y-3">
              {activity.tags && (
                <div>
                  <span className="text-gray-600 block mb-1">标签：</span>
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.split(',').map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {activity.requirements && (
                <div>
                  <span className="text-gray-600 block mb-1">参与要求：</span>
                  <p className="text-sm text-gray-700">{activity.requirements}</p>
                </div>
              )}
              {activity.equipment && (
                <div>
                  <span className="text-gray-600 block mb-1">装备要求：</span>
                  <p className="text-sm text-gray-700">{activity.equipment}</p>
                </div>
              )}
              {activity.notes && (
                <div>
                  <span className="text-gray-600 block mb-1">注意事项：</span>
                  <p className="text-sm text-gray-700">{activity.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex gap-3">
            <button
              onClick={() => setShowRegisterForm(true)}
              disabled={actionLoading || activity.status !== 'published'}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? '处理中...' : '报名参加'}
            </button>
            <button
              onClick={handleQuit}
              disabled={actionLoading}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? '处理中...' : '退出活动'}
            </button>
          </div>
        </div>
      </div>

      {/* 分享给好友弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-800">选择好友分享</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {friendsLoading ? (
                <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  <span>正在加载好友列表...</span>
                </div>
              ) : friendsError ? (
                <div className="px-4 py-4 text-center text-sm text-red-500">
                  <p className="mb-2">{friendsError}</p>
                  <button
                    onClick={loadFriendsForShare}
                    className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    重新加载
                  </button>
                </div>
              ) : friends.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  暂无好友可以分享
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {friends.map((friend) => (
                    <li
                      key={friend.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => !sharingToFriend && handleShareToFriend(friend)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3">
                          {friend.avatarUrl ? (
                            <img
                              src={friend.avatarUrl}
                              alt={friend.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-blue-600">
                              {(friend.nickname || friend.phone || 'U').slice(-2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {friend.nickname || friend.phone || '未命名'}
                          </div>
                          {friend.phone && (
                            <div className="text-xs text-gray-400">{friend.phone}</div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        {sharingToFriend ? '发送中...' : '发送'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 报名表单弹窗 */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">报名参加活动</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">紧急联系人</label>
                <input
                  type="text"
                  value={registrationData.emergencyContact}
                  onChange={(e) => setRegistrationData(prev => ({...prev, emergencyContact: e.target.value}))}
                  placeholder="请输入紧急联系人姓名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">紧急联系电话</label>
                <input
                  type="tel"
                  value={registrationData.emergencyPhone}
                  onChange={(e) => setRegistrationData(prev => ({...prev, emergencyPhone: e.target.value}))}
                  placeholder="请输入紧急联系电话"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">特殊需求</label>
                <textarea
                  value={registrationData.specialRequirements}
                  onChange={(e) => setRegistrationData(prev => ({...prev, specialRequirements: e.target.value}))}
                  placeholder="请输入特殊需求（可选）"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">留言</label>
                <textarea
                  value={registrationData.message}
                  onChange={(e) => setRegistrationData(prev => ({...prev, message: e.target.value}))}
                  placeholder="给组织者的留言（可选）"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRegisterForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleRegister}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {actionLoading ? '提交中...' : '确认报名'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">举报活动</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">举报理由</label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="请描述该活动存在的问题，例如涉嫌违法、虚假信息等"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowReportForm(false); setReportReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleReport}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? '提交中...' : '提交举报'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;

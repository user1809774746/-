import React, { useState, useEffect } from 'react';
import {
  getLocalActivities,
  getRecommendedActivities,
  getMyActivities,
  getActivityDetail,
  registerForActivity,
  quitActivity,
  reportActivity,
  getUserProfile,
} from '../api/config';
import ActivityCreatePage from './ActivityCreatePage';
import ActivityListItem from './ActivityListItem';
import ActivityDetailPage from './ActivityDetailPage';

const ActivityPage = ({
  onBack,
  onNavigateToUserCenter,
  onNavigateToRealName,
}) => {

  // 活动相关状态
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState(null);
  const [activeActivityTab, setActiveActivityTab] = useState('local'); // local, recommended, my
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  const [isRealNameVerified, setIsRealNameVerified] = useState(false);
  const [showRealNameModal, setShowRealNameModal] = useState(false);

  // 加载活动数据

  const loadActivities = async () => {
    try {
      setActivityLoading(true);
      setActivityError(null);
      
      let response;
      switch (activeActivityTab) {
        case 'local':
          response = await getLocalActivities();
          break;
        case 'recommended':
          response = await getRecommendedActivities();
          break;
        case 'my':
          response = await getMyActivities();
          break;
        default:
          response = await getRecommendedActivities();
      }
      
      if (response.code === 200) {
        const activityData = response.data;
        // 处理同城活动的特殊数据结构
        if (activeActivityTab === 'local' && activityData.activities) {
          setActivities(activityData.activities);
        } else if (Array.isArray(activityData)) {
          setActivities(activityData);
        } else {
          setActivities([]);
        }
      } else {
        throw new Error(response.message || '获取活动失败');
      }
    } catch (err) {
      console.error('加载活动失败:', err);
      setActivityError(err.message);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };
  
  // 处理活动卡片点击
  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowActivityDetail(true);
  };
  
  // 报名活动
  const handleRegisterActivity = async (activityId) => {
    try {
      const registrationData = {
        notes: '',
        emergencyContact: '',
        emergencyPhone: '13800138000' // 这里应该从用户输入获取
      };
      
      const response = await registerForActivity(activityId, registrationData);
      if (response.code === 200) {
        alert('报名成功！');
        // 刷新活动详情
        if (selectedActivity && selectedActivity.activity.id === activityId) {
          const detailResponse = await getActivityDetail(activityId);
          if (detailResponse.code === 200) {
            setSelectedActivity(detailResponse.data);
          }
        }
      } else {
        alert('报名失败: ' + response.message);
      }
    } catch (err) {
      console.error('报名失败:', err);
      alert('报名失败: ' + err.message);
    }
  };
  
  // 退出活动
  const handleQuitActivity = async (activityId) => {
    if (!confirm('确定要退出此活动吗？')) return;
    
    try {
      const response = await quitActivity(activityId);
      if (response.code === 200) {
        alert('已退出活动');
        // 刷新活动详情
        if (selectedActivity && selectedActivity.activity.id === activityId) {
          const detailResponse = await getActivityDetail(activityId);
          if (detailResponse.code === 200) {
            setSelectedActivity(detailResponse.data);
          }
        }
      } else {
        alert('退出失败: ' + response.message);
      }
    } catch (err) {
      console.error('退出失败:', err);
      alert('退出失败: ' + err.message);
    }
  };
  
  // 举报活动
  const handleReportActivity = async (activityId, reason) => {
    try {
      const response = await reportActivity(activityId, reason);
      if (response.code === 200) {
        alert('举报成功，我们会尽快处理');
      } else {
        alert('举报失败: ' + response.message);
      }
    } catch (err) {
      console.error('举报失败:', err);
      alert('举报失败: ' + err.message);
    }
  };

  // 初始加载和标签切换时加载活动
  useEffect(() => {
    loadActivities();
  }, [activeActivityTab]);

  // 加载用户实名状态
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res && res.code === 200 && res.data) {
          setIsRealNameVerified(!!res.data.realNameVerified);
        } else {
          setIsRealNameVerified(false);
        }
      } catch (e) {
        console.error('获取用户信息失败:', e);
        setIsRealNameVerified(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCreateActivityClick = () => {
    if (!isRealNameVerified) {
      setShowRealNameModal(true);
      return;
    }
    setShowCreateActivity(true);
  };

  // 如果显示创建活动页面
  if (showCreateActivity) {

    return (
      <ActivityCreatePage
        onBack={() => setShowCreateActivity(false)}
        onSuccess={() => {
          setShowCreateActivity(false);
          // 刷新活动列表
          loadActivities();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800">精彩活动</h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-20 px-4">
        {/* 活动子标签栏 */}
        <div className="bg-white border-b border-gray-200 mb-4">
          <div className="flex">
            <button
              onClick={() => setActiveActivityTab('local')}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeActivityTab === 'local'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              同城
            </button>
            <button
              onClick={() => setActiveActivityTab('recommended')}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeActivityTab === 'recommended'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              推荐
            </button>
            <button
              onClick={() => setActiveActivityTab('my')}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeActivityTab === 'my'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              我的
            </button>
          </div>
        </div>

        {/* 活动加载与错误提示 */}
        {activityLoading && (
          <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
            <i className="fa-solid fa-spinner fa-spin mr-1"></i>
            <span>加载中...</span>
          </div>
        )}
        
        {activityError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <div className="flex items-center text-sm text-yellow-800">
              <i className="fa-solid fa-exclamation-triangle mr-2"></i>
              <span>加载失败: {activityError}</span>
            </div>
          </div>
        )}
        
        {/* 发布活动按钮 + 活动列表（交错布局） */}
        <div className="columns-2 gap-4">
          <div style={{ breakInside: 'avoid' }}>
            <button
              onClick={handleCreateActivityClick}
              className="w-full mb-4 py-6 text-sm font-semibold text-white rounded-xl shadow flex items-center justify-center transform transition-transform hover:-translate-y-0.5"
              style={{
                backgroundImage: 'url("/写帖子按钮背景.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: isRealNameVerified ? 1 : 0.6,
                cursor: isRealNameVerified ? 'pointer' : 'not-allowed'
              }}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              发布活动
            </button>
          </div>

          {activities.map((activity, index) => (
            <div key={activity.id} className="mb-4" style={{ breakInside: 'avoid' }}>
              <ActivityListItem
                activity={activity}
                onClick={handleActivityClick}
                showStatus={activeActivityTab === 'my'}
                imageIndex={index}
              />
            </div>
          ))}
        </div>
        
        {/* 空状态 */}
        {!activityLoading && activities.length === 0 && (
          <div className="text-center py-8">
            <i className="fa-solid fa-calendar-days text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 mb-2">
              {activeActivityTab === 'local' ? '暂无同城活动' :
               activeActivityTab === 'recommended' ? '暂无推荐活动' :
               '暂无我的活动'}
            </p>
            <p className="text-sm text-gray-400">
              {activeActivityTab === 'my' ? '快来发布第一个活动吧！' : '敬请期待更多精彩活动'}
            </p>
          </div>
        )}
      </div>

      {showRealNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-5 mx-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">需要实名认证</h2>
            <p className="text-sm text-gray-600 mb-4">
              发布活动前需要先完成实名认证，请前往“我的-实名认证”完成实名。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRealNameModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowRealNameModal(false);
                  onNavigateToRealName && onNavigateToRealName();
                }}
                className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
              >
                前去实名认证
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 活动详情页面 */}
      {showActivityDetail && selectedActivity && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">

          <ActivityDetailPage
            activityId={selectedActivity.id}
            onBack={() => {
              setShowActivityDetail(false);
              // 刷新活动列表
              loadActivities();
            }}
            onRegister={handleRegisterActivity}
            onQuit={handleQuitActivity}
            onReport={handleReportActivity}
            onNavigateToUserCenter={onNavigateToUserCenter}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityPage;

import React, { useState, useEffect, useRef } from "react";
import { getUserProfile, getAvatarBase64, logout, getUnreadNotificationCount, getAttractionFavoritesCount, getUserTotalTravelPlans, getBackgroundImageBase64, uploadBackgroundImage, getLatestPost, apiRequest, API_CONFIG, getCurrentUserId } from '../api/config';
import MinePageSkeleton from './MinePageSkeleton';
import AiEntryModal from './AiEntryModal';
// import AiFloatingButton from './AiFloatingButton'
// import AiFloatingButton from '../components/AiFloatingButton';




const MinePage = ({onNavigateToAi, onBackToHome, onNavigateToDiscover, onLogout, onNavigateToHistory, onNavigateToFavorites, onNavigateToMyPosts, onNavigateToNotifications, onNavigateToFeedback, onNavigateToMyTravals, onNavigateToCommunity, onNavigateToProfileEdit, onNavigateToActivityReview, onNavigateToPrivacySettings, onNavigateToMyFootprints, chatUnreadCount = 0, notificationUnreadCount = 0 ,}) => {



  const [userInfo, setUserInfo] = useState({
    username: '',
    userId: '',
    gender: '',
    avatarText: '',
    realName: '',
    realNameVerified: false,
  });


  const [stats, setStats] = useState({
    totalTrips: 0,
    favoriteSpots: 0,
    totalTravelPlans: 0,
    totalDistance: 0
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [avatarImage, setAvatarImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [latestPost, setLatestPost] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // 监控latestPost状态变化
  useEffect(() => {
    console.log('🔄 latestPost state更新:', latestPost);
  }, [latestPost]);
  const notificationTimerRef = useRef(null);
  const backgroundFileInputRef = useRef(null);
  const settingsMenuRef = useRef(null);

  // 加载头像（Base64）
  const fetchUserAvatar = async () => {
    try {
      const response = await getAvatarBase64();
      if (response.code === 200 && response.data?.avatar) {
        setAvatarImage(response.data.avatar);
      }
    } catch (error) {
      console.log('获取头像失败:', error.message);
      setAvatarImage(null);
    }
  };

  // 加载背景图片
  const fetchBackgroundImage = async () => {
    try {
      const response = await getBackgroundImageBase64();
      if (response.code === 200 && response.data?.backgroundImage) {
        setBackgroundImage(response.data.backgroundImage);
      }
    } catch (error) {
      console.log('获取背景图片失败:', error.message);
      setBackgroundImage(null);
    }
  };

  // 触发背景图片选择
  const handleBackgroundClick = () => {
    if (backgroundFileInputRef.current) {
      backgroundFileInputRef.current.click();
    }
  };

  // 处理背景图片上传
  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBackground(true);
      
      // 调用上传接口
      const response = await uploadBackgroundImage(file);
      
      if (response && response.code === 200) {
        console.log('✅ 背景图片上传成功');
        // 重新加载背景图片
        await fetchBackgroundImage();
        alert('背景图片上传成功！');
      } else {
        throw new Error(response?.message || '上传失败');
      }
    } catch (error) {
      console.error('❌ 背景图片上传失败:', error);
      alert('背景图片上传失败：' + (error.message || '未知错误'));
    } finally {
      setIsUploadingBackground(false);
      // 清空input，允许重复选择同一文件
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // 加载未读通知数
  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      if (response.code === 200) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.log('获取未读通知数量失败:', error.message);
    }
  };

  // 加载收藏统计（景点）
  const loadFavoriteStats = async () => {
    try {
      setStatsLoading(true);
      const response = await getAttractionFavoritesCount();
      if (response.code === 200) {
        let attractionCount = 0;
        if (typeof response.data === 'number') {
          attractionCount = response.data;
        } else if (response.data && typeof response.data === 'object') {
          attractionCount = response.data.totalAttractions || 0;
        }
        setStats(prev => ({ ...prev, favoriteSpots: Number(attractionCount) || 0 }));
      }
    } catch (error) {
      console.warn('获取收藏景点数量失败:', error);
      const localFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
      setStats(prev => ({ ...prev, favoriteSpots: localFavorites.length }));
    } finally {
      setStatsLoading(false);
    }
  };

  const loadTotalTravelPlans = async (targetUserId) => {
    try {
      const effectiveUserId = targetUserId || userInfo.userId;
      if (!effectiveUserId) return;
      setStatsLoading(true);
      const response = await getUserTotalTravelPlans(effectiveUserId);
      if (response.code === 200 && response.data) {
        const total = typeof response.data.totalTravel === 'number'
          ? response.data.totalTravel
          : Number(response.data.totalTravel) || 0;
        setStats(prev => ({ ...prev, totalTravelPlans: total }));
      }
    } catch (error) {
      console.warn('获取旅行计划总数失败:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadVisitedCitiesCount = async (targetUserId) => {
    try {
      const effectiveUserId = targetUserId || userInfo.userId;
      if (!effectiveUserId) return;
      
      const plansEndpoint = `${API_CONFIG.ENDPOINTS.GET_USER_TRAVEL_PLANS}/${effectiveUserId}`;
      const plansResponse = await apiRequest(plansEndpoint, { method: 'GET' });

      const travelPlans =
        plansResponse &&
        plansResponse.data &&
        Array.isArray(plansResponse.data.travelPlans)
          ? plansResponse.data.travelPlans
          : [];

      const activePlans = travelPlans.filter(
        (plan) => plan && (plan.status === 'active' || plan.status === 'completed')
      );

      if (!activePlans.length) {
        setStats(prev => ({ ...prev, totalTrips: 0 }));
        return;
      }

      const cityListPromises = activePlans
        .map((plan) => {
          const id = plan.id;
          if (!id) return null;
          const endpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_CITY_LIST.replace(
            '{id}',
            id
          );
          return apiRequest(endpoint, { method: 'GET' }).catch((error) => {
            console.error('获取旅行计划城市列表失败:', error);
            return null;
          });
        })
        .filter(Boolean);

      const cityListResponses = await Promise.all(cityListPromises);

      const allCityNames = [];
      cityListResponses.forEach((res) => {
        if (
          res &&
          res.data &&
          res.data.cities &&
          Array.isArray(res.data.cities)
        ) {
          res.data.cities.forEach((name) => {
            if (name && typeof name === 'string') {
              allCityNames.push(name);
            }
          });
        }
      });

      const uniqueCities = Array.from(new Set(allCityNames));
      setStats(prev => ({ ...prev, totalTrips: uniqueCities.length }));
    } catch (error) {
      console.warn('获取被点亮城市数量失败:', error);
      setStats(prev => ({ ...prev, totalTrips: 0 }));
    }
  };

  // 加载最近发布的帖子
  const loadLatestPost = async (userId) => {
    try {
      if (!userId) {
        console.log('⚠️ userId为空，无法获取最近帖子');
        return;
      }
      
      console.log('🔍 开始获取最近发布的帖子... userId:', userId);
      const response = await getLatestPost(userId);
      console.log('📦 获取帖子响应:', response);
      
      if (response.code === 200 && response.data) {
        console.log('✅ 最新帖子数据:', response.data);
        console.log('� 帖子封面:', response.data.coverImage);
        console.log('🖼️ 帖子图片列表:', response.data.images);
        setLatestPost(response.data);
      } else if (response.code === 404) {
        console.log('⚠️ 该用户暂无已发布的帖子');
        setLatestPost(null);
      } else {
        console.log('⚠️ 响应码不是200:', response);
        setLatestPost(null);
      }
    } catch (error) {
      console.error('❌ 获取最近发布的帖子失败:', error);
      setLatestPost(null);
    }
  };

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await getUserProfile();
        let resolvedUserInfo;
        if (profileRes?.code === 200 && profileRes.data) {
          const data = profileRes.data;
          resolvedUserInfo = {
            username: data.username || '未命名',
            userId: data.userId || data.id || '',
            gender: data.gender || '',
            avatarText: (data.username || 'U').slice(-2),
            realName: data.realName || '',
            realNameVerified: !!data.realNameVerified,
          };
          setUserInfo(resolvedUserInfo);
        } else {
          const phone = localStorage.getItem('user_phone') || '';
          resolvedUserInfo = { username: phone, userId: '', gender: '', avatarText: (phone || 'U').slice(-2), realName: '', realNameVerified: false };
          setUserInfo(resolvedUserInfo);
        }


        await fetchUserAvatar();
        await fetchBackgroundImage();
        await loadUnreadCount();
        await loadFavoriteStats();
        await loadVisitedCitiesCount(resolvedUserInfo.userId);
        await loadTotalTravelPlans(resolvedUserInfo.userId);
        await loadLatestPost(resolvedUserInfo.userId);
      } catch (e) {
        const phone = localStorage.getItem('user_phone') || '';
        setUserInfo({ username: phone, userId: '', gender: '', avatarText: (phone || 'U').slice(-2) });
        await fetchUserAvatar();
        await fetchBackgroundImage();
        await loadUnreadCount();
        await loadFavoriteStats();
        // catch块中无userId，不调用loadLatestPost
      }

      notificationTimerRef.current = setInterval(loadUnreadCount, 30000);
    };

    init();
    return () => {
      if (notificationTimerRef.current) clearInterval(notificationTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof notificationUnreadCount === 'number') {
      setUnreadCount(notificationUnreadCount);
    }
  }, [notificationUnreadCount]);

  // 点击外部关闭设置菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  const handleLogout = async () => {
    if (window.confirm('确定退出登录吗？')) {
      try {
        await logout();
        console.log('✅ 服务器端注销成功');
      } catch (error) {
        console.log('⚠️ 服务器端注销失败:', error.message);
      }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_phone');
      localStorage.removeItem('user_type');
      localStorage.removeItem('login_time');
      localStorage.removeItem('login_mode');
      localStorage.removeItem('login_type');
      onLogout?.();
    }
  };

  const menuItems = [
    { id: 1, title: '发布', iconImage: '/我的发布 (2).png', hasArrow: true },
    { id: 2, title: '收藏', iconImage: '/我的收藏.png', hasArrow: true },
    // { id: 3, title: '历史记录', iconImage: '/历史记录 (2).png', hasArrow: true },
    { id: 4, title: '活动', iconImage: '/报名活动审核.png', hasArrow: true },
    // { id: 5, title: '隐私设置', iconImage: '/隐私设置.png', hasArrow: true },
    // { id: 6, title: '我的钱包', iconImage: '/我的钱包.png', hasArrow: true },
  ];

  const systemItems = [
    { id: 1, title: '帮助与反馈', icon: 'fa-solid fa-question-circle', color: 'text-blue-600' },
    { id: 2, title: '关于我们', icon: 'fa-solid fa-info-circle', color: 'text-blue-600' },
    { id: 3, title: '实名认证', icon: 'fa-solid fa-id-card', color: 'text-blue-600' },
  ];


  const handleMenuItemClick = (itemId) => {
    switch (itemId) {
      case 1:
        onNavigateToMyPosts && onNavigateToMyPosts();
        break;
      case 2:
        onNavigateToFavorites && onNavigateToFavorites();
        break;
      case 3:
        onNavigateToHistory && onNavigateToHistory();
        break;
      case 4:
        onNavigateToActivityReview && onNavigateToActivityReview();
        break;
      case 5:
        onNavigateToPrivacySettings && onNavigateToPrivacySettings();
        break;
      case 6:
        onNavigateToMyTravals && onNavigateToMyTravals();
        break;
      default:
        break;
    }
  };

  const handleSystemMenuClick = (itemId) => {
    switch (itemId) {
      case 1:
        onNavigateToFeedback && onNavigateToFeedback();
        break;
      case 2:
        alert('关于我们功能即将上线');
        break;
      case 3:
        onNavigateToRealName && onNavigateToRealName();
        break;

      default:
        break;
    }
  };

  // 🎨 初始加载时显示骨架屏
  const isInitialLoading = statsLoading && !userInfo.username;
  
  if (isInitialLoading) {
    return <MinePageSkeleton />;
  }

  return (
    <>
    {/* <AiFloatingButton onNavigateToAi={onNavigateToAi} /> */}
    <div className="flex flex-col min-h-screen mb-5">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm bg-gray-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => { onNavigateToNotifications && onNavigateToNotifications(); }}
            className="text-GuText hover:text-gray-600 transition-colors relative"
          >
            <i className="text-xl fa-solid fa-bell"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <h1 className="text-lg font-bold text-gray-800"> </h1>
          
          {/* 设置按钮 */}
          <div className="relative" ref={settingsMenuRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="text-GuText hover:text-gray-600 transition-colors relative"
            >
              <i className="text-xl fa-solid fa-cog"></i>
            </button>
            
            {/* 下拉菜单 */}
            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                {systemItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      handleSystemMenuClick(item.id);
                      setShowSettingsMenu(false);
                    }}
                    className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center mr-3">
                      <i className={`${item.icon} ${item.color} text-sm`}></i>
                    </div>
                    <span className="text-gray-800 text-sm">{item.title}</span>
                  </div>
                ))}
                
                {/* 隐私设置 */}
                <div
                  onClick={() => {
                    onNavigateToPrivacySettings && onNavigateToPrivacySettings();
                    setShowSettingsMenu(false);
                  }}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="w-6 h-6 flex items-center justify-center mr-3">
                    <i className="fa-solid fa-lock text-blue-600 text-sm"></i>
                  </div>
                  <span className="text-gray-800 text-sm">隐私设置</span>
                </div>
                
                {/* 退出登录 */}
                <div
                  onClick={() => {
                    handleLogout();
                    setShowSettingsMenu(false);
                  }}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <div className="w-6 h-6 flex items-center justify-center mr-3">
                    <i className="fa-solid fa-sign-out-alt text-red-400 text-sm"></i>
                  </div>
                  <span className="text-red-400 text-sm font-medium">退出登录</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 pb-15 mt-3">
        {/* User Info Card - 背景图片样式 */}
        <div className="mx-4 mt-4 mb-2">
          <div className="relative rounded-xl shadow-lg overflow-hidden" style={{ minHeight: '250px' }}>
            {/* 隐藏的文件输入 */}
            <input
              ref={backgroundFileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
            
            {/* 背景图片区域 */}
            <div 
              className="absolute inset-0 w-full h-full cursor-pointer group"
              onClick={handleBackgroundClick}
              style={{
                backgroundImage: backgroundImage 
                  ? `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%), url(${backgroundImage})`
                  : `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%), url('/默认背景图片.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
              
              {/* 悬停提示 - 相机图标 */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-3">
                  {isUploadingBackground ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-white text-2xl"></i>
                      <span className="text-white font-medium">上传中...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-camera text-white text-2xl"></i>
                      <span className="text-white font-medium">点击更换背景图片</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="relative z-[1] p-4 h-full flex flex-col justify-end pointer-events-none" style={{ minHeight: '250px' }}>
              {/* 用户头像和信息 - 左下角 */}
              <div className="absolute bottom-8 left-4 flex items-center gap-3 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                {/* 头像 */}
                <div 
                  className="relative cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={onNavigateToProfileEdit}
                >
                  <div className="w-24 h-24 rounded-2xl bg-white p-[1px] shadow-xl overflow-hidden">
                    {avatarImage ? (
                      <img src={avatarImage} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">{userInfo.avatarText || 'U'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 用户信息 */}
                <div className="flex flex-col justify-center gap-1">
                  <h2 className="text-white text-xl font-bold drop-shadow-lg">{userInfo.username || '未命名'}</h2>
                  <p className="text-white text-xs drop-shadow-lg">游号: {String(userInfo.userId || '未知')}</p>
                  <p className="text-white text-xs drop-shadow-lg">
                    实名状态: {userInfo.realNameVerified ? '已实名认证' : '未实名认证'}
                  </p>
                </div>

              </div>

              {/* 用户信息 - 右侧区域 */}
              {/* <div className="ml-32 mb-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{userInfo.username || '未命名'}</h2>
                  <p className="text-xs text-gray-600">游号: {String(userInfo.userId || '未知')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    性别: {userInfo.gender === 'male' ? '男' : userInfo.gender === 'female' ? '女' : '保密'}
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* 统计数据卡片 */}
        <div className="mx-4 mb-6 mt-5">
          <div className="grid grid-cols-2 gap-3">
            {/* 我的计划卡片 - 左侧大卡片 */}
            <div 
              className="row-span-2 rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{
                backgroundImage: `url('/春1.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '200px'
              }}
              onClick={() => { onNavigateToMyTravals && onNavigateToMyTravals(); }}
            >
              {/* 遮罩层 */}
              <div className="absolute inset-0"></div>
              
              {/* 内容 */}
              <div className="relative z-10 h-full flex flex-col justify-between text-white">
                <div>
                  <h3 className="text-xl font-bold mb-1">我的计划</h3>
                  <p className="text-sm opacity-90">旅行规划</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {statsLoading ? (
                      <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                    ) : (
                      String(stats.totalTravelPlans || 0)
                    )}
                  </div>
                  <div className="bg-white/30 rounded-full px-3 py-1 text-sm">
                    {stats.totalTravelPlans || 0} 个计划
                  </div>
                </div>
              </div>
            </div>

            {/* 我的足迹卡片 - 右上 */}
            <div 
              className="rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{
                backgroundImage: `url('/夏1.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '95px'
              }}
              onClick={() => { onNavigateToMyFootprints && onNavigateToMyFootprints(); }}
            >
              {/* 遮罩层 */}
              <div className="absolute inset-0"></div>
              
              {/* 内容 */}
              <div className="relative z-10 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold">我的足迹</h3>
                  <div className="bg-white/30 rounded-full px-2 py-0.5 text-xs">
                    {String(stats.totalTrips || 0)}次
                  </div>
                </div>
                <div className="text-2xl font-bold">{String(stats.totalTrips || 0)}</div>
              </div>
            </div>

            {/* 总里程卡片 - 右下 */}
            <div 
              className="rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{
                backgroundImage: `url('/冬.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '95px'
              }}
            >
              {/* 遮罩层 */}
              <div className="absolute inset-0"></div>
              
              {/* 内容 */}
              <div className="relative z-10 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold">总里程</h3>
                  <div className="bg-white/30 rounded-full px-2 py-0.5 text-xs">
                    km
                  </div>
                </div>
                <div className="text-2xl font-bold">{String(stats.totalDistance || 0)}</div>
              </div>
            </div>
          </div>
        </div>


        {/* Quick Actions */}
        {/* <div className="mb-6 mt-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-6">
              {/* {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <div className="w-14 h-14 flex items-center justify-center mb-2">
                    <img
                      src={item.iconImage}
                      alt={item.title}
                      className={`object-contain ${item.id === 2 ? 'w-16 h-16' : 'w-14 h-14'}`}
                    />
                  </div>
                  <span className="text-sm text-gray-600 text-center font-medium">{item.title}</span>
                </div>
<<<<<<< Updated upstream
              ))}
=======
              ))} * /}

            </div>
          </div>
        </div> */}

        {/* 我的发布板块 */}
        <div className="mx-4 mb-6 mt-5">
          <div 
            className="rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
            style={{
              backgroundImage: `url('/秋.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '150px'
            }}
            onClick={() => { onNavigateToMyPosts && onNavigateToMyPosts(); }}
          >
            {/* 遮罩层 */}
            <div className="absolute inset-0"></div>
            
            {/* 内容 */}
            <div className="relative z-10 h-full flex flex-col gap-3">
              {/* 顶部标题 */}
              <div className="flex-shrink-0">
                <h3 className="text-xl font-bold" style={{ color: 'rgba(255, 255, 255, 1)' }}>我的发布</h3>
              </div>
              
              {/* 底部帖子卡片 */}
              {latestPost ? (
                <div 
                  className="bg-white/70 rounded-lg p-3 flex items-center gap-3"
                >
                  {/* 帖子缩略图 */}
                  <div className="flex-shrink-0">
                    {latestPost.coverImage || (latestPost.images && latestPost.images.length > 0) ? (
                      <img 
                        src={latestPost.coverImage || latestPost.images[0]} 
                        alt="最近发布" 
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <i className="fa-solid fa-image text-gray-400 text-2xl"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* 帖子信息 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {latestPost.title || '无标题'}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {latestPost.summary || (latestPost.content ? latestPost.content.substring(0, 20) + '...' : '最近发布')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-white text-xs">
                  {console.log('渲染时latestPost为空')}
                  暂无帖子
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 我的收藏和活动管理板块 */}
        <div className="mx-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            {/* 我的收藏 */}
            <div 
              className="rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{
                backgroundImage: `url('/春3.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '150px'
              }}
              onClick={() => { onNavigateToFavorites && onNavigateToFavorites(); }}
            >
              {/* 遮罩层 */}
              <div className="absolute inset-0"></div>
              
              {/* 内容 */}
              <div className="relative z-10 h-full flex flex-col justify-start text-white">
                <h3 className="text-xl font-bold">我的收藏</h3>
              </div>
            </div>

            {/* 活动管理 */}
            <div 
              className="rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{
                backgroundImage: `url('/夏2.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '150px'
              }}
              onClick={() => { onNavigateToActivityReview && onNavigateToActivityReview(); }}
            >
              {/* 遮罩层 */}
              <div className="absolute inset-0"></div>
              
              {/* 内容 */}
              <div className="relative z-10 h-full flex flex-col justify-start text-white">
                <h3 className="text-xl font-bold">活动管理</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Menu List */}
        {/* <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {systemItems.map((item, index) => (
              <div key={item.id} onClick={() => handleSystemMenuClick(item.id)} className={`flex items-center px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${index !== systemItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <i className={`${item.icon} ${item.color} text-sm`}></i>
                </div>
                <span className="flex-1 text-gray-800">{item.title}</span>
                <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
              </div>
            ))}
          </div>
        </div> */}

        {/* Logout Button */}
        {/* <div className="mx-4 mb-10">
          <button onClick={handleLogout} className="w-full bg-white border-2 border-red-200 text-red-400 py-4 rounded-3xl font-medium hover:bg-red-50 transition-colors">
            <i className="fa-solid fa-sign-out-alt mr-2"></i>
            退出登录
          </button>
        </div> */}

        {/* App Info */}
        {/* <div className="mx-4 text-center">
          <p className="text-gray-400 text-xs mb-1">好游 v1.0.0</p>
          <p className="text-gray-400 text-xs">让旅行更简单</p>
        </div> */}
        
        {/* 底部间距，留给底部导航栏空间 */}
        <div className="pb-20"></div>
      </div>

      {/* AI入口弹窗 */}
      <AiEntryModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
        onGeneratePlan={() => {
          setShowAiModal(false);
          if (onNavigateToAi) {
            onNavigateToAi('create');
          }
        }}
        onChat={() => {
          setShowAiModal(false);
          if (onNavigateToAi) {
            onNavigateToAi('chat');
          }
        }}
      />
      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-gray-200 shadow-lg z-50 safe-area-bottom rounded-t-3xl"
        style={{
          backgroundImage: 'url("/导航背景.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >

      <div className="flex items-center justify-around h-16 relative">
        <button
          className="flex flex-col items-center justify-center flex-1 transition-all text-gray-400 hover:text-gray-600"
          onClick={() => {
            // 当前页面，滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onBackToHome&&onBackToHome()
          }}
        >
          <img className="w-10 h-10" src="/首页3.png"/>
          <span className="text-sm font-blod mb-1">首页</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
          onClick={() => {
            console.log('🔍 导航到发现页面');
            onNavigateToDiscover && onNavigateToDiscover();
          }}
        >
          <img className="w-10 h-10" src="/发现3.png"/>
          <span className="text-xs">发现</span>
        </button>
        
        {/* 中间凸出的AI按钮 */}
        <button
          className="flex flex-col items-center justify-center flex-1 -mt-8 transition-all active:scale-95"
          onClick={() => {
            console.log('🤖 打开AI入口弹窗');
            setShowAiModal(true);
          }}
        >
          {/* 白色外圆（最大） */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center hover:shadow-2xl transition-all"
            style={{
              backgroundImage: 'url("/导航背景.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all">
              <img src="/ai创建3.png" alt="AI创建" className="w-full h-full object-contain" />
            </div>
          </div>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
          onClick={() => {
            console.log('💬 导航到消息页面');
             onNavigateToCommunity&& onNavigateToCommunity();
          }}
        >
         <img className="w-10 h-10" src="/消息3.png"/>
          <span className="text-xs mb-1">消息</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"style={{color:"#724B10"}}
          onClick={() => {
            console.log('👤 导航到我的页面');
            // onNavigateToMine && onNavigateToMine();
          }}
        >
          <img className="w-9 h-10" src="/我的页面3.png"/>
          <span className="text-xs mb-1">我的</span>
        </button>
      </div>
      
      </div>
      </div>
    </>
  );
};

export default MinePage;

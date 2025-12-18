import React, { useEffect, useState } from 'react';
import tailwindConfig from '../../tailwind.config';
import { API_CONFIG, getCurrentUserId, getFriendsList, shareTravelPlanToAI, sendMessage } from "../api/config";
import SwipeableItem from "./SwipeableItem";
import AiFloatingButton from '../components/AiFloatingButton';

const TRAVEL_PLAN_CARD_BG_IMAGES = [
  '/春1.jpg',
  '/旅行计划卡片背景2.jpg',
  '/旅行计划卡片背景3.jpg',
  '/旅行计划卡片背景4.jpg',
  '/旅行计划卡片背景5.jpg',
  '/旅行计划卡片背景6.jpg',
  '/旅行计划卡片背景7.jpg',
];

const MyTravalsPage = ({onNavigateToAi, onBack,onNavigateToMytTravalPlan, onNavigateToChat }) => {
  const [trips, setTrips] = useState([]);
  const [loading,setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTrips, setFilteredTrips] = useState([]);

  const [showShareModal, setShowShareModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);
  const [sharingTrip, setSharingTrip] = useState(null);
  // useEffect(() => {
  //   try {
  //     const stored = localStorage.getItem('my_trips');
  //     if (stored) {
  //       const parsed = JSON.parse(stored);
  //       if (Array.isArray(parsed)) {
  //         setTrips(parsed);
  //         return;
  //       }
  //     }
  //   } catch (e) {
  //     console.warn('读取本地行程失败，将使用示例数据');
  //   }

  //   setTrips([
  //     {
  //       id: 1,
  //       name: '西藏3日游',
  //       dateRange: '11.14 - 11.16',
  //       city: '拉萨',
  //       days: 3,
  //     },
  //     {
  //       id: 2,
  //       name: '杭州西湖2日游',
  //       dateRange: '10.01 - 10.02',
  //       city: '杭州',
  //       days: 2,
  //     },
  //   ]);
  // }, []);
  const cardBgClasses = [
    'bg-lightPink',
    'bg-lightBlue',
    'bg-lightGreen',
    'bg-lightYellow',
    'bg-lightPurple',
    'bg-lightOrange',
    'bg-lightMint',
    'bg-lightLavender',
  ];

  // 搜索过滤逻辑
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTrips(trips);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = trips.filter(trip => 
        (trip.name && trip.name.toLowerCase().includes(query)) ||
        (trip.city && trip.city.toLowerCase().includes(query)) ||
        (trip.dateRange && trip.dateRange.toLowerCase().includes(query))
      );
      setFilteredTrips(filtered);
    }
  }, [searchQuery, trips]);

  const displayTrips = filteredTrips || [];

  // API请求函数
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        ...options
      };

      const response = await fetch(endpoint, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  };

  const loadFriendsForShare = async () => {
    try {
      setFriendsLoading(true);
      setFriendsError(null);
      const response = await getFriendsList();
      if (response && response.code === 200) {
        const raw = (response.data && response.data.list) || response.data || [];
        const list = (raw || []).map((friend) => ({
          id: friend.userId || friend.id,
          nickname: friend.nickname || friend.username || "",
          phone: friend.phone,
          avatarUrl: friend.avatar || friend.avatarUrl,
        }));
        setFriends(list);
      } else {
        setFriends([]);
        setFriendsError((response && response.message) || "获取好友列表失败");
      }
    } catch (err) {
      setFriends([]);
      setFriendsError((err && err.message) || "获取好友列表失败");
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleOpenShareModal = (trip) => {
    if (!trip || !trip.id) return;
    setSharingTrip(trip);
    setShowShareModal(true);
    if (!friends || friends.length === 0) {
      loadFriendsForShare();
    }
  };

  const handleShareToFriend = async (friend) => {
    if (!friend || !sharingTrip || !sharingTrip.id) {
      return;
    }

    const payload = {
      travelPlanId: sharingTrip.id,
      title: sharingTrip.name || '旅行计划',
      name: sharingTrip.name || '旅行计划',
      destination: sharingTrip.city || undefined,
      city: sharingTrip.city || undefined,
      travelDays: sharingTrip.days || undefined,
      dateRange: sharingTrip.dateRange || undefined,
    };

    const content = '__TRAVEL_PLAN_SHARE__' + JSON.stringify(payload);

    try {
      setShowShareModal(false);
      const response = await sendMessage(friend.id, 'text', content, null);
      if (response && response.code === 200) {
        alert('已分享给好友');
        if (onNavigateToChat) {
          onNavigateToChat(friend);
        }
      } else {
        alert('分享失败：' + ((response && response.message) || ''));
      }
    } catch (err) {
      console.error('分享行程失败:', err);
      alert('分享失败：' + (err && err.message ? err.message : '未知错误'));
    }
  };

  const handleShareToAI = async () => {
    if (!sharingTrip || !sharingTrip.id) {
      console.warn('没有旅行计划ID，无法分享给AI');
      return;
    }

    try {
      setShowShareModal(false);
      
      const userId = await getCurrentUserId();
      const sessionId = localStorage.getItem('chatSessionId') || '';
      
      const planTitle = sharingTrip.name || '旅行计划';
      
      const message = `我分享一个旅行计划：${planTitle}`;
      
      console.log('📤 开始分享旅行计划给AI:', {
        travelPlanId: sharingTrip.id,
        userId,
        sessionId,
        message
      });
      
      const response = await shareTravelPlanToAI(sharingTrip.id, {
        userId,
        sessionId,
        message
      });
      
      console.log('📥 分享响应:', response);
      
      if (response && response.code === 200) {
        // 分享成功，跳转到AI页面
        const newSessionId = response.data.sessionId || sessionId;
        
        // 更新sessionId（如果后端返回了新的）
        if (newSessionId !== sessionId) {
          localStorage.setItem('chatSessionId', newSessionId);
        }
        
        // 存储旅行计划ID（供AI页面识别当前分享的是哪个行程）
        localStorage.setItem('sharedTravelPlanId', sharingTrip.id.toString());
        
        // 跳转到AI页面
        if (onNavigateToAi) {
          onNavigateToAi();
        }
        
        console.log('✅ 旅行计划分享成功，已跳转到AI页面');
      } else {
        throw new Error(response?.message || '分享失败');
      }
      
    } catch (error) {
      console.error('❌ 分享旅行计划给AI失败:', error);
      alert(`分享失败：${error.message || '未知错误'}`);
      setShowShareModal(false);
    }
  };

  // 显示分享目的选择模态框
  const showSharePurposeModal = () => {
    return new Promise((resolve) => {
      // 创建模态框DOM
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 class="text-lg font-bold mb-4">分享给AI助手</h3>
          <p class="text-sm text-gray-600 mb-4">选择您分享的目的：</p>
          <div class="space-y-2">
            <button class="w-full text-left p-3 border rounded hover:bg-blue-50 share-purpose" data-purpose="discuss">
              <div class="font-medium">💬 讨论计划</div>
              <div class="text-xs text-gray-500">和AI聊聊这个计划</div>
            </button>
            <button class="w-full text-left p-3 border rounded hover:bg-blue-50 share-purpose" data-purpose="optimize">
              <div class="font-medium">✨ 优化计划</div>
              <div class="text-xs text-gray-500">让AI帮忙优化</div>
            </button>
            <button class="w-full text-left p-3 border rounded hover:bg-blue-50 share-purpose" data-purpose="question">
              <div class="font-medium">❓ 提问咨询</div>
              <div class="text-xs text-gray-500">询问具体问题</div>
            </button>
          </div>
          <div class="flex space-x-2 mt-4">
            <button class="flex-1 px-4 py-2 border rounded text-gray-600 hover:bg-gray-50" id="cancel-btn">取消</button>
          </div>
        </div>
      `;
      
      // 添加事件监听
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('share-purpose') || e.target.closest('.share-purpose')) {
          const button = e.target.classList.contains('share-purpose') ? e.target : e.target.closest('.share-purpose');
          const purpose = button.dataset.purpose;
          document.body.removeChild(modal);
          resolve(purpose);
        } else if (e.target.id === 'cancel-btn' || e.target === modal) {
          document.body.removeChild(modal);
          resolve(null);
        }
      });
      
      document.body.appendChild(modal);
    });
  };

  const formatDateRange = (startDateStr, endDateStr, dateStr) => {
    const format = (dateString) => {
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${y}.${m}.${day}`;
    };

    // 优先使用 startDate / endDate
    if (startDateStr && endDateStr) {
      const s = format(startDateStr);
      const e = format(endDateStr);
      if (s && e) return `${s}-${e}`;
    }

    // 兼容旧的 date 字符串：yyyy-MM-dd-yyyy-MM-dd
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length >= 3) {
        const s = format(`${parts[0]}-${parts[1]}-${parts[2]}`);
        if (parts.length >= 6) {
          const e = format(`${parts[3]}-${parts[4]}-${parts[5]}`);
          if (s && e) return `${s}-${e}`;
        }
        if (s) return s;
      }
    }

    return '时间待定';
  };

  const fetchUserTravelPlans = async () => {
    try {
      setLoading(true);
      // 获取当前用户ID
      const userId = await getCurrentUserId();

      // 构建符合后端文档的请求路径: /api/travel-plans/user/{userId}
      const endpoint = `${API_CONFIG.ENDPOINTS.GET_USER_TRAVEL_PLANS}/${userId}`;

      const response = await apiRequest(endpoint, { method: 'GET' });

      // 根据 API 文档: data 结构为 { userId, total, travelPlans: [...] }
      if (response.code === 200 && response.data && Array.isArray(response.data.travelPlans)) {
        const formattedTrips = response.data.travelPlans.map(plan => {
          const dateRange = formatDateRange(plan.startDate, plan.endDate, plan.date);
          
          // 获取图片URL
          const getImageUrl = () => {
            const buildImageUrl = (url) => {
              if (!url || typeof url !== 'string') return null;
              if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
              }
              return `${API_CONFIG.BASE_URL || ''}${url}`;
            };

            if (plan.coverImageUrl) return buildImageUrl(plan.coverImageUrl);
            if (plan.coverImage) return buildImageUrl(plan.coverImage);
            if (plan.days && plan.days[0]?.activities?.[0]?.photo) {
              return buildImageUrl(plan.days[0].activities[0].photo);
            }
            return null;
          };
          
          return {
            id: plan.id,
            name: plan.title || `${plan.destination}${plan.travelDays}日游`,
            dateRange,
            city: plan.destination,
            days: plan.travelDays,
            status: plan.status,
            imageUrl: getImageUrl(),
            startDate: plan.startDate,
            endDate: plan.endDate
          };
        });

        const sortedTrips = formattedTrips.sort((a, b) => {
          const statusOrder = { active: 0, pending: 1, completed: 2 };
          const aOrder = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 1;
          const bOrder = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 1;
          return aOrder - bOrder;
        });

        setTrips(sortedTrips);
      }
    } catch (error) {
      console.error('获取旅行计划失败:', error);
      // 失败时使用本地数据作为fallback
      useLocalFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const useLocalFallbackData=()=>{
    try{
      const stored=localStorage.getItem('my_trips');
      if(stored){
        const parsed=JSON.parse(stored);
        if(Array.isArray(parsed)){
          setTrips(parsed);
          return;
        }
      }
    }catch(e){
      console.warn('读取本地行程失败，将使用示例数据');
    }
    setTrips([
      {
        id: 1,
        name: '西藏3日游',
        dateRange: '11.14 - 11.16',
        city: '拉萨',
        days: 3,
      },
      {
        id: 2,
        name: '杭州西湖2日游',
        dateRange: '10.01 - 10.02',
        city: '杭州',
        days: 2,
      },
    ]);
  };

  const handleDeleteTrip = async (tripIndex, trip) => {
    if (!trip || !trip.id) {
      return;
    }

    const endpoint = API_CONFIG.ENDPOINTS.DELECT_ACTIVITY_PLAN.replace('{id}', trip.id);

    try {
      await apiRequest(endpoint, {
        method: 'DELETE',
      });

      // 前端从列表中移除该行程
      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
    } catch (error) {
      console.error('删除旅行计划失败:', error);
    }
  };

  useEffect(() => {
    fetchUserTravelPlans();
  }, []);

  return (
    <>
     <AiFloatingButton onNavigateToAi={onNavigateToAi} />
   <div
      className="flex flex-col min-h-screen bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: 'url("/古风背景3.jpg")' }}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800">我的行程</h1>
        </div>
        
        {/* 搜索框 */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索行程、目的地..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-400 transition-colors"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-32 pb-4 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : displayTrips.length === 0 ? (
          <div className="mt-8 text-center text-gray-400 text-sm">
            {searchQuery ? '未找到匹配的行程' : '暂无行程计划'}
          </div>
        ) : null}

        {!loading && displayTrips.length > 0 && (
          <div className="space-y-4 mt-2">
            {displayTrips.map((trip, index) => {
              // 根据状态选择背景色
              const getBgColor = (status, index) => {
                const ancientColors = ['bg-[#5CA39D]', 'bg-[#DC873A]', 'bg-[#AE5050]', 'bg-[#A9A786]', 'bg-[#615EAA]', 'bg-[#7FA0AF]'];
                return ancientColors[index % ancientColors.length];
              };
              
              return (
                <SwipeableItem
                  key={trip.id || index}
                  onDelete={() => handleDeleteTrip(index, trip)}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    {/* 顶部信息区域 - 带颜色背景 */}
                    <div 
                      className={`${getBgColor(trip.status, index)} p-4 cursor-pointer`}
                      style={{
                        backgroundImage: `url(${TRAVEL_PLAN_CARD_BG_IMAGES[index % TRAVEL_PLAN_CARD_BG_IMAGES.length]})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      onClick={() => {
                        const cardBgImage = TRAVEL_PLAN_CARD_BG_IMAGES[index % TRAVEL_PLAN_CARD_BG_IMAGES.length];
                        onNavigateToMytTravalPlan({ ...trip, cardBgImage });
                      }}
                    >
                      {/* 标题和状态 */}
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-white text-lg">
                          {trip.name || '未命名行程'}
                        </h3>
                        <div className="flex flex-col items-end">
                          <img
                            className="w-5 h-5 cursor-pointer"
                            src="/分享.png"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenShareModal(trip);
                            }}
                          />
                          <span className={`mt-2 text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            trip.status === 'active' ? 'bg-blue-500 text-white' :
                            trip.status === 'completed' ? 'bg-gray-500 text-white' :
                            trip.status === 'pending' ? 'bg-orange-500 text-white' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {trip.status === 'completed' && '已结束'}
                            {trip.status === 'active' && '进行中'}
                            {trip.status === 'pending' && '未开始'}
                            {!trip.status && '待定'}
                          </span>
                        </div>
                      </div>
                      
                      {/* 日期范围 */}
                      <div className="text-xs text-white flex items-center gap-2 mt-1">
                        <i className="fa-regular fa-calendar"></i>
                        <span>{trip.dateRange}</span>
                      </div>
                      
                      {/* 地点 */}
                      {trip.city && (
                        <div className="text-xs text-white flex items-center gap-2 mt-1">
                          <i className="fa-solid fa-location-dot"></i>
                          <span>{trip.city}</span>
                          {trip.days && <span>· {trip.days}天行程</span>}
                        </div>
                      )}
                    </div>
                    
                    {/* 图片区域 - 带旋转动画 */}
                    {trip.imageUrl && (
                      <div className="p-4" style={{backgroundImage:'url(/导航背景.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
                        <div className="h-24 rounded-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                          <img
                            src={trip.imageUrl}
                            alt={trip.city}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div
                            className="w-full h-24 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center"
                            style={{ display: 'none' }}
                          >
                            <i className="fa-solid fa-map-location-dot text-white text-3xl"></i>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </SwipeableItem>
              );
            })}
          </div>
        )}
        
      </div>
    </div>

    {/* 分享给好友弹窗 */}
    {showShareModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800">选择分享方式</h3>
            <button
              onClick={() => setShowShareModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* AI选项 */}
            <button
              onClick={handleShareToAI}
              className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors mb-3 border-b border-gray-100 pb-3"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-3 overflow-hidden">
                <img 
                  src="/AI助手@2x.png" 
                  alt="AI助手" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  AI助手
                </div>
                <div className="text-xs text-gray-400 truncate">让AI帮你优化旅行计划</div>
              </div>
            </button>

            {/* 好友列表 */}
            {friendsLoading && (
              <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                正在加载好友列表...
              </div>
            )}

            {friendsError && !friendsLoading && (
              <div className="py-4 text-center text-sm text-red-500">
                {friendsError}
              </div>
            )}

            {!friendsLoading && !friendsError && friends.length === 0 && (
              <div className="py-4 text-center text-sm text-gray-400">
                暂无好友可分享
              </div>
            )}

            {!friendsLoading && !friendsError && friends.length > 0 && (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleShareToFriend(friend)}
                    className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
                      {friend.avatarUrl ? (
                        <img
                          src={friend.avatarUrl}
                          alt={friend.nickname || friend.phone || '好友头像'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">
                          {(friend.nickname || friend.phone || '好').charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {friend.nickname || friend.phone || '未命名好友'}
                      </div>
                      {friend.phone && (
                        <div className="text-xs text-gray-400 truncate">{friend.phone}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setShowShareModal(false)}
              className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    )}

    </>
  );
};

export default MyTravalsPage;

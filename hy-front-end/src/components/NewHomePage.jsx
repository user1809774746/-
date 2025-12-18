import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from 'react-vant';
import { getCurrentUserId, getPublicPosts, API_CONFIG, getFriendsList, shareTravelPlanToAI, sendMessage } from '../api/config';

import amapConfig from '../config/amapConfig';
import HomePageSkeleton from './HomePageSkeleton';
import AiEntryModal from './AiEntryModal';

const TRAVEL_PLAN_CARD_BG_IMAGES = [
  '/春1.jpg',
  '/旅行计划卡片背景2.jpg',
  '/旅行计划卡片背景3.jpg',
  '/旅行计划卡片背景4.jpg',
  '/旅行计划卡片背景5.jpg',
  '/旅行计划卡片背景6.jpg',
  '/旅行计划卡片背景7.jpg',
];

/**
 * 新版首页组件
 * 
 * 布局结构：
 * 1. 顶部：AI聊天助手入口（带输入框）
 * 2. 中间：热门推荐（横向滑动的帖子列表）
 * 3. 下方：我的旅行计划
 * 4. 底部：导航栏（首页、发现、消息、我的）
 */
const NewHomePage = ({
  onNavigateToAi,
  onNavigateToDiscover,
  onNavigateToMessages,
  onNavigateToMine,
  onNavigateToPostDetail,
  onNavigateToTravelPlan,
  onNavigateToChat,
  onNavigateToCommunity,
  onNavigateToPostPage
}) => {
  // 用户位置信息
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  
  // 省份图片相关
  const [provincePhoto, setProvincePhoto] = useState('/河北首页背景图.jpg'); // 默认图片
  const [currentProvince, setCurrentProvince] = useState('河北'); // 当前省份
  const [showProvinceSelector, setShowProvinceSelector] = useState(false); // 省份选择弹窗
  
  // 热门推荐帖子
  const [hotPosts, setHotPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  
  // 我的旅行计划
  const [travelPlans, setTravelPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  
  // 当前用户ID
  const [userId, setUserId] = useState(null);
  
  // AI助手输入框
  const [aiInput, setAiInput] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  
  // AI入口弹窗
  const [showAiModal, setShowAiModal] = useState(false);
  
  // 旅行计划提醒
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [currentReminderPlan, setCurrentReminderPlan] = useState(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);
  const [sharingPlan, setSharingPlan] = useState(null);

  // ═══════════════════════════════════════════════════════════════════
  // 初始化：获取用户位置（隐藏地图，但保留定位功能）
  // ═══════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    initUserLocation();
    loadUserId();
  }, []);

  useEffect(() => {
    loadHotPosts();
  }, []);

  // 当省份变化时，获取省份图片
  useEffect(() => {
    if (currentProvince) {
      fetchProvincePhoto(currentProvince);
    }
  }, [currentProvince]);

  // 加载用户ID
  const loadUserId = async () => {
    try {
      const id = await getCurrentUserId();
      setUserId(id);
      // 加载用户的旅行计划
      loadTravelPlans(id);
    } catch (error) {
      console.error('获取用户ID失败:', error);
    }
  };

  // 加载高德地图脚本
  const loadMapScript = () => {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve(window.AMap);
        return;
      }

      window._AMapSecurityConfig = {
        securityJsCode: amapConfig.securityKey,
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = amapConfig.getApiUrl(['AMap.Geolocation', 'AMap.Geocoder']);
      script.onload = () => {
        if (window.AMap) {
          resolve(window.AMap);
        } else {
          reject(new Error('高德地图API加载失败'));
        }
      };
      script.onerror = () => {
        reject(new Error('高德地图API加载出错'));
      };
      document.head.appendChild(script);
    });
  };

  // 逆地理编码：根据经纬度获取城市信息
  const getCityFromCoords = (lng, lat) => {
    return new Promise((resolve, reject) => {
      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder({
          radius: 1000,
          extensions: 'base'
        });
        
        geocoder.getAddress([lng, lat], (status, result) => {
          console.log('🗺️ 逆地理编码状态:', status);
          console.log('🗺️ 逆地理编码结果:', result);
          
          if (status === 'complete' && result.regeocode) {
            const addressComponent = result.regeocode.addressComponent;
            const city = addressComponent.city || addressComponent.province || '未知城市';
            const address = result.regeocode.formattedAddress || '';
            
            console.log('✅ 逆地理编码成功 - 城市:', city);
            console.log('✅ 逆地理编码成功 - 地址:', address);
            
            resolve({
              city: city,
              address: address,
              province: addressComponent.province || '',
              district: addressComponent.district || ''
            });
          } else {
            console.error('❌ 逆地理编码失败:', status, result);
            reject(new Error('逆地理编码失败'));
          }
        });
      });
    });
  };

  // 初始化用户位置
  const initUserLocation = async () => {
    try {
      setLocationLoading(true);
      
      // 首先尝试从localStorage读取缓存的位置
      const cachedLocation = localStorage.getItem('user_location');
      if (cachedLocation) {
        try {
          const parsed = JSON.parse(cachedLocation);
          setUserLocation(parsed);
          console.log('📍 使用缓存的位置信息:', parsed);
        } catch (e) {
          console.warn('缓存位置信息解析失败');
        }
      }
      
      // 加载高德地图API
      await loadMapScript();
      console.log('✅ 高德地图API加载成功');

      // 获取用户位置
      window.AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new window.AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          convert: true,
          showButton: false,
          showMarker: false,
          showCircle: false,
          // 添加这些选项以提高定位成功率
          noIpLocate: 0, // 允许使用IP定位
          GeoLocationFirst: false, // 优先使用精确定位
          borderColor: '#0D9BF2',
          borderRadius: '2px',
          buttonPosition: 'RB'
        });

        geolocation.getCurrentPosition(async (status, result) => {
          console.log('📍 定位回调 - 状态:', status);
          console.log('📍 定位回调 - 结果:', result);
          
          if (status === 'complete') {
            const lng = result.position.lng;
            const lat = result.position.lat;
            
            // 如果有地址信息，直接使用
            if (result.addressComponent?.city || result.addressComponent?.province) {
              const province = result.addressComponent?.province || '';
              const location = {
                lng: lng,
                lat: lat,
                address: result.formattedAddress || '',
                city: result.addressComponent?.city || result.addressComponent?.province || '未知城市',
                province: province
              };
              setUserLocation(location);
              console.log('✅ 用户位置获取成功（直接）:', location);
              localStorage.setItem('user_location', JSON.stringify(location));
              
              // 设置当前省份并获取图片
              if (province) {
                const cleanProvince = province.replace(/省|市|自治区|特别行政区/g, '');
                setCurrentProvince(cleanProvince);
              }
            } else {
              // 使用逆地理编码获取城市信息
              console.log('🔄 使用逆地理编码获取城市信息...');
              try {
                const cityInfo = await getCityFromCoords(lng, lat);
                const location = {
                  lng: lng,
                  lat: lat,
                  address: cityInfo.address,
                  city: cityInfo.city,
                  province: cityInfo.province
                };
                setUserLocation(location);
                console.log('✅ 用户位置获取成功（逆地理编码）:', location);
                localStorage.setItem('user_location', JSON.stringify(location));
                
                // 设置当前省份并获取图片
                if (cityInfo.province) {
                  const cleanProvince = cityInfo.province.replace(/省|市|自治区|特别行政区/g, '');
                  setCurrentProvince(cleanProvince);
                }
              } catch (error) {
                console.error('❌ 逆地理编码失败:', error);
                // 即使逆地理编码失败，也保存经纬度
                const location = {
                  lng: lng,
                  lat: lat,
                  address: '',
                  city: '未知城市'
                };
                setUserLocation(location);
                localStorage.setItem('user_location', JSON.stringify(location));
              }
            }
          } else {
            console.error('❌ 定位失败 - 状态:', status);
            console.error('❌ 定位失败 - 详细信息:', result);
            console.error('❌ 错误代码:', result?.info);
            console.error('❌ 错误消息:', result?.message);
            
            // 如果没有缓存位置，尝试使用IP定位
            if (!cachedLocation) {
              console.log('🔄 尝试使用IP定位...');
              geolocation.getCityInfo((status, cityResult) => {
                if (status === 'complete') {
                  const location = {
                    lng: cityResult.center?.[0] || 116.397428,
                    lat: cityResult.center?.[1] || 39.90923,
                    address: cityResult.province + cityResult.city,
                    city: cityResult.city || cityResult.province || '未知城市'
                  };
                  setUserLocation(location);
                  console.log('✅ IP定位成功:', location);
                  localStorage.setItem('user_location', JSON.stringify(location));
                } else {
                  console.error('❌ IP定位也失败了:', cityResult);
                  // 使用默认位置（北京）
                  const defaultLocation = {
                    lng: 116.397428,
                    lat: 39.90923,
                    address: '北京市',
                    city: '北京市'
                  };
                  setUserLocation(defaultLocation);
                  console.log('📍 使用默认位置（北京）');
                }
              });
            }
          }
          setLocationLoading(false);
        });
      });
    } catch (error) {
      console.error('❌ 初始化定位失败:', error);
      console.error('❌ 错误堆栈:', error.stack);
      
      // 使用默认位置
      const defaultLocation = {
        lng: 116.397428,
        lat: 39.90923,
        address: '北京市',
        city: '北京市'
      };
      setUserLocation(defaultLocation);
      setLocationLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 获取省份图片（从前端 public 文件夹）
  // ═══════════════════════════════════════════════════════════════════
  
  // 省份名称到文件名的映射
  const provincePhotoMap = {
    '北京': 'BeiJing.jpg',
    '上海': 'ShangHai.jpg',
    '天津': 'TianJin.jpg',
    '重庆': 'ChongQing.jpg',
    '河北': 'HeBei.jpg',    //修改
    '河南': 'HeNan.jpg',
    '湖北': 'HuBei.jpg',
    '湖南': 'HuNan.jpg',
    '江苏': 'JiangSu.jpg',
    '江西': 'JiangXi.jpg',
    '浙江': 'ZheJiang.jpg',
    '安徽': 'AnHui.jpg',
    '福建': 'FuJian.jpg',
    '广西': 'GuangXi.jpg',
    '贵州': 'GuiZhou.jpg',
    '海南': 'HaiNan.jpg',
    '黑龙江': 'HeiLongJiang.jpg',
    '吉林': 'JiLin.jpg',
    '山东': 'ShanDong.jpg',
    '山西': 'ShanXi.jpg',
    '陕西': 'ShanXII.jpg',
    '内蒙古': 'NeiMengGu.jpg',
    '宁夏': 'NingXia.jpg',
    '西藏': 'XiZang.jpg',
    '台湾': 'TaiWan.jpg',
    '香港': 'XiangGang.jpg',
    '广东': 'GuangDong.jpg',
    '澳门': 'AoMen.jpg',
    '青海': 'QingHai.jpg',
    '辽宁': 'ShenYang.jpg',
    '四川': 'SiChuan.jpg',
    '新疆': 'XinJiang.jpg',
    '云南': 'YunNan.jpg',
    '甘肃': 'GanSu.jpg'
  };
  
  const fetchProvincePhoto = (provinceName) => {
    try {
      console.log('🖼️ 开始获取省份图片:', provinceName);
      
      // 清理省份名称（去除"省"、"市"等后缀）
      const cleanProvinceName = provinceName.replace(/省|市|自治区|特别行政区|维吾尔|回族|壮族/g, '').trim();
      
      // 从映射中获取文件名
      const photoFileName = provincePhotoMap[cleanProvinceName];
      
      if (photoFileName) {
        // 直接使用 public 文件夹中的图片路径
        const photoPath = `/${photoFileName}`;
        setProvincePhoto(photoPath);
        console.log('✅ 省份图片设置成功:', photoPath);
      } else {
        console.warn('⚠️ 未找到省份图片，使用默认图片。省份名:', cleanProvinceName);
        // 使用默认图片
        setProvincePhoto('/河北首页背景图.jpg');
      }
    } catch (error) {
      console.error('❌ 获取省份图片失败:', error);
      setProvincePhoto('/河北首页背景图.jpg');
    }
  };

  const loadHotPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await getPublicPosts({ page: 1, pageSize: 50 });

      if (response && response.code === 200) {
        const data = response.data || {};
        const allPosts = data.list || data.posts || [];

        const approvedPosts = allPosts.filter(
          (post) => post.status === 'published' && post.auditStatus === 'approved'
        );

        const sortedByView = approvedPosts
          .slice()
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

        setHotPosts(sortedByView.slice(0, 5));
      } else {
        setHotPosts([]);
      }
    } catch (error) {
      console.error('加载热门帖子失败:', error);
      setHotPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadTravelPlans = async (currentUserId) => {
    try {
      setPlansLoading(true);
      console.log('🔍 开始加载旅行计划，用户ID:', currentUserId);
      
      // 使用正确的API端点
      const endpoint = `${API_CONFIG.BASE_URL || ''}${API_CONFIG.ENDPOINTS.GET_USER_TRAVEL_PLANS}/${currentUserId}`;
      console.log('📡 请求端点:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      console.log('📥 响应状态:', response.status);
      const data = await response.json();
      console.log('📦 响应数据:', data);
      
      if (data && data.code === 200) {
        let plans = [];
        
        // 处理不同的响应格式
        if (Array.isArray(data.data)) {
          plans = data.data;
        } else if (data.data && Array.isArray(data.data.travelPlans)) {
          plans = data.data.travelPlans;
        } else if (data.data && Array.isArray(data.data.list)) {
          plans = data.data.list;
        }
        
        console.log('✅ 获取到旅行计划:', plans.length, '个');
        console.log('📦 旅行计划详细数据:', JSON.stringify(plans, null, 2));
        
        if (plans.length > 0) {
          // 按状态排序：active > pending/未执行 > completed
          const sortedPlans = plans.sort((a, b) => {
            const statusOrder = { 'active': 0, 'pending': 1, 'completed': 2 };
            const aOrder = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 1;
            const bOrder = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 1;
            return aOrder - bOrder;
          });
          
          setTravelPlans(sortedPlans);
          console.log('📋 旅行计划列表已更新');
          console.log('🗂️ 排序后的计划:', sortedPlans.map(p => ({
            id: p.id,
            destination: p.destination,
            status: p.status,
            hasCoverImage: !!(p.coverImageUrl || p.coverImage),
            coverImageUrl: p.coverImageUrl,
            hasDays: !!p.days
          })));
          
          // 检查是否有需要提醒的计划
          const firstPending = sortedPlans.find((p) => p.status !== 'completed' && p.status !== 'active');
          if (firstPending) {
            // 检查是否到了开始时间
            const now = new Date();
            const startDate = new Date(firstPending.startDate);
            
            // 如果今天是开始日期，显示提醒
            if (startDate.toDateString() === now.toDateString()) {
              setCurrentReminderPlan(firstPending);
              setShowReminderDialog(true);
              console.log('⏰ 显示旅行计划提醒');
            }
          }
        } else {
          console.log('📝 暂无旅行计划');
          setTravelPlans([]);
        }
      } else {
        console.warn('⚠️ API返回错误:', data);
        setTravelPlans([]);
      }
    } catch (error) {
      console.error('❌ 加载旅行计划失败:', error);
      setTravelPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };
  
  // 处理开始旅行计划
  const handleStartTravelPlan = async () => {
    if (!currentReminderPlan) return;
    
    try {
      // 更新计划状态为active
      const endpoint = `${API_CONFIG.ENDPOINTS.UPDATE_TRAVEL_PLAN_STATUS.replace('{id}', currentReminderPlan.id)}?status=active`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ 旅行计划状态更新成功:', result);
      
      // 关闭对话框
      setShowReminderDialog(false);
      
      // 重新加载计划列表
      if (userId) {
        loadTravelPlans(userId);
      }
      
      // 跳转到计划详情
      if (onNavigateToTravelPlan) {
        onNavigateToTravelPlan(currentReminderPlan);
      }
    } catch (error) {
      console.error('开始旅行计划失败:', error);
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

  const handleOpenShareModal = (plan) => {
    if (!plan || !plan.id) return;
    setSharingPlan(plan);
    setShowShareModal(true);
    if (!friends || friends.length === 0) {
      loadFriendsForShare();
    }
  };

  const handleShareToFriend = async (friend) => {
    if (!friend || !sharingPlan || !sharingPlan.id) {
      return;
    }

    const payload = {
      travelPlanId: sharingPlan.id,
      title: sharingPlan.title || sharingPlan.destination || '旅行计划',
      name: sharingPlan.title || sharingPlan.destination || '旅行计划',
      destination: sharingPlan.destination || undefined,
      city: sharingPlan.destination || undefined,
      travelDays: sharingPlan.travelDays || undefined,
      startDate: sharingPlan.startDate || undefined,
      endDate: sharingPlan.endDate || undefined,
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
    if (!sharingPlan || !sharingPlan.id) {
      console.warn('没有旅行计划ID，无法分享给AI');
      return;
    }

    try {
      setShowShareModal(false);
      
      const userId = await getCurrentUserId();
      const sessionId = localStorage.getItem('chatSessionId') || '';
      
      const planTitle = sharingPlan.title || sharingPlan.name || sharingPlan.destination || '旅行计划';
      
      const message = `我分享一个旅行计划：${planTitle}`;
      
      console.log('📤 开始分享旅行计划给AI:', {
        travelPlanId: sharingPlan.id,
        userId,
        sessionId,
        message
      });
      
      const response = await shareTravelPlanToAI(sharingPlan.id, {
        userId,
        sessionId,
        message
      });
      
      console.log('📥 分享响应:', response);
      
      if (response && response.code === 200) {
        const newSessionId = response.data.sessionId || sessionId;
        
        if (newSessionId !== sessionId) {
          localStorage.setItem('chatSessionId', newSessionId);
        }
        
        localStorage.setItem('sharedTravelPlanId', sharingPlan.id.toString());
        
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


  const showSharePurposeModal = () => {
    return new Promise((resolve) => {
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

  // ═══════════════════════════════════════════════════════════════════
  // 渲染函数
  // ═══════════════════════════════════════════════════════════════════

  // 渲染顶部横幅
  const renderHeroBanner = () => (
    <div className="relative w-full h-60 overflow-hidden">
      {/* 背景图片 */}
      <img
        src={provincePhoto}
        alt={`${currentProvince}背景`}
        className="w-full h-full object-cover"
      />
      
      {/* 右上角定位信息 */}
      <div 
        className="absolute top-2 right-4 flex items-center backdrop-blur-sm rounded-full px-3 py-2 cursor-pointer hover:bg-white/20 transition-colors"
        onClick={() => setShowProvinceSelector(true)}
      >
        {locationLoading ? (
          <div className="flex items-center space-x-2">
            <Skeleton avatar title row={0} />
          </div>
        ) : userLocation ? (
          <div className="flex items-center space-x-2">
            <img src="/告警管理-定位按钮.png" className='w-5 h-6 z-10'/>
            <span className="text-white text-sm font-medium">{currentProvince || userLocation.city}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <img src="/告警管理-定位按钮.png" className='w-5 h-6 z-10'/>
            <span className="text-white text-sm">定位失败</span>
          </div>
        )}
      </div>
      
      {/* 中间文字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: '宋体, SimSun, serif' }}>
          好游，好旅游
        </h1>
      </div>
    </div>
  );

  // 处理AI输入发送
  const handleAiInputSend = () => {
    if (!aiInput.trim()) return;
    
    // 保存输入内容到localStorage，供AI页面使用
    localStorage.setItem('aiDialogInput', aiInput);
    
    // 跳转到AI页面
    if (onNavigateToAi) {
      onNavigateToAi(aiInput);
    }
    
    // 清空输入
    setAiInput('');
    setShowAiInput(false);
  };

  // 渲染AI助手入口
  const renderAiAssistant = () => (
    <div className="mx-4 mt-4 mb-4">
      {/* <div className='flex flex-row mb-5'>
        <img src="./imge/图标1.png" className='w-[100px] h-[80px] ml-3 mt-6'/>
        <img src="./imge/沙滩树.png" className='ml-[40%] w-[100px] h-[100px]' />
         <img src="./imge/企鹅.png" className='mr-10 w-[100px] h-[100px] z-10'/> 
      </div> */}
     
        {/* <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
               <span className="text-2xl">🤖</span> 
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">AI 旅行助手</h3> 
              <p className="text-sm text-gray-500">告诉我你的旅行需求，帮你制定完美行程</p>
            </div>
          </div>
        </div> */}
        
        {/* 输入框区域 */}
        {/* <div className="flex items-center space-x-2 bg-white rounded-lg p-2 border border-gray-200">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAiInputSend();
              }
            }}
            placeholder="例如：我想去北京玩3天..."
            className="flex-1 outline-none text-sm px-2 py-1"
          />
          <button
            onClick={handleAiInputSend}
            disabled={!aiInput.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              aiInput.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            发送
          </button>
        </div>*/}
      </div> 
  );

  // 处理帖子点击
  const handlePostClick = (post) => {
    console.log('📝 点击帖子:', post);
    if (onNavigateToPostDetail) {
      // 传递帖子对象，包含id用于加载详情，并标记来源为首页
      onNavigateToPostDetail(post, 'home');
    }
  };

  // 渲染热门推荐
  const renderHotRecommendations = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3 mt-6">
        <h2 className="font-bold text-GuText relative inline-block w-auto py-4" style={{ fontFamily: '宋体, SimSun, serif', backgroundImage: 'url("/绿色国风小图标.png")', backgroundSize: '110%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
          <span className="relative z-10 px-2">热门推荐</span>
        </h2>
        <button 
          className="text-xs text-GuText hover:text-GuText transition-colors"
          onClick={() => onNavigateToPostPage && onNavigateToPostPage()}
        >
          查看更多 →
        </button>
      </div>
      
      {postsLoading ? (
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 px-4 pb-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-60 bg-white rounded-xl shadow-md overflow-hidden"
              >
                {/* 顶部图片区域骨架 */}
                <div className="h-40 bg-gray-100">
                  <Skeleton row={0} />
                </div>

                {/* 文本信息骨架 */}
                <div className="p-3">
                  <Skeleton title row={2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : hotPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>暂无热门推荐</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 px-4 pb-2">
            {hotPosts.map((post, index) => (
              <div
                key={post.id || index}
                className="flex-shrink-0 w-60 bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                onClick={() => handlePostClick(post)}
              >
                {/* 帖子图片 */}
                {(post.coverImage || (post.images && post.images.length > 0)) ? (
                  <div className="h-40 bg-gray-200 overflow-hidden relative">
                    <img
                      src={post.coverImage || (post.images && post.images[0])}
                      alt={post.title || '帖子图片'}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        const url = post.coverImage || (post.images && post.images[0]);
                        console.log(`✅ 帖子图片加载成功 - ID:${post.id}, URL:`, url);
                      }}
                      onError={(e) => {
                        const url = post.coverImage || (post.images && post.images[0]);
                        console.error(`❌ 帖子图片加载失败 - ID:${post.id}, URL:`, url);
                        console.error(`   完整帖子信息:`, {
                          id: post.id,
                          title: post.title,
                          images: post.images,
                          author: post.author
                        });
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">📷</div>';
                      }}
                    />
                    {/* 图片数量标识 */}
                    {post.images && post.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                        📷 {post.images.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-52 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
                
                {/* 帖子信息 */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                    {post.title || post.content?.substring(0, 30) || '无标题'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {post.content?.substring(0, 50) || '暂无描述'}
                  </p>
                  
                  {/* 作者信息
                  {post.author && (
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300 mr-1 overflow-hidden">
                        {post.author.avatar ? (
                          <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-200 flex items-center justify-center text-xs">
                            👤
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 truncate max-w-[150px]">
                        {post.author.nickname || post.author.username || '匿名用户'}
                      </span>
                    </div>
                  )} */}
                  
                  {/* 互动数据 */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        ❤️ {post.likeCount || post.likes || 0}
                      </span>
                      <span className="flex items-center">
                        💬 {post.commentCount || post.comments || 0}
                      </span>
                    </div>
                    {post.createdAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 处理旅行计划点击
  const handleTravelPlanClick = (plan) => {
    console.log('🗺️ 点击旅行计划:', plan);
    if (onNavigateToTravelPlan) {
      // 传递计划对象，包含完整信息
      onNavigateToTravelPlan(plan);
    }
  };

  // 渲染我的旅行计划（完全按照 legacy/Home.jsx 的样式）
  const renderMyTravelPlans = () => {
    return (
      <div className="mb-20 px-4 mt-6">
        
        <div className="flex flex-row items-center mb-3">
          <h2 className="py-5 font-bold text-GuText w-auto h-auto" style={{ fontFamily: '宋体, SimSun, serif', backgroundImage: 'url("/红色国风小图标.png")', backgroundSize: '110%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
           <span className="relative z-10 px-2">我的旅行计划</span>
          </h2>
          {/* <img src="/古风小图标2.png" className='absolute right-[-3%] mt-[-10%] mb-[-15%] w-[40%] h-[20%]'/> */}
        </div>
        
        {plansLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-md"
              >
                {/* 顶部彩色信息区域骨架 */}
                <div className="p-4">
                  <Skeleton title row={2} />
                </div>

                {/* 底部详情区域骨架 */}
                <div className="p-4 border-t border-gray-100">
                  <Skeleton row={2} />
                </div>
              </div>
            ))}
          </div>
        ) : travelPlans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <img src="/小假山.png" className='w-[150px] h-[180px] ml-[30%]'/>
            <p className="text-gray-500 mb-3">还没有旅行计划</p>
            <button
              className="px-6 py-2 bg-GuText text-white rounded-lg hover:bg-blue-400 transition-colors text-sm"
              onClick={() => {
                console.log('🤖 从“我的旅行计划”空状态打开AI入口弹窗');
                setShowAiModal(true);
              }}
            >
              让AI帮你制定一个 →
            </button>

          </div>
        ) : (
          <div className="space-y-4">
            {travelPlans.map((plan, index) => {
              // 根据状态选择背景色（使用古风颜色）
              const getBgColor = (status, index) => {
                // 定义古风颜色数组
                const ancientColors = ['bg-[#FFFBC7]', 'bg-[#F3E5E1]', 'bg-[#E0C6C4]', 'bg-[#DCE5AD]', 'bg-[#A8B78C]', 'bg-[#B65B46]'];
                // 根据索引循环使用颜色
                return ancientColors[index % ancientColors.length];
              };
              
              // 获取图片URL（优先使用后端返回的 coverImageUrl）
              const getImageUrl = () => {
                const buildImageUrl = (url) => {
                  if (!url || typeof url !== 'string') return null;
                  if (url.startsWith('http://') || url.startsWith('https://')) {
                    return url;
                  }
                  // 相对路径时拼接 BASE_URL（开发环境 BASE_URL 为空字符串，会走 Vite 代理）
                  return `${API_CONFIG.BASE_URL || ''}${url}`;
                };

                console.log('🖼️ 获取旅行计划图片:', {
                  planId: plan.id,
                  destination: plan.destination,
                  coverImageUrl: plan.coverImageUrl,
                  coverImage: plan.coverImage,
                  hasDays: !!plan.days,
                  daysLength: plan.days?.length,
                  firstDayPhoto: plan.days?.[0]?.activities?.[0]?.photo
                });
                
                if (plan.coverImageUrl) {
                  const finalUrl = buildImageUrl(plan.coverImageUrl);
                  console.log('✅ 使用 coverImageUrl:', plan.coverImageUrl, '=>', finalUrl);
                  return finalUrl;
                }

                if (plan.coverImage) {
                  const finalUrl = buildImageUrl(plan.coverImage);
                  console.log('✅ 使用 coverImage:', plan.coverImage, '=>', finalUrl);
                  return finalUrl;
                }
                
                if (plan.days && plan.days[0]?.activities?.[0]?.photo) {
                  const photo = plan.days[0].activities[0].photo;
                  const finalUrl = buildImageUrl(photo);
                  console.log('✅ 使用第一天活动图片:', photo, '=>', finalUrl);
                  return finalUrl;
                }
                
                console.log('⚠️ 未找到图片');
                return null;
              };
              
              const imageUrl = getImageUrl();
              
              // 格式化日期
              const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                }).replace(/\//g, '.');
              };
              
              return (
                <div
                  key={plan.id || index}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  {/* 顶部信息区域 - 带颜色背景（使用古风颜色） */}
                  <div 
                    className={`${getBgColor(plan.status, index)} p-4 cursor-pointer`}
                    style={{
                      backgroundImage: `url(${TRAVEL_PLAN_CARD_BG_IMAGES[index % TRAVEL_PLAN_CARD_BG_IMAGES.length]})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                    }}
                    onClick={() => {
                      const cardBgImage = TRAVEL_PLAN_CARD_BG_IMAGES[index % TRAVEL_PLAN_CARD_BG_IMAGES.length];
                      handleTravelPlanClick({ ...plan, cardBgImage });
                    }}
                  >
                    {/* 标题和状态 */}
                    <div className="flex justify-between items-start mb-1"style={{ fontFamily: '宋体, SimSun, serif' }}>
                      <h3 className="font-bold text-white text-lg">
                        {plan.destination || plan.name || '未命名行程'}
                        {plan.travelDays && `${plan.travelDays}天行程`}
                      </h3>
                      <div className="flex flex-col items-end">
                        <img
                          className="w-5 h-5 cursor-pointer"
                          src="/分享.png"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenShareModal(plan);
                          }}
                        />
                        <span className={`mt-2 text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          plan.status === 'active' ? 'bg-blue-500 text-white' :
                          plan.status === 'completed' ? 'bg-gray-500 text-white' :
                          plan.status === 'pending' ? 'bg-orange-500 text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {plan.status === 'completed' && '已结束'}
                          {plan.status === 'active' && '进行中'}
                          {plan.status === 'pending' && '未开始'}
                          {!plan.status && '待定'}
                        </span>
                      </div>
                    </div>
                    
                    {/* 日期范围 */}
                    <p className="text-white text-sm mt-1">
                      {plan.startDate && plan.endDate 
                        ? `${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}`
                        : plan.dateRange || '日期待定'
                      }
                      {plan.travelDays && ` ${plan.travelDays}天${Math.ceil(plan.travelDays / 2)}晚`}
                    </p>
                    
                    {/* 地点数量 */}
                    {plan.days && plan.days.length > 0 && (
                      <p className="text-gray-600 text-sm mt-1">
                        {plan.days.length}个地点
                      </p>
                    )}
                  </div>
                  
                  {/* 图片区域 - 带旋转动画（完全按照 legacy/Home.jsx） */}
                  {imageUrl && (
                    <div className="p-4" style={{backgroundImage:'url(/导航背景.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
                      <div className="h-24 rounded-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <img
                          src={imageUrl}
                          alt={plan.destination}
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
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 渲染底部导航
  const renderBottomNav = () => (
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
          className="flex flex-col items-center justify-center flex-1 transition-all"
          style={{ color: "#724B10" }}
          onClick={() => {
            // 当前页面，滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img className="w-10 h-10" src="/首页3.png" />
          <span className="text-sm font-blod mb-1">首页</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
          onClick={() => {
            console.log('🔍 导航到发现页面');
            onNavigateToDiscover && onNavigateToDiscover();
          }}
        >
          <img className="w-10 h-10" src="/发现3.png" />
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
          {/* 外圆使用导航背景 */}
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
             onNavigateToCommunity && onNavigateToCommunity();
          }}
        >
          <img className="w-10 h-10" src="/消息3.png" />
          <span className="text-xs mb-1">消息</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
          onClick={() => {
            console.log('👤 导航到我的页面');
            onNavigateToMine && onNavigateToMine();
          }}
        >
          <img className="w-9 h-10" src="/我的页面3.png" />
          <span className="text-xs mb-1">我的</span>
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // 主渲染
  // ═══════════════════════════════════════════════════════════════════

  // 渲染旅行计划提醒对话框
  const renderReminderDialog = () => {
    if (!showReminderDialog || !currentReminderPlan) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-GuText mb-2">
              旅行计划提醒
            </h3>
            <p className="text-gray-600 text-sm">
              您的 <span className="font-semibold text-GuText">{currentReminderPlan.destination}</span> 之旅今天开始啦！
            </p>
          </div>
          
          <div className="bg-[#d6e9ca] rounded-lg p-4 mb-4">
            <div className="flex items-center text-sm text-gray-700 mb-2">
              <span className="mr-2">📅</span>
              <span>
                {new Date(currentReminderPlan.startDate).toLocaleDateString()} - {new Date(currentReminderPlan.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="mr-2">⏱️</span>
              <span>{currentReminderPlan.name}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowReminderDialog(false)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              稍后再说
            </button>
            <button
              onClick={handleStartTravelPlan}
              className="flex-1 px-4 py-3 bg-[#e1bda2] text-white rounded-lg hover:bg-[#d5a495] transition-colors font-medium"
            >
              开始旅行
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 🎨 如果初始加载中（所有数据都在加载），显示骨架屏
  const isInitialLoading = postsLoading && plansLoading;
  
  if (isInitialLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* 顶部横幅 */}
      {renderHeroBanner()}
      
      {/* 顶部AI助手 */}
      {renderAiAssistant()}
      
      <div className='flex flex-col -mt-[15%] relative z-10 bg-white rounded-t-[3rem] shadow-lg pt-6'style={{backgroundImage: 'url("/首页古风背景3.jpg")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'}}>
      <img src="首页古风小图标1.png" className='w-[90%] absolute top-0 flex-1 mb-4 ml-[5%]'/>
      {/* 热门推荐 */}
      {renderHotRecommendations()}
      
      {/* 我的旅行计划 */}
      {renderMyTravelPlans()}
      </div>
      
      {/* 分享弹窗 */}
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
                <div className="w-9 h-9 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                  <img 
                    src="/可爱图标.png" 
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

      {/* 底部导航 */}
      {renderBottomNav()}
      
      {/* 旅行计划提醒对话框 */}
      {renderReminderDialog()}
      
      {/* 省份选择弹窗 */}
      {showProvinceSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowProvinceSelector(false)}>
          <div className="bg-white rounded-2xl w-11/12 max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">选择省份</h3>
              <button
                onClick={() => setShowProvinceSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-3">
                {Object.keys({
                  '北京': ['北京市'],
                  '天津': ['天津市'],
                  '河北': ['石家庄市'],
                  '山西': ['太原市'],
                  '内蒙古': ['呼和浩特市'],
                  '辽宁': ['沈阳市'],
                  '吉林': ['长春市'],
                  '黑龙江': ['哈尔滨市'],
                  '上海': ['上海市'],
                  '江苏': ['南京市'],
                  '浙江': ['杭州市'],
                  '安徽': ['合肥市'],
                  '福建': ['福州市'],
                  '江西': ['南昌市'],
                  '山东': ['济南市'],
                  '河南': ['郑州市'],
                  '湖北': ['武汉市'],
                  '湖南': ['长沙市'],
                  '广东': ['广州市'],
                  '广西': ['南宁市'],
                  '海南': ['海口市'],
                  '重庆': ['重庆市'],
                  '四川': ['成都市'],
                  '贵州': ['贵阳市'],
                  '云南': ['昆明市'],
                  '西藏': ['拉萨市'],
                  '陕西': ['西安市'],
                  '甘肃': ['兰州市'],
                  '青海': ['西宁市'],
                  '宁夏': ['银川市'],
                  '新疆': ['乌鲁木齐市']
                }).map((province) => (
                  <button
                    key={province}
                    onClick={() => {
                      setCurrentProvince(province);
                      setShowProvinceSelector(false);
                    }}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      currentProvince === province
                        ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {province}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 隐藏的地图容器（用于定位） */}
      <div id="hidden-map-container" style={{ display: 'none' }}></div>
      
      {/* 自定义样式 */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .pb-safe {
          padding-bottom: calc(4rem + env(safe-area-inset-bottom));
        }
      `}} />
      
      {/* AI入口弹窗 */}
      <AiEntryModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
        onGeneratePlan={() => {
          setShowAiModal(false);
          if (onNavigateToAi) {
            // 跳转到 CreatePlanAiPage
            onNavigateToAi('create');
          }
        }}
        onChat={() => {
          setShowAiModal(false);
          if (onNavigateToAi) {
            // 跳转到 AiPage_N8N
            onNavigateToAi('chat');
          }
        }}
      />
    </div>
  );
};

export default NewHomePage;

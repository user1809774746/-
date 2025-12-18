import React, { useState, useEffect, useRef } from "react";
import amapConfig from "../config/amapConfig";
import { MapContainer } from "react-leaflet";
import { API_CONFIG, getFriendsList, shareTravelPlanToAI, getCurrentUserId, sendMessage, streamGenerateTravelogue, getTravelPlanImagesUrlsForPost } from "../api/config";

import SwipeableItem from "./SwipeableItem";
import AiFloatingButton from "./AiFloatingButton";
import TravelogueEntryModal from "./TravelogueEntryModal";

export default function MyTravalPlanPage({onBack,onNavigateToPlanPostDetail,trip,onNavigateToAddActivity,extraAttractions,onPlanRoute,userLocation,onNavigateToAi,onNavigateToChat,onNavigateToEditor}) {

    const headerBgImage = trip && trip.cardBgImage ? trip.cardBgImage : null;

    const [travelPlan,setTravalPlan]=useState(null);
    const [loading,setLoading]=useState(true);
    const [travelDays,setTravelDays]=useState(3);
    const [expandedDay, setExpandedDay] = useState(null);
    const [showExtraDayExpanded, setShowExtraDayExpanded] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [planAttractions, setPlanAttractions] = useState([]); // 当前行程的景点列表
    //日历
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedStarteDate, setSelectedStarteDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [currentMonth,setCurrentMonth]=useState(new Date().getMonth());
    //const [currentYear,setCurrentYear]=useState(2025);    //当前用了假数据所以
    // const [travalDays,setTravalDays]=useState(travel_plan.travel_days);
    const [currentYear,setCurrentYear]=useState(new Date().getFullYear());
    const [showActivityEditModal, setShowActivityEditModal] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [editingDayIndex, setEditingDayIndex] = useState(null);
    const [editingActivityIndex, setEditingActivityIndex] = useState(null);
    const [editLocation, setEditLocation] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editCost, setEditCost] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [startHour, setStartHour] = useState('13');
    const [startMinute, setStartMinute] = useState('19');
    const [endHour, setEndHour] = useState('14');
    const [endMinute, setEndMinute] = useState('43');
    const [lastUploadedImageUrl, setLastUploadedImageUrl] = useState(null);
    const [travelPlanImages, setTravelPlanImages] = useState([]);
    const [travelPlanImageTotal, setTravelPlanImageTotal] = useState(0);
    const [showImageGallery, setShowImageGallery] = useState(false);

    const [showShareModal, setShowShareModal] = useState(false);
    const [friends, setFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState(null);

    const [showAddActivity,setshowAddActivity]=useState(false);

    const [draggingActivity, setDraggingActivity] = useState(null);

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

    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const fileInputRef = useRef(null);

    console.log('当前日历年份:', currentYear);
    //日历滑动
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);

    const minSwipeDistance = 50; // 最小滑动距离（px）

    const openActivityEditModal = (dayIndex, activityIndex, activity) => {
      if (!activity) return;

      setEditingDayIndex(dayIndex);
      setEditingActivityIndex(activityIndex);
      setEditingActivity(activity);

      const initialLocation = activity.location || '';
      const initialTime = activity.activityTime || activity.time || '';
      const initialCost =
        activity.cost != null && activity.cost !== ''
          ? String(activity.cost)
          : '';

      setEditLocation(initialLocation);
      setEditTime(initialTime);
      setEditCost(initialCost);
      setEditError('');
      setShowTimePicker(false);

      if (initialTime && typeof initialTime === 'string') {
        const match = initialTime.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
        if (match) {
          const [, sh, sm, eh, em] = match;
          setStartHour(sh.padStart(2, '0'));
          setStartMinute(sm.padStart(2, '0'));
          setEndHour(eh.padStart(2, '0'));
          setEndMinute(em.padStart(2, '0'));
        }
      }

      setShowActivityEditModal(true);
    };

    const closeActivityEditModal = () => {
      setShowActivityEditModal(false);
      setEditingActivity(null);
      setEditingDayIndex(null);
      setEditingActivityIndex(null);
      setShowTimePicker(false);
      setEditError('');
    };

    const handleOpenTimePicker = () => {
      setShowTimePicker(true);
    };

    const handleCancelTimePicker = () => {
      setShowTimePicker(false);
    };

    const handleConfirmTimePicker = () => {
      const start = `${startHour}:${startMinute}`;
      const end = `${endHour}:${endMinute}`;
      setEditTime(`${start}-${end}`);
      setShowTimePicker(false);
    };

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

    // 获取当前旅行计划的所有景点
    const fetchTravelPlanAttractions = async (planId) => {
      if (!planId) return;

      try {
        const endpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_ATTRACTIONS.replace('{travelPlanId}', planId);
        console.log('准备请求行程景点接口:', endpoint, 'planId =', planId);

        const response = await apiRequest(endpoint, { method: 'GET' });
        console.log('行程景点接口完整响应:', response);
        console.log('response.code:', response?.code);
        console.log('response.data:', response?.data);
        console.log('response.data 类型:', typeof response?.data);
        console.log('response.data 是否为数组:', Array.isArray(response?.data));

        // 尝试多种可能的数据结构
        let attractions = [];
        
        if (response && response.code === 200) {
          // 情况1: response.data.attractions 是数组
          if (response.data && Array.isArray(response.data.attractions)) {
            attractions = response.data.attractions;
            console.log('✅ 从 response.data.attractions 获取到景点');
          }
          // 情况2: response.data 本身就是数组
          else if (Array.isArray(response.data)) {
            attractions = response.data;
            console.log('✅ 从 response.data 获取到景点');
          }
          // 情况3: response.data.list 是数组
          else if (response.data && Array.isArray(response.data.list)) {
            attractions = response.data.list;
            console.log('✅ 从 response.data.list 获取到景点');
          }
          
          console.log('解析到的景点数量:', attractions.length);
          if (attractions.length > 0) {
            console.log('第一条景点示例:', attractions[0]);
            console.log('第一条景点的坐标:', {
              longitude: attractions[0].longitude,
              latitude: attractions[0].latitude,
              lng: attractions[0].lng,
              lat: attractions[0].lat
            });
          }
          setPlanAttractions(attractions);
        } else {
          console.warn('❌ 行程景点响应结构不符合预期，无法解析 attractions 列表');
          setPlanAttractions([]);
        }
      } catch (error) {
        console.error('获取旅行计划景点失败:', error);
        setPlanAttractions([]);
      }
    };

    const fetchTravelPlanImages = async (planId) => {
      if (!planId) return;

      try {
        const endpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_IMAGES.replace('{id}', planId);
        const response = await apiRequest(endpoint, { method: 'GET' });

        if (response && response.code === 200 && response.data) {
          const images = Array.isArray(response.data.images) ? response.data.images : [];
          setTravelPlanImages(images);
          const total = typeof response.data.total === 'number' ? response.data.total : images.length;
          setTravelPlanImageTotal(total);

          if (images.length > 0) {
            const last = images[images.length - 1];
            if (last && last.url) {
              setLastUploadedImageUrl(last.url);
            }
          } else {
            setLastUploadedImageUrl(null);
          }
        } else {
          setTravelPlanImages([]);
          setTravelPlanImageTotal(0);
          setLastUploadedImageUrl(null);
        }
      } catch (error) {
        console.error('获取旅行计划图片失败:', error);
        setTravelPlanImages([]);
        setTravelPlanImageTotal(0);
        setLastUploadedImageUrl(null);
      }
    };

    const fetchTravelPlanDetail=async()=>{
      try{
        setLoading(true);
        if(!trip||!trip.id){
          console.error('行程ID不存在');
          return;
        }
        
        // 使用配置的API端点
        const endpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_FULL.replace('{id}', trip.id);
        const response = await apiRequest(endpoint, { method: 'GET' });
        
        if(response.code===200&&response.data){
          const planData=response.data;
          setTravalPlan(planData);
          setTravelDays(planData.totalDays || planData.travelPlan.travelDays || 3);

          // 获取当前行程的所有景点，用于地图展示
          if (trip && trip.id) {
            fetchTravelPlanAttractions(trip.id);
          }
          
          // 解析日期信息
          const tp = planData.travelPlan || {};

          // 优先使用 startDate / endDate
          if (tp.startDate || tp.endDate) {
            try {
              if (tp.startDate) {
                const startDate = new Date(tp.startDate);
                let endDate = null;

                if (tp.endDate) {
                  endDate = new Date(tp.endDate);
                } else if (planData.totalDays > 1) {
                  endDate = new Date(startDate);
                  endDate.setDate(startDate.getDate() + planData.totalDays - 1);
                }

                setSelectedStarteDate(startDate);
                if (endDate) {
                  setSelectedEndDate(endDate);
                }
              }
            } catch (e) {
              console.warn('解析旅行日期失败:', e, tp.startDate, tp.endDate);
            }
          } else if (tp.date) {
            // 兼容旧的 date 字符串格式：yyyy-MM-dd-yyyy-MM-dd
            const dateParts = tp.date.split('-');
            if (dateParts.length >= 3) {
              const startDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`);
              let endDate = null;

              if (dateParts.length >= 6) {
                endDate = new Date(`${dateParts[3]}-${dateParts[4]}-${dateParts[5]}`);
              } else if (planData.totalDays > 1) {
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + planData.totalDays - 1);
              }

              setSelectedStarteDate(startDate);
              if (endDate) {
                setSelectedEndDate(endDate);
              }
            }
          }
        }
      }catch(error){
        console.error('获取行程详情失败:', error);
        useMockData();
      }finally{
        setLoading(false);
      }
    };
    const useMockData=()=>{
      const mockData={
        travelPlan: travel_plan, // 您现有的模拟数据
      dailyItineraries: travel_plan.daily_itinerary,
      accommodations: travel_plan.accommodation_recommendations,
      totalDays: travel_plan.travel_days,
      totalAccommodations: travel_plan.accommodation_recommendations.length
      }
          setTravalPlan(mockData);
          setPlanAttractions([]);
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

    const handleOpenShareModal = () => {
      setShowShareModal(true);
      if (!friends || friends.length === 0) {
        loadFriendsForShare();
      }
    };

    const handleShareToFriend = async (friend) => {
      if (!friend || !trip || !trip.id) {
        return;
      }

      const basePlan = (travelPlan && travelPlan.travelPlan) || {};

      const payload = {
        travelPlanId: trip.id,
        title: trip.name || basePlan.title || basePlan.destination || '旅行计划',
        name: trip.name || basePlan.title || basePlan.destination || '旅行计划',
        destination: basePlan.destination || trip.city || undefined,
        city: basePlan.destination || trip.city || undefined,
        travelDays: basePlan.travelDays || travelDays || undefined,
        startDate: basePlan.startDate || undefined,
        endDate: basePlan.endDate || undefined,
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
      if (!trip || !trip.id) {
        console.warn('没有旅行计划ID，无法分享给AI');
        return;
      }

      try {
        setShowShareModal(false);
        
        // 获取用户ID和sessionId
        const userId = await getCurrentUserId();
        const sessionId = localStorage.getItem('chatSessionId') || '';
        
        // 获取旅行计划标题
        const planTitle = trip.name || displayData.travelPlan?.destination || '旅行计划';
        
        // 构建分享消息
        const message = `我分享一个旅行计划：${planTitle}`;
        
        console.log('📤 开始分享旅行计划给AI:', {
          travelPlanId: trip.id,
          userId,
          sessionId,
          message
        });
        
        // 调用后端API分享旅行计划给AI
        const response = await shareTravelPlanToAI(trip.id, {
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
          localStorage.setItem('sharedTravelPlanId', trip.id.toString());
          
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

    const handleAddImageClick = () => {
      if (!trip || !trip.id) {
        console.warn('没有 travelPlanId，无法上传图片');
        return;
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    };

    const handleTravelPlanImageChange = async (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }
      if (!trip || !trip.id) {
        console.warn('没有 travelPlanId，无法上传图片');
        return;
      }

      let selectedFiles = Array.from(files);

      if (selectedFiles.length > 5) {
        alert('一次最多上传5张图片，将只上传前5张');
        selectedFiles = selectedFiles.slice(0, 5);
      }

      const currentTotal = travelPlanImageTotal || travelPlanImages.length || 0;
      let remaining = 10 - currentTotal;
      if (remaining <= 0) {
        alert('该旅行计划最多只能上传10张图片');
        return;
      }

      if (selectedFiles.length > remaining) {
        alert(`当前最多还能上传${remaining}张图片，将只上传前${remaining}张`);
        selectedFiles = selectedFiles.slice(0, remaining);
      }

      const token = localStorage.getItem('auth_token');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const endpointTemplate = API_CONFIG.ENDPOINTS.UPLOAD_TRAVEL_PLAN_IMAGE.replace('{id}', trip.id);

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch(endpointTemplate, {
            method: 'POST',
            headers,
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log('上传旅行计划图片成功:', data);
        } catch (error) {
          console.error('上传旅行计划图片失败:', error);
        }
      }

      await fetchTravelPlanImages(trip.id);
    };

    const handleOpenImageGallery = () => {
      if (!trip || !trip.id) {
        return;
      }
      if (!travelPlanImages || travelPlanImages.length === 0) {
        return;
      }
      setShowImageGallery(true);
    };

    const handleDeleteImage = async (imageId) => {
      if (!trip || !trip.id || !imageId) {
        return;
      }
      try {
        const endpoint = `/api/travel-plans/images/${imageId}`;
        await apiRequest(endpoint, { method: 'DELETE' });
        await fetchTravelPlanImages(trip.id);
      } catch (error) {
        console.error('删除图片失败:', error);
      }
    };

    const [generatingPost, setGeneratingPost] = useState(false);
    const [showTravelogueModal, setShowTravelogueModal] = useState(false);

    const handleWriteTravelogue = () => {
      setShowTravelogueModal(true);
    };

    // 自己写游记的处理函数
    const handleWriteMyself = () => {
      setShowTravelogueModal(false);
      if (onNavigateToEditor) {
        onNavigateToEditor(null);
      }
    };

    // AI写游记的处理函数
    const handleAiWriteTravelogue = async () => {
      setShowTravelogueModal(false);
      if (!onNavigateToEditor) {
        return;
      }
      try {
        setGeneratingPost(true);
        const userId = await getCurrentUserId();
        const tp = (displayData && displayData.travelPlan) || {};
        const destination =
          tp.destination ||
          tp.city ||
          (trip && (trip.city || trip.name)) ||
          "";

        const parts = [];
        if (destination) {
          parts.push(`目的地：${destination}`);
        }
        if (travelDays) {
          parts.push(`行程天数：${travelDays}天`);
        }
        if (displayData && Array.isArray(displayData.dailyItineraries)) {
          displayData.dailyItineraries.forEach((day, index) => {
            if (!day || !Array.isArray(day.activities) || day.activities.length === 0) {
              return;
            }
            const title = day.title || `第${index + 1}天`;
            const activitiesText = day.activities
              .map((act, i) => {
                const name = act.location || act.name || act.attractionName || "";
                const time = act.activityTime || act.time || "";
                if (name && time) {
                  return `${i + 1}. ${time} - ${name}`;
                }
                if (name) {
                  return `${i + 1}. ${name}`;
                }
                return "";
              })
              .filter(Boolean)
              .join("；");
            if (activitiesText) {
              parts.push(`${title}：${activitiesText}`);
            }
          });
        }

        const travelPlanText = parts.join("\n");
        const result = await streamGenerateTravelogue({
          userId,
          travelPlan: travelPlanText || (tp && JSON.stringify(tp))
        });

        const prefill = {
          title: (result && result.title) || "",
          summary: (result && result.summary) || "",
          content: (result && result.content) || ""
        };

        if (destination) {
          prefill.destinationName = destination;
          prefill.destinationCity = destination;
        }

        if (trip && trip.id) {
          try {
            // 调用新接口获取图片URL列表
            const imageUrls = await getTravelPlanImagesUrlsForPost(trip.id);
            console.log('🖼️ 获取到旅行计划图片URL列表:', imageUrls);
            
            // 将图片URL列表添加到预填充数据中
            prefill.images = imageUrls || [];
            
            localStorage.setItem('travelPlanIdForPost', String(trip.id));
          } catch (e) {
            console.error('获取旅行计划图片失败:', e);
            // 即使获取图片失败，也继续创建游记
            prefill.images = [];
          }
        }

        onNavigateToEditor(prefill);
      } catch (e) {
        console.error("生成游记失败:", e);
        alert(`生成游记失败：${(e && e.message) || "未知错误"}`);
        onNavigateToEditor(null);
      } finally {
        setGeneratingPost(false);
      }
    };

    useEffect(() => {
      if (trip && trip.id) {
        fetchTravelPlanDetail();
        fetchTravelPlanImages(trip.id);
      } else {
        useMockData();
        setTravelPlanImages([]);
        setTravelPlanImageTotal(0);
        setLastUploadedImageUrl(null);
      }
    }, [trip]);

    // 示例行程数据
   const travel_plan= {
      destination: "杭州",
      travel_days: 3,
      total_budget: null,
      budget_breakdown: {
        transportation: 200,
        accommodation: null,
        tickets: 140,
        food: 450,
        other: 0
      },
      daily_itinerary: [
        {
          day: 1,
          date: null,
          activities: [
            {
              time: "9:00-12:00",
              activity: "游览杭州西湖，重点推荐苏堤、断桥、白堤。",
              location: "杭州西湖风景名胜区",
              description: "漫步湖边或骑行，欣赏湖光山色的西湖十景。",
              cost: 0,
              transportation: "步行或打车视住宿位置而定",
              photo: "http://store.is.autonavi.com/showpic/046f7db069e380fdc29375807debee83",
              
              lng:120.108478,
              lat:30.220671
            },
            {
              time: "12:00-13:30",
              activity: "杭帮菜午餐",
              location: "西湖附近餐馆",
              description: "推荐河坊街附近的当地特色餐厅。",
              cost: 0,
              transportation: "步行",
              photo: "http://store.is.autonavi.com/showpic/291127f3f2d2ceba0de575038ad6c f251_2048_2048_80.jpg",
              lng:120.108478,
              lat:30.220671
            },
            {
              time: "14:00-17:00",
              activity: "灵隐寺及飞来峰游览",
              location: "灵隐寺",
              description: "古朴庄严的古寺，飞来峰有许多古代石刻佛像。",
              cost: 45,
              transportation: "打车约20分钟，约20元",
              photo: "http://store.is.autonavi.com/showpic/4aa0a6a1b6ee72c9833441f363cbb43a",
              lng:120.108478,
              lat:30.220671
            },
            {
              time: "18:00-20:00",
              activity: "西湖边夜游",
              location: "杭州西湖",
              description: "夜晚游览西湖，欣赏美丽夜景。",
              cost: 0,
              transportation: "步行或打车",
              photo: "http://store.is.autonavi.com/showpic/046f7db069e380fdc29375807debee83",
              lng:120.108478,
              lat:30.220671
            }
          ]
        },
        {
          day: 2,
          date: null,
          activities: [
            {
              time: "8:30-12:00",
              activity: "九溪十八涧徒步",
              location: "九溪十八涧",
              description: "溪流清澈，森林环绕，空气清新，是杭州后花园。",
              cost: 0,
              transportation: "打车约30分钟，费用约30元",
              photo: "https://aos-comment.amap.com/B0LR1ZRRQE/comment/content_media_external_file_1000078788_ss__1758420845115_20276379.jpg",
              lng:120.108478,
              lat:30.220671
            },
            {
              time: "12:30-13:30",
              activity: "农家乐用餐",
              location: "九溪十八涧附近",
              description: "体验当地山间美食。",
              cost: 0,
              transportation: "步行",
              photo: "http://store.is.autonavi.com/showpic/8b1dad6e67922a71b6a0b5cc8bbf8bd3",
              lng:120.108478,
              lat:30.220671
            },
            {
              time: "14:00-17:00",
              activity: "龙井茶园参观与品茶",
              location: "龙井茶园",
              description: "了解茶叶采摘及制作过程，体验茗茶文化。",
              cost: 30,
              transportation: "打车约15分钟，费用约15元",
              photo: "https://aos-comment.amap.com/B0FFF9ZLFC/comment/a36b2181ede0293a12be8b8be65c f251_2048_2048_80.jpg",
              lng:120.108478,
              lat:30.220671
            },
            {
              time: "18:00-20:00",
              activity: "西湖边轻松散步",
              location: "杭州西湖",
              description: "晚上回酒店休息，推荐轻松散步。",
              cost: 0,
              transportation: "步行",
              photo: "http://store.is.autonavi.com/showpic/de5365447ef8fb1e61e4f030a9dbd26f",
              lng:120.108478,
              lat:30.220671
            }
          ]
        },
        {
          day: 3,
          date: null,
          activities: [
            {
              time: "9:00-12:00",
              activity: "西湖游船游览",
              location: "西湖游船码头",
              description: "湖面悠闲游，欣赏湖中美景。",
              cost: 60,
              transportation: "打车约15分钟，费用约15元",
              photo: "https://aos-comment.amap.com/B0FFG03EXP/comment/content_media_external_file_100000601_1761493130826_15943314.jpg"
            },
            {
              time: "12:00-13:30",
              activity: "西湖边午餐",
              location: "西湖附近餐馆",
              description: "享用当地美食。",
              cost: 0,
              transportation: "步行",
              photo: "http://store.is.autonavi.com/showpic/04A76AB46308410FBDAF3C8577E67275"
            },
            {
              time: "14:00-16:30",
              activity: "西溪国家湿地公园游览",
              location: "西溪国家湿地公园",
              description: "都市中的湿地生态，环境幽静，适合拍照和放松。",
              cost: 80,
              transportation: "打车约20分钟，费用约20元",
              photo: "http://store.is.autonavi.com/showpic/ee8ba4fd213aa0ee5605e41415921500"
            }
          ]
        }
      ],
      accommodation_recommendations: [
        {
          name: "汉庭酒店杭州西湖店",
          type: "经济型",
          location: "临近西湖，交通便利",
          price_per_night: 250,
          advantages: "靠近西湖，交通方便"
        },
        {
          name: "杭州西湖国宾馆",
          type: "舒适型",
          location: "环西湖，环境优雅",
          price_per_night: 600,
          advantages: "优质环境，靠近景区"
        },
        {
          name: "知味观西湖假日酒店",
          type: "豪华型",
          location: "西湖边，环境和服务上乘",
          price_per_night: 1200,
          advantages: "豪华体验，交通便利"
        }
      ],
      attraction_details: [
        {
          name: "杭州西湖风景名胜区",
          ticket_price: {
            adult: 0,
            student: 0,
            elderly: 0
          },
          opening_hours: "全天开放",
          must_see_spots: [
            "苏堤春晓",
            "断桥残雪",
            "白堤"
          ],
          tips: "节假日人流较多，请避开高峰"
        },
        {
          name: "灵隐寺",
          ticket_price: {
            adult: 45,
            student: 25,
            elderly: 25
          },
          opening_hours: "7:00-17:30",
          must_see_spots: [
            "大雄宝殿",
            "飞来峰石刻"
          ],
          tips: "请尊重寺庙规矩，保持安静"
        },
        {
          name: "九溪十八涧",
          ticket_price: {
            adult: 0,
            student: 0,
            elderly: 0
          },
          opening_hours: "全天开放",
          must_see_spots: [
            "九溪烟树",
            "瀑布"
          ],
          tips: "徒步鞋推荐，部分山路湿滑"
        },
        {
          name: "龙井茶园",
          ticket_price: {
            adult: 30,
            student: 20,
            elderly: 20
          },
          opening_hours: "8:00-17:00",
          must_see_spots: [
            "茶山采茶",
            "品茶体验"
          ],
          tips: "请遵守茶园规定，不采摘非自购茶叶"
        },
        {
          name: "西溪国家湿地公园",
          ticket_price: {
            adult: 80,
            student: 50,
            elderly: 50
          },
          opening_hours: "8:00-17:30",
          must_see_spots: [
            "湿地水道",
            "木栈道",
            "花海"
          ],
          tips: "注意防蚊虫，适当防晒"
        },
        {
          name: "西湖游船",
          ticket_price: {
            adult: 60,
            student: 30,
            elderly: 30
          },
          opening_hours: "8:00-18:00",
          must_see_spots: [
            "湖心亭",
            "三潭印月"
          ],
          tips: "遇雨影响游船体验，注意天气"
        }
      ],
      total_tips: "推荐住在靠近西湖的酒店，方便游览主要景点和夜游。",
      special_requirements: "无"
    }
    const displayData = travelPlan || { 
      travelPlan: travel_plan, 
      dailyItineraries: travel_plan.daily_itinerary,
      accommodations: travel_plan.accommodation_recommendations
    };

    useEffect(() => {
      if (extraAttractions && extraAttractions.length > 0) {
        console.log('用户添加的景点列表:', extraAttractions);
        extraAttractions.forEach((poi, index) => {
          console.log(`第 ${index + 1} 个景点:`, poi);
        });
      }
    }, [extraAttractions]);

    useEffect(() => {
      if (!mapContainerRef.current) {
        return;
      }

      console.log('当前 planAttractions 用于地图渲染:', planAttractions);

      const coords = [];

      const toNumber = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const num = parseFloat(value);
          return Number.isNaN(num) ? null : num;
        }
        return null;
      };

      // 1) 优先使用后端 /api/attractions/travel-plan/{id} 返回的景点坐标
      if (planAttractions && planAttractions.length > 0) {
        planAttractions.forEach((spot, index) => {
          if (!spot) return;

          // 新版后端：longitude 为经度(lng)，latitude 为纬度(lat)
          let lng = spot.longitude ?? spot.lng;  // 经度
          let lat = spot.latitude ?? spot.lat;   // 纬度

          console.log('MyTravalPlanPage - 后端景点原始坐标:', {
            index,
            spot,
            backendLongitude: spot.longitude,
            backendLatitude: spot.latitude,
            backendLng: spot.lng,
            backendLat: spot.lat,
            logLat: spot.log_lat,
          });

          // 兼容旧的 log_lat: "116.3974,39.9093" 字符串
          if ((lng == null || lat == null) && typeof spot.log_lat === 'string') {
            const parts = spot.log_lat.split(',');
            if (parts.length === 2) {
              const parsedLng = parseFloat(parts[0]);
              const parsedLat = parseFloat(parts[1]);
              if (!Number.isNaN(parsedLng) && !Number.isNaN(parsedLat)) {
                lng = parsedLng;
                lat = parsedLat;
              }
            }
          }

          const lngNum = toNumber(lng);
          const latNum = toNumber(lat);
          if (lngNum != null && latNum != null) {
            const point = [lngNum, latNum];
            coords.push(point);
            console.log('MyTravalPlanPage - 最终用于地图渲染的景点坐标点:', {
              index,
              point,
            });
          } else {
            console.warn('MyTravalPlanPage - 无效景点坐标，无法用于地图渲染:', {
              index,
              lng,
              lat,
              lngNum,
              latNum,
            });
          }
        });
      } else if (displayData && displayData.dailyItineraries) {
        // 2) 回退：从 dailyItineraries 的活动中读取坐标
        try {
          const firstDay = displayData.dailyItineraries[0];
          if (firstDay && Array.isArray(firstDay.activities) && firstDay.activities[0]) {
            console.log('dailyItineraries 第一条数据示例 day:', firstDay);
            console.log('dailyItineraries 第一条 activity 示例:', firstDay.activities[0]);
          }
        } catch (e) {
          console.warn('打印 dailyItineraries 示例失败:', e);
        }

        displayData.dailyItineraries.forEach((day) => {
          if (!day || !day.activities) return;
          day.activities.forEach((activity) => {
            if (!activity) return;

            // 顶层坐标（本地 mock 数据用的字段）
            let lng = activity.lng ?? activity.longitude;
            let lat = activity.lat ?? activity.latitude;

            // 若顶层没有，经 attraction 对象读取（后端 DTO 中的结构）
            const attraction = activity.attraction || activity.attractionDetail || null;
            if (attraction) {
              if (lng == null && (typeof attraction.longitude === 'number' || typeof attraction.lng === 'number')) {
                lng = attraction.longitude ?? attraction.lng;
              }
              if (lat == null && (typeof attraction.latitude === 'number' || typeof attraction.lat === 'number')) {
                lat = attraction.latitude ?? attraction.lat;
              }

              // 兼容 attraction.log_lat: "116.3974,39.9093" 字符串
              if ((lng == null || lat == null) && typeof attraction.log_lat === 'string') {
                const parts = attraction.log_lat.split(',');
                if (parts.length === 2) {
                  const parsedLng = parseFloat(parts[0]);
                  const parsedLat = parseFloat(parts[1]);
                  if (!Number.isNaN(parsedLng) && !Number.isNaN(parsedLat)) {
                    lng = parsedLng;
                    lat = parsedLat;
                  }
                }
              }
            }

            const lngNum = toNumber(lng);
            const latNum = toNumber(lat);
            if (lngNum != null && latNum != null) {
              coords.push([lngNum, latNum]);
            }
          });
        });
      }

      console.log('地图最终要渲染的坐标点列表 coords:', coords);

      const defaultCenter = { lng: 120.108478, lat: 30.220671 };
      const center = coords.length > 0
        ? { lng: coords[0][0], lat: coords[0][1] }
        : defaultCenter;

      const initMap = () => {
        if (!window.AMap || !mapContainerRef.current) {
          return;
        }

        if (mapRef.current) {
          try {
            mapRef.current.destroy();
          } catch (error) {
            console.warn('行程地图销毁失败:', error);
          }
          mapRef.current = null;
        }

        // 配置 Canvas willReadFrequently 以优化性能
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, attributes) {
          if (type === '2d') {
            attributes = attributes || {};
            attributes.willReadFrequently = true;
          }
          return originalGetContext.call(this, type, attributes);
        };

        const map = new window.AMap.Map(mapContainerRef.current, {
          ...amapConfig.defaultMapOptions,
          center: [center.lng, center.lat],
          zoom: 16,
          dragEnable: true,
          zoomEnable: true,
          scrollWheel: true,
          doubleClickZoom: true,
          keyboardEnable: true,
        });

        // 恢复原始 getContext 方法
        HTMLCanvasElement.prototype.getContext = originalGetContext;

        // 再次通过 setStatus 显式开启交互，兼容 JSAPI 2.0
        if (map.setStatus) {
          map.setStatus({
            dragEnable: true,
            zoomEnable: true,
            doubleClickZoom: true,
            keyboardEnable: true,
            scrollWheel: true,
            touchZoom: true,
          });
        }

        // 为所有坐标添加 Marker
        coords.forEach(([lng, lat]) => {
          new window.AMap.Marker({
            position: [lng, lat],
            map,
          });
        });

        // 自动缩放到包含所有点
        if (coords.length > 0 && map.setFitView) {
          map.setFitView();
        }

        // 添加工具条控件（直接使用已加载的插件，避免再次异步加载导致内部 appendChild 报错）
        if (window.AMap && window.AMap.ToolBar && map && typeof map.addControl === 'function') {
          try {
            const toolbar = new window.AMap.ToolBar();
            map.addControl(toolbar);
          } catch (e) {
            console.warn('行程地图添加工具条控件失败:', e);
          }
        }

        mapRef.current = map;
      };

      if (window.AMap) {
        initMap();
      } else {
        window._AMapSecurityConfig = {
          securityJsCode: amapConfig.securityKey,
        };

        const script = document.createElement('script');
        script.type = 'text/javascript';
        // 主脚本中直接声明需要的 AMap.ToolBar 插件，避免后续 AMap.plugin 再次异步加载
        script.src = amapConfig.getApiUrl(['AMap.ToolBar']);

        script.onload = () => {
          if (window.AMap) {
            initMap();
          } else {
            console.error('高德地图API加载失败');
          }
        };
        script.onerror = () => {
          console.error('高德地图API加载出错');
        };
        document.head.appendChild(script);
      }

      return () => {
        if (mapRef.current) {
          try {
            mapRef.current.destroy();
          } catch (error) {
            console.warn('行程地图销毁失败:', error);
          } finally {
            mapRef.current = null;
          }
        }
      };
    }, [travelPlan, planAttractions]);

    const parseActivityStartMinutes = (activity) => {
      if (!activity) return Number.MAX_SAFE_INTEGER;
      const timeStr = activity.activityTime || activity.time;
      if (!timeStr || typeof timeStr !== 'string') return Number.MAX_SAFE_INTEGER;

      const parts = timeStr.split('-');
      if (!parts[0]) return Number.MAX_SAFE_INTEGER;
      const start = parts[0].trim();
      const hm = start.split(':');
      if (!hm[0]) return Number.MAX_SAFE_INTEGER;

      const h = parseInt(hm[0], 10);
      const m = hm[1] != null && hm[1] !== '' ? parseInt(hm[1], 10) : 0;

      if (Number.isNaN(h) || Number.isNaN(m)) return Number.MAX_SAFE_INTEGER;
      return h * 60 + m;
    };

    const sortActivitiesByTime = (activities) => {
      if (!Array.isArray(activities)) return [];
      const withIndex = activities.map((item, idx) => ({ item, idx }));
      withIndex.sort((a, b) => {
        const ta = parseActivityStartMinutes(a.item);
        const tb = parseActivityStartMinutes(b.item);
        if (ta === tb) {
          return a.idx - b.idx;
        }
        return ta - tb;
      });
      return withIndex.map((entry) => entry.item);
    };

    const buildReorderPayload = (dailyItinerariesForPayload) => {
      const payload = [];
      if (!dailyItinerariesForPayload || !Array.isArray(dailyItinerariesForPayload)) {
        return payload;
      }

      dailyItinerariesForPayload.forEach((day, dayIndex) => {
        if (!day || !Array.isArray(day.activities)) return;
        const dayNumber = day.dayNumber || day.day || dayIndex + 1;

        day.activities.forEach((activity, index) => {
          if (!activity || !activity.id) return;
          payload.push({
            itineraryId: activity.id,
            dayNumber,
            orderIndex: index,
          });
        });
      });

      return payload;
    };

    const reorderItinerariesOnServer = async (newDailyItineraries) => {
      if (!trip || !trip.id) {
        return;
      }

      const itinerariesPayload = buildReorderPayload(newDailyItineraries);
      if (!itinerariesPayload.length) {
        return;
      }

      const endpoint = API_CONFIG.ENDPOINTS.REORDER_TRAVEL_PLAN_ITINERARIES.replace('{id}', trip.id);
      try {
        await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify({ itineraries: itinerariesPayload }),
        });
      } catch (error) {
        console.error('更新行程排序失败:', error);
      }
    };

    const applyReorderToState = async (
      sourceDayIndex,
      sourceActivityIndex,
      targetDayIndex,
      targetActivityIndex
    ) => {
      setDraggingActivity(null);

      if (
        sourceDayIndex === targetDayIndex &&
        (targetActivityIndex == null || targetActivityIndex === sourceActivityIndex)
      ) {
        return;
      }

      const currentPlan = travelPlan || { dailyItineraries: displayData.dailyItineraries || [] };

      if (!currentPlan.dailyItineraries || !Array.isArray(currentPlan.dailyItineraries)) {
        return;
      }

      const dailyItinerariesCopy = currentPlan.dailyItineraries.map((day) => ({
        ...day,
        activities: Array.isArray(day.activities) ? [...day.activities] : [],
      }));

      const sourceDay = dailyItinerariesCopy[sourceDayIndex];
      const targetDay = dailyItinerariesCopy[targetDayIndex];

      if (
        !sourceDay ||
        !targetDay ||
        !Array.isArray(sourceDay.activities) ||
        !Array.isArray(targetDay.activities)
      ) {
        return;
      }

      if (sourceActivityIndex < 0 || sourceActivityIndex >= sourceDay.activities.length) {
        return;
      }

      const movedList = sourceDay.activities.splice(sourceActivityIndex, 1);
      if (!movedList || movedList.length === 0) {
        return;
      }
      const moved = movedList[0];

      let insertIndex;
      if (typeof targetActivityIndex === 'number' && targetActivityIndex >= 0) {
        insertIndex = targetActivityIndex;
        if (sourceDayIndex === targetDayIndex && targetActivityIndex > sourceActivityIndex) {
          insertIndex = targetActivityIndex - 1;
        }
        if (insertIndex > targetDay.activities.length) {
          insertIndex = targetDay.activities.length;
        }
      } else {
        insertIndex = targetDay.activities.length;
      }

      targetDay.activities.splice(insertIndex, 0, moved);

      const sortedDailyItineraries = dailyItinerariesCopy.map((day) => ({
        ...day,
        activities: sortActivitiesByTime(day.activities),
      }));

      setTravalPlan((prev) => {
        const base = prev || currentPlan;
        return {
          ...base,
          dailyItineraries: sortedDailyItineraries,
        };
      });

      await reorderItinerariesOnServer(sortedDailyItineraries);
    };

    const handleActivityDragStart = (event, dayIndex, activityIndex) => {
      setDraggingActivity({ dayIndex, activityIndex });
      if (event && event.dataTransfer && event.dataTransfer.setData) {
        try {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData(
            'text/plain',
            JSON.stringify({ dayIndex, activityIndex })
          );
        } catch (e) {}
      }
    };

    const handleActivityDragOver = (event, targetDayIndex, targetActivityIndex) => {
      if (!draggingActivity) return;
      event.preventDefault();
    };

    const handleDayDragOver = (event, targetDayIndex) => {
      if (!draggingActivity) return;
      event.preventDefault();
    };

    const handleActivityDrop = (event, targetDayIndex, targetActivityIndex) => {
      if (!draggingActivity) return;
      event.preventDefault();
      const { dayIndex: sourceDayIndex, activityIndex: sourceActivityIndex } =
        draggingActivity;
      applyReorderToState(
        sourceDayIndex,
        sourceActivityIndex,
        targetDayIndex,
        targetActivityIndex
      );
    };

    const handleDayDrop = (event, targetDayIndex) => {
      if (!draggingActivity) return;
      event.preventDefault();
      const { dayIndex: sourceDayIndex, activityIndex: sourceActivityIndex } =
        draggingActivity;
      applyReorderToState(sourceDayIndex, sourceActivityIndex, targetDayIndex, null);
    };

    const handleActivityDragEnd = () => {
      setDraggingActivity(null);
    };

    const toggleDay = (dayIndex) => {
      setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
    };

    const handleDeleteDay = async (dayIndex, day) => {
      if (!trip || !trip.id) {
        console.warn('没有 travelPlanId，无法删除某一天');
        return;
      }

      const travelPlanId = trip.id;
      const dayNumber = day.dayNumber || day.day || dayIndex + 1;

      const endpoint = API_CONFIG.ENDPOINTS.DELECTE_ACTIVITY_DAY
        .replace('{travelPlanId}', travelPlanId)
        .replace('{dayNumber}', dayNumber);

      try {
        const response = await apiRequest(endpoint, {
          method: 'DELETE',
        });
        console.log('删除一天行程成功:', response);
        await fetchTravelPlanDetail();
      } catch (error) {
        console.error('删除一天行程失败:', error);
      }
    };

    const handleSaveActivity = async () => {
      if (!editingActivity) {
        return;
      }

      const updatedPayload = {
        activityTime: editTime || undefined,
        activityName:
          editingActivity.activityName || editingActivity.activity || undefined,
        location: editLocation || undefined,
        cost: editCost !== '' ? parseFloat(editCost) : undefined,
      };

      try {
        setEditSaving(true);
        setEditError('');

        if (editingActivity.id) {
          const endpoint = `/api/activities/${editingActivity.id}`;
          const response = await apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(updatedPayload),
          });

          const backendActivity =
            (response &&
              response.data &&
              (response.data.activity || response.data)) ||
            null;

          const mergedActivity = {
            ...editingActivity,
            ...updatedPayload,
            ...(backendActivity || {}),
          };

          setTravalPlan((prev) => {
            if (!prev || !prev.dailyItineraries) return prev;
            const newPlan = { ...prev };
            const dailyItineraries = [...newPlan.dailyItineraries];

            if (
              editingDayIndex == null ||
              editingActivityIndex == null ||
              !dailyItineraries[editingDayIndex] ||
              !dailyItineraries[editingDayIndex].activities
            ) {
              return prev;
            }

            const day = { ...dailyItineraries[editingDayIndex] };
            const activities = [...day.activities];
            activities[editingActivityIndex] = {
              ...activities[editingActivityIndex],
              ...mergedActivity,
            };
            day.activities = activities;
            dailyItineraries[editingDayIndex] = day;
            newPlan.dailyItineraries = dailyItineraries;
            return newPlan;
          });
        } else {
          setTravalPlan((prev) => {
            if (!prev || !prev.dailyItineraries) return prev;
            const newPlan = { ...prev };
            const dailyItineraries = [...newPlan.dailyItineraries];

            if (
              editingDayIndex == null ||
              editingActivityIndex == null ||
              !dailyItineraries[editingDayIndex] ||
              !dailyItineraries[editingDayIndex].activities
            ) {
              return prev;
            }

            const day = { ...dailyItineraries[editingDayIndex] };
            const activities = [...day.activities];
            activities[editingActivityIndex] = {
              ...activities[editingActivityIndex],
              ...editingActivity,
              ...updatedPayload,
            };
            day.activities = activities;
            dailyItineraries[editingDayIndex] = day;
            newPlan.dailyItineraries = dailyItineraries;
            return newPlan;
          });
        }

        closeActivityEditModal();
      } catch (error) {
        setEditError(error.message || '更新活动失败，请稍后重试');
      } finally {
        setEditSaving(false);
      }
    };

    const handleDeleteEditingActivity = async () => {
      if (!editingActivity || !editingActivity.id) {
        return;
      }

      try {
        const endpoint = `/api/activities/${editingActivity.id}`;
        await apiRequest(endpoint, {
          method: 'DELETE',
        });

        setTravalPlan((prev) => {
          if (!prev || !prev.dailyItineraries) return prev;
          const newPlan = { ...prev };
          const dailyItineraries = [...newPlan.dailyItineraries];

          if (
            editingDayIndex == null ||
            editingActivityIndex == null ||
            !dailyItineraries[editingDayIndex] ||
            !dailyItineraries[editingDayIndex].activities
          ) {
            return prev;
          }

          const day = { ...dailyItineraries[editingDayIndex] };
          const activities = [...day.activities];
          activities.splice(editingActivityIndex, 1);
          day.activities = activities;
          dailyItineraries[editingDayIndex] = day;
          newPlan.dailyItineraries = dailyItineraries;
          return newPlan;
        });

        closeActivityEditModal();
      } catch (error) {
        console.error('删除活动失败:', error);
        setEditError(error.message || '删除活动失败，请稍后重试');
      }
    };

    const getActivityCoordinates = (activity) => {
      if (!activity) return null;

      const toNumber = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const num = parseFloat(value);
          return Number.isNaN(num) ? null : num;
        }
        return null;
      };

      let lng = activity.lng ?? activity.longitude;
      let lat = activity.lat ?? activity.latitude;

      const attraction = activity.attraction || activity.attractionDetail || null;
      if (attraction) {
        if (lng == null && (typeof attraction.longitude === 'number' || typeof attraction.lng === 'number')) {
          lng = attraction.longitude ?? attraction.lng;
        }
        if (lat == null && (typeof attraction.latitude === 'number' || typeof attraction.lat === 'number')) {
          lat = attraction.latitude ?? attraction.lat;
        }

        if ((lng == null || lat == null) && typeof attraction.log_lat === 'string') {
          const parts = attraction.log_lat.split(',');
          if (parts.length === 2) {
            const parsedLng = parseFloat(parts[0]);
            const parsedLat = parseFloat(parts[1]);
            if (!Number.isNaN(parsedLng) && !Number.isNaN(parsedLat)) {
              lng = parsedLng;
              lat = parsedLat;
            }
          }
        }
      }

      const lngNum = toNumber(lng);
      const latNum = toNumber(lat);
      if (lngNum != null && latNum != null) {
        return { lng: lngNum, lat: latNum };
      }
      return null;
    };

    const handleNavigateToMapFromActivity = () => {
      if (!editingActivity || !onPlanRoute) {
        return;
      }

      const endCoords = getActivityCoordinates(editingActivity);

      const endName =
        editingActivity.location ||
        editingActivity.name ||
        (editingActivity.attraction && editingActivity.attraction.name) ||
        (editingActivity.attractionDetail && editingActivity.attractionDetail.name) ||
        "目的地";

      let startCoords = null;
      let fromName = "";

      if (userLocation && userLocation.lng != null && userLocation.lat != null) {
        startCoords = {
          lng: userLocation.lng,
          lat: userLocation.lat,
        };
        fromName = userLocation.address || "我的位置";
      } else {
        fromName = (displayData.travelPlan && displayData.travelPlan.destination) || "起点";
      }

      const routeData = {
        from: fromName,
        to: endName,
      };

      if (startCoords && endCoords) {
        routeData.coordinates = {
          start: {
            lng: startCoords.lng,
            lat: startCoords.lat,
            address: fromName,
          },
          end: {
            lng: endCoords.lng,
            lat: endCoords.lat,
            address: endName,
          },
        };
      }

      onPlanRoute(routeData);
      closeActivityEditModal();
    };

    const handleToggleHotelSelect = async (hotel) => {
      if (!hotel || !hotel.id) {
        return;
      }

      const currentlySelected = !!hotel.isSelected;
      const endpointTemplate = currentlySelected
        ? API_CONFIG.ENDPOINTS.UNSELECT_ACCOMMODATION
        : API_CONFIG.ENDPOINTS.SELECT_ACCOMMODATION;

      const endpoint = endpointTemplate.replace('{id}', hotel.id);

      try {
        const response = await apiRequest(endpoint, {
          method: 'PUT',
        });

        const backendSelected =
          response &&
          response.data &&
          response.data.accommodation &&
          typeof response.data.accommodation.isSelected === 'boolean'
            ? response.data.accommodation.isSelected
            : !currentlySelected;

        setTravalPlan((prev) => {
          if (!prev || !prev.accommodations) {
            return prev;
          }

          const newPlan = { ...prev };
          newPlan.accommodations = prev.accommodations.map((item) => {
            if (!item) return item;

            if (item.id === hotel.id) {
              return {
                ...item,
                isSelected: backendSelected,
              };
            }

            if (backendSelected && item.isSelected) {
              return {
                ...item,
                isSelected: false,
              };
            }

            return item;
          });
          return newPlan;
        });
      } catch (error) {
        console.error('更新住宿选择状态失败:', error);
      }
    };

    //日历的滑动逻辑
    const onTouchStart = (e) => {
      if (!e.targetTouches || e.targetTouches.length === 0) return;
      touchStartRef.current = e.targetTouches[0].clientY;
      touchEndRef.current = null;
    };

    const onTouchMove = (e) => {
      if (!e.targetTouches || e.targetTouches.length === 0) return;
      touchEndRef.current = e.targetTouches[0].clientY;
    };

    const onTouchEnd = () => {
      const start = touchStartRef.current;
      const end = touchEndRef.current;

      // 触点不足或没有有效移动时，直接返回
      if (start === null || end === null) return;

      const distance = start - end;
      const isUpSwipe = distance > minSwipeDistance;   // 向上滑：下一月
      const isDownSwipe = distance < -minSwipeDistance; // 向下滑：上一月

      if (isUpSwipe) {
        goToNextMonth();
      } else if (isDownSwipe) {
        goToPreviousMonth();
      }

      // 重置状态（同步生效，避免同一手势多次触发）
      touchStartRef.current = null;
      touchEndRef.current = null;
    };

    const isToday=(date)=>{
      const today=new Date();
      return date.toDateString()===today.toDateString();
    }
    const isSelected=(date)=>{
      return (selectedStarteDate&&date.toDateString()===selectedStarteDate.toDateString())||
      (selectedEndDate&&date.toDateString()===selectedEndDate.toDateString());

    }

    const isInRange=(date)=>{
      return selectedStarteDate&&selectedEndDate&&
      date>=selectedStarteDate&&date<=selectedEndDate;
    }

    //格式化月份
    const formatMonth=(year,month)=>{
      const monthName=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      return `${year}年${monthName[month]}`;
    }

    //默认情况下，日历显示选择日期的月份
    const generateCalendarDays = (year, month) => {
      // 当前月份第一天
      const firstDay = new Date(year, month, 1);
      // 当前月份最后一天
      const lastDay = new Date(year, month + 1, 0);
      // 上个月最后一天
      const prevLastDay = new Date(year, month, 0);

      const firstDayOfWeek = firstDay.getDay(); // 本月第一天是星期几
      const daysInMonth = lastDay.getDate();    // 本月有多少天
      const daysInPrevMonth = prevLastDay.getDate();

      const calendarDays = [];

      // 补齐前面不满一周的天数（来自上个月）
      for (let i = firstDayOfWeek - 1; i > 0; i--) {
        calendarDays.push({
          date: new Date(year, month - 1, daysInPrevMonth - i + 1),
          isCurrentMonth: false,
        });
      }

      // 当前月份的所有天
      for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
          date: new Date(year, month, i),
          isCurrentMonth: true,
        });
      }

      // 补齐后面不满一周的天数（来自下个月），保证总格子数为 35（5 行）或 42（6 行）
      const totalCells = calendarDays.length <= 35 ? 35 : 42;
      const remainingDays = totalCells - calendarDays.length;
      for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
        });
      }

      return calendarDays;
    };

    //切换上个月
    const goToPreviousMonth = () => {
      setCurrentMonth((prevMonth) => {
        if (prevMonth === 0) {
          // 从 1 月往前翻，变成上一年的 12 月
          setCurrentYear((prevYear) => prevYear - 1);
          return 11;
        }
        return prevMonth - 1;
      });
    };

    //切换下个月
    const goToNextMonth = () => {
      setCurrentMonth((prevMonth) => {
        if (prevMonth === 11) {
          // 从 12 月往后翻，变成下一年的 1 月
          setCurrentYear((prevYear) => prevYear+1);
          return 0;
        }
        return prevMonth + 1;
      });
    };

    //计算两个日期的天数
    const calculateDays=(start,end)=>{
      const diffTime= Math.abs(end-start);
      const diffDays= Math.ceil(diffTime/(1000*60*60*24))+1;
      return diffDays;
    }

    //格式化日期显示
    const formatDateRange=(start,end)=>{
      const formatDate=(date)=>{
        return `${date.getFullYear()}.${(date.getMonth()+1).toString().padStart(2,'0')}.${date.getDate().toString().padStart(2,'0')}`;
      }
      return `${formatDate(start)}-${formatDate(end)}`;
    }

    const formatDateForApi = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    //处理日期
    const handleDateSelect=(date)=>{
      if(!selectedStarteDate||(selectedStarteDate&&selectedEndDate)){
        setSelectedStarteDate(date);
        setSelectedEndDate(null);
      }else if(selectedStarteDate&&!selectedEndDate){
        if(date>=selectedStarteDate){
          setSelectedEndDate(date);
        }else{
          setSelectedStarteDate(date);
          setSelectedEndDate(null);
        }
     
      }
    }
    //确认修改日期
    const handleConfirmChange = async () => {
      if (!selectedStarteDate || !selectedEndDate) {
        return;
      }

      const days = calculateDays(selectedStarteDate, selectedEndDate);

      // 将新的起止日期同步到后端，由后端负责增减 dailyItineraries（包括新增空日程）
      if (trip && trip.id) {
        const startDateStr = formatDateForApi(selectedStarteDate);
        const endDateStr = formatDateForApi(selectedEndDate);

        try {
          const endpoint = API_CONFIG.ENDPOINTS.UPDATE_TRAVEL_PLAN_DATES.replace('{id}', trip.id);
          await apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify({
              startDate: startDateStr,
              endDate: endDateStr,
            }),
          });

          // 更新成功后重新拉取行程详情，拿到后端新增的空 dailyItineraries
          await fetchTravelPlanDetail();
        } catch (error) {
          console.error('更新旅行日期失败:', error);
        }
      }

      setTravelDays(days);
      setShowCalendar(false);
      setShowConfirmDialog(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    }
    
    const handleAddExtraDayAndNavigate = async () => {
      if (!onNavigateToAddActivity) return;

      // 如果行程或日期信息不完整，退化为原有行为：仅跳到添加页面
      if (!trip || !trip.id || !selectedStarteDate || !selectedEndDate) {
        onNavigateToAddActivity(null);
        return;
      }

      try {
        const startDate = selectedStarteDate;
        const oldEndDate = selectedEndDate;
        const newEndDate = new Date(oldEndDate);
        newEndDate.setDate(oldEndDate.getDate() + 1);

        // 1）更新行程日期，让后端增加一天 dailyItineraries
        const updateEndpoint = API_CONFIG.ENDPOINTS.UPDATE_TRAVEL_PLAN_DATES.replace('{id}', trip.id);
        await apiRequest(updateEndpoint, {
          method: 'PUT',
          body: JSON.stringify({
            startDate: formatDateForApi(startDate),
            endDate: formatDateForApi(newEndDate),
          }),
        });

        // 2）重新获取完整行程，找到新增的最后一天
        const fullEndpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_FULL.replace('{id}', trip.id);
        const response = await apiRequest(fullEndpoint, { method: 'GET' });

        if (response && response.code === 200 && response.data) {
          const planData = response.data;
          setTravalPlan(planData);
          setTravelDays(planData.totalDays || planData.travelPlan.travelDays || travelDays);

          const tp = planData.travelPlan || {};
          if (tp.startDate || tp.endDate) {
            try {
              if (tp.startDate) {
                const start = new Date(tp.startDate);
                let end = null;

                if (tp.endDate) {
                  end = new Date(tp.endDate);
                } else if (planData.totalDays > 1) {
                  end = new Date(start);
                  end.setDate(start.getDate() + planData.totalDays - 1);
                }

                setSelectedStarteDate(start);
                if (end) {
                  setSelectedEndDate(end);
                }
              }
            } catch (e) {
              console.warn('解析旅行日期失败(扩展一天后):', e, tp.startDate, tp.endDate);
            }
          }

          const list = planData.dailyItineraries || [];
          const newDay = list.length > 0 ? list[list.length - 1] : null;
          onNavigateToAddActivity(newDay);
        } else {
          onNavigateToAddActivity(null);
        }
      } catch (error) {
        console.error('增加一天行程失败:', error);
        onNavigateToAddActivity(null);
      }
    }


    useEffect(()=>{
      if(selectedStarteDate){
        setCurrentMonth(selectedStarteDate.getMonth());
        setCurrentYear(selectedStarteDate.getFullYear());
      }
    },[selectedStarteDate])


    return (
      <>
        <AiFloatingButton onNavigateToAi={onNavigateToAi} />
        
        {/* 游记选择弹窗 */}
        <TravelogueEntryModal 
          visible={showTravelogueModal}
          onClose={() => setShowTravelogueModal(false)}
          onWriteMyself={handleWriteMyself}
          onAiWrite={handleAiWriteTravelogue}
        />
        <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
            {/* 顶部导航 */}

            {/* <div className="w-full h-16 flex flex-row items-center justify-between px-4" style={{backgroundColor:'#B99B75'}}> */}
                {/* <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
                 
                </button> */}
                {/* <div className="font-bold text-xl flex-1 text-center"> */}

            <div
              className="w-full h-16 flex flex-row items-center justify-between px-4"
              style={{
                backgroundColor: '#B99B75',
                backgroundImage: headerBgImage ? `url(${headerBgImage})` : undefined,
                backgroundSize: headerBgImage ? 'cover' : undefined,
                backgroundPosition: headerBgImage ? 'center' : undefined,
                backgroundRepeat: headerBgImage ? 'no-repeat' : undefined,
              }}
            >

               <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
                 
                  <i className="text-xl text-white fa-solid fa-arrow-left"></i>
                </button>
                <div className="font-bold text-xl text-white absolute left-1/2 transform -translate-x-1/2 top-4">

                  {displayData.travelPlan?.destination || trip?.name || '加载中...'}
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <img
                    src="/分享.png"
                    className="w-5 h-5 cursor-pointer"
                    onClick={handleOpenShareModal}
                  />
                </div>
            </div>

            {/* 地图*/}
            <div className="w-full h-48 box-shadow">
                <div
                  ref={mapContainerRef}
                  className="w-full h-full"
                ></div>
            </div>
            <div className="w-full h-auto" style={{backgroundImage:"url(/首页古风背景3.jpg)",backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>

            <div className="mt-6 ml-5 font-bold text-GuText" style={{ fontFamily: '宋体, SimSun, serif' }} onClick={()=>setShowCalendar(true)}>
                  {selectedStarteDate&&selectedEndDate
                    ?`时间:${formatDateRange(selectedStarteDate,selectedEndDate)}`
                    :`时间:${currentYear}.1.2-${currentYear}.1.5`
                  }
                </div>
            

            {/* 内容区域 */}
            <div className="pt-4 pb-4">

                {/* 每日行程 */}
                <div className="mx-4 mt-4 space-y-3 mb-10">
                    {displayData.dailyItineraries && displayData.dailyItineraries.map((day, index) => (
                      <SwipeableItem key={index} onDelete={()=>handleDeleteDay(index, day)}>
                        <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {/* 日期头部 - 可点击展开/收起 */}
                            <div 
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleDay(index)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center flex-1">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-GuText"style={{ fontFamily: '宋体, SimSun, serif' }}>
                                               第{day.day || day.dayNumber}天
                                            </h4>
                                            <h5 className="text-xs text-gray-500 m-2">{displayData.travelPlan?.destination}</h5>
                                            <p className="text-sm mt-1">
                                                {(day.activities && day.activities[0]?.location) || '暂无地点信息'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* 展开/收起箭头图标 */}
                                    <div className="ml-3">
                                        <i className={`fa-solid fa-chevron-right text-gray-400 transition-transform duration-300 ${
                                            expandedDay === index ? 'rotate-90' : ''
                                        }`}></i>
                                    </div>
                                </div>
                            </div>
                           
                            {/* 展开的详细内容 */}
                            {expandedDay === index && (
                                <div className="px-4 pb-4 border-t border-gray-100">
                                    {/* 时间安排 */} 
                                    {/* {day.activities && day.activities.length > 0 && (
                                        <div className="mt-3">
                                            <div className="flex items-start">
                                                <i className="fa-solid fa-clock text-blue-500 mr-2 mt-0.5 text-sm"></i>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 font-semibold mb-1">时间安排</p>
                                                    <div className="space-y-2">
                                                        {day.activities.map((activity, actIndex) => (
                                                            <div key={actIndex} className="text-sm text-gray-700">
                                                                <span className="font-medium">{activity.time || activity.activityTime}</span>: {activity.activity || activity.activityName}
                                                            </div>
                                                        ))}
                                                    </div>

                                    {/* 景点列表 */}
                                    {day.activities && day.activities.length > 0 ? (
                                        <div className="mt-3">

                                            {/* <p className="text-xs text-gray-500 font-semibold mb-2">
                                                <i className="fa-solid fa-map-pin mr-1"></i>
                                                游览景点 ({day.activities.length})
                                            </p> */}
                                            <div className="space-y-0">
                                                {day.activities.map((activity, actIndex) => (
                                                    <div 
                                                        key={activity.id || `${index}-${actIndex}`} 
                                                        className="flex items-start relative"
                                                        draggable
                                                        onDragStart={(e) => handleActivityDragStart(e, index, actIndex)}
                                                        onDragOver={(e) => handleActivityDragOver(e, index, actIndex)}
                                                        onDrop={(e) => handleActivityDrop(e, index, actIndex)}
                                                        onDragEnd={handleActivityDragEnd}
                                                    >
                                                        {/* 时间线 */}
                                                        <div className="flex flex-col items-center mr-4 flex-shrink-0">
                                                            {/* 时间显示 */}
                                                            <div
                                                              className="text-xs text-gray-500 font-medium mb-1 whitespace-nowrap cursor-pointer"
                                                              onClick={() => openActivityEditModal(index, actIndex, activity)}
                                                            >
                                                                {activity.time || activity.activityTime}
                                                            </div>

                                                            {/* 圆点 */}
                                                            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                                                            {/* 连接线 */}
                                                            {actIndex < day.activities.length - 1 && (
                                                                <div className="w-0.5 h-40 bg-gray-300 mt-1"></div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* 内容区域 */}
                                                        <div className="flex-1 pb-6">
                                                            <div className="flex flex-col bg-white rounded-lg p-3 shadow-sm">
                                                              <span
                                                                className="text-sm font-bold text-gray-700 text-center m-2 cursor-pointer"
                                                                onClick={() => openActivityEditModal(index, actIndex, activity)}
                                                              >
                                                                {activity.location}
                                                              </span>

                                                                <div 
                                                                  className="w-65 h-20 rounded-lg overflow-hidden flex-shrink-0" 
                                                                  onClick={()=>onNavigateToPlanPostDetail(activity)} 
                                                                  style={{
                                                                    backgroundImage: `url(${activity.photo || activity.photoUrl})`,
                                                                    backgroundSize: 'cover',
                                                                    backgroundPosition: 'center'
                                                                  }}
                                                                ></div>
                                                                <div
                                                                  className="flex flex-col ml-3 flex-1 cursor-pointer"
                                                                  onClick={() => openActivityEditModal(index, actIndex, activity)}
                                                                >
                                                                    <div className="text-sm text-gray-700 mb-2">{activity.description || activity.activityName}</div>
                                                                    <div className="text-xs text-gray-500 mb-2">{activity.tips}</div>
                                                                    <div className="text-xs text-gray-400">{activity.transportation}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                    </div>
                                                   
                                                  
                                                ))}
                                                 <div
                                                   className="font-bold mb-8 mt-3 ml-6 text-GuText cursor-pointer"style={{ fontFamily: '宋体, SimSun, serif' }}
                                                   onClick={() => onNavigateToAddActivity && onNavigateToAddActivity(day)}
                                                 >+添加地点/活动</div>
                                                {/* <div className="w-[80%] h-[30px] bg-[${cardBgClasses[Math.floor(Math.random() * cardBgClasses.length)]}]"></div> */}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                          className="mt-3 py-6 flex flex-col items-center justify-center"
                                          onDragOver={(e) => handleDayDragOver(e, index)}
                                          onDrop={(e) => handleDayDrop(e, index)}
                                        >
                                            <p className="text-sm text-gray-400">暂无活动</p>
                                            <div
                                              className="font-bold mb-2 mt-3 text-sm text-blue-500 cursor-pointer"
                                              onClick={() => onNavigateToAddActivity && onNavigateToAddActivity(day)}
                                            >
                                              +添加地点/活动
                                            </div>
                                        </div>
                                    )}
                                    {/* 参考路线 */}
                                    {/* {day.activities && day.activities.length > 0 && (
                                        <div className="mt-5">
                                            <p className="text-xs text-gray-500 font-semibold mb-2">
                                                <i className="fa-solid fa-route mr-1"></i>
                                                交通方式
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {day.activities.map((activity, actIndex) => (
                                                    activity.transportation && (
                                                        <span 
                                                            key={actIndex}
                                                            className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                                                        >
                                                            {activity.transportation}
                                                        </span>
                                                    )
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        )}
                    </div>
                    </SwipeableItem>
                 
                ))}
                </div>
                {/* 用户自定义添加天数 */}
                <div className="mx-4 mt-4 space-y-2 mb-16">
                  <div
                    className="rounded-3xl shadow-sm overflow-hidden h-20 cursor-pointer" style={{backgroundColor:"#AFD5A3"}}
                    onClick={() => setShowExtraDayExpanded(!showExtraDayExpanded)}
                  >
                    <div className="font-bold ml-3 pt-1 mt-5 text-GuText"style={{ fontFamily: '宋体, SimSun, serif' }}>再增加一天旅行计划吧</div>
                  </div>
                           {showExtraDayExpanded && (
                    <div
                      className="font-bold py-4 px-2 border rounded-3xl mb-8 mt-3 ml-6 text-sm cursor-pointer text-GuText" style={{backgroundColor:"#d5a495",ontFamily: '宋体, SimSun, serif'}}
                      onClick={handleAddExtraDayAndNavigate}
                    >
                      +添加地点/活动
                    </div>
                  )}
                  
                    
                  
                </div>


              

                {/* {extraAttractions && extraAttractions.length > 0 && (
                  <div className="mx-4 mt-2 space-y-3 mb-4 ">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">我添加的景点</h3>
                    {extraAttractions.map((poi, index) => (
                      <div
                        key={poi.id || index}
                        className="bg-white rounded-lg shadow-sm p-3 flex"
                      >
                        <div
                          className="w-24 h-24 bg-gray-200 rounded-lg mr-4 flex-shrink-0 bg-cover bg-center"
                          style={{ backgroundImage: poi.photo ? `url(${poi.photo})` : 'none' }}
                        ></div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-800 mb-1">{poi.name}</h4>
                          <p className="text-xs text-gray-600 mb-1">{poi.address}</p>
                          {poi.lng != null && poi.lat != null && (
                            <p className="text-xs text-gray-400">
                              {poi.lng}, {poi.lat}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )} */}
                  {/* 上传图片 */}
              <div className="w-full mt-10 ml-5 mb-10">
                      <div className="flex flex-row items-center">
                  <h2 className="text-xl py-5 font-bold text-GuText w-auto h-auto" style={{ fontFamily: '宋体, SimSun, serif', backgroundImage: 'url("/红色国风小图标.png")', backgroundSize: '110%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <span className="z-10 px-2">我的图库</span>
                  </h2>
          {/* <img src="/古风小图标2.png" className='absolute right-[-3%] mt-[-10%] mb-[-15%] w-[40%] h-[20%]'/> */}
        </div>
                <div className="flex flex-row flex-wrap gap-2 mr-5">
                  {travelPlanImages && travelPlanImages.length > 0 && travelPlanImages.map((img, index) => (
                    <div key={img.id || index} className="relative border rounded-lg w-20 h-20 overflow-hidden">
                      <img src={img.url} className="w-full h-full object-cover"/>
                      <button
                        className="absolute top-1 left-1 w-4 h-4 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <div className="border border-solid rounded-lg w-20 h-20 cursor-pointer flex items-center justify-center" onClick={handleAddImageClick}>
                    <img src="/加号.png" className="w-8 h-8"/>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleTravelPlanImageChange}
                />
              </div>

                {/* 酒店推荐 */}
                <div className="mx-4 mt-10 space-y-3 mb-20 ">
                    {/* <h3 className="text-lg font-semibold text-gray-800 mb-3">酒店推荐</h3>
                    <div className="flex flex-col space-y-3">
                        {displayData.accommodations && displayData.accommodations.map((hotel, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex flex-row items-start">
                                    <div 
                                      className="w-24 h-24 bg-gray-200 rounded-lg mr-4 flex-shrink-0 bg-cover bg-center"
                                      style={{ backgroundImage: hotel.photo || hotel.photoUrl ? `url(${hotel.photo || hotel.photoUrl})` : 'none' }}
                                    ></div>

                                    <div className="flex-1">
                                        <h4 className="text-base font-semibold text-gray-800 mb-1">{hotel.name}</h4>
                                        <p className="text-sm text-blue-600 mb-1">{hotel.type}</p>
                                        <p className="text-sm text-gray-600 mb-2">{hotel.location}</p>
                                        <p className="text-xs text-gray-500 mb-2">{hotel.advantages}</p>
                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-orange-600">¥{hotel.price_per_night || hotel.pricePerNight}</span>

                                            <span className="text-sm text-gray-500 ml-1">/晚</span>
                                            </div>
                                        </div>
                                        <button
                                          className={(hotel.isSelected ? 'bg-gray-300 text-gray-700 ' : 'bg-macaron-blue-400 text-white ') + 'px-4 py-2 rounded-lg'}
                                          onClick={() => handleToggleHotelSelect(hotel)}
                                        >
                                          {hotel.isSelected ? '已选择' : '选择'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div> */}
                        </div>

            {showImageGallery && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-3xl p-4 max-w-md w-full max-h-[80vh] overflow-y-auto mx-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-GuText"style={{ fontFamily: '宋体, SimSun, serif' }}>我的图库</h3>
                    <button
                      onClick={() => setShowImageGallery(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  {travelPlanImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {travelPlanImages.map((img, index) => (
                        <div
                          key={img.id || index}
                          className="w-full h-24 bg-gray-100 rounded overflow-hidden"
                        >
                          <img
                            src={img.url}
                            alt={img.description || `图片${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">暂无图片</div>
                  )}
                </div>
              </div>
            )}

            {/* 分享给好友弹窗 */}
            {showShareModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-md max-h-[70vh] flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-800">选择分享方式</h3>
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {/* AI选项 */}
                    <div 
                      className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      onClick={handleShareToAI}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden mr-3">
                          <img 
                            src="/可爱图标.png" 
                            alt="AI助手" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            AI助手
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">让AI帮你优化旅行计划</div>
                        </div>
                      </div>
                      <div className="text-xs text-blue-500">
                        分享
                      </div>
                    </div>

                    {/* 好友列表 */}
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
                    ) : !friends || friends.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        暂无好友可以分享
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {friends.map((friend) => (
                          <li
                            key={friend.id}
                            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleShareToFriend(friend)}
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
                                  <div className="text-xs text-gray-400 mt-0.5">{friend.phone}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-blue-500">
                              分享
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* 游记 */}
            <div className="w-[80%] h-[60px] ml-[10%] border-2 border-GuText bg-[#d5a495] rounded-3xl">
              <button
                className="w-full h-full flex items-center justify-center font-bold text-GuText disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleWriteTravelogue}
                disabled={generatingPost}
                style={{ fontFamily: '宋体, SimSun, serif' }}
              >
                {generatingPost ? '正在为你生成游记...' : '我们来写一片游记吧~'}
              </button>
            </div>
            {/* 日历弹窗 */}
            {showCalendar && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold">选择出行日期</h3>
                              <button 
                                  onClick={() => setShowCalendar(false)}
                                  className="text-gray-500 hover:text-gray-700"
                              >
                                  ✕
                              </button>
                          </div>
                          
                          {/* 简化的日历组件 */}
                          <div className="calendar-container" 
                          onTouchStart={onTouchStart}
                          onTouchMove={onTouchMove}
                          onTouchEnd={onTouchEnd}
                          >
                            {/* 月份导航 */}
                           <div className="flex justify-between items-center mb-4">
                            <button onClick={goToPreviousMonth}
                            className="p-2 hover:bg-gray-100 rounded"
                            >
                              <i className="fa-solid fa-chevron-left"></i>
                            </button>
                             <div className="text-sm font-bold">
                                {formatMonth(currentYear, currentMonth)}
                            </div>
                            <button 
                                onClick={goToNextMonth}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                           </div>
                            {/* 星期标题 */}
    <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
            </div>
        ))}
    </div>
    <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays(currentYear, currentMonth).map((dayObj, i) => {
            const { date, isCurrentMonth } = dayObj;
            const todayFlag = isToday(date);
            const selectedFlag = isSelected(date);
            const inRangeFlag = isInRange(date);
            
            return (
                <button
                    key={i}
                    onClick={() => handleDateSelect(date)}
                    disabled={!isCurrentMonth}
                    className={`
                        p-2 text-sm rounded transition-colors
                        ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'}
                        ${todayFlag ? 'bg-yellow-100 text-yellow-700 font-bold ring-2 ring-yellow-400' : ''}
                        ${selectedFlag ? 'bg-blue-500 text-white font-bold' : ''}
                        ${inRangeFlag && !selectedFlag ? 'bg-blue-100 text-blue-600' : ''}
                        ${!todayFlag && !selectedFlag && !inRangeFlag && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                    `}
                >
                    {date.getDate()}
                </button>
            );
        })}
    </div>

                          </div>



                          {/* <div className="calendar-container">
                            <div className="text-sm font-bold">2025年11月</div>
                              <div className="grid grid-cols-7 gap-1 mb-2">
                                  {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                                      <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                                          {day}
                                      </div>
                                  ))}
                              </div>
                              
                              这里需要生成日历日期 - 简化版本 
                              <div className="grid grid-cols-7 gap-1">
                                  {Array.from({length: 35}, (_, i) => {
                                      const date = new Date(2025, 0, i - 5); // 从1月开始的示例
                                      const today = new Date();
                                      const isToday = date.toDateString() === today.toDateString();
                                      const isSelected = (selectedStarteDate && date.toDateString() === selectedStarteDate.toDateString()) ||
                                                      (selectedEndDate && date.toDateString() === selectedEndDate.toDateString());
                                      const isInRange = selectedStarteDate && selectedEndDate && 
                                                      date >= selectedStarteDate && date <= selectedEndDate;
                                      
                                      return (
                                          <button
                                              key={i}
                                              onClick={() => handleDateSelect(date)}
                                              className={`
                                                  p-2 text-sm rounded
                                                  ${isToday ? 'bg-red-100 text-red-600 font-bold' : ''}
                                                  ${isSelected ? 'bg-blue-500 text-white' : ''}
                                                  ${isInRange && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                                                  ${!isToday && !isSelected && !isInRange ? 'hover:bg-gray-100' : ''}
                                                  ${date.getMonth() !== 0 ? 'text-gray-300' : ''}
                                              `}
                                              disabled={date.getMonth() !== 0}
                                          >
                                              {date.getDate()}
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>
                           */}
                          {/* 选择提示 */}
                          <div className="mt-4 text-sm text-gray-600">
                              {!selectedStarteDate && "请选择开始日期"}
                              {selectedStarteDate && !selectedEndDate && "请选择结束日期"}
                              {selectedStarteDate && selectedEndDate && 
                                  `已选择 ${calculateDays(selectedStarteDate, selectedEndDate)} 天行程`
                              }
                          </div>
                          
                          {/* 按钮 */}
                          <div className="flex justify-end space-x-2 mt-6">
                              <button 
                                  onClick={() => setShowCalendar(false)}
                                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                              >
                                  取消
                              </button>
                              <button 
                                  onClick={() => setShowConfirmDialog(true)}
                                    disabled={!selectedStarteDate || !selectedEndDate}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                              >
                                  确认
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {/* 确认对话框 */}
              {showConfirmDialog && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                          <h3 className="text-lg font-semibold mb-4">确认修改时间吗？</h3>
                          <p className="text-gray-600 mb-6">
                              将行程修改为 {calculateDays(selectedStarteDate, selectedEndDate)} 天
                          </p>
                          <div className="flex justify-end space-x-2">
                              <button 
                                  onClick={() => setShowConfirmDialog(false)}
                                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                              >
                                  取消
                              </button>
                              <button 
                                  onClick={handleConfirmChange}
                                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                  确认
                              </button>
                          </div>
                      </div>
                  </div>
              )}

                      {/* 成功提示 */}
                      {showSuccessMessage && (
                          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                              修改成功！
                          </div>
                      )}


              {showActivityEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
                
                  <div className="bg-white rounded-t-2xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex-1">
                        {/* <div className="text-sm mb-1">地点名</div> */}
                        <input
                          type="text"
                          className="w-full font-bold px-3 py-2 text-lg bg-transparent border-none focus:outline-none focus:ring-0 text-center"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          placeholder="请输入地点名"
                        />
                      </div>
                      <button
                        onClick={closeActivityEditModal}
                        className=" text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="w-full flex flex-col items-stretch justify-center space-y-4">
                      <div className="flex flex-row space-x-3">
                        <div className="flex-1">
                         <div className="flex flex-row items-center">
                          <div className="text-sm py-2 flex-shrink-0">时间：</div>
                          <input
                            type="text"
                            readOnly
                            onClick={handleOpenTimePicker}
                            className="flex-1 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                            value={editTime}
                            placeholder="例如 09:00-12:00"
                          />
                         </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-row">
                          <div className="text-sm py-2 flex-shrink-0">费用:</div>
                          <input
                            type="number"
                            min="0"
                            className="w-full mr-10 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                            value={editCost}
                            onChange={(e) => setEditCost(e.target.value)}
                            placeholder="费用(元)"
                          />
                          </div>
                        </div>
                      </div>
                      {/* 时间选择器 */}
                      {showTimePicker && (
                        <div className="mt-3 bg-white text-black rounded-2xl p-4">
                          <div className="flex justify-between items-center mb-3 text-sm font-semibold">
                            <span>开始时间</span>
                            <span>结束时间</span>
                          </div>
                          <div className="flex justify-center space-x-4">
                            <div className="flex flex-col items-center flex-1">
                              {/* <div className="text-sm text-gray-400 mb-1">小时</div> */}
                              <div className="relative w-full h-24 overflow-y-auto bg-black/60 rounded-lg">
                              {/* 顶部渐变：让最上面的数字变淡 */}
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-8" />
                              {/* 底部渐变：让最下面的数字变淡 */}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" />
                              {/* 中间高亮横条：选中区域 */}
                              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-white/20 bg-white/5" />
                              <div className="relative">
                                {Array.from({ length: 24 }, (_, i) => {
                                  const value = String(i).padStart(2, '0');
                                  const active = value === startHour;
                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => setStartHour(value)}
                                      className={`w-full text-center py-1 text-lg ${
                                        active
                                          ? 'bg-white text-black font-bold'
                                          : 'text-gray-300 hover:bg-white/10'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                  );
                                })}
                                </div>
                              </div>
                            </div>

                           
                            <div className="flex flex-col items-center flex-1">
                              {/* <div className="text-xs text-gray-400 mb-1">分钟</div> */}

                              <div className="relative w-full h-24 overflow-y-auto bg-black/60 rounded-lg">
                              {/* 顶部渐变：让最上面的数字变淡 */}
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-8" />
                              {/* 底部渐变：让最下面的数字变淡 */}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" />
                              {/* 中间高亮横条：选中区域 */}
                              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-white/20 bg-white/5" />
                              <div className="relative">
                                {Array.from({ length: 60 }, (_, i) => {
                                  const value = String(i).padStart(2, '0');
                                  const active = value === startMinute;
                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => setStartMinute(value)}
                                      className={`w-full text-center py-1 text-lg ${
                                        active
                                          ? 'bg-white text-black font-bold'
                                          : 'text-gray-300 hover:bg-white/10'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                  );
                                })}
                                </div>
                              </div>
                            </div>
                             <div className="text-lg mt-[10%] font-bold">至</div>
                            <div className="flex flex-col items-center flex-1">
                              {/* <div className="text-xs text-gray-400 mb-1">小时</div> */}

                              <div className="relative w-full h-24 overflow-y-auto bg-black/60 rounded-lg">
                              {/* 顶部渐变：让最上面的数字变淡 */}
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-8" />
                              {/* 底部渐变：让最下面的数字变淡 */}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" />
                              {/* 中间高亮横条：选中区域 */}
                              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-white/20 bg-white/5" />
                              <div className="relative">
                                
                                {Array.from({ length: 24 }, (_, i) => {
                                  const value = String(i).padStart(2, '0');
                                  const active = value === endHour;
                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => setEndHour(value)}
                                      className={`w-full text-center py-1 text-lg ${
                                        active
                                          ? 'bg-white text-black font-bold'
                                          : 'text-gray-300 hover:bg-white/10'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                  );
                                })}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                              {/* <div className="text-xs text-gray-400 mb-1">分钟</div> */}

                              <div className="relative w-full h-24 overflow-y-auto bg-black/60 rounded-lg">
                              {/* 顶部渐变：让最上面的数字变淡 */}
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-8" />
                              {/* 底部渐变：让最下面的数字变淡 */}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" />
                              {/* 中间高亮横条：选中区域 */}
                              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-white/20 bg-white/5" />
                              <div className="relative">
                                {Array.from({ length: 60 }, (_, i) => {
                                  const value = String(i).padStart(2, '0');
                                  const active = value === endMinute;
                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => setEndMinute(value)}
                                      className={`w-full text-center py-1 text-lg ${
                                        active
                                          ? 'bg-white text-black font-bold'
                                          : 'text-gray-300 hover:bg-white/10'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                  );
                                })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 mt-3">
                            <button
                              type="button"
                              className="px-3 py-1 text-xs text-gray-300 border border-gray-500 rounded-full hover:bg-white/10"
                              onClick={handleCancelTimePicker}
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 text-xs bg-white text-black rounded-full hover:bg-gray-200"
                              onClick={handleConfirmTimePicker}
                            >
                              确定
                            </button>
                          </div>
                        </div>
                      )}
                      {editError && (
                        <div className="text-xs text-red-500 mt-1">{editError}</div>
                      )}
                      <div
                        className="flex flex-row w-full h-16 items-center mt-4 cursor-pointer rounded-lg"
                        onClick={() => editingActivity && onNavigateToPlanPostDetail(editingActivity)}
                      >
                        <div
                          className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0"
                          style={{
                            backgroundImage:
                              editingActivity && (editingActivity.photo || editingActivity.photoUrl)
                                ? `url(${editingActivity.photo || editingActivity.photoUrl})`
                                : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        ></div>
                        <div className="ml-3 flex-1 bg-gray-100 h-full flex items-center px-3 text-sm text-gray-700 rounded-lg">
                          {editingActivity && editingActivity.location
                            ? editingActivity.location
                            : '地点名'}
                        </div>
                      </div>

                      <div className="flex flex-row justify-between items-center pt-2">
                        <div
                          className="text-sm w-16 py-2 px-3 border-2 border-solid rounded-lg text-center cursor-pointer"
                          onClick={handleNavigateToMapFromActivity}
                        >
                          导航
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={closeActivityEditModal}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                            disabled={editSaving}
                          >
                            取消
                          </button>
                          <button
                            onClick={handleDeleteEditingActivity}
                            className="px-4 py-2 text-red-500 border border-red-300 rounded hover:bg-red-50 text-sm"
                          >
                            删除
                          </button>
                          <button
                            onClick={handleSaveActivity}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:bg-gray-300"
                            disabled={editSaving}
                          >
                            {editSaving ? '保存中...' : '保存'}
                          </button>
                        </div>
                      </div> 
                    </div>
                  </div>
                </div>
              )}
              {/* 用户添加活动 */}
              {showAddActivity && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
                  onClick={() => setshowAddActivity(false)}
                >
                  <div
                    className="bg-white rounded-t-2xl p-4 w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-semibold">添加地点/活动</h3>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setshowAddActivity(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="w-full h-auto flex flex-col border rounded-lg p-3">
                      <div className="w-full bg-white flex flex-row items-center space-x-3">
                        <div className="bg-macaron-blue-300 w-10 h-10 border rounded-lg flex items-center justify-center">
                          <img src="/搜索(1).png" className="w-6 h-6 mr-2"/>
                        </div>
                        <input
                          className="flex-1 outline-none text-sm"
                          placeholder="搜索景点"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
              )}
              </div>
              </div>
              </div>
        </>
    );
}
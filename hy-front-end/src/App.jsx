import React, { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import MapPage from './components/MapPage'
import AMapPage from './components/AMapPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import GoHomePage from './components/goHomePage'
import DiscoverPage from './components/DiscoverPage'
import RouteHistoryPage from './components/RouteHistoryPage'
import MyFavoritesPage from './components/MyFavoritesPage'
import MyPostsPage from './components/MyPostsPage'
import MyTravalsPage from './components/MyTravalsPage'
import PostEditorPage from './components/PostEditorPage'
import PostDetailPage from './components/PostDetailPage'
import AdminPostReviewPage from './components/AdminPostReviewPage'
import AdminActivityReviewPage from './components/AdminActivityReviewPage'
import AdminReportedUsersPage from './components/AdminReportedUsersPage'
import NotificationPage from './components/NotificationPage'
import FeedbackPage from './components/FeedbackPage'
import NewHomePage from './components/NewHomePage'
import PostPage from './components/PostPage'
import ActivityPage from './components/ActivityPage'
import MyFootprintsPage from './components/MyFootprintsPage'

import {
  getUserProfile,
  getUserInfo,
  setTokenKickOutHandler,
  startLoginStatusCheck,
  stopLoginStatusCheck,
  getConversationsList,
  getCurrentUserId,
  getUnreadNotificationCount,
} from './api/config'
import MinePage from './components/MinePage'
import CommunityPage from './components/CommunityPage'
import ChatPage from './components/ChatPage'
import GroupChatPage from './components/GroupChatPage'
import GroupChatConversationPage from './components/GroupChatConversationPage'
import GroupChatDetailPage from './components/GroupChatDetailPage'
import ChatSettingsPage from './components/ChatSettingsPage'
import FriendRequestsPage from './components/FriendRequestsPage'
import ProfileEditPage from './components/ProfileEditPage'
import UserCenterPage from './components/UserCenterPage'
import UserDynamicsPage from './components/UserDynamicsPage'

import webSocketService, { MESSAGE_TYPES } from './services/WebSocketService'

import ActivityParticipantsReviewPage from './components/ActivityParticipantsReviewPage'
import ActivityDetailPage from './components/ActivityDetailPage'


import AiPage from './components/AiPage'
import AiPage_N8N from './components/AiPage_N8N'
import CreatePlanAiPage from './components/CreatePlanAiPage'
import TokenKickOutHandler from './components/TokenKickOutHandler'
import DSreachPage from './components/DSreachPage'
import TripDetailPage from './components/TripDetailPage'
import DLookMap from './components/DLookMap'
import SelectCityPage from './components/SelectCityPage'
import PostCitySelectPage from './components/PostCitySelectPage'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import FullscreenToggle from './components/FullscreenToggle'
import MyTravalPlanPage from './components/MyTravalPlanPage'
import PlanPostDetailPage from './components/PlanPostDetailPage'

import PrivacySettingsPage from './components/PrivacySettingsPage'
import RealNameVerificationPage from './components/RealNameVerificationPage'

import AddActivityPage from './components/AddActivityPage'
import SplashScreen from './components/SplashScreen'


function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [routeData, setRouteData] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true) // 
  const [showSplash, setShowSplash] = useState(false) // 
  const [backgroundRefreshTrigger, setBackgroundRefreshTrigger] = useState(0) // 

  const [showKickOutDialog, setShowKickOutDialog] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [travelPlanFromPage, setTravelPlanFromPage] = useState('my-travels')

  const [selectedPlanActivity, setSelectedPlanActivity] = useState(null)
  const [addedPlanPois, setAddedPlanPois] = useState([])


  const [selectedDailyItinerary, setSelectedDailyItinerary] = useState(null)

  const [selectedActivityId, setSelectedActivityId] = useState(null)
  const [activityDetailFromPage, setActivityDetailFromPage] = useState('community')

  const [editorFrom, setEditorFrom] = useState('my-posts')
  const [generatedPost, setGeneratedPost] = useState(null)
  const [aiInitialMessage, setAiInitialMessage] = useState(null)

  // 🔥 发现页面的旅游路线状态（状态提升）
  const [tripPlansData, setTripPlansData] = useState([])
  const [selectedCityName, setSelectedCityName] = useState('')

  // 🌟 新增：宝藏景点状态管理（避免重复请求）
  const [treasureSpotsData, setTreasureSpotsData] = useState([])
  const [treasureUserLocation, setTreasureUserLocation] = useState(null)
  
  // 🌟 新增：社区页面标签状态管理
  const [communityActiveTab, setCommunityActiveTab] = useState('posts')
  
  // 🌟 新增：聊天系统状态管理
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0)

  // 🌟 新增：群聊相关状态
  const [selectedGroup, setSelectedGroup] = useState(null)

  // 🌟 新增：用户中心相关状态
  const [selectedUser, setSelectedUser] = useState(null)

  // 全局居中提示框（替代 alert）
  const [globalAlertVisible, setGlobalAlertVisible] = useState(false)
  const [globalAlertMessage, setGlobalAlertMessage] = useState('')

  // 管理员审核系统当前模块（帖子 / 活动 / 用户举报）
  const [adminReviewTab, setAdminReviewTab] = useState('post')


  // 设置顶号处理回调
  useEffect(() => {
    const handleTokenKickOut = (error, url) => {
      console.log('🚫 收到顶号通知:', error.message)
      
      // 停止定期检查
      stopLoginStatusCheck()
      
      // 清除认证状态
      setIsAuthenticated(false)
      
      // 显示友好的顶号提示
      setShowKickOutDialog(true)
    }
    
    // 设置全局顶号处理回调
    setTokenKickOutHandler(handleTokenKickOut)
    
    return () => {
      // 清理
      setTokenKickOutHandler(null)
      stopLoginStatusCheck()
    }
  }, [])

  // 全局覆盖 window.alert，使用居中提示框
  useEffect(() => {
    const originalAlert = window.alert

    window.alert = (message) => {
      const text = typeof message === 'string' ? message : String(message)
      setGlobalAlertMessage(text)
      setGlobalAlertVisible(true)
    }

    return () => {
      window.alert = originalAlert
    }
  }, [])


  const [searchQuery,setSearchQuery]=useState('');
  const [userLocation,setUserLocation]=useState(null);


  // 检查用户登录状态和身份
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('auth_token')
      const phone = localStorage.getItem('user_phone')
      const userType = localStorage.getItem('user_type')
      
      if (token && phone && userType) {
        try {
          console.log('🔍 App启动，验证现有token...')
          
          await getUserProfile()
          
          console.log('✅ Token验证通过，检查用户身份...')
          
          try {
            const userInfoResponse = await getUserInfo()
            if (userInfoResponse.code === 200) {
              const isAdminUser = userInfoResponse.data.isAdmin
              setIsAdmin(isAdminUser)
              
              if (isAdminUser) {
                console.log('👑 管理员登录成功，进入审核系统')
                setIsAuthenticated(true)
                setCurrentPage('admin-review')
              } else {
                console.log('👤 普通用户登录成功，进入主系统')
                setIsAuthenticated(true)
                setShowSplash(true) // 🌟 显示启动封面
                setCurrentPage('home')
              }
            } else {
              setIsAdmin(false)
              setIsAuthenticated(true)
              setShowSplash(true) // 🌟 显示启动封面
              setCurrentPage('home')
            }
          } catch (userInfoError) {
            console.log('⚠️ 获取用户身份信息失败，按普通用户处理')
            setIsAdmin(false)
            setIsAuthenticated(true)
            setShowSplash(true) // 🌟 显示启动封面
            setCurrentPage('home')
          }
          
          startLoginStatusCheck(60000)
        } catch (error) {
          console.log('❌ Token验证失败:', error.message)
          console.log('📱 跳转到登录页')
          setIsAuthenticated(false)
          setIsAdmin(false)
          setCurrentPage('login')
        }
      } else {
        console.log('📱 没有登录信息，显示登录页')
        setIsAuthenticated(false)
        setIsAdmin(false)
        setCurrentPage('login')
      }
      
      // 🌟 初始化完成
      setIsInitializing(false)
    }
    
    checkAuthStatus()
  }, [])

  // 🌟 全局聊天未读数 & WebSocket 初始化
  useEffect(() => {
    if (!isAuthenticated) {
      setChatUnreadCount(0)
      webSocketService.disconnect()
      return
    }

    let isCancelled = false
    let unreadTimer = null
    let unsubscribeNewMessage = null

    const loadUnreadFromConversations = async () => {
      try {
        const response = await getConversationsList()
        if (!response || response.code !== 200) return

        const list = Array.isArray(response.data)
          ? response.data
          : (response.data && Array.isArray(response.data.list) ? response.data.list : [])

        const totalUnread = list.reduce((sum, conv) => {
          const count = conv.unreadCount || 0
          return sum + (conv.isMuted ? 0 : count)
        }, 0)

        if (!isCancelled) {
          setChatUnreadCount(totalUnread)
        }
      } catch (err) {
        console.error('获取会话未读数失败:', err)
      }
    }

    const initWebSocketAndUnread = async () => {
      try {
        const userId = await getCurrentUserId()
        await webSocketService.connect(userId)

        // 首次加载未读数
        await loadUnreadFromConversations()

        // 监听新消息，实时刷新未读
        unsubscribeNewMessage = webSocketService.onMessage(
          MESSAGE_TYPES.NEW_MESSAGE,
          () => {
            loadUnreadFromConversations()
          }
        )

        // 兜底：定时刷新一次，防止遗漏
        unreadTimer = setInterval(loadUnreadFromConversations, 30000)
      } catch (err) {
        console.error('初始化聊天未读统计失败:', err)
      }
    }

    initWebSocketAndUnread()

    return () => {
      isCancelled = true
      if (unreadTimer) {
        clearInterval(unreadTimer)
      }
      if (unsubscribeNewMessage) {
        unsubscribeNewMessage()
      }
    }
  }, [isAuthenticated])
  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      setNotificationUnreadCount(0)
      return
    }

    let cancelled = false
    let timer = null

    const loadNotificationUnread = async () => {
      try {
        const response = await getUnreadNotificationCount()
        if (!response || response.code !== 200) return

        let count = 0
        if (response.data) {
          if (typeof response.data.unreadCount === 'number') {
            count = response.data.unreadCount
          } else if (typeof response.data === 'number') {
            count = response.data
          }
        }

        if (!cancelled) {
          setNotificationUnreadCount(count || 0)
        }
      } catch (err) {
        console.error('获取通知未读数失败:', err)
      }
    }

    loadNotificationUnread()
    timer = setInterval(loadNotificationUnread, 30000)

    return () => {
      cancelled = true
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [isAuthenticated, isAdmin])
  
  // 清除认证数据的辅助函数
  const clearAuthData = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_phone')
    localStorage.removeItem('user_type')
    localStorage.removeItem('login_mode')
    localStorage.removeItem('login_time')
    localStorage.removeItem('login_type')
    
    stopLoginStatusCheck()
    
    setIsAuthenticated(false)
    setCurrentPage('login')
  }

  // 处理顶号对话框确认
  const handleKickOutConfirm = () => {
    setShowKickOutDialog(false)
    setCurrentPage('login')
  }

  const handlePlanRoute = (startLocation, endLocation, mode, routeType, coordinates) => {
    // 检查第一个参数是否是对象（来自新的goHomePage）
    if (typeof startLocation === 'object' && startLocation !== null && startLocation.from) {
      // 新格式：传递的是一个包含所有数据的对象
      const routeDataObject = startLocation;
      setRouteData(routeDataObject)
      console.log('App.jsx - 设置路线数据 (新格式):', routeDataObject)
    } else {
      // 旧格式：传递的是独立的参数
      setRouteData({ 
        start: startLocation, 
        end: endLocation,
        mode: mode,
        routeType: routeType,
        coordinates: coordinates
      })
      console.log('App.jsx - 设置路线数据 (旧格式):', { 
        start: startLocation, 
        end: endLocation,
        mode, 
        routeType,
        coordinates 
      })
    }
    setCurrentPage('map')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
    setRouteData(null)
  }

  const handleLoginSuccess = async () => {
    const currentTime = new Date().getTime()
    localStorage.setItem('login_time', currentTime.toString())
    
    setIsAuthenticated(true)
    
    try {
      const userInfoResponse = await getUserInfo()
      if (userInfoResponse.code === 200) {
        const isAdminUser = userInfoResponse.data.isAdmin
        setIsAdmin(isAdminUser)
        
        if (isAdminUser) {
          console.log('👑 管理员登录成功，进入审核系统')
          setCurrentPage('admin-review')
        } else {
          console.log('👤 普通用户登录成功，进入主系统')
          setCurrentPage('home')
        }
      } else {
        setIsAdmin(false)
        setCurrentPage('home')
      }
    } catch (error) {
      console.log('⚠️ 获取用户身份信息失败，按普通用户处理')
      setIsAdmin(false)
      setCurrentPage('home')
    }
    
    startLoginStatusCheck(60000)
  }

  const handleNavigateToRegister = () => {
    setCurrentPage('register')
  }

  const handleNavigateToLogin = () => {
    setCurrentPage('login')
  }
  
  const handleNavigateMine = () => {
    setCurrentPage('mine')
  }

  const handleNavigateToDSreach = (query) => {
    setSearchQuery(query)
    setCurrentPage('dsreach')
  }

  const handleBackToMine = () => {
    setCurrentPage('mine')
  }

  const handleNavigateToProfileEdit = () => {
    setCurrentPage('profile-edit')
  }

  const handleNavigateToMap = () => {
    setCurrentPage('map')
  }
  
  const handleLogout = () => {
    clearAuthData()
  }
  
  const handleNavigateToAi = () => {
    setCurrentPage('ai')
  }
  
  // 🌟 修改：接收景点数据并保存
  const handleNavigateToDLookMap = (data) => {
    console.log('📍 接收到景点数据:', data)
    if (data && data.treasureSpots && data.userLocation) {
      setTreasureSpotsData(data.treasureSpots)
      setTreasureUserLocation(data.userLocation)
    }
    setCurrentPage('dlookmap')
  }

  // 发现页面的搜索
  const handleNavigateToDiscover = () => {
    setSearchQuery('')
    setCurrentPage('discover')
  }
  
  // 用户位置经纬度
  const handleLocationUpdate = (location) => {
    setUserLocation(location)
    console.log('用户的位置已经更新', location)
  }

  const handleNavigateToHistory = () => {
    setCurrentPage('history')
  }

  const handleNavigateToFavorites = () => {
    setCurrentPage('favorites')
  }

  const handleNavigateToMyPosts = () => {
    setCurrentPage('my-posts')
  }

  const handleNavigateToMyTravals = () => {
    setCurrentPage('my-travels')
  }

  const handleNavigateToMyFootprints = () => {
    setCurrentPage('my-footprints')
  }

  const handleNavigateToActivityReview = () => {
    setCurrentPage('activity-participants-review')
  }

  const handleNavigateToEditor = (post = null, from = 'my-posts', generated = null) => {
    setEditingPost(post)
    setEditorFrom(from)
    setGeneratedPost(generated || null)
    setCurrentPage('post-editor')
  }

  const handleNavigateToPostDetail = (post, fromPage = 'discover') => {
    setSelectedPost({ ...post, fromPage })
    setCurrentPage('post-detail')
  }

  const handleNavigateToCommunity = () => {
    setCurrentPage('community')
  }

  const handleNavigateToTripDetail = (trip) => {
    setSelectedTrip(trip)
    setCurrentPage('trip-detail')
  }

  const handleNavigateToPostPage = () => {
    setCurrentPage('post-page')
  }

  const handleNavigateToPostCitySelect = () => {
    setCurrentPage('post-city-select')
  }

  const handleNavigateToActivityPage = () => {
    setCurrentPage('activity-page')
  }
  
  // 发现页面的选择城市页面
  const handleNavigateToSelectCity = () => {
    setCurrentPage('selectCity')
  }

  // 🔥 处理城市选择 - 接收选中的城市名
  const handleCitySelected = (cityName) => {
    console.log('✅ 用户选择城市:', cityName);
    
    // 🔥 关键：清空旅游路线数据，触发DiscoverPage重新加载
    setTripPlansData([]);
    
    // 更新选中的城市名称状态
    setSelectedCityName(cityName);
    
    console.log('🔄 已清空路线数据，等待DiscoverPage自动刷新');
    // 注意：具体的 Dify API 调用在 DiscoverPage 中处理
  }

  const handlePostCitySelected = (cityName) => {
    console.log('✅ 发帖选择城市:', cityName)
  }

  // 🌟 新增：宝藏景点数据更新回调
  const handleTreasureDataUpdate = (spots, location) => {
    console.log('🔄 更新宝藏景点数据:', spots.length, '个景点')
    setTreasureSpotsData(spots)
    setTreasureUserLocation(location)
  }
  const handleNavigateToAi_N8N = (type, message) => {
    if (type === 'create') {
      setAiInitialMessage(null);
      setCurrentPage('create-plan-ai')
    } else if (type === 'chat') {
      setAiInitialMessage(message);
      setCurrentPage('ai_n8n')
    } else {
      // 默认跳转到聊天页面
      setAiInitialMessage(message);
      setCurrentPage('ai_n8n')
    }
  }

  const handleNavigateToNotifications = () => {
    setCurrentPage('notifications')
  }

  const handleNavigateToFeedback = () => {
    setCurrentPage('feedback')
  }
  const handleNavigateToPrivacySettings = () => {
    setCurrentPage('privacy-settings')
  }
  const handleNavigateToRealName = () => {
    setCurrentPage('real-name')
  }

    const handleNavigateToMytTravalPlan = (trip, fromPage = 'my-travels') => {
    // 进入我的行程详情时，保存当前选中的行程以及来源页面
    if (trip) {
      setSelectedTrip(trip)
    }
    setTravelPlanFromPage(fromPage || 'my-travels')
    setCurrentPage('my-traval-plan')
  }
  const handleNavigateToPlanPostDetailPage = (activity) => {
    setSelectedPlanActivity(activity)
    setCurrentPage('my-traval-plan-post')
  }
  const handleNavigateToAddActivity = (dailyItinerary) => {
    setSelectedDailyItinerary(dailyItinerary || null)
    setCurrentPage('add-activity')
  }
  const handleAddActivitySelected = (poi) => {
    if (poi) {
      console.log('✅ 用户选择了行程景点 POI:', poi)
      setAddedPlanPois((prev) => [...prev, poi])
    }
    setCurrentPage('my-traval-plan')
  }


  const handleNavigateToChat = (friend, conversationOrOptions = null) => {
    setSelectedFriend(friend)
    if (conversationOrOptions && typeof conversationOrOptions === 'object') {
      setCurrentConversationId(conversationOrOptions.conversationId || null)
    } else {
      setCurrentConversationId(conversationOrOptions)
    }
    setCurrentPage('chat')
  }

  const handleNavigateToGroupChat = () => {
    setCurrentPage('group-chat')
  }

  const handleNavigateToGroupChatConversation = (group) => {
    setSelectedGroup(group)
    setCurrentPage('group-chat-conversation')
  }

  const handleNavigateToChatSettings = () => {
    setCurrentPage('chat-settings')
  }

  const handleNavigateToFriendRequests = () => {
    setCurrentPage('friend-requests')
  }


  const handleNavigateToUserCenter = (user) => {
    setSelectedUser(user)
    setCurrentPage('user-center')
  }

  const handleNavigateToUserDynamics = (user) => {
    setSelectedUser(user)
    setCurrentPage('user-dynamics')
  }

  const handleNavigateToActivityDetail = (activityId, fromPage = 'community') => {
    setSelectedActivityId(activityId)
    setActivityDetailFromPage(fromPage)
    setCurrentPage('activity-detail')
  }

  const handleNavigateToTravelPlanFromChat = (travelPlanId) => {
    if (!travelPlanId) return
    setSelectedTrip({ id: travelPlanId })
    setTravelPlanFromPage('chat')
    setCurrentPage('my-traval-plan')
  }

  const handleBackFromTravelPlan = () => {
    const from = travelPlanFromPage || 'my-travels'
    if (from === 'chat') {
      setCurrentPage('chat')
    } else if (from === 'ai_n8n') {
      setCurrentPage('ai_n8n')
    } else if (from === 'home') {
      setCurrentPage('home')
    } else if (from === 'my-travels') {
      setCurrentPage('my-travels')
    } else {
      // 兜底：回到我的行程
      setCurrentPage('my-travels')
    }
  }

  //2025.11.26合并冲突改动这里

  // const handleNavigateToActivityDetail = (activityId, fromPage = 'community') => {
  //   setSelectedActivityId(activityId)
  //   setActivityDetailFromPage(fromPage)
  //   setCurrentPage('activity-detail')
  // }


  return (
    <div className="min-h-screen bg-gray-50">
      {globalAlertVisible && (
        <div className="login-dialog-overlay">
          <div className="login-dialog">
            <div className="login-dialog-message">
              {globalAlertMessage}
            </div>
            <button
              type="button"
              className="login-dialog-button"
              onClick={() => setGlobalAlertVisible(false)}
            >
              确定
            </button>
          </div>
        </div>
      )}
      {/* 启动封面 */}

      {showSplash && !isInitializing && (
        <SplashScreen onEnter={() => {
          setShowSplash(false)
          setCurrentPage('home')
        }} />
      )}

      {/* 初始化加载中 */}
      {isInitializing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>加载中...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* 顶号提示对话框 */}
      {showKickOutDialog && (
        <TokenKickOutHandler onConfirm={handleKickOutConfirm} />
      )}

      {/* 登录页 - 只在初始化完成且需要登录时显示 */}
      {!isInitializing && currentPage === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={handleNavigateToRegister}
        />
      )}

      {/* 活动报名审核页面（活动发起者） */}
      {currentPage === 'activity-participants-review' && isAuthenticated && (
        <ActivityParticipantsReviewPage
          onBack={handleBackToMine}
        />
      )}

      {/* 注册页 */}
      {currentPage === 'register' && (
        <RegisterPage 
          onRegisterSuccess={handleLoginSuccess}
          onNavigateToLogin={handleNavigateToLogin}
        />
      )}

      {/* 首页 */}
      {currentPage === 'home' && isAuthenticated && (
        <div>
          <NewHomePage 
            onPlanRoute={handlePlanRoute}
            onNavigateToMap={handleNavigateToMap}
            onLogout={handleLogout}
            onNavigateToMine={handleNavigateMine}
            onNavigateToDiscover={handleNavigateToDiscover}
            onNavigateToAi={handleNavigateToAi_N8N}
            onLocationUpdate={handleLocationUpdate}
            onNavigateToCommunity={handleNavigateToCommunity}
            onNavigateToPostDetail={handleNavigateToPostDetail}
            onNavigateToTravelPlan={(trip) => handleNavigateToMytTravalPlan(trip, 'home')}
            onNavigateToPostPage={handleNavigateToPostPage}
            chatUnreadCount={chatUnreadCount}
          />
        </div>
      )}
      
      {/* AI页面 */}
      {currentPage === 'ai' && isAuthenticated && (
        <div>
          <AiPage
            onBackToHome={handleBackToHome} 
          />
        </div>
      )}
      {
        currentPage === 'ai_n8n' && isAuthenticated && (
          <AiPage_N8N
            onBackToHome={handleBackToHome}
            onNavigateToMytTravalPlan={(trip) => handleNavigateToMytTravalPlan(trip, 'ai_n8n')}
            initialMessage={aiInitialMessage}
          />
        )
      }
      
      {/* AI生成旅行规划页面 */}
      {
        currentPage === 'create-plan-ai' && isAuthenticated && (
          <CreatePlanAiPage
            onBackToHome={handleBackToHome}
            onNavigateToAi={handleNavigateToAi_N8N}
          />
        )
      }

      {/* Leaflet地图页 */}
      {currentPage === 'map' && isAuthenticated && (
        <MapPage 
          routeData={routeData} 
          onBackToHome={handleBackToHome}
          onNavigateToMine={handleNavigateMine}
          onNavigateToDiscover={handleNavigateToDiscover}
          onNavigateToCommunity={handleNavigateToCommunity}
        />
      )}
      
      {currentPage === 'dsreach' && isAuthenticated && (
        <DSreachPage
          onNavigateToDiscover={handleNavigateToDiscover}
          searchQuery={searchQuery}
          userLocation={userLocation}
        />
      )}

      {/* 发现页 - 🌟 传入宝藏景点数据 */}
      {currentPage === 'discover' && isAuthenticated && (
        <DiscoverPage 
          onBack={handleBackToHome}
          onNavigateToMine={handleNavigateMine}
          onNavigateToDSreach={handleNavigateToDSreach}
          onNavigateToPostDetail={handleNavigateToPostDetail}
          onNavigateToTripDetail={handleNavigateToTripDetail}
          tripPlans={tripPlansData}
          currentCity={selectedCityName}
          onTripPlansUpdate={setTripPlansData}
          onCityUpdate={setSelectedCityName}
          onNavigateToDLookMap={handleNavigateToDLookMap}
          onNavigateToSelectCity={handleNavigateToSelectCity}
          treasureSpots={treasureSpotsData}
          treasureUserLocation={treasureUserLocation}
          onTreasureDataUpdate={handleTreasureDataUpdate}
          onNavigateToCommunity={handleNavigateToCommunity}
          onNavigateToActivityPage={handleNavigateToActivityPage}
          chatUnreadCount={chatUnreadCount}
          onNavigateToAi={handleNavigateToAi_N8N}
        />
      )}

      {/* 发现页面的地图查看页面 - 🌟 传入景点数据 */}
      {currentPage === 'dlookmap' && isAuthenticated && (
        <DLookMap
          onNavigateToDiscover={handleNavigateToDiscover}
          userLocation={treasureUserLocation}
          treasureSpots={treasureSpotsData}
          onPlanRoute={handlePlanRoute}
        />
      )}

      
      {/* 选择城市页面 */}
      {currentPage === 'selectCity' && isAuthenticated && (
        <SelectCityPage
          onNavigateToDiscover={handleNavigateToDiscover}
          onCitySelected={handleCitySelected}
        />
      )}
      
      {/* 旅游路线详情页 */}
      {currentPage === 'trip-detail' && isAuthenticated && (
        <TripDetailPage
          tripData={selectedTrip}
          onBack={handleNavigateToDiscover}
        />
      )}
      
      {/* 历史记录页面 */}
      {currentPage === 'history' && isAuthenticated && (
        <RouteHistoryPage
          onBack={handleBackToMine}
          onSelectRoute={(routeInfo) => {
            const coordinates = {
              start: { lat: routeInfo.startLat, lng: routeInfo.startLng },
              end: { lat: routeInfo.endLat, lng: routeInfo.endLng }
            }
            handlePlanRoute(routeInfo.start, routeInfo.end, '自驾', 'fastest', coordinates)
          }}
        />
      )}

      {currentPage === 'my-footprints' && isAuthenticated && (
        <MyFootprintsPage
          onBack={handleBackToMine}
        />
      )}

      {/* 我的页面 */}
      {currentPage === 'mine' && isAuthenticated && (
        <MinePage
          onNavigateToAi={handleNavigateToAi_N8N}
          onBackToHome={handleBackToHome}
          onNavigateToMap={handleNavigateToMap}
          onNavigateToDiscover={handleNavigateToDiscover}
          onLogout={handleLogout}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToFavorites={handleNavigateToFavorites}
          onNavigateToMyPosts={handleNavigateToMyPosts}
          onNavigateToNotifications={handleNavigateToNotifications}
          onNavigateToFeedback={handleNavigateToFeedback}
          onNavigateToCommunity={handleNavigateToCommunity}
          onNavigateToMyTravals={handleNavigateToMyTravals}
          onNavigateToMyFootprints={handleNavigateToMyFootprints}
          onNavigateToProfileEdit={handleNavigateToProfileEdit}
          onNavigateToActivityReview={handleNavigateToActivityReview}
          onNavigateToPrivacySettings={handleNavigateToPrivacySettings}
          onNavigateToRealName={handleNavigateToRealName}
          chatUnreadCount={chatUnreadCount}
          notificationUnreadCount={notificationUnreadCount}

        />

      )}

      {/* 我的行程页面 */}
      {currentPage === 'my-travels' && isAuthenticated && (
        <MyTravalsPage
          onNavigateToAi={handleNavigateToAi_N8N}
          onBack={handleBackToMine}
          onNavigateToMytTravalPlan={(trip) => handleNavigateToMytTravalPlan(trip, 'my-travels')}
          onNavigateToChat={handleNavigateToChat}
        />
      )}
      {/* 我的行程计划页面 */}
      {currentPage === 'my-traval-plan' && isAuthenticated && (
        <MyTravalPlanPage
          onBack={handleBackFromTravelPlan}
          onNavigateToPlanPostDetail={handleNavigateToPlanPostDetailPage}
          onNavigateToAddActivity={handleNavigateToAddActivity}
          extraAttractions={addedPlanPois}
          trip={selectedTrip}
          onPlanRoute={handlePlanRoute}
          userLocation={userLocation}
          onNavigateToAi={handleNavigateToAi_N8N}
          onNavigateToChat={handleNavigateToChat}
          onNavigateToEditor={(prefill) => handleNavigateToEditor(null, 'my-traval-plan', prefill)}
        />
      )}
      {currentPage === 'add-activity' && isAuthenticated && (
        <AddActivityPage
          onBack={() => setCurrentPage('my-traval-plan')}
          onSelectPlace={handleAddActivitySelected}
          selectedDailyItinerary={selectedDailyItinerary}
        />
      )}
      {currentPage==='my-traval-plan-post' && isAuthenticated && (
        <PlanPostDetailPage
          onNavigateToMytTravalPlan={(trip) => handleNavigateToMytTravalPlan(trip, travelPlanFromPage)}
          activity={selectedPlanActivity}
          planId={selectedTrip?.id}
          onNavigateToAi={handleNavigateToAi_N8N}
        />
      )}

      {/* 通知中心页面 */}
      {currentPage === 'notifications' && isAuthenticated && (
        <NotificationPage
          onBack={handleBackToMine}
          onNavigateToPostDetail={handleNavigateToPostDetail}
          onNavigateToActivityDetail={(activityId) => handleNavigateToActivityDetail(activityId, 'notifications')}
          onNavigateToCommunity={handleNavigateToCommunity}
          onUnreadChange={setNotificationUnreadCount}
        />
      )}

      {/* 用户反馈页面 */}
      {currentPage === 'feedback' && isAuthenticated && (
        <FeedbackPage
          onBack={handleBackToMine}
        />
      )}

      {/* 隐私设置页面 */}
      {currentPage === 'privacy-settings' && isAuthenticated && (
        <PrivacySettingsPage
          onBack={handleBackToMine}
        />
      )}

      {/* 实名认证页面 */}
      {currentPage === 'real-name' && isAuthenticated && (
        <RealNameVerificationPage
          onBack={handleBackToMine}
        />
      )}

      {/* 收藏页面 */}

      {currentPage === 'favorites' && isAuthenticated && (
        <MyFavoritesPage
          onBack={handleBackToMine}
          onNavigateToPostDetail={(post) => handleNavigateToPostDetail(post, 'favorites')}
        />
      )}

      {/* 我发布的页面 */}
      {currentPage === 'my-posts' && isAuthenticated && (
        <MyPostsPage
          onBack={handleBackToMine}
          onNavigateToEditor={handleNavigateToEditor}
          onNavigateToPostDetail={(post) => handleNavigateToPostDetail(post, 'my-posts')}
        />
      )}

      {/* 帖子编辑器页面 */}
      {currentPage === 'post-editor' && isAuthenticated && (
        <PostEditorPage
          onBack={() => {
            setEditingPost(null)
            setGeneratedPost(null)
            if (editorFrom === 'community-topics') {
              setCommunityActiveTab('topics')
              setCurrentPage('community')
            } else if (editorFrom === 'post-page') {
              setCurrentPage('post-page')
            } else if (editorFrom === 'my-traval-plan') {
              setCurrentPage('my-traval-plan')
            } else {
              setCurrentPage('my-posts')
            }
          }}
          editingPost={editingPost}
          generatedPost={generatedPost}
        />
      )}

      {/* 帖子详情页面 */}
      {currentPage === 'post-detail' && isAuthenticated && (
        <PostDetailPage
          postId={selectedPost?.id}
          onBack={() => {
            const fromPage = selectedPost?.fromPage || 'discover'
            setSelectedPost(null)
            if (fromPage === 'community-topics') {
              setCommunityActiveTab('topics')
              setCurrentPage('community')
            } else {
              setCurrentPage(fromPage)
            }
          }}
          onNavigateToUserCenter={handleNavigateToUserCenter}
        />
      )}

      {/* 管理员审核系统页面（帖子审核 / 活动审核） */}
      {currentPage === 'admin-review' && isAuthenticated && isAdmin && (
        <div className="min-h-screen bg-gray-50">
          {/* 顶部模块切换标签 */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-2 flex space-x-4">
              <button
                onClick={() => setAdminReviewTab('post')}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  adminReviewTab === 'post'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                帖子审核
              </button>
              <button
                onClick={() => setAdminReviewTab('activity')}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  adminReviewTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                活动审核
              </button>
              <button
                onClick={() => setAdminReviewTab('userReports')}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  adminReviewTab === 'userReports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                用户举报
              </button>
            </div>
          </div>

          {/* 根据当前标签渲染不同审核页面 */}
          {adminReviewTab === 'post' && (
            <AdminPostReviewPage onBackToHome={handleBackToHome} />
          )}
          {adminReviewTab === 'activity' && (
            <AdminActivityReviewPage onBackToHome={handleBackToHome} />
          )}
          {adminReviewTab === 'userReports' && (
            <AdminReportedUsersPage />
          )}
        </div>
      )}

      {/* 社区页面 */}
      {currentPage === 'community' && isAuthenticated && (
        <CommunityPage
          onBack={handleBackToHome}
          onNavigateToDiscover={handleNavigateToDiscover}
          onNavigateToMine={handleNavigateMine}
          onNavigateToPostDetail={handleNavigateToPostDetail}

          onNavigateToChat={handleNavigateToChat}
          onNavigateToGroupChat={handleNavigateToGroupChat}
          onNavigateToFriendRequests={handleNavigateToFriendRequests}
          onNavigateToUserCenter={handleNavigateToUserCenter}

          onNavigateToEditor={(post) => handleNavigateToEditor(post, 'community-topics')}

          activeTab={communityActiveTab}
          onTabChange={setCommunityActiveTab}
          onNavigateToAi={handleNavigateToAi_N8N}
        />
      )}

      {/* 帖子页面 */}
      {currentPage === 'post-page' && isAuthenticated && (
        <PostPage
          onBack={handleBackToHome}
          onNavigateToEditor={(post) => handleNavigateToEditor(post, 'post-page')}
          onNavigateToPostDetail={handleNavigateToPostDetail}
          onNavigateToUserCenter={handleNavigateToUserCenter}
          onNavigateToPostCitySelect={handleNavigateToPostCitySelect}
        />
      )}

      {currentPage === 'post-city-select' && isAuthenticated && (
        <PostCitySelectPage
          onBack={handleNavigateToPostPage}
          onCitySelected={handlePostCitySelected}
          onNavigateToEditor={(prefill) => handleNavigateToEditor(null, 'post-page', prefill)}
          onSkip={() => handleNavigateToEditor(null, 'post-page')}
        />
      )}

      {/* 活动页面 */}
      {currentPage === 'activity-page' && isAuthenticated && (
        <ActivityPage
          onBack={handleNavigateToDiscover}
          onNavigateToUserCenter={handleNavigateToUserCenter}
          onNavigateToRealName={handleNavigateToRealName}
        />
      )}



      {/* 聊天页面 */}
      {currentPage === 'chat' && isAuthenticated && (
        <ChatPage
          friend={selectedFriend}
          conversationId={currentConversationId}
          onBack={() => {
            setCurrentPage('community')
            // 回到会话列表
          }}
          onNavigateToSettings={handleNavigateToChatSettings}
          onNavigateToUserCenter={handleNavigateToUserCenter}
          onNavigateToPostDetail={(postId) => handleNavigateToPostDetail({ id: postId }, 'chat')}
          //onNavigateToUserCenter={handleNavigateToUserCenter}
          onNavigateToActivityDetail={(activityId) => handleNavigateToActivityDetail(activityId, 'chat')}
          onNavigateToTravelPlan={handleNavigateToTravelPlanFromChat}

        />
      )}

      {/* 群聊列表页面 */}
      {currentPage === 'group-chat' && isAuthenticated && (
        <GroupChatPage
          onBack={() => setCurrentPage('community')}
          onNavigateToGroupChat={handleNavigateToGroupChatConversation}
        />
      )}

      {/* 群聊对话页面 */}
      {currentPage === 'group-chat-conversation' && isAuthenticated && (
        <GroupChatConversationPage
          key={`${selectedGroup?.groupId}-${backgroundRefreshTrigger}`}
          group={selectedGroup}
          onBack={() => {
            setSelectedGroup(null)
            setCurrentPage('group-chat')
          }}
          onNavigateToDetail={(group) => {
            setSelectedGroup(group)
            setCurrentPage('group-chat-detail')
          }}
        />
      )}

      {/* 群聊详情页面 */}
      {currentPage === 'group-chat-detail' && isAuthenticated && (
        <GroupChatDetailPage
          group={selectedGroup}
          onBack={() => {
            setCurrentPage('group-chat-conversation')
          }}
          onBackgroundUpdated={() => {
            setBackgroundRefreshTrigger(prev => prev + 1)
            setCurrentPage('group-chat-conversation')
          }}
          onLeaveSuccess={() => {
            setSelectedGroup(null)
            setCurrentPage('group-chat')
          }}
        />
      )}

      {/* 聊天设置页面 */}
      {currentPage === 'chat-settings' && isAuthenticated && (
        <ChatSettingsPage
          friend={selectedFriend}
          onBack={() => setCurrentPage('chat')}
        />
      )}

      {/* 好友申请页面 */}
      {currentPage === 'friend-requests' && isAuthenticated && (
        // <FriendRequestsPage onBack={() => setCurrentPage('community')} />
        <FriendRequestsPage
          onBack={() => setCurrentPage('community')}
        />
      )}

      {/* 资料编辑页 */}
      {currentPage === 'profile-edit' && isAuthenticated && (
        <ProfileEditPage onBack={handleBackToMine} />
      )}


      {/* 用户中心页面 */}
      {currentPage === 'user-center' && isAuthenticated && (
        <UserCenterPage
          user={selectedUser}
          onBack={() => {
            setSelectedUser(null)
            setCurrentPage('community')
          }}
          onNavigateToDynamics={handleNavigateToUserDynamics}
        />
      )}

      {/* 用户动态页面 */}
      {currentPage === 'user-dynamics' && isAuthenticated && (
        <UserDynamicsPage
          user={selectedUser}
          onBack={() => {
            setCurrentPage('user-center')
          }}
        />
      )}

      {/* 活动详情页（从聊天或通知中心跳转） */}
      {currentPage === 'activity-detail' && isAuthenticated && (
        <ActivityDetailPage
          activityId={selectedActivityId}
          onBack={() => {
            const from = activityDetailFromPage || 'community'
            setSelectedActivityId(null)
            if (from === 'chat') {
              setCurrentPage('chat')
            } else if (from === 'notifications') {
              setCurrentPage('notifications')
            } else {
              setCurrentPage('community')
            }
          }}
        />
      )}
    

      {/* PWA安装提示组件 */}
      <PWAInstallPrompt />

      {/* 全局全屏切换悬浮按钮 */}
      <FullscreenToggle />

    </div>
    
  )
}

export default App

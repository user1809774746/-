// API配置文件
export const API_CONFIG = {
  // 服务器基础URL - 开发环境使用代理，生产环境使用HTTPS域名
  // 生产环境通过Nginx反向代理统一使用HTTPS


  BASE_URL: process.env.NODE_ENV === 'development' ? '' : 'http://192.168.1.101:8082',




  // 开发环境下使用空字符串，会通过Vite代理到后端
  
  // API端点
  ENDPOINTS: {
    // 认证相关
    SEND_CODE: '/api/auth/send-verification-code',
    REGISTER: '/api/auth/register', 
    LOGIN: '/api/auth/login',
    LOGIN_BY_CODE: '/api/auth/login-by-code',
    PROFILE: '/api/auth/profile',
    LOGOUT: '/api/auth/logout',
    PRIVACY_SETTINGS: '/api/auth/privacy',
    REAL_NAME_VERIFY: '/api/auth/real-name/verify',


    
    // 管理员相关
    ADMIN_QUICK_REGISTER: '/api/auth/admin/quick-register',   
    
    // 七天免密登录相关
    CHECK_AUTO_LOGIN: '/api/auth/check-auto-login',
    AUTO_LOGIN: '/api/auth/auto-login',
    
    // 头像相关
    UPLOAD_AVATAR: '/api/auth/upload-avatar',
    GET_AVATAR: '/api/auth/avatar',
    GET_AVATAR_BASE64: '/api/auth/avatar-base64',
    
    // 用户背景图片相关
    UPLOAD_BACKGROUND_IMAGE: '/api/user/background-image',
    GET_BACKGROUND_IMAGE: '/api/user/background-image',
    GET_BACKGROUND_IMAGE_BASE64: '/api/user/background-image-base64',
    GET_USER_BACKGROUND_IMAGE_BASE64: '/api/user/{userId}/background-image-base64', // 根据用户ID获取背景图片
    
    // 路线历史记录相关
    SAVE_ROUTE_SEARCH: '/api/route/save-search',
    GET_ROUTE_HISTORY: '/api/route/history',
    GET_ROUTE_FAVORITES: '/api/route/favorites',
    DELETE_ROUTE_HISTORY: '/api/route/history',
    TOGGLE_ROUTE_FAVORITE: '/api/route/history',
    
    // 收藏相关
    GET_ATTRACTION_FAVORITES: '/api/favorite/attractions',
    GET_POST_FAVORITES: '/api/favorite/posts',
    GET_FAVORITE_STATS: '/api/favorite/stats',
    GET_FAVORITE_OVERVIEW: '/api/favorite/overview',
    ADD_POST_FAVORITE: '/api/favorite/post',
    REMOVE_POST_FAVORITE: '/api/favorite/post',
    CHECK_POST_FAVORITE_STATUS: '/api/favorite/post',
    
    // 帖子相关
    CREATE_POST: '/api/post/create',
    PUBLISH_POST: '/api/post',
    UPDATE_POST: '/api/post',
    DELETE_POST: '/api/post',
    GET_POST_DETAIL: '/api/post',
    GET_MY_POSTS: '/api/post/my',
    GET_USER_POSTS: '/api/post/user',
    GET_LATEST_POST: '/api/post/latest',
    GET_PUBLIC_POSTS: '/api/post/public',
    SEARCH_POSTS: '/api/post/search',
    LIKE_POST: '/api/post',
    GET_POST_COMMENTS: '/api/post',
    ADD_COMMENT: '/api/post/comment',
    REPORT_COMMENT: '/api/post/comment/report',
    REPORT_POST: '/api/post',
    SAVE_DRAFT: '/api/post/draft/save',
    GET_MY_DRAFTS: '/api/post/draft/my',
    PUBLISH_DRAFT: '/api/post/draft',
    DELETE_DRAFT: '/api/post/draft',
    
    // 管理员相关
    ADMIN_USERS: '/api/auth/admin/users',
    TOKEN_STATS: '/api/auth/admin/token-stats',
    CLEANUP_TOKENS: '/api/auth/admin/cleanup-tokens',
    ADMIN_REPORTED_USERS: '/api/auth/admin/reported-users',
    
    // 用户身份查询
    USER_INFO: '/api/auth/user-info',
    
    // 管理员帖子审核相关
    ADMIN_POSTS_PENDING: '/api/admin/posts/pending',
    ADMIN_POSTS_LIST: '/api/admin/posts/list',
    ADMIN_POST_DETAIL: '/api/admin/posts',
    ADMIN_POST_APPROVE: '/api/admin/posts',
    ADMIN_POST_REJECT: '/api/admin/posts',
    ADMIN_POST_DELETE: '/api/admin/posts',
    ADMIN_POST_FEATURE: '/api/admin/posts',
    ADMIN_POST_TOP: '/api/admin/posts',
    ADMIN_POSTS_STATISTICS: '/api/admin/posts/statistics',
    ADMIN_COMMENT_REPORTS: '/api/admin/posts/comment-reports',
    ADMIN_POST_REPORTS: '/api/admin/posts/post-reports',

    //发现页面热门路线收藏 - 更新为正确的后端API路径
    FAVORITE_ROUTE_BY_ID: '/api/favorites/route', // 收藏已有路线: POST /api/favorites/route/{routeId}
    FAVORITE_CUSTOM_ROUTE: '/api/favorites/route/custom', // 收藏自定义路线: POST /api/favorites/route/custom
    UNFAVORITE_ROUTE: '/api/favorites/route', // 取消收藏: DELETE /api/favorites/route/{routeId}
    CHECK_FAVORITE_STATUS: '/api/favorites/route', // 检查收藏状态: GET /api/favorites/route/{routeId}/status
    GET_FAVORITE_ROUTES: '/api/favorites/route/list', // 获取收藏列表: GET /api/favorites/route/list
    
    // 热门旅行计划接口（新接口文档）
    SAVE_POPULAR_TRAVEL_PLAN: '/api/popular-travel-plans/save', // 保存或更新旅行计划: POST /api/popular-travel-plans/save
    TOGGLE_FAVORITE_PLAN: '/api/popular-travel-plans', // 收藏/取消收藏旅行计划: POST /api/popular-travel-plans/{planId}/toggle-favorite
    GET_PLAN_DETAIL: '/api/popular-travel-plans', // 获取旅行计划详情: GET /api/popular-travel-plans/{planId}
    
    // AI聊天相关
    CHAT_SEND: '/api/chat/send',
    CHAT_STREAM: '/api/chat/stream',
    CHAT_HISTORY: '/api/chat/history',
    SHARE_TO_AI: '/api/travel-plans', // 分享旅行计划给AI: POST /api/travel-plans/{id}/share-to-ai
    TRAVELOGUE_STREAM_GENERATE: '/api/chat/travelogue/stream-generate', // Coze 流式游记生成
    
    // 通知相关
    NOTIFICATION_LIST: '/api/notifications/list',
    NOTIFICATION_UNREAD: '/api/notifications/unread',
    NOTIFICATION_BY_TYPE: '/api/notifications/type',
    NOTIFICATION_STATS: '/api/notifications/stats',
    NOTIFICATION_UNREAD_COUNT: '/api/notifications/unread-count',
    NOTIFICATION_MARK_READ: '/api/notifications',
    NOTIFICATION_READ_ALL: '/api/notifications/read-all',
    NOTIFICATION_DELETE: '/api/notifications',
    NOTIFICATION_DELETE_READ_ALL: '/api/notifications/read-all',
    
    // 用户反馈相关
    FEEDBACK_SUBMIT: '/api/feedback/submit',

    //收藏景点 - 更新为新的API端点
    ADD_ATTRACTION_FAVORITE: '/api/favorite/attraction',  // 收藏景点
    REMOVE_ATTRACTION_FAVORITE: '/api/favorite/attraction', // 取消收藏景点
    CHECK_ATTRACTION_FAVORITE: '/api/favorite/attraction/status', // 检查收藏状态
    COUNT_ATTRACTION_FAVORITES: '/api/favorite/stats', // 获取收藏总数
    CREATE_OR_UPDATE_ATTRACTION: '/api/attractions', // 创建或更新景点信息
    GET_ATTRACTION_DETAIL: '/api/attractions/{id}',
    GET_ATTRACTION_BY_ACTIVITY: '/api/attractions/activity/{activityId}',
    
    // 聊天系统相关接口
    CHAT_ADD_FRIEND: '/api/user-chat/friends/add',
    CHAT_HANDLE_FRIEND_REQUEST: '/api/user-chat/friends/handle',
    CHAT_GET_FRIENDS_LIST: '/api/user-chat/friends/list',
    CHAT_GET_FRIEND_REQUESTS: '/api/user-chat/friends/requests',
    CHAT_SEARCH_USERS: '/api/user-chat/users/search',
    
    CHAT_SEND_MESSAGE: '/api/user-chat/messages/send',
    CHAT_SEND_FILE_MESSAGE: '/api/user-chat/messages/send-file',
    CHAT_GET_MESSAGE_HISTORY: '/api/user-chat/messages/history',
    CHAT_SEARCH_MESSAGES: '/api/user-chat/messages/search',
    CHAT_DELETE_MESSAGE: '/api/user-chat/messages',
    CHAT_RECALL_MESSAGE: '/api/user-chat/messages/recall',
    CHAT_GET_CONVERSATIONS: '/api/user-chat/conversations/list',
    SHARE_TRAVEL_PLAN: '/api/user-chat/messages/share-travel-plan',
    
    CHAT_PIN_CONVERSATION: '/api/user-chat/settings/pin',
    CHAT_MUTE_CONVERSATION: '/api/user-chat/settings/mute',
    CHAT_UPLOAD_BACKGROUND: '/api/user-chat/settings/background/upload',
    CHAT_SET_BACKGROUND: '/api/user-chat/settings/background',
    CHAT_CLEAR_MESSAGES: '/api/user-chat/messages/clear',
    CHAT_GET_SETTINGS: '/api/user-chat/settings',
    
    GROUP_CREATE: '/api/group/create',
    GROUP_CREATE_WITH_FRIENDS: '/api/group/create-with-friends',
    GROUP_INVITE_USERS: '/api/group',
    GROUP_GET_MEMBERS: '/api/group',
    GROUP_LEAVE: '/api/group',
    GROUP_DISMISS: '/api/group',
    GROUP_UPDATE_INFO: '/api/group',
    GROUP_REMOVE_MEMBER: '/api/group',
    GROUP_SET_ADMIN: '/api/group',
    
    // 群聊设置相关
    GROUP_PIN: '/api/group',                        // 置顶群聊: POST /api/group/{groupId}/settings/pin
    GROUP_DISTURB_FREE: '/api/group',               // 消息免打扰: POST /api/group/{groupId}/settings/disturb-free
    GROUP_SET_BACKGROUND: '/api/group',             // 设置群聊背景: POST /api/group/{groupId}/settings/background
    GROUP_CLEAR_HISTORY: '/api/group',              // 清空聊天记录: POST /api/group/{groupId}/settings/clear-history
    GROUP_REPORT: '/api/group',                     // 举报群聊: POST /api/group/{groupId}/report
    GROUP_GET_SETTINGS: '/api/group',               // 获取群聊设置: GET /api/group/{groupId}/settings
    
    CHAT_SET_PERMISSIONS: '/api/user-chat/permissions/set',
    CHAT_GET_PERMISSIONS: '/api/user-chat/permissions',
    
    CHAT_REPORT_USER: '/api/user-chat/reports/user',
    CHAT_REPORT_MESSAGE: '/api/user-chat/reports/message',
    CHAT_REPORT_GROUP: '/api/user-chat/reports/group',
    
    CHAT_UPDATE_ONLINE_STATUS: '/api/user-chat/status/online',

    CHAT_MARK_MESSAGE_READ: '/api/user-chat/messages/read',
    CHAT_GET_UNREAD_COUNT: '/api/user-chat/messages/unread-count',

    // 在API_CONFIG.ENDPOINTS中添加
    GET_USER_TRAVEL_PLANS: '/api/travel-plans/user',     // 获取用户所有旅行方案
    GET_USER_LATEST_TRAVEL_PLAN: '/api/travel-plans/user/{userId}/latest', // 🔥 获取用户最新的旅行计划
    GET_USER_TOTAL_TRAVEL_PLANS: '/api/travel-plans/user/{userId}/total',//获取用户的总的旅行计划的总数
    GET_TRAVEL_PLAN: '/api/travel-plans/{id}',           // 获取旅行计划基本信息
    GET_TRAVEL_PLAN_FULL: '/api/travel-plans/{id}/full',  // 获取旅行计划完整详情
    GET_USER_TRAVEL_PLAN_REMINDERS: '/api/travel-plans/user/{userId}/reminders', // 获取到期提醒的旅行计划
    UPLOAD_TRAVEL_PLAN_IMAGE: '/api/travel-plans/{id}/images',
    GET_TRAVEL_PLAN_IMAGES: '/api/travel-plans/{id}/images', // 获取旅行计划图片元信息列表
    GET_TRAVEL_PLAN_IMAGE_CONTENT: '/api/travel-plans/images/{imageId}/content', // 获取单张图片内容
    GET_TRAVEL_PLAN_IMAGES_URLS_FOR_POST: '/api/travel-plans/{id}/images/urls-for-post', // 获取旅行计划图片URL列表（用于游记）
    GET_TRAVEL_PLAN_ATTRACTIONS: '/api/attractions/travel-plan/{travelPlanId}', // 获取旅行计划的所有景点
    GET_TRAVEL_PLAN_ACCOMMODATIONS: '/api/accommodations/travel-plan/{travelPlanId}',
    COPY_TRAVEL_PLAN_IMAGES_TO_POST: '/api/travel-plans/copy-images-to-post',
    GET_SELECTED_ACCOMMODATIONS: '/api/accommodations/travel-plan/{travelPlanId}/selected',
    SELECT_ACCOMMODATION: '/api/accommodations/{id}/select',
    UNSELECT_ACCOMMODATION: '/api/accommodations/{id}/unselect',
    DELECTE_ACTIVITY:'/api/activities/${editingActivity.id}',//删除旅行计划中的某一天的景点
    DELECTE_ACTIVITY_DAY:'/api/daily-itineraries/travel-plan/{travelPlanId}/day/{dayNumber}',//删除一天的景点规划
    DELECT_ACTIVITY_PLAN:'/api/travel-plans/{id}',//删除旅行计划
    UPDATE_TRAVEL_PLAN_STATUS: '/api/travel-plans/{id}/status', // 更新旅行计划状态（draft/active/completed）
    GET_TRAVEL_PLAN_CITIES: '/api/travel-plans/{id}/cities',
    GET_TRAVEL_PLAN_CITY_LIST: '/api/travel-plans/{id}/city-list',

    CHAT_MARK_MESSAGE_READ: '/api/user-chat/messages/mark-read',
    CHAT_GET_UNREAD_COUNT: '/api/user-chat/messages/unread-count',

    
    ACTIVITY_CREATE: '/api/activities/create',
    ACTIVITY_PUBLISH: '/api/activities',
    ACTIVITY_LOCAL: '/api/activities/local',
    ACTIVITY_RECOMMENDED: '/api/activities/recommended',
    ACTIVITY_MY: '/api/activities/my',
    ACTIVITY_DETAIL: '/api/activities',
    ACTIVITY_REGISTER: '/api/activities',
    ACTIVITY_QUIT: '/api/activities',
    ACTIVITY_PARTICIPANTS: '/api/activities',
    ACTIVITY_PARTICIPANTS_PENDING: '/api/activities/participants/pending',
    ACTIVITY_PARTICIPANT_APPROVE: '/api/activities/participants',
    ACTIVITY_REPORT: '/api/activities',
    ACTIVITY_AUDIT: '/api/activities',
    ACTIVITY_ADMIN_PENDING: '/api/activities/admin/pending',
    ACTIVITY_ADMIN_REPORTED: '/api/activities/admin/reported',
    GET_USER_PARTICIPATED_ACTIVITIES: '/api/activities/participated',
  
  ADD_ATTRACTION_FAVORITE: '/api/favorite/attraction',  // 收藏景点
  REMOVE_ATTRACTION_FAVORITE: '/api/favorite/attraction', // 取消收藏景点
  CHECK_ATTRACTION_FAVORITE: '/api/favorite/attraction/status', // 检查收藏状态
  COUNT_ATTRACTION_FAVORITES: '/api/favorite/stats', // 获取收藏总数
  
  // 活动相关API
  ACTIVITY_CREATE: '/api/activities/create',
  ACTIVITY_PUBLISH: '/api/activities',
  ACTIVITY_LOCAL: '/api/activities/local',
  ACTIVITY_RECOMMENDED: '/api/activities/recommended',
  ACTIVITY_MY: '/api/activities/my',
  ACTIVITY_DETAIL: '/api/activities',
  ACTIVITY_REGISTER: '/api/activities',
  ACTIVITY_QUIT: '/api/activities',
  ACTIVITY_PARTICIPANTS: '/api/activities',
  ACTIVITY_PARTICIPANTS_PENDING: '/api/activities/participants/pending',
  ACTIVITY_PARTICIPANT_APPROVE: '/api/activities/participants',
  ACTIVITY_REPORT: '/api/activities',
  ACTIVITY_AUDIT: '/api/activities',
  ACTIVITY_ADMIN_PENDING: '/api/activities/admin/pending',
  ACTIVITY_ADMIN_REPORTED: '/api/activities/admin/reported',
  ACTIVITY_MEDIA_UPLOAD: '/api/activities/media/upload',

  REORDER_TRAVEL_PLAN_ITINERARIES: '/api/travel-plans/{id}/reorder-itineraries',
  UPDATE_TRAVEL_PLAN_DATES: '/api/travel-plans/{id}/dates' // 更新旅行日期

},
  
// 请求超时时间（毫秒）
  TIMEOUT: 10000
}


// 顶号处理回调函数
let tokenKickOutHandler = null

// 设置顶号处理回调
export const setTokenKickOutHandler = (handler) => {
  tokenKickOutHandler = handler
}

// 处理令牌失效
const handleTokenExpired = (error, url) => {
  console.log('🚫 检测到令牌失效，可能被顶号')
  
  // 清除本地存储的令牌
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_phone')
  localStorage.removeItem('user_type')
  localStorage.removeItem('login_time')
  localStorage.removeItem('login_mode')
  localStorage.removeItem('login_type')
  
  // 调用顶号处理回调
  if (tokenKickOutHandler) {
    tokenKickOutHandler(error, url)
  } else {
    // 默认处理：显示提示并跳转到登录页
    alert('您的账号在其他设备登录，当前登录已失效，请重新登录')
    window.location.href = '#login'
  }
}

// HTTP请求工具函数
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT
  }
  
  // 合并选项，但允许覆盖headers
  const isFormData = options.body instanceof FormData

  const finalOptions = { 
    ...defaultOptions, 
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers  // 🔧 允许覆盖默认的Content-Type
    }
  }

  if (isFormData && finalOptions.headers) {
    delete finalOptions.headers['Content-Type']
  }
  
  // 如果有token，添加到请求头
  const token = localStorage.getItem('auth_token')
  if (token && !finalOptions.headers.Authorization) {
    finalOptions.headers.Authorization = `Bearer ${token}`
  }
  
  try {
    console.log(`🌐 API请求: ${finalOptions.method} ${url}`)
    console.log('📦 请求参数:', finalOptions)
    
    const response = await fetch(url, finalOptions)
    
    // 检查响应是否为空或无效
    let data = null
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('❌ JSON解析失败:', jsonError)
        throw new Error(`服务器响应格式错误 (HTTP ${response.status})`)
      }
    } else {
      // 非JSON响应，尝试获取文本内容
      const textContent = await response.text()
      console.error('❌ 服务器返回非JSON响应:', textContent)
      throw new Error(`服务器响应格式错误 (HTTP ${response.status}): ${textContent || '无响应内容'}`)
    }
    
    console.log('📨 响应数据:', data)
    
    // 检查401未授权错误（令牌失效/被顶号）
    if (response.status === 401) {
      const error = new Error(data.msg || '登录已失效')
      error.status = 401
      handleTokenExpired(error, url)
      throw error
    }
    
    // 检查业务逻辑错误
    if (!response.ok) {
      // 🔍 对于400和500错误，输出更详细的信息
      if ((response.status === 400 || response.status === 500) && data) {
        console.error(`❌ HTTP ${response.status}错误详情:`, {
          status: response.status,
          statusText: response.statusText,
          message: data.msg || data.message,
          errorDetails: data.error || data.details || data.trace,
          timestamp: data.timestamp,
          path: data.path,
          fullResponse: data,
          requestUrl: url,
          requestMethod: finalOptions.method,
          requestBody: finalOptions.body
        });
      }
      throw new Error((data && data.msg) || (data && data.message) || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    // 检查后端返回的业务状态码
    if (data && data.code !== 200) {
      // 如果是401业务错误码，也按顶号处理
      if (data.code === 401) {
        const error = new Error(data.msg || '登录已失效')
        error.status = 401
        handleTokenExpired(error, url)
      }
      
      // 输出详细的错误信息用于调试
      console.error('❌ 后端业务错误:', {
        url: url,
        statusCode: data.code,
        message: data.msg || data.message,
        data: data
      })
      
      throw new Error(data.msg || data.message || '请求失败')
    }
    
    return data
  } catch (error) {
    console.error(`❌ API请求失败: ${url}`, error)
    throw error
  }
}

// 发送验证码
export const sendVerificationCode = async (phone) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.SEND_CODE, {
    method: 'POST',
    body: JSON.stringify({ phone })
  })
}

// 用户注册
export const registerUser = async (userData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify({
      phone: userData.phone,
      username: userData.username,
      verificationCode: userData.verificationCode,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      userProfilePic: null,
      userType: 'user' // 固定为普通用户
    })
  })
}

// 密码登录
export const loginWithPassword = async (phone, password, userType = 'user') => {
  return await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({
      phone,
      password,
      userType
    })
  })
}

// 管理员快速注册（无需验证码）
export const adminQuickRegister = async (phone, password) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.ADMIN_QUICK_REGISTER, {
    method: 'POST',
    body: JSON.stringify({
      phone,
      password
    })
  })
}

// 验证码登录
export const loginWithCode = async (phone, verificationCode, userType = 'user') => {
  return await apiRequest(API_CONFIG.ENDPOINTS.LOGIN_BY_CODE, {
    method: 'POST', 
    body: JSON.stringify({
      phone,
      verificationCode,
      userType
    })
  })
}

// 获取用户信息
export const getUserProfile = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.PROFILE, {
    method: 'GET'
  })
}

// 获取隐私设置
export const getPrivacySettings = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.PRIVACY_SETTINGS, {
    method: 'GET'
  })
}

// 更新隐私设置
export const updatePrivacySettings = async (allowStrangerViewDynamic) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.PRIVACY_SETTINGS, {
    method: 'PUT',
    body: JSON.stringify({
      allowStrangerViewDynamic
    })
  })
}

// 实名认证
export const verifyRealName = async (realName, idCard) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.REAL_NAME_VERIFY, {
    method: 'POST',
    body: JSON.stringify({
      realName,
      idCard
    })
  })
}


// 图片压缩工具函数
const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为Base64
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// 上传头像
export const uploadAvatar = async (file) => {
  try {
    // 检查文件大小（2MB限制）
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      throw new Error('图片大小不能超过2MB')
    }
    
    // 检查文件格式
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('仅支持 JPG、PNG、GIF 格式的图片')
    }
    
    // 压缩图片
    const compressedFile = await compressImage(file)
    
    // 转换为Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result
          const fileExtension = file.name.split('.').pop().toLowerCase()
          
          const result = await apiRequest(API_CONFIG.ENDPOINTS.UPLOAD_AVATAR, {
            method: 'POST',
            body: JSON.stringify({
              imageBase64: base64Data,
              imageFormat: fileExtension
            })
          })
          
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(compressedFile)
    })
  } catch (error) {
    throw error
  }
}

// 获取头像（Base64格式）
export const getAvatarBase64 = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_AVATAR_BASE64, {
    method: 'GET'
  })
}

// 获取头像URL（用于img标签直接显示）
export const getAvatarUrl = () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    return null
  }
  
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_AVATAR}?token=${token}`
}

// ==================== 用户背景图片相关 API ====================

// 上传背景图片
export const uploadBackgroundImage = async (file) => {
  try {
    // 检查文件大小（10MB限制）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('图片大小不能超过10MB')
    }
    
    // 检查文件格式
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('仅支持 JPG、PNG、GIF 格式的图片')
    }
    
    // 转换为Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result
          const fileExtension = file.name.split('.').pop().toLowerCase()
          
          const result = await apiRequest(API_CONFIG.ENDPOINTS.UPLOAD_BACKGROUND_IMAGE, {
            method: 'POST',
            body: JSON.stringify({
              imageBase64: base64Data,
              imageFormat: fileExtension
            })
          })
          
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  } catch (error) {
    throw error
  }
}

// 获取背景图片（Base64格式）
// userId: 可选参数，如果提供则获取指定用户的背景图片，否则获取当前用户的
export const getBackgroundImageBase64 = async (userId = null) => {
  let url;
  if (userId) {
    // 使用新接口：根据用户ID获取背景图片（路径参数）
    url = API_CONFIG.ENDPOINTS.GET_USER_BACKGROUND_IMAGE_BASE64.replace('{userId}', userId);
  } else {
    // 获取当前用户的背景图片
    url = API_CONFIG.ENDPOINTS.GET_BACKGROUND_IMAGE_BASE64;
  }
  
  return await apiRequest(url, {
    method: 'GET'
  })
}

// 获取背景图片URL（用于img标签直接显示）
export const getBackgroundImageUrl = () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    return null
  }
  
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_BACKGROUND_IMAGE}?token=${token}`
}

// 检查七天免密登录状态
export const checkAutoLogin = async (phone, userType = 'user') => {
  return await apiRequest(API_CONFIG.ENDPOINTS.CHECK_AUTO_LOGIN, {
    method: 'POST',
    body: JSON.stringify({
      phone,
      userType
    })
  })
}

// 执行七天免密登录（⚠️ 新版：必须携带token）
export const autoLogin = async (phone, userType = 'user', token) => {
  if (!token) {
    throw new Error('Token不能为空，自动登录必须携带token')
  }
  
  return await apiRequest(API_CONFIG.ENDPOINTS.AUTO_LOGIN, {
    method: 'POST',
    body: JSON.stringify({
      phone,
      userType,
      token  // ⚠️ 新版必须携带token字段
    })
  })
}

// 智能登录函数 - 自动检查并执行免密登录（⚠️ 新版：需要传入token）
export const smartLogin = async (phone, userType = 'user', token = null) => {
  try {
    console.log('🔍 智能登录开始...')
    
    // 如果没有传入token，尝试从localStorage获取
    if (!token) {
      token = localStorage.getItem('auth_token')
    }
    
    // 如果仍然没有token，说明需要手动登录
    if (!token) {
      console.log('⚠️ 没有token，需要手动登录')
      return {
        success: false,
        loginType: 'manual_login',
        message: '没有token，请使用密码或验证码登录'
      }
    }
    
    console.log('✅ 找到token，尝试七天免密登录...')
    
    // 直接使用token执行自动登录
    const loginResult = await autoLogin(phone, userType, token)
    
    if (loginResult.code === 200) {
      // 保存登录信息（token不会变化，但要更新其他信息）
      localStorage.setItem('auth_token', loginResult.data.token)
      localStorage.setItem('user_phone', loginResult.data.phone)
      localStorage.setItem('user_type', loginResult.data.userType)
      localStorage.setItem('login_time', Date.now().toString())
      localStorage.setItem('login_type', 'auto_login')
      
      console.log('🎉 七天免密登录成功')
      
      return {
        success: true,
        loginType: 'auto_login',
        data: loginResult.data,
        message: '七天免密登录成功'
      }
    } else {
      // 自动登录失败（token失效、被顶号或已过期）
      console.log('❌ 七天免密登录失败:', loginResult.msg || loginResult.message)
      return {
        success: false,
        loginType: 'manual_login',
        message: loginResult.msg || loginResult.message || '七天免密登录失败，请重新登录'
      }
    }
    
  } catch (error) {
    console.error('❌ 智能登录失败:', error)
    
    // 如果是401错误（被顶号或过期），清除本地token
    if (error.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_phone')
      localStorage.removeItem('user_type')
      localStorage.removeItem('login_time')
      localStorage.removeItem('login_type')
    }
    
    return {
      success: false,
      loginType: 'error',
      message: error.message || '登录检查失败'
    }
  }
}

// 主动注销令牌
export const logout = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
    method: 'POST'
  })
}

// 检查登录状态
export const checkLoginStatus = async () => {
  try {
    const response = await getUserProfile()
    return {
      isValid: true,
      userInfo: response.data
    }
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    }
  }
}

// 定期检查登录状态
let loginStatusCheckInterval = null

export const startLoginStatusCheck = (intervalMs = 60000) => {
  // 清除之前的定时器
  if (loginStatusCheckInterval) {
    clearInterval(loginStatusCheckInterval)
  }
  
  // 只有在有token时才启动检查
  if (!localStorage.getItem('auth_token')) {
    return
  }
  
  console.log('🔄 启动定期登录状态检查，间隔:', intervalMs / 1000, '秒')
  
  loginStatusCheckInterval = setInterval(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      // 没有token，停止检查
      stopLoginStatusCheck()
      return
    }
    
    try {
      await checkLoginStatus()
      console.log('✅ 登录状态检查通过')
    } catch (error) {
      console.log('❌ 登录状态检查失败:', error.message)
      // 401错误会被apiRequest自动处理
    }
  }, intervalMs)
}

export const stopLoginStatusCheck = () => {
  if (loginStatusCheckInterval) {
    clearInterval(loginStatusCheckInterval)
    loginStatusCheckInterval = null
    console.log('⏹️ 停止定期登录状态检查')
  }
}

// 管理员功能：获取令牌统计
export const getTokenStats = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.TOKEN_STATS, {
    method: 'GET'
  })
}

// 管理员功能：清理过期令牌
export const cleanupTokens = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.CLEANUP_TOKENS, {
    method: 'POST'
  })
}

// ==================== 路线历史记录相关 API ====================

// 保存路线查询记录
export const saveRouteSearch = async (routeData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.SAVE_ROUTE_SEARCH, {
    method: 'POST',
    body: JSON.stringify({
      departure: routeData.departure,
      destination: routeData.destination,
      departureLat: routeData.departureLat,
      departureLng: routeData.departureLng,
      destinationLat: routeData.destinationLat,
      destinationLng: routeData.destinationLng,
      distance: routeData.distance,
      duration: routeData.duration,
      routeType: routeData.routeType,
      notes: routeData.notes
    })
  })
}

// 获取历史记录列表
export const getRouteHistory = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_ROUTE_HISTORY, {
    method: 'GET'
  })
}

// 获取收藏的路线
export const getRouteFavorites = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_ROUTE_FAVORITES, {
    method: 'GET'
  })
}

// 删除历史记录
export const deleteRouteHistory = async (historyId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.DELETE_ROUTE_HISTORY}/${historyId}`, {
    method: 'DELETE'
  })
}

// 切换收藏状态
export const toggleRouteFavorite = async (historyId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.TOGGLE_ROUTE_FAVORITE}/${historyId}/toggle-favorite`, {
    method: 'POST'
  })
}

// ==================== 收藏相关 API ====================

// 获取景点收藏列表
export const getAttractionFavorites = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const endpoint = params.toString() ? 
    `${API_CONFIG.ENDPOINTS.GET_ATTRACTION_FAVORITES}?${params}` : 
    API_CONFIG.ENDPOINTS.GET_ATTRACTION_FAVORITES;
    
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

export const getUserTotalTravelPlans = async (userId) => {
  if (!userId) {
    throw new Error('userId is required to get total travel plans');
  }

  const endpoint = API_CONFIG.ENDPOINTS.GET_USER_TOTAL_TRAVEL_PLANS.replace('{userId}', userId);
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

export const getTravelPlanCities = async (travelPlanId) => {
  if (!travelPlanId) {
    throw new Error('travelPlanId is required to get travel plan cities');
  }

  const endpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_CITIES.replace('{id}', travelPlanId);
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

export const getTravelPlanCityList = async (travelPlanId) => {
  if (!travelPlanId) {
    throw new Error('travelPlanId is required to get travel plan city list');
  }

  const endpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_CITY_LIST.replace('{id}', travelPlanId);
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 按用户ID获取指定用户的帖子列表（用于用户动态）
export const getUserPosts = async (userId, status = 'published') => {
  if (!userId) {
    throw new Error('userId is required to get user posts');
  }

  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }

  const endpoint = params.toString()
    ? `${API_CONFIG.ENDPOINTS.GET_USER_POSTS}/${userId}?${params.toString()}`
    : `${API_CONFIG.ENDPOINTS.GET_USER_POSTS}/${userId}`;

  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 获取帖子收藏列表
export const getPostFavorites = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const endpoint = params.toString() ? 
    `${API_CONFIG.ENDPOINTS.GET_POST_FAVORITES}?${params}` : 
    API_CONFIG.ENDPOINTS.GET_POST_FAVORITES;
    
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 获取收藏统计信息
export const getFavoriteStats = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_FAVORITE_STATS, {
    method: 'GET'
  });
};

// 获取收藏概览
export const getFavoriteOverview = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_FAVORITE_OVERVIEW, {
    method: 'GET'
  });
};

// 添加帖子收藏
export const addPostFavorite = async (postId, options = {}) => {
  const params = new URLSearchParams();
  if (options.favoriteCategory) params.append('favoriteCategory', options.favoriteCategory);
  if (options.favoriteTags) params.append('favoriteTags', options.favoriteTags);
  if (options.userNotes) params.append('userNotes', options.userNotes);
  if (options.priorityLevel) params.append('priorityLevel', options.priorityLevel);
  
  const endpoint = `${API_CONFIG.ENDPOINTS.ADD_POST_FAVORITE}/${postId}${params.toString() ? '?' + params.toString() : ''}`;
  return await apiRequest(endpoint, {
    method: 'POST'
  });
};

// 取消帖子收藏
export const removePostFavorite = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.REMOVE_POST_FAVORITE}/${postId}`, {
    method: 'DELETE'
  });
};

// 检查帖子收藏状态
export const checkPostFavoriteStatus = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHECK_POST_FAVORITE_STATUS}/${postId}/status`, {
    method: 'GET'
  });
};

// ==================== 帖子相关 API ====================

// 创建帖子（保存为草稿）
export const createPost = async (postData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.CREATE_POST, {
    method: 'POST',
    body: JSON.stringify(postData)
  });
};

// 发布帖子
export const publishPost = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.PUBLISH_POST}/${postId}/publish`, {
    method: 'POST'
  });
};

// 更新帖子
export const updatePost = async (postId, postData) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.UPDATE_POST}/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData)
  });
};

// 删除帖子
export const deletePost = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.DELETE_POST}/${postId}`, {
    method: 'DELETE'
  });
};

export const getPostDetail = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GET_POST_DETAIL}/${postId}`, {
    method: 'GET'
  });
};
export const copyTravelPlanImagesToPost = async (travelPlanId, postId) => {
  if (!travelPlanId || !postId) {
    throw new Error('travelPlanId and postId are required to copy travel plan images to post');
  }

  const endpoint = API_CONFIG.ENDPOINTS.COPY_TRAVEL_PLAN_IMAGES_TO_POST;
  const url = `${API_CONFIG.BASE_URL || ''}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      travelPlanId,
      postId,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text().catch(() => '');
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }
  }

  return data;
};

// 获取旅行计划图片URL列表（用于游记）
export const getTravelPlanImagesUrlsForPost = async (travelPlanId) => {
  if (!travelPlanId) {
    throw new Error('travelPlanId is required to get images URLs for post');
  }

  const endpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_IMAGES_URLS_FOR_POST.replace('{id}', travelPlanId);
  const url = `${API_CONFIG.BASE_URL || ''}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `HTTP ${response.status}`);
  }

  const data = await response.json();
  
  // 返回图片URL数组
  return data?.data?.imageUrls || [];
};

// 获取用户最近一次发布的帖子
export const getLatestPost = async (userId) => {
  if (!userId) {
    throw new Error('userId is required to get latest post');
  }
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GET_LATEST_POST}/${userId}`, {
    method: 'GET'
  });
};

// 获取当前登录用户的帖子列表
export const getMyPosts = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const endpoint = params.toString() ? 
    `${API_CONFIG.ENDPOINTS.GET_MY_POSTS}?${params}` : 
    API_CONFIG.ENDPOINTS.GET_MY_POSTS;
    
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 获取公开帖子列表
export const getPublicPosts = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const endpoint = params.toString() ? 
    `${API_CONFIG.ENDPOINTS.GET_PUBLIC_POSTS}?${params}` : 
    API_CONFIG.ENDPOINTS.GET_PUBLIC_POSTS;
    
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 搜索帖子
export const searchPosts = async (keyword, page = 1, pageSize = 10) => {
  const params = new URLSearchParams({
    keyword,
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  return await apiRequest(`${API_CONFIG.ENDPOINTS.SEARCH_POSTS}?${params}`, {
    method: 'GET'
  });
};

// 点赞/取消点赞帖子
export const togglePostLike = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.LIKE_POST}/${postId}/like`, {
    method: 'POST'
  });
};

// 获取帖子评论列表
export const getPostComments = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GET_POST_COMMENTS}/${postId}/comments`, {
    method: 'GET'
  });
};

// 添加评论
export const addComment = async (commentData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.ADD_COMMENT, {
    method: 'POST',
    body: JSON.stringify(commentData)
  });
};

// 举报评论
export const reportComment = async (reportData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.REPORT_COMMENT, {
    method: 'POST',
    body: JSON.stringify(reportData)
  });
};

// 举报帖子
export const reportPost = async (postId, reportData) => {
  if (!postId) {
    throw new Error('postId is required to report post');
  }
  return await apiRequest(`${API_CONFIG.ENDPOINTS.REPORT_POST}/${postId}/report`, {
    method: 'POST',
    body: JSON.stringify(reportData)
  });
};

// 保存草稿
export const saveDraft = async (draftData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.SAVE_DRAFT, {
    method: 'POST',
    body: JSON.stringify(draftData)
  });
};

// 获取用户草稿列表
export const getMyDrafts = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_MY_DRAFTS, {
    method: 'GET'
  });
};

// 发布草稿（草稿转换并发布）
export const publishDraft = async (draftId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.PUBLISH_DRAFT}/${draftId}/convert-and-publish`, {
    method: 'POST'
  });
};

// 删除草稿
export const deleteDraft = async (draftId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.DELETE_DRAFT}/${draftId}`, {
    method: 'DELETE'
  });
};

// ==================== 用户身份查询 API ====================

// 获取用户身份信息
export const getUserInfo = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.USER_INFO, {
    method: 'GET'
  });
};

// ==================== 管理员帖子审核 API ====================

// 获取待审核帖子列表
export const getAdminPendingPosts = async (page = 1, pageSize = 10) => {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POSTS_PENDING}?${params}`, {
    method: 'GET'
  });
};

// 获取所有帖子列表（可筛选）
export const getAdminAllPosts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.auditStatus) params.append('auditStatus', filters.auditStatus);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  
  const endpoint = params.toString() ? 
    `${API_CONFIG.ENDPOINTS.ADMIN_POSTS_LIST}?${params}` : 
    API_CONFIG.ENDPOINTS.ADMIN_POSTS_LIST;
    
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 获取帖子详情（管理员）
export const getAdminPostDetail = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_DETAIL}/${postId}`, {
    method: 'GET'
  });
};

// 审核通过帖子
export const approvePost = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_APPROVE}/${postId}/approve`, {
    method: 'POST'
  });
};

// 审核拒绝帖子
export const rejectPost = async (postId, reason) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_REJECT}/${postId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
};

// 删除帖子（管理员）
export const deletePostByAdmin = async (postId, reason = '') => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_DELETE}/${postId}`, {
    method: 'DELETE',
    body: JSON.stringify({ reason })
  });
};

// 设置精选
export const setPostFeatured = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_FEATURE}/${postId}/feature`, {
    method: 'POST'
  });
};

// 取消精选
export const unsetPostFeatured = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_FEATURE}/${postId}/feature`, {
    method: 'DELETE'
  });
};

// 设置置顶
export const setPostTop = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_TOP}/${postId}/top`, {
    method: 'POST'
  });
};

// 取消置顶
export const unsetPostTop = async (postId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_TOP}/${postId}/top`, {
    method: 'DELETE'
  });
};

// 获取审核统计信息
export const getAdminPostsStatistics = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.ADMIN_POSTS_STATISTICS, {
    method: 'GET'
  });
};

// 获取评论举报列表（管理员）
export const getAdminCommentReports = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

  const endpoint = params.toString()
    ? `${API_CONFIG.ENDPOINTS.ADMIN_COMMENT_REPORTS}?${params}`
    : API_CONFIG.ENDPOINTS.ADMIN_COMMENT_REPORTS;

  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 处理评论举报（管理员）
export const handleAdminCommentReport = async (reportId, action, handleResult = '') => {
  if (!reportId) {
    throw new Error('reportId is required to handle comment report');
  }

  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_COMMENT_REPORTS}/${reportId}/handle`, {
    method: 'POST',
    body: JSON.stringify({ action, handleResult })
  });
};

// 获取帖子举报列表（管理员）
export const getAdminPostReports = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

  const endpoint = params.toString()
    ? `${API_CONFIG.ENDPOINTS.ADMIN_POST_REPORTS}?${params}`
    : API_CONFIG.ENDPOINTS.ADMIN_POST_REPORTS;

  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 处理帖子举报（管理员）
export const handleAdminPostReport = async (reportId, action, handleResult = '') => {
  if (!reportId) {
    throw new Error('reportId is required to handle post report');
  }

  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_POST_REPORTS}/${reportId}/handle`, {
    method: 'POST',
    body: JSON.stringify({ action, handleResult })
  });
};

// 获取被举报用户汇总列表（管理员）
export const getAdminReportedUsers = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.ADMIN_REPORTED_USERS, {
    method: 'GET'
  });
};

// 获取指定被举报用户的举报详情（管理员）
export const getAdminUserReports = async (userId) => {
  if (!userId) {
    throw new Error('userId is required to get user reports');
  }
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}/reports`, {
    method: 'GET'
  });
};

// 收藏已有路线（通过routeId）
export const favoriteRoute = async (routeId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.FAVORITE_ROUTE_BY_ID}/${routeId}`, {
    method: 'POST'
  });
};

// 收藏自定义路线（完整路线数据）
export const favoriteCustomRoute = async (tripSchemeData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.FAVORITE_CUSTOM_ROUTE, {
    method: 'POST',
    body: JSON.stringify(tripSchemeData)
  });
};

// 保存或更新热门旅行计划（新接口文档）
export const savePopularTravelPlan = async (planData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.SAVE_POPULAR_TRAVEL_PLAN, {
    method: 'POST',
    body: JSON.stringify(planData)
  });
};

// 收藏/取消收藏旅行计划
export const toggleFavoritePlan = async (planId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.TOGGLE_FAVORITE_PLAN}/${planId}/toggle-favorite`, {
    method: 'POST'
  });
};

// 获取旅行计划详情
export const getPlanDetail = async (planId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GET_PLAN_DETAIL}/${planId}`, {
    method: 'GET'
  });
};

// 取消收藏路线
export const unfavoriteRoute = async (routeId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.UNFAVORITE_ROUTE}/${routeId}`, {
    method: 'DELETE'
  });
};

// 检查收藏状态
export const checkFavoriteStatus = async (routeId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHECK_FAVORITE_STATUS}/${routeId}/status`, {
    method: 'GET'
  });
};

// 获取我收藏的路线列表
export const getMyFavoriteRoutes = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_FAVORITE_ROUTES, {
    method: 'GET'
  });
};

// ═══════════════════════════════════════════════════════════════════
// AI聊天相关接口
// ═══════════════════════════════════════════════════════════════════

/**
 * 发送聊天消息
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @param {string} message - 消息内容
 * @returns {Promise} API响应
 */
export const sendChatMessage = async (userId, sessionId, message) => {
  // 优先将 userId 转为整型（如 '3' -> 3），但保留 guest_x 等字符串
  let normalizedUserId = userId;
  if (typeof userId === 'string') {
    const parsed = parseInt(userId, 10);
    if (!isNaN(parsed)) {
      normalizedUserId = parsed;
    }
  }

  const requestBody = {
    sessionId: sessionId,
    userId: normalizedUserId,  // 🔥 后端要求使用 userId（整型/驼峰命名）
    chatInput: message         // 🔥 后端要求使用 chatInput
  };
  
  console.log('📤 发送到后端的请求体:', JSON.stringify(requestBody, null, 2));
  
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_SEND, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
};

/**
 * 获取AI聊天历史记录
 * @param {string} sessionId - 会话ID
 * @returns {Promise} API响应
 */
export const getAIChatHistory = async (sessionId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_HISTORY}?sessionId=${sessionId}`, {
    method: 'GET'
  });
};

const parseTravelogueMarkdown = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return {
      title: '',
      summary: '',
      content: markdown || ''
    };
  }

  const titleMatch = markdown.match(/###\s*标题[:：]\s*(.+)\s*\n/);
  const summaryMatch = markdown.match(/###\s*摘要[:：]\s*([\s\S]*?)\n###\s*正文[:：]/);
  const bodyMatch = markdown.match(/###\s*正文[:：]\s*([\s\S]*)$/);

  const title = titleMatch ? titleMatch[1].trim() : '';
  const summary = summaryMatch ? summaryMatch[1].trim() : '';
  const content = bodyMatch ? bodyMatch[1].trim() : markdown.trim();

  return { title, summary, content };
};

export const streamGenerateTravelogue = async (options = {}) => {
  const { userId, destination = null, travelPlan = null, signal, onDelta } = options || {};
  if (!userId) {
    throw new Error('userId is required for travelogue generation');
  }
  if (!destination && !travelPlan) {
    throw new Error('destination or travelPlan is required');
  }

  const endpoint = API_CONFIG.ENDPOINTS.TRAVELOGUE_STREAM_GENERATE;
  const url = `${API_CONFIG.BASE_URL || ''}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const body = {
    userId: String(userId),
    destination: destination || undefined,
    travelPlan: travelPlan || undefined
  };
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined || body[key] === null) {
      delete body[key];
    }
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/json;q=0.9, text/plain;q=0.8',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `HTTP ${response.status}`);
  }

  let buffer = '';
  let liveContent = '';
  let fullMarkdown = '';

  const handleJsonMessage = (json) => {
    if (!json || json.role !== 'assistant' || json.content_type !== 'text') {
      return;
    }
    if (json.type !== 'answer') {
      return;
    }
    if (typeof json.content !== 'string') {
      return;
    }

    liveContent += json.content;
    if (typeof onDelta === 'function') {
      try {
        onDelta(liveContent);
      } catch (e) {
        console.error('onDelta 回调执行出错:', e);
      }
    }

    if (json.content.includes('### 标题') && json.content.includes('### 正文')) {
      fullMarkdown = json.content;
    }
  };

  const processBuffer = () => {
    let separatorIndex = buffer.indexOf('\n\n');
    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      const lines = rawEvent.split('\n');

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('event:') || trimmed.startsWith(':')) {
          return;
        }

        let dataStr = trimmed;
        if (trimmed.startsWith('data:')) {
          dataStr = trimmed.slice(5).trim();
        }

        if (!dataStr || dataStr === '[DONE]' || dataStr === '[done]' || dataStr === '[END]') {
          return;
        }

        try {
          const json = JSON.parse(dataStr);
          handleJsonMessage(json);
        } catch (e) {
          return;
        }
      });

      separatorIndex = buffer.indexOf('\n\n');
    }
  };

  if (response.body && response.body.getReader) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      processBuffer();
    }
  } else {
    const text = await response.text().catch(() => '');
    buffer += text;
    processBuffer();
  }

  const markdownToParse = fullMarkdown || liveContent;
  const parsed = parseTravelogueMarkdown(markdownToParse);

  return {
    title: parsed.title,
    summary: parsed.summary,
    content: parsed.content
  };
};

// AI润色游记内容 - 文本清洗工具
const cleanPolishOutput = (rawContent) => {
  if (!rawContent || typeof rawContent !== 'string') {
    return '';
  }

  let cleaned = rawContent;

  const finishIndex = cleaned.lastIndexOf('{"msg_type":"generate_answer_finish"');
  if (finishIndex !== -1) {
    cleaned = cleaned.slice(0, finishIndex);
  }

  const tailMarkers = [
    '润色一下文章的语言',
    '如何进一步突出',
    '请再为'
  ];

  tailMarkers.forEach((marker) => {
    const index = cleaned.lastIndexOf(marker);
    if (index !== -1 && index >= cleaned.length - 120) {
      cleaned = cleaned.slice(0, index);
    }
  });

  return cleaned.trim();
};

// AI润色游记内容
export const streamPolishTravelogue = async (options = {}) => {
  const { userId, existingTravelogue, signal, onDelta } = options || {};
  if (!userId) {
    throw new Error('userId is required for travelogue polishing');
  }
  if (!existingTravelogue) {
    throw new Error('existingTravelogue is required for polishing');
  }

  const endpoint = API_CONFIG.ENDPOINTS.TRAVELOGUE_STREAM_GENERATE;
  const url = `${API_CONFIG.BASE_URL || ''}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const body = {
    userId: String(userId),
    existingTravelogue: String(existingTravelogue)
  };

  console.log('🚀 发送AI润色请求:', {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/json;q=0.9, text/plain;q=0.8',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/json;q=0.9, text/plain;q=0.8',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `HTTP ${response.status}`);
  }

  let buffer = '';
  let fullContent = '';

  const processBuffer = () => {
    let separatorIndex = buffer.indexOf('\n\n');
    while (separatorIndex !== -1) {

      const rawEvent = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      const lines = rawEvent.split('\n');

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('event:') || trimmed.startsWith(':')) {
          return;
        }

        let dataStr = trimmed;
        if (trimmed.startsWith('data:')) {
          dataStr = trimmed.slice(5).trim();
        }

        if (!dataStr || dataStr === '[DONE]' || dataStr === '[done]' || dataStr === '[END]') {
          return;
        }

        try {
          const json = JSON.parse(dataStr);
          if (!json || json.role !== 'assistant' || json.content_type !== 'text') {
            return;
          }
          
          const content = json.content || '';
          fullContent += content;

          const cleanedFullContent = cleanPolishOutput(fullContent);
          
          if (onDelta) {
            onDelta(content, cleanedFullContent);
          }
        } catch (e) {
          return;
        }
      });

      separatorIndex = buffer.indexOf('\n\n');
    }
  };

  if (response.body && response.body.getReader) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      processBuffer();
    }
  } else {
    const text = await response.text().catch(() => '');
    buffer += text;
    processBuffer();
  }

  return cleanPolishOutput(fullContent);
};

// ==================== 通知相关API ====================

/**
 * 获取所有通知列表
 * @returns {Promise} API响应
 */
export const getNotificationList = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.NOTIFICATION_LIST, {
    method: 'GET'
  });
};

/**
 * 获取未读通知列表
 * @returns {Promise} API响应
 */
export const getUnreadNotifications = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.NOTIFICATION_UNREAD, {
    method: 'GET'
  });
};

/**
 * 按类型获取通知
 * @param {string} type - 通知类型 (COMMENT/FAVORITE/VIEW)
 * @returns {Promise} API响应
 */
export const getNotificationsByType = async (type) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.NOTIFICATION_BY_TYPE}/${type}`, {
    method: 'GET'
  });
};

/**
 * 获取通知统计信息
 * @returns {Promise} API响应
 */
export const getNotificationStats = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.NOTIFICATION_STATS, {
    method: 'GET'
  });
};

/**
 * 获取未读通知数量（用于角标）
 * @returns {Promise} API响应
 */
export const getUnreadNotificationCount = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.NOTIFICATION_UNREAD_COUNT, {
    method: 'GET'
  });
};

/**
 * 标记单条通知为已读
 * @param {number} notificationId - 通知ID
 * @returns {Promise} API响应
 */
export const markNotificationAsRead = async (notificationId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.NOTIFICATION_MARK_READ}/${notificationId}/read`, {
    method: 'PUT'
  });
};

/**
 * 标记所有通知为已读
 * @returns {Promise} API响应
 */
export const markAllNotificationsAsRead = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.NOTIFICATION_READ_ALL, {
    method: 'PUT'
  });
};

/**
 * 删除单条通知
 * @param {number} notificationId - 通知ID
 * @returns {Promise} API响应
 */
export const deleteNotification = async (notificationId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.NOTIFICATION_DELETE}/${notificationId}`, {
    method: 'DELETE'
  });
};

/**
 * 删除所有已读通知
 * @returns {Promise} API响应
 */
export const deleteAllReadNotifications = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.NOTIFICATION_DELETE_READ_ALL, {
    method: 'DELETE'
  });
};

// ==================== 用户反馈API ====================

/**
 * 提交用户反馈
 * @param {Object} feedbackData - 反馈数据
 * @param {string} feedbackData.type - 反馈类型 (建议/问题/体验/其他)
 * @param {number} feedbackData.score - 评分 (1-5，可选)
 * @param {string} feedbackData.title - 标题 (必填)
 * @param {string} feedbackData.detail - 详细描述 (必填)
 * @param {string} feedbackData.email - 联系邮箱 (可选)
 * @param {string} feedbackData.module - 所属模块 (可选)
 * @returns {Promise} API响应
 */
export const submitFeedback = async (feedbackData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.FEEDBACK_SUBMIT, {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
};

// 收藏景点 - 使用新的API格式
export const addAttractionFavorite = async (userId, spotData) => {
  // 🔧 新API格式：使用 application/x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('name', spotData.name);
  formData.append('lng', spotData.lng);
  formData.append('lat', spotData.lat);
  formData.append('icon', spotData.icon || 'attraction');
  formData.append('address', spotData.address || '');
  formData.append('rating', spotData.rating || '0');
  formData.append('distance', spotData.distance || '');
  
  console.log('📤 发送收藏请求:', {
    url: API_CONFIG.ENDPOINTS.ADD_ATTRACTION_FAVORITE,
    method: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    formData: Object.fromEntries(formData.entries())
  });
  
  return await apiRequest(API_CONFIG.ENDPOINTS.ADD_ATTRACTION_FAVORITE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // 保持其他默认headers，但覆盖Content-Type
    },
    body: formData.toString()
  });
};

// 取消收藏景点 - 使用新的API格式
export const removeAttractionFavorite = async (userId, spotData) => {
  const params = new URLSearchParams({
    name: spotData.name,
    lat: spotData.lat,
    lng: spotData.lng
  });
  
  console.log('📤 发送取消收藏请求:', {
    url: `${API_CONFIG.ENDPOINTS.REMOVE_ATTRACTION_FAVORITE}?${params.toString()}`,
    method: 'DELETE'
  });
  
  return await apiRequest(`${API_CONFIG.ENDPOINTS.REMOVE_ATTRACTION_FAVORITE}?${params.toString()}`, {
    method: 'DELETE'
  });
};

// 获取收藏景点总数 - 使用新的统计API
export const getAttractionFavoritesCount = async () => {
  // 🔧 新API不需要userId，从token中获取用户身份
  return await apiRequest(API_CONFIG.ENDPOINTS.COUNT_ATTRACTION_FAVORITES, {
    method: 'GET'
  });
};

// 检查景点收藏状态
export const checkAttractionFavoriteStatus = async (spotData) => {
  const params = new URLSearchParams({
    name: spotData.name,
    lat: spotData.lat,
    lng: spotData.lng
  });
  
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHECK_ATTRACTION_FAVORITE}?${params.toString()}`, {
    method: 'GET'
  });
};

// 获取用户收藏的景点列表 - 重写原有函数以支持新API
export const getUserAttractionFavorites = async (filters = {}) => {
  // 🔧 新API从token中获取用户身份，支持筛选
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const endpoint = params.toString() ? 
    `${API_CONFIG.ENDPOINTS.GET_ATTRACTION_FAVORITES}?${params}` : 
    API_CONFIG.ENDPOINTS.GET_ATTRACTION_FAVORITES;
    
  return await apiRequest(endpoint, {
    method: 'GET'
  });
};

// 获取当前用户ID（从用户信息中提取，必须是数字类型的 id/userId）
export const getCurrentUserId = async () => {
  try {
    const userProfile = await getUserProfile();
    console.log('🔍 getUserProfile 返回数据:', userProfile);

    if (userProfile && userProfile.code === 200 && userProfile.data) {
      // 只接受后端返回的 id/userId，且必须能转换为数字
      const rawId =
        userProfile.data.id !== undefined && userProfile.data.id !== null
          ? userProfile.data.id
          : userProfile.data.userId;

      if (rawId !== undefined && rawId !== null) {
        const numericId = Number(rawId);
        if (!Number.isNaN(numericId)) {
          console.log('✅ 成功获取用户标识(数字ID):', numericId);
          return numericId;
        }

        console.error('❌ 用户ID不是有效的数字:', rawId);
      } else {
        console.error('❌ 用户信息中缺少 id / userId 字段');
      }
    }

    throw new Error('无法获取用户ID - 需要数字类型的 id / userId');
  } catch (error) {
    console.error('获取用户ID失败:', error);
    throw error;
  }
};


// ==================== 聊天系统相关 API 函数 ====================

// ========== 好友管理 ==========

// 添加好友
export const addFriend = async (friendId, message = '', source = 'search') => {
  const userId = await getCurrentUserId();

  const numericFriendId = Number(friendId);
  if (Number.isNaN(numericFriendId)) {
    throw new Error('friendId 必须是数字类型');
  }

  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_ADD_FRIEND, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      friendId: numericFriendId,
      message,
      source
    })
  });
};

// 获取好友聊天/动态权限
export const getChatPermissions = async (friendId) => {
  if (!friendId) {
    throw new Error('friendId is required to get chat permissions');
  }

  const ownerId = await getCurrentUserId();
  const params = new URLSearchParams({
    ownerId: ownerId.toString(),
    targetUserId: friendId.toString()
  });

  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_GET_PERMISSIONS}?${params.toString()}`, {
    method: 'GET'
  });
};

// 设置好友聊天/动态权限
export const setChatPermissions = async (friendId, permissionLevel) => {
  if (!friendId) {
    throw new Error('friendId is required to set chat permissions');
  }
  if (!permissionLevel) {
    throw new Error('permissionLevel is required to set chat permissions');
  }

  const ownerId = await getCurrentUserId();
  const payload = {
    ownerId,
    targetUserId: friendId,
    permissionLevel
  };

  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_SET_PERMISSIONS, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

// 处理好友申请
export const handleFriendRequest = async (friendId, action, rejectReason = '') => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_HANDLE_FRIEND_REQUEST, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      friendId,
      action, // 'accept' 或 'reject'
      rejectReason
    })
  });
};

// 获取好友列表
export const getFriendsList = async () => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_GET_FRIENDS_LIST}?userId=${userId}`, {
    method: 'GET'
  });
};

// 获取好友申请列表
export const getFriendRequests = async () => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_GET_FRIEND_REQUESTS}?userId=${userId}`, {
    method: 'GET'
  });
};

// 搜索用户
export const searchUsers = async (keyword) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_SEARCH_USERS}?keyword=${encodeURIComponent(keyword)}`, {
    method: 'GET'
  });
};

// ========== 消息对话 ==========

// 发送消息
export const sendMessage = async (receiverId, messageType, content, replyToMessageId = null) => {
  const senderId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_SEND_MESSAGE, {
    method: 'POST',
    body: JSON.stringify({
      senderId,
      receiverId,
      messageType, // 'text', 'image', 'voice', 'video', 'file'
      content,
      replyToMessageId
    })
  });
};

// 发送文件消息
export const sendFileMessage = async (receiverId, messageType, file) => {
  const senderId = await getCurrentUserId();
  const formData = new FormData();
  formData.append('senderId', senderId);
  formData.append('receiverId', receiverId);
  formData.append('messageType', messageType);
  formData.append('file', file);
  
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_SEND_FILE_MESSAGE, {
    method: 'POST',
    headers: {
      // 不设置Content-Type，让浏览器自动设置multipart/form-data
    },
    body: formData
  });
};

// 获取聊天记录
export const getChatHistory = async (friendId, page = 1, size = 20) => {
  const userId = await getCurrentUserId();
  const params = new URLSearchParams({
    userId: userId.toString(),
    friendId: friendId.toString(),
    page: page.toString(),
    size: size.toString()
  });
  
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_GET_MESSAGE_HISTORY}?${params}`, {
    method: 'GET'
  });
};

// 搜索聊天记录
export const searchChatHistory = async (keyword, friendId = null, page = 1, size = 20) => {
  const userId = await getCurrentUserId();
  const params = new URLSearchParams({
    userId: userId.toString(),
    keyword: keyword,
    page: page.toString(),
    size: size.toString()
  });
  
  if (friendId) {
    params.append('friendId', friendId.toString());
  }
  
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_SEARCH_MESSAGES}?${params}`, {
    method: 'GET'
  });
};

// 获取会话列表
export const getConversationsList = async () => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_GET_CONVERSATIONS}?userId=${userId}`, {
    method: 'GET'
  });
};

// 撤回消息
export const recallMessage = async (messageId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_RECALL_MESSAGE}/${messageId}`, {
    method: 'POST'

  });
};

// 更新用户资料（昵称/性别）
export const updateUserProfile = async (profileData) => {
  // 仅允许更新非敏感字段
  const payload = {};
  if (typeof profileData?.username === 'string') payload.username = profileData.username;
  if (typeof profileData?.gender === 'string') payload.gender = profileData.gender;
  return await apiRequest(API_CONFIG.ENDPOINTS.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(payload)

  });
};

// 删除消息
export const deleteMessage = async (messageId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_DELETE_MESSAGE}/${messageId}`, {
    method: 'DELETE'
  });
};

// 创建活动
export const createActivity = async (activityData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_CREATE, {
    method: 'POST',
    body: JSON.stringify(activityData)
  });
};

// 发布活动
export const publishActivity = async (activityId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_PUBLISH}/${activityId}/publish`, {
    method: 'POST'
  });
};

// 上传活动媒体文件
export const uploadActivityMedia = async (file, mediaType = 'image') => {
  if (!file) {
    throw new Error('文件不能为空');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', mediaType);

  return await apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_MEDIA_UPLOAD, {
    method: 'POST',
    headers: {},
    body: formData
  });
};

// 获取同城活动
export const getLocalActivities = async () => {

  return await apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_LOCAL, {
    method: 'GET'
  });
};

// 获取推荐活动
export const getRecommendedActivities = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_RECOMMENDED, {
    method: 'GET'
  });
};

// 获取我的活动
export const getMyActivities = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_MY, {
    method: 'GET'
  });
};

// 按用户ID获取指定用户参与的活动列表（用于用户动态）
export const getUserParticipatedActivities = async (userId) => {
  if (!userId) {
    throw new Error('userId is required to get participated activities');
  }

  const params = new URLSearchParams({
    userId: userId.toString()
  });

  return await apiRequest(`${API_CONFIG.ENDPOINTS.GET_USER_PARTICIPATED_ACTIVITIES}?${params.toString()}`, {
    method: 'GET'
  });
};

// 获取活动详情
export const getActivityDetail = async (activityId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_DETAIL}/${activityId}`, {
    method: 'GET'
  });
};

// 报名参加活动
export const registerForActivity = async (activityId, registrationData) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_REGISTER}/${activityId}/register`, {
    method: 'POST',
    body: JSON.stringify(registrationData)
  });
};

// 退出活动
export const quitActivity = async (activityId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_QUIT}/${activityId}/quit`, {

    method: 'DELETE'
  });
};


// 获取活动参与者列表
export const getActivityParticipants = async (activityId) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_PARTICIPANTS}/${activityId}/participants`, {
    method: 'GET'
  });
};

// 获取待审核的参与者
export const getPendingParticipants = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.ACTIVITY_PARTICIPANTS_PENDING, {
    method: 'GET'
  });
};

// 审核参与者
export const approveParticipant = async (participantId, approve) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_PARTICIPANT_APPROVE}/${participantId}/approve?approve=${approve}`, {
    method: 'POST'
  });
};

// 举报活动
export const reportActivity = async (activityId, reason) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_REPORT}/${activityId}/report?reason=${encodeURIComponent(reason)}`, {
    method: 'POST'
  });
};

// 管理员审核活动
export const auditActivity = async (activityId, approve, reason = '') => {
  const params = new URLSearchParams({
    approve: approve.toString()
  });
  if (reason) {
    params.append('reason', reason);
  }
  
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_AUDIT}/${activityId}/audit?${params.toString()}`, {
    method: 'POST'
  });
};

// 获取待审核的活动（管理员）
export const getPendingActivities = async (page = 0, size = 10) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_ADMIN_PENDING}?page=${page}&size=${size}`, {

    method: 'GET'
  });
};

// 获取被举报的活动（管理员）
export const getReportedActivities = async (page = 0, size = 10) => {
  return await apiRequest(`${API_CONFIG.ENDPOINTS.ACTIVITY_ADMIN_REPORTED}?page=${page}&size=${size}`, {

    method: 'GET'
  });
};


// ========== 聊天设置 ==========

// 置顶聊天
export const pinConversation = async (targetId, targetType, isPinned) => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_PIN_CONVERSATION, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      targetId,
      targetType, // 'user' 或 'group'
      isPinned
    })
  });
};

// 消息免打扰
export const muteConversation = async (targetId, targetType, isMuted) => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_MUTE_CONVERSATION, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      targetId,
      targetType, // 'user' 或 'group'
      isMuted
    })
  });
};

// 上传聊天背景图片
export const uploadChatBackgroundImage = async (targetId, targetType, file) => {
  const userId = await getCurrentUserId();
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('targetId', targetId);
  formData.append('targetType', targetType);
  formData.append('backgroundImage', file);

  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_UPLOAD_BACKGROUND, {
    method: 'POST',
    body: formData,
    headers: {}
  });
};

// 设置聊天背景
export const setChatBackground = async (targetId, targetType, backgroundImage) => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_SET_BACKGROUND, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      targetId,
      targetType, // 'user' 或 'group'
      backgroundImage
    })
  });
};

// 清空聊天记录
export const clearChatMessages = async (friendId, clearType = 'all') => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_CLEAR_MESSAGES, {
    method: 'DELETE',
    body: JSON.stringify({
      userId,
      friendId,
      clearType // 'all', 'before_date', 'selected'
    })
  });
};

// 获取聊天设置
export const getChatSettings = async (targetId, targetType) => {
  const userId = await getCurrentUserId();
  const params = new URLSearchParams({
    userId: userId.toString(),
    targetId: targetId.toString(),
    targetType
  });
  
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_GET_SETTINGS}?${params}`, {

    method: 'GET'
  });
};

// ========== 群聊管理 ==========

// 创建群聊
export const createGroup = async (groupName, groupDescription, maxMembers, initialMembers) => {
  const creatorId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.GROUP_CREATE, {
    method: 'POST',
    body: JSON.stringify({
      creatorId,
      groupName,
      groupDescription,
      maxMembers,
      initialMembers
    })
  });
};

// 拉好友建群
export const createGroupWithFriends = async (groupName, friendIds) => {
  const creatorId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.GROUP_CREATE_WITH_FRIENDS, {
    method: 'POST',
    body: JSON.stringify({
      creatorId,
      groupName,
      friendIds
    })
  });
};

// 邀请用户入群
export const inviteUsersToGroup = async (groupId, userIds, inviteMessage = '') => {
  const inviterId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/invite`, {
    method: 'POST',
    body: JSON.stringify({
      inviterId,
      userIds,
      inviteMessage
    })
  });
};

// 获取群成员列表
export const getGroupMembers = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/members?userId=${userId}`, {
    method: 'GET'
  });
};

// 获取群成员头像（包含Base64头像）
export const getGroupMemberAvatars = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/member-avatars?userId=${userId}`, {
    method: 'GET'
  });
};

// 离开群聊
export const leaveGroup = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/leave`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
};

// 解散群聊
export const dismissGroup = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/disband?userId=${userId}`, {
    method: 'DELETE'
  });
};

// 获取我的群聊列表
export const getMyGroups = async () => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/my-groups?userId=${userId}`, {
    method: 'GET'
  });
};

// 获取群聊信息
export const getGroupInfo = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/info?userId=${userId}`, {
    method: 'GET'
  });
};

// 更新群聊信息
export const updateGroupInfo = async (groupId, groupName, groupDescription) => {
  const operatorId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/update`, {
    method: 'PUT',
    body: JSON.stringify({
      operatorId,
      groupName,
      groupDescription
    })
  });
};

// 发送群消息
export const sendGroupMessage = async (groupId, messageType, content, replyToMessageId = null) => {
  const senderId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/send-message`, {
    method: 'POST',
    body: JSON.stringify({
      senderId,
      messageType,
      content,
      replyToMessageId
    })
  });
};

// 获取群聊天记录
export const getGroupMessages = async (groupId, page = 1, size = 50) => {
  const userId = await getCurrentUserId();
  const params = new URLSearchParams({
    userId: userId.toString(),
    page: page.toString(),
    size: size.toString()
  });
  
  return await apiRequest(`/api/group/${groupId}/messages?${params}`, {
    method: 'GET'
  });
};

// 标记群消息已读
export const markGroupMessagesRead = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/mark-read`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
};

// 搜索群聊消息
export const searchGroupMessages = async (groupId, keyword, page = 1, size = 20) => {
  const userId = await getCurrentUserId();
  const params = new URLSearchParams({
    userId: userId.toString(),
    keyword: keyword,
    page: page.toString(),
    size: size.toString()
  });
  
  return await apiRequest(`/api/group/${groupId}/messages/search?${params}`, {
    method: 'GET'
  });
};

// 获取我的群聊邀请通知列表
export const getMyInvitations = async () => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/my-invitations?userId=${userId}`, {
    method: 'GET'
  });
};

// 标记邀请通知已读
export const markInvitationAsRead = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/invitations/${groupId}/read?userId=${userId}`, {
    method: 'POST'
  });
};

// 踢出群成员
export const kickGroupMember = async (groupId, targetUserId) => {
  const operatorId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/kick`, {
    method: 'POST',
    body: JSON.stringify({
      operatorId,
      targetUserId
    })
  });
};

// 设置群管理员
export const setGroupAdmin = async (groupId, targetUserId, isAdmin) => {
  const operatorId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/set-admin`, {
    method: 'POST',
    body: JSON.stringify({
      operatorId,
      targetUserId,
      isAdmin
    })
  });
};

// 上传群头像
export const uploadGroupAvatar = async (groupId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return await apiRequest(`/api/group/${groupId}/avatar`, {
    method: 'POST',
    body: formData,
    headers: {}
  });
};

// ========== 举报系统 ==========

// 举报用户
export const reportUser = async (reportedUserId, reportType, reportReason = '', reportEvidence = []) => {
  return await apiRequest(`/api/auth/users/${reportedUserId}/report`, {
    method: 'POST',
    body: JSON.stringify({
      reportType,
      reportReason,
      reportEvidence
    })
  });
};

// 举报消息
export const reportMessage = async (messageId, reportType, reportReason) => {
  const reporterId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_REPORT_MESSAGE, {
    method: 'POST',
    body: JSON.stringify({
      reporterId,
      messageId,
      reportType, // 'inappropriate', 'spam', 'harassment', 'violence'
      reportReason
    })
  });
};

// ========== 在线状态和已读回执 ==========

// 标记消息已读
export const markMessageRead = async (messageId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_MARK_MESSAGE_READ, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      messageId
    })
  });
};

// 按会话标记已读
export const markConversationRead = async (conversationId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_MARK_MESSAGE_READ, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      conversationId
    })
  });
};

// 按消息ID列表标记已读
export const markMessagesRead = async (messageIds = []) => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_MARK_MESSAGE_READ, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      messageIds
    })
  });
};

// 获取未读消息数量
export const getUnreadCount = async () => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_GET_UNREAD_COUNT}?userId=${userId}`, {
    method: 'GET'
  });
};

// 更新在线状态
export const updateOnlineStatus = async (isOnline) => {
  const userId = await getCurrentUserId();
  return await apiRequest(API_CONFIG.ENDPOINTS.CHAT_UPDATE_ONLINE_STATUS, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      isOnline
    })
  });
};

// 分享旅行计划给AI
export const shareTravelPlanToAI = async (travelPlanId, options = {}) => {
  const { userId, sessionId, message, purpose } = options;
  
  const requestBody = {};
  if (userId) requestBody.userId = userId;
  if (sessionId) requestBody.sessionId = sessionId;
  if (message) requestBody.message = message;
  if (purpose) requestBody.purpose = purpose; // 'discuss', 'optimize', 'question'
  
  const endpoint = `${API_CONFIG.ENDPOINTS.SHARE_TO_AI}/${travelPlanId}/share-to-ai`;
  return await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
};

// ==================== 群聊设置相关 API ====================

/**
 * 置顶群聊
 * @param {number} groupId - 群聊ID
 * @param {boolean} isPinned - 是否置顶
 * @returns {Promise} API响应
 */
export const pinGroup = async (groupId, isPinned) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GROUP_PIN}/${groupId}/settings/pin`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      isPinned
    })
  });
};

/**
 * 设置消息免打扰
 * @param {number} groupId - 群聊ID
 * @param {boolean} isDisturbFree - 是否免打扰
 * @returns {Promise} API响应
 */
export const setGroupDisturbFree = async (groupId, isDisturbFree) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GROUP_DISTURB_FREE}/${groupId}/settings/disturb-free`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      isDisturbFree
    })
  });
};

/**
 * 上传群聊背景图片
 * @param {number} groupId - 群聊ID
 * @param {File} file - 图片文件
 * @returns {Promise} API响应（包含imageUrl）
 */
export const uploadGroupBackground = async (groupId, file) => {
  const userId = await getCurrentUserId();
  const formData = new FormData();
  formData.append('backgroundImage', file);  // 参数名必须是 backgroundImage
  
  return await apiRequest(`/api/group/${groupId}/settings/background/upload?userId=${userId}`, {
    method: 'POST',
    body: formData,
    headers: {}  // FormData会自动设置Content-Type
  });
};

/**
 * 设置群聊背景
 * @param {number} groupId - 群聊ID
 * @param {string|null} backgroundUrl - 背景图片URL，传null表示清除背景
 * @returns {Promise} API响应
 */
export const setGroupBackground = async (groupId, backgroundUrl) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GROUP_SET_BACKGROUND}/${groupId}/settings/background`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      backgroundUrl
    })
  });
};

/**
 * 获取群聊背景
 * @param {number} groupId - 群聊ID
 * @returns {Promise} API响应
 */
export const getGroupBackground = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`/api/group/${groupId}/settings/background?userId=${userId}`, {
    method: 'GET'
  });
};

/**
 * 清空聊天记录
 * @param {number} groupId - 群聊ID
 * @returns {Promise} API响应
 */
export const clearGroupHistory = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GROUP_CLEAR_HISTORY}/${groupId}/settings/clear-history`, {
    method: 'POST',
    body: JSON.stringify({
      userId
    })
  });
};

/**
 * 举报群聊
 * @param {number} groupId - 群聊ID
 * @param {string} reportType - 举报类型: spam, fraud, pornography, violence, politics, harassment, other
 * @param {string} reportReason - 举报原因（10-500字符）
 * @param {Array<string>} evidenceUrls - 证据截图URL列表（可选）
 * @returns {Promise} API响应
 */
export const reportGroup = async (groupId, reportType, reportReason, evidenceUrls = []) => {
  const reporterId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GROUP_REPORT}/${groupId}/report`, {
    method: 'POST',
    body: JSON.stringify({
      reporterId,
      reportType,
      reportReason,
      evidenceUrls
    })
  });
};

/**
 * 获取群聊设置
 * @param {number} groupId - 群聊ID
 * @returns {Promise} API响应
 */
export const getGroupSettings = async (groupId) => {
  const userId = await getCurrentUserId();
  return await apiRequest(`${API_CONFIG.ENDPOINTS.GROUP_GET_SETTINGS}/${groupId}/settings?userId=${userId}`, {
    method: 'GET'
  });
};

export default API_CONFIG

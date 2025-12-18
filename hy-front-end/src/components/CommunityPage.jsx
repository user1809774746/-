import React, { useState, useEffect, useRef } from 'react';

import {
  getPublicPosts,
  addPostFavorite,
  removePostFavorite,
  getPostFavorites,
  searchPosts,
  getFriendsList,
  addFriend,
  searchUsers,
  getFriendRequests,
  getConversationsList,
  markConversationRead,
  getLocalActivities,
  getRecommendedActivities,
  getMyActivities,
  getActivityDetail,
  registerForActivity,
  quitActivity,
  reportActivity
} from '../api/config';
import friendRequestNotificationService from '../services/FriendRequestNotificationService';
import webSocketService, { MESSAGE_TYPES } from '../services/WebSocketService';
import ActivityCreatePage from './ActivityCreatePage';
import ActivityListItem from './ActivityListItem';
import ActivityDetailPage from './ActivityDetailPage';
import CommunityPageSkeleton from './CommunityPageSkeleton';
import AiEntryModal from './AiEntryModal';
// import AiFloatingButton from './AiFloatingButton';

const CommunityPage = ({
  onBack,
  onNavigateToDiscover,
  onNavigateToMine,
  onNavigateToPostDetail,
  onNavigateToChat,
  onNavigateToGroupChat,
  onNavigateToFriendRequests,
  onNavigateToUserCenter,
  onNavigateToEditor,
  activeTab,
  onTabChange,
  onNavigateToAi
}) => {

  // 使用从 App.jsx 传入的 activeTab 状态，如果没有则使用本地状态
  const [localActiveTab, setLocalActiveTab] = useState('posts');
  const currentActiveTab = activeTab || localActiveTab;
  const setActiveTab = onTabChange || setLocalActiveTab;
  const [showAiModal, setShowAiModal] = useState(false);
  
  // 旅行家精选相关状态
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postSearchKeyword, setPostSearchKeyword] = useState('');
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  

  // 搜索相关状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // 通讯录相关状态
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const [isUserSearching, setIsUserSearching] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);
  
  // 消息页提示框
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const showDialog = (message) => {
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setDialogMessage('');
  };
  
  // 活动相关状态

  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState(null);
  const [activeActivityTab, setActiveActivityTab] = useState('local'); // local, recommended, my
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  
  // 加载帖子数据（支持搜索 + 分页）
  const loadPosts = async (keyword, page = 1, append = false) => {

    const isFirstPage = !append || page === 1;

    try {
      if (isFirstPage) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      // 1️⃣ 获取帖子列表：有关键字则搜索，否则获取全部公开帖子
      let response;
      const trimmedKeyword = keyword && keyword.trim ? keyword.trim() : '';
      if (trimmedKeyword) {
        response = await searchPosts(trimmedKeyword, page, pageSize);
        setIsSearchingPosts(true);
      } else {
        response = await getPublicPosts({ page, pageSize });
        setIsSearchingPosts(false);
      }
      if (response.code === 200) {
        const data = response.data || {};
        // 只显示审核通过的帖子
        const allPosts = data.list || data.posts || [];
        const approvedPosts = allPosts.filter(post => post.status === 'published');
        
        console.log('📊 帖子统计:');
        console.log(`  - 总帖子数: ${allPosts.length}`);
        console.log(`  - 审核通过: ${approvedPosts.length}`);
        console.log(`  - 待审核/拒绝: ${allPosts.length - approvedPosts.length}`);
        
        // 标记是否为搜索结果，用于空状态文案
        setHasSearched(!!trimmedKeyword);

        // 2️⃣ 获取用户的收藏列表
        try {
          const favoritesResponse = await getPostFavorites();
          if (favoritesResponse.code === 200) {
            const favoritePostIds = new Set(
              (favoritesResponse.data.list || []).map(fav => fav.postId)
            );
            
            console.log('⭐ 用户收藏的帖子:', Array.from(favoritePostIds));
            
            // 3️⃣ 更新帖子的收藏状态
            const postsWithFavoriteStatus = approvedPosts.map(post => ({
              ...post,
              isFavorited: favoritePostIds.has(post.id)
            }));
            
            setPosts(prev => append ? [...prev, ...postsWithFavoriteStatus] : postsWithFavoriteStatus);
          } else {
            // 如果获取收藏列表失败，仍然显示帖子，但收藏状态可能不准确
            console.warn('⚠️ 获取收藏列表失败，收藏状态可能不准确');
            setPosts(prev => append ? [...prev, ...approvedPosts] : approvedPosts);
          }
        } catch (favErr) {
          console.warn('⚠️ 获取收藏列表失败:', favErr.message);
          // 如果收藏API调用失败，仍然显示帖子
          setPosts(prev => append ? [...prev, ...approvedPosts] : approvedPosts);
        }

        const totalPages = data.totalPages || 1;
        const nextPage = data.currentPage || page || 1;
        setCurrentPage(nextPage);
        setHasMorePosts(nextPage < totalPages);
      } else {
        throw new Error(response.message || '获取帖子失败');
      }
    } catch (err) {
      console.error('加载帖子失败:', err);
      setError(err.message);
      // 错误时显示空列表，不显示假数据
      if (!append) {
        setPosts([]);
      }
    } finally {
      if (isFirstPage) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // 处理帖子搜索
  const handlePostSearch = async () => {
    const keyword = postSearchKeyword.trim();
    setCurrentPage(1);
    setHasMorePosts(true);
    if (keyword) {
      await loadPosts(keyword, 1, false);
    } else {
      await loadPosts(undefined, 1, false);
    }
  };

  // 处理搜索输入回车
  const handlePostSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handlePostSearch();
    }
  };

  // 清空搜索
  const handleClearPostSearch = async () => {
    setPostSearchKeyword('');
    setCurrentPage(1);
    setHasMorePosts(true);
    setHasSearched(false);
    await loadPosts(undefined, 1, false);
  };
  
  // 处理搜索
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      // 如果搜索关键词为空，清空搜索结果并显示所有帖子
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      
      const response = await searchPosts(searchKeyword.trim());
      if (response.code === 200) {
        // 只显示审核通过的帖子
        const respData = response.data || {};
        const allResults = respData.list || respData.posts || [];
        const approvedResults = allResults.filter(post => post.status === 'published');
        
        // 获取收藏状态
        try {
          const favoritesResponse = await getPostFavorites();
          if (favoritesResponse.code === 200) {
            const favoritePostIds = new Set(
              (favoritesResponse.data.list || []).map(fav => fav.postId)
            );
            
            const resultsWithFavoriteStatus = approvedResults.map(post => ({
              ...post,
              isFavorited: favoritePostIds.has(post.id)
            }));
            
            setSearchResults(resultsWithFavoriteStatus);
          } else {
            setSearchResults(approvedResults);
          }
        } catch (favErr) {
          console.warn('⚠️ 获取收藏列表失败:', favErr.message);
          setSearchResults(approvedResults);
        }
        
        setHasSearched(true);
      } else {
        throw new Error(response.message || '搜索失败');
      }
    } catch (err) {
      console.error('搜索失败:', err);
      setError(err.message);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  // 处理搜索输入框回车事件
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // 处理收藏
  const handleFavorite = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // 🌟 乐观更新：先更新 UI
    const originalState = post.isFavorited;
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isFavorited: !post.isFavorited }
        : p
    ));

    try {
      let response;
      if (originalState) {
        // 当前是已收藏状态，执行取消收藏
        response = await removePostFavorite(postId);
      } else {
        // 当前是未收藏状态，执行添加收藏
        response = await addPostFavorite(postId, {
          favoriteCategory: 'general'
        });
      }
      
      if (response.code === 200) {
        console.log('✅ 收藏操作成功');
      } else {
        // API 返回失败，回滚状态
        console.error('❌ 收藏操作失败:', response.message);
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, isFavorited: originalState }
            : p
        ));
        alert('操作失败：' + response.message);
      }
    } catch (err) {
      console.error('❌ 收藏失败:', err);
      
      // 🌟 特殊处理：如果是唯一约束冲突，说明后端已经收藏了
      if (err.message && err.message.includes('constraint')) {
        console.warn('⚠️ 检测到约束冲突，可能是状态不同步');
        if (!originalState) {
          // 前端认为未收藏，但后端已收藏，保持为已收藏状态
          console.log('🔄 修正状态为已收藏');
          // UI 已经更新为已收藏，无需回滚
        } else {
          // 回滚状态
          setPosts(posts.map(p => 
            p.id === postId 
              ? { ...p, isFavorited: originalState }
              : p
          ));
          alert('操作失败，请刷新页面重试');
        }
      } else {
        // 其他错误，回滚状态
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, isFavorited: originalState }
            : p
        ));
        alert(err.message || '操作失败，请重试');
      }
    }
  };
  
  // 处理帖子卡片点击
  const handlePostClick = (post) => {
    if (onNavigateToPostDetail) {
      onNavigateToPostDetail(post, 'community-topics');
    }
  };

  const handlePostAuthorClick = (e, post) => {
    e.stopPropagation();
    if (!onNavigateToUserCenter || !post) return;

    const user = {
      id: post.publisherId,
      userId: post.publisherId,
      nickname: post.publisherNickname || '',
      username: post.publisherNickname || '',
      avatarUrl: post.publisherAvatarUrl || '',
      fromTopics: true
    };

    onNavigateToUserCenter(user);
  };
  

  // 加载好友申请数量
  const loadPendingRequestsCount = async () => {
    try {
      const response = await getFriendRequests();
      if (response.code === 200) {
        const pendingCount = (response.data || []).filter(req => req.status === 'pending').length;
        setPendingRequestsCount(pendingCount);
        friendRequestNotificationService.updatePendingCount(pendingCount);
      }
    } catch (err) {
      console.warn('获取好友申请数量失败:', err.message);
      // 如果接口未就绪，设置模拟数量
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        const mockCount = 2; // 模拟有2个待处理申请
        setPendingRequestsCount(mockCount);
        friendRequestNotificationService.updatePendingCount(mockCount);
      }
    }
  };
  
  // ==================== 通讯录相关函数 ====================
  
  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      setConversationsError(null);
      const response = await getConversationsList();
      if (response.code === 200) {
        const list = Array.isArray(response.data)
          ? response.data
          : (response.data && Array.isArray(response.data.list) ? response.data.list : []);
        setConversations(list);
      } else {
        throw new Error(response.message || '获取会话列表失败');
      }
    } catch (err) {
      console.error('加载会话列表失败:', err);
      setConversationsError(err.message);
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  const formatConversationPreview = (rawContent) => {
    if (!rawContent) return '暂无消息';

    const content = String(rawContent);
    const POST_PREFIX = '__POST_SHARE__';
    const ACTIVITY_PREFIX = '__ACTIVITY_SHARE__';
    const TRAVEL_PLAN_PREFIX = '__TRAVEL_PLAN_SHARE__';

    const isPostShare = content.startsWith(POST_PREFIX);
    const isActivityShare = content.startsWith(ACTIVITY_PREFIX);
    const isTravelPlanShare = content.startsWith(TRAVEL_PLAN_PREFIX);

    if (isPostShare || isActivityShare || isTravelPlanShare) {
      try {
        const prefix = isPostShare
          ? POST_PREFIX
          : isActivityShare
            ? ACTIVITY_PREFIX
            : TRAVEL_PLAN_PREFIX;

        const json = content.slice(prefix.length);
        const data = JSON.parse(json);
        const title = (data && (data.title || data.name || data.destination)) || '';
        const maxLen = 12;
        const shortTitle = title
          ? (title.length > maxLen ? title.slice(0, maxLen) + '…' : title)
          : '';

        if (isActivityShare) {
          return shortTitle
            ? `【活动链接】${shortTitle}`
            : '【活动链接】';
        }

        if (isTravelPlanShare) {
          return shortTitle
            ? `【行程链接】${shortTitle}`
            : '【行程链接】';
        }

        return shortTitle
          ? `【帖子链接】${shortTitle}`
          : '【帖子链接】';
      } catch (e) {
        return '【链接分享】';
      }
    }

    return content;
  };

  // 加载好友列表
  const loadFriends = async () => {
    try {
      setFriendsLoading(true);
      setFriendsError(null);
      
      const response = await getFriendsList();
      if (response.code === 200) {
        // 处理后端返回的数据结构，统一转换为前端期望的格式
        const friends = (response.data.list || response.data || []).map(friend => ({
          id: friend.userId || friend.id,
          nickname: friend.nickname || friend.username || '',
          phone: friend.phone,
          avatarUrl: friend.avatar || friend.avatarUrl,
          isOnline: friend.isOnline || false,
          lastActiveTime: friend.lastActiveTime || '未知'
        }));
        setFriends(friends);
      } else {
        throw new Error(response.message || '获取好友列表失败');
      }
    } catch (err) {
      console.error('加载好友列表失败:', err);
      setFriendsError(err.message);
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };
  
  // 搜索用户
  const handleUserSearch = async () => {
    if (!userSearchKeyword.trim()) {
      setUserSearchResults([]);
      return;
    }
    
    try {
      setIsUserSearching(true);
      const response = await searchUsers(userSearchKeyword.trim());
      if (response.code === 200) {
        // 处理后端返回的数据结构，统一转换为前端期望的格式
        const users = (response.data || []).map(user => ({
          id: user.userId,
          nickname: user.nickname || user.username || '',
          phone: user.phone,
          avatarUrl: user.avatar
        }));
        setUserSearchResults(users);
      } else {
        throw new Error(response.message || '搜索用户失败');
      }
    } catch (err) {
      console.error('搜索用户失败:', err);
      setUserSearchResults([]);
    } finally {
      setIsUserSearching(false);
    }
  };
  
  // 添加好友
  const handleAddFriend = async (friendId, message = '') => {
    try {
      const response = await addFriend(friendId, message, 'search');
      if (response.code === 200) {
        showDialog('好友申请已发送');
        setShowAddFriend(false);
        setUserSearchKeyword('');
        setUserSearchResults([]);
      } else {
        throw new Error(response.message || '发送好友申请失败');
      }
    } catch (err) {
      console.error('添加好友失败:', err);
      showDialog('添加好友失败：' + err.message);
    }
  };

  
  // 处理用户搜索输入框回车事件
  const handleUserSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUserSearch();
    }
  };
  
  const formatConversationTime = (timeStr) => {
    if (!timeStr) return '';
    const safeTime = typeof timeStr === 'string' ? timeStr.replace(' ', 'T') : timeStr;
    const date = new Date(safeTime);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const handleConversationClick = async (conversation) => {
    if (!onNavigateToChat) return;

    const friendData = {
      id: conversation.targetId,
      nickname: conversation.targetName || '',
      phone: '',
      avatarUrl: conversation.targetAvatar || null,
      isOnline: false,
      lastActiveTime: conversation.lastMessageTime || ''
    };

    if (conversation.conversationId) {
      try {
        await markConversationRead(conversation.conversationId);
        setConversations((prev) =>
          prev.map((item) =>
            item.conversationId === conversation.conversationId
              ? { ...item, unreadCount: 0 }
              : item
          )
        );
      } catch (err) {
        console.error('标记会话已读失败:', err);
      }
    }

    onNavigateToChat(friendData, conversation.conversationId || null);
  };
  

  // ==================== 活动相关函数 ====================
  
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
  const handleReportActivity = async (activityId) => {
    const reason = prompt('请输入举报原因：');
    if (!reason) return;
    
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
  

  // 加载帖子数据
  useEffect(() => {
    if (currentActiveTab === 'topics') {
      setCurrentPage(1);
      setHasMorePosts(true);
      setHasSearched(false);
      loadPosts(undefined, 1, false);
    }
  }, [currentActiveTab]);
  

  // 加载好友列表数据
  useEffect(() => {
    if (currentActiveTab === 'posts') {
      loadConversations();
      loadFriends();
      loadPendingRequestsCount();
    }
  }, [currentActiveTab]);

  // 监听好友申请数量变化
  useEffect(() => {
    const unsubscribe = friendRequestNotificationService.addListener((count) => {
      setPendingRequestsCount(count);
    });

    return unsubscribe;
  }, []);

  // 监听新消息，实时刷新会话列表
  useEffect(() => {
    const unsubscribeNewMessage = webSocketService.onMessage(
      MESSAGE_TYPES.NEW_MESSAGE,
      () => {
        if (currentActiveTab === 'posts') {
          loadConversations();
        }
      }
    );

    return () => {
      unsubscribeNewMessage && unsubscribeNewMessage();
    };
  }, [currentActiveTab]);

  // 话题列表无限滚动监听
  useEffect(() => {
    if (!hasMorePosts || isLoadingMore || loading || currentActiveTab !== 'topics') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          const keyword = postSearchKeyword.trim();
          const nextPage = currentPage + 1;
          if (hasMorePosts && !isLoadingMore && !loading) {
            loadPosts(keyword || undefined, nextPage, true);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const target = loadMoreRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
      observer.disconnect();
    };
  }, [hasMorePosts, isLoadingMore, loading, currentActiveTab, currentPage, postSearchKeyword]);

  const totalPosts = posts.length;
  
  // 加载活动数据
  useEffect(() => {
    if (currentActiveTab === 'events') {
      loadActivities();
    }
  }, [currentActiveTab, activeActivityTab]);


  // 🎨 初始加载时显示骨架屏
  const isInitialLoading = loading || friendsLoading || conversationsLoading || activityLoading;
  
  if (isInitialLoading && currentActiveTab === 'posts' && posts.length === 0) {
    return <CommunityPageSkeleton />;
  }
  if (isInitialLoading && currentActiveTab === 'contacts' && friends.length === 0 && conversations.length === 0) {
    return <CommunityPageSkeleton />;
  }
  if (isInitialLoading && currentActiveTab === 'events' && activities.length === 0) {
    return <CommunityPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {dialogVisible && (
        <div className="login-dialog-overlay">
          <div className="login-dialog">
            <div className="login-dialog-message">
              {dialogMessage}
            </div>
            <button
              type="button"
              className="login-dialog-button"
              onClick={hideDialog}
            >
              确定
            </button>
          </div>
        </div>
      )}
      {/* 背景图片 */}

      <div className="fixed inset-0 z-0">
        <img 
          src="/聊天背景3.jpg" 
          alt="消息背景" 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('背景图片加载失败');
            e.target.style.display = 'none';
          }}
        />
        {/* 上下渐变虚化遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
      </div>

      {/* 顶部导航栏 - 微信风格 */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-GuText" style={{ fontFamily: '宋体, SimSun, serif'}}>消息</h1>
          <button 
            onClick={() => setShowAddFriend(true)}
            className="text-GuText hover:text-GuText transition-colors"
          >
            <i className="fa-solid fa-search text-xl"></i>
          </button>
        </div>
      </div>

      {/* 内容区域 - 直接显示聊天列表 */}
      <div className="flex-1 pb-20 relative z-10">
        <div>
          {/* 新的好友申请提示 - 始终显示 */}
          <div 
            className="bg-white bg-white mt-3 w-[90%] ml-[5%] rounded-3xl border-b border-gray-200 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors opacity-80"
            onClick={() => onNavigateToFriendRequests && onNavigateToFriendRequests()}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3">
                {/* <i className="fa-solid fa-user-plus text-blue-600 text-xl"></i> */}
                <img src="/添加好友.png" className='w-8 h-8'/>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">新的好友申请</h3>
                <p className="text-sm text-gray-500">
                  {pendingRequestsCount > 0 ? `${pendingRequestsCount} 个待处理` : '暂无新申请'}
                </p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-GuText"></i>
          </div>

          {/* 群聊入口 */}
          <div 
            className="bg-white bg-white mt-3 w-[90%] ml-[5%] rounded-3xl border-b border-gray-200 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors opacity-80"
            onClick={() => onNavigateToGroupChat && onNavigateToGroupChat()}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor:"#A8B78C"}}>
                <i className="fa-solid fa-users text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">群聊</h3>
                <p className="text-sm text-gray-500">查看我的群聊</p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-GuText"></i>
          </div>

          {/* 好友列表 */}
          <div className="bg-white mt-3 w-[90%] ml-[5%] rounded-3xl border border-gray-200 opacity-80">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-medium text-gray-800">我的好友</span>
              {friendsLoading && (
                <span className="text-xs text-gray-400 flex items-center">
                  <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                  加载中...
                </span>
              )}
            </div>
            {friendsError ? (
              <div className="px-4 py-3 text-sm text-red-500 flex items-center justify-between">
                <span className="truncate">{friendsError}</span>
                <button
                  onClick={loadFriends}
                  className="ml-3 px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  重试
                </button>
              </div>
            ) : friends.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    className="w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-colors text-left"
                    onClick={() => onNavigateToChat && onNavigateToChat(friend, null)}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      {friend.avatarUrl ? (
                        <img
                          src={friend.avatarUrl}
                          alt={friend.nickname || friend.phone || ''}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 text-sm font-medium">
                          {friend.nickname
                            ? friend.nickname.charAt(0)
                            : friend.phone
                              ? friend.phone.charAt(friend.phone.length - 1)
                              : 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium text-gray-800 truncate">
                          {friend.nickname || friend.phone || '未知用户'}
                        </span>
                        <span className="ml-2 text-[11px] text-gray-400 flex-shrink-0">
                          {friend.lastActiveTime || ''}
                        </span>
                      </div>
                      {/* 在线状态已隐藏 */}
                      {/* <p className="text-xs text-gray-500">{friend.isOnline ? '在线' : '离线'}</p> */}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-4 text-sm text-gray-500">
                暂无好友，去添加一个吧~
              </div>
            )}
          </div>

          {/* 聊天列表（按需求已隐藏，不再在消息页展示历史记录） */}
          {/*
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-12 mt-3">
              <i className="fa-solid fa-spinner fa-spin text-gray-400 mr-2"></i>
              <span className="text-gray-500 text-sm">加载中...</span>
            </div>
          ) : conversationsError ? (
            <div className="px-4 py-12 text-center">
              <p className="text-red-500 text-sm mb-2">{conversationsError}</p>
              <button
                onClick={loadConversations}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                重试
              </button>
            </div>
          ) : conversations.length > 0 ? (
            <div className="bg-white mt-3 w-[90%] ml-[5%] border rounded-3xl opacity-80">
              {conversations.map((conversation) => {
                const lastMessageContent =
                  (conversation.lastMessage && conversation.lastMessage.content) || '暂无消息';
                const lastTime =
                  conversation.lastMessageTime ||
                  (conversation.lastMessage && conversation.lastMessage.sentTime) ||
                  '';
                const unread = conversation.unreadCount || 0;

                return (
                  <button
                    key={conversation.conversationId || `${conversation.chatType || 'user'}-${conversation.targetId}`}
                    className="w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 relative">
                      {conversation.targetAvatar ? (
                        <img
                          src={conversation.targetAvatar}
                          alt={conversation.targetName || ''}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-medium text-lg">
                          {conversation.targetName
                            ? conversation.targetName.charAt(0)
                            : 'U'}
                        </span>
                      )}
                      {!conversation.isMuted && unread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] leading-[18px] text-center bg-red-500 text-white rounded-full">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800 truncate">
                          {conversation.targetName || '未知用户'}
                        </span>
                        <span className="ml-2 text-xs text-gray-400 flex-shrink-0">
                          {formatConversationTime(lastTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {conversation.isMuted && (
                            <i className="fa-solid fa-bell-slash text-gray-400 text-xs mr-1"></i>
                          )}
                          {formatConversationPreview(lastMessageContent)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-12 text-center text-gray-500">
              <i className="fa-solid fa-comments text-4xl text-GuText mb-3"></i>
              <p className="text-sm">暂无聊天记录</p>
              <p className="text-xs mt-1">添加好友开始聊天吧</p>
            </div>
          )}
          */}
        </div>

        {/* 添加好友弹窗 */}
        {showAddFriend && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">搜索好友</h3>
                <button 
                  onClick={() => {
                    setShowAddFriend(false);
                    setUserSearchKeyword('');
                    setUserSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                  <i className="fa-solid fa-search text-gray-400 ml-3 mr-2"></i>
                  <input
                    type="text"
                    placeholder="搜索用户昵称或手机号..."
                    value={userSearchKeyword}
                    onChange={(e) => setUserSearchKeyword(e.target.value)}
                    onKeyPress={handleUserSearchKeyPress}
                    className="flex-1 py-3 px-2 text-sm text-gray-700 bg-transparent border-none outline-none"
                  />
                  <button
                    onClick={handleUserSearch}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isUserSearching ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                        搜索中
                      </>
                    ) : (
                      '搜索'
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-96">
                {userSearchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {userSearchResults.map((user) => (
                      <div key={user.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              {user.avatarUrl ? (
                                <img 
                                  src={user.avatarUrl} 
                                  alt={user.nickname || user.phone}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-blue-600 text-sm font-medium">
                                  {user.nickname ? user.nickname.charAt(0) : 
                                   user.phone ? user.phone.charAt(user.phone.length - 1) : 'U'}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {user.nickname || user.phone || '未知用户'}
                              </div>
                              {user.phone && (
                                <div className="text-xs text-gray-500">{user.phone}</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddFriend(user.id)}
                            className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                          >
                            添加
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fa-solid fa-search text-gray-300 text-2xl mb-2"></i>
                    <p className="text-gray-500">搜索用户添加为好友</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* <AiFloatingButton onNavigateToAi={onNavigateToAi} /> */}

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
      {/* 底部导航栏 */}
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
            onBack&&onBack()
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
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95" style={{color:"#724B10"}}
          onClick={() => {
            console.log('💬 导航到消息页面');
            //  onNavigateToCommunity&& onNavigateToCommunity();
          }}
        >
         <img className="w-10 h-10" src="/消息3.png"/>
          <span className="text-xs mb-1">消息</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
          onClick={() => {
            console.log('👤 导航到我的页面');
            onNavigateToMine && onNavigateToMine();
          }}
        >
          <img className="w-9 h-10" src="/我的页面3.png"/>
          <span className="text-xs mb-1">我的</span>
        </button>
      </div>
      
      </div>
      </div>
      </div>
  );
};

export default CommunityPage;

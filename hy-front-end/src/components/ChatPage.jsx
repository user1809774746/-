import React, { useState, useEffect, useRef } from 'react';
import { 
  getChatHistory, 
  sendMessage, 
  sendFileMessage, 
  markMessageRead,
  getChatSettings,
  pinConversation,
  muteConversation,
  setChatBackground,
  clearChatMessages,
  reportUser,
  reportMessage,
  getCurrentUserId,
  markConversationRead
} from '../api/config';
import webSocketService, { MESSAGE_TYPES } from '../services/WebSocketService';


const ChatPage = ({ 
  friend, 
  onBack, 
  onNavigateToSettings, 
  onNavigateToPostDetail, 
  onNavigateToActivityDetail, 
  onNavigateToUserCenter, 
  conversationId,
  onNavigateToTravelPlan
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // 聊天设置相关状态
  const [chatSettings, setChatSettingsState] = useState({
    isPinned: false,
    isMuted: false,
    backgroundImage: null
  });
  
  // UI状态
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 聊天背景样式：优先使用用户自定义背景，否则使用默认背景
  const hasCustomBackground = chatSettings && chatSettings.backgroundImage;
  const chatBackgroundStyle = hasCustomBackground
    ? {
        backgroundImage: `url(${chatSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }
    : {
        backgroundImage: `url(/消息背景.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      };

  // 调试：监控messages状态变化
  useEffect(() => {
    console.log('🔍 Messages状态更新:', {
      messageCount: messages.length,
      messages: messages
    });
  }, [messages]);

  // 滚动到底部
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 检查WebSocket服务是否可用
  const checkWebSocketAvailability = async () => {
    return new Promise(async (resolve) => {
      try {
        console.log('🔍 开始WebSocket诊断...');
        
        // 1. 检查用户ID
        const userId = await getCurrentUserId();
        console.log('👤 用户ID:', userId);
        if (!userId) {
          console.error('❌ 无法获取用户ID');
          resolve(false);
          return;
        }
        
        // 2. 构造WebSocket URL
        // 开发环境：强制使用 ws:// 协议，通过 Vite 代理连接到后端
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/api/ws/chat/native?userId=${userId}`;
        
        console.log('🔌 WebSocket连接信息:', {
          原始协议: window.location.protocol,
          WebSocket协议: protocol,
          主机: host,
          完整URL: wsUrl,
          当前页面: window.location.href
        });
        
        // 3. 测试直连后端（绕过代理）
        const directUrl = `wss://amapmcpserver.xyz/api/ws/chat/native?userId=${userId}`;
        console.log('🔗 同时测试直连后端:', directUrl);
        
        let proxyConnected = false;
        let directConnected = false;
        let testCompleted = false;
        
        // 测试代理连接
        const testWs = new WebSocket(wsUrl);
        
        // 测试直连
        const directWs = new WebSocket(directUrl);
        
        const timeout = setTimeout(() => {
          if (!testCompleted) {
            console.log('⏰ WebSocket连接测试超时');
            testWs.close();
            directWs.close();
            testCompleted = true;
            resolve(false);
          }
        }, 5000); // 5秒超时
        
        // 代理连接事件
        testWs.onopen = () => {
          console.log('✅ 代理WebSocket连接成功');
          proxyConnected = true;
          if (!testCompleted) {
            clearTimeout(timeout);
            testWs.close();
            directWs.close();
            testCompleted = true;
            resolve(true);
          }
        };
        
        testWs.onerror = (error) => {
          console.error('❌ 代理WebSocket连接失败:', error);
        };
        
        testWs.onclose = (event) => {
          console.log('🔌 代理WebSocket连接关闭:', event.code, event.reason);
        };
        
        // 直连事件
        directWs.onopen = () => {
          console.log('✅ 直连WebSocket连接成功');
          directConnected = true;
          if (!testCompleted && !proxyConnected) {
            console.log('⚠️ 代理失败但直连成功，建议检查Vite代理配置');
            clearTimeout(timeout);
            testWs.close();
            directWs.close();
            testCompleted = true;
            resolve(false); // 代理失败仍返回false
          }
        };
        
        directWs.onerror = (error) => {
          console.error('❌ 直连WebSocket连接失败:', error);
        };
        
        directWs.onclose = (event) => {
          console.log('🔌 直连WebSocket连接关闭:', event.code, event.reason);
        };
        
      } catch (err) {
        console.error('❌ WebSocket诊断失败:', err);
        resolve(false);
      }
    });
  };

  // 加载聊天记录
  const loadChatHistory = async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      }
      
      const response = await getChatHistory(friend.id, pageNum, 20);
      if (response.code === 200) {
        // 修复：后端直接返回数组，不是 data.list 结构
        const newMessages = Array.isArray(response.data) ? response.data : (response.data.list || []);
        
        console.log('📖 加载聊天历史成功:', {
          friendId: friend.id,
          messageCount: newMessages.length,
          messages: newMessages
        });
        
        // 修复：统一消息数据格式，确保字段名匹配
        const formattedMessages = newMessages.map(msg => {
          // 尝试从多种字段中解析 travelPlanId，以兼容不同后端实现
          let travelPlanId = msg.travelPlanId || msg.travel_plan_id;

          if (!travelPlanId && (msg.messageType === 'travel_plan' || msg.messageType === 'TRAVEL_PLAN')) {
            const rawExtra = msg.extra;
            if (rawExtra) {
              let parsedExtra = null;
              if (typeof rawExtra === 'string') {
                try {
                  parsedExtra = JSON.parse(rawExtra);
                } catch (e) {
                  // 解析失败则忽略，保持原样
                }
              } else if (typeof rawExtra === 'object') {
                parsedExtra = rawExtra;
              }

              if (parsedExtra && typeof parsedExtra === 'object') {
                travelPlanId =
                  parsedExtra.travelPlanId ||
                  parsedExtra.id ||
                  (parsedExtra.travelPlan && parsedExtra.travelPlan.id);
              }
            }
          }

          return {
            id: msg.messageId || msg.id,
            messageId: msg.messageId || msg.id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            messageType: msg.messageType || 'text',
            timestamp: msg.sentTime || msg.timestamp,
            sentTime: msg.sentTime || msg.timestamp,
            senderName: msg.senderName,
            isRead: msg.isRead || false,
            isRecalled: msg.isRecalled || false,
            travelPlanId: travelPlanId,
            extra: msg.extra
          };
        });
        
        console.log('📋 格式化后的消息:', formattedMessages);
        
        if (append) {
          setMessages(prev => [...formattedMessages.reverse(), ...prev]);
        } else {
          setMessages(formattedMessages.reverse());
          setTimeout(scrollToBottom, 100);
        }
        
        setHasMore(newMessages.length === 20);
        setPage(pageNum);
      } else {
        throw new Error(response.message || '获取聊天记录失败');
      }
    } catch (err) {
      console.error('加载聊天记录失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 加载聊天设置
  const loadChatSettings = async () => {
    try {
      const response = await getChatSettings(friend.id, 'user');
      if (response.code === 200) {
        setChatSettingsState(response.data || {});
      }
    } catch (err) {
      console.error('加载聊天设置失败:', err);
    }
  };

  // 发送文本消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;
    
    const messageContent = inputText.trim();
    setInputText('');
    setSending(true);
    
    try {
      // 1. 通过HTTP API发送消息（保存到数据库）
      const response = await sendMessage(
        friend.id, 
        'text', 
        messageContent, 
        replyingTo?.id
      );
      
      if (response.code === 200) {
        console.log('📨 消息发送成功，后端响应:', response);
        
        // 注意：不需要通过WebSocket再次发送
        // 因为HTTP API已经保存到数据库，后端会自动推送给接收者
        // 如果再通过WebSocket发送，会导致重复
        
        // 添加新消息到本地列表（乐观更新 - 仅发送者看到）
        // 添加空值检查，处理后端返回data为null的情况
        const messageId = response.data?.messageId || `temp_${Date.now()}`;
        const currentUserId = await getCurrentUserId();
        const senderId = response.data?.senderId || currentUserId;
        
        const newMessage = {
          id: messageId,
          senderId: senderId,
          receiverId: friend.id,
          messageType: 'text',
          content: messageContent,
          timestamp: new Date().toISOString(),
          isRead: false,
          replyToMessageId: replyingTo?.id
        };
        
        // 检查是否已存在，避免重复添加
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === messageId);
          if (exists) {
            console.log('⚠️ 发送的消息已存在，跳过添加:', messageId);
            return prev;
          }
          console.log('➕ 添加发送的消息到列表:', newMessage);
          return [...prev, newMessage];
        });
        setReplyingTo(null);
        setTimeout(scrollToBottom, 100);
      } else {
        throw new Error(response.message || '发送消息失败');
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      console.error('错误详情:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      alert('发送失败：' + err.message);
      setInputText(messageContent); // 恢复输入内容
    } finally {
      setSending(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      return;
    }
    
    setSending(true);
    
    try {
      let messageType = 'file';
      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      } else if (file.type.startsWith('audio/')) {
        messageType = 'voice';
      }
      
      const response = await sendFileMessage(friend.id, messageType, file);
      
      if (response.code === 200) {
        // 添加新消息到列表
        const messageId = response.data.messageId;
        const newMessage = {
          id: messageId,
          senderId: response.data.senderId,
          receiverId: friend.id,
          messageType,
          content: response.data.fileUrl,
          fileName: file.name,
          fileSize: file.size,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        
        // 检查是否已存在，避免重复添加
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === messageId);
          if (exists) {
            console.log('⚠️ 发送的文件消息已存在，跳过添加:', messageId);
            return prev;
          }
          console.log('➕ 添加文件消息到列表:', newMessage);
          return [...prev, newMessage];
        });
        setTimeout(scrollToBottom, 100);
      } else {
        throw new Error(response.message || '发送文件失败');
      }
    } catch (err) {
      console.error('发送文件失败:', err);
      alert('发送失败：' + err.message);
    } finally {
      setSending(false);
    }
    
    // 清空文件选择
    event.target.value = '';
  };

  // 处理回复消息
  const handleReplyMessage = (message) => {
    setReplyingTo(message);
  };

  // 取消回复
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // 举报消息
  const handleReportMessage = async (message) => {
    const reason = prompt('请输入举报原因：');
    if (reason && reason.trim()) {
      try {
        await reportMessage(message.id, 'inappropriate', reason);
        alert('举报已提交');
      } catch (err) {
        alert('举报失败：' + err.message);
      }
    }
  };

  // 处理输入框回车
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 渲染文本消息内部内容（包括帖子分享、活动分享、行程分享）
  const renderTextInner = (message) => {
    const content = message.content || '';
    const POST_PREFIX = '__POST_SHARE__';
    const ACTIVITY_PREFIX = '__ACTIVITY_SHARE__';
    const TRAVEL_PLAN_PREFIX = '__TRAVEL_PLAN_SHARE__';

    const isPostShare = typeof content === 'string' && content.startsWith(POST_PREFIX);
    const isActivityShare = typeof content === 'string' && content.startsWith(ACTIVITY_PREFIX);
    const isTravelPlanShare = typeof content === 'string' && content.startsWith(TRAVEL_PLAN_PREFIX);

    if (isPostShare || isActivityShare || isTravelPlanShare) {
      try {
        const prefix = isPostShare
          ? POST_PREFIX
          : isActivityShare
            ? ACTIVITY_PREFIX
            : TRAVEL_PLAN_PREFIX;

        const json = content.slice(prefix.length);
        const data = JSON.parse(json);

        // 行程分享卡片：复用现有旅行计划卡片渲染逻辑
        if (isTravelPlanShare) {
          const travelPlanId =
            message.travelPlanId ||
            data.travelPlanId ||
            data.id ||
            (data.travelPlan && data.travelPlan.id);

          const travelPlanMessage = {
            ...message,
            travelPlanId,
            extra: data,
          };

          return renderTravelPlanCard(travelPlanMessage);
        }

        const title = (data && data.title) || (isActivityShare ? '活动' : '帖子');
        const summary = (data && data.summary) || '';
        const showSummary = summary && summary !== title;

        // 活动分享卡片
        if (isActivityShare) {
          return (
            <div className="text-left">
              <div className="text-[11px] text-gray-400 mb-1 flex items-center">
                <i className="fa-solid fa-calendar-check text-green-400 mr-1"></i>
                <span>活动分享</span>
              </div>
              <div
                className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow max-w-sm"
                onClick={() => {
                  if (onNavigateToActivityDetail && data.activityId) {
                    onNavigateToActivityDetail(data.activityId);
                  }
                }}
              >
                {data.coverImage && (
                  <div className="w-full h-28 bg-gray-100 overflow-hidden">
                    <img
                      src={data.coverImage}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {title}
                  </div>
                  {showSummary && (
                    <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {summary}
                    </div>
                  )}
                  <div className="mt-2 text-[11px] text-gray-400">
                    <div>点击查看活动详情</div>
                    {data.activityId && (
                      <div className="mt-0.5">活动ID: {data.activityId}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // 帖子分享卡片（保留原有逻辑）
        return (
          <div className="text-left">
            <div className="text-[11px] text-gray-400 mb-1 flex items-center">
              <i className="fa-solid fa-paper-plane text-blue-400 mr-1"></i>
              <span>帖子分享</span>
            </div>
            <div
              className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow max-w-sm"
              onClick={() => {
                if (onNavigateToPostDetail && data.postId) {
                  onNavigateToPostDetail(data.postId);
                }
              }}
            >
              {data.coverImage && (
                <div className="w-full h-28 bg-gray-100 overflow-hidden">
                  <img
                    src={data.coverImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {title}
                </div>
                {showSummary && (
                  <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {summary}
                  </div>
                )}
                <div className="mt-2 text-[11px] text-gray-400">
                  <div>点击查看帖子详情</div>
                  {data.postId && (
                    <div className="mt-0.5">帖子ID: {data.postId}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      } catch (e) {
        return <span>{content}</span>;
      }
    }
    return <span>{content}</span>;
  };

  const isShareMessage = (message) => {
    const rawContent = message && message.content;
    if (!rawContent || typeof rawContent !== 'string') return false;
    return (
      rawContent.startsWith('__POST_SHARE__') ||
      rawContent.startsWith('__ACTIVITY_SHARE__') ||
      rawContent.startsWith('__TRAVEL_PLAN_SHARE__')
    );
  };

  const renderTravelPlanCard = (message) => {
    let cardData = null;

    if (message.extra) {
      if (typeof message.extra === 'string') {
        try {
          cardData = JSON.parse(message.extra);
        } catch (e) {
          console.error('解析旅行计划卡片 extra 失败:', e, message.extra);
        }
      } else if (typeof message.extra === 'object') {
        // 后端可能直接返回对象而不是字符串
        cardData = message.extra;
      }
    }

    const title = (cardData && (cardData.title || cardData.planTitle || cardData.name)) || '旅行计划';
    const destination = cardData && (cardData.destination || cardData.city || cardData.location);
    const travelDays = cardData && (cardData.travelDays || cardData.days || cardData.totalDays);
    const coverImageUrl = cardData && cardData.coverImageUrl;
    const startDate = cardData && cardData.startDate;
    const endDate = cardData && cardData.endDate;
    const createdBy = cardData && (cardData.createdBy || cardData.creatorName);

    const rawDateRange = cardData && (cardData.dateRange || cardData.date);
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '.');
    };

    const dateRangeText = startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : rawDateRange || null;

    const status = cardData && (cardData.status || cardData.planStatus);
    const getBgColor = (statusValue) => {
      if (statusValue === 'active') return 'bg-blue-100';
      if (statusValue === 'completed') return 'bg-gray-100';
      if (statusValue === 'pending') return 'bg-orange-100';
      return 'bg-orange-100';
    };

    // 兼容多种可能的ID来源
    const travelPlanId =
      message.travelPlanId ||
      (cardData && (
        cardData.travelPlanId ||
        cardData.id ||
        (cardData.travelPlan && cardData.travelPlan.id)
      ));

    const handleClick = () => {
      if (onNavigateToTravelPlan && travelPlanId) {
        onNavigateToTravelPlan(travelPlanId);
      } else {
        console.warn('点击旅行计划卡片但缺少 travelPlanId，无法跳转', {
          message,
          cardData,
        });
      }
    };

    return (
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow max-w-sm cursor-pointer"
        onClick={handleClick}
      >
        {/* 顶部信息区域 - 布局风格与首页我的旅行计划卡片一致 */}
        <div className={`${getBgColor(status)} p-3`}>
          <div className="text-[11px] text-gray-500 mb-1">旅行计划</div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-gray-800 text-base">
              {destination || title || '未命名行程'}
              {travelDays && (
                <span className="ml-1 text-sm text-gray-700">
                  {travelDays}天行程
                </span>
              )}
            </h3>
            <div className="flex flex-col items-end ml-2">
              {createdBy && (
                <span className="text-[11px] text-gray-500 mb-1">
                  由 {createdBy} 创建
                </span>
              )}
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                  status === 'active'
                    ? 'bg-blue-500 text-white'
                    : status === 'completed'
                    ? 'bg-gray-500 text-white'
                    : status === 'pending'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {status === 'completed' && '已结束'}
                {status === 'active' && '进行中'}
                {status === 'pending' && '未开始'}
                {!status && '待定'}
              </span>
            </div>
          </div>

          {dateRangeText && (
            <p className="text-gray-600 text-xs mt-1">
              {dateRangeText}
              {travelDays && ` · ${travelDays}天${Math.ceil(travelDays / 2)}晚`}
            </p>
          )}

          {cardData && Array.isArray(cardData.days) && cardData.days.length > 0 && (
            <p className="text-gray-600 text-xs mt-1">
              {cardData.days.length}个地点
            </p>
          )}
        </div>

        {/* 图片区域 - 旋转图片效果，与首页旅行计划卡片风格统一 */}
        {coverImageUrl && (
          <div className="p-3">
            <div className="h-20 rounded-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src={coverImageUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
              <div
                className="w-full h-20 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <i className="fa-solid fa-map-location-dot text-white text-2xl"></i>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染消息内容
  const renderMessageContent = (message) => {
    switch (message.messageType) {
      case 'text':
        return (
          <div className="bg-white p-3 rounded-lg shadow-sm max-w-sm break-words">
            {renderTextInner(message)}
          </div>
        );
      case 'image':
        return (
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <img 
              src={message.content} 
              alt="图片消息"
              className="max-w-xs max-h-64 rounded object-cover cursor-pointer"
              onClick={() => window.open(message.content, '_blank')}
            />
          </div>
        );
      case 'file':
        return (
          <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
            <div className="flex items-center">
              <i className="fa-solid fa-file text-gray-400 mr-2"></i>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {message.fileName || '文件'}
                </div>
                <div className="text-xs text-gray-500">
                  {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)}KB` : ''}
                </div>
              </div>
              <a 
                href={message.content} 
                download={message.fileName}
                className="ml-2 text-blue-500 hover:text-blue-600"
              >
                <i className="fa-solid fa-download"></i>
              </a>
            </div>
          </div>
        );
      case 'travel_plan':
        return renderTravelPlanCard(message);
      default:
        return (
          <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
            <span className="text-gray-500 text-sm">不支持的消息类型</span>
          </div>
        );
    }
  };

  // 初始化WebSocket连接
  useEffect(() => {
    // 用于保存清理函数
    let cleanup = null;
    
    const initWebSocket = async () => {
      try {
        const userId = await getCurrentUserId();
        console.log('🔌 初始化WebSocket连接，用户ID:', userId);
        
        // 跳过测试，直接连接（因为测试逻辑有问题）
        // TODO: 修复 checkWebSocketAvailability 测试逻辑
        console.log('⚠️ 跳过 WebSocket 可用性测试，直接连接...');
        
        await webSocketService.connect(userId);
        
        // 检查连接状态
        webSocketService.checkConnection();
        setWsConnected(true);
        
        // 注册消息处理器
        const unsubscribeNewMessage = webSocketService.onMessage(MESSAGE_TYPES.NEW_MESSAGE, (data) => {
          console.log('📨 收到WebSocket新消息:', data);
          
          // 后端现在返回完整字段：messageId, senderId, receiverId, timestamp等
          // 只处理与当前聊天对象相关的消息
          // 1. 好友发给我的消息: senderId=好友ID, receiverId=我的ID
          // 2. 我发给好友的消息: senderId=我的ID, receiverId=好友ID
          // 注意：使用 == 而不是 === 来兼容数字和字符串类型
          const isFromFriend = (data.senderId == friend?.id && data.receiverId == userId);
          const isToFriend = (data.senderId == userId && data.receiverId == friend?.id);
          
          console.log('🔍 消息过滤:', {
            isFromFriend,
            isToFriend,
            senderId: data.senderId,
            receiverId: data.receiverId,
            currentFriendId: friend?.id,
            currentUserId: userId
          });
          
          if (isFromFriend || isToFriend) {
            // 统一解析 travelPlanId，兼容不同字段名和 extra 中的嵌入信息
            let travelPlanId = data.travelPlanId || data.travel_plan_id;

            if (!travelPlanId && (data.messageType === 'travel_plan' || data.messageType === 'TRAVEL_PLAN')) {
              const rawExtra = data.extra;
              if (rawExtra) {
                let parsedExtra = null;
                if (typeof rawExtra === 'string') {
                  try {
                    parsedExtra = JSON.parse(rawExtra);
                  } catch (e) {
                    // ignore parse error
                  }
                } else if (typeof rawExtra === 'object') {
                  parsedExtra = rawExtra;
                }

                if (parsedExtra && typeof parsedExtra === 'object') {
                  travelPlanId =
                    parsedExtra.travelPlanId ||
                    parsedExtra.id ||
                    (parsedExtra.travelPlan && parsedExtra.travelPlan.id);
                }
              }
            }

            const newMessage = {
              id: data.messageId,
              senderId: data.senderId,
              receiverId: data.receiverId,
              messageType: data.messageType || 'text',
              content: data.content,
              timestamp: new Date(data.timestamp).toISOString(),
              isRead: data.isRead || false,
              senderName: data.senderName,
              travelPlanId: travelPlanId,
              extra: data.extra
            };
            
            console.log('✅ 消息通过过滤，添加到列表:', newMessage);
            
            // 检查消息是否已存在，避免重复添加
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                console.log('⚠️ 消息已存在，跳过添加:', newMessage.id);
                return prev;
              }
              console.log('➕ 添加新消息到列表:', newMessage);
              console.log('📊 当前消息列表长度:', prev.length, '→', prev.length + 1);
              console.log('📋 所有消息ID:', [...prev.map(m => m.id), newMessage.id]);
              return [...prev, newMessage];
            });
            setTimeout(scrollToBottom, 100);
            
            // 自动标记为已读
            if (data.messageId) {
              markMessageRead(data.messageId).catch(err => {
                console.error('标记消息已读失败:', err);
              });
            }
          } else {
            console.log('❌ 消息被过滤掉（不是当前聊天对象的消息）');
          }
        });
        
        const unsubscribeTypingStatus = webSocketService.onMessage(MESSAGE_TYPES.TYPING_STATUS, (data) => {
          console.log('📝 收到输入状态消息:', data);
          // TODO: 处理正在输入状态
          if (data.userId === friend?.id) {
            console.log(`${friend.nickname || friend.phone} 正在输入...`);
          }
        });
        
        const unsubscribeOnlineStatus = webSocketService.onMessage(MESSAGE_TYPES.FRIEND_ONLINE_STATUS, (data) => {
          console.log('🟢 收到在线状态消息:', data);
          // TODO: 更新好友在线状态
          if (data.userId === friend?.id) {
            console.log(`${friend.nickname || friend.phone} ${data.isOnline ? '上线' : '离线'}`);
          }
        });
        
        // 保存清理函数
        cleanup = () => {
          console.log('🧹 清理WebSocket消息处理器');
          unsubscribeNewMessage();
          unsubscribeTypingStatus();
          unsubscribeOnlineStatus();
        };
        
      } catch (err) {
        console.error('WebSocket初始化失败:', err);
        setWsConnected(false);
      }
    };
    
    if (friend) {
      initWebSocket();
    }
    
    // 组件卸载或friend变化时，清理消息处理器
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [friend]);

  // 初始化
  useEffect(() => {
    if (friend) {
      loadChatHistory();
      loadChatSettings();
    }
  }, [friend]);

  // 进入会话后按会话维度标记已读
  useEffect(() => {
    if (!conversationId) return;
    markConversationRead(conversationId).catch(err => {
      console.error('按会话标记已读失败:', err);
    });
  }, [conversationId]);

  const handleOpenUserCenter = () => {
    if (!onNavigateToUserCenter || !friend) return;

    console.log('📋 打开用户中心 - friend对象:', {
      friendId: friend.id,
      friendKeys: Object.keys(friend)
    });

    // UserCenterPage会自己调用API获取背景图片，这里只需要传递基本信息
    const user = {
      id: friend.id,
      userId: friend.id,
      nickname: friend.nickname || '',
      username: friend.nickname || friend.phone || '',
      avatarUrl: friend.avatarUrl || ''
      // 注意：不要带 fromTopics 标记，避免触发话题隐私限制
    };

    console.log('📤 传递给用户中心的user对象:', {
      userId: user.id
    });

    onNavigateToUserCenter(user);
  };

  const handleReportUser = async () => {
    if (!friend) return;

    const reasons = [
      { value: 'spam', label: '垃圾信息' },
      { value: 'abuse', label: '辱骂/人身攻击' },
      { value: 'fraud', label: '诈骗/欺诈' },
      { value: 'porn', label: '涉黄' },
      { value: 'harassment', label: '骚扰' },
      { value: 'fake_info', label: '虚假信息' },
      { value: 'other', label: '其他' }
    ];

    const input = prompt(
      '请选择举报原因：\n'
      + '1. 垃圾信息\n'
      + '2. 辱骂/人身攻击\n'
      + '3. 诈骗/欺诈\n'
      + '4. 涉黄\n'
      + '5. 骚扰\n'
      + '6. 虚假信息\n'
      + '7. 其他\n\n'
      + '请输入数字(1-7):'
    );

    if (!input || !['1', '2', '3', '4', '5', '6', '7'].includes(input)) {
      return;
    }

    const selectedReason = reasons[parseInt(input, 10) - 1];
    const description = prompt('请详细描述举报原因（可选）：') || '';

    try {
      const response = await reportUser(friend.id, selectedReason.value, description.trim());
      if (response && response.code === 200) {
        alert(response.message || '举报成功，我们会尽快处理');
      } else {
        throw new Error(response?.message || '举报失败');
      }
    } catch (err) {
      console.error('举报用户失败:', err);
      alert('举报失败：' + (err.message || '未知错误'));
    }
  };

  if (!friend) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <i className="fa-solid fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">未选择聊天对象</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3">
              <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
            </button>
            
            <div className="flex items-center">
              <div
                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 cursor-pointer"
                onClick={handleOpenUserCenter}
              >
                {friend.avatarUrl ? (
                  <img 
                    src={friend.avatarUrl} 
                    alt={friend.nickname}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-medium">
                    {friend.nickname ? friend.nickname.charAt(0) : 'U'}
                  </span>
                )}
              </div>
              
              <div>
                <h1 className="text-lg font-medium text-gray-800">
                  {friend.nickname || friend.phone || '未知用户'}
                </h1>
                {/* 在线状态与实时指示已隐藏 */}
                {/*
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{friend.isOnline ? '在线' : '离线'}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-1 ${wsConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs">{wsConnected ? '实时' : 'HTTP'}</span>
                  </div>
                </div>
                */}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
            </button>
            
            {/* 更多菜单 */}
            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onNavigateToSettings && onNavigateToSettings();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <i className="fa-solid fa-cog mr-2"></i>
                  聊天设置
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    // TODO: 清空聊天记录
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <i className="fa-solid fa-trash mr-2"></i>
                  清空记录
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    // TODO: 举报用户
                    handleReportUser();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  <i className="fa-solid fa-flag mr-2"></i>
                  举报
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        style={chatBackgroundStyle}
      >
        {/* 上下渐变虚化遮罩 - 让背景边缘更柔和 */}
        <div className="fixed inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/30 pointer-events-none z-0"></div>
        
        {/* 消息内容层 */}
        <div className="relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <i className="fa-solid fa-spinner fa-spin text-gray-400 mr-2"></i>
            <span className="text-gray-500">加载中...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <i className="fa-solid fa-exclamation-triangle text-red-400 text-2xl mb-2"></i>
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={() => loadChatHistory()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        ) : messages.length > 0 ? (
          <>
            {/* 加载更多 */}
            {hasMore && (
              <div className="text-center py-2">
                <button 
                  onClick={() => loadChatHistory(page + 1, true)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                >
                  加载更多消息
                </button>
              </div>
            )}

            {/* 消息列表 */}
            {messages.map((message) => {
              const fromFriend = message.senderId === friend.id;
              const shareMsg = message.messageType === 'text' && isShareMessage(message);

              return (
                <div
                  key={message.id}
                  className={`flex opacity-80 ${fromFriend ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[70%] ${fromFriend ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    {/* 头像 */}
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {fromFriend ? (
                        friend.avatarUrl ? (
                          <img
                            src={friend.avatarUrl}
                            alt={friend.nickname}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 text-xs">
                            {friend.nickname ? friend.nickname.charAt(0) : 'U'}
                          </span>
                        )
                      ) : (
                        <span className="text-blue-600 text-xs">我</span>
                      )}
                    </div>

                    {/* 消息内容 */}
                    <div className={fromFriend ? '' : 'text-right'}>
                      <div
                        className={`inline-block rounded-lg shadow-sm relative group cursor-pointer ${
                          fromFriend || shareMsg ? 'bg-white' : 'bg-blue-500 text-white'
                        }`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          // TODO: 显示消息操作菜单
                        }}
                      >
                        {fromFriend ? (
                          renderMessageContent(message)
                        ) : message.messageType === 'travel_plan' ? (
                          <div className="p-2 max-w-xs">
                            {renderTravelPlanCard(message)}
                          </div>
                        ) : (
                          <div className="p-3 max-w-sm break-words">
                            {message.messageType === 'text'
                              ? renderTextInner(message)
                              : message.content}
                          </div>
                        )}

                        {/* 消息操作按钮 */}
                        <div className="absolute top-0 right-0 transform translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center space-x-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                            <button
                              onClick={() => handleReplyMessage(message)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="回复"
                            >
                              <i className="fa-solid fa-reply text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleReportMessage(message)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="举报"
                            >
                              <i className="fa-solid fa-flag text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-xs text-gray-500 mt-1 ${fromFriend ? 'text-left' : 'text-right'}`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center py-12">
            <i className="fa-solid fa-comment text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">暂无聊天记录</p>
            <p className="text-sm text-gray-400 mt-2">发送第一条消息开始聊天吧</p>
          </div>
        )}
        </div>
      </div>

      {/* 回复预览 */}
      {replyingTo && (
        <div className="bg-gray-100 px-4 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fa-solid fa-reply text-gray-400 mr-2"></i>
              <span className="text-sm text-gray-600">
                回复: {replyingTo.content.substring(0, 30)}...
              </span>
            </div>
            <button 
              onClick={handleCancelReply}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          {/* 附件按钮 */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600"
            disabled={sending}
          >
            <i className="fa-solid fa-paperclip text-xl"></i>
          </button>
          
          {/* 输入框 */}
          <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 min-h-[40px] max-h-32">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="w-full p-3 bg-transparent border-none outline-none resize-none"
              rows={1}
              style={{ minHeight: '40px' }}
              disabled={sending}
            />
          </div>
          
          {/* 发送按钮 */}
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || sending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
          </button>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};

export default ChatPage;

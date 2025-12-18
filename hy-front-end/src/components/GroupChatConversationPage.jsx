import React, { useState, useEffect, useRef } from 'react';
import { 
  getGroupMessages, 
  searchGroupMessages,
  getGroupMembers,
  getGroupMemberAvatars,
  getGroupInfo,
  markGroupMessagesRead,
  getCurrentUserId,
  getGroupBackground
} from '../api/config';
import webSocketService, { MESSAGE_TYPES } from '../services/WebSocketService';

const GroupChatConversationPage = ({ group, onBack, onNavigateToDetail }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // 分页和搜索
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  // 群聊信息
  const [groupInfo, setGroupInfo] = useState(group);
  const [members, setMembers] = useState([]);
  const [memberAvatars, setMemberAvatars] = useState({});  // userId -> {avatar, nickname}
  
  // 群聊背景
  const [chatBackground, setChatBackground] = useState(null);
  
  // 居中提示框
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
  
  const messagesEndRef = useRef(null);

  const messagesTopRef = useRef(null);
  const fileInputRef = useRef(null);

  // 滚动到底部
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 初始化当前用户ID和加载数据
  useEffect(() => {
    const init = async () => {
      try {
        const userId = await getCurrentUserId();
        setCurrentUserId(userId);
        
        // 加载群成员、头像和背景
        await Promise.all([
          loadMembers(),
          loadMemberAvatars(),
          loadMessages(),
          loadGroupBackground()
        ]);
      } catch (err) {
        console.error('初始化失败:', err);
      }
    };
    
    init();
  }, [group.groupId]);

  // 加载群聊信息
  const loadGroupInfo = async () => {
    try {
      const response = await getGroupInfo(group.groupId);
      if (response.code === 200) {
        setGroupInfo(response.data);
      }
    } catch (err) {
      console.error('加载群聊信息失败:', err);
    }
  };

  // 加载群成员头像
  const loadMemberAvatars = async () => {
    try {
      console.log('🖼️ 正在加载群成员头像...');
      const response = await getGroupMemberAvatars(group.groupId);
      console.log('📋 群成员头像响应:', response);
      
      if (response.code === 200) {
        const avatarData = response.data || [];
        console.log('✅ 头像数据:', avatarData);
        
        // 创建 userId -> {avatar, nickname, username} 的映射
        const avatarMap = {};
        avatarData.forEach(member => {
          avatarMap[member.userId] = {
            avatar: member.avatar,
            nickname: member.groupNickname || member.nickname || member.username,
            username: member.username,
            memberRole: member.memberRole
          };
        });
        
        console.log('✅ 头像映射创建完成:', avatarMap);
        setMemberAvatars(avatarMap);
      }
    } catch (err) {
      console.error('❌ 加载群成员头像失败:', err);
    }
  };

  // 加载群成员
  const loadMembers = async () => {
    try {
      const response = await getGroupMembers(group.groupId);
      console.log('📋 群成员列表响应:', response);
      
      if (response.code === 200) {
        const membersData = response.data || [];
        console.log('✅ 群成员数据:', membersData);
        
        // 打印第一个成员的数据结构用于调试
        if (membersData.length > 0) {
          console.log('📝 第一个成员的数据结构:', membersData[0]);
        }
        
        setMembers(membersData);
      }
    } catch (err) {
      console.error('❌ 加载群成员失败:', err);
    }
  };

  // 加载群聊背景
  const loadGroupBackground = async () => {
    try {
      console.log('🎨 正在加载群聊背景...');
      const response = await getGroupBackground(group.groupId);
      console.log('🎨 群聊背景响应:', response);
      
      if (response.code === 200 && response.data) {
        const backgroundUrl = response.data.chatBackground;
        if (backgroundUrl) {
          console.log('✅ 成功获取背景URL:', backgroundUrl);
          setChatBackground(backgroundUrl);
        } else {
          console.log('ℹ️ 未设置群聊背景，使用默认背景');
          setChatBackground(null);
        }
      }
    } catch (err) {
      console.error('❌ 加载群聊背景失败:', err);
      setChatBackground(null);
    }
  };

  // 加载群聊天记录
  const loadMessages = async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const response = await getGroupMessages(group.groupId, pageNum, 20);
      console.log('📖 加载群聊天记录响应:', response);
      
      if (response.code === 200) {
        const messagesData = Array.isArray(response.data) ? response.data : (response.data.list || []);
        
        // 格式化消息
        const formattedMessages = messagesData.map(msg => ({
          messageId: msg.messageId || msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName || `用户${msg.senderId}`,
          senderAvatar: msg.senderAvatar,
          groupId: msg.groupId,
          messageType: msg.messageType || 'text',
          content: msg.content,
          mediaUrl: msg.mediaUrl,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          sentTime: msg.sentTime || msg.timestamp,
          status: msg.status || 'sent',
          replyToMessageId: msg.replyToMessageId
        }));
        
        // 后端返回的是倒序（最新在前），需要反转成正序（旧消息在上）
        const orderedMessages = formattedMessages.reverse();
        
        if (append) {
          // 加载更多时，在前面插入旧消息
          setMessages(prev => [...orderedMessages, ...prev]);
        } else {
          // 首次加载
          setMessages(orderedMessages);
          setTimeout(scrollToBottom, 100);
        }
        
        // 检查是否还有更多消息
        setHasMore(messagesData.length === 20);
        setPage(pageNum);
        
        // 标记消息已读
        if (!append) {
          await markGroupMessagesRead(group.groupId);
        }
      } else {
        throw new Error(response.message || '获取群聊天记录失败');
      }
    } catch (err) {
      console.error('加载群聊天记录失败:', err);
      setError(err.message || '加载失败，请重试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // 加载更多消息
  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || isSearching) return;
    
    console.log('📜 加载更多消息, 当前页:', page);
    await loadMessages(page + 1, true);
  };
  
  // 搜索消息
  const handleSearch = async (keyword) => {
    if (!keyword || !keyword.trim()) {
      // 清空搜索，重新加载消息
      setIsSearching(false);
      setSearchKeyword('');
      await loadMessages(1, false);
      return;
    }
    
    try {
      setLoading(true);
      setIsSearching(true);
      setSearchKeyword(keyword.trim());
      
      const response = await searchGroupMessages(group.groupId, keyword.trim(), 1, 50);
      console.log('🔍 搜索消息响应:', response);
      
      if (response.code === 200) {
        const messagesData = Array.isArray(response.data) ? response.data : (response.data.list || []);
        
        const formattedMessages = messagesData.map(msg => ({
          messageId: msg.messageId || msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName || `用户${msg.senderId}`,
          senderAvatar: msg.senderAvatar,
          groupId: msg.groupId,
          messageType: msg.messageType || 'text',
          content: msg.content,
          mediaUrl: msg.mediaUrl,
          sentTime: msg.sentTime || msg.timestamp,
          status: 'sent'
        }));
        
        setMessages(formattedMessages.reverse());
        setHasMore(false); // 搜索模式下不支持加载更多
      } else {
        throw new Error(response.message || '搜索失败');
      }
    } catch (err) {
      console.error('搜索消息失败:', err);
      showDialog('搜索失败: ' + err.message);

    } finally {
      setLoading(false);
    }
  };

  // WebSocket连接和消息监听
  useEffect(() => {
    if (!currentUserId) return;

    const connectWebSocket = async () => {
      try {
        // 连接WebSocket
        if (!webSocketService.isConnected) {
          await webSocketService.connect(currentUserId);
        }
        
        // 加入群组房间
        webSocketService.joinGroup(group.groupId);
        
        // 监听新群消息
        const unsubscribeNewMessage = webSocketService.onMessage(
          MESSAGE_TYPES.NEW_GROUP_MESSAGE,
          (response) => {
            console.log('📨 收到新群消息原始数据:', response);
            
            // 添加 null 检查，支持两种数据格式
            // 格式1: { data: { messageId, content, ... } }  - 标准WebSocket响应
            // 格式2: { messageId, content, ... }            - 直接的消息数据
            const messageData = response?.data || response;
            
            if (!messageData) {
              console.error('❌ 无效的消息数据');
              return;
            }
            
            console.log('✅ 解析后的消息数据:', messageData);
            
            // 只处理当前群的消息
            if (messageData.groupId === group.groupId) {
              const newMessage = {
                messageId: messageData.messageId,
                senderId: messageData.senderId,
                senderName: messageData.senderName || '未知用户',
                senderAvatar: messageData.senderAvatar || null,
                groupId: messageData.groupId,
                messageType: messageData.messageType || 'text',
                content: messageData.content,  // ✅ 使用 content 而不是 message
                sentTime: messageData.sentTime,
                status: 'sent'
              };
              
              console.log('✅ 添加新消息到列表:', newMessage);
              setMessages(prev => [...prev, newMessage]);
              setTimeout(scrollToBottom, 100);
              
              // 标记已读
              markGroupMessagesRead(group.groupId);
            } else {
              console.log('⏭️ 跳过其他群的消息, 当前群:', group.groupId, '消息群:', messageData.groupId);
            }
          }
        );
        
        // 监听消息发送成功
        const unsubscribeSendSuccess = webSocketService.onMessage(
          MESSAGE_TYPES.SEND_MESSAGE_SUCCESS,
          (response) => {
            const data = response?.data || response;
            console.log('✅ 消息发送成功:', data);
            
            if (!data) {
              console.error('❌ 无效的发送成功响应');
              return;
            }
            
            // 更新本地消息状态
            if (data.groupId === group.groupId) {
              setMessages(prev => prev.map(msg => 
                msg.status === 'sending' && msg.content === data.content
                  ? { ...msg, messageId: data.messageId, status: 'sent', sentTime: data.sentTime }
                  : msg
              ));
            }
          }
        );
        
        // 监听错误消息
        const unsubscribeError = webSocketService.onMessage(
          MESSAGE_TYPES.ERROR,
          (response) => {
            const data = response?.data || response;
            console.error('❌ WebSocket错误:', response);
            
            // 错误消息可能在 message 字段或直接在 data 中
            const errorMsg = data?.message || response?.message || '操作失败';
            showDialog(errorMsg);

          }
        );
        
        // 清理函数
        return () => {
          webSocketService.leaveGroup(group.groupId);
          unsubscribeNewMessage();
          unsubscribeSendSuccess();
          unsubscribeError();
        };
      } catch (err) {
        console.error('WebSocket连接失败:', err);
      }
    };
    
    connectWebSocket();
  }, [currentUserId, group.groupId]);

  // 初始化加载
  useEffect(() => {
    loadMessages();
    loadGroupInfo();
    loadMembers();
  }, [group.groupId]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;
    
    const messageContent = inputText.trim();
    setInputText('');
    setSending(true);
    
    try {
      // 添加临时消息到列表（乐观更新）
      const tempMessage = {
        messageId: Date.now(),
        senderId: currentUserId,
        senderName: '我',
        groupId: group.groupId,
        messageType: 'text',
        content: messageContent,
        sentTime: new Date().toISOString(),
        status: 'sending'
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setTimeout(scrollToBottom, 100);
      
      // 通过WebSocket发送消息
      const success = webSocketService.sendGroupMessage(
        group.groupId,
        'text',
        messageContent
      );
      
      if (!success) {
        // WebSocket发送失败，回退消息
        setMessages(prev => prev.filter(msg => msg.messageId !== tempMessage.messageId));
        showDialog('发送失败，请检查网络连接');

      }
    } catch (err) {
      console.error('发送群消息失败:', err);
      showDialog('发送失败：' + err.message);

    } finally {
      setSending(false);
    }
  };

  // 跳转到群聊详情页
  const handleNavigateToDetail = () => {
    if (onNavigateToDetail) {
      onNavigateToDetail(group);
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
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
      {/* 顶部导航栏 */}

      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center flex-1">
            <button onClick={onBack} className="mr-3">
              <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-800">{groupInfo.groupName}</h1>
              <p className="text-xs text-gray-500">
                {groupInfo.currentMembers}位成员
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="搜索消息"
            >
              <i className="fa-solid fa-magnifying-glass text-xl text-gray-600"></i>
            </button>
            <button 
              onClick={handleNavigateToDetail}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="群聊详情"
            >
              <i className="fa-solid fa-ellipsis-vertical text-xl text-gray-600"></i>
            </button>
          </div>
        </div>
        
        {/* 搜索栏 */}
        {showSearchBar && (
          <div className="px-4 pb-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                placeholder="搜索消息..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchKeyword);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleSearch(searchKeyword)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                搜索
              </button>
              {isSearching && (
                <button
                  onClick={() => handleSearch('')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                >
                  清除
                </button>
              )}
            </div>
            {isSearching && (
              <div className="mt-2 text-xs text-blue-600">
                搜索结果: "{searchKeyword}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: chatBackground ? `url('${chatBackground}')` : 'url(/消息背景.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
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
              onClick={loadMessages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        ) : messages.length > 0 ? (
          <>
            {/* 加载更多按钮 */}
            {!isSearching && hasMore && (
              <div className="flex justify-center mb-4" ref={messagesTopRef}>
                <button
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      加载中...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-arrow-up mr-2"></i>
                      加载更多历史消息
                    </>
                  )}
                </button>
              </div>
            )}
            
            {messages.map((msg, index) => {
              const isMyMessage = msg.senderId === currentUserId;
              
              return (
                <div 
                  key={msg.messageId || index}
                  className={`flex mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMyMessage && (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      {(memberAvatars[msg.senderId]?.avatar || msg.senderAvatar) ? (
                        <img 
                          src={memberAvatars[msg.senderId]?.avatar || msg.senderAvatar} 
                          alt={memberAvatars[msg.senderId]?.nickname || msg.senderName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-medium text-sm">
                          {(memberAvatars[msg.senderId]?.nickname || msg.senderName || '用户').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMyMessage && (
                      <span className="text-xs text-gray-500 mb-1">
                        {memberAvatars[msg.senderId]?.nickname || msg.senderName || `用户${msg.senderId}`}
                      </span>
                    )}
                    
                    <div className={`px-4 py-2 rounded-lg ${
                      isMyMessage 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-800'
                    }`}>
                      {msg.messageType === 'text' ? (
                        <p className="break-words">{msg.content}</p>
                      ) : (
                        <p className="text-sm opacity-75">[{msg.messageType}消息]</p>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-400 mt-1">
                      {formatTime(msg.sentTime)}
                      {isMyMessage && msg.status === 'sending' && (
                        <i className="fa-solid fa-spinner fa-spin ml-1"></i>
                      )}
                    </span>
                  </div>
                  
                  {isMyMessage && (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center ml-2">
                      {memberAvatars[currentUserId]?.avatar ? (
                        <img 
                          src={memberAvatars[currentUserId].avatar} 
                          alt={memberAvatars[currentUserId].nickname || '我'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-green-600 font-medium text-sm">
                          {(memberAvatars[currentUserId]?.nickname || '我').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center py-12">
            <i className="fa-solid fa-comments text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">暂无消息</p>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || sending}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              '发送'
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default GroupChatConversationPage;

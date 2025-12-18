import React, { useState, useEffect } from 'react';
import { 
  createGroup, 
  createGroupWithFriends, 
  inviteUsersToGroup, 
  getGroupMembers,
  leaveGroup,
  dismissGroup,
  getFriendsList,
  getMyGroups,
  getCurrentUserId
} from '../api/config';
import webSocketService, { MESSAGE_TYPES } from '../services/WebSocketService';

const GroupChatPage = ({ onBack, onNavigateToGroupChat }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [friends, setFriends] = useState([]);
  
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
  
  // 创建群聊相关状态

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [creating, setCreating] = useState(false);

  // 加载群聊列表
  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMyGroups();
      console.log('📋 加载群聊列表响应:', response);
      
      if (response.code === 200) {
        const groupsData = response.data || [];
        setGroups(groupsData);
      } else {
        throw new Error(response.message || '获取群聊列表失败');
      }
    } catch (err) {
      console.error('加载群聊列表失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 加载好友列表
  const loadFriends = async () => {
    try {
      console.log('🔄 正在加载好友列表...');
      const response = await getFriendsList();
      console.log('📋 好友列表响应:', response);
      
      if (response.code === 200) {
        // 兼容不同的数据格式
        let friendsData = [];
        if (Array.isArray(response.data)) {
          friendsData = response.data;
        } else if (response.data && Array.isArray(response.data.list)) {
          friendsData = response.data.list;
        } else if (response.data && response.data.friends && Array.isArray(response.data.friends)) {
          friendsData = response.data.friends;
        }
        
        // 打印第一个好友的数据结构，方便调试
        if (friendsData.length > 0) {
          console.log('📝 第一个好友的数据结构:', friendsData[0]);
          console.log('📝 好友ID字段:', {
            id: friendsData[0].id,
            userId: friendsData[0].userId,
            friendId: friendsData[0].friendId
          });
        }
        
        // 标准化好友数据：确保每个好友都有 id 字段
        const normalizedFriends = friendsData.map(friend => {
          // 尝试多种可能的ID字段名
          const friendId = friend.id || friend.userId || friend.friendId || friend.user_id || friend.friend_id;
          
          return {
            ...friend,
            id: friendId  // 统一使用 id 字段
          };
        });
        
        // 去重：根据 id 去除重复的好友
        const uniqueFriends = [];
        const seenIds = new Set();
        for (const friend of normalizedFriends) {
          const friendId = friend.id;
          if (friendId && !seenIds.has(friendId)) {
            seenIds.add(friendId);
            uniqueFriends.push(friend);
          }
        }
        
        console.log('✅ 去重前好友数量:', friendsData.length);
        console.log('✅ 去重后好友数量:', uniqueFriends.length);
        setFriends(uniqueFriends);
      } else {
        console.warn('⚠️ 获取好友列表失败:', response.message);
      }
    } catch (err) {
      console.error('❌ 加载好友列表失败:', err);
    }
  };

  // 创建群聊
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      showDialog('请输入群聊名称');
      return;
    }
    
    if (selectedFriends.length === 0) {
      showDialog('请选择至少一个好友');
      return;
    }

    
    setCreating(true);
    
    try {
      console.log('🎯 开始创建群聊');
      console.log('📝 群名称:', groupName.trim());
      console.log('👥 原始选择的好友:', selectedFriends);
      
      // 提取并验证好友ID
      const friendIdsList = selectedFriends
        .map(f => {
          // 尝试多种可能的ID字段
          const friendId = f.id || f.userId || f.friendId || f.user_id || f.friend_id;
          return friendId;
        })
        .filter(id => {
          // 过滤掉 null、undefined、空字符串
          return id !== null && id !== undefined && id !== '';
        })
        .map(id => {
          // 确保是数字类型
          const numId = typeof id === 'number' ? id : Number(id);
          return numId;
        })
        .filter(id => !isNaN(id));  // 过滤掉 NaN
      
      console.log('👥 提取的好友ID列表:', friendIdsList);
      console.log('👥 ID类型检查:', friendIdsList.map(id => typeof id));
      
      // 验证 friendIds
      if (friendIdsList.length === 0) {
        showDialog('❌ 错误：未能正确提取好友ID，请重新选择好友');

        console.error('❌ friendIds 为空！原始数据:', selectedFriends);
        return;
      }
      
      if (friendIdsList.some(id => isNaN(id) || id === null)) {
        showDialog('❌ 错误：好友ID格式不正确');

        console.error('❌ 包含无效ID:', friendIdsList);
        return;
      }
      
      console.log('✅ 验证通过，准备发送请求');
      console.log('📤 请求参数:', {
        groupName: groupName.trim(),
        friendIds: friendIdsList,
        friendIdsCount: friendIdsList.length
      });
      
      const response = await createGroupWithFriends(
        groupName.trim(),
        friendIdsList
      );
      
      console.log('✅ 创建群聊响应:', response);
      
      if (response.code === 200) {
        const groupData = response.data;
        console.log('🎉 群聊创建成功！');
        console.log('📊 群聊信息:', groupData);
        console.log('⚠️ 后端应该已向以下用户ID发送WebSocket通知:', friendIdsList);
        
        showDialog(`群聊创建成功！\n群名称：${groupData.groupName}\n成员数：${groupData.currentMembers}`);

        setShowCreateGroup(false);
        setGroupName('');
        setGroupDescription('');
        setSelectedFriends([]);
        loadGroups(); // 重新加载群聊列表
      } else {
        throw new Error(response.message || '创建群聊失败');
      }
    } catch (err) {
      console.error('❌ 创建群聊失败:', err);
      showDialog('创建失败：' + err.message);

    } finally {
      setCreating(false);
    }
  };

  // 切换好友选择
  const toggleFriendSelection = (friend) => {
    console.log('🔘 切换好友选择:', friend);
    console.log('🔘 好友ID:', friend.id || friend.userId || friend.friendId);
    
    setSelectedFriends(prev => {
      // 获取好友ID（兼容多种字段名）
      const friendId = friend.id || friend.userId || friend.friendId;
      const isSelected = prev.some(f => {
        const existingId = f.id || f.userId || f.friendId;
        return existingId === friendId;
      });
      
      if (isSelected) {
        return prev.filter(f => {
          const existingId = f.id || f.userId || f.friendId;
          return existingId !== friendId;
        });
      } else {
        return [...prev, friend];
      }
    });
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

  // 初始化
  useEffect(() => {
    loadGroups();
    loadFriends();
    
    // 初始化WebSocket连接
    const initWebSocket = async () => {
      try {
        const userId = await getCurrentUserId();
        console.log('🔌 正在初始化WebSocket连接, 用户ID:', userId);
        
        // 连接WebSocket
        if (!webSocketService.isConnected) {
          console.log('📡 WebSocket未连接，正在连接...');
          await webSocketService.connect(userId);
          console.log('✅ WebSocket连接成功');
        } else {
          console.log('✅ WebSocket已连接');
        }
        
        // 监听群聊邀请通知
        const unsubscribeInvitation = webSocketService.onMessage(
          MESSAGE_TYPES.GROUP_INVITATION,
          (response) => {
            console.log('📬 收到群聊邀请通知 - 原始数据:', response);
            const data = response?.data || response;
            console.log('📬 解析后的邀请数据:', data);
            
            if (data && data.groupName) {
              // 显示通知
              const message = `您被邀请加入群聊：${data.groupName}\n邀请人：${data.inviterName || '未知'}`;
              console.log('🎉 显示邀请通知:', message);
              showDialog(message);

              
              // 重新加载群聊列表
              console.log('🔄 刷新群聊列表...');
              loadGroups();
            } else {
              console.warn('⚠️ 群聊邀请数据不完整:', data);
            }
          }
        );
        console.log('✅ 已注册监听: GROUP_INVITATION');
        
        // 监听新成员加入通知
        const unsubscribeMemberJoined = webSocketService.onMessage(
          MESSAGE_TYPES.MEMBER_JOINED,
          (response) => {
            console.log('👥 收到新成员加入通知:', response);
            const data = response?.data || response;
            console.log('👥 新成员信息:', data);
            // 重新加载群聊列表
            loadGroups();
          }
        );
        console.log('✅ 已注册监听: MEMBER_JOINED');
        
        // 监听群聊通知
        const unsubscribeGroupNotification = webSocketService.onMessage(
          MESSAGE_TYPES.GROUP_NOTIFICATION,
          (response) => {
            console.log('🔔 收到群聊通知:', response);
            const data = response?.data || response;
            console.log('🔔 通知内容:', data);
            // 重新加载群聊列表
            loadGroups();
          }
        );
        console.log('✅ 已注册监听: GROUP_NOTIFICATION');
        
        console.log('🎯 WebSocket初始化完成，等待接收消息...');
        
        // 清理函数
        return () => {
          console.log('🧹 清理WebSocket监听器');
          unsubscribeInvitation?.();
          unsubscribeMemberJoined?.();
          unsubscribeGroupNotification?.();
        };
      } catch (err) {
        console.error('❌ 初始化WebSocket失败:', err);
        console.error('错误详情:', err.stack);
      }
    };
    
    initWebSocket();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3">
              <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">群聊</h1>
          </div>
          
          <button 
            onClick={() => {
              setShowCreateGroup(true);
              loadFriends(); // 打开弹窗时重新加载好友列表
            }}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            创建群聊
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 pb-20">
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
              onClick={loadGroups}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        ) : groups.length > 0 ? (
          <div className="bg-white rounded-lg divide-y divide-gray-100">
            {groups.map((group) => (
              <div 
                key={group.groupId} 
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  if (onNavigateToGroupChat) {
                    onNavigateToGroupChat(group);
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    {group.groupAvatar ? (
                      <img 
                        src={group.groupAvatar} 
                        alt={group.groupName}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <i className="fa-solid fa-users text-green-600 text-lg"></i>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-800 mr-2">
                          {group.groupName}
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {group.currentMembers}人
                        </span>
                        {group.unreadCount > 0 && (
                          <span className="ml-2 text-xs text-white bg-red-500 px-2 py-1 rounded-full">
                            {group.unreadCount > 99 ? '99+' : group.unreadCount}
                          </span>
                        )}
                        {group.memberRole === 'owner' && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded ml-1">
                            群主
                          </span>
                        )}
                      </div>
                      {group.createdTime && (
                        <span className="text-xs text-gray-500">
                          {formatTime(group.createdTime)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {group.groupDescription || '暂无群公告'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fa-solid fa-users text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-600 mb-2">暂无群聊</h3>
            <p className="text-gray-500 text-sm mb-4">
              创建群聊与好友一起交流
            </p>
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              创建群聊
            </button>
          </div>
        )}
      </div>

      {/* 创建群聊弹窗 */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* 弹窗标题 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">创建群聊</h3>
              <button 
                onClick={() => {
                  setShowCreateGroup(false);
                  setGroupName('');
                  setGroupDescription('');
                  setSelectedFriends([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            {/* 群聊信息 */}
            <div className="p-4 border-b border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  群聊名称 *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="请输入群聊名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  群聊描述
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="请输入群聊描述（可选）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择好友 ({selectedFriends.length})
                </label>
                {selectedFriends.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFriends.map((friend) => (
                      <span 
                        key={friend.id}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded gap-1"
                      >
                        {/* 显示头像 */}
                        {(friend.avatarUrl || friend.avatar || friend.profilePicture) && (
                          <img 
                            src={friend.avatarUrl || friend.avatar || friend.profilePicture}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        )}
                        {friend.nickname || friend.phone}
                        <button
                          onClick={() => toggleFriendSelection(friend)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <i className="fa-solid fa-times text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* 好友列表 */}
            <div className="flex-1 overflow-y-auto max-h-64">
              {friends.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {friends.map((friend) => {
                    const isSelected = selectedFriends.some(f => f.id === friend.id);
                    return (
                      <div 
                        key={friend.id} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => toggleFriendSelection(friend)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 relative overflow-hidden">
                            {/* 支持多种头像字段名 */}
                            {(friend.avatarUrl || friend.avatar || friend.profilePicture) ? (
                              <img 
                                src={friend.avatarUrl || friend.avatar || friend.profilePicture} 
                                alt={friend.nickname || '好友头像'}
                                className="w-full h-full rounded-full object-cover absolute inset-0"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-blue-600 font-medium text-sm">
                                {friend.nickname ? friend.nickname.charAt(0) : (friend.phone ? friend.phone.charAt(friend.phone.length - 1) : 'U')}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">
                              {friend.nickname || friend.phone || '未知用户'}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {friend.isOnline ? '在线' : '离线'}
                            </p>
                          </div>
                          
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <i className="fa-solid fa-check text-white text-xs"></i>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fa-solid fa-user-friends text-gray-300 text-2xl mb-2"></i>
                  <p className="text-gray-500">暂无好友</p>
                </div>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreateGroup(false);
                    setGroupName('');
                    setGroupDescription('');
                    setSelectedFriends([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedFriends.length === 0 || creating}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      创建中
                    </>
                  ) : (
                    '创建群聊'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatPage;

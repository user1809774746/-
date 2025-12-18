import React, { useState, useEffect, useRef } from 'react';
import { 
  getGroupMembers,
  getGroupMemberAvatars,
  getGroupInfo,
  leaveGroup,
  getCurrentUserId,
  pinGroup,
  setGroupDisturbFree,
  clearGroupHistory,
  reportGroup,
  getGroupSettings,
  inviteUsersToGroup,
  getFriendsList,
  uploadGroupBackground,
  setGroupBackground
} from '../api/config';

const GroupChatDetailPage = ({ group, onBack, onBackgroundUpdated, onLeaveSuccess }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [groupInfo, setGroupInfo] = useState(group);
  const [members, setMembers] = useState([]);
  const [memberAvatars, setMemberAvatars] = useState({});
  const [loading, setLoading] = useState(true);
  
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
  
  // 群聊设置

  const [groupSettings, setGroupSettings] = useState({
    isPinned: false,
    isDisturbFree: false,
    chatBackground: null
  });
  
  // 举报相关
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState('spam');
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  
  // 邀请好友相关
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [inviting, setInviting] = useState(false);
  
  // 背景设置相关
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingBackground, setUploadingBackground] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        const userId = await getCurrentUserId();
        setCurrentUserId(userId);
        
        await Promise.all([
          loadGroupInfo(),
          loadMembers(),
          loadMemberAvatars(),
          loadGroupSettings()
        ]);
      } catch (err) {
        console.error('初始化失败:', err);
      } finally {
        setLoading(false);
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

  // 加载群成员
  const loadMembers = async () => {
    try {
      const response = await getGroupMembers(group.groupId);
      if (response.code === 200) {
        setMembers(response.data || []);
      }
    } catch (err) {
      console.error('加载群成员失败:', err);
    }
  };

  // 加载群成员头像
  const loadMemberAvatars = async () => {
    try {
      const response = await getGroupMemberAvatars(group.groupId);
      if (response.code === 200) {
        const avatarData = response.data || [];
        const avatarMap = {};
        avatarData.forEach(member => {
          avatarMap[member.userId] = {
            avatar: member.avatar,
            nickname: member.groupNickname || member.nickname || member.username,
            username: member.username,
            memberRole: member.memberRole
          };
        });
        setMemberAvatars(avatarMap);
      }
    } catch (err) {
      console.error('加载群成员头像失败:', err);
    }
  };

  // 加载群聊设置
  const loadGroupSettings = async () => {
    try {
      const response = await getGroupSettings(group.groupId);
      if (response.code === 200) {
        setGroupSettings({
          isPinned: response.data.isPinned || false,
          isDisturbFree: response.data.isDisturbFree || false,
          chatBackground: response.data.chatBackground || null
        });
      }
    } catch (err) {
      console.error('加载群聊设置失败:', err);
    }
  };

  // 置顶群聊
  const handlePinGroup = async () => {
    try {
      const newPinState = !groupSettings.isPinned;
      const response = await pinGroup(group.groupId, newPinState);
      
      if (response.code === 200) {
        setGroupSettings(prev => ({ ...prev, isPinned: newPinState }));
        showDialog(newPinState ? '已置顶群聊' : '已取消置顶');

      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (err) {
      console.error('置顶操作失败:', err);
      showDialog('操作失败：' + err.message);

    }
  };

  // 消息免打扰
  const handleDisturbFree = async () => {
    try {
      const newDisturbState = !groupSettings.isDisturbFree;
      const response = await setGroupDisturbFree(group.groupId, newDisturbState);
      
      if (response.code === 200) {
        setGroupSettings(prev => ({ ...prev, isDisturbFree: newDisturbState }));
        showDialog(newDisturbState ? '已开启消息免打扰' : '已关闭消息免打扰');

      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (err) {
      console.error('免打扰操作失败:', err);
      showDialog('操作失败：' + err.message);

    }
  };

  // 清空聊天记录
  const handleClearHistory = async () => {
    if (!confirm('确定要清空聊天记录吗？此操作不可恢复，清空后只能看到清空时间之后的消息。')) return;
    
    try {
      const response = await clearGroupHistory(group.groupId);
      
      if (response.code === 200) {
        showDialog('聊天记录已清空');

      } else {
        throw new Error(response.message || '清空失败');
      }
    } catch (err) {
      console.error('清空聊天记录失败:', err);
      showDialog('清空失败：' + err.message);

    }
  };

  // 举报群聊
  const handleReportGroup = async () => {
    if (!reportReason.trim()) {
      showDialog('请填写举报原因（10-500字符）');
      return;
    }
    
    if (reportReason.trim().length < 10 || reportReason.trim().length > 500) {
      showDialog('举报原因需要在10-500字符之间');
      return;
    }

    
    setSubmittingReport(true);
    
    try {
      const response = await reportGroup(
        group.groupId,
        reportType,
        reportReason.trim(),
        []
      );
      
      if (response.code === 200) {
        showDialog('举报已提交，我们会尽快处理');

        setShowReportDialog(false);
        setReportReason('');
        setReportType('spam');
      } else {
        throw new Error(response.message || '举报提交失败');
      }
    } catch (err) {
      console.error('举报失败:', err);
      showDialog('举报失败：' + err.message);

    } finally {
      setSubmittingReport(false);
    }
  };

  // 退出群聊
  const handleLeaveGroup = async () => {
    if (!confirm('确定要退出该群聊吗？')) return;
    
    try {
      const response = await leaveGroup(group.groupId);
      if (response.code === 200) {
        showDialog('已退出群聊');

        if (onLeaveSuccess) {
          onLeaveSuccess();
        } else {
          onBack();
        }
      } else {
        throw new Error(response.message || '退出失败');
      }
    } catch (err) {
      console.error('退出群聊失败:', err);
      showDialog('退出失败：' + err.message);

    }
  };

  // 加载好友列表
  const loadFriends = async () => {
    try {
      const response = await getFriendsList();
      if (response.code === 200) {
        let friendsData = [];
        if (Array.isArray(response.data)) {
          friendsData = response.data;
        } else if (response.data && Array.isArray(response.data.list)) {
          friendsData = response.data.list;
        } else if (response.data && response.data.friends && Array.isArray(response.data.friends)) {
          friendsData = response.data.friends;
        }
        
        // 标准化好友数据并过滤掉已在群内的成员
        const memberIds = new Set(members.map(m => m.userId));
        const normalizedFriends = friendsData
          .map(friend => ({
            ...friend,
            id: friend.id || friend.userId || friend.friendId
          }))
          .filter(friend => !memberIds.has(friend.id));
        
        setFriends(normalizedFriends);
      }
    } catch (err) {
      console.error('加载好友列表失败:', err);
      showDialog('加载好友列表失败：' + err.message);

    }
  };

  // 打开邀请弹窗
  const handleOpenInvite = async () => {
    setShowInviteDialog(true);
    await loadFriends();
  };

  // 切换好友选择
  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prev => {
      const friendId = friend.id;
      const isSelected = prev.some(f => f.id === friendId);
      
      if (isSelected) {
        return prev.filter(f => f.id !== friendId);
      } else {
        return [...prev, friend];
      }
    });
  };

  // 邀请好友进群
  const handleInviteFriends = async () => {
    if (selectedFriends.length === 0) {
      showDialog('请选择要邀请的好友');
      return;
    }

    
    setInviting(true);
    
    try {
      const friendIds = selectedFriends.map(f => f.id);
      const response = await inviteUsersToGroup(group.groupId, friendIds, '');
      
      if (response.code === 200) {
        showDialog(`成功邀请 ${selectedFriends.length} 位好友进群`);

        setShowInviteDialog(false);
        setSelectedFriends([]);
        // 重新加载成员列表
        await loadMembers();
        await loadMemberAvatars();
      } else {
        throw new Error(response.message || '邀请失败');
      }
    } catch (err) {
      console.error('邀请好友失败:', err);
      showDialog('邀请失败：' + err.message);

    } finally {
      setInviting(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showDialog('请选择图片文件（jpg、png、gif、bmp、webp）');
      return;
    }

    
    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      showDialog('文件大小不能超过10MB');
      return;
    }

    
    setSelectedFile(file);
    
    // 生成预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // 上传并设置背景
  const handleUploadAndSetBackground = async () => {
    if (!selectedFile) {
      alert('请选择图片文件');
      return;
    }
    
    setUploadingBackground(true);
    
    try {
      const response = await uploadGroupBackground(group.groupId, selectedFile);
      
      if (response.code === 200) {
        const imageUrl = response.data;
        setGroupSettings(prev => ({ ...prev, chatBackground: imageUrl }));
        showDialog('背景图片上传成功！');

        setShowBackgroundDialog(false);
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // 通知父组件背景已更新，触发聊天页面刷新
        if (onBackgroundUpdated) {
          onBackgroundUpdated();
        }
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (err) {
      console.error('上传背景失败:', err);
      showDialog('上传失败：' + err.message);

    } finally {
      setUploadingBackground(false);
    }
  };

  // 清除群聊背景
  const handleClearBackground = async () => {
    if (!confirm('确定要清除聊天背景吗？')) return;
    
    setUploadingBackground(true);
    
    try {
      const response = await setGroupBackground(group.groupId, null);
      
      if (response.code === 200) {
        setGroupSettings(prev => ({ ...prev, chatBackground: null }));
        alert('聊天背景已清除');
        setShowBackgroundDialog(false);
        
        // 通知父组件背景已更新，触发聊天页面刷新
        if (onBackgroundUpdated) {
          onBackgroundUpdated();
        }
      } else {
        throw new Error(response.message || '清除失败');
      }
    } catch (err) {
      console.error('清除背景失败:', err);
      alert('清除失败：' + err.message);
    } finally {
      setUploadingBackground(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex items-center justify-center flex-1">
          <i className="fa-solid fa-spinner fa-spin text-gray-400 text-2xl mr-2"></i>
          <span className="text-gray-500">加载中...</span>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800">群聊详情</h1>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 群成员列表 */}
        <div className="bg-white mb-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-800">群成员 ({members.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div key={member.userId} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    {(memberAvatars[member.userId]?.avatar || member.avatar) ? (
                      <img 
                        src={memberAvatars[member.userId]?.avatar || member.avatar} 
                        alt={memberAvatars[member.userId]?.nickname || member.nickname || member.username || '用户'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-medium">
                        {((memberAvatars[member.userId]?.nickname || member.nickname || member.username) || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {memberAvatars[member.userId]?.nickname || member.groupNickname || member.nickname || member.username || `用户${member.userId}`}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {member.role === 'owner' && '群主'}
                      {member.role === 'admin' && '管理员'}
                      {member.role === 'member' && '成员'}
                    </p>
                  </div>
                  
                  {member.role === 'owner' && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      群主
                    </span>
                  )}
                  {member.role === 'admin' && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      管理员
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {/* 邀请好友加号卡片 */}
            <button
              onClick={handleOpenInvite}
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fa-solid fa-plus text-green-600 text-xl"></i>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-800">邀请好友</h4>
                  <p className="text-xs text-gray-500">邀请好友加入群聊</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 群聊设置 */}
        <div className="bg-white mb-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-800">群聊设置</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {/* 置顶群聊 */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <i className="fa-solid fa-thumbtack text-gray-500 mr-3 w-5"></i>
                <span className="text-gray-800">置顶群聊</span>
              </div>
              <button
                onClick={handlePinGroup}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  groupSettings.isPinned ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  groupSettings.isPinned ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>

            {/* 消息免打扰 */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <i className="fa-solid fa-bell-slash text-gray-500 mr-3 w-5"></i>
                <span className="text-gray-800">消息免打扰</span>
              </div>
              <button
                onClick={handleDisturbFree}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  groupSettings.isDisturbFree ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  groupSettings.isDisturbFree ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>

            {/* 设置群聊背景 */}
            <button
              onClick={() => setShowBackgroundDialog(true)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center">
                <i className="fa-solid fa-image text-gray-500 mr-3 w-5"></i>
                <span className="text-gray-800">设置群聊背景</span>
              </div>
              {groupSettings.chatBackground && (
                <span className="text-xs text-blue-600">已设置</span>
              )}
            </button>

            {/* 清空聊天记录 */}
            <button
              onClick={handleClearHistory}
              className="w-full px-4 py-3 flex items-center hover:bg-gray-50"
            >
              <i className="fa-solid fa-trash-can text-gray-500 mr-3 w-5"></i>
              <span className="text-gray-800">清空聊天记录</span>
            </button>

            {/* 举报群聊 */}
            <button
              onClick={() => setShowReportDialog(true)}
              className="w-full px-4 py-3 flex items-center hover:bg-gray-50 text-red-600"
            >
              <i className="fa-solid fa-flag mr-3 w-5"></i>
              <span>举报群聊</span>
            </button>
          </div>
        </div>

        {/* 退出群聊按钮 */}
        <div className="bg-white mb-2">
          <button
            onClick={handleLeaveGroup}
            className="w-full px-4 py-3 flex items-center justify-center text-red-600 hover:bg-red-50"
          >
            <i className="fa-solid fa-right-from-bracket mr-2"></i>
            <span className="font-medium">退出群聊</span>
          </button>
        </div>
      </div>

      {/* 举报弹窗 */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">举报群聊</h3>
              <button 
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                  setReportType('spam');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* 举报类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  举报类型
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="spam">垃圾广告</option>
                  <option value="fraud">欺诈</option>
                  <option value="pornography">色情</option>
                  <option value="violence">暴力</option>
                  <option value="politics">政治敏感</option>
                  <option value="harassment">骚扰</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {/* 举报原因 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  举报原因 (10-500字符)
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="请详细描述举报原因..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {reportReason.length}/500 字符
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason('');
                    setReportType('spam');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleReportGroup}
                  disabled={submittingReport || !reportReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submittingReport ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      提交中...
                    </>
                  ) : (
                    '提交举报'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 邀请好友弹窗 */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">邀请好友</h3>
              <button 
                onClick={() => {
                  setShowInviteDialog(false);
                  setSelectedFriends([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[50vh] p-4">
              {friends.length > 0 ? (
                <div className="space-y-2">
                  {friends.map((friend) => {
                    const isSelected = selectedFriends.some(f => f.id === friend.id);
                    return (
                      <button
                        key={friend.id}
                        onClick={() => toggleFriendSelection(friend)}
                        className={`w-full p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            {friend.avatar ? (
                              <img 
                                src={friend.avatar} 
                                alt={friend.nickname || friend.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-medium text-sm">
                                {(friend.nickname || friend.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-medium text-gray-800">
                              {friend.nickname || friend.username || `用户${friend.id}`}
                            </h4>
                          </div>
                          {isSelected && (
                            <i className="fa-solid fa-check text-blue-500 ml-2"></i>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fa-solid fa-user-group text-gray-300 text-4xl mb-3"></i>
                  <p className="text-gray-500">没有可邀请的好友</p>
                  <p className="text-xs text-gray-400 mt-1">好友已在群内或暂无好友</p>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  已选择 <span className="font-bold text-blue-600">{selectedFriends.length}</span> 位好友
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowInviteDialog(false);
                    setSelectedFriends([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleInviteFriends}
                  disabled={inviting || selectedFriends.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {inviting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      邀请中...
                    </>
                  ) : (
                    `邀请 (${selectedFriends.length})`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 设置背景弹窗 */}
      {showBackgroundDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">设置群聊背景</h3>
              <button 
                onClick={() => {
                  setShowBackgroundDialog(false);
                  setSelectedFile(null);
                  setPreviewUrl('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* 当前背景显示 */}
              {groupSettings.chatBackground && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">当前背景</p>
                  <div 
                    className="w-full h-32 rounded bg-cover bg-center mb-2"
                    style={{ backgroundImage: `url('${groupSettings.chatBackground}')` }}
                  />
                  <button
                    onClick={handleClearBackground}
                    disabled={uploadingBackground}
                    className="w-full text-sm text-red-600 hover:text-red-700 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    清除背景
                  </button>
                </div>
              )}

              {/* 文件上传区域 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择背景图片
                </label>
                
                {/* 隐藏的文件输入 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {/* 自定义上传按钮 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingBackground}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center">
                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-2"></i>
                    <span className="text-sm text-gray-600">点击选择图片文件</span>
                    <span className="text-xs text-gray-400 mt-1">支持 JPG、PNG、GIF、BMP、WebP（最大10MB）</span>
                  </div>
                </button>
                
                {/* 图片预览 */}
                {previewUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">预览</p>
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="预览" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <i className="fa-solid fa-times text-xs"></i>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  设置后仅对你个人生效，不影响其他成员
                </p>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBackgroundDialog(false);
                    setSelectedFile(null);
                    setPreviewUrl('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={uploadingBackground}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleUploadAndSetBackground}
                  disabled={uploadingBackground || !selectedFile}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {uploadingBackground ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      上传中...
                    </>
                  ) : (
                    '确定'
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

export default GroupChatDetailPage;

import React, { useState, useEffect } from 'react';
import { addFriend, getChatPermissions, setChatPermissions, reportUser, getBackgroundImageBase64 } from '../api/config';

const UserCenterPage = ({ user, onBack, onNavigateToDynamics }) => {
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">未找到用户信息</p>
          {onBack && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              onClick={onBack}
            >
              返回
            </button>
          )}
        </div>
      </div>
    );
  }

  const [friendPermission, setFriendPermission] = useState('view-dynamics'); // 'chat-only' | 'view-dynamics'
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isLoadingPermission, setIsLoadingPermission] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoadingBackground, setIsLoadingBackground] = useState(true);

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


  const handlePermissionChange = async (value) => {
    if (isFromTopics) return;

    const prev = friendPermission;
    setFriendPermission(value); // 乐观更新

    try {
      const level = value === 'chat-only' ? 'chat_only' : 'full_access';
      const response = await setChatPermissions(userIdText, level);
      if (!response || response.code !== 200) {
        setFriendPermission(prev);
        showDialog(response?.message || '更新朋友权限失败');

      }
    } catch (error) {
      console.error('更新朋友权限失败:', error);
      setFriendPermission(prev);
      showDialog(error.message || '更新朋友权限失败');

    }
  };

  const isFromTopics = !!user.fromTopics;

  const displayName = user.nickname || user.username || user.phone || '未设置用户名';
  const avatarText = displayName ? displayName.charAt(0) : 'U';
  const userIdText = user.id || user.userId || '';

  const handleReportUserClick = async () => {
    if (!userIdText) return;

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
      const response = await reportUser(userIdText, selectedReason.value, description.trim());
      if (response && response.code === 200) {
        showDialog(response.message || '举报成功，我们会尽快处理');

      } else {
        throw new Error(response?.message || '举报失败');
      }
    } catch (error) {
      console.error('举报用户失败:', error);
      showDialog('举报失败：' + (error.message || '未知错误'));

    }
  };

  useEffect(() => {
    const loadPermission = async () => {
      if (isFromTopics) return;
      if (!userIdText) return;

      try {
        setIsLoadingPermission(true);
        const response = await getChatPermissions(userIdText);
        if (response && response.code === 200 && response.data) {
          const mode =
            response.data.permissionLevel === 'chat_only'
              ? 'chat-only'
              : 'view-dynamics';
          setFriendPermission(mode);
        }
      } catch (error) {
        console.error('加载朋友权限失败:', error);
      } finally {
        setIsLoadingPermission(false);
      }
    };

    loadPermission();
  }, [isFromTopics, userIdText]);

  // 加载对方用户的背景图片
  useEffect(() => {
    const loadUserBackground = async () => {
      if (!userIdText) {
        setIsLoadingBackground(false);
        return;
      }
      
      try {
        setIsLoadingBackground(true);
        console.log('🖼️ 用户中心 - 开始加载背景图片，用户ID:', userIdText);
        
        // 调用新接口获取指定用户的背景图片
        const response = await getBackgroundImageBase64(userIdText);
        
        if (response && response.code === 200 && response.data?.backgroundImage) {
          let bgImage = response.data.backgroundImage;
          
          // 确保Base64图片格式正确
          if (bgImage && !bgImage.startsWith('data:image') && !bgImage.startsWith('http')) {
            bgImage = `data:image/jpeg;base64,${bgImage}`;
          }
          
          setBackgroundImage(bgImage);
          console.log('✅ 背景图片加载成功，长度:', bgImage.length);
        } else {
          console.log('⚠️ 用户未设置背景图片，使用默认背景');
          setBackgroundImage(null);
        }
      } catch (error) {
        console.error('❌ 加载背景图片失败:', error);
        setBackgroundImage(null);
      } finally {
        setIsLoadingBackground(false);
      }
    };
    
    loadUserBackground();
  }, [userIdText]);

  const handleAddFriendClick = async () => {
    if (!isFromTopics) return;
    if (!userIdText) {
      showDialog('无法获取该用户ID，暂时无法添加好友');
      return;
    }


    try {
      setIsAddingFriend(true);
      const response = await addFriend(userIdText, '', 'topic-user-center');
      if (response && response.code === 200) {
        showDialog('好友申请已发送');
      } else {
        showDialog('添加好友失败：' + (response?.message || '未知错误'));
      }

    } catch (error) {
      console.error('添加好友失败:', error);
      showDialog('添加好友失败：' + (error.message || '未知错误'));

    } finally {
      setIsAddingFriend(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      {/* 顶部栏 */}

      <div className="bg-white shadow-sm px-4 py-4 flex items-center">
        <button
          className="mr-3 text-gray-600 hover:text-gray-800"
          onClick={onBack}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">用户中心</h1>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 用户背景图片和头像区域 */}
        <div className="relative">
          {/* 背景图片区域 - 包含用户信息 */}
          <div 
            className="relative w-full pb-6"
            style={{
              backgroundImage: backgroundImage 
                ? `url(${backgroundImage})`
                : 'linear-gradient(to bottom, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* 半透明遮罩层，让文字更清晰 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40"></div>
            
            {/* 内容层 */}
            <div className="relative" style={{ paddingTop: '180px' }}>
              {/* 用户头像 - 居中显示 */}
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-lg overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {avatarText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 用户信息 */}
              <div className="text-center px-5 pb-4">
                <h2 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{displayName}</h2>
                <p className="text-sm text-white/90 drop-shadow">游号：{userIdText || '未知'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 bg-gray-50 py-4">

        {/* 朋友权限 */}
        {!isFromTopics && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <h3 className="text-base font-medium text-gray-900 mb-4">朋友权限</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handlePermissionChange('chat-only')}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-base transition-colors ${
                  friendPermission === 'chat-only'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                <span>
                  <span className="font-medium mr-1">仅聊天</span>
                  <span className="text-sm text-gray-500">对方仅可与你进行聊天</span>
                </span>
                {friendPermission === 'chat-only' && (
                  <i className="fa-solid fa-check text-blue-500"></i>
                )}
              </button>
              <button
                type="button"
                onClick={() => handlePermissionChange('view-dynamics')}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-base transition-colors ${
                  friendPermission === 'view-dynamics'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                <span>
                  <span className="font-medium mr-1">允许观看动态</span>
                  <span className="text-sm text-gray-500">对方可以查看你的公开帖子和活动</span>
                </span>
                {friendPermission === 'view-dynamics' && (
                  <i className="fa-solid fa-check text-blue-500"></i>
                )}
              </button>
            </div>
          </div>
        )}

        {isFromTopics && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <button
              type="button"
              onClick={handleAddFriendClick}
              disabled={isAddingFriend}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg text-base hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isAddingFriend ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  发送中...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus mr-2"></i>
                  添加好友
                </>
              )}
            </button>
          </div>
        )}

        {/* 功能入口：动态 */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 mb-4 overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            onClick={() => onNavigateToDynamics && onNavigateToDynamics(user)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <i className="fa-solid fa-bolt text-purple-500 text-lg"></i>
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">动态</p>
                <p className="text-sm text-gray-500">查看该用户发布的帖子和参加的活动</p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            onClick={handleReportUserClick}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <i className="fa-solid fa-flag text-red-500 text-lg"></i>
              </div>
              <div>
                <p className="text-base font-medium text-red-600">举报用户</p>
                <p className="text-sm text-gray-500">如果该用户存在骚扰、诈骗等违规行为，请进行举报</p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserCenterPage;

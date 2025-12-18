import React, { useState, useEffect, useRef } from 'react';
import { 
  getChatSettings,
  pinConversation,
  muteConversation,
  setChatBackground,
  clearChatMessages,
  reportUser,
  uploadChatBackgroundImage
} from '../api/config';

const ChatSettingsPage = ({ friend, onBack }) => {
  const [settings, setSettings] = useState({
    isPinned: false,
    isMuted: false,
    backgroundImage: null
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

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


  // 加载聊天设置
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getChatSettings(friend.id, 'user');
      if (response.code === 200) {
        setSettings(response.data || {});
      }
    } catch (err) {
      console.error('加载聊天设置失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 切换置顶状态
  const handleTogglePin = async () => {
    setUpdating(true);
    try {
      const newPinStatus = !settings.isPinned;
      const response = await pinConversation(friend.id, 'user', newPinStatus);
      if (response.code === 200) {
        setSettings(prev => ({ ...prev, isPinned: newPinStatus }));
      } else {
        throw new Error(response.message || '设置失败');
      }
    } catch (err) {
      console.error('设置置顶失败:', err);
      showDialog('设置失败：' + err.message);

    } finally {
      setUpdating(false);
    }
  };

  // 切换免打扰状态
  const handleToggleMute = async () => {
    setUpdating(true);
    try {
      const newMuteStatus = !settings.isMuted;
      const response = await muteConversation(friend.id, 'user', newMuteStatus);
      if (response.code === 200) {
        setSettings(prev => ({ ...prev, isMuted: newMuteStatus }));
      } else {
        throw new Error(response.message || '设置失败');
      }
    } catch (err) {
      console.error('设置免打扰失败:', err);
      showDialog('设置失败：' + err.message);

    } finally {
      setUpdating(false);
    }
  };

  // 清空聊天记录
  const handleClearMessages = async () => {
    const confirmed = window.confirm('确定要清空所有聊天记录吗？此操作不可恢复。');
    if (!confirmed) return;

    setUpdating(true);
    try {
      const response = await clearChatMessages(friend.id);
      if (response.code === 200) {
        showDialog('聊天记录已清空');
        onBack(); // 返回聊天页面

      } else {
        throw new Error(response.message || '清空失败');
      }
    } catch (err) {
      console.error('清空聊天记录失败:', err);
      showDialog('清空失败：' + err.message);

    } finally {
      setUpdating(false);
    }
  };

  // 举报用户
  const handleReportUser = async () => {
    const reasons = [
      { value: 'spam', label: '垃圾信息' },
      { value: 'abuse', label: '辱骂/人身攻击' },
      { value: 'fraud', label: '诈骗/欺诈' },
      { value: 'porn', label: '涉黄' },
      { value: 'harassment', label: '骚扰' },
      { value: 'fake_info', label: '虚假信息' },
      { value: 'other', label: '其他' }
    ];

    const reason = prompt(
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
    
    if (!reason || !['1', '2', '3', '4', '5', '6', '7'].includes(reason)) {
      return;
    }

    const selectedReason = reasons[parseInt(reason) - 1];
    const description = prompt('请详细描述举报原因:');
    
    if (!description || !description.trim()) {
      return;
    }

    setUpdating(true);
    try {
      const response = await reportUser(
        friend.id,
        selectedReason.value,
        description.trim()
      );
      
      if (response.code === 200) {
        showDialog('举报已提交，感谢您的反馈');

      } else {
        throw new Error(response.message || '举报失败');
      }
    } catch (err) {
      console.error('举报用户失败:', err);
      showDialog('举报失败：' + err.message);

    } finally {
      setUpdating(false);
    }
  };

  const handleBackgroundFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showDialog('仅支持上传图片文件');

      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showDialog('图片大小不能超过5MB');

      event.target.value = '';
      return;
    }

    setUpdating(true);
    try {
      const response = await uploadChatBackgroundImage(friend.id, 'user', file);
      if (response.code === 200) {
        await loadSettings();
        showDialog('聊天背景已更新');

      } else {
        throw new Error(response.message || '设置失败');
      }
    } catch (err) {
      console.error('设置聊天背景失败:', err);
      showDialog('设置失败：' + err.message);

    } finally {
      setUpdating(false);
      event.target.value = '';
    }
  };

  // 设置聊天背景
  const handleSetBackground = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (friend) {
      loadSettings();
    }
  }, [friend]);

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
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800">聊天设置</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <i className="fa-solid fa-spinner fa-spin text-gray-400 mr-2"></i>
          <span className="text-gray-500">加载中...</span>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* 用户信息 */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                {friend.avatarUrl ? (
                  <img 
                    src={friend.avatarUrl} 
                    alt={friend.nickname}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-medium text-xl">
                    {friend.nickname ? friend.nickname.charAt(0) : 'U'}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800">
                  {friend.nickname || friend.phone || '未知用户'}
                </h3>
                {/* 在线状态已隐藏 */}
                {/*
                <p className="text-sm text-gray-500">
                  {friend.isOnline ? '在线' : '离线'}
                </p>
                */}
                {friend.phone && (
                  <p className="text-sm text-gray-500">
                    {friend.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 聊天设置 */}
          <div className="bg-white rounded-lg">
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="font-medium text-gray-800">聊天设置</h4>
            </div>
            
            <div className="divide-y divide-gray-100">
              {/* 置顶聊天 */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fa-solid fa-thumbtack text-gray-400 mr-3"></i>
                  <span className="text-gray-800">置顶聊天</span>
                </div>
                <button
                  onClick={handleTogglePin}
                  disabled={updating}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.isPinned ? 'bg-blue-600' : 'bg-gray-200'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.isPinned ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 消息免打扰 */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fa-solid fa-bell-slash text-gray-400 mr-3"></i>
                  <span className="text-gray-800">消息免打扰</span>
                </div>
                <button
                  onClick={handleToggleMute}
                  disabled={updating}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.isMuted ? 'bg-blue-600' : 'bg-gray-200'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.isMuted ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 聊天背景 */}
              <button
                onClick={handleSetBackground}
                className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-50"
              >
                <i className="fa-solid fa-image text-gray-400 mr-3"></i>
                <span className="text-gray-800">设置聊天背景</span>
                <i className="fa-solid fa-chevron-right text-gray-400 ml-auto"></i>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleBackgroundFileChange}
                className="hidden"
                disabled={updating}
              />
            </div>
          </div>

          {/* 聊天管理 */}
          <div className="bg-white rounded-lg">
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="font-medium text-gray-800">聊天管理</h4>
            </div>
            
            <div className="divide-y divide-gray-100">
              {/* 清空聊天记录 */}
              <button
                onClick={handleClearMessages}
                disabled={updating}
                className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-trash text-gray-400 mr-3"></i>
                <span className="text-gray-800">清空聊天记录</span>
              </button>

              {/* 举报用户 */}
              <button
                onClick={handleReportUser}
                disabled={updating}
                className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-flag text-red-400 mr-3"></i>
                <span className="text-red-600">举报用户</span>
              </button>
            </div>
          </div>

          {/* 好友信息 */}
          <div className="bg-white rounded-lg">
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="font-medium text-gray-800">好友信息</h4>
            </div>
            
            <div className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">昵称</span>
                <span className="text-gray-800">{friend.nickname || '未设置'}</span>
              </div>
              {friend.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">手机号</span>
                  <span className="text-gray-800">{friend.phone}</span>
                </div>
              )}
              {/* 在线状态已隐藏 */}
              {/*
              <div className="flex justify-between">
                <span className="text-gray-600">在线状态</span>
                <span className={`${friend.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {friend.isOnline ? '在线' : '离线'}
                </span>
              </div>
              */}
              {friend.lastActiveTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">最后活跃</span>
                  <span className="text-gray-800">{friend.lastActiveTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSettingsPage;

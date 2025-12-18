import React, { useState, useEffect } from 'react';
import { getFriendRequests, handleFriendRequest } from '../api/config';
import friendRequestNotificationService from '../services/FriendRequestNotificationService';

const FriendRequestsPage = ({ onBack }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(new Set());

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

  // 加载好友申请列表

  const loadFriendRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getFriendRequests();
      if (response.code === 200) {
        // 处理后端返回的数据结构
        const requestList = response.data || [];
        setRequests(requestList);
      } else {
        throw new Error(response.message || '获取好友申请失败');
      }
    } catch (err) {
      console.error('加载好友申请失败:', err);
      setError(err.message);
      
      // 如果后端接口未就绪，使用模拟数据
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        console.warn('好友申请接口未就绪，使用模拟数据');
        const mockRequests = [
          {
            requestId: 1,
            fromUserId: 3,
            fromUsername: '张三',
            fromNickname: '张三',
            fromPhone: '19333718380',
            fromAvatar: null,
            requestMessage: '你好，我想加你为好友',
            status: 'pending',
            requestTime: new Date(Date.now() - 1800000).toISOString()
          },
          {
            requestId: 2,
            fromUserId: 5,
            fromUsername: '李四',
            fromNickname: '李四',
            fromPhone: '13800138001',
            fromAvatar: null,
            requestMessage: '我们可以成为朋友吗？',
            status: 'pending',
            requestTime: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        setRequests(mockRequests);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理好友申请
  const handleRequest = async (request, action) => {
    const requestKey = `${request.fromUserId}_${action}`;
    
    try {
      setProcessing(prev => new Set([...prev, requestKey]));
      
      const response = await handleFriendRequest(
        request.fromUserId, 
        action, 
        action === 'reject' ? '暂时不加好友' : ''
      );
      
      if (response.code === 200) {
        // 更新本地状态
        setRequests(prev => prev.map(req => 
          req.requestId === request.requestId 
            ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' }
            : req
        ));
        
        // 更新通知服务的待处理数量
        friendRequestNotificationService.decrementPendingCount();
        
        const actionText = action === 'accept' ? '接受' : '拒绝';
        showDialog(`已${actionText}好友申请`);

      } else {
        throw new Error(response.message || `${action === 'accept' ? '接受' : '拒绝'}申请失败`);
      }
    } catch (err) {
      console.error('处理好友申请失败:', err);
      
      // 如果后端接口未就绪，模拟处理成功
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        console.warn('处理好友申请接口未就绪，模拟处理成功');
        setRequests(prev => prev.map(req => 
          req.requestId === request.requestId 
            ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' }
            : req
        ));
        
        // 更新通知服务的待处理数量
        friendRequestNotificationService.decrementPendingCount();
        
        const actionText = action === 'accept' ? '接受' : '拒绝';
        showDialog(`已${actionText}好友申请（模拟）`);

      } else {
        showDialog(`处理失败：${err.message}`);
      }

    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 获取状态显示
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return { text: '待处理', color: 'text-orange-600 bg-orange-100' };
      case 'accepted':
        return { text: '已接受', color: 'text-green-600 bg-green-100' };
      case 'rejected':
        return { text: '已拒绝', color: 'text-red-600 bg-red-100' };
      default:
        return { text: '未知', color: 'text-gray-600 bg-gray-100' };
    }
  };

  useEffect(() => {
    loadFriendRequests();
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
            <h1 className="text-lg font-bold text-gray-800">好友申请</h1>
          </div>
          
          <button 
            onClick={loadFriendRequests}
            className="text-blue-500 hover:text-blue-600"
            disabled={loading}
          >
            <i className={`fa-solid fa-refresh ${loading ? 'fa-spin' : ''}`}></i>
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
              onClick={loadFriendRequests}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((request) => {
              const statusDisplay = getStatusDisplay(request.status);
              const isPending = request.status === 'pending';
              
              return (
                <div key={request.requestId} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start">
                    {/* 头像 */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      {request.fromAvatar ? (
                        <img 
                          src={request.fromAvatar} 
                          alt={request.fromNickname || request.fromUsername}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-medium text-lg">
                          {request.fromNickname ? request.fromNickname.charAt(0) : 
                           request.fromPhone ? request.fromPhone.charAt(request.fromPhone.length - 1) : 'U'}
                        </span>
                      )}
                    </div>
                    
                    {/* 申请信息 */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {request.fromNickname || request.fromUsername || request.fromPhone || '未知用户'}
                          </h4>
                          {request.fromPhone && request.fromNickname && (
                            <p className="text-xs text-gray-500">{request.fromPhone}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusDisplay.color}`}>
                            {statusDisplay.text}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(request.requestTime)}
                          </span>
                        </div>
                      </div>
                      
                      {/* 申请消息 */}
                      {request.requestMessage && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700">"{request.requestMessage}"</p>
                        </div>
                      )}
                      
                      {/* 操作按钮 */}
                      {isPending && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleRequest(request, 'accept')}
                            disabled={processing.has(`${request.fromUserId}_accept`)}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            {processing.has(`${request.fromUserId}_accept`) ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                                接受中
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-check mr-1"></i>
                                接受
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleRequest(request, 'reject')}
                            disabled={processing.has(`${request.fromUserId}_reject`)}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            {processing.has(`${request.fromUserId}_reject`) ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                                拒绝中
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-times mr-1"></i>
                                拒绝
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fa-solid fa-user-plus text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-600 mb-2">暂无好友申请</h3>
            <p className="text-gray-500 text-sm">
              当有人向你发送好友申请时，会在这里显示
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequestsPage;

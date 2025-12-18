// 好友申请通知服务
class FriendRequestNotificationService {
  constructor() {
    this.listeners = new Set();
    this.pendingCount = 0;
  }

  // 注册监听器
  addListener(callback) {
    this.listeners.add(callback);
    
    // 返回取消监听的函数
    return () => {
      this.listeners.delete(callback);
    };
  }

  // 移除监听器
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // 更新待处理申请数量
  updatePendingCount(count) {
    this.pendingCount = count;
    this.notifyListeners();
  }

  // 增加待处理申请数量
  incrementPendingCount() {
    this.pendingCount++;
    this.notifyListeners();
  }

  // 减少待处理申请数量
  decrementPendingCount() {
    if (this.pendingCount > 0) {
      this.pendingCount--;
      this.notifyListeners();
    }
  }

  // 获取当前待处理数量
  getPendingCount() {
    return this.pendingCount;
  }

  // 通知所有监听器
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.pendingCount);
      } catch (err) {
        console.error('好友申请通知监听器执行失败:', err);
      }
    });
  }

  // 处理新的好友申请通知
  handleNewFriendRequest(requestData) {
    console.log('收到新的好友申请:', requestData);
    this.incrementPendingCount();
    
    // 可以在这里添加浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('新的好友申请', {
        body: `${requestData.fromUsername || requestData.fromNickname || '用户'} 想要添加你为好友`,
        icon: '/favicon.ico'
      });
    }
  }

  // 处理好友申请被处理的通知
  handleFriendRequestHandled(handledData) {
    console.log('好友申请被处理:', handledData);
    this.decrementPendingCount();
  }

  // 请求通知权限
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

// 创建单例实例
const friendRequestNotificationService = new FriendRequestNotificationService();

export default friendRequestNotificationService;

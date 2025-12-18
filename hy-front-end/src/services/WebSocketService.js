// WebSocket 聊天服务
class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1秒
    this.heartbeatInterval = null;
    this.messageHandlers = new Map();
    this.userId = null;
  }

  // 连接WebSocket
  connect(userId) {
    if (this.isConnected && this.ws) {
      console.log('WebSocket已连接');
      return Promise.resolve();
    }

    this.userId = userId;
    
    return new Promise((resolve, reject) => {
      try {
        // 临时修复：直连后端进行测试（生产环境需要使用代理）
        const isDevelopment = window.location.hostname === 'localhost';
        let wsUrl;
        
        // 统一使用代理方式连接，自动适配 HTTP/HTTPS
        // HTTPS 页面 -> wss://前端:3000/ws -> Vite代理 -> ws://后端:8082
        // HTTP 页面 -> ws://前端:3000/ws -> Vite代理 -> ws://后端:8082
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        wsUrl = `${protocol}//${host}/api/ws/chat/native?userId=${userId}`;
        
        console.log('🔄 使用代理连接:', wsUrl);
        
        console.log('🔍 调试信息:');
        console.log('  - 当前协议:', window.location.protocol);
        console.log('  - 当前主机:', window.location.host);
        console.log('  - WebSocket地址:', wsUrl);
        
        console.log('🔌 连接WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('✅ WebSocket连接成功:', wsUrl);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (err) {
            console.error('❌ 解析WebSocket消息失败:', err);
          }
        };
        
        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket连接关闭:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          
          // 如果不是主动关闭，尝试重连
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket连接错误:', error);
          console.error('🔍 检查项目：');
          console.error('  1. 后端服务是否在8082端口运行？');
          console.error('  2. 用户ID是否有效？', userId);
          console.error('  3. 网络连接是否正常？');
          this.isConnected = false;
          reject(error);
        };
        
      } catch (err) {
        console.error('❌ WebSocket连接失败:', err);
        console.error('🔍 检查项目：');
        console.error('  1. 后端服务是否在8082端口运行？');
        console.error('  2. 用户ID是否有效？', userId);
        console.error('  3. 网络连接是否正常？');
        reject(err);
      }
    });
  }

  // 重连
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ WebSocket重连次数已达上限');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 指数退避
    
    console.log(`🔄 WebSocket重连中... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId).catch(err => {
          console.error('❌ WebSocket重连失败:', err);
        });
      }
    }, delay);
  }

  // 断开连接
  disconnect() {
    console.log('🔌 主动断开WebSocket连接');
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, '主动断开');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.userId = null;
  }

  // 检查连接状态
  checkConnection() {
    const status = {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : null,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts
    };
    
    console.log('🔍 WebSocket连接状态:', status);
    return status;
  }

  // 发送消息
  send(message) {
    if (!this.isConnected || !this.ws) {
      console.error('❌ WebSocket未连接，无法发送消息');
      console.error('🔍 当前连接状态:', this.checkConnection());
      return false;
    }
    
    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
      
      this.ws.send(JSON.stringify(messageWithTimestamp));
      console.log('📤 发送WebSocket消息:', messageWithTimestamp);
      return true;
    } catch (err) {
      console.error('❌ 发送WebSocket消息失败:', err);
      return false;
    }
  }

  // 发送文本消息
  sendTextMessage(receiverId, content, replyToMessageId = null) {
    return this.send({
      type: 'send_message',
      data: {
        receiverId,
        messageType: 'text',
        content,
        replyToMessageId
      }
    });
  }

  // 发送群消息
  sendGroupMessage(groupId, messageType, content, replyToMessageId = null) {
    return this.send({
      type: 'send_message',
      data: {
        groupId,
        messageType,
        content,
        replyToMessageId
      }
    });
  }

  // 发送正在输入状态
  sendTypingStatus(receiverId, isTyping) {
    return this.send({
      type: 'typing',
      data: {
        receiverId,
        isTyping
      }
    });
  }

  // 标记消息已读
  markMessageRead(messageId) {
    return this.send({
      type: 'read_message',
      data: {
        messageId
      }
    });
  }

  // 加入群组
  joinGroup(groupId) {
    return this.send({
      type: 'join_group',
      data: {
        groupId
      }
    });
  }

  // 离开群组
  leaveGroup(groupId) {
    return this.send({
      type: 'leave_group',
      data: {
        groupId
      }
    });
  }

  // 处理接收到的消息
  handleMessage(message) {
    console.log('📥 收到WebSocket消息:', message);
    
    const { type, data } = message;
    
    // 调用对应的消息处理器
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data, message);
        } catch (err) {
          console.error('❌ 消息处理器执行失败:', err);
        }
      });
    }
  }

  // 注册消息处理器
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type).add(handler);
    
    // 返回取消注册的函数
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  // 移除消息处理器
  offMessage(type, handler) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(type);
      }
    }
  }

  // 开始心跳检测
  startHeartbeat() {
    this.stopHeartbeat(); // 先停止之前的心跳
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        // 按照修复指南的格式发送心跳
        this.send({
          type: 'heartbeat',
          timestamp: Date.now()
        });
        console.log('💓 发送心跳包');
      }
    }, 30000); // 30秒心跳
  }

  // 停止心跳检测
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 生成请求ID
  generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 获取连接状态
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      userId: this.userId
    };
  }
}

// 创建单例实例
const webSocketService = new WebSocketService();

export default webSocketService;

// 导出消息类型常量
export const MESSAGE_TYPES = {
  // 发送的消息类型
  SEND_MESSAGE: 'send_message',
  TYPING: 'typing',
  READ_MESSAGE: 'read_message',
  JOIN_GROUP: 'join_group',
  LEAVE_GROUP: 'leave_group',
  HEARTBEAT: 'heartbeat',
  
  // 接收的消息类型
  NEW_MESSAGE: 'new_message',
  NEW_GROUP_MESSAGE: 'new_group_message',
  GROUP_INVITATION: 'group_invitation',
  MEMBER_JOINED: 'member_joined',
  MEMBER_LEFT: 'member_left',
  SEND_MESSAGE_SUCCESS: 'send_message_success',
  TYPING_STATUS: 'typing_status',
  FRIEND_ONLINE_STATUS: 'friend_online_status',
  MESSAGE_READ_RECEIPT: 'message_read_receipt',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_REQUEST_HANDLED: 'friend_request_handled',
  GROUP_NOTIFICATION: 'group_notification',
  HEARTBEAT_RESPONSE: 'heartbeat_response',
  ERROR: 'error'
};

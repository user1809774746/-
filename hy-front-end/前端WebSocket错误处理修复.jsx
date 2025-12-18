// ============================================
// 前端 WebSocket 错误处理修复代码示例
// 文件：GroupChatConversationPage.jsx
// ============================================

// ❌ 修复前的错误代码（第156-157行）
/*
wsService.on('error', (data) => {
  console.log('❌ WebSocket错误:', data);         // data 可能是 undefined
  console.log(data.message);                       // ❌ 报错！
});
*/

// ✅ 修复后的正确代码
// 方案1：完整的错误处理（推荐）
wsService.on('error', (response) => {
  console.log('=== WebSocket 错误处理 ===');
  console.log('完整响应:', response);
  
  if (!response) {
    console.error('❌ 收到空的错误响应');
    return;
  }
  
  // 安全地获取错误消息
  const errorMessage = response.message || response.error || '未知错误';
  console.error('❌ WebSocket 错误:', errorMessage);
  
  // 显示错误提示给用户
  // 使用你的 UI 库，例如：
  // toast.error(errorMessage);
  // message.error(errorMessage);
  // 或简单的 alert
  if (window.showToast) {
    window.showToast(errorMessage, 'error');
  } else {
    alert('操作失败: ' + errorMessage);
  }
});

// 方案2：统一的消息处理器（更好的方式）
const handleWebSocketMessage = (response) => {
  console.log('📨 收到 WebSocket 消息:', response);
  
  // 安全检查
  if (!response) {
    console.error('❌ 空响应');
    return;
  }
  
  try {
    // 检查是否是错误消息
    if (response.type === 'error' || response.success === false) {
      const errorMsg = response.message || response.error || '操作失败';
      console.error('❌ 错误:', errorMsg);
      
      // 显示错误提示
      showErrorToast(errorMsg);
      return;
    }
    
    // 处理新群消息
    if (response.type === 'new_group_message') {
      if (response.data && response.data.groupId === currentGroupId) {
        console.log('✅ 收到群消息:', response.data.content);
        
        // 防止重复
        setMessages(prev => {
          if (prev.some(msg => msg.messageId === response.data.messageId)) {
            return prev;
          }
          return [...prev, response.data];
        });
      }
      return;
    }
    
    // 处理发送成功响应
    if (response.type === 'send_message_success') {
      console.log('✅ 消息发送成功');
      // 可以显示发送成功的提示
      return;
    }
    
  } catch (error) {
    console.error('❌ 处理消息时出错:', error);
    console.error('问题消息:', response);
  }
};

// 注册处理器
useEffect(() => {
  // 连接 WebSocket
  wsService.connect(currentUserId);
  
  // 注册所有类型的消息处理器
  wsService.on('error', handleWebSocketMessage);
  wsService.on('new_group_message', handleWebSocketMessage);
  wsService.on('send_message_success', handleWebSocketMessage);
  
  // 清理
  return () => {
    wsService.off('error', handleWebSocketMessage);
    wsService.off('new_group_message', handleWebSocketMessage);
    wsService.off('send_message_success', handleWebSocketMessage);
  };
}, [currentUserId, currentGroupId]);

// 方案3：使用可选链和默认值（最简洁）
wsService.on('error', (response) => {
  const errorMsg = response?.message || response?.error || '操作失败';
  console.error('❌ WebSocket 错误:', errorMsg);
  alert('操作失败: ' + errorMsg);
});

wsService.on('new_group_message', (response) => {
  const messageData = response?.data;
  if (!messageData) {
    console.error('❌ 无效的消息数据');
    return;
  }
  
  if (messageData.groupId === currentGroupId) {
    console.log('✅ 收到消息:', messageData.content);
    setMessages(prev => [...prev, messageData]);
  }
});

// ============================================
// 辅助函数
// ============================================

// 显示错误提示
const showErrorToast = (message) => {
  // 如果使用 Ant Design
  if (window.message) {
    window.message.error(message);
  }
  // 如果使用 React-Toastify
  else if (window.toast) {
    window.toast.error(message);
  }
  // 否则使用 alert
  else {
    alert('错误: ' + message);
  }
};

// 显示成功提示
const showSuccessToast = (message) => {
  if (window.message) {
    window.message.success(message);
  } else if (window.toast) {
    window.toast.success(message);
  }
};

// ============================================
// 完整的组件示例
// ============================================

import React, { useState, useEffect } from 'react';
import wsService from './WebSocketService';

function GroupChatConversationPage({ groupId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 连接 WebSocket
    const connect = async () => {
      try {
        await wsService.connect(currentUserId);
        setIsConnected(true);
        console.log('✅ WebSocket 连接成功');
      } catch (error) {
        console.error('❌ WebSocket 连接失败:', error);
        alert('连接失败，请刷新页面重试');
      }
    };
    
    connect();

    // 统一的消息处理器
    const handleMessage = (response) => {
      console.log('📨 WebSocket 消息:', response);
      
      if (!response) return;
      
      try {
        // 错误处理
        if (response.type === 'error' || response.success === false) {
          const errorMsg = response.message || '操作失败';
          console.error('❌ 错误:', errorMsg);
          alert('错误: ' + errorMsg);
          return;
        }
        
        // 新群消息
        if (response.type === 'new_group_message') {
          if (response.data?.groupId === groupId) {
            console.log('✅ 新消息:', response.data.content);
            setMessages(prev => {
              // 防止重复
              if (prev.some(msg => msg.messageId === response.data.messageId)) {
                return prev;
              }
              return [...prev, response.data];
            });
          }
        }
        
        // 发送成功
        if (response.type === 'send_message_success') {
          console.log('✅ 消息发送成功');
        }
        
      } catch (error) {
        console.error('❌ 处理消息失败:', error);
      }
    };

    // 注册处理器
    wsService.on('error', handleMessage);
    wsService.on('new_group_message', handleMessage);
    wsService.on('send_message_success', handleMessage);

    // 清理
    return () => {
      wsService.off('error', handleMessage);
      wsService.off('new_group_message', handleMessage);
      wsService.off('send_message_success', handleMessage);
    };
  }, [groupId, currentUserId]);

  // 发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim()) {
      alert('请输入消息内容');
      return;
    }

    if (!isConnected) {
      alert('WebSocket 未连接，请稍候重试');
      return;
    }

    try {
      wsService.send({
        type: 'send_message',
        data: {
          groupId: groupId,
          content: inputValue.trim(),
          messageType: 'text'
        }
      });
      
      setInputValue('');
      console.log('✅ 消息已发送');
    } catch (error) {
      console.error('❌ 发送失败:', error);
      alert('发送失败: ' + error.message);
    }
  };

  return (
    <div className="chat-container">
      <div className="connection-status">
        {isConnected ? '🟢 已连接' : '🔴 未连接'}
      </div>
      
      <div className="messages-list">
        {messages.map(msg => (
          <div key={msg.messageId} className="message-item">
            <span className="sender">{msg.senderName}: </span>
            <span className="content">{msg.content}</span>
            <span className="time">{msg.sentTime}</span>
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="输入消息..."
        />
        <button onClick={handleSendMessage}>发送</button>
      </div>
    </div>
  );
}

export default GroupChatConversationPage;

// ============================================
// 调试技巧
// ============================================

// 1. 在浏览器控制台查看所有 WebSocket 消息
wsService.onAny((eventName, data) => {
  console.log(`[WebSocket] ${eventName}:`, data);
});

// 2. 测试发送消息
wsService.send({
  type: 'send_message',
  data: {
    groupId: 1,
    content: '测试消息',
    messageType: 'text'
  }
});

// 3. 查看 WebSocket 连接状态
console.log('WebSocket 状态:', wsService.isConnected());

// 4. 手动触发错误来测试错误处理
wsService.send({
  type: 'send_message',
  data: {
    groupId: 999999,  // 不存在的群
    content: '测试',
    messageType: 'text'
  }
});

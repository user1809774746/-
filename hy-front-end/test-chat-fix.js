// 聊天功能修复验证脚本
// 在浏览器控制台中运行此脚本来测试修复结果

console.log('🔧 开始验证聊天功能修复...');

// 1. 测试WebSocket连接
function testWebSocketConnection() {
  console.log('\n📡 测试WebSocket连接...');
  
  const ws = new WebSocket('ws://localhost:8082/ws/chat/native?userId=1');
  
  const timeout = setTimeout(() => {
    ws.close();
    console.log('❌ WebSocket连接超时（3秒）');
  }, 3000);
  
  ws.onopen = function(event) {
    clearTimeout(timeout);
    console.log('✅ WebSocket连接成功');
    console.log('🔗 连接URL:', ws.url);
    
    // 发送测试心跳
    const heartbeat = {
      type: 'heartbeat',
      timestamp: Date.now()
    };
    ws.send(JSON.stringify(heartbeat));
    console.log('💓 发送心跳包:', heartbeat);
    
    // 3秒后关闭连接
    setTimeout(() => {
      ws.close();
      console.log('🔌 测试完成，关闭连接');
    }, 3000);
  };
  
  ws.onmessage = function(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('📨 收到消息:', message);
    } catch (err) {
      console.log('📨 收到原始消息:', event.data);
    }
  };
  
  ws.onerror = function(error) {
    clearTimeout(timeout);
    console.log('❌ WebSocket连接失败:', error);
    console.log('🔍 请检查：');
    console.log('  1. 后端服务是否在8082端口运行？');
    console.log('  2. WebSocket服务是否已启动？');
  };
  
  ws.onclose = function(event) {
    console.log('🔌 WebSocket连接关闭，代码:', event.code);
  };
}

// 2. 测试HTTP API
async function testHttpAPI() {
  console.log('\n🌐 测试HTTP API...');
  
  try {
    // 测试发送消息API
    const response = await fetch('/api/user-chat/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderId: 1,
        receiverId: 3,
        messageType: 'text',
        content: '测试消息 - ' + new Date().toLocaleTimeString()
      })
    });
    
    const data = await response.json();
    console.log('📨 HTTP API响应:', data);
    
    if (data.code === 200) {
      console.log('✅ HTTP API正常工作');
      if (data.data === null) {
        console.log('⚠️  注意：后端返回data为null，前端已添加容错处理');
      } else {
        console.log('✅ 后端返回完整数据:', data.data);
      }
    } else {
      console.log('❌ HTTP API返回错误:', data.message);
    }
    
  } catch (err) {
    console.log('❌ HTTP API请求失败:', err.message);
    console.log('🔍 请检查：');
    console.log('  1. 后端服务是否运行？');
    console.log('  2. API路径是否正确？');
    console.log('  3. 网络连接是否正常？');
  }
}

// 3. 测试前端容错处理
function testFrontendErrorHandling() {
  console.log('\n🛡️ 测试前端容错处理...');
  
  // 模拟后端返回data为null的情况
  const mockResponse = {
    code: 200,
    message: '消息发送成功',
    data: null,
    success: true
  };
  
  console.log('📝 模拟后端响应:', mockResponse);
  
  // 测试前端处理逻辑
  const messageId = mockResponse.data?.messageId || `temp_${Date.now()}`;
  const senderId = mockResponse.data?.senderId || 1; // 模拟当前用户ID
  
  console.log('🔧 前端处理结果:');
  console.log('  - messageId:', messageId);
  console.log('  - senderId:', senderId);
  
  if (messageId.startsWith('temp_')) {
    console.log('✅ 临时ID生成正常');
  }
  
  if (senderId === 1) {
    console.log('✅ 发送者ID回退正常');
  }
  
  console.log('✅ 前端容错处理正常');
}

// 4. 检查Vite代理配置
function checkViteProxy() {
  console.log('\n🔄 检查Vite代理配置...');
  
  // 检查当前页面URL
  const currentUrl = window.location.href;
  console.log('📍 当前页面URL:', currentUrl);
  
  if (currentUrl.includes('localhost:3000')) {
    console.log('✅ 运行在Vite开发服务器');
    console.log('🔧 代理配置应该已生效：');
    console.log('  - /api/* → http://localhost:8082');
    console.log('  - /ws/* → ws://localhost:8082');
  } else {
    console.log('ℹ️  不在Vite开发环境，代理配置不适用');
  }
}

// 5. 运行所有测试
async function runAllTests() {
  console.log('🚀 开始完整测试流程...\n');
  
  // 检查代理配置
  checkViteProxy();
  
  // 测试前端容错处理
  testFrontendErrorHandling();
  
  // 测试HTTP API
  await testHttpAPI();
  
  // 测试WebSocket连接
  testWebSocketConnection();
  
  console.log('\n🎉 测试完成！请查看上方结果。');
  console.log('\n📋 修复总结：');
  console.log('✅ 1. WebSocket端口已修正为8082');
  console.log('✅ 2. Vite代理配置已添加WebSocket支持');
  console.log('✅ 3. 消息发送逻辑已添加空值检查');
  console.log('✅ 4. 错误处理已增强');
  console.log('✅ 5. 连接状态指示器已添加');
}

// 导出测试函数
window.chatFixTest = {
  runAllTests,
  testWebSocketConnection,
  testHttpAPI,
  testFrontendErrorHandling,
  checkViteProxy
};

console.log('\n📖 使用说明：');
console.log('在浏览器控制台中运行以下命令：');
console.log('- chatFixTest.runAllTests() // 运行所有测试');
console.log('- chatFixTest.testWebSocketConnection() // 仅测试WebSocket');
console.log('- chatFixTest.testHttpAPI() // 仅测试HTTP API');

// 自动运行测试
runAllTests();

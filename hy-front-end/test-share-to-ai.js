/**
 * 测试分享旅行计划给AI功能
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 或者将其保存为HTML文件并在浏览器中打开
 */

// 测试数据
const testData = {
  travelPlanId: 19,
  userId: "4",
  sessionId: "4_13627508028", // 格式：用户ID_电话号码
  message: "我分享一个旅行计划：北京5日游",
  purpose: "discuss" // discuss, optimize, question
};

// 测试函数
async function testShareToAI() {
  console.log('🧪 开始测试分享旅行计划给AI功能...');
  console.log('📋 测试数据:', testData);
  
  try {
    // 构建API端点
    const baseUrl = window.location.origin;
    const endpoint = `${baseUrl}/api/travel-plans/${testData.travelPlanId}/share-to-ai`;
    
    console.log('🔗 请求端点:', endpoint);
    
    // 发送请求
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要认证，添加token
        // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        userId: testData.userId,
        sessionId: testData.sessionId,
        message: testData.message,
        purpose: testData.purpose
      })
    });
    
    console.log('📡 响应状态:', response.status);
    
    const result = await response.json();
    console.log('📥 响应结果:', result);
    
    // 验证响应
    if (response.ok && result.code === 200) {
      console.log('✅ 测试成功！分享功能正常工作');
      console.log('📝 AI回复:', result.data?.aiReply);
      console.log('💬 会话ID:', result.data?.sessionId);
    } else {
      console.error('❌ 测试失败:', result);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ 请求失败:', error);
    return null;
  }
}

// 如果在浏览器环境中，提供全局测试函数
if (typeof window !== 'undefined') {
  window.testShareToAI = testShareToAI;
  console.log('🎯 测试函数已准备就绪！');
  console.log('💡 在控制台中运行 testShareToAI() 来测试分享功能');
}

// 如果是Node.js环境，导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testShareToAI, testData };
}
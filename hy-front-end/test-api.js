/**
 * Dify API 测试脚本
 * 用于验证工作流配置是否正确
 * 
 * 运行方法：node test-api.js
 */

const workflowId = 'f5052e35-7b7c-4e1e-87e0-47013570d17d';
const apiKey = 'app-ANKBXobE6455WvSApR9gnQWC';
const apiUrl = `https://api.dify.ai/v1/workflows/${workflowId}/run`;

console.log('====================================');
console.log('  Dify API 测试');
console.log('====================================');
console.log('');
console.log('工作流ID:', workflowId);
console.log('API URL:', apiUrl);
console.log('');
console.log('正在发送测试请求...');
console.log('');

// 组合成一句话
const promptText = '我要通过自驾从北京到上海，给我生成两个方案：一个是最快路线方案一个是最省钱方案。需要的方案数据是：时间，详细路线，花费';

const requestBody = {
  inputs: {
    user_question: promptText  // ✅ 使用 user_question，匹配Dify工作流配置
  },
  response_mode: 'blocking',
  user: 'test-user'
};

console.log('组合的提示词:');
console.log(promptText);
console.log('');

console.log('请求参数:');
console.log(JSON.stringify(requestBody, null, 2));
console.log('');

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody)
})
  .then(async (response) => {
    console.log('====================================');
    console.log('响应状态:', response.status, response.statusText);
    console.log('====================================');
    console.log('');
    
    const data = await response.json();
    
    if (!response.ok) {
      console.log('❌ 请求失败！');
      console.log('');
      console.log('错误详情:');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      
      // 根据错误提供建议
      if (response.status === 404) {
        console.log('💡 解决建议：');
        console.log('1. 检查工作流ID是否正确');
        console.log('2. 确认工作流是否存在');
        console.log('3. 检查工作流是否启用了API访问');
      } else if (response.status === 401 || response.status === 403) {
        console.log('💡 解决建议：');
        console.log('1. 检查API密钥是否正确');
        console.log('2. 确认API密钥是否有权限访问此工作流');
      } else if (response.status === 400) {
        console.log('💡 解决建议：');
        console.log('1. 检查输入参数名称是否与工作流配置一致');
        console.log('2. 确认工作流中的变量名：出发地、目的地、出行方式');
        console.log('3. 如果使用英文变量名，请修改请求参数');
      }
    } else {
      console.log('✅ 请求成功！');
      console.log('');
      console.log('返回数据:');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      console.log('💡 如果返回数据格式正确，说明配置成功！');
      console.log('   现在可以在应用中正常使用AI功能了。');
    }
    console.log('');
  })
  .catch((error) => {
    console.log('❌ 网络错误！');
    console.log('');
    console.log('错误信息:', error.message);
    console.log('');
    console.log('💡 可能原因：');
    console.log('1. 网络连接问题');
    console.log('2. Dify服务不可用');
    console.log('3. 防火墙或代理阻止了请求');
  });


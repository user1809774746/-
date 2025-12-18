// Session ID 修复验证脚本
// 这个脚本用于验证sessionId格式是否正确

console.log('=== Session ID 修复验证 ===\n');

// 检查当前的sessionId
const currentSessionId = localStorage.getItem('chatSessionId');
console.log('当前 sessionId:', currentSessionId);

// 正确格式：数字_数字 (如：4_13627508028)
const correctFormat = /^\d+_\d+$/;
const isCorrectFormat = correctFormat.test(currentSessionId);

console.log('格式检查结果:', isCorrectFormat ? '✅ 正确' : '❌ 错误');

if (!isCorrectFormat) {
  console.log('\n🔧 需要清理错误的sessionId');
  console.log('错误的sessionId示例：');
  console.log('- share_plan_1701234567890');
  console.log('- guest_1701234567890');
  console.log('- 4_share_plan_123456789');
  
  console.log('\n✅ 正确的sessionId格式：用户ID_电话号码');
  console.log('例如：4_13627508028');
} else {
  console.log('\n✅ sessionId格式正确，符合要求！');
}

// 提取用户ID和电话号码（如果格式正确）
if (isCorrectFormat && currentSessionId) {
  const [userId, phoneNumber] = currentSessionId.split('_');
  console.log('\n📊 解析结果：');
  console.log('用户ID:', userId);
  console.log('电话号码:', phoneNumber);
}

console.log('\n=== 修复完成 ===');
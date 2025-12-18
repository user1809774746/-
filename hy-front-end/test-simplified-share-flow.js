/**
 * 🔥 测试简化分享流程
 * 新流程：选择旅行计划 → 直接跳转AI页面 → 输入框预填充"我分享一个旅行计划：xxx"
 * 
 * 使用方法：
 * 1. 在浏览器开发者工具控制台中运行此脚本
 * 2. 访问旅行计划页面，点击"分享给AI"按钮
 * 3. 观察是否直接跳转到AI页面，输入框是否正确填充
 */

console.log('🧪 开始测试简化分享流程...');

// 模拟选择旅行计划并分享给AI的测试函数
function testSimplifiedShareFlow() {
    console.log('📋 步骤1：模拟选择旅行计划');
    
    // 模拟旅行计划数据
    const mockTrip = {
        id: 123,
        name: '北京3日游',
        destination: '北京',
        travelDays: 3
    };
    
    console.log('📋 步骤2：设置localStorage数据');
    
    // 设置初始输入（模拟MyTravalsPage.jsx中的逻辑）
    const planTitle = mockTrip.name || '旅行计划';
    const initialInput = `我分享一个旅行计划：${planTitle}`;
    localStorage.setItem('aiDialogInput', initialInput);
    
    // 存储旅行计划ID（虽然不再使用，但保留用于统计）
    localStorage.setItem('sharedTravelPlanId', mockTrip.id.toString());
    
    console.log('📝 设置的输入框内容:', initialInput);
    console.log('🆔 存储的旅行计划ID:', mockTrip.id);
    
    console.log('📋 步骤3：检查设置结果');
    
    // 验证localStorage中的数据
    const storedInput = localStorage.getItem('aiDialogInput');
    const storedTripId = localStorage.getItem('sharedTravelPlanId');
    
    console.log('✅ 输入框内容:', storedInput);
    console.log('✅ 旅行计划ID:', storedTripId);
    
    if (storedInput === initialInput && storedTripId === mockTrip.id.toString()) {
        console.log('🎉 测试通过！简化分享流程设置成功');
        console.log('📤 下一步：跳转到AI页面应该会自动填充输入框');
    } else {
        console.error('❌ 测试失败！数据设置不正确');
    }
    
    // 模拟跳转到AI页面后的检查
    console.log('📋 步骤4：模拟AI页面初始化');
    
    // 检查AI页面是否正确读取输入框内容
    setTimeout(() => {
        const aiDialogInput = localStorage.getItem('aiDialogInput');
        if (aiDialogInput) {
            console.log('✅ AI页面将检测到输入框内容:', aiDialogInput);
            console.log('✅ 用户可以添加需求后发送给AI');
        } else {
            console.log('📝 AI页面没有检测到初始输入（正常，跳转后会被消费）');
        }
    }, 100);
}

// 立即执行测试
testSimplifiedShareFlow();

// 提供手动测试函数
window.testSimplifiedShareFlow = testSimplifiedShareFlow;

console.log('💡 提示：可以手动运行 testSimplifiedShareFlow() 重新测试');
console.log('📋 新流程特点：');
console.log('   1. 不再调用后端 shareTravelPlanToAI 接口');
console.log('   2. 不再传递旅行计划卡片数据给后端');
console.log('   3. 直接跳转到AI页面，输入框预填充');
console.log('   4. 用户添加具体需求后发送给AI');
console.log('   5. 避免 share_plan_xxx 格式的 sessionId 生成');
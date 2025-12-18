/**
 * 🔥 SessionId 强制清理脚本
 * 运行此脚本来清理所有错误格式的sessionId
 * 
 * 使用方法：
 * 1. 在浏览器开发者工具控制台中粘贴并运行此脚本
 * 2. 或者启动项目时自动加载
 */

console.log('🚀 开始执行sessionId强制清理...');

// 清理函数
function forceCleanSessionId() {
    // 获取当前存储的sessionId
    const currentSessionId = localStorage.getItem('chatSessionId');
    
    if (currentSessionId) {
        console.log('📋 当前的sessionId:', currentSessionId);
        
        // 检查是否包含错误格式
        if (currentSessionId.includes('share_plan') || 
            currentSessionId.includes('Share') || 
            !currentSessionId.match(/^\d+_\d+$/)) {
            
            console.log('🚨 检测到错误格式的sessionId，将被删除');
            
            // 删除错误的sessionId
            localStorage.removeItem('chatSessionId');
            
            // 也清理其他可能相关的存储
            const keysToClean = [
                'n8n_session_id',
                'coze_conversation_id',
                'sharedTravelPlanId',
                'aiDialogInput'
            ];
            
            keysToClean.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    console.log(`🧹 清理相关存储项: ${key}`);
                    localStorage.removeItem(key);
                }
            });
            
            console.log('✅ sessionId清理完成！');
            console.log('🔄 刷新页面后，系统将生成正确格式的sessionId');
            
            // 提示用户刷新页面
            if (confirm('sessionId已清理完成！是否立即刷新页面以生成新的正确sessionId？')) {
                window.location.reload();
            }
            
        } else {
            console.log('✅ 当前sessionId格式正确:', currentSessionId);
        }
    } else {
        console.log('📝 没有找到sessionId，刷新页面后将自动生成');
    }
}

// 立即执行清理
forceCleanSessionId();

// 导出清理函数以便后续调用
window.forceCleanSessionId = forceCleanSessionId;

console.log('💡 提示：以后可以手动运行 forceCleanSessionId() 来清理sessionId');
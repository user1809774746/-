/**
 * AI 接口配置文件
 * 
 * 使用说明：
 * 1. 在 Dify 平台创建工作流
 * 2. 获取工作流ID和API密钥
 * 3. 更新下面的配置
 */

const aiConfig = {
  // 是否启用AI功能
  enabled: true, // ⚠️ 暂时禁用 - 工作流404错误，请先在Dify中发布工作流
  
  // Dify 工作流ID（请替换为您的工作流ID）
  workflowId: 'f5052e35-7b7c-4e1e-87e0-47013570d17d',
  
  // Dify API密钥（请替换为您的API密钥）
  apiKey: 'app-KlMGfAYa04rXtZ8s5QFJVDbV',
  
  // API基础地址
  baseUrl: 'https://api.dify.ai/v1/workflows',
  
  // 请求超时时间（毫秒）
  timeout: 30000,
  
  // 输入字段配置
  // 注意：现在使用单个 query 字段，将用户输入组合成一句话
  // 格式："我要通过{出行方式}从{出发地}到{目的地}，给我生成两个方案..."
  inputFieldName: 'query'
};

// 构建完整的API URL
export const getApiUrl = () => {
  if (!aiConfig.enabled) return null;
  return `${aiConfig.baseUrl}/run`;
};

// 获取请求头
export const getHeaders = () => ({
  'Authorization': `Bearer ${aiConfig.apiKey}`,
  'Content-Type': 'application/json',
});

// 构建请求体
export const buildRequestBody = (from, to, mode) => {
  // 将用户输入组合成一句话
  const promptText = `我要通过${mode}从${from}到${to}，给我生成两个方案：一个是最快路线方案一个是最省钱方案。需要的方案数据是：时间，详细路线，花费`;
  
  return {
    inputs: {
      user_question: promptText  // ✅ 使用 user_question，匹配Dify工作流配置
    },
    response_mode: 'blocking',
    user: 'user-' + Date.now()
  };
};

export default aiConfig;


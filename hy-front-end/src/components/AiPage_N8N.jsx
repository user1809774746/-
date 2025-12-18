import React, { useState, useEffect, useRef } from "react";
import { sendChatMessage, getAIChatHistory as getChatHistory, getCurrentUserId, getUserProfile, API_CONFIG, apiRequest, shareTravelPlanToAI } from '../api/config';

/**
 * ═══════════════════════════════════════════════════════════════════
 * AI助手页面 - N8N后端版本
 * ═══════════════════════════════════════════════════════════════════
 * 
 * 功能说明：
 * 1. 支持上下文对话（通过sessionId管理）
 * 2. 自动加载历史消息
 * 3. 消息持久化存储到数据库（后端实现）
 * 4. 支持多用户独立会话
 * 
 * 后端API：
 * - POST /api/chat/send - 发送消息
 * - GET /api/chat/history?sessionId=xxx - 获取历史
 * 
 * ═══════════════════════════════════════════════════════════════════
 */
 
function extractJson(str) {
  console.log('🔍 extractJson: 开始解析，字符串长度:', str.length);
  
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let startIndex = -1;

  // 查找JSON对象的起始位置
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{' || str[i] === '[') {
      startIndex = i;
      console.log('🔍 找到JSON起始位置:', startIndex, '字符:', str[i]);
      break;
    }
  }

  if (startIndex === -1) {
    console.log('⚠️ 未找到JSON起始标记');
    return { json: null, remaining: str };
  }

  // 解析JSON对象
  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];

    // 处理转义字符
    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    // 处理字符串边界
    if (char === '"') {
      inString = !inString;
      continue;
    }

    // 在字符串内部，跳过所有字符
    if (inString) continue;

    // 处理嵌套深度
    if (char === '{' || char === '[') {
      depth++;
    } else if (char === '}' || char === ']') {
      depth--;
      
      // 找到完整的JSON对象
      if (depth === 0) {
        try {
          const jsonString = str.substring(startIndex, i + 1);
          console.log('🔍 尝试解析JSON，长度:', jsonString.length);
          const json = JSON.parse(jsonString);
          const remaining = str.substring(i + 1);
          console.log('✅ JSON解析成功，剩余字符:', remaining.length);
          return { json, remaining };
        } catch (e) {
          console.error('❌ JSON解析失败:', e.message);
          // 继续查找下一个可能的JSON对象
          continue;
        }
      }
    }
  }

  console.log('⚠️ 未找到完整的JSON对象，可能数据不完整');
  return { json: null, remaining: str };
}

function processStream(reader, decoder, onItem, onComplete, onError) {
  let buffer = '';
  let chunkCount = 0;
  let totalBytes = 0;
  let allJsonObjects = []; // 🔥 存储所有解析到的JSON对象

  console.log('🌊 开始处理流式数据...');

  function readStream() {
    reader.read().then(({ done, value }) => {
      if (done) {
        console.log('🏁 流读取完成');
        console.log('📊 统计: 共接收', chunkCount, '个数据块，总计', totalBytes, '字节');
        console.log('📦 缓冲区剩余字符数:', buffer.length);
        
        // 处理缓冲区中的剩余数据
        try {
          if (buffer.trim()) {
            console.log('🔄 处理缓冲区剩余数据...');
            const result = extractJson(buffer.trim());
            if (result.json) {
              const json = result.json;
              allJsonObjects.push(json); // 🔥 收集所有JSON对象
              let piece = null;
              if (json.type === 'item' && json.content !== undefined) {
                piece = json.content;
              } else if (json.type === 'message' && typeof json.text === 'string') {
                piece = json.text;
              }
              if (piece !== null) {
                console.log('✅ 从缓冲区提取到内容，长度:', piece.length);
                onItem(piece);
              }
            } else {
              console.log('⚠️ 缓冲区剩余数据无法解析为JSON');
            }
          }
        } catch (e) {
          console.error('❌ 处理最终缓冲区数据时出错:', e);
        }

        console.log('✅ 流处理完成，收集到', allJsonObjects.length, '个JSON对象');
        onComplete(allJsonObjects); // 🔥 传递所有JSON对象
        return;
      }

      // 接收新数据
      const chunk = decoder.decode(value, { stream: true });
      chunkCount++;
      totalBytes += chunk.length;
      console.log(`📥 接收数据块 #${chunkCount}，大小: ${chunk.length} 字节`);
      
      buffer += chunk;
      console.log('📦 当前缓冲区大小:', buffer.length, '字节');

      // 尝试从缓冲区提取JSON对象
      let extractionResult = extractJson(buffer);
      let extractedCount = 0;
      
      while (extractionResult && extractionResult.json) {
        extractedCount++;
        const json = extractionResult.json;
        buffer = extractionResult.remaining;
        console.log(`✅ 提取JSON对象 #${extractedCount}，剩余缓冲区:`, buffer.length, '字节');

        try {
          allJsonObjects.push(json); // 🔥 收集所有JSON对象
          let piece = null;
          if (json.type === 'item' && json.content !== undefined) {
            piece = json.content;
            console.log('📝 提取到item内容，长度:', piece.length);
          } else if (json.type === 'message' && typeof json.text === 'string') {
            piece = json.text;
            console.log('📝 提取到message文本，长度:', piece.length);
          } else {
            console.log('⚠️ JSON对象格式不符合预期:', json);
          }
          
          if (piece !== null) {
            onItem(piece);
          }
        } catch (e) {
          console.error('❌ 处理JSON对象时出错:', e, json);
        }

        // 继续尝试提取下一个JSON对象
        extractionResult = extractJson(buffer);
      }

      if (extractedCount > 0) {
        console.log(`✅ 本次共提取 ${extractedCount} 个JSON对象`);
      }

      // 继续读取下一个数据块
      readStream();
    }).catch(error => {
      console.error('❌ 流处理错误:', error);
      console.log('📦 错误时缓冲区大小:', buffer.length, '字节');
      
      // 尝试保存已接收的部分内容
      try {
        if (buffer.trim()) {
          console.log('🔄 尝试从错误缓冲区恢复数据...');
          const result = extractJson(buffer.trim());
          if (result.json) {
            const json = result.json;
            let piece = null;
            if (json.type === 'item' && json.content !== undefined) {
              piece = json.content;
            } else if (json.type === 'message' && typeof json.text === 'string') {
              piece = json.text;
            }
            if (piece !== null) {
              console.log('✅ 从错误缓冲区恢复了部分内容');
              onItem(piece);
            }
          }
        }
      } catch (e) {
        console.error('❌ 处理错误后的缓冲区数据时出错:', e);
      }

      onError(error);
    });
  }

  readStream();
}

const callStreamingChatApi = (message, currentUserId, currentSessionId, originalTravelPlanId, onContentUpdate, onComplete, onError) => {
  let normalizedUserId = currentUserId;
  if (typeof currentUserId === 'string') {
    const parsed = parseInt(currentUserId, 10);
    if (!Number.isNaN(parsed)) {
      normalizedUserId = parsed;
    }
  }

  const requestBody = {
    sessionId: currentSessionId,
    userId: normalizedUserId,
    chatInput: message
  };

  if (originalTravelPlanId) {
    requestBody.originalTravelPlanId = originalTravelPlanId;
  }

  const token = localStorage.getItem('auth_token');
  const url = `${API_CONFIG.BASE_URL || ''}${API_CONFIG.ENDPOINTS.CHAT_STREAM}`;
  console.log('🔍 实际请求URL:', url);
  console.log('🔍 BASE_URL:', API_CONFIG.BASE_URL);
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(requestBody)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }
      if (!response.body) {
        throw new Error('当前环境不支持流式响应');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      let fullResponseData = null; // 🔥 用于存储完整的后端响应数据

      processStream(
        reader,
        decoder,
        (content) => {
          accumulatedContent += content;
          onContentUpdate(accumulatedContent);
        },
        (allJsonObjects) => {
          // 🔥 从收集的所有JSON对象中查找包含travelPlanId和travelPlan的完整数据
          console.log('🔍 收集到', allJsonObjects.length, '个JSON对象，开始查找完整响应数据...');
          
          // 优先查找包含 travelPlanId 或 travel_plan 或 travelplan 的对象（保存旅行计划时的响应）
          for (let i = allJsonObjects.length - 1; i >= 0; i--) {
            const obj = allJsonObjects[i];
            if (obj && (obj.travelPlanId !== undefined || obj.travel_plan !== undefined || obj.travelplan !== undefined)) {
              fullResponseData = obj;
              console.log('🎯 找到保存旅行计划的完整响应数据:', fullResponseData);
              console.log('📋 旅行计划数据详情:', JSON.stringify(fullResponseData, null, 2));
              
              // 提取旅行计划ID
              if (fullResponseData.travelplan && fullResponseData.travelplan.id) {
                console.log('✅ 成功提取到旅行计划ID:', fullResponseData.travelplan.id);
              } else if (fullResponseData.travelPlanId) {
                console.log('✅ 成功提取到旅行计划ID:', fullResponseData.travelPlanId);
              } else if (fullResponseData.travel_plan && fullResponseData.travel_plan.id) {
                console.log('✅ 成功提取到旅行计划ID:', fullResponseData.travel_plan.id);
              } else {
                console.warn('⚠️ 未能提取到旅行计划ID，请检查数据结构');
              }
              break;
            }
          }
          
          // 查找包含 code/data 的完整响应对象（通用响应格式）
          if (!fullResponseData) {
            for (let i = allJsonObjects.length - 1; i >= 0; i--) {
              const obj = allJsonObjects[i];
              if (obj && (obj.code !== undefined || obj.data !== undefined)) {
                fullResponseData = obj;
                console.log('🎯 找到通用格式的完整响应数据:', fullResponseData);
                break;
              }
            }
          }
          
          // 如果都没找到，使用最后一个对象
          if (!fullResponseData && allJsonObjects.length > 0) {
            const lastObj = allJsonObjects[allJsonObjects.length - 1];
            if (lastObj && typeof lastObj === 'object') {
              fullResponseData = lastObj;
              console.log('📦 使用最后一个JSON对象作为响应数据:', fullResponseData);
            }
          }
          
          onComplete(accumulatedContent, fullResponseData);
        },
        (error) => {
          onError(error, accumulatedContent);
        }
      );
    })
    .catch(error => {
      console.error('请求错误:', error);
      onError(error, '');
    });
};

// Markdown解析和美化工具函数
const parseMarkdown = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // 先处理代码块（避免代码块内的内容被其他规则处理）
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const id = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre class="bg-gray-100 p-3 rounded-lg my-2 overflow-x-auto border border-gray-200"><code class="text-sm">${escapeHtml(code)}</code></pre>`);
    return id;
  });
  
  // 处理行内代码
  const inlineCodes = [];
  html = html.replace(/`([^`\n]+)`/g, (match, code) => {
    const id = `__INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push(`<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">${escapeHtml(code)}</code>`);
    return id;
  });
  
  // 转义HTML特殊字符
  html = escapeHtml(html);
  
  // 恢复代码块
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block);
  });
  
  // 恢复行内代码
  inlineCodes.forEach((code, index) => {
    html = html.replace(`__INLINE_CODE_${index}__`, code);
  });
  
  // 标题 (# ## ###)
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-gray-800 flex items-center"><i class="fa-solid fa-hashtag text-blue-500 mr-2 text-sm"></i>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2 text-gray-800 flex items-center"><i class="fa-solid fa-hashtag text-blue-500 mr-2"></i>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-800 flex items-center"><i class="fa-solid fa-hashtag text-blue-500 mr-2"></i>$1</h1>');
  
  // 粗体 (**text** 或 __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-bold text-gray-900">$1</strong>');
  
  // 斜体 (*text* 或 _text_)
  html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em class="italic text-gray-700">$1</em>');
  html = html.replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, '<em class="italic text-gray-700">$1</em>');
  
  // 链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline inline-flex items-center"><i class="fa-solid fa-link text-xs mr-1"></i>$1</a>');
  
  // 列表项 (- item 或 * item)
  html = html.replace(/^[-*] (.*$)/gim, '<li class="ml-4 list-disc text-gray-700">$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal text-gray-700">$2</li>');
  
  // 用<ul>包裹连续的列表项
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-2 space-y-1 pl-2">$&</ul>');
  
  // 分割线 (--- 或 ***)
  html = html.replace(/^[-*]{3,}$/gim, '<hr class="my-4 border-t-2 border-gray-300" />');
  
  // 段落（将连续的非标签文本包裹在<p>中）
  const lines = html.split('\n');
  const processedLines = [];
  let currentParagraph = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentParagraph.length > 0) {
        processedLines.push(`<p class="my-2 leading-relaxed text-gray-700">${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
      processedLines.push('');
    } else if (trimmed.match(/^<[h|u|o|l|p|d|h|s]/) || trimmed.match(/<\/[h|u|o|l|p|d|h|s]>/)) {
      if (currentParagraph.length > 0) {
        processedLines.push(`<p class="my-2 leading-relaxed text-gray-700">${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
      processedLines.push(line);
    } else {
      currentParagraph.push(trimmed);
    }
  });
  
  if (currentParagraph.length > 0) {
    processedLines.push(`<p class="my-2 leading-relaxed text-gray-700">${currentParagraph.join(' ')}</p>`);
  }
  
  html = processedLines.join('\n');
  
  return html;
};

// HTML转义函数
const escapeHtml = (text) => {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  // 降级方案：手动转义
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 解析内容，将文本和图片分段
const parseContentWithImages = (text) => {
  if (!text) return [];
  
  console.log('� 开开始解析内容，文本长度:', text.length);
  
  const segments = [];
  let currentText = text;
  let lastIndex = 0;
  
  // 匹配所有图片URL和Markdown图片
  const imagePattern = /(?:!\[([^\]]*)\]\(([^)]+)\))|(https?:\/\/[^\s<>"'()]+\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tiff)(?:\?[^\s<>"'()]*)?)/gi;
  
  let match;
  while ((match = imagePattern.exec(text)) !== null) {
    // 添加图片前的文本
    if (match.index > lastIndex) {
      const textSegment = text.substring(lastIndex, match.index).trim();
      if (textSegment) {
        segments.push({ type: 'text', content: textSegment });
      }
    }
    
    // 添加图片
    const imageUrl = match[2] || match[0]; // Markdown图片的URL或直接的URL
    segments.push({ type: 'image', url: imageUrl });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加剩余的文本
  if (lastIndex < text.length) {
    const textSegment = text.substring(lastIndex).trim();
    if (textSegment) {
      segments.push({ type: 'text', content: textSegment });
    }
  }
  
  console.log('✅ 解析完成，共', segments.length, '个片段');
  return segments;
};

// 检测并提取图片URL
const extractImageUrls = (text) => {
  if (!text) return [];
  
  console.log('🖼️ 开始提取图片URL，文本长度:', text.length);
  
  const imageUrls = [];
  
  // 1. 匹配Markdown图片语法: ![alt](url)
  const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownImagePattern.exec(text)) !== null) {
    const url = match[2].trim();
    if (url) {
      console.log('📸 发现Markdown图片:', url);
      imageUrls.push(url);
    }
  }
  
  // 2. 匹配常见的图片URL格式（包括带查询参数的）
  // 支持更多图片格式：jpg, jpeg, png, gif, webp, bmp, svg, ico, tiff
  const imageUrlPattern = /(https?:\/\/[^\s<>"'()]+\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tiff)(\?[^\s<>"'()]*)?)/gi;
  const matches = text.match(imageUrlPattern);
  
  if (matches) {
    matches.forEach(url => {
      console.log('📸 发现图片URL:', url);
      imageUrls.push(url);
    });
  }
  
  // 去重，但保持原始顺序
  const uniqueUrls = [];
  const seen = new Set();
  imageUrls.forEach(url => {
    if (!seen.has(url)) {
      seen.add(url);
      uniqueUrls.push(url);
    }
  });
  
  console.log('✅ 提取到', uniqueUrls.length, '个图片URL:', uniqueUrls);
  return uniqueUrls;
};

// 从文本中移除图片URL（避免重复显示）
const removeImageUrls = (text) => {
  if (!text) return text;
  
  console.log('🧹 开始清理图片URL，原始文本长度:', text.length);
  
  let cleanedText = text;
  
  // 1. 移除Markdown图片语法: ![alt](url)
  cleanedText = cleanedText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
  
  // 2. 移除图片URL
  const imageUrlPattern = /(https?:\/\/[^\s<>"'()]+\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tiff)(\?[^\s<>"'()]*)?)/gi;
  cleanedText = cleanedText.replace(imageUrlPattern, '');
  
  // 3. 清理多余的空白和标点
  // 移除多个连续空格
  cleanedText = cleanedText.replace(/\s+/g, ' ');
  // 移除行首行尾空白
  cleanedText = cleanedText.trim();
  // 移除孤立的破折号或连字符
  cleanedText = cleanedText.replace(/\s+-\s+/g, ' ');
  // 移除多余的换行
  cleanedText = cleanedText.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  console.log('✅ 清理后文本长度:', cleanedText.length);
  return cleanedText;
};

const AiPage = ({ onBackToHome, initialInput, onNavigateToMytTravalPlan, initialMessage }) => {
  // ═══════════════════════════════════════════════════════════════════
  // 状态管理
  // ═══════════════════════════════════════════════════════════════════
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const hasHandledInitialInputRef = useRef(false);
  
  // 用户ID和会话ID

  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  
  // 分享的旅行计划ID
  const [sharedTravelPlanId, setSharedTravelPlanId] = useState(null);

  // ═══════════════════════════════════════════════════════════════════
  // 初始化：获取用户ID和会话ID
  // ═══════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    initializeSession();
  }, []);

  // 处理初始输入内容（已移动到initializeSession中处理）
  // useEffect(() => {
  //   // 初始输入处理逻辑已移动到checkAndHandleInitialInput函数中
  // }, [initialInput]);

  const initializeSession = async () => {
    console.log('🚀 初始化AI助手会话...');
    
    // 🔥 0️⃣ 全局sessionId格式检查和清理（在所有操作之前执行）
    const currentStoredSessionId = localStorage.getItem('chatSessionId');
    if (currentStoredSessionId) {
      // 如果检测到错误格式（包含share_plan或格式不正确），立即清理
      if (currentStoredSessionId.includes('share_plan') || !currentStoredSessionId.match(/^\d+_\d+$/)) {
        console.log('🚨 初始化时检测到错误sessionId，立即清理:', currentStoredSessionId);
        localStorage.removeItem('chatSessionId');
        console.log('🗑️ 已删除错误的sessionId');
      }
    }
    
    // 1️⃣ 获取用户ID和电话号码
    let currentUserId = '';
    let userPhone = '';
    
    try {
      currentUserId = await getCurrentUserId();
      
      // 获取用户信息以获取电话号码
      const userProfile = await getUserProfile();
      if (userProfile && userProfile.code === 200 && userProfile.data) {
        userPhone = userProfile.data.phone || userProfile.data.phoneNumber || '';
      }
    } catch (e) {
      console.error('获取当前用户信息失败:', e);
    }

    if (!currentUserId) {
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        currentUserId = storedUserId;
      } else {
        // 生成临时用户ID（未登录场景使用）
        currentUserId = `guest_${Date.now()}`;
      }
    }

    setUserId(currentUserId.toString());
    console.log('👤 用户ID:', currentUserId);
    console.log('📱 用户电话:', userPhone);

    // 2️⃣ 获取或创建会话ID - 只有用户ID+电话号码格式才是正确的
  let currentSessionId = localStorage.getItem('chatSessionId');
  
  // 🔥 修复：检测并清理错误的sessionId格式（如share_plan_xxx）
  if (currentSessionId) {
    // 如果sessionId格式不正确（包含非数字字符，除了下划线），则重置
    if (!currentSessionId.match(/^\d+_\d+$/)) {
      console.log('🧹 检测到错误的sessionId格式，将被清理:', currentSessionId);
      currentSessionId = null;
    }
  }
    
    if (!currentSessionId) {
      // 创建正确的会话ID：用户ID + 电话号码（如果电话号码存在）
      if (userPhone) {
        currentSessionId = `${currentUserId}_${userPhone}`;
      } else {
        // 如果没有电话号码，使用时间戳作为降级方案
        currentSessionId = `${currentUserId}_${Date.now()}`;
      }
      localStorage.setItem('chatSessionId', currentSessionId);
      console.log('🆕 创建新会话:', currentSessionId);
    } else {
      console.log('🔄 使用现有会话:', currentSessionId);
    }          
    setSessionId(currentSessionId);

    // 3️⃣ 加载历史消息
    await loadChatHistory(currentSessionId, currentUserId);
    
    // 4️⃣ 会话初始化完成后，检查并处理初始输入
    setTimeout(() => {
      checkAndHandleInitialInput(currentUserId, currentSessionId);
    }, 500);
  };

  // 检查并处理初始输入
  const checkAndHandleInitialInput = (currentUserId, currentSessionId) => {
    console.log('🔍 检查初始输入...');
    console.log('🔍 当前参数:', { currentUserId, currentSessionId });

    // 避免在严格模式或重复调用时多次处理初始输入
    if (hasHandledInitialInputRef.current) {
      console.log('⚠️ 初始输入已处理过，本次跳过');
      return;
    }
    
    // 检查是否有分享的旅行计划ID
    const storedTravelPlanId = localStorage.getItem('sharedTravelPlanId');
    if (storedTravelPlanId) {
      setSharedTravelPlanId(storedTravelPlanId);
      localStorage.removeItem('sharedTravelPlanId');
      console.log('📋 加载分享的旅行计划ID:', storedTravelPlanId);
    }

    // 1️⃣ 优先处理来自 CreatePlanAiPage 的 initialMessage
    if (initialMessage) {
      console.log('📝 发现初始消息 initialMessage:', initialMessage);
      hasHandledInitialInputRef.current = true;
      setInputValue(initialMessage);

      console.log('🚀 自动发送初始消息（来自旅行规划页）');
      setTimeout(() => {
        handleSendWithInputStreaming(initialMessage, currentUserId, currentSessionId);
      }, 1000);
      return;
    }
    
    // 2️⃣ 再处理 localStorage 中的初始输入（分享旅行计划 / 首页输入框等）
    const storedInput = localStorage.getItem('aiDialogInput');
    if (storedInput) {
      console.log('📝 发现localStorage中的初始输入:', storedInput);
      hasHandledInitialInputRef.current = true;
      setInputValue(storedInput);
      localStorage.removeItem('aiDialogInput');
      
      // 分享旅行计划的情况：只显示在输入框，不自动发送
      // 用户可以在后面添加其他需求，然后自己发送
      const isSharePlan = storedInput.includes('我分享一个旅行计划');
      if (isSharePlan) {
        console.log('📤 这是分享旅行计划，已设置输入框，等待用户发送');
        return;
      }
      
      // 其他情况：自动发送消息
      console.log('🚀 自动发送初始消息');
      setTimeout(() => {
        handleSendWithInputStreaming(storedInput, currentUserId, currentSessionId);
      }, 1000);
      return;
    }
    
    // 3️⃣ 最后处理 props.initialInput
    if (initialInput) {
      console.log('📝 发现props中的初始输入:', initialInput);
      hasHandledInitialInputRef.current = true;
      setInputValue(initialInput);
      
      // 检查是否是分享旅行计划
      const isSharePlan = initialInput.includes('我分享一个旅行计划');
      if (isSharePlan) {
        console.log('📤 这是分享旅行计划，已设置输入框，等待用户发送');
        return;
      }
      
      // 自动发送消息 - 传递正确的参数
      console.log('🚀 自动发送初始消息');
      setTimeout(() => {
        handleSendWithInputStreaming(initialInput, currentUserId, currentSessionId);
      }, 1000);
      return;
    }
    
    console.log('📝 没有发现初始输入');
  };


  // ═══════════════════════════════════════════════════════════════════
  // 加载聊天历史
  // ═══════════════════════════════════════════════════════════════════

    /**
     * 
     * @param {string} sessionId 
     * @param {string} currentUserId 
     */
  const loadChatHistory = async (sessionId,currentUserId=userId) => {
    try {
      console.log('📚 正在加载聊天历史...');
      setLoadingHistory(true);

      const response = await getChatHistory(sessionId);
      
      console.log('📦 历史消息响应:', response);

      console.log('📊 历史消息响应类型:', typeof response);
      console.log('📊 历史消息响应详情:', JSON.stringify(response, null, 2));

      let historyMessages = [];
      if (response && Array.isArray(response)) {
        historyMessages=response;
        // // 后端直接返回消息数组
        // const formattedMessages = response.map(item => ({
        //   id: item.id,
        //   text: item.message,
        //   sender: item.userId === userId ? 'user' : 'ai',
        //   timestamp: formatTimestamp(item.createdAt)
        // }));
        
        // setMessages(formattedMessages);
        // console.log(`✅ 加载了 ${formattedMessages.length} 条历史消息`);
      } else if (response && response.data) {
        // 后端返回 { data: {...} } 格式
        if (Array.isArray(response.data)) {
          historyMessages=response.data;
          // // data 是数组
          // const formattedMessages = response.data.map(item => ({
          //   id: item.id,
          //   text: item.message,
          //   sender: item.userId === userId ? 'user' : 'ai',
          //   timestamp: formatTimestamp(item.createdAt)
          // }));
          
          // setMessages(formattedMessages);
        //  console.log(`✅ 加载了 ${formattedMessages.length} 条历史消息`);
        } else if (response.data.list && Array.isArray(response.data.list)) {
          // data 是对象，包含 list 数组
          historyMessages=response.data.list;
        } else if (response.data.messages && Array.isArray(response.data.messages)) {
          // 🔥 关键修复：data 是对象，包含 messages 数组（您的后端返回格式）
          historyMessages=response.data.messages;
          console.log('✅ 从 response.data.messages 中获取到消息列表');
        } else {
          // data 是对象但不包含有效的消息列表
          console.log('📝 data对象不包含消息列表，这是新对话');
          historyMessages=[];
        }
      } else {
        console.log('📝 没有历史消息，这是新对话');
        historyMessages=[];
      }
      // 过滤掉不需要展示的固定AI欢迎语
      const UNWANTED_AI_TEXTS = [
        '我可以为您推荐热门旅游景点和制定旅游路线。请告诉我您想去哪个城市或地区？',
      ];

      historyMessages = historyMessages.filter((item) => {
        if (!item) return false;
        const role = item.role || '';
        const text = (item.content || item.message || '').trim();
        // 仅在是 AI 消息且内容完全匹配时过滤掉
        if (role === 'assistant' && UNWANTED_AI_TEXTS.includes(text)) {
          return false;
        }
        return true;
      });
      // 将历史消息格式化为前端需要的格式
      // 🔥 按时间排序，确保消息顺序正确
      const sortedMessages = historyMessages.sort((a, b) => 
        new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
      );
      
      // 🔥 根据后端返回的role字段判断消息类型
      const formattedMessages = sortedMessages.map((item) => ({
        id: item.id,
        text: item.content || item.message,  // 支持content或message字段
        sender: item.role === 'user' ? 'user' : 'ai',  // 根据role字段判断
        timestamp: formatTimestamp(item.timestamp || item.createdAt)
      }));
      
      setMessages(formattedMessages);
      console.log(`✅ 加载了 ${formattedMessages.length} 条历史消息`);

    } catch (error) {
      console.error('❌ 加载历史消息失败:', error);
      // 不影响用户使用，继续使用空消息列表
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

   /**
   * 格式化时间戳
   * @param {string} isoString - ISO格式的时间字符串
   * @returns {string} 格式化后的时间（HH:MM）
   */
  // 格式化时间戳
  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // ═══════════════════════════════════════════════════════════════════
  // 自动滚动到最新消息
  // ═══════════════════════════════════════════════════════════════════
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ═══════════════════════════════════════════════════════════════════
  // 发送消息 & 保存成功后跳转行程
  // ═══════════════════════════════════════════════════════════════════

  const navigateToLatestTravelPlan = async () => {
    if (!onNavigateToMytTravalPlan) return;

    try {
      // 优先使用当前 state 中的 userId，其次尝试重新获取
      let currentUserId = userId;
      if (!currentUserId) {
        try {
          currentUserId = await getCurrentUserId();
        } catch (e) {
          console.warn('从AI页面获取当前用户ID失败:', e);
        }
      }

      if (!currentUserId) {
        // 没有用户ID时，退回到默认行为
        onNavigateToMytTravalPlan();
        return;
      }

      // 🔥 使用新的API直接获取最新旅行计划
      const endpoint = API_CONFIG.ENDPOINTS.GET_USER_LATEST_TRAVEL_PLAN.replace('{userId}', currentUserId);
      console.log('🔍 获取最新旅行计划:', endpoint);
      const response = await apiRequest(endpoint, { method: 'GET' });

      if (response && response.code === 200 && response.data && response.data.id) {
        const latestPlan = response.data;
        console.log('✅ 获取到最新旅行计划:', latestPlan);
        
        // 只需要传递 id，详情页会自己根据 id 拉完整行程
        onNavigateToMytTravalPlan({
          id: latestPlan.id,
          destination: latestPlan.destination,
          travelDays: latestPlan.travelDays
        });
      } else {
        console.warn('⚠️ 未获取到最新旅行计划，使用默认跳转');
        onNavigateToMytTravalPlan();
      }
    } catch (error) {
      console.error('❌ 从AI页面跳转到最新行程失败:', error);
      onNavigateToMytTravalPlan();
    }
  };

  // 从后端响应中提取 travelPlanId（兼容多种返回结构）
  const extractTravelPlanId = (response) => {
    if (!response) return null;

    // 直接是数字
    if (typeof response === 'number') {
      return response;
    }

    // 顶层字段: travelPlanId / travel_plan_id / travelPlan.id / travel_plan.id / travelplan.id
    if (response.travelPlanId) {
      return response.travelPlanId;
    }
    if (response.travel_plan_id) {
      return response.travel_plan_id;
    }
    if (response.travelPlan && response.travelPlan.id) {
      return response.travelPlan.id;
    }
    if (response.travel_plan && response.travel_plan.id) {
      return response.travel_plan.id;
    }
    if (response.travelplan && response.travelplan.id) {
      return response.travelplan.id;
    }

    // data 下的字段，兼容对象或数组
    if (response.data) {
      const data = response.data;
      const candidates = Array.isArray(data) ? data : [data];

      for (const item of candidates) {
        if (!item || typeof item !== 'object') continue;

        if (item.travelPlanId) {
          return item.travelPlanId;
        }
        if (item.travel_plan_id) {
          return item.travel_plan_id;
        }
        if (item.travelPlan && item.travelPlan.id) {
          return item.travelPlan.id;
        }
        if (item.travel_plan && item.travel_plan.id) {
          return item.travel_plan.id;
        }
        if (item.travelplan && item.travelplan.id) {
          return item.travelplan.id;
        }
      }
    }

    // 顶层就是数组的情况（例如 n8n 返回 [ { text, travel_plan: { id } } ]）
    if (Array.isArray(response)) {
      for (const node of response) {
        const id = extractTravelPlanId(node);
        if (id) return id;
      }
    }

    return null;
  };

  const maybeNavigateToTravelPlan = (userInputText, aiReply, response) => {
    // 🚫 已禁用自动跳转：用户保存后不进行任何跳转操作，只正常输出流式文本
    console.log('📝 保存旅行计划完成，不自动跳转');
    return;
    
    /* 原跳转逻辑已注释
    if (!onNavigateToMytTravalPlan) return;
    const trimmed = (userInputText || '').trim();
    const isSaveCommand = trimmed === '保存' || trimmed.includes('保存行程');
    if (!isSaveCommand) return;

    const aiText = typeof aiReply === 'string' ? aiReply : '';
    const successFromAi = aiText.includes('保存成功');
    const successFromResponse =
      response === 'succeed' ||
      response === 'success' ||
      (response && (response.message === 'success' || response.code === 200));

    if (successFromAi || successFromResponse) {
      // 优先使用后端返回的 travelPlanId（例如 response.data.travelPlanId）
      const travelPlanId = extractTravelPlanId(response);

      if (travelPlanId) {
        // 只需传入 id，MyTravalPlanPage 会根据 id 再去拉完整行程
        onNavigateToMytTravalPlan({ id: travelPlanId });
      } else {
        // 兼容旧逻辑：如果没有返回 travelPlanId，则退回到"最新一条行程"策略
        navigateToLatestTravelPlan();
      }
    }
    */
  };

  const handleSendWithInputStreaming = async (messageText, providedUserId = null, providedSessionId = null) => {
    if (!messageText.trim()) return;

    // 🔥 所有消息（包括「保存」指令）都走流式接口

    const currentUserId = providedUserId || userId;
    let currentSessionId = providedSessionId || sessionId;
    
    // 🔥 强制sessionId格式验证
    if (currentSessionId) {
      if (currentSessionId.includes('share_plan') || !currentSessionId.match(/^\d+_\d+$/)) {
        console.error('🚨 检测到错误格式的sessionId，阻止发送:', currentSessionId);
        
        // 生成正确的sessionId
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const userPhone = userInfo.phone;
        if (userPhone) {
          currentSessionId = `${currentUserId}_${userPhone}`;
          setSessionId(currentSessionId);
          localStorage.setItem('chatSessionId', currentSessionId);
          console.log('✅ 已生成正确的sessionId:', currentSessionId);
        } else {
          console.error('❌ 无法生成正确格式的sessionId，缺少用户电话号码');
          return;
        }
      }
    }
    
    console.log('📤 发送指定消息（流式）:', messageText);
    console.log('📤 使用的参数:', { currentUserId, currentSessionId });
    
    if (!currentSessionId || !currentUserId) {
      console.error('❌ 缺少必要参数:', { currentUserId, currentSessionId });
      return;
    }

    const baseId = Date.now();
    const userMessage = {
      id: baseId,
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    const aiMessage = {
      id: baseId + 1,
      text: '',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInputValue(''); // 清空输入框
    
    setLoading(true);

    // 🔥 简化流程：分享旅行计划的消息直接当作普通消息处理
    // 如果是分享旅行计划的消息，清除sharedTravelPlanId状态
    if (messageText.includes('我分享一个旅行计划') && sharedTravelPlanId) {
      console.log('📤 处理分享旅行计划消息:', { travelPlanId: sharedTravelPlanId, message: messageText });
      setSharedTravelPlanId(null); // 清除分享状态，不再需要
      console.log('✅ 已清除分享的旅行计划ID，直接进行AI对话');
    }
    
      const parsedPlanId = sharedTravelPlanId ? parseInt(sharedTravelPlanId, 10) : null;
      const originalTravelPlanId = Number.isNaN(parsedPlanId) ? null : parsedPlanId;

      // 所有消息使用流式聊天接口（包括保存指令）
      callStreamingChatApi(
        messageText,
        currentUserId,
        currentSessionId,
        originalTravelPlanId,
        (content) => {
          // 流式增量更新当前AI消息
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessage.id ? { ...msg, text: content } : msg
            )
          );
        },
        (finalContent, fullResponseData) => {
          setLoading(false);
          const aiText = finalContent || '';
          
          // 检查是否是保存指令
          const isSaveCommand = messageText.trim() === '保存' || messageText.includes('保存行程');
          
          if (!aiText) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessage.id
                  ? { ...msg, text: '消息已发送，但未收到AI回复内容。' }
                  : msg
              )
            );
            return;
          }
          
          // 如果是保存指令，显示简化的成功消息
          if (isSaveCommand) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessage.id
                  ? { ...msg, text: '保存成功!请稍后在首页查看。' }
                  : msg
              )
            );
            console.log('🎯 保存指令处理完成，显示简化成功消息');
            return;
          }
          
          // 🔥 使用完整响应数据进行"保存行程"判断和跳转
          console.log('🎯 流式完成，检查是否需要跳转:', { messageText, fullResponseData });
          maybeNavigateToTravelPlan(messageText, aiText, fullResponseData);
        },
        (error, partialContent) => {
          console.error('流式发送消息失败:', error);
          setLoading(false);
          if (partialContent) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessage.id ? { ...msg, text: partialContent } : msg
              )
            );
          } else {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessage.id
                  ? { ...msg, text: `抱歉，AI服务暂时无法响应：${error.message || '未知错误'}` }
                  : msg
              )
            );
          }
        }
      );
  };

  // 发送指定内容的消息（用于初始输入）
  const handleSendWithInput = async (messageText, providedUserId = null, providedSessionId = null) => {
    if (!messageText.trim()) return;
    
    // 使用传入的参数或组件状态中的值
    const currentUserId = providedUserId || userId;
    let currentSessionId = providedSessionId || sessionId;
    
    // 🔥 强制sessionId格式验证
    if (currentSessionId) {
      if (currentSessionId.includes('share_plan') || !currentSessionId.match(/^\d+_\d+$/)) {
        console.error('🚨 检测到错误格式的sessionId，阻止发送:', currentSessionId);
        
        // 生成正确的sessionId
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const userPhone = userInfo.phone;
        if (userPhone) {
          currentSessionId = `${currentUserId}_${userPhone}`;
          setSessionId(currentSessionId);
          localStorage.setItem('chatSessionId', currentSessionId);
          console.log('✅ 已生成正确的sessionId:', currentSessionId);
        } else {
          console.error('❌ 无法生成正确格式的sessionId，缺少用户电话号码');
          return;
        }
      }
    }
    
    console.log('📤 发送指定消息:', messageText);
    console.log('📤 使用的参数:', { currentUserId, currentSessionId });
    
    // 检查必要参数
    if (!currentSessionId || !currentUserId) {
      console.error('❌ 缺少必要参数:', { currentUserId, currentSessionId });
      return;
    }

    // 用户消息
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue(''); // 清空输入框
    setLoading(true);

    try {
      console.log('📤 发送消息到后端:', {
        userId: currentUserId,
        sessionId: currentSessionId,
        message: messageText
      });

      // 调用后端API
      const response = await sendChatMessage(currentUserId, currentSessionId, messageText);

      console.log('📥 后端响应:', response);
      console.log('📥 后端响应详情:', JSON.stringify(response, null, 2));

      // 处理AI回复（使用与handleSend相同的逻辑）
      let aiReply = '';
      
      if (typeof response === 'string') {
        if (response === 'succeed' || response === 'success') {
          console.log('🔄 后端返回成功标识，需要获取最新AI回复...');
          aiReply = null;
        } else {
          aiReply = response;
        }
      } else if (response && response.reply) {
        aiReply = response.reply;
      } else if (response && response.data) {
        if (typeof response.data === 'string') {
          aiReply = response.data;
        } else if (response.data.reply) {
          aiReply = response.data.reply;
        } else if (response.data.message) {
          aiReply = response.data.message;
        } else {
          console.log('⚠️ response.data存在但没有AI回复内容，尝试获取历史消息');
          aiReply = null;
        }
      } else if (response && (response.message === 'success' || response.code === 200)) {
        console.log('🔄 后端返回成功但无AI回复内容，正在获取最新AI回复...');
        aiReply = null;
      }

      // 如果需要从历史消息获取AI回复
      if (aiReply === null) {
        console.log('🔄 需要从历史消息中获取AI回复...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const historyResponse = await getChatHistory(currentSessionId);
          console.log('📦 获取到最新历史:', historyResponse);
          
          let latestMessages = [];
          if (Array.isArray(historyResponse)) {
            latestMessages = historyResponse;
          } else if (historyResponse && historyResponse.data) {
            if (Array.isArray(historyResponse.data)) {
              latestMessages = historyResponse.data;
            } else if (historyResponse.data.list && Array.isArray(historyResponse.data.list)) {
              latestMessages = historyResponse.data.list;
            } else if (historyResponse.data.messages && Array.isArray(historyResponse.data.messages)) {
              latestMessages = historyResponse.data.messages;
            }
          }
          
          const sortedMessages = latestMessages.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
          
          let latestAiMessage = null;
          for (let i = 0; i < Math.min(3, sortedMessages.length); i++) {
            const msg = sortedMessages[i];
            // 根据role字段或userId字段判断是否为AI消息
            if (msg.role === 'assistant' || (!msg.userId || msg.userId !== currentUserId)) {
              latestAiMessage = msg;
              break;
            }
          }
            
          if (latestAiMessage && (latestAiMessage.content || latestAiMessage.message)) {
            aiReply = latestAiMessage.content || latestAiMessage.message;
            console.log('✅ 获取到最新AI回复:', aiReply);
          } else {
            console.warn('⚠️ 未找到最新AI回复，使用默认消息');
            aiReply = '消息已发送，但获取回复失败，请刷新页面查看历史消息';
          }
        } catch (error) {
          console.error('❌ 获取最新消息失败:', error);
          aiReply = '消息已发送成功，但获取回复时出错，请刷新页面查看';
        }
      }

      if (!aiReply && response) {
        console.warn('⚠️ 未找到标准的回复字段，使用完整响应:', response);
        aiReply = JSON.stringify(response, null, 2);
      }

      if (!aiReply) {
        throw new Error('后端返回的数据格式不正确');
      }

      // AI消息
      const aiMessage = {
        id: Date.now() + 1,
        text: aiReply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };

      // 检查是否是保存指令
      const isSaveCommand = messageText.trim() === '保存' || messageText.includes('保存行程');
      
      // 如果是保存指令，显示简化的成功消息
      if (isSaveCommand) {
        const simplifiedAiMessage = {
          id: Date.now() + 1,
          text: '保存成功!请稍后在首页查看。',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, simplifiedAiMessage]);
        console.log('✅ 保存指令处理完成，显示简化成功消息');
      } else {
        // 非保存指令，正常显示AI回复
        setMessages(prev => [...prev, aiMessage]);
        console.log('✅ AI回复已添加');
        
        // 检查是否需要跳转到行程页面
        maybeNavigateToTravelPlan(messageText, aiReply, response);
      }

    } catch (error) {
      console.error('❌ 发送消息失败:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `抱歉，AI服务暂时无法响应：${error.message || '未知错误'}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlanFromAiPrompt = async () => {
    if (!userId || !sessionId) {
      return;
    }
    await handleSendWithInputStreaming('保存', userId, sessionId);
  };

  const handleSendStreaming = async () => {
    if (!inputValue.trim()) return;
    await handleSendWithInputStreaming(inputValue);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 用户消息
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    const currentInput = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      console.log('📤 发送消息到后端:', {
        userId,
        sessionId,
        message: currentInput
      });

      // 调用后端API
      const response = await sendChatMessage(userId, sessionId, currentInput);

      console.log('📥 后端响应:', response);
      console.log('📥 后端响应详情:', JSON.stringify(response, null, 2));

      // 🔥 解析AI回复 - 支持后端返回 "succeed" 的情况
      let aiReply = '';
      
      if (typeof response === 'string') {
        // 🔥 特殊处理：如果后端只返回 "succeed"，标记为需要获取历史
        if (response === 'succeed' || response === 'success') {
          console.log('🔄 后端返回成功标识，需要获取最新AI回复...');
          aiReply = null; // 标记为需要获取历史
        } else {
          // 直接返回字符串（非 "succeed" 的情况）
          aiReply = response;
        }
      } else if (response && response.reply) {
        // 返回 { reply: "..." } 格式
        aiReply = response.reply;
      } else if (response && response.data) {
        // 返回 { data: { reply: "..." } } 格式
        if (typeof response.data === 'string') {
          aiReply = response.data;
        } else if (response.data.reply) {
          aiReply = response.data.reply;
        } else if (response.data.message) {
          aiReply = response.data.message;
        } else {
          // 🔥 data对象存在但为空，或者没有reply/message字段
          console.log('⚠️ response.data存在但没有AI回复内容，尝试获取历史消息');
          // 触发获取历史消息的逻辑
          aiReply = null;
        }
      } else if (response && (response.message === 'success' || response.code === 200)) {
        // 🔥 返回 { code: 200, message: 'success', data: {} } 但data为空
        console.log('🔄 后端返回成功但无AI回复内容，正在获取最新AI回复...');
        aiReply = null; // 标记为需要获取历史
      }

      // 🔥 如果 aiReply 为 null，说明需要获取历史消息
      if (aiReply === null) {
        console.log('🔄 需要从历史消息中获取AI回复...');
        
        // 延迟一下确保数据库已保存
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // 重新加载聊天历史获取最新的AI回复
          const historyResponse = await getChatHistory(sessionId);
          console.log('📦 获取到最新历史:', historyResponse);
          
          let latestMessages = [];
          if (Array.isArray(historyResponse)) {
            latestMessages = historyResponse;
          } else if (historyResponse && historyResponse.data) {
            if (Array.isArray(historyResponse.data)) {
              latestMessages = historyResponse.data;
            } else if (historyResponse.data.list && Array.isArray(historyResponse.data.list)) {
              // 可能是 { data: { list: [...] } } 格式
              latestMessages = historyResponse.data.list;
            }
          }
          
          console.log('📋 解析出的消息列表:', latestMessages);
          
          // 🔥 找到最新的AI回复 - 获取最后一条消息（应该是AI回复）
          const sortedMessages = latestMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          // 取最新的消息，如果是AI消息就使用，否则取倒数第二条
          let latestAiMessage = null;
          for (let i = 0; i < Math.min(3, sortedMessages.length); i++) {
            const msg = sortedMessages[i];
            console.log(`检查消息 ${i}:`, msg);
            // AI消息的特征：userId不等于当前用户，或者userId为空/null
            if (!msg.userId || msg.userId !== userId) {
              latestAiMessage = msg;
              break;
            }
          }
            
          if (latestAiMessage && latestAiMessage.message) {
            aiReply = latestAiMessage.message;
            console.log('✅ 获取到最新AI回复:', aiReply);
          } else {
            console.warn('⚠️ 未找到最新AI回复，使用默认消息');
            aiReply = '消息已发送，但获取回复失败，请刷新页面查看历史消息';
          }
        } catch (error) {
          console.error('❌ 获取最新消息失败:', error);
          aiReply = '消息已发送成功，但获取回复时出错，请刷新页面查看';
        }
      }

      // 如果还是没有获取到回复，尝试使用整个响应的字符串化
      if (!aiReply && response) {
        console.warn('⚠️ 未找到标准的回复字段，使用完整响应:', response);
        aiReply = JSON.stringify(response, null, 2);
      }

      if (!aiReply) {
        throw new Error('后端返回的数据格式不正确');
      }

      // AI消息
      const aiMessage = {
        id: Date.now() + 1,
        text: aiReply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };

      // 检查是否是保存指令
      const isSaveCommand = currentInput.trim() === '保存' || currentInput.includes('保存行程');
      
      // 如果是保存指令，显示简化的成功消息
      if (isSaveCommand) {
        const simplifiedAiMessage = {
          id: Date.now() + 1,
          text: '保存成功!请稍后在首页查看。',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, simplifiedAiMessage]);
        console.log('✅ 保存指令处理完成，显示简化成功消息');
      } else {
        // 非保存指令，正常显示AI回复
        setMessages(prev => [...prev, aiMessage]);
        console.log('✅ AI回复已添加');
        
        // 检查是否需要跳转到行程页面
        maybeNavigateToTravelPlan(currentInput, aiReply, response);
      }

    } catch (error) {
      console.error('❌ 发送消息失败:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `抱歉，AI服务暂时无法响应：${error.message || '未知错误'}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 回车发送
  // ═══════════════════════════════════════════════════════════════════
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendStreaming();
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 清除聊天历史
  // ═══════════════════════════════════════════════════════════════════
  
  const handleClearHistory = async () => {
    if (window.confirm('确定要清除所有聊天记录吗？这将开始一个新的对话。')) {
      setMessages([]);
      
      // 获取用户电话号码以创建新的会话ID
      let userPhone = '';
      try {
        const userProfile = await getUserProfile();
        if (userProfile && userProfile.code === 200 && userProfile.data) {
          userPhone = userProfile.data.phone || userProfile.data.phoneNumber || '';
        }
      } catch (e) {
        console.error('获取用户信息失败:', e);
      }
      
      // 创建新的会话ID：用户ID + 电话号码（如果电话号码存在）
      let newSessionId;
      if (userPhone) {
        newSessionId = `${userId}_${userPhone}`;
      } else {
        // 如果没有电话号码，使用时间戳作为降级方案
        newSessionId = `${userId}_${Date.now()}`;
      }
      
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      
      console.log('✅ 聊天历史已清除，新会话ID:', newSessionId);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  const shouldShowSaveButtonForMessage = (text) => {
    if (!text) return false;
    const full = String(text).trim();
    if (!full) return false;

    const sentences = full
      .split(/[。！？!\?\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!sentences.length) return false;

    const lastSentence = sentences[sentences.length - 1];
    if (!lastSentence) return false;

    const keywords = [
      '保存这个旅行计划',
      '保存这个旅行方案',
      '保存这个行程',
      '保存这个方案',
      '保存这个旅行',
      '保存这次旅行',
    ];

    if (keywords.some((kw) => lastSentence.includes(kw))) {
      return true;
    }

    return lastSentence.includes('保存');
  };

  // ═══════════════════════════════════════════════════════════════════
  // 渲染界面
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <div className="flex flex-row w-full h-20 shadow-md relative z-20 bg-white items-center justify-between px-2 border-b rounded-3xl">
          <div className="text-GuText text-sm cursor-pointer ml-4" onClick={onBackToHome}>
            返回
          </div>
          <p className="text-xl font-bold mr-4 text-GuText"style={{ fontFamily: '宋体, SimSun, serif' }}>好游小精灵</p>

          <div className="flex items-center space-x-2">
            {/* <div 
              className="text-green-600 text-sm cursor-pointer border border-green-600 px-2 py-1 rounded" 
              onClick={testConnection}
              title="测试后端连接"
            >
              测试
            </div> */}
            {/* <div 
              className="text-red-500 text-sm cursor-pointer" 
              onClick={handleClearHistory}
              title="清除聊天记录"
            >
              清除
            </div> */}
          </div>
        </div>
        
        {/* 会话信息提示（已按需求隐藏） */}
        {/* {sessionId && (
          <div className="px-4 py-2 text-xs text-center bg-purple-50 text-purple-700 border-b border-purple-100">
            <div>
              👤 用户: {userId}
            </div>
            <div className="mt-1">
              💬 会话: {sessionId.substring(0, 30)}...
            </div>
          </div>
        )} */}
      </div>

      {/* 中间聊天部分 */}
      <div className="flex flex-col overflow-y-auto pb-24 w-full h-auto" style={{ marginTop: '80px',backgroundImage:'url("/ai聊天背景3.jpg")',backgroundRepeat:'no-repeat',backgroundSize:'auto 100%',backgroundPosition:'center',backgroundAttachment:'fixed' }}>
        {/* <img src='/好游文本图标.jpg' className="w-full h-auto mx-auto" alt="Logo"></img> */}

        {/* 消息列表 */}
        <div className="px-4 space-y-4">
          {/* 加载历史中 - 骨架屏 */}
          {loadingHistory && (
            <div className="space-y-4 mt-4">
              {/* 模拟用户消息骨架 */}
              <div className="flex justify-end">
                <div className="max-w-[85%]">
                  <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="flex items-center justify-end mt-2 px-1">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              
              {/* 模拟AI消息骨架 */}
              <div className="flex justify-start">
                <div className="w-full max-w-[85%]">
                  <div className="px-4 py-3 rounded-lg bg-white/50 border border-gray-200 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 第二组用户消息骨架 */}
              <div className="flex justify-end">
                <div className="max-w-[85%]">
                  <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-28"></div>
                  </div>
                  <div className="flex items-center justify-end mt-2 px-1">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              
              {/* 第二组AI消息骨架（带图片占位） */}
              <div className="flex justify-start">
                <div className="w-full max-w-[85%]">
                  <div className="px-4 py-3 rounded-lg bg-white/50 border border-gray-200 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    {/* 模拟图片占位 */}
                    <div className="my-3">
                      <div className="rounded-lg overflow-hidden bg-gray-200 h-48 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 加载提示文字 */}
              <div className="text-center text-gray-500 text-sm mt-4">
                <div className="flex justify-center items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>正在加载历史消息...</span>
                </div>
              </div>
            </div>
          )}

          {/* 无消息提示 */}
          {!loadingHistory && messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-8">
              <p>🤖 您好！我是AI旅游规划助手</p>
              <p className="text-xs mt-2">请输入您的旅游需求，我将为您提供最佳路线</p>
              <p className="text-xs mt-1 text-gray-400">例如：我想从北京去上海玩3天</p>
            </div>
          )}

          {/* 消息列表 */}
          {messages.map((message) => {
            // 解析内容，将文本和图片分段（仅对AI消息）
            const contentSegments = message.sender === 'ai' ? parseContentWithImages(message.text) : [];
            
            return (
              <div key={message.id} className="space-y-1">
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${message.sender === 'user' ? '' : 'w-full'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-[#d5a495] text-white rounded-tr-sm'
                        : 'bg-white/50 text-gray-800 border border-gray-200 rounded-lg shadow-md'
                    }`}>
                      {/* AI消息：穿插显示文本和图片 */}
                      {message.sender === 'ai' && contentSegments.length > 0 ? (
                        <div className="space-y-3">
                          {contentSegments.map((segment, segIndex) => {
                            if (segment.type === 'text') {
                              const parsedContent = parseMarkdown(segment.content);
                              return (
                                <div 
                                  key={segIndex}
                                  className="text-sm leading-relaxed prose prose-sm max-w-none break-all whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{ __html: parsedContent }}
                                />

                              );
                            } else if (segment.type === 'image') {
                              console.log(`🖼️ 渲染图片 ${segIndex + 1}:`, segment.url);
                              return (
                                <div key={segIndex} className="my-3">
                                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                    <img 
                                      src={segment.url} 
                                      alt="景点图片"
                                      className="w-full h-48 object-cover"
                                      style={{ maxHeight: '200px' }}
                                      onLoad={(e) => {
                                        console.log('✅ 图片加载成功:', segment.url);
                                      }}
                                      onError={(e) => {
                                        console.error('❌ 图片加载失败:', segment.url);
                                        e.target.style.display = 'none';
                                      }}
                                      loading="lazy"
                                    />
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        /* 用户消息：直接显示文本 */
                        <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      )}
                      
                      {/* 时间戳 */}
                      <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                        message.sender === 'user' ? 'border-blue-400' : 'border-gray-200'
                      }`}>
                        <p className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {message.sender === 'ai' &&
                  shouldShowSaveButtonForMessage(message.text) && (
                    <div className="flex flex-row justify-start pl-8">
                      <button
                        type="button"
                        onClick={handleSavePlanFromAiPrompt}
                        className="focus:outline-none hover:opacity-80 transition-opacity"
                      >
                        <img
                          src="/保存.png"
                          alt="保存这个旅行计划"
                          className="h-4 w-auto ml-1"
                        />
                        <div className="text-xs mt-1 text-gray-600">保存</div>
                      </button>
                    </div>
                  )}
              </div>
            );
          })}

          {/* 加载中动画 */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-black px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部输入框 */}
      <div className="fixed left-0 right-0 bottom-0 w-full h-20 z-10 bg-white border-t">
        <div className="flex flex-row border border-none w-[90%] h-14 rounded-xl mx-auto mt-3">
          {/* <img src='/语音.png' className="w-10 h-10 mt-2" alt="Voice"></img> */}
          <input 
            type="text" 
            value={inputValue}
            placeholder="请输入您的需求" 
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || !sessionId}
            className="w-full h-full text-sm pl-2 border-none focus:outline-none bg-transparent disabled:text-gray-400"
          />
          <button
            onClick={handleSendStreaming}
            disabled={loading || !inputValue.trim() || !sessionId}
            className="w-12 h-12 mt-2 text-[#a8b7bc] disabled:text-gray-400"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiPage;

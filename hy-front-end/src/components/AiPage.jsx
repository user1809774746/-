import React,{useState,useEffect,useRef} from "react";



const AiPage=({onBackToHome})=>{
    const [messages,setMessages]=useState([]);
    const [inputValue,setInputValue]=useState('');
    const [loading,setLoading]=useState(false);
    const messagesEndRef=useRef(null);
    const [connectionStatus, setConnectionStatus] = useState('未测试'); // 连接状态
    const [sessionId, setSessionId] = useState(
        localStorage.getItem('n8n_session_id') || ''
    ); // 🔥 会话 ID，用于保持上下文
    
    const N8N_CONFIG={
        apiUrl: 'http://your-n8n-server/webhook/your-webhook-path', // 🔥 n8n webhook 地址（请替换为实际地址）
    };
    // 🔥 组件加载时恢复聊天历史
    useEffect(() => {
        const savedHistory = localStorage.getItem('coze_chat_history');
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory);
                setMessages(parsedHistory);
                console.log('✅ 已恢复聊天历史，共 ' + parsedHistory.length + ' 条消息');
            } catch (error) {
                console.error('❌ 恢复聊天历史失败:', error);
            }
        }
    }, []);

    // 滚动到最新消息
    const scrollToBottom=()=>{
        messagesEndRef.current?.scrollIntoView({behavior:'smooth'});
    }
    useEffect(()=>{
        scrollToBottom();
    },[messages]);
    //模拟ai回复


    // 🔧 辅助函数：处理 SSE 流式响应
    const parseSSEResponse = (text) => {
        console.log('🔧 尝试解析 SSE 响应...');
        const lines = text.split('\n');
        let fullContent = '';  // 累积完整回复
        let lastMessageWithContent = null;  // 保存包含完整 content 的消息
        let extractedConversationId = null;  // 🔥 提取 conversation_id
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const jsonStr = line.substring(6).trim();
                if (jsonStr && jsonStr !== '[DONE]') {
                    try {
                        const parsed = JSON.parse(jsonStr);
                        
                        // 🔥 提取 conversation_id（如果存在）
                        if (parsed.conversation_id && !extractedConversationId) {
                            extractedConversationId = parsed.conversation_id;
                            console.log('🔑 提取到 conversation_id:', extractedConversationId);
                        }
                        
                        // 🔥 如果这条消息有完整的 content 字段
                        if (parsed.content && parsed.role === 'assistant' && parsed.type === 'answer') {
                            // 如果 content 是完整的（通常最后一条会包含完整内容）
                            if (parsed.content.length > 50) {  // 完整内容通常比较长
                                lastMessageWithContent = parsed;
                                console.log('✅ 找到完整回复消息:', parsed);
                            } else {
                                // 累积片段
                                fullContent += parsed.content;
                            }
                        }
                    } catch (e) {
                        console.warn('⚠️ 跳过无效的 SSE 数据:', jsonStr);
                    }
                }
            }
        }
        
        // 返回包含完整 content 的消息，并附加 conversation_id
        let result = null;
        if (lastMessageWithContent) {
            result = lastMessageWithContent;
        } else if (fullContent) {
            result = { content: fullContent, role: 'assistant', type: 'answer' };
        }
        
        // 🔥 附加 conversation_id
        if (result && extractedConversationId) {
            result.conversation_id = extractedConversationId;
        }
        
        return result;
    };

    const callN8nAPI=async(userQuery)=>{
        // 🔥 获取用户 ID（从 localStorage 中读取）
        const userId = localStorage.getItem('user_phone') || localStorage.getItem('user_id') || 'guest_' + Date.now();
        
        // 🔥 生成或获取 sessionId
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            // 如果没有 sessionId，生成一个新的（使用 user_id + 时间戳）
            currentSessionId = `${userId}_${Date.now()}`;
            setSessionId(currentSessionId);
            localStorage.setItem('n8n_session_id', currentSessionId);
            console.log('🆕 生成新的 sessionId:', currentSessionId);
        } else {
            console.log('🔄 使用已有的 sessionId:', currentSessionId);
        }
        
        console.log('🔑 当前用户ID:', userId);
        
        try{
            // 🔥 n8n 要求的数据格式（只包含 sessionId、action 和 chatInput）
            const requestBody={
                sessionId: currentSessionId,
                action: "sendMessage",
                chatInput: userQuery
            };
        
            console.log('🚀 n8n 请求体:', JSON.stringify(requestBody, null, 2));
            console.log('🌐 请求 URL:', N8N_CONFIG.apiUrl);
            console.log('⏱️ 开始发送请求...', new Date().toLocaleTimeString());

            // 发送请求
            let response;
            try {
                response = await fetch(N8N_CONFIG.apiUrl,{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify(requestBody)
                });
                console.log('✅ 收到响应', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers),
                    time: new Date().toLocaleTimeString()
                });
            } catch (fetchError) {
                console.error('❌ 网络请求失败（可能是CORS或网络问题）:', fetchError);
                console.error('错误详情:', {
                    name: fetchError.name,
                    message: fetchError.message,
                    stack: fetchError.stack
                });
                throw new Error(`网络请求失败: ${fetchError.message}. 这可能是CORS跨域问题，请检查API配置。`);
            }
            
            if(!response.ok){
                const errorText = await response.text();
                console.error('❌ API错误响应:', errorText);
                console.error('❌ HTTP状态码:', response.status);
                console.error('❌ 响应头:', Object.fromEntries(response.headers));
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
            }
            
            // 检查响应类型
            const contentType = response.headers.get('content-type');
            console.log('📋 响应 Content-Type:', contentType);
            
            let data;
            
            // 如果是 SSE 流式响应（备用处理）
            if (contentType && contentType.includes('text/event-stream')) {
                console.warn('⚠️ 收到流式响应，尝试解析 SSE 格式');
                const text = await response.text();
                console.log('📝 原始响应文本（前500字符）:', text.substring(0, 500));
                
                // 使用 SSE 解析器
                data = parseSSEResponse(text);
                if (!data) {
                    throw new Error('无法从 SSE 响应中提取数据');
                }
                console.log('🔍 从 SSE 解析的数据:', JSON.stringify(data, null, 2));
            } else {
                // 标准 JSON 响应
                data = await response.json();
                console.log('🔍 Coze 对话流返回的完整数据:',JSON.stringify(data,null,2));
            }

            // 🔥 保存 conversation_id（如果存在）
            if (data.conversation_id) {
                console.log('💾 保存 conversation_id:', data.conversation_id);
                setConversationId(data.conversation_id);
                localStorage.setItem('coze_conversation_id', data.conversation_id);
            }

            // 🔥 对话流 API 返回格式解析
            let aiReply = '';
            
            // 方式1: 如果 data 直接包含 content（SSE 解析后的结果）
            if (data.content && data.role === 'assistant') {
                aiReply = data.content;
                console.log('✅ 从 SSE 解析的 content 提取到回复');
            }
            
            // 方式2: 从 messages 数组提取（对话流标准格式）
            if (!aiReply && data.messages && Array.isArray(data.messages)) {
                console.log('📨 找到 messages 数组，长度:', data.messages.length);
                
                // 找到最后一条 assistant 类型的消息
                const assistantMessages = data.messages.filter(msg => 
                    msg.role === 'assistant' || 
                    msg.type === 'answer' ||
                    msg.type === 'follow_up'
                );
                
                if (assistantMessages.length > 0) {
                    const lastMsg = assistantMessages[assistantMessages.length - 1];
                    aiReply = lastMsg.content || lastMsg.text || '';
                    console.log('✅ 从 messages 数组提取到回复');
                }
            }
            
            // 方式3: 从 data.data 提取
            if (!aiReply && data.data) {
                console.log('📦 data.data 内容:', data.data);
                
                if (typeof data.data === 'string') {
                    aiReply = data.data;
                } else if (typeof data.data === 'object') {
                    // 如果有 messages 字段
                    if (data.data.messages && Array.isArray(data.data.messages)) {
                        const msgs = data.data.messages.filter(m => m.role === 'assistant');
                        if (msgs.length > 0) {
                            aiReply = msgs[msgs.length - 1].content || msgs[msgs.length - 1].text;
                        }
                    } else {
                        // 尝试从常见字段提取
                        aiReply = data.data.output || 
                                 data.data.result || 
                                 data.data.response || 
                                 data.data.answer ||
                                 data.data.text ||
                                 data.data.content;
                    }
                }
            }
            
            // 方式4: 从顶层字段提取
            if (!aiReply) {
                aiReply = data.output || 
                         data.result || 
                         data.response || 
                         data.answer ||
                         data.text;
            }
            
            // 方式5: 如果都没有，尝试获取第一个有意义的字段
            if (!aiReply && data.data && typeof data.data === 'object') {
                const keys = Object.keys(data.data).filter(k => k !== 'id' && k !== 'timestamp');
                if (keys.length > 0) {
                    const firstKey = keys[0];
                    console.log(`🔑 尝试使用字段: ${firstKey}`);
                    const value = data.data[firstKey];
                    if (typeof value === 'string') {
                        aiReply = value;
                    } else if (typeof value === 'object') {
                        aiReply = JSON.stringify(value, null, 2);
                    }
                }
            }
            
            console.log('✅ 提取到的AI回复:', aiReply);
            // 格式化AI回复文本
            const formatAIResponse = (text) => {
                if (!text) return text;
                let formatted = text;
                formatted = formatted.replace(/^=+\n?/g, '').replace(/\n?=+$/g, '');
                formatted = formatted.replace(/(\*\*第.+?天\*\*：?)/g, '\n$1\n');
                formatted = formatted.replace(/- \*\*(.+?)\*\*：/g, '\n- **$1**：');
                formatted = formatted.replace(/\n{3,}/g, '\n\n');
                return formatted.trim();
            };

            aiReply = formatAIResponse(aiReply);
            console.log('📝 格式化后的回复:',aiReply);


            
            if(!aiReply){
                console.error('❌ 无法从API响应中提取回复内容，完整数据结构:',data);
                aiReply='抱歉，我暂时无法回复您的问题';
            }    
            return aiReply;                
        }catch(error){

            console.error('调用cozen api失败',error);
            throw error;
        }
    };
    //发送消息
    const handleSend=async()=>{
        if(!inputValue.trim())return;
        const userMessage={
            id:Date.now(),
            text:inputValue,
            sender:'user',
            timestamp:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})
        };
        setMessages(prev=>{
            const newMessages = [...prev, userMessage];
            // 🔥 保存聊天历史到 localStorage
            localStorage.setItem('coze_chat_history', JSON.stringify(newMessages));
            return newMessages;
        });
        
        const currentInput=inputValue;
        setInputValue('');
        setLoading(true);
        try{
            //调用对话流 API
            const aiReply =await callCozeAPI(currentInput);
            const aiMessage={
                id:Date.now()+1,
                text:aiReply,
                sender:'ai',
                timestamp:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})
            };
            setMessages(prev=>{
                const newMessages = [...prev, aiMessage];
                // 🔥 保存聊天历史到 localStorage
                localStorage.setItem('coze_chat_history', JSON.stringify(newMessages));
                return newMessages;
            });
        }catch(error){
            console.error('❌ 调用对话流失败:', error);
            const errorMessage={
                id:Date.now()+1,
                text:'抱歉，AI服务暂时无法响应，请稍后再试',
                sender:'ai',
                timestamp:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})
            }
            setMessages(prev=>[...prev,errorMessage]);

        }finally{
            setLoading(false);
        };
        
        


        // setTimeout(()=>{
        //     const aiMessage={
        //         id:Date.now(),
        //         text:generateAIResponse(inputValue),
        //         sender:'ai',
        //         timestamp:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})
        //     };
        //     setMessages(prev=>[...prev,aiMessage]);
        //     setLoading(false);

        // },1000);
    };
    //回车操作
    const handleKeyPress=(e)=>{
        if(e.key==='Enter'&&!e.shiftKey){
            e.preventDefault();
            handleSend();
        }
    };

    // 🔥 测试 Coze API 连接
    const testConnection = async () => {
        console.log('🔬 开始测试 Coze API 连接...');
        setConnectionStatus('测试中...');
        
        try {
            const testBody = {
                workflow_id: COZE_CONFIG.workflowId,
                app_id: COZE_CONFIG.appId,
                stream: false,
                parameters: {
                    CONVERSATION_NAME: 'test_' + Date.now(),
                    USER_INPUT: '你好'
                },
                additional_messages: [{
                    content: '你好',
                    content_type: 'text',
                    role: 'user',
                    type: 'question'
                }]
            };
            
            console.log('🧪 测试请求:', {
                url: COZE_CONFIG.apiUrl,
                appId: COZE_CONFIG.appId,
                workflowId: COZE_CONFIG.workflowId,
                hasToken: !!COZE_CONFIG.token
            });
            
            const response = await fetch(COZE_CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${COZE_CONFIG.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testBody)
            });
            
            console.log('📡 测试响应:', {
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type')
            });
            
            if (response.ok) {
                setConnectionStatus('✅ 连接成功');
                console.log('✅ Coze API 连接测试成功');
                alert('✅ 连接成功！Coze API 工作正常。');
            } else {
                const errorText = await response.text();
                setConnectionStatus(`❌ 连接失败 (${response.status})`);
                console.error('❌ 连接测试失败:', errorText);
                alert(`❌ 连接失败！\n状态码: ${response.status}\n错误: ${errorText.substring(0, 200)}`);
            }
        } catch (error) {
            setConnectionStatus('❌ 网络错误');
            console.error('❌ 连接测试异常:', error);
            alert(`❌ 网络错误！\n${error.message}\n\n可能原因：\n1. CORS跨域问题\n2. 网络连接问题\n3. API地址错误`);
        }
    };

    // 🔥 清除聊天历史
    const handleClearHistory = () => {
        if (window.confirm('确定要清除所有聊天记录吗？这将开始一个新的对话。')) {
            setMessages([]);
            setConversationId('');  // 🔥 清除 conversation_id
            localStorage.removeItem('coze_chat_history');
            localStorage.removeItem('coze_conversation_name');
            localStorage.removeItem('coze_conversation_id');  // 🔥 清除 conversation_id
            console.log('✅ 聊天历史已清除，下次对话将创建新会话（新的 conversation_id）');
        }
    };


    return(
   <div className="w-full min-h-screen bg-white flex flex-col">
    {/* 顶部导航栏 */}
    <div className="fixed top-0 left-0 right-0 z-10">
    <div className="flex flex-row w-full h-20 shadow-md relative z-20 bg-white items-center justify-between px-4">
        <div className="text-blue-600 text-sm cursor-pointer" onClick={onBackToHome}>返回</div>
        <p className="text-lg font-bold">好友小精灵</p>

        <div className="flex items-center space-x-2">
            <div 
                className="text-green-600 text-sm cursor-pointer border border-green-600 px-2 py-1 rounded" 
                onClick={testConnection}
                title="测试Coze API连接"
            >
                测试
            </div>
            <div 
                className="text-red-500 text-sm cursor-pointer" 
                onClick={handleClearHistory}
                title="清除聊天记录"
            >
                清除
            </div>
        </div>
    </div>
    
    {/* 连接状态提示 */}
    {connectionStatus !== '未测试' && (
        <div className={`px-4 py-2 text-xs text-center ${
            connectionStatus.includes('✅') ? 'bg-green-50 text-green-700' :
            connectionStatus.includes('❌') ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
        }`}>
            连接状态: {connectionStatus}
        </div>
    )}
    
    {/* 🔥 对话上下文状态提示 */}
    {conversationId && (
        <div className="px-4 py-1 text-xs text-center bg-purple-50 text-purple-700 border-b border-purple-100">
            🔄 已开启上下文对话 (ID: {conversationId.substring(0, 12)}...)
        </div>
    )}
    </div>

    {/* 中间聊天部分 */}
    <div className="flex flex-col overflow-y-auto pb-24 w-full h-auto">
        <img src='/好游文本图标.jpg' className="w-full h-auto mx-auto"></img>

        {/* 消息 */}
        <div className="px-4 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-gray-500 text-14px mt-8">
                    <p>请输入您的旅游需,我将为您提供最佳路线</p>
                    <p className="text-sm mt-2">列如：我想从北京去上海</p>
                </div>
            )}

        {messages.map((message)=>(
            <div key={message.id} className={`flex ${message.sender==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-black rounded-tl-sm'
                }`}>
                    <p className="text-sm break-all whitespace-pre-wrap">{message.text}</p>

                    <p className={`text-xs mt-1 ${message.sender=== 'user' ? 'text-blue-100' : 'text-gray-500'}`}
                    >
                        {message.timestamp}
                        </p>
            </div>
        </div>
        ))}

        {
            loading&&(
                <div className="flex justify-start">
                    <div className="bg-gray-200 text-black px-4 py-3 rounded-2xl rounded-tl-sm">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></div>
                        </div>
                    </div>
                </div>
            )
        }
        <div ref={messagesEndRef}/>

        </div>
    </div>

    {/* 底部输入框 */}
    <div className="fixed left-0 rigth-0 bottom-0 w-full h-20 z-10 bg-white">
        <div className="flex flex-row border-1 w-[90%] h-14 shadow rounded-xl mx-auto mt-2px">
            <img src='/语音.png'className="w-10 h-10 ml-2 mt-1"></img>
            <input 
            type="text" 
            value={inputValue}
            placeholder="请输入您的需求" 
            onChange={(e)=>setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-full text-14px pl-2 focus:outline-none"/>
        </div>
    </div>
   </div>
)}



export default AiPage;
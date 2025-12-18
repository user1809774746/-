import React,{useRef,useState,useEffect} from "react";



const DSreachPage=({onNavigateToDiscover,searchQuery,userLocation})=>{
  const [searchText, setSearchText] = useState(searchQuery||'');
  const [searchResults,setSearchResults]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);


  const DIFY_CONFIG={
      // ⚠️ 请替换为你的实际工作流ID和API密钥
      //workflowId: 'YOUR_WORKFLOW_ID',  // 🔴 必须填写！从 Dify 工作流页面获取
      apiKey:'app-91SvGUIqxZkhIyb7Ekglfrwu',  // 🔴 必须替换为你的 API 密钥
      baseUrl: 'https://api.dify.ai/v1/workflows',
      timeout: 30000
    };
  
  // 构建完整的API URL
  const getApiUrl = () => {
    // if (DIFY_CONFIG.workflowId === 'YOUR_WORKFLOW_ID') {
    //   console.error('❌ 错误：请先配置 Dify 工作流ID！');
    //   throw new Error('请先在代码中配置 Dify 工作流ID');
    // }
    return `${DIFY_CONFIG.baseUrl}/run`;
  };

  useEffect(()=>{
    if(searchQuery){
      setSearchText(searchQuery);
      performSearch(searchQuery);
    }
  },[searchQuery]);
  const performSearch=async(keyword)=>{
    if(!keyword.trim()){
        return;
    }
    console.log('开始搜索',keyword);
    console.log('用户位置',userLocation);

    setLoading(true);
    setError(null);
    try{
        //构建请求体
        const requestBody={
            inputs:{
                keyword:keyword,
                location:userLocation?`${userLocation.lng},${userLocation.lat}`:'',
            },
            response_mode:'streaming',//流式传输
            user:'user-'+Date.now()
        };
        const apiUrl = getApiUrl();
        console.log('请求URL:', apiUrl);
        console.log('请求体',requestBody);
        const response=await fetch(apiUrl,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${DIFY_CONFIG.apiKey}`,
                'Content-Type':'application/json'
            },
            body:JSON.stringify(requestBody)
        });
        console.log('响应状态',response.status);
        if(!response.ok){
            // 尝试获取详细错误信息
            let errorDetail = '';
            try {
                const errorData = await response.json();
                errorDetail = JSON.stringify(errorData);
                console.error('API错误详情:', errorData);
            } catch (e) {
                errorDetail = await response.text();
            }
            throw new Error(`API请求失败 ${response.status}: ${errorDetail}`);
        }
        //流式传输数据响应处理
        const reader=response.body.getReader();
        const decoder=new TextDecoder();
        let buffer='';  
        let finalResult=[];

        while(true){
          const {done,value}=await reader.read();
          if(done){
            console.log('流式输出完成');
            break;
          }
          // 将数据添加到缓冲区
          const chunk=decoder.decode(value,{stream:true});
          buffer+=chunk;

          const lines=buffer.split('\n');
          buffer=lines.pop()||'';
          for(const line of lines){
            if(line.startsWith('data: ')){  
              const jsonStr=line.slice(6);
              if(jsonStr==='[DONE]'){
                console.log('数据传输完成');
                continue;
              }
              try{
                const data = JSON.parse(jsonStr);
                console.log('📦 接收到数据块:', data);
                
                // 🔍 调试：如果是 workflow_finished 事件，输出完整结构
                if (data.event === 'workflow_finished') {
                    console.log('🎯 工作流完成，完整数据结构:', JSON.stringify(data, null, 2));
                }
                
                // ✅ 改进的解析逻辑 - 处理多层嵌套
                let parsedData = null;
                
                // 尝试多种可能的数据路径
                if (data.data?.outputs?.result) {
                    parsedData = data.data.outputs.result;
                } else if (data.data?.outputs?.pois) {
                    parsedData = data.data.outputs.pois;
                } else if (data.data?.outputs) {
                    // 检查 outputs 中的第一个对象属性
                    const outputs = data.data.outputs;
                    for (const key in outputs) {
                        if (Array.isArray(outputs[key])) {
                            parsedData = outputs[key];
                            break;
                        } else if (typeof outputs[key] === 'string') {
                            // ✅ 尝试解析字符串类型的 JSON
                            try {
                                const parsed = JSON.parse(outputs[key]);
                                if (Array.isArray(parsed)) {
                                    parsedData = parsed;
                                    console.log('✅ 成功解析字符串类型的 JSON:', key);
                                    break;
                                } else if (parsed.pois) {
                                    parsedData = parsed.pois;
                                    break;
                                }
                            } catch (e) {
                                console.warn('⚠️ 字段', key, '不是有效的 JSON');
                            }
                        } else if (outputs[key]?.pois) {
                            parsedData = outputs[key].pois;
                            break;
                        }
                    }
                } else if (data.outputs?.result) {
                    parsedData = data.outputs.result;
                } else if (data.outputs?.pois) {
                    parsedData = data.outputs.pois;
                } else if (data.result) {
                    parsedData = data.result;
                } else if (data.pois) {
                    parsedData = data.pois;
                } else if (Array.isArray(data)) {
                    parsedData = data;
                }
                
                // 如果解析到数据，更新 finalResult
                if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
                    finalResult = parsedData;
                    console.log('✅ 成功解析数据:', finalResult.length, '条');
                }
                
                // 实时更新界面（添加去重处理）
                if (Array.isArray(finalResult) && finalResult.length > 0) {
                    const uniqueResults = finalResult.filter((item, index, self) => 
                        index === self.findIndex((t) => t.id === item.id)
                    );
                    setSearchResults([...uniqueResults]);
                    console.log('🔄 实时更新结果:', uniqueResults.length, '条（已去重）');
                }

              }catch(err){
                console.warn('⚠️ 解析数据块失败:', err, jsonStr); 
              }

              }
            }
          }
        // ✅ 最终结果处理（添加去重）
        console.log('🎯 最终结果:', finalResult);
        if (Array.isArray(finalResult) && finalResult.length > 0) {
            const uniqueResults = finalResult.filter((item, index, self) => 
                index === self.findIndex((t) => t.id === item.id)
            );
            console.log(`📊 去重前: ${finalResult.length} 条，去重后: ${uniqueResults.length} 条`);
            setSearchResults(uniqueResults);
        } else {
            setSearchResults([]);
            setError('未找到搜索结果');
        }


    }catch(err){
        console.error('搜索失败',err);
        setError(err.message||'搜索失败，请稍后重试');
        setSearchResults([]);

    }finally{
        setLoading(false);
    }
  };
  //回车事件
  const handleSearchKeyPress=(e)=>{
    if(e.key==='Enter'&&searchText.trim()){
      performSearch(searchText);
    }
  };

  return(
        <div className="fixed inset-0 z-10 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onNavigateToDiscover} className="mr-3">
            <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800">发现之旅搜索结果</h1>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full px-4 py-2 pl-10 text-sm bg-gray-100 border-0 rounded-full focus:outline-none focus:bg-white focus:shadow-md"
              placeholder="搜索景点、攻略或主题..."
              autoFocus
            />
            <i className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 fa-solid fa-search"></i>
          </div>
        </div>
        {
            userLocation&&(
                <div className="px-4 pb-3">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <i className="fa-solid fa-location-dot text-blue-500 mr-1"></i>
                        <span>已定位：{userLocation.address||`${userLocation.lng},${userLocation.lat}`}</span>
                    </div>
                </div>
            )
        }
      </div>


      {/* 搜索结果 */}
      {/* {searchResults.length>0?(
        <div className="mt-2">
            {searchResults.map((result)=>{
                <div key={result.id} className="flex flex-col w-[90%] mx-auto h-auto bg-white rounded-lg shadow-sm">
                    <img className="w-full h-auto" src={result.image}/>
                    <h3 className="text-lg font-medium">{result.title}</h3>
                    <p className="text-sm">{result.location}</p>
                </div>
            })}
        </div>
      ):(
        <div className="text-center text-gray-500">
           <p className="text-gray-500">
            {searchText?'暂无搜索结果':'输入关键词开始搜索'}
           </p>
        </div>
      )} */}

<div className="flex-1 pt-36 pb-6 px-4 overflow-y-auto">
        {/* 搜索关键词显示 */}
        {searchText && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              搜索: <span className="font-semibold text-blue-600">{searchText}</span>
              {searchResults.length > 0 && (
                <span className="ml-2 text-gray-500">
                  (共 {searchResults.length} 条结果)
                </span>
              )}
            </p>
          </div>
            )}

            {/* Loading 状态 */}
             {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">搜索中...</p>
              </div>
            )} 
             {/* Error 状态 */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center text-red-600">
              <i className="fa-solid fa-exclamation-circle mr-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}
         {/* 搜索结果列表 */}
         {!loading && !error && searchResults.length > 0 && (
          <div>
            {searchResults.map((result, index) => (
              <div key={`${result.id}-${index}`} className="bg-white rounded-lg shadow-sm overflow-hidden mb-3 flex flex-col w-[90%] h-auto mx-auto">
                {result.photo && (
                  <div className="w-full h-40 bg-gray-200">
                    <img 
                      src={result.photo}
                      alt={result.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display='none';
                        e.target.parentElement.innerHTML='<div class="w-full h-full flex items-center justify-center"><i class="fa-solid fa-image"></i></div>';
                      }}
                    />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                    {result.name}
                  </h3>
                  <div className="flex item-start text-sm text-gray-600 mb-2">
                    <i className="fa-solid fa-location-dot text-blue-500 mr-1"></i>
                    <span>{result.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 无结果状态 */}
        {!loading && !error && searchResults.length === 0 && searchText && (
          <div className="text-center py-12">
            <i className="fa-solid fa-search text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg mb-2">暂无搜索结果</p>
            <p className="text-gray-400 text-sm">试试其他关键词吧</p>
          </div>
        )}
          {/* 初始状态 */}
          {!loading && !searchText && (
          <div className="text-center py-12">
            <i className="fa-solid fa-magnifying-glass text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg mb-2">输入关键词开始搜索</p>
            <p className="text-gray-400 text-sm">发现身边的美食、景点和好去处</p>
          </div>
        )}
      </div>
    
      </div>
    )}





export default DSreachPage;
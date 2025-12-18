import React, { useState, useEffect, useRef } from 'react';
import { Button, Skeleton } from 'react-vant';
import { getPublicPosts, addPostFavorite, removePostFavorite, getPostFavorites, addAttractionFavorite, removeAttractionFavorite, getCurrentUserId, checkAttractionFavoriteStatus, getUserAttractionFavorites, getRecommendedActivities, getLocalActivities } from '../api/config';
import amapConfig from '../config/amapConfig';
// import AiFloatingButton from '../components/AiFloatingButton';
import ActivityListItem from './ActivityListItem';
import ActivityDetailPage from './ActivityDetailPage';
import ActivityStackCards from './ActivityStackCards';
import TreasureMapWidget from './TreasureMapWidget';
import DiscoverPageSkeleton from './DiscoverPageSkeleton';
import AiEntryModal from './AiEntryModal';

export default function DiscoverPage({ 
  onNavigateToDSreach, 
  onNavigateToMine, 
  onBack, 
  onNavigateToPostDetail, 
  onNavigateToTripDetail,
  tripPlans: tripPlansFromProps = [],
  currentCity: currentCityFromProps = '',
  onTripPlansUpdate,
  onCityUpdate,
  onNavigateToDLookMap,
  onNavigateToSelectCity,
  treasureSpots: treasureSpotsFromProps = [],
  treasureUserLocation: treasureUserLocationFromProps = null,
  onTreasureDataUpdate,
  onNavigateToCommunity,
  onNavigateToActivityPage,
  chatUnreadCount = 0,
  onNavigateToAi
}){
  const [searchText,setSearchText]=useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  // 高德地图搜索相关状态
  // const [searchSuggestions, setSearchSuggestions] = useState([]);
  // const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  // const searchTimeoutRef = useRef(null);
  
  // 旅行家精选模块已移动到社区页面
  // const [posts, setPosts] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  // 🔥 使用来自 App.jsx 的状态（如果提供），否则使用本地状态作为后备
  const [localTripPlans,setLocalTripPlans]=useState([]);
  const [localCurrentCity,setLocalCurrentCity]=useState('');
   
  const tripPlans = onTripPlansUpdate ? tripPlansFromProps : localTripPlans;
  const currentCity = onCityUpdate ? currentCityFromProps : localCurrentCity;
  const setTripPlans = onTripPlansUpdate || setLocalTripPlans;
  const setCurrentCity = onCityUpdate || setLocalCurrentCity;
   
  const [isLoading,setIsLoading]=useState(false);
  const [streamingText,setStreamingText]=useState('');//存储流式传输的文本


  // 🌟 宝藏景点 - 优先使用App.jsx传入的数据
  const [localTreasureSpots, setLocalTreasureSpots] = useState([]);
  const [localUserLocation, setLocalUserLocation] = useState(null);
  const [treasureSpotsLoading, setTreasureSpotsLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  //收藏宝藏景点
  const [favoriteLoading, setFavoriteLoading] = useState(new Set()); // 存储正在加载的景点ID
  const [favoriteSpots, setFavoriteSpots] = useState(new Set()); // 存储已收藏景点的标识
  const [favoriteCount, setFavoriteCount] = useState(0); // 存储收藏总数

  // 🎯 活动相关状态
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  // 使用来自App的数据（如果有）
  const treasureSpots = onTreasureDataUpdate ? treasureSpotsFromProps : localTreasureSpots;
  const userLocation = onTreasureDataUpdate ? treasureUserLocationFromProps : localUserLocation;
  const setTreasureSpots = onTreasureDataUpdate 
    ? (spots) => {
        setLocalTreasureSpots(spots);
        if (onTreasureDataUpdate && userLocation) {
          onTreasureDataUpdate(spots, userLocation);
        }
      }
    : setLocalTreasureSpots;
  const setUserLocation = onTreasureDataUpdate
    ? (location) => {
        setLocalUserLocation(location);
        if (onTreasureDataUpdate && treasureSpots) {
          onTreasureDataUpdate(treasureSpots, location);
        }
      }
    : setLocalUserLocation;

  // Dify配置
  const DIFY_CONFIG = {
    apiKey: 'app-yhxHJbKTCHhLqZpbRwWLZH4v',
    baseUrl: 'https://api.dify.ai/v1/workflows',
    timeout: 30000
  };

  // const extractJSONObjects=(text)=>{
  //   const jsonObjects=[];
  //   let depth=0;
  //   let startIndex=-1;

  //   for(let i=0;i<length;i++){
  //     if(text[i]==='{'){
  //       if(depth===0){
  //         startIndex=i;
  //       }
  //       depth++;
  //     }else if(text[i]==='}'){
  //       depth--;
  //       if(depth===0&&startIndex!==-1){
  //         const jsonStr=text.substring(startIndex,i+1);
  //         if(jsonStr.includes('"trip_title')){
  //           jsonObjects.push(jsonStr);
  //         }
  //         startIndex=-1;
  //       }
  //     }
  //   }
  //   return jsonObjects;
  // }

  // const tryParseAndSetData=(data)=>{
  //   try{
  //     let parsedData=[];

  //     if(typeof data==='string'){
  //       const jsonBlockMatches=[...data.matchAll(/```json\s*([\s\S]*?)\s*```/g)]
  //       if(jsonBlockMatches.length>0){
  //         jsonBlockMatches.forEach((match)=>{
  //           try{
  //             const parsed=JSON.parse(match[1].trim());
  //             parsedData.push(parsed);
  //           }catch(e){
  //             console.warn('解析代码块失败:',e.message);
  //           }
  //         });
  //       }else{
  //         try{
  //           const directParsed=JSON.parse(data.trim());
  //           parsedData=Array.isArray(directParsed)?directParsed:[directParsed];
  //         }catch(e){
  //           const jsonStrings=extractJSONObjects(data);
  //           jsonStrings.forEach((jsonStr)=>{
  //             try{
  //               parsedData.push(JSON.parse(jsonStr));
  //             }catch(err){
  //               console.warn('解析对象失败:',err.message);
  //             }
  //           });
  //         }
  //         }
  //       }else{
  //         parsedData=Array.isArray(data)?data:[data];
  //       }
  //       const validData=parsedData.filter(item=>
  //         item &&
  //         typeof item==='object'&&
  //         (item.trip_title||item.title)&&
  //         (item.total_days||item.days)
  //       );
  //       if(validData.length>0){
  //         setTripPlans(validData);
  //       }else if(parsedData.length>0){
  //         setTripPlans(parsedData);
  //       }
  //   }catch(e){
  //     console.error('解析数据时发生错误:',e);
  //   }
  // };


  //获取用户位置数据
  const getUserLocation = () => {
    return new Promise((resolve,reject)=>{
      if(!window.AMap){
        //如果高德地图api未加载，动态加载（添加Geocoder用于逆地理编码）
        const script=document.createElement('script');
        script.src=amapConfig.getApiUrl(['AMap.Geolocation', 'AMap.Geocoder']);
        script.onload=()=>{
          getLocationWithAMap(resolve,reject);

        };
      script.onerror=()=>{
        reject(new Error('高德地图API加载失败'));
      }
      document.head.appendChild(script);
    }else{
      getLocationWithAMap(resolve,reject);
    }
  });
  }
  //高德地获取用户当前位置（包含城市信息）
  const getLocationWithAMap=(resolve,reject)=>{
    window._AMapSecurityConfig={
      securityJsCode:amapConfig.securityKey,
    }
    window.AMap.plugin(['AMap.Geolocation', 'AMap.Geocoder'],function(){
      const geolocation=new window.AMap.Geolocation({
        enableHighAccuracy:true,
        timeout:10000,
      })
      geolocation.getCurrentPosition(function(status,result){
        if(status==='complete'){
          // 🌟 提取城市信息
          const cityName = result.addressComponent?.city || result.addressComponent?.province || '';
          const cleanCity = cityName.replace(/市|省/g, ''); // 去除"市""省"后缀
          
          const locationData={
            lng:result.position.lng,
            lat:result.position.lat,
            address:result.formattedAddress||'',
            city: cleanCity, // 🌟 添加城市字段
          };
          console.log('✅ 定位成功，城市:', cleanCity, locationData);
          resolve(locationData);
        }else{
          console.error('❌ 定位失败',result);
          reject(new Error(result.message||'定位失败'));
        }
      })

    })
  }
  // 辅助函数：使用栈匹配提取完整的 JSON 对象
  const extractJSONObjects = (text) => {
    const jsonObjects = [];
    let depth = 0;
    let startIndex = -1;

    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) {
          startIndex = i;
        }
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          const jsonStr = text.substring(startIndex, i + 1);
          if (jsonStr.includes('"trip_title"')) {
            jsonObjects.push(jsonStr);
          }
          startIndex = -1;
        }
      }
    }
    return jsonObjects;
  };

  const extractLastCompleteJSON = (text) => {
    if (typeof text !== 'string' || !text) return null;

    const findLastIndexOfEither = (s, chars) => {
      let last = -1;
      for (const ch of chars) {
        const idx = s.lastIndexOf(ch);
        if (idx > last) last = idx;
      }
      return last;
    };

    const tryExtractFrom = (startIdx) => {
      if (startIdx < 0 || startIdx >= text.length) return null;
      const open = text[startIdx];
      const close = open === '{' ? '}' : open === '[' ? ']' : null;
      if (!close) return null;

      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let i = startIdx; i < text.length; i++) {
        const c = text[i];

        if (inString) {
          if (escaped) {
            escaped = false;
            continue;
          }
          if (c === '\\') {
            escaped = true;
            continue;
          }
          if (c === '"') {
            inString = false;
          }
          continue;
        }

        if (c === '"') {
          inString = true;
          continue;
        }

        if (c === open) depth++;
        if (c === close) {
          depth--;
          if (depth === 0) {
            return text.slice(startIdx, i + 1);
          }
        }
      }

      return null;
    };

    // Prefer extracting a JSON array if present (common for POIs / list outputs)
    const lastBracket = text.lastIndexOf('[');
    const candidateArray = tryExtractFrom(lastBracket);
    if (candidateArray) return candidateArray;

    // Fallback to extracting a JSON object
    let searchFrom = text.length;
    while (true) {
      const slice = text.slice(0, searchFrom);
      const lastBrace = slice.lastIndexOf('{');
      const candidateObj = tryExtractFrom(lastBrace);
      if (candidateObj) return candidateObj;
      if (lastBrace <= 0) break;
      searchFrom = lastBrace;
    }

    // Last resort: try from the last '{' or '[' (whichever later)
    const lastAny = findLastIndexOfEither(text, ['{', '[']);
    return tryExtractFrom(lastAny);
  };

  // 尝试解析并设置数据
  const tryParseAndSetData = (data) => {
    try {
      console.log('🔍 [tryParseAndSetData] 开始解析数据');
      console.log('📦 数据类型:', typeof data);
      console.log('📦 数据内容（前500字符）:', typeof data === 'string' ? data.substring(0, 500) : data);
      
      let parsedData = [];
      
      if (typeof data === 'string') {
        console.log('📝 数据是字符串，尝试解析...');
        const jsonBlockMatches = [...data.matchAll(/```json\s*([\s\S]*?)\s*```/g)];
        
        if (jsonBlockMatches.length > 0) {
          console.log(`✅ 找到 ${jsonBlockMatches.length} 个 JSON 代码块`);
          jsonBlockMatches.forEach((match, index) => {
            try {
              const parsed = JSON.parse(match[1].trim());
              console.log(`✅ 成功解析代码块 ${index + 1}:`, parsed);
              parsedData.push(parsed);
            } catch (e) {
              console.warn(`❌ 解析代码块 ${index + 1} 失败:`, e.message);
            }
          });
        } else {
          console.log('⚠️ 未找到 JSON 代码块，尝试直接解析...');
          try {
            const directParsed = JSON.parse(data.trim());
            console.log('✅ 直接解析成功:', directParsed);
            parsedData = Array.isArray(directParsed) ? directParsed : [directParsed];
          } catch (e) {
            console.warn('❌ 直接解析失败，尝试提取 JSON 对象:', e.message);

            const lastJson = extractLastCompleteJSON(data);
            if (lastJson) {
              try {
                const parsed = JSON.parse(lastJson);
                console.log('✅ 从混合文本中提取并解析最后一个 JSON 成功:', parsed);
                parsedData = Array.isArray(parsed) ? parsed : [parsed];
              } catch (err) {
                console.warn('❌ 解析最后一个 JSON 失败:', err.message);
              }
            }

            const jsonStrings = extractJSONObjects(data);
            console.log(`🔍 提取到 ${jsonStrings.length} 个 JSON 对象`);
            jsonStrings.forEach((jsonStr, index) => {
              try {
                const parsed = JSON.parse(jsonStr);
                console.log(`✅ 成功解析对象 ${index + 1}:`, parsed);
                parsedData.push(parsed);
              } catch (err) {
                console.warn(`❌ 解析对象 ${index + 1} 失败:`, err.message);
              }
            });
          }
        }
      } else {
        console.log('📦 数据不是字符串，直接使用');
        parsedData = Array.isArray(data) ? data : [data];
      }
      
      console.log('📊 解析后的数据数量:', parsedData.length);
      console.log('📊 解析后的数据:', parsedData);
      
      // 🔍 检查每条数据的图片字段
      parsedData.forEach((item, index) => {
        if (item && item.days && item.days.length > 0) {
          const firstDay = item.days[0];
          let firstDayPhoto = firstDay.photo || firstDay.image || firstDay.cover;
          
          // 如果第一天没有直接的图片字段，检查 spots 中的图片
          if (!firstDayPhoto && firstDay.spots && firstDay.spots.length > 0) {
            const firstSpot = firstDay.spots[0];
            if (typeof firstSpot === 'object' && firstSpot.photo) {
              firstDayPhoto = firstSpot.photo;
            }
          }
          
          console.log(`🖼️ 路线 ${index + 1} 图片检查:`, {
            路线标题: item.trip_title || item.title,
            第一天直接图片: firstDay.photo || firstDay.image || firstDay.cover || '无',
            第一天spots图片: (firstDay.spots && firstDay.spots[0] && typeof firstDay.spots[0] === 'object') ? firstDay.spots[0].photo : '无',
            最终使用图片: firstDayPhoto || '无',
            路线级别图片: item.cover_image || item.image || item.photo || '无',
            第一天完整数据: firstDay
          });
        }
      });
      
      const validData = parsedData.filter(item => 
        item && 
        typeof item === 'object' &&
        (item.trip_title || item.title) && 
        (item.total_days || item.days)
      );
      
      console.log('✅ 有效数据数量:', validData.length);
      console.log('✅ 有效数据:', validData);
      
      if (validData.length > 0) {
        console.log('🎉 设置有效数据到 tripPlans');
        setTripPlans(validData);
      } else if (parsedData.length > 0) {
        console.log('⚠️ 没有完全有效的数据，但设置所有解析的数据');
        setTripPlans(parsedData);
      } else {
        console.error('❌ 没有可用的数据');
      }
    } catch (e) {
      console.error('❌ 解析数据时发生错误:', e);
      console.error('错误堆栈:', e.stack);
    }
  };

  // 调用Dify API
  const fetchTripPlansStreaming = async (city) => {
    setIsLoading(true);
    setStreamingText('');
    setTripPlans([]);
    
    try {
      const response = await fetch(`${DIFY_CONFIG.baseUrl}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: { city: city },
          response_mode: 'streaming',
          user: 'user-' + Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败 ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';
      let dataAlreadySet = false; // 🌟 添加标志避免重复设置
      let lastNodeFinishedOutputs = null;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // 🌟 只有在 workflow_finished 没有设置数据时才使用累积的文本
          if (accumulatedText && !dataAlreadySet) {
            tryParseAndSetData(accumulatedText);
          }
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.slice(5).trim();
              if (jsonStr === '[DONE]') continue;

              const eventData = JSON.parse(jsonStr);

              if (eventData.event === 'node_finished') {
                console.log('📥 收到 node_finished 事件');
                if (eventData.data && eventData.data.outputs) {
                  console.log('📦 node_finished outputs:', eventData.data.outputs);
                  lastNodeFinishedOutputs = eventData.data.outputs;
                  Object.keys(eventData.data.outputs).forEach(key => {
                    const outputValue = eventData.data.outputs[key];

                    // Filter out meta outputs (these pollute accumulatedText and break JSON parsing)
                    if (key === 'city' || key.startsWith('sys.')) {
                      return;
                    }

                    // Only append likely content keys / values
                    const isLikelyContentKey = key === 'result' || key === 'text' || key === 'json';

                    if (typeof outputValue === 'string') {
                      const trimmed = outputValue.trim();
                      const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.includes('```json');
                      if (isLikelyContentKey || looksLikeJson) {
                        accumulatedText += outputValue;
                        setStreamingText(prev => prev + outputValue);
                      }
                    } else if (typeof outputValue === 'object') {
                      if (isLikelyContentKey) {
                        const jsonStr = JSON.stringify(outputValue);
                        accumulatedText += jsonStr;
                        setStreamingText(prev => prev + jsonStr);
                      }
                    }
                  });
                }
              } else if (eventData.event === 'workflow_finished') {
                // 🌟 workflow_finished 是最终结果，优先使用
                console.log('🎉 收到 workflow_finished 事件');
                console.log('📦 workflow_finished 完整数据:', eventData);
                if (eventData.data && eventData.data.outputs) {
                  console.log('📦 workflow_finished outputs:', eventData.data.outputs);
                  const outputKeys = Object.keys(eventData.data.outputs);
                  console.log('🔑 输出键列表:', outputKeys);
                  const firstKey = outputKeys[0];
                  if (firstKey) {
                    console.log(`🔑 使用第一个键: ${firstKey}`);
                    console.log('📦 该键的值:', eventData.data.outputs[firstKey]);
                    tryParseAndSetData(eventData.data.outputs[firstKey]);
                    dataAlreadySet = true; // 🌟 标记已设置
                  } else {
                    console.warn('⚠️ workflow_finished 没有输出键');

                    // Fallback: try parsing from accumulatedText / last node_finished
                    if (!dataAlreadySet) {
                      if (accumulatedText) {
                        tryParseAndSetData(accumulatedText);
                        dataAlreadySet = true;
                      } else if (lastNodeFinishedOutputs) {
                        const fallbackKey = Object.keys(lastNodeFinishedOutputs).find(k => k === 'result' || k === 'text' || k === 'json');
                        if (fallbackKey) {
                          tryParseAndSetData(lastNodeFinishedOutputs[fallbackKey]);
                          dataAlreadySet = true;
                        }
                      }
                    }
                  }
                } else {
                  console.warn('⚠️ workflow_finished 没有 outputs');

                  // Same fallback as above when outputs missing
                  if (!dataAlreadySet) {
                    if (accumulatedText) {
                      tryParseAndSetData(accumulatedText);
                      dataAlreadySet = true;
                    } else if (lastNodeFinishedOutputs) {
                      const fallbackKey = Object.keys(lastNodeFinishedOutputs).find(k => k === 'result' || k === 'text' || k === 'json');
                      if (fallbackKey) {
                        tryParseAndSetData(lastNodeFinishedOutputs[fallbackKey]);
                        dataAlreadySet = true;
                      }
                    }
                  }
                }
              } else if (eventData.event === 'text_chunk') {
                console.log('📝 收到 text_chunk 事件');
                const text = eventData.data?.text || '';
                accumulatedText += text;
                setStreamingText(prev => prev + text);
              } else {
                console.log('📥 收到其他事件:', eventData.event);
              }
            } catch (parseError) {
              console.warn('解析数据失败:', parseError);
            }
          }
        }
      }

      // 注意：不再在这里设置城市，城市已经在调用前确定
      // setCurrentCity(city); // ❌ 移除：这会导致循环调用
    } catch (error) {
      console.error('获取旅游路线失败：', error);
      alert('获取旅游路线失败：' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  // 获取宝藏景点 - 已改为直接调用高德地图API（Diffy调用已注释）
  const fectcTreasureSpots = async (lng, lat, locationData) => {
    setTreasureSpotsLoading(true);
    setLocationError(null);
    
    try {
      console.log('🔍 开始获取宝藏景点（使用高德地图API）', { lng, lat });
      
      // ===== Diffy API 调用已注释 =====
      // const response = await fetch(`${DIFY_CONFIG.baseUrl}/run`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     inputs: {
      //       lng: lng.toString(),
      //       lat: lat.toString(),
      //     },
      //     response_mode: 'blocking',
      //     user: 'user-treasure-' + Date.now()
      //   })
      // });
      // 
      // if (!response.ok) {
      //   throw new Error(`API请求失败 ${response.status}`);
      // }
      // 
      // const data = await response.json();
      // console.log('📦 Dify返回的宝藏数据:', data);
      // 
      // // 解析景点数据
      // let spots = [];
      // if (data.data && data.data.outputs) {
      //   const outputKey = Object.keys(data.data.outputs)[0];
      //   const outputValue = data.data.outputs[outputKey];
      //   
      //   if (typeof outputValue === 'string') {
      //     try {
      //       spots = JSON.parse(outputValue);
      //     } catch (e) {
      //       console.error('❌ 解析宝藏数据失败:', e);
      //       throw new Error('解析宝藏数据失败');
      //     }
      //   } else if (Array.isArray(outputValue)) {
      //     spots = outputValue;
      //   }
      // }
      // ===== Diffy API 调用已注释 =====
      
      // 🌟 现在使用高德地图API直接搜索附近景点
      // 这部分逻辑应该在 TreasureMapWidget 组件中实现
      console.log('⚠️ 宝藏景点现在由 TreasureMapWidget 组件通过高德地图API获取');
      
      // 暂时设置空数据，实际数据由地图组件提供
      setTreasureSpots([]);
      
    } catch (error) {
      console.error('❌ 获取宝藏景点失败:', error);
      setLocationError(error.message);
      setTreasureSpots([]);
    } finally {
      setTreasureSpotsLoading(false);
    }
  };

  // 🔧 检查景点收藏状态（与服务器同步 + 名称匹配）
  const checkSpotsStatus = async (spots) => {
    try {
      console.log('🔍 开始检查景点收藏状态...', spots.length, '个景点');
      
      // 1️⃣ 获取本地收藏数据 - 检查多个可能的key
      console.log('🔍 检查localStorage中的所有收藏相关数据:');
      console.log('  - favoriteSpots:', localStorage.getItem('favoriteSpots'));
      console.log('  - attraction_favorites:', localStorage.getItem('attraction_favorites'));
      console.log('  - user_favorites:', localStorage.getItem('user_favorites'));
      
      let localFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
      console.log('📋 本地收藏数据 (favoriteSpots):', localFavorites);
      
      // 🔧 如果localStorage为empty，尝试从API获取收藏数据
      if (localFavorites.length === 0) {
        console.log('⚠️ localStorage为空，尝试从API获取收藏数据...');
        
        // 🧪 添加全局测试函数
        window.testAttractionAPI = async () => {
          console.log('🧪 开始手动测试收藏景点API...');
          try {
            const response = await fetch('/api/favorite/attractions', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            console.log('🧪 手动API测试结果:', data);
            console.log('🧪 响应状态:', response.status);
            console.log('🧪 是否成功:', response.ok);
            return data;
          } catch (error) {
            console.error('🧪 手动API测试失败:', error);
            return null;
          }
        };
        
        console.log('🧪 已添加全局测试函数，请在控制台运行: testAttractionAPI()');
        console.log('🧪 或者运行: window.testAttractionAPI()');
        
        try {
          const apiResponse = await getUserAttractionFavorites();
          console.log('📡 API响应原始数据:', apiResponse);
          
          if (apiResponse && apiResponse.code === 200) {
            console.log('✅ API调用成功，开始解析数据...');
            console.log('📊 apiResponse.data:', apiResponse.data);
            console.log('📊 数据类型:', typeof apiResponse.data);
            
            let apiData = [];
            if (Array.isArray(apiResponse.data)) {
              apiData = apiResponse.data;
              console.log('📋 数据是数组格式:', apiData.length, '条');
            } else if (apiResponse.data && Array.isArray(apiResponse.data.list)) {
              apiData = apiResponse.data.list;
              console.log('📋 数据是对象.list格式:', apiData.length, '条');
            } else if (apiResponse.data && typeof apiResponse.data === 'object') {
              apiData = [apiResponse.data];
              console.log('📋 数据是单个对象，转为数组');
            } else {
              console.warn('⚠️ 无法解析API数据格式');
            }
            
            console.log('📡 解析后的API数据:', apiData);
            
            if (apiData.length > 0) {
              // 转换为localStorage格式
              localFavorites = apiData.map(item => {
                console.log('🔄 转换数据项:', item);
                return {
                  name: item.name || item.attractionName || '未知景点',
                  lat: item.lat || item.attractionLat || 0,
                  lng: item.lng || item.attractionLng || 0,
                  timestamp: item.favoriteTime ? new Date(item.favoriteTime).getTime() : Date.now()
                };
              });
              
              console.log('🔄 转换完成的数据:', localFavorites);
              
              // 保存到localStorage
              localStorage.setItem('favoriteSpots', JSON.stringify(localFavorites));
              console.log('💾 已同步API数据到localStorage:', localFavorites);
            } else {
              console.log('📭 API返回的数据为空');
            }
          } else {
            console.warn('❌ API调用失败:', apiResponse);
          }
        } catch (error) {
          console.warn('❌ 从API获取收藏数据失败:', error);
        }
      }
      
      const localFavoriteNames = new Set(localFavorites.map(fav => fav.name));
      console.log('📋 最终收藏景点名称:', Array.from(localFavoriteNames));
      
      // 2️⃣ 检查每个新景点
      console.log('🔍 检查新景点列表:');
      spots.forEach(spot => {
        console.log(`  - ${spot.name} (${spot.lat}, ${spot.lng})`);
      });
      
      // 3️⃣ 检查服务器精确匹配的收藏状态
      const favoriteChecks = spots.map(spot => checkAttractionFavoriteStatus(spot));
      const results = await Promise.allSettled(favoriteChecks);
      
      const serverFavorites = new Set();
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.code === 200 && result.value?.data?.isFavorited) {
          const spot = spots[index];
          const spotId = `${spot.name}_${spot.lat}_${spot.lng}`;
          serverFavorites.add(spotId);
          console.log(`✅ 服务器精确匹配: ${spot.name}`);
        }
      });
      
      // 4️⃣ 检查新景点是否有同名已收藏景点（支持精确匹配和模糊匹配）
      const nameMatchedFavorites = new Set();
      spots.forEach(spot => {
        const spotId = `${spot.name}_${spot.lat}_${spot.lng}`;
        
        console.log(`🔍 检查景点: "${spot.name}" 是否在收藏名称中...`);
        
        // 方法1：精确匹配
        if (localFavoriteNames.has(spot.name)) {
          nameMatchedFavorites.add(spotId);
          console.log(`🎯 发现同名景点已收藏(精确): "${spot.name}" -> ${spotId}`);
          return;
        }
        
        // 方法2：模糊匹配（去除特殊字符和空格后比较）
        const normalizedSpotName = spot.name.replace(/[\s\(\)（）]/g, '');
        let fuzzyMatched = false;
        
        for (const favName of localFavoriteNames) {
          const normalizedFavName = favName.replace(/[\s\(\)（）]/g, '');
          
          // 检查是否包含关系（任一方向）
          if (normalizedSpotName.includes(normalizedFavName) || normalizedFavName.includes(normalizedSpotName)) {
            nameMatchedFavorites.add(spotId);
            console.log(`🎯 发现相似景点已收藏(模糊): "${spot.name}" ≈ "${favName}" -> ${spotId}`);
            fuzzyMatched = true;
            break;
          }
        }
        
        if (!fuzzyMatched) {
          console.log(`❌ 景点 "${spot.name}" 未在收藏中 (已检查精确和模糊匹配)`);
        }
      });
      
      // 5️⃣ 合并精确匹配和名称匹配的结果
      const finalFavorites = new Set([...serverFavorites, ...nameMatchedFavorites]);
      
      console.log('🎯 最终收藏状态设置:', Array.from(finalFavorites));
      setFavoriteSpots(finalFavorites);
      
      console.log('✅ 收藏状态同步完成:', {
        本地收藏景点数量: localFavorites.length,
        本地收藏景点名称: Array.from(localFavoriteNames),
        服务器精确匹配: serverFavorites.size,
        名称匹配: nameMatchedFavorites.size,
        最终收藏状态: finalFavorites.size
      });
      
    } catch (error) {
      console.warn('⚠️ 检查收藏状态失败，使用本地状态:', error);
      // 如果服务器检查失败，使用本地名称匹配
      try {
        const localFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
        const localFavoriteNames = new Set(localFavorites.map(fav => fav.name));
        
        const localMatchedFavorites = new Set();
        spots.forEach(spot => {
          const spotId = `${spot.name}_${spot.lat}_${spot.lng}`;
          if (localFavoriteNames.has(spot.name)) {
            localMatchedFavorites.add(spotId);
            console.log(`📋 本地匹配成功: ${spot.name}`);
          }
        });
        
        setFavoriteSpots(localMatchedFavorites);
        console.log('📋 使用本地名称匹配:', localMatchedFavorites.size, '个景点');
      } catch (localError) {
        console.warn('本地匹配也失败:', localError);
      }
    }
  };

  /**
   * 🔄 刷新宝藏景点
   * 用户手动触发，重新获取位置和景点数据
   */
  const handleRefreshTreasure = async () => {
    console.log('🔄 用户点击刷新宝藏景点');
    setLocationError(null); // 清除之前的错误
    
    try {
      // 重新获取位置
      const location = await getUserLocation();
      setUserLocation(location);
      
      // 获取景点数据（Diffy调用已注释，现在由地图组件处理）
      // await fectcTreasureSpots(location.lng, location.lat, location);
      console.log('⚠️ 景点数据现在由 TreasureMapWidget 组件获取');
    } catch (error) {
      console.error('❌ 刷新宝藏失败', error);
      setLocationError(error.message);
    }
  };

  /**
   * 🎯 加载推荐活动，如果为空则加载同城活动前3个
   */
  const loadActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      
      // 先尝试获取推荐活动
      const response = await getRecommendedActivities();
      
      if (response.code === 200) {
        const activityData = response.data;
        if (Array.isArray(activityData) && activityData.length > 0) {
          // 过滤掉已结束的活动，只显示前3个未结束的
          const activeActivities = activityData.filter(activity => {
            const isEnded = activity.endTime && new Date(activity.endTime) < new Date();
            const isCompleted = activity.status === 'completed';
            const isCancelled = activity.status === 'cancelled';
            return !isEnded && !isCompleted && !isCancelled;
          }).slice(0, 3);
          console.log('✅ 加载推荐活动:', activeActivities.length, '个');
          setActivities(activeActivities);
        } else {
          // 推荐活动为空，尝试加载同城活动
          console.log('ℹ️ 推荐活动为空，尝试加载同城活动...');
          const localResponse = await getLocalActivities();
          
          if (localResponse.code === 200 && Array.isArray(localResponse.data)) {
            // 过滤掉已结束的活动，显示同城活动的前3个未结束的
            const activeLocalActivities = localResponse.data.filter(activity => {
              const isEnded = activity.endTime && new Date(activity.endTime) < new Date();
              const isCompleted = activity.status === 'completed';
              const isCancelled = activity.status === 'cancelled';
              return !isEnded && !isCompleted && !isCancelled;
            }).slice(0, 3);
            console.log('✅ 加载同城活动:', activeLocalActivities.length, '个');
            setActivities(activeLocalActivities);
          } else {
            console.log('ℹ️ 同城活动也为空');
            setActivities([]);
          }
        }
      } else {
        throw new Error(response.message || '获取活动失败');
      }
    } catch (err) {
      console.error('❌ 加载活动失败:', err);
      setActivitiesError(err.message);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  /**
   * 🎯 处理活动卡片点击
   */
  const handleActivityClick = (activity) => {
    console.log('点击活动:', activity);
    setSelectedActivity(activity);
    setShowActivityDetail(true);
  };

  // 🎯 初始化加载活动
  useEffect(() => {
    loadActivities();
  }, []);

  // 🔧 从localStorage加载收藏状态
  useEffect(() => {
    const loadFavoriteState = () => {
      try {
        const savedFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
        console.log('🔄 加载本地收藏状态，原始数据:', savedFavorites);
        
        const favoriteIds = new Set(
          savedFavorites.map(fav => `${fav.name}_${fav.lat}_${fav.lng}`)
        );
        setFavoriteSpots(favoriteIds);
        console.log('✅ 从localStorage加载收藏状态:', favoriteIds.size, '个景点');
        console.log('📋 收藏ID列表:', Array.from(favoriteIds));
      } catch (error) {
        console.warn('⚠️ 加载收藏状态失败:', error);
      }
    };
    
    loadFavoriteState();
  }, []);

  // 🔥 使用 ref 追踪是否已经初始化过城市，避免覆盖用户选择
  const cityInitializedRef = useRef(false);
  // 🔥 使用 ref 追踪最新的城市值，解决闭包陷阱问题
  const currentCityRef = useRef(currentCity);

  // 🔥 同步更新ref，确保异步操作能读取到最新值
  useEffect(() => {
    currentCityRef.current = currentCity;
    // 如果城市有值，标记为已初始化
    if (currentCity && currentCity.trim()) {
      cityInitializedRef.current = true;
    }
  }, [currentCity]);

  // 🌟 修改：初始化时获取位置和宝藏景点（不再自动设置城市覆盖用户选择）
  useEffect(() => {
    const initTreasureSpots = async () => {
      // 如果已经有景点数据和位置数据，不重复获取
      if (treasureSpots.length > 0 && userLocation) {
        console.log('✅ 已有宝藏景点数据，跳过初始化');
        return;
      }

      try {
        console.log('🚀 开始初始化宝藏景点');
        const location = await getUserLocation();
        setUserLocation(location);
        
        // 🔥 关键：使用ref读取最新的城市值，而不是闭包中的旧值
        const latestCity = currentCityRef.current;
        
        // 只在首次加载且用户没有手动选择城市时，才自动设置城市
        // 检查条件：1.还没初始化过城市 2.当前城市为空 3.定位成功有城市信息
        if (!cityInitializedRef.current && !latestCity && location.city) {
          console.log('🏙️ 首次自动设置城市为:', location.city);
          setCurrentCity(location.city);
          cityInitializedRef.current = true;
        } else {
          console.log('⏭️ 跳过自动设置城市:', {
            已初始化: cityInitializedRef.current,
            当前城市: latestCity,
            定位城市: location.city
          });
        }
        
        // 获取景点数据，传入location确保数据同步
        await fectcTreasureSpots(location.lng, location.lat, location);
        console.log('⚠️ 景点数据现在由 TreasureMapWidget 组件获取');

      } catch (error) {
        console.error('❌ 初始化宝藏失败', error);
        setLocationError(error.message);
        
        // 🔥 定位失败时，使用ref检查最新城市值
        const latestCity = currentCityRef.current;
        if (!cityInitializedRef.current && !latestCity) {
          console.log('⚠️ 定位失败，使用默认城市: 北京');
          setCurrentCity('北京');
          cityInitializedRef.current = true;
        }
      }
    };
    
    initTreasureSpots();
  }, []); // 空依赖数组，只在首次挂载时执行
  // 收藏/取消收藏景点的处理方法
  const handleFavoriteSpot = async (spot) => {
    const spotId = `${spot.name}_${spot.lat}_${spot.lng}`;
    const isFavorited = favoriteSpots.has(spotId);
    
    // 🔧 设置单个景点的loading状态
    setFavoriteLoading(prev => new Set([...prev, spotId]));
    
    try {
      if (isFavorited) {
        // 🔧 取消收藏
        console.log('🎯 开始取消收藏景点:', spot.name);
        
        const result = await removeAttractionFavorite(null, spot);
        console.log('✅ 取消收藏API调用成功:', result);
        
        // 更新本地收藏状态（移除）
        setFavoriteSpots(prev => {
          const newSet = new Set(prev);
          newSet.delete(spotId);
          return newSet;
        });
        
        // 🔧 从localStorage移除
        const currentFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
        const updatedFavorites = currentFavorites.filter(fav => 
          `${fav.name}_${fav.lat}_${fav.lng}` !== spotId
        );
        localStorage.setItem('favoriteSpots', JSON.stringify(updatedFavorites));
        
        alert('已取消收藏！');
      } else {
        // 🔧 添加收藏
        console.log('🎯 开始收藏景点:', spot.name);
        
        const result = await addAttractionFavorite(null, spot);
        console.log('✅ 收藏API调用成功:', result);
        
        // 更新本地收藏状态（添加）
        setFavoriteSpots(prev => new Set([...prev, spotId]));
        
        // 🔧 持久化到localStorage
        const currentFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
        currentFavorites.push({
          name: spot.name,
          lat: spot.lat,
          lng: spot.lng,
          timestamp: Date.now()
        });
        localStorage.setItem('favoriteSpots', JSON.stringify(currentFavorites));
        
        alert('收藏成功！');
      }
    } catch (error) {
      console.error('❌ 操作失败:', error);
      
      // 根据错误类型提供不同的提示
      if (error.message.includes('401')) {
        alert('操作失败：登录已过期，请重新登录');
      } else if (error.message.includes('constraint') || error.message.includes('已收藏')) {
        // 如果是重复收藏，直接更新状态为已收藏
        setFavoriteSpots(prev => new Set([...prev, spotId]));
        alert('该景点已收藏！');
      } else {
        alert(`操作失败：${error.message || '网络错误，请重试'}`);
      }
    } finally {
      // 🔧 移除单个景点的loading状态
      setFavoriteLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(spotId);
        return newSet;
      });
    }
  };

  // 🔥 使用 ref 追踪上次加载的城市和API调用状态，避免重复调用
  const lastLoadedCity = useRef(null);
  const isApiCallingRef = useRef(false); // 防止并发API调用

  // 🔥 监听城市变化，自动调用 Dify API 获取路线
  useEffect(() => {
    // 条件1：城市有值
    if (!currentCity || !currentCity.trim()) {
      console.log('⏭️ 城市为空，跳过API调用');
      return;
    }

    // 条件2：没有正在进行中的API调用
    if (isApiCallingRef.current) {
      console.log('⏳ API正在调用中，跳过重复请求:', currentCity);
      return;
    }

    // 🔥 关键修复：检查是否已有该城市的路线数据（从App.jsx传入的缓存数据）
    // 如果已有数据，检查数据是否匹配当前城市
    const hasExistingData = tripPlans.length > 0;
    const existingDataMatchesCity = hasExistingData && tripPlans.some(plan => 
      plan.city === currentCity || 
      (plan.trip_title && plan.trip_title.includes(currentCity))
    );

    // 如果已有匹配的数据，更新ref但不调用API（用户从详情页返回的情况）
    if (existingDataMatchesCity) {
      console.log('✅ 已有该城市的路线数据，跳过API调用:', currentCity);
      lastLoadedCity.current = currentCity;
      return;
    }

    // 条件3：城市发生了改变（与上次加载的城市不同）
    const cityChanged = currentCity !== lastLoadedCity.current;

    if (cityChanged) {
      // 城市改变了，调用API获取路线
      console.log('🏙️ 城市改变，开始获取旅游路线:', currentCity);
      console.log('📝 上次加载的城市:', lastLoadedCity.current);
      
      // 🔥 标记API正在调用
      isApiCallingRef.current = true;
      lastLoadedCity.current = currentCity;
      
      // 调用API，完成后重置标记
      fetchTripPlansStreaming(currentCity).finally(() => {
        isApiCallingRef.current = false;
        console.log('✅ API调用完成，城市:', currentCity);
      });
    } else {
      // 城市未改变，使用缓存数据
      console.log('✅ 城市未改变，使用缓存数据:', currentCity);
    }
  }, [currentCity, tripPlans.length]); // 监听 currentCity 和数据长度

  // 加载高德地图脚本
  const loadAmapScript = () => {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve(window.AMap);
        return;
      }

      window._AMapSecurityConfig = {
        securityJsCode: amapConfig.securityKey,
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = amapConfig.getApiUrl(['AMap.AutoComplete', 'AMap.PlaceSearch']);
      script.onload = () => {
        if (window.AMap) {
          resolve(window.AMap);
        } else {
          reject(new Error('高德地图API加载失败'));
        }
      };
      script.onerror = () => reject(new Error('高德地图API加载出错'));
      document.head.appendChild(script);
    });
  };

  // 高德地图输入提示（已注释）
  // const handleSearchInput = async (value) => {
  //   setSearchText(value);
  //   
  //   if (!value.trim()) {
  //     setSearchSuggestions([]);
  //     setShowSuggestions(false);
  //     return;
  //   }

  //   // 防抖处理
  //   if (searchTimeoutRef.current) {
  //     clearTimeout(searchTimeoutRef.current);
  //   }

  //   searchTimeoutRef.current = setTimeout(async () => {
  //     try {
  //       await loadAmapScript();
  //       
  //       const autoComplete = new window.AMap.AutoComplete({
  //         city: currentCity || '全国',
  //         citylimit: false
  //       });

  //       autoComplete.search(value, (status, result) => {
  //         if (status === 'complete' && result.tips) {
  //           const suggestions = result.tips
  //             .filter(tip => tip.name && tip.name !== value)
  //             .slice(0, 8)
  //             .map(tip => ({
  //               id: tip.id,
  //               name: tip.name,
  //               district: tip.district,
  //               address: tip.address,
  //               location: tip.location
  //             }));
  //           setSearchSuggestions(suggestions);
  //           setShowSuggestions(suggestions.length > 0);
  //         }
  //       });
  //     } catch (error) {
  //       console.error('输入提示失败:', error);
  //     }
  //   }, 300);
  // };

  // POI搜索
  const searchPOI = async (keyword) => {
    try {
      setSearchLoading(true);
      // setShowSuggestions(false);
      
      await loadAmapScript();
      
      const placeSearch = new window.AMap.PlaceSearch({
        city: currentCity || '全国',
        citylimit: false,
        pageSize: 20,
        pageIndex: 1,
        extensions: 'all'
      });

      placeSearch.search(keyword, (status, result) => {
        setSearchLoading(false);
        
        if (status === 'complete' && result.poiList && result.poiList.pois) {
          const pois = result.poiList.pois.map(poi => ({
            id: poi.id,
            name: poi.name,
            type: poi.type,
            address: poi.address,
            district: poi.pname + poi.cityname + poi.adname,
            location: poi.location,
            tel: poi.tel,
            photos: poi.photos || [],
            rating: poi.biz_ext?.rating,
            cost: poi.biz_ext?.cost
          }));
          setSearchResults(pois);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          setShowSearchResults(true);
        }
      });
    } catch (error) {
      console.error('POI搜索失败:', error);
      setSearchLoading(false);
      setSearchResults([]);
      setShowSearchResults(true);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (searchText.trim()) {
        searchPOI(searchText.trim());
      }
    }
  };

  // 点击搜索建议（已注释）
  // const handleSuggestionClick = (suggestion) => {
  //   setSearchText(suggestion.name);
  //   searchPOI(suggestion.name);
  // };

  // 关闭搜索结果
  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchText('');
    // setShowSuggestions(false);
  };

  // 🎯 热门主题数据（8个主题）
  const allHotTopics = [
    { id: 1, name: '亲子乐园', image: '/亲子乐园.png', color: 'bg-red-100 text-red-600' },
    { id: 2, name: '周末时光', image: '/周末时光.png', color: 'bg-green-100 text-green-600', },
    { id: 3, name: '历史人文', image: '/历史人文.png', color: 'bg-yellow-100 text-yellow-600' },
    { id: 4, name: '美食探索', image: '/美食.png', color: 'bg-blue-100 text-blue-600' },
    { id: 5, name: '红色旅游', image: '/红色旅游.png', color: 'bg-red-100 text-red-700' },
    { id: 6, name: '主题公园', image: '/主题公园.png', color: 'bg-purple-100 text-purple-600' },
    { id: 7, name: '自然探索', image: '/自然探索.png', color: 'bg-green-100 text-green-700' },
    { id: 8, name: '科普教育', image: '/科普教育.png', color: 'bg-indigo-100 text-indigo-600' },
  ];

  // 🎯 控制热门主题的展开/收起状态
  const [showAllTopics, setShowAllTopics] = useState(false);
  
  // 根据展开状态决定显示哪些主题
  const displayedTopics = showAllTopics ? allHotTopics : allHotTopics.slice(0, 4);

  //  处理"更多"按钮点击
  const handleMoreClick = () => {
    setShowAllTopics(!showAllTopics);
    console.log('切换主题显示状态:', showAllTopics ? '收起' : '展开');
  };

  // 🎯 处理主题点击 - 直接搜索POI
  const handleTopicClick = (topicName) => {
    console.log('点击主题:', topicName);
    setSearchText(topicName);
    searchPOI(topicName);
  };

  const defaultRoutes = [
    {
      trip_title: '昆明经济游',
      total_days: 2,
      city: '昆明',
      date: '2023.10.08-2023.10.09',
      summary:
        '近距离观察多种动物，滇池环湖散步',
      highlights:
        '近距离观察多种动物，滇池环湖散步',
      total_budget: 1060,
      budget_breakdown: {
        transportation: 200,
        accommodation: 400,
        tickets: 60,
        food: 200,
        other: 100
      },
      days: [
        {
          day: 1,
          theme: '昆明动物园 · 滇池 · 昆明老街 · 晚餐',
          date: '2023.10.08',
          photo:
            'http://store.is.autonavi.com/showpic/9f962f0c059701572a7feede88e8da11',
          highlights:
            '近距离观察多种动物，滇池环湖散步',
          time_schedule:
            '09:00-11:00 昆明动物园 → 11:30-13:30 滇池 → 14:00-16:00 昆明老街 → 17:00-19:00 晚餐',
          spots: ['昆明动物园', '滇池', '昆明老街', '昆明滇池国际酒店'],
          routes_used: ['步行', '打车约20元/10分钟', '打车约15元/10分钟', '步行约10分钟']
        },
        {
          day: 2,
          theme: '昆明市博物馆 · 机场用餐 · 昆明湖散步',
          date: '2023.10.09',
          photo:
            'http://store.is.autonavi.com/showpic/a3706731adac2a5bc5dc3b85f76b8267',
          highlights:
            '上午参观昆明市博物馆了解昆明历史文化；中午前往昆明长水国际机场用餐休息；下午前往昆明湖散步拍照。',
          time_schedule:
            '09:00-11:00 昆明市博物馆 → 11:30-14:00 机场用餐 → 14:30-16:30 昆明湖散步',
          spots: ['昆明市博物馆', '昆明长水国际机场', '昆明湖'],
          routes_used: ['步行', '打车约30元/20分钟', '打车约20元/10分钟']
        }
      ]
    },
    {
      trip_title: '南京舒适游',
      total_days: 4,
      city: '南京',
      date: '2025.01.02-2025.01.05',
      summary: '轻松游览南京经典景点，享受舒适住宿与惬意步行时光。',
      highlights:
        '中山陵、夫子庙、南京博物院、明孝陵、玄武湖、老门东、总统府等经典景点舒适慢游。',
      total_budget: 3200,
      budget_breakdown: {
        transportation: 200,
        accommodation: 2000,
        tickets: 0,
        food: 320,
        other: 680
      },
      days: [
        {
          day: 1,
          theme: '中山陵 · 夫子庙',
          date: '2025.01.02',
          photo:
            'http://store.is.autonavi.com/showpic/46bf800a21c42453ff756fc2b77c710f',
          highlights:
            '参观中山陵与夫子庙，感受南京人文与古城氛围。',
          time_schedule:
            '09:00-11:00 游览中山陵 → 11:30-13:30 游览夫子庙',
          spots: ['中山陵', '夫子庙'],
          routes_used: ['打车前往', '步行前往']
        },
        {
          day: 2,
          theme: '南京博物院 · 明孝陵',
          date: '2025.01.03',
          photo:
            'http://store.is.autonavi.com/showpic/6d9679442d9f514b78d55213b43d9417',
          highlights:
            '参观南京博物院与明孝陵，深入了解南京与明朝历史文化。',
          time_schedule:
            '09:00-12:00 参观南京博物院 → 13:00-15:00 游览明孝陵',
          spots: ['南京博物院', '明孝陵'],
          routes_used: ['打车前往', '打车前往']
        },
        {
          day: 3,
          theme: '玄武湖 · 南京老门东',
          date: '2025.01.04',
          photo:
            'http://store.is.autonavi.com/showpic/ff2f4114639e0110ae96ae76ad0c0287',
          highlights:
            '漫步玄武湖畔与南京老门东，享受自然风光与特色街区小吃。',
          time_schedule:
            '09:00-11:00 玄武湖漫步 → 12:00-14:00 逛南京老门东',
          spots: ['玄武湖', '南京老门东'],
          routes_used: ['打车前往', '步行前往']
        },
        {
          day: 4,
          theme: '总统府 · 自由活动',
          date: '2025.01.05',
          photo:
            'http://aos-cdn-image.amap.com/sns/ugccomment/21acde57-d540-4737-974a-11b6c69d23de.jpg',
          highlights:
            '参观总统府，之后在南京自由安排时间，再次打卡心仪景点或购物。',
          time_schedule:
            '09:00-11:00 参观总统府 → 12:00 自由活动',
          spots: ['总统府', '南京'],
          routes_used: ['打车前往', '自由活动']
        }
      ]
    }
  ];

  const displayRoutes = tripPlans.length > 0 ? tripPlans : defaultRoutes;


  // 身边的宝藏景点数据
  // const treasureSpots = [
  //   {
  //     id: 1,
  //     name: 'XX市民生公园',
  //     rating: 4.5,
  //     distance: '500m',
  //     type: '公园',
  //     icon: 'fa-solid fa-tree'
  //   },
  //   {
  //     id: 2,
  //     name: '老厂房创意艺术园区',
  //     rating: 4.3,
  //     distance: '1.2km',
  //     type: '创意园',
  //     icon: 'fa-solid fa-palette'
  //   }
  // ];

  // 旅行家精选模块已移动到社区页面
  // // 加载帖子数据
  // useEffect(() => {
  //   loadPosts();
  // }, []);

  // 旅行家精选模块已移动到社区页面
  // const loadPosts = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     
  //     // 1️⃣ 获取公开帖子列表
  //     const response = await getPublicPosts();
  //     if (response.code === 200) {
  //       // 只显示审核通过的帖子
  //       const allPosts = response.data.list || [];
  //       const approvedPosts = allPosts.filter(post => post.auditStatus === 'approved');
  //       
  //       console.log('📊 帖子统计:');
  //       console.log(`  - 总帖子数: ${allPosts.length}`);
  //       console.log(`  - 审核通过: ${approvedPosts.length}`);
  //       console.log(`  - 待审核/拒绝: ${allPosts.length - approvedPosts.length}`);
  //       
  //       // 2️⃣ 获取用户的收藏列表
  //       try {
  //         const favoritesResponse = await getPostFavorites();
  //         if (favoritesResponse.code === 200) {
  //           const favoritePostIds = new Set(
  //             (favoritesResponse.data.list || []).map(fav => fav.postId)
  //           );
  //           
  //           console.log('⭐ 用户收藏的帖子:', Array.from(favoritePostIds));
  //           
  //           // 3️⃣ 更新帖子的收藏状态
  //           const postsWithFavoriteStatus = approvedPosts.map(post => ({
  //             ...post,
  //             isFavorited: favoritePostIds.has(post.id)
  //           }));
  //           
  //           setPosts(postsWithFavoriteStatus);
  //         } else {
  //           // 如果获取收藏列表失败，仍然显示帖子，但收藏状态可能不准确
  //           console.warn('⚠️ 获取收藏列表失败，收藏状态可能不准确');
  //           setPosts(approvedPosts);
  //         }
  //       } catch (favErr) {
  //         console.warn('⚠️ 获取收藏列表失败:', favErr.message);
  //         // 如果收藏API调用失败，仍然显示帖子
  //         setPosts(approvedPosts);
  //       }
  //     } else {
  //       throw new Error(response.message || '获取帖子失败');
  //     }
  //   } catch (err) {
  //     console.error('加载帖子失败:', err);
  //     setError(err.message);
  //     // 错误时显示空列表，不显示假数据
  //     setPosts([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // 旅行家精选模块已移动到社区页面
  // // 处理收藏
  // const handleFavorite = async (postId) => {
  //   const post = posts.find(p => p.id === postId);
  //   if (!post) return;

  //   // 🌟 乐观更新：先更新 UI
  //   const originalState = post.isFavorited;
  //   setPosts(posts.map(p => 
  //     p.id === postId 
  //       ? { ...p, isFavorited: !post.isFavorited }
  //       : p
  //   ));

  //   try {
  //     let response;
  //     if (originalState) {
  //       // 当前是已收藏状态，执行取消收藏
  //       response = await removePostFavorite(postId);
  //     } else {
  //       // 当前是未收藏状态，执行添加收藏
  //       response = await addPostFavorite(postId, {
  //         favoriteCategory: 'general'
  //       });
  //     }
      
  //     if (response.code === 200) {
  //       console.log('✅ 收藏操作成功');
  //     } else {
  //       // API 返回失败，回滚状态
  //       console.error('❌ 收藏操作失败:', response.message);
  //       setPosts(posts.map(p => 
  //         p.id === postId 
  //           ? { ...p, isFavorited: originalState }
  //           : p
  //       ));
  //       alert('操作失败：' + response.message);
  //     }
  //   } catch (err) {
  //     console.error('❌ 收藏失败:', err);
      
  //     // 🌟 特殊处理：如果是唯一约束冲突，说明后端已经收藏了
  //     if (err.message && err.message.includes('constraint')) {
  //       console.warn('⚠️ 检测到约束冲突，可能是状态不同步');
  //       if (!originalState) {
  //         // 前端认为未收藏，但后端已收藏，保持为已收藏状态
  //         console.log('🔄 修正状态为已收藏');
  //         // UI 已经更新为已收藏，无需回滚
  //       } else {
  //         // 回滚状态
  //         setPosts(posts.map(p => 
  //           p.id === postId 
  //             ? { ...p, isFavorited: originalState }
  //             : p
  //         ));
  //         alert('操作失败，请刷新页面重试');
  //       }
  //     } else {
  //       // 其他错误，回滚状态
  //       setPosts(posts.map(p => 
  //         p.id === postId 
  //           ? { ...p, isFavorited: originalState }
  //           : p
  //       ));
  //       alert(err.message || '操作失败，请重试');
  //     }
  //   }
  // };

  // 旅行家精选模块已移动到社区页面
  // // 处理帖子卡片点击
  // const handlePostClick = (post) => {
  //   if (onNavigateToPostDetail) {
  //     onNavigateToPostDetail(post);
  //   }
  // };


  //将小地图的景点数据传给DLookMap
  const handleViewMap=(mapData)=>{
    if(onNavigateToDLookMap){
      // 如果小地图传递了数据，使用小地图的数据；否则使用原有数据
      const spotsToPass = mapData?.spots && mapData.spots.length > 0 ? mapData.spots : treasureSpots;
      const locationToPass = mapData?.userLocation || userLocation;
      
      console.log('📍 准备跳转大地图，景点数量:', spotsToPass.length);
      
      onNavigateToDLookMap({
        treasureSpots: spotsToPass,
        userLocation: locationToPass
      })
    }
  }

  // 🎨 初始加载时显示骨架屏（宝藏景点和活动都在加载中）
  const isInitialLoading = treasureSpotsLoading && activitiesLoading;
  
  if (isInitialLoading) {
    return <DiscoverPageSkeleton />;
  }

  return (
    <>
     {/* <AiFloatingButton onNavigateToAi={onNavigateToAi} /> */}
      <div
        className="flex flex-col min-h-screen"
        style={{
          backgroundImage: 'url("/首页古风背景3.jpg")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm  border rounded-b-3xl">
          {/* <div className="flex items-center px-4 py-3">
            <button onClick={onBack} className="mr-3">
              <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">发现之旅</h1>
          </div> */}
            
          {/* Search Bar */}
          <div className="px-2 pb-1 mt-5">
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full px-10 py-4 pl-11 pr-20 text-sm focus:outline-none"
                 style={{ backgroundImage: 'url("/输入框.png")', backgroundSize: '105% 125%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                placeholder="搜索景点、美食、酒店..."
              />
              {/* <i className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 fa-solid fa-search"></i> */}
              {/* {searchText && (
                <button
                  onClick={() => searchPOI(searchText)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                >
                  搜索
                </button>
              )} */}
              
              {/* 搜索建议下拉框（已注释） */}
              {/* {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id || index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start">
                        <i className="fa-solid fa-location-dot text-blue-500 mr-3 mt-1"></i>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{suggestion.name}</div>
                          {suggestion.address && (
                            <div className="text-xs text-gray-500 mt-1">{suggestion.district} {suggestion.address}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 pb-20 mt-10">
          {/* Hot Topics */}
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-row items-center">
                  <h2 className="text-xl py-5 font-bold text-GuText w-auto h-auto" style={{ fontFamily: '宋体, SimSun, serif', backgroundImage: 'url("/红色国风小图标.png")', backgroundSize: '110%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <span className="z-10 px-2">热门主题</span>
                  </h2>
          {/* <img src="/古风小图标2.png" className='absolute right-[-3%] mt-[-10%] mb-[-15%] w-[40%] h-[20%]'/> */}
        </div>
              <button
                onClick={handleMoreClick}
                className="text-sm text-GuText flex items-center hover:text-GuText transition-colors"
              >
                {showAllTopics ? (
                  <>
                    收起 <i className="ml-1 fa-solid fa-angle-up"></i>
                  </>
                ) : (
                  <>
                    更多 <i className="ml-1 fa-solid fa-angle-down"></i>
                  </>
                )}
              </button>
            </div>

            {/* 主题网格 - 使用 grid 布局，每行4个 */}
            <div className="grid grid-cols-4 gap-4">
              {displayedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleTopicClick(topic.name)}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${topic.color} shadow-sm`}>
                    {topic.image ? (
                      <img
                        src={topic.image}
                        alt={topic.name}
                        className={`${topic.id === 2 || topic.id === 4 ? 'w-[120px] h-[120px]' : 'w-[120px] h-[120px]'} object-contain rounded-full`}
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-700">
                        {topic.name?.charAt(0) || ''}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-700 text-center font-medium">{topic.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Routes */}
          <div className="px-4 mb-6 mt-4">
            <div className='flex flex-row justify-between w-full'>
                      <div className="flex flex-row items-center mb-3">
          <h2 className="text-xl py-5 font-bold text-GuText w-auto h-auto" style={{ fontFamily: '宋体, SimSun, serif', backgroundImage: 'url("/绿色国风小图标.png")', backgroundSize: '110%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
           <span className="z-10 px-2"> {currentCity ? `${currentCity}-热门路线` : '本周热门路线'}</span>
          </h2>
          {/* <img src="/古风小图标2.png" className='absolute right-[-3%] mt-[-10%] mb-[-15%] w-[40%] h-[20%]'/> */}
        </div>
            {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">
              {currentCity ? `${currentCity}-热门路线` : '本周热门路线'}
            </h2> */}
            <div className='text-right text-sm text-GuText mb-3 cursor-pointer mt-6' onClick={() => onNavigateToSelectCity && onNavigateToSelectCity()}>
              查看更多城市 {'>'}
            </div>
            </div>

            {/* 流式加载显示 - 使用接近路线卡片样式的骨架屏 */}
            {isLoading && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="pb-3 border-b last:border-b-0 border-gray-100"
                    >
                      <Skeleton
                        avatar
                        title
                        row={3}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && (
              <div className="space-y-4">
                {displayRoutes.map((route, index) => {
                  // 🔍 获取图片URL - 支持多种可能的字段名
                  const getRouteImage = () => {
                    if (route.days && route.days.length > 0) {
                      // 优先使用第一天的 photo 字段
                      if (route.days[0].photo) return route.days[0].photo;
                      // 尝试 image 字段
                      if (route.days[0].image) return route.days[0].image;
                      // 尝试 cover 字段
                      if (route.days[0].cover) return route.days[0].cover;
                      // 尝试 spots 中的第一个景点图片
                      if (route.days[0].spots && route.days[0].spots.length > 0) {
                        const firstSpot = route.days[0].spots[0];
                        if (typeof firstSpot === 'object' && firstSpot.photo) {
                          return firstSpot.photo;
                        }
                      }
                    }
                    // 尝试路线级别的图片字段
                    if (route.cover_image) return route.cover_image;
                    if (route.image) return route.image;
                    if (route.photo) return route.photo;
                    return null;
                  };

                  const routeImage = getRouteImage();
                  
                  return (
                    <div 
                      key={index} 
                      className="bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        console.log('🔍 点击查看详情，路线数据:', route);
                        onNavigateToTripDetail && onNavigateToTripDetail(route);
                      }}
                    >
                      {/* 邮票样式图片 - 有图片时显示 */}
                      {routeImage && (
                        <div className="stamp-frame flex justify-center">
                          <div className="stamp-wrapper">
                            <div className="stamp-inner">
                              <img
                                src={routeImage}
                                alt={route.trip_title || route.title || '路线封面图'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.warn('图片加载失败:', routeImage);
                                  // 图片加载失败时隐藏整个邮票框架
                                  e.target.closest('.stamp-frame').style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('✅ 图片加载成功:', routeImage);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 无图片时的占位符 */}
                      {!routeImage && (
                        <div className="stamp-frame flex justify-center">
                          <div className="stamp-wrapper">
                            <div className="stamp-inner bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <div className="text-center text-white">
                                <i className="fa-solid fa-route text-4xl mb-2 opacity-80"></i>
                                <p className="text-sm opacity-80">精彩路线</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-2 leading-relaxed">
                            {route.trip_title || route.title || '未命名路线'}
                          </h3>
                          {/* <span className={`px-2 py-1 text-xs text-white rounded ${
                            index === 0 ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                            {route.total_days || route.days?.length || '?'}天
                          </span> */}
                        </div>
                        
                        <div className="flex items-center text-base text-gray-500 mb-4 leading-relaxed">
                          <i className="fa-solid fa-location-dot mr-2 text-GuText"></i>
                          <span className="mr-4">
                            {route.days && route.days.length > 0 
                              ? `${route.days.reduce((sum, day) => sum + (day.spots?.length || 0), 0)} 景点` 
                              : '多个景点'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {route.total_days || route.days?.length || '?'}日游
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-base text-gray-600 line-clamp-3 leading-loose" style={{ textIndent: '2em' }}>
                            {route.highlights || route.summary || '精彩的旅游路线'}
                          </p>
                        </div>

                        {/* <div className="flex items-center justify-end">
                          <button 
                            onClick={() => {
                              console.log('🔍 点击查看详情，路线数据:', route);
                              onNavigateToTripDetail && onNavigateToTripDetail(route);
                            }}
                            className="px-4 py-2 bg-GuText text-white text-sm rounded-full hover:bg-GuText transition-colors"
                          >
                            查看详情
                          </button>
                        </div> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          {/* 🔍 调试信息 - 如果有流式文本但没有成功解析，显示原始数据 */}
          {!isLoading && streamingText && tripPlans.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                ⚠️ 接收到数据但无法解析，请查看控制台获取详细信息
              </p>
              <p className="text-xs text-yellow-700 mb-2">原始数据预览：</p>
              <pre className="text-xs text-gray-700 bg-white p-2 rounded overflow-x-auto max-h-40 border border-yellow-300">
                {streamingText.substring(0, 500)}
                {streamingText.length > 500 && '...'}
              </pre>
            </div>
          )}
        </div>

        {/* 精彩活动 */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3 mt-5">
              <div className="flex flex-row items-center">
                  <h2 className="text-xl py-5 font-bold text-GuText w-auto h-auto" style={{ fontFamily: '宋体, SimSun, serif', backgroundImage: 'url("/红色国风小图标.png")', backgroundSize: '110%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <span className="z-10 px-2">精彩活动</span>
                  </h2>
          {/* <img src="/古风小图标2.png" className='absolute right-[-3%] mt-[-10%] mb-[-15%] w-[40%] h-[20%]'/> */}
        </div>
            {onNavigateToActivityPage && (
              <button
                className="text-sm text-GuText hover:text-GuText"
                onClick={() => onNavigateToActivityPage && onNavigateToActivityPage()}
              >
                查看更多 &gt;
              </button>
            )}
          </div>

          {/* 加载状态 - 使用接近活动卡片样式的骨架屏 */}
          {activitiesLoading && (
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="pb-3 border-b last:border-b-0 border-gray-100">
                    <Skeleton
                      avatar
                      title
                      row={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {activitiesError && !activitiesLoading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
              <div className="flex items-center text-sm text-yellow-800">
                <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                <span>加载失败: {activitiesError}</span>
              </div>
            </div>
          )}

          {/* 活动堆叠卡片 - 3D效果 */}
          {!activitiesLoading && !activitiesError && (
            <div className='flex'>
              <img src="/精彩活动3.png" className='w-15 h-10 absolute right-4 pointer-events-none'/>
            <ActivityStackCards 
              activities={activities}
              onActivityClick={handleActivityClick}
            />
            <img className='absolute left-5 mt-[250px] w-10 h-18 pointer-events-none' src="/精彩活动2.png"/>
            <img className='absolute right-5 mt-[250px] w-15 h-10 transform rotate-6 pointer-events-none' src="/精彩活动1.png"/>
            </div>
          )}
          {/* 底部图标 - 卡片外部 */}
            {/* <div className="mt-4">
              <img 
                src="/一起去旅行.png" 
                alt="活动标识"
                className="w-[30%] h-20 object-contain drop-shadow-lg"
              />
            </div> */}
        </div>

        {/* Treasure Spots - 小地图 */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-row items-center">
                  <h2 className="text-xl py-5 font-bold text-GuText w-auto h-auto" style={{ fontFamily: '宋体, SimSun, serif', backgroundImage: 'url("/绿色国风小图标.png")', backgroundSize: '110%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                  <span className="z-10 px-2">身边宝藏景点</span>
                  </h2>
          {/* <img src="/古风小图标2.png" className='absolute right-[-3%] mt-[-10%] mb-[-15%] w-[40%] h-[20%]'/> */}
        </div>
          </div>
          
          {/* 小地图组件 */}
          <div className="w-[90%] h-[200px] ml-[5%] border rounded-2xl">
            <TreasureMapWidget 
              onMapClick={handleViewMap}
              onSpotClick={(spot) => {
                console.log('点击景点:', spot);
                // 可以在这里添加景点详情弹窗
              }}
            />
          </div>

             {/* 空状态 - 带刷新按钮 */}
             {/* {!treasureSpotsLoading && !locationError && treasureSpots.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <i className="fa-solid fa-map-location-dot text-3xl text-gray-300 mb-3"></i>
              <p className="text-sm text-gray-500 mb-4">附近暂无景点数据</p>
              <button
                onClick={handleRefreshTreasure}
                className="px-5 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors inline-flex items-center"
              >
                <i className="fa-solid fa-rotate-right mr-2"></i>
                重新获取
              </button>
            </div>
          )} */}
        </div>

        {/* 旅行家精选模块已移动到社区页面 */}
        {/* {/* Traveller Picks */}
        {/*   <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">旅行家精选</h2>
              {loading && (
                <div className="flex items-center text-sm text-gray-500">
                  <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                  <span>加载中...</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <div className="flex items-center text-sm text-yellow-800">
                  <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                  <span>加载失败，显示默认内容</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  {/* 封面图片 */}
        {/*         <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-white">
                        <i className="fa-solid fa-image text-2xl mb-1"></i>
                        <div className="text-xs opacity-80">
                          {post.postType === 'travel_note' ? '游记' :
                           post.postType === 'strategy' ? '攻略' :
                           post.postType === 'photo_share' ? '照片' :
                           post.postType === 'video_share' ? '视频' : '帖子'}
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                        {post.postType === 'travel_note' ? '游记' :
                         post.postType === 'strategy' ? '攻略' :
                         post.postType === 'photo_share' ? '照片分享' :
                         post.postType === 'video_share' ? '视频分享' :
                         post.postType === 'qa' ? '问答' : '帖子'}
                      </span>
                    </div>
                  </div>
                  
                  {/* 内容区域 */}
        {/*         <div className="p-4">
                    <h3 className="text-base font-medium text-gray-800 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {post.summary && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.summary}
                      </p>
                    )}
                    
                    {/* 作者和互动数据 */}
        {/*           <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-blue-600 text-xs font-medium">
                            {post.publisherNickname ? post.publisherNickname.charAt(0) : 'U'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          @{post.publisherNickname || '匿名用户'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <i className="fa-solid fa-eye mr-1"></i>
                          <span>{post.viewCount || 0}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <i className="fa-solid fa-comment mr-1"></i>
                          <span>{post.commentCount || 0}</span>
                        </div>
                        
                        {/* 收藏按钮 */}
        {/*               <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavorite(post.id);
                          }}
                          className={`flex items-center text-xs transition-colors ${
                            post.isFavorited 
                              ? 'text-yellow-500' 
                              : 'text-gray-500 hover:text-yellow-500'
                          }`}
                          title={post.isFavorited ? '取消收藏' : '收藏'}
                        >
                          <i className={`fa-solid fa-star mr-1 ${post.isFavorited ? 'text-yellow-500' : ''}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 空状态 */}
        {/*     {!loading && posts.length === 0 && (
              <div className="text-center py-8">
                <i className="fa-solid fa-file-pen text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 mb-2">暂无帖子内容</p>
                <p className="text-sm text-gray-400">快来发布第一篇旅行分享吧！</p>
              </div>
            )}
          </div> */}
        </div>

        {/* AI入口弹窗 */}
        <AiEntryModal
          visible={showAiModal}
          onClose={() => setShowAiModal(false)}
          onGeneratePlan={() => {
            setShowAiModal(false);
            if (onNavigateToAi) {
              onNavigateToAi('create');
            }
          }}
          onChat={() => {
            setShowAiModal(false);
            if (onNavigateToAi) {
              onNavigateToAi('chat');
            }
          }}
        />
        {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-gray-200 shadow-lg z-50 safe-area-bottom rounded-t-3xl"
        style={{
          backgroundImage: 'url("/导航背景.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
      <div className="flex items-center justify-around h-16 relative">
        <button
          className="flex flex-col items-center justify-center flex-1 transition-all text-gray-400 hover:text-gray-600"
          onClick={() => {
            // 当前页面，滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onBack&&onBack()
          }}
        >
          <img className="w-10 h-10" src="/首页3.png"/>
          <span className="text-xs font-blod mb-1">首页</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"style={{color:"#724B10"}}
          onClick={() => {
            console.log('🔍 导航到发现页面');
         
          }}
        >
          <img className="w-10 h-10" src="/发现3.png"/>
          <span className="text-xs">发现</span>
        </button>
        
        {/* 中间凸出的AI按钮 */}
        <button
          className="flex flex-col items-center justify-center flex-1 -mt-8 transition-all active:scale-95"
          onClick={() => {
            console.log('🤖 打开AI入口弹窗');
            setShowAiModal(true);
          }}
        >
          {/* 白色外圆（最大） */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center hover:shadow-2xl transition-all"
            style={{
              backgroundImage: 'url("/导航背景.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all">
              <img src="/ai创建3.png" alt="AI创建" className="w-full h-full object-contain" />
            </div>
          </div>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
          onClick={() => {
            console.log('💬 导航到消息页面');
             onNavigateToCommunity&& onNavigateToCommunity();
          }}
        >
         <img className="w-10 h-10" src="/消息3.png"/>
          <span className="text-xs mb-1">消息</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
          onClick={() => {
            console.log('👤 导航到我的页面');
            onNavigateToMine && onNavigateToMine();
          }}
        >
          <img className="w-9 h-10" src="/我的页面3.png"/>
          <span className="text-xs mb-1">我的</span>
        </button>
      </div>
      
      </div>
      </div>
      {/* 活动详情页面 */}
      {showActivityDetail && selectedActivity && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <ActivityDetailPage
            activityId={selectedActivity.id}
            onBack={() => {
              setShowActivityDetail(false);
              setSelectedActivity(null);
            }}
          />
        </div>
      )}

      {/* 搜索结果模态框 */}
      {showSearchResults && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* 顶部导航 */}
          <div className="sticky top-0 bg-white shadow-sm z-10">
            <div className="flex items-center px-4 py-3">
              <button onClick={closeSearchResults} className="mr-3">
                <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
              </button>
              <h1 className="text-lg font-bold text-gray-800">
                搜索结果 {searchResults.length > 0 && `(${searchResults.length})`}
              </h1>
            </div>
          </div>

          {/* 搜索结果内容 */}
          <div className="px-4 py-4">
            {searchLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="pb-3 border-b last:border-b-0 border-gray-100"
                    >
                      <Skeleton
                        avatar
                        title
                        row={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <i className="fa-solid fa-search text-gray-300 text-5xl mb-4"></i>
                <p className="text-gray-500">未找到相关结果</p>
                <p className="text-gray-400 text-sm mt-2">试试其他关键词吧</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((poi, index) => (
                  <div
                    key={poi.id || index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* POI图片 */}
                    {poi.photos && poi.photos.length > 0 && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={poi.photos[0].url}
                          alt={poi.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* POI信息 */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800 flex-1">{poi.name}</h3>
                        {poi.rating && (
                          <div className="flex items-center ml-2">
                            <i className="fa-solid fa-star text-yellow-400 text-sm mr-1"></i>
                            <span className="text-sm font-medium text-gray-700">{poi.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 类型标签 */}
                      {poi.type && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                            {poi.type.split(';')[0]}
                          </span>
                        </div>
                      )}
                      
                      {/* 地址 */}
                      <div className="flex items-start text-sm text-gray-600 mb-2">
                        <i className="fa-solid fa-location-dot text-gray-400 mr-2 mt-0.5"></i>
                        <span className="flex-1">{poi.district}</span>
                      </div>
                      
                      {poi.address && (
                        <div className="text-xs text-gray-500 ml-6 mb-2">
                          {poi.address}
                        </div>
                      )}
                      
                      {/* 电话 */}
                      {poi.tel && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <i className="fa-solid fa-phone text-gray-400 mr-2"></i>
                          <a href={`tel:${poi.tel}`} className="text-blue-500 hover:underline">
                            {poi.tel}
                          </a>
                        </div>
                      )}
                      
                      {/* 人均消费 */}
                      {poi.cost && (
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fa-solid fa-yen-sign text-gray-400 mr-2"></i>
                          <span>人均 ¥{poi.cost}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

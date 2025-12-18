import React, { useState, useEffect, useRef } from 'react';
import AiFloatingButton from './AiFloatingButton';
import aiConfig, { getApiUrl, getHeaders, buildRequestBody } from '../config/aiConfig';
import amapConfig from '../config/amapConfig';
import { MapContainer } from 'react-leaflet';
import { saveRouteSearch } from '../api/config';            
import { API_CONFIG, getCurrentUserId } from '../api/config';                                                                                                                                                                                                                                                               
import { preconnect } from 'react-dom';


// export default function GoHomePage({ onPlanRoute, onNavigateToAMap, onLogout, onNavigateToDiscover ,onNavigateToMine,onNavigateToMap,onNavigateToAi,onLocationUpdate,onNavigateToCommunity,onNavigateToMytTravalPlan
// }) {

export default function GoHomePage({ onPlanRoute, onNavigateToAMap, onLogout, onNavigateToDiscover ,onNavigateToMine,onNavigateToMap,onNavigateToAi,onLocationUpdate,onNavigateToCommunity, chatUnreadCount = 0 ,onNavigateToMytTravalPlan}) {



  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [activeMode, setActiveMode] = useState('自驾');
  const [showRoutes, setShowRoutes] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('请输入出发地和目的地');
  const [selectedRoute, setSelectedRoute] = useState(null); // 'fastest' 或 'cheapest'
  const [loading, setLoading] = useState(false);
  const [aiRoutes, setAiRoutes] = useState(null); // AI返回的路线数据
  const [coordinates, setCoordinates] = useState(null); // AI返回的经纬度坐标
  const [locationStatus,setLocationStatus]=useState('');//定位状态
  const [locationResult,setLocationResult]=useState('');//定位结果信息
  const [geolocationLoading,setGeolocationLoading]=useState(false);//定位加载状态
  //const [isDialogMode,setIsDialogMode]=useState(false);//对话框模式
  const [currentLocation,setCurrentLocation]=useState(null);
  const [dialogInput, setDialogInput] = useState(''); // 对话框输入内容
  const [isDialogFocused, setIsDialogFocused] = useState(false); // 对话框焦点状态
  const [isAiMode,setIsAiMode]=useState(true);//默认是ai
  //const [PopPlan,setPopPlan]=useState(flase);//下拉显示旅行计划
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  const [activePlan,setActivePlan]=useState(null);
  const [planLoading,setPlanLoading]=useState(false);
  const [planError,setPalnError]=useState(null);
  const [reminderPlans, setReminderPlans] = useState([]);
  const [currentReminderPlan, setCurrentReminderPlan] = useState(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [updatingPlanStatus, setUpdatingPlanStatus] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const travelModes = ['公共交通', '步行', '骑行', '驾车'];
  const getRoutesByMode=(mode)=>{
    const routeDate={
      '公共交通':{
        fastest:{
          time:'时间：35分钟',
          description:'路线：地铁2号线→地铁10号线',
          cost:'费用：￥5.00'
        },
        cheapest:{
          time:'时间：52分钟',
          description:'路线：地铁2号线->公交10号->步行2公里',
          cost:'费用：￥3.00'
        }
      },
      '步行':{
        fastest:{
          time:'时间：1小时20分钟',
          description:'路径：途经长安街，全程5.3公里',
          cost:'费用：免费'
        },
        cheapest:{
          time:'时间：1小时50分钟',
          description:'路径：途经长安2街，全程5.5公里',
          cost:'费用：免费'
        }
      },
      '骑行':{
        fastest:{
          time:'时间：35分钟',
          description:'路径：共享单车推荐路线，全程5.3公里',
          cost:'费用：￥2.00'
        },
        cheapest:{
          time:'时间：40分钟',
          description:'路径：避开主干道，4.8公里',
          cost:'费用：￥2.00'
        }
      },
      '驾车':{
        fastest:{
          time:'时间：20分钟',
          description:'路径：经过3个红绿灯',
          cost:'费用：停车费约￥10.00'
        },
        cheapest:{
          time:'时间：30分钟',
          description:'路径：避开收费路段,经过4个红绿灯',
          cost:'费用：停车费约:￥8.00'
        }
      },
    };
    return routeDate[mode]||routeDate['驾车'];
    
  }
  const cardBgClasses = [
  'bg-lightPink',
  'bg-lightBlue',
  'bg-lightGreen',
  'bg-lightYellow',
  'bg-lightPurple',
  'bg-lightOrange',
  'bg-lightMint',
  'bg-lightLavender',
];
const fetchActivePlan = async (withReminder = false) => {
  try {
    setPlanLoading(true);
    setPalnError(null);
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const endpoint = API_CONFIG.ENDPOINTS.GET_USER_TRAVEL_PLAN_REMINDERS.replace('{userId}', userId);

    const resp = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      }
    });

    if (!resp.ok) {
      throw new Error(`HTTP${resp.status}`);
    }

    const json = await resp.json();

    if (json.code === 200 && json.data && Array.isArray(json.data.travelPlans)) {
      const plans = json.data.travelPlans;
      setReminderPlans(plans);

      const active = plans.find((p) => p.status === 'active');
      setActivePlan(active || null);

      if (withReminder) {
        const firstPending = plans.find(
          (p) => p.status !== 'completed' && p.status !== 'active'
        );
        setCurrentReminderPlan(firstPending || null);
        setShowReminderDialog(!!firstPending);
      }
    } else {
      setActivePlan(null);
      setReminderPlans([]);
      if (withReminder) {
        setCurrentReminderPlan(null);
        setShowReminderDialog(false);
      }
    }
  } catch (e) {
    console.error('获取旅行计划提醒失败：', e);
    setPalnError('获取旅行计划提醒失败');
    setActivePlan(null);
    setReminderPlans([]);
    if (withReminder) {
      setCurrentReminderPlan(null);
      setShowReminderDialog(false);
    }
  } finally {
    setPlanLoading(false);
  }
};

const handleTogglePlanPopup = async () => {
  if (!showPlanPopup) {
    if (!activePlan) {
      await fetchActivePlan(false);
    }
  }
  setShowPlanPopup((prev) => !prev);
};

const updateCurrentPlanStatus = async (newStatus) => {
  if (!currentReminderPlan || updatingPlanStatus) {
    return;
  }

  const plan = currentReminderPlan;

  try {
    setUpdatingPlanStatus(true);
    const baseEndpoint = API_CONFIG.ENDPOINTS.UPDATE_TRAVEL_PLAN_STATUS.replace('{id}', plan.id);
    const endpoint = `${baseEndpoint}?status=${encodeURIComponent(newStatus)}`;

    const resp = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
    });

    if (!resp.ok) {
      throw new Error(`HTTP${resp.status}`);
    }

    const json = await resp.json();
    const nextStatus =
      (json &&
        json.data &&
        (json.data.newStatus || json.data.status)) ||
      newStatus;

    if (nextStatus === 'active') {
      setActivePlan({ ...plan, status: nextStatus });
      setShowPlanPopup(true);
    }

    setReminderPlans((prev) => {
      const updated = prev.map((p) =>
        p.id === plan.id ? { ...p, status: nextStatus, __handled: true } : p
      );
      const nextPending = updated.find(
        (p) => !p.__handled && p.status !== 'completed' && p.status !== 'active'
      );
      setCurrentReminderPlan(nextPending || null);
      if (!nextPending) {
        setShowReminderDialog(false);
      }
      return updated;
    });
  } catch (e) {
    console.error('更新旅行计划状态失败：', e);
    setPalnError('更新旅行计划状态失败');
  } finally {
    setUpdatingPlanStatus(false);
  }
};

const handleReminderConfirm = () => {
  updateCurrentPlanStatus('active');
};

const handleReminderSkip = () => {
  updateCurrentPlanStatus('draft');
};

  useEffect(() => {
    fetchActivePlan(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 初始化高德地图和定位功能
  useEffect(() => {
    const initMap = async () => {
      try {
        // 动态加载高德地图API
        if (!window.AMap) {
          const script = document.createElement('script');
          script.src = amapConfig.getApiUrl(['AMap.Geolocation']);
          script.onload = () => createMapWithGeolocation();
          script.onerror = () => {
            console.error('❌ 高德地图API加载失败，请检查API Key是否正确');
            setLocationStatus('地图API加载失败');
            setLocationResult('请检查API Key配置是否正确（src/config/amapConfig.js）');
          };
          document.head.appendChild(script);
        } else {
          createMapWithGeolocation();
        }
      } catch (error) {
        console.error('地图加载失败:', error);
      }
    };

    const createMapWithGeolocation = () => {
      if (mapRef.current) {
        console.log('地图已存在，跳过初始化');
        return;
      }
      
      if (mapContainerRef.current && window.AMap) {
        try {
          // 清除可能存在的旧地图容器内容
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '';
          }
          
          // 创建高德地图实例 - 使用v1.4.15兼容配置
          const map = new window.AMap.Map(mapContainerRef.current, {
            zoom: 15,
            resizeEnable: true,
            dragEnable: true,
            zoomEnable: true,
            doubleClickZoom: false,      // 禁用双击缩放
            keyboardEnable: false,       // 禁用键盘操作
            jogEnable: false,            // 禁用地图惯性移动
            scrollWheel: true,           // 启用滚轮缩放
            touchZoom: true,             // 启用触摸缩放
            animateEnable: false         // 禁用动画
          });
          window._AMapSecurityConfig = {
            securityJsCode: amapConfig.securityKey,
          };
          console.log('初始化securityKey');

          console.log('🚀 开始初始化高德地图...', {
            version: '1.4.15',
            container: mapContainerRef.current,
            containerSize: {
              width: mapContainerRef.current?.offsetWidth,
              height: mapContainerRef.current?.offsetHeight
            }
          });
          
          setLocationStatus('正在初始化地图...');
          
          // 设置地图加载超时检测
          const mapLoadTimeout = setTimeout(() => {
            if (!mapRef.current) {
              console.warn('⚠️ 地图加载超时');
              setLocationStatus('地图加载超时');
              setLocationResult('地图加载时间过长，请检查网络连接或刷新页面重试');
              setMapLoaded(false);
            }
          }, 15000); // 15秒超时
          
          // 监听地图加载完成事件
          map.on('complete', function() {
            clearTimeout(mapLoadTimeout); // 清除超时检测
            console.log('✅ 地图加载完成');
            mapRef.current = map;
            setMapLoaded(true);
            setLocationStatus('地图加载成功，正在定位...');
            
            // 地图加载完成后再加载定位插件
            window.AMap.plugin('AMap.Geolocation', function() {
              try {
                const geolocation = new window.AMap.Geolocation({
                  enableHighAccuracy: true, // 是否使用高精度定位
                  timeout: 10000,          // 超过10秒后停止定位
                  position: 'RB',          // 定位按钮的停靠位置
                  offset: [10, 20],        // 定位按钮与设置的停靠位置的偏移量
                  zoomToAccuracy: true,    // 定位成功后是否自动调整地图视野到定位点
                });
                
                map.addControl(geolocation);
                
                // 自动开始定位
                setGeolocationLoading(true);
                
                geolocation.getCurrentPosition(function(status, result) {
                  setGeolocationLoading(false);
                  if (status === 'complete') {
                    onLocationComplete(result);
                  } else {
                    onLocationError(result);
                  }
                });
              } catch (geoError) {
                console.error('定位插件加载失败:', geoError);
                setGeolocationLoading(false);
                setLocationStatus('定位功能不可用');
                setLocationResult(`定位插件错误: ${geoError.message}`);
              }
            });
          });
          
          // 监听地图错误事件
          map.on('error', function(error) {
            clearTimeout(mapLoadTimeout); // 清除超时检测
            console.error('地图错误:', error);
            setLocationStatus('地图加载失败');
            setLocationResult(`地图错误: ${error.message || '未知错误'}`);
            setMapLoaded(false);
          });
        } catch (error) {
          console.error('地图创建失败:', error);
          setLocationStatus('地图加载失败');
          setLocationResult(`错误信息: ${error.message}`);
          
          // 如果是WebGL相关错误，提供更具体的提示
          if (error.message.includes('WebGL') || error.message.includes('Render')) {
            setLocationResult('您的浏览器可能不支持WebGL，请尝试更新浏览器或使用其他浏览器');
          }
        }
      }
    };

    // 定位成功回调
    const onLocationComplete = (data) => {
      setLocationStatus('定位成功');
      const str = [];
      str.push(`定位结果：${data.position}`);
      str.push(`定位类别：${data.location_type}`);
      if (data.accuracy) {
        str.push(`精度：${data.accuracy} 米`);
      }
      str.push(`是否经过偏移：${data.isConverted ? '是' : '否'}`);
      setLocationResult(str.join(' | '));
      console.log('定位成功:', data);

      //保存用户当前位置
      const locationData={
        lng:data.position.lng,
        lat:data.position.lat,
        address:data.formattedAddress||'',
        accuracy:data.accuracy
      }
      setCurrentLocation(locationData);
      if(onLocationUpdate){
        onLocationUpdate(locationData);
      }
    };

    // 定位失败回调
    const onLocationError = (data) => {
      setLocationStatus('定位失败');
      setLocationResult(`失败原因：${data.message} | 浏览器返回：${data.originMessage}`);
      console.error('定位失败:', data);
      

    };

    initMap();

    return () => {
      if (mapRef.current) {
        try {
          // 清理地图实例
          mapRef.current.destroy();
        } catch (error) {
          console.warn('地图销毁时出现错误:', error);
        } finally {
          mapRef.current = null;
          setMapLoaded(false);
        }
      }
    };
  }, []);


  //当用户切换出行方式时重新获取路线（但不在首次渲染时执行）
  const isFirstRender = useRef(true);
  
  useEffect(()=>{
    // 跳过首次渲染
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if(showRoutes && from && to){
      console.log('出行方式切换为',activeMode);
      // 当切换出行方式时，重新调用AI获取新的路线
      fetchAIRoutes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[activeMode]);

  // 调用AI接口获取路线规划
  const fetchAIRoutes = async () => {
    // 如果AI未启用，直接使用默认数据
    if (!aiConfig.enabled) {
      console.log('AI功能未启用，使用默认路线数据');
      setAiRoutes(getRoutesByMode(activeMode));
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const headers = getHeaders();
      const requestBody = buildRequestBody(from, to, activeMode);
      
      console.log('正在调用AI接口...', { from, to, activeMode });
      console.log('API URL:', apiUrl);
      console.log('请求参数:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI接口错误响应:', errorData);
        throw new Error(`AI接口调用失败: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('AI返回数据:', data);
      console.log('data.data内容:', data.data);
      
      // 解析AI返回的数据
      // Dify blocking模式返回格式：{ task_id, workflow_run_id, data: { outputs: { text } } }
      let aiResponse = '';
      
      // 尝试多种可能的路径
      if (data.data?.outputs) {
        console.log('data.data.outputs:', data.data.outputs);
        aiResponse = data.data.outputs.text || 
                     data.data.outputs.result || 
                     data.data.outputs.output ||
                     JSON.stringify(data.data.outputs);
      } else if (data.outputs) {
        aiResponse = data.outputs.text || data.outputs.result || JSON.stringify(data.outputs);
      } else if (data.data) {
        aiResponse = JSON.stringify(data.data);
      }
      
      console.log('AI原始响应:', aiResponse);
      console.log('响应类型:', typeof aiResponse);
      
      // 尝试解析JSON格式的响应
      try {
        let cleanResponse=aiResponse;
        if(typeof aiResponse==='string'){
          cleanResponse=aiResponse
          .replace(/^```json\s*/i,'')
          .replace(/^```\s*/i,'')
          .replace(/\s*```$/i,'')
          .trim();
          console.log('清理后的响应',cleanResponse);
        }
        const parsedData = typeof cleanResponse === 'string' ? JSON.parse(cleanResponse) : cleanResponse;
        console.log('解析后的数据:', parsedData);
        
        // 检查解析后的数据格式是否符合要求
        if (parsedData && parsedData.fastest && parsedData.cheapest) {
          setAiRoutes(parsedData);
          
          // 提取经纬度坐标（如果有）
          if (parsedData.coordinates) {
            // 转换AI返回的坐标格式为MapPage期望的格式
            const convertedCoordinates = {
              start: {
                lng: parsedData.coordinates.origin.lngLat[0],
                lat: parsedData.coordinates.origin.lngLat[1],
                address: parsedData.coordinates.origin.address,
                city: parsedData.coordinates.origin.city
              },
              end: {
                lng: parsedData.coordinates.destination.lngLat[0],
                lat: parsedData.coordinates.destination.lngLat[1],
                address: parsedData.coordinates.destination.address,
                city: parsedData.coordinates.destination.city
              }
            };
            
            setCoordinates(convertedCoordinates);
            console.log('✅ AI路线数据和坐标设置成功', convertedCoordinates);
            console.log('🔍 坐标详情 - start:', convertedCoordinates.start);
            console.log('🔍 坐标详情 - end:', convertedCoordinates.end);
          } else {
            console.warn('⚠️ AI未返回坐标信息，将使用地址名称进行地理编码');
            setCoordinates(null);
          }
          console.log('✅ AI路线数据设置成功');
        } else {
          console.warn('⚠️ AI返回的数据格式不符合预期，使用默认数据');
          console.log('期望格式: { fastest: {...}, cheapest: {...}, coordinates: {...} }');
          console.log('实际数据:', parsedData);
          setAiRoutes(getRoutesByMode(activeMode));
          setCoordinates(null);
        }
      } catch (e) {
        console.error('❌ JSON解析失败:', e);
        console.log('尝试解析的字符串:', aiResponse);
        // 暂时使用默认数据作为后备
        setAiRoutes(getRoutesByMode(activeMode));
      }
      
    } catch (error) {
      console.error('调用AI接口出错:', error);
      // 出错时使用默认数据
      setAiRoutes(getRoutesByMode(activeMode));
      
      // 根据错误类型显示不同提示
      if (error.message.includes('404')) {
        setToastMessage('工作流未配置，使用默认路线数据');
      } else if (error.message.includes('401')) {
        setToastMessage('API密钥错误，使用默认路线数据');
      } else {
        setToastMessage('AI服务暂时不可用，使用默认路线数据');
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // 检查是否输入了出发地和目的地
    if (!from.trim() || !to.trim()) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    
    // 输入完整，调用AI获取路线数据然后直接跳转
    setLoading(true);
    try {
      await fetchAIRoutes(); // 调用AI接口获取数据
      
      // 获取数据后直接跳转到MapPage，传递所有必要的数据
      const routeData = {
        from: from,
        to: to,
        coordinates: coordinates,
        aiRoutes: aiRoutes || getRoutesByMode(activeMode)
      };
      
      console.log('跳转到MapPage，传递数据:', routeData);
      onPlanRoute?.(routeData);
    } catch (error) {
      console.error('获取路线数据失败:', error);
      setToastMessage('获取路线数据失败，请重试');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // 处理AI对话框提交
  const handleAiDialogSubmit = () => {
    if (!dialogInput.trim()) return;
    
    // 跳转到AI页面，并传递用户输入的内容
    console.log('跳转到AI页面，用户输入:', dialogInput);
    
    // 将用户输入保存到localStorage，供AiPage_N8N使用
    localStorage.setItem('aiDialogInput', dialogInput);
    
    // 调用父组件传递的导航函数跳转到AI页面
    if (onNavigateToAi) {
      onNavigateToAi(dialogInput);
    }
    
    // 清空输入框
    setDialogInput('');
    setIsDialogFocused(false);
  };

  // 手动定位函数
  const handleManualLocation = () => {
    if (mapRef.current && window.AMap) {
      window.AMap.plugin('AMap.Geolocation', function() {
        const geolocation = new window.AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          zoomToAccuracy: true,
        });
        
        setGeolocationLoading(true);
        setLocationStatus('正在重新定位...');
        
        geolocation.getCurrentPosition(function(status, result) {
          setGeolocationLoading(false);
          if (status === 'complete') {
            // 定位成功回调
            setLocationStatus('定位成功');
            const str = [];
            str.push(`定位结果：${result.position}`);
            str.push(`定位类别：${result.location_type}`);
            if (result.accuracy) {
              str.push(`精度：${result.accuracy} 米`);
            }
            str.push(`是否经过偏移：${result.isConverted ? '是' : '否'}`);
            setLocationResult(str.join(' | '));
            console.log('重新定位成功:', result);

            const locationData={
              lng:result.position.lng,
              lat:result.position.lat,
              address:result.formattedAddress||'',
              accuracy:result.accuracy
            };
            setCurrentLocation(locationData);
            if(onLocationUpdate){
              onLocationUpdate(locationData);
            }
            
            // 将地图中心移动到新位置
            mapRef.current.setCenter(result.position);
          } else {
            // 定位失败回调
            setLocationStatus('定位失败');
            setLocationResult(`失败原因：${result.message} | 浏览器返回：${result.originMessage}`);
            console.error('重新定位失败:', result);
          }
        });
      });
    }
  };

  // 确定按钮点击，跳转到路线规划页面
  const handleConfirm = async () => {
    if (selectedRoute) {
      try {
        // 保存路线查询记录到后端
        const routeData = {
          departure: from,
          destination: to,
          departureLat: coordinates?.start?.lat || null,
          departureLng: coordinates?.start?.lng || null,
          destinationLat: coordinates?.end?.lat || null,
          destinationLng: coordinates?.end?.lng || null,
          distance: extractDistance(currentRoutes[selectedRoute].description),
          duration: extractDuration(currentRoutes[selectedRoute].time),
          routeType: getRouteTypeCode(activeMode),
          notes: `${selectedRoute === 'fastest' ? '最快路线' : '最省钱路线'} - ${activeMode}`
        };
        
        console.log('保存路线查询记录:', routeData);
        await saveRouteSearch(routeData);
        console.log('✅ 路线查询记录保存成功');
      } catch (error) {
        console.error('❌ 保存路线查询记录失败:', error);
        // 不阻断用户操作，只记录错误
      }
      
      // 传递选择的路线类型、出发地、目的地、出行方式和经纬度坐标
      onPlanRoute?.(from, to, activeMode, selectedRoute, coordinates);
    }
  };
  
  // 辅助函数：从描述中提取距离（千米）
  const extractDistance = (description) => {
    if (!description) return null;
    const match = description.match(/(\d+\.?\d*)\s*(?:公里|km|千米)/i);
    return match ? parseFloat(match[1]) : null;
  };
  
  // 辅助函数：从时间字符串中提取分钟数
  const extractDuration = (timeStr) => {
    if (!timeStr) return null;
    
    let totalMinutes = 0;
    
    // 匹配小时
    const hourMatch = timeStr.match(/(\d+)\s*(?:小时|时)/);
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    
    // 匹配分钟
    const minuteMatch = timeStr.match(/(\d+)\s*分钟?/);
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }
    
    return totalMinutes > 0 ? totalMinutes : null;
  };
  
  // 辅助函数：将出行方式转换为API需要的代码
  const getRouteTypeCode = (mode) => {
    const modeMap = {
      '地铁': 'transit',
      '步行': 'walking',
      '骑行': 'cycling',
      '自驾': 'driving',
      '电动车': 'cycling',
      '高铁': 'transit'
    };
    return modeMap[mode] || 'driving';
  };
  
  // 使用AI返回的数据或默认数据
  const currentRoutes = aiRoutes || getRoutesByMode(activeMode);

  return (
    <>
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-6 flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <div className="text-sm font-bold text-blue-800">好游，好旅游!</div>
        {/* <div className="w-8 h-8 rounded-full bg-gray-200" /> */}
      </div>
      {/* Search Section */}
      <div className="pt-16 pb-4 mt-3 bg-white">

         {/* 切换按钮  top:12*/}
       <div className='absolute flex flex-row right-10 top-10' onClick={()=>setIsAiMode(!isAiMode)}>
          <div className='text-blue-600 text-sm mt-2'>切换</div>
          <img src='/切换.png' className='w-4 h-4 mt-2.5'/>
        </div>

        {/* 输入框 */}
         {/*<div className="px-1 relative mt-2px">
          
        <div className="px-5 py-1 border border-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 mx-5 relative">
          
          <div className="relative flex items-center mb-3 mt-2">
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
              placeholder="出发地"
            />
            <i className="absolute right-3 text-gray-400 fa-solid fa-location-dot"></i>
          </div>
          
          <div className="relative flex items-center mb-3">
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
              placeholder="目的地"
            />
             <i className="absolute right-3 text-gray-400 fa-solid fa-flag-checkered"></i>
          </div>
          
          <button 
            onClick={handleSearch}
            className="w-full py-2 text-white bg-blue-600 rounded-lg mb-2"
          >
            一键规划路线
          </button>
        </div>
        </div> */}

        
        {/* Travel Modes */}
        {/* <div className="px-6 mt-2 overflow-x-auto">
          <div className="flex space-x-2">
            {travelModes.map((mode) => (
              <button
                key={mode}
                className={`px-3 py-1 text-sm whitespace-nowrap rounded-full ${
                  activeMode === mode
                    ? 'text-white bg-blue-600'
                    : 'text-blue-600 bg-transparent border border-blue-600'
                }`}
                onClick={() => setActiveMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div> */}

        {/* AI对话框 */}
        {isAiMode?(<div className="px-1 relative mt-2px">
          <div className="mx-5 relative">
            {/* 渐变边框容器 */}
            <div className="w-[95%] h-39 p-0.5 ml-2 rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              <div className="bg-white rounded-xl px-4 py-14 flex items-center space-x-3">
                 {!dialogInput.trim() && !isDialogFocused && (
              <div className="py-5 px-4 z-10">
                <div className="text-xs text-gray-400">
                  💡 例如：我想从北京去上海玩3天，帮我规划一下路线
                </div>
              </div>
            )}
                <div className='absolute bottom-2'>
                <div className='flex flex-row items-center'>
                {/* AI图标 */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                </div>
                {/* 输入框 */}
                {/* 可以实现换行 */}
                <textarea
                  value={dialogInput}
                  onChange={(e) => setDialogInput(e.target.value)}
                  onFocus={() => setIsDialogFocused(true)}
                  onBlur={() => setIsDialogFocused(false)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && dialogInput.trim()) {
                      e.preventDefault();
                      handleAiDialogSubmit();
                    }
                  }}
                  placeholder="请输入您的需求吧~"
                  className="flex-1 text-sm pl-4 placeholder-gray-400 white-space:nowrap text-overflow:ellipsis focus:outline-none bg-transparent resize-none min-h-[24px] max-h-[120px] overflow-y-auto"
                  rows="1"
                  style={{
                    height: 'auto',
                    minHeight: '24px',
                    maxHeight: '120px'
                  }}
                  onInput={(e) => {
                    // 自动调整高度
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                
                {/* 发送按钮 */}
                <button
                  onClick={handleAiDialogSubmit}
                  disabled={!dialogInput.trim()}
                  className={`ml-12 flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    dialogInput.trim()
                      ? 'bg-gradient-to-r from-blue-300 to-purple-300 text-white hover:from-blue-600 hover:to-purple-700 shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  发送
                </button>
              </div>
              {/* <div className='m-2 w-30 h-30' src="./imge/下拉.png"></div> */}
              </div>
              </div>
            </div>
            
          </div>
          <img className='mt-1 w-5 h-5 ml-[47%]' src={showPlanPopup?'/上拉.png':'/下拉.png'} onClick={handleTogglePlanPopup}/>
        </div>
        ):
        (
          // 输入出发地和目的地
           <div className="px-1 relative mt-2px">
          
        <div className="px-5 py-1 border border-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 mx-5 relative">
          
          <div className="relative flex items-center mb-3 mt-2">
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
              placeholder="出发地"
            />
            <i className="absolute right-3 text-gray-400 fa-solid fa-location-dot"></i>
          </div>
          
          <div className="relative flex items-center mb-3">
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
              placeholder="目的地"
            />
             <i className="absolute right-3 text-gray-400 fa-solid fa-flag-checkered"></i>
          </div>
          
          <button 
            onClick={handleSearch}
            className="w-full py-2 text-white bg-blue-600 rounded-lg mb-2"
          >
            一键规划路线
          </button>
        </div>
          <img className='mt-1 w-5 h-5 ml-[47%]' src={showPlanPopup?'/上拉.png':'/下拉.png'} onClick={handleTogglePlanPopup}/>
        </div>
        
         )} 
      </div>

      {/* Map Area - 占据从选择卡到底部导航栏之间的所有空间 */}
      <div className="flex-grow bg-gray-100 relative">
        {/* 地图容器 - 底部留出导航栏的空间 */}
        <div 
          ref={mapContainerRef}
          className="absolute top-0 left-0 right-0 z-0"
          style={{ 
            bottom: '55px', 
            minHeight: '300px',
            width: '100%',
            height: 'auto'
          }}
        />
        
        {/* 地图加载状态 */}
        {!mapLoaded && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 z-5" style={{ bottom: '64px' }}>
            <div className="text-center text-gray-500">
              <i className="mb-2 text-4xl fa-solid fa-map-location-dot"></i>
              <p>地图加载中...</p>
            </div>
          </div>
        )}
        
        {/* 定位信息显示 */}
        {/* <div className="absolute bottom-20 left-0 right-0 z-10 mx-4">
          <div className="bg-white rounded-lg shadow-lg p-3 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">定位信息</h4>
              {geolocationLoading && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-xs text-gray-500">定位中...</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center">
                <span className={`text-xs font-medium ${
                  locationStatus === '定位成功' ? 'text-green-600' : 
                  locationStatus === '定位失败' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {locationStatus || '等待定位'}
                </span>
              </div>
              
              {locationResult && (
                <div className="text-xs text-gray-600 break-all">
                  {locationResult}
                </div>
              )}
              
              {locationStatus === '定位失败' && (
                <div className="text-xs text-orange-600 mt-1">
                  提示：请升级到HTTPS以提高定位成功率和精度
                </div>
              )}
            </div>
          </div>
        </div> */}

        {/* AI 悬浮按钮 */}
        <AiFloatingButton onNavigateToAi={onNavigateToAi} />
      </div>

      {/* 遮罩层 */}
      {/* {showRoutes && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowRoutes(false)}
        />
      )} */}

      {/* Route Recommendations - 只在输入目的地后显示 */}
      {/* {showRoutes && (
        <div className="fixed bottom-16 left-0 right-0 z-40 p-4 bg-white rounded-t-2xl shadow-2xl max-h-[60vh] overflow-y-auto">
          <div className="w-10 h-1 mx-auto mb-4 bg-gray-300 rounded-full"></div>
          <h3 className="mb-3 text-lg font-semibold">
            推荐路线
            <span className='ml-2 text-sm font-normal text-gray-500'>({activeMode})</span>
          </h3>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <i className="text-blue-600 fa-solid fa-location-dot mr-2 text-sm"></i>
              <span className="text-sm font-medium text-gray-700">出发地：</span>
              <span className="text-sm text-gray-900 ml-1">{from}</span>
            </div>
            <div className="flex items-center">
              <i className="text-red-600 fa-solid fa-flag-checkered mr-2 text-sm"></i>
              <span className="text-sm font-medium text-gray-700">目的地：</span>
              <span className="text-sm text-gray-900 ml-1">{to}</span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">AI正在生成路线方案...</p>
            </div>
          ) : (
          <>
          <div className="space-y-3">
            <div 
              onClick={() => setSelectedRoute('fastest')}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRoute === 'fastest' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="mr-2 text-blue-600 fa-solid fa-bolt"></i>
                  <span className="font-medium">最快路线</span>
                  {selectedRoute === 'fastest' && (
                    <i className="ml-2 text-blue-600 fa-solid fa-check-circle"></i>
                  )}
                </div>
                <div className="text-sm text-gray-600">{currentRoutes.fastest.time}</div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {currentRoutes.fastest.description} · {currentRoutes.fastest.cost}
              </div>
            </div>
            
            <div 
              onClick={() => setSelectedRoute('cheapest')}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRoute === 'cheapest' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-green-200 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="mr-2 text-green-600 fa-solid fa-coins"></i>
                  <span className="font-medium">最省钱路线</span>
                  {selectedRoute === 'cheapest' && (
                    <i className="ml-2 text-green-600 fa-solid fa-check-circle"></i>
                  )}
                </div>
                <div className="text-sm text-gray-600">{currentRoutes.cheapest.time}</div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {currentRoutes.cheapest.description} · {currentRoutes.cheapest.cost}
              </div>
            </div>
          </div>
          <div className='mt-3 p-2 bg-blue-50 rounded-lg '>
            <p className='text-xs text-blue-600'>请选择一条路线，切换上方出行方式可查看不同推荐</p>
          </div>
          </>
          )}
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowRoutes(false)}
              className="flex-1 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedRoute}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                selectedRoute
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              确定
            </button>
          </div>
        </div>
      )} */}

      {/* Toast 提示 */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
            <p className="text-sm">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed mt-10px bottom-0 left-0 right-0 z-20 flex items-center justify-around p-3 bg-white border-t border-gray-200">
        <div className="flex flex-col items-center">
          <i className="text-xl text-blue-600 fa-solid fa-house"></i>
          <span className="text-xs text-blue-600">首页</span>
        </div>
        
        <div className="flex flex-col items-center cursor-pointer" onClick={onNavigateToCommunity}>
          <div className="relative">
            <i className="text-xl text-gray-400 fa-solid fa-users"></i>
            {chatUnreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] px-1 text-[10px] leading-4 text-center bg-red-500 text-white rounded-full">
                {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">社区</span>
        </div>
        
        <div className="flex flex-col items-center cursor-pointer" onClick={onNavigateToDiscover}>
          <i className="text-xl text-gray-400 fa-solid fa-map"></i>
          <span className="text-xs text-gray-400">发现</span>
        </div>
        
        <div className="flex flex-col items-center cursor-pointer" onClick={onNavigateToMine}>
          <i className="text-xl text-gray-400 fa-solid fa-user"></i>
          <span className="text-xs text-gray-400">我的</span>
        </div>
      </div>
    </div>

    {showReminderDialog && currentReminderPlan && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg p-4 w-80 shadow-lg">
          <h3 className="text-base font-semibold mb-2">是否开始执行该旅行计划？</h3>

          {planLoading && (
            <p className="text-sm text-gray-500">加载中...</p>
          )}

          {!planLoading && (
            <div className="space-y-2 text-sm text-gray-700 mt-1">
              <div className="font-semibold text-gray-900">
                {currentReminderPlan.title || `${currentReminderPlan.destination || ''}${currentReminderPlan.travelDays || ''}日游` || '未命名行程'}
              </div>
              {currentReminderPlan.startDate && currentReminderPlan.endDate && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="fa-regular fa-calendar"></i>
                  <span>
                    {currentReminderPlan.startDate} ~ {currentReminderPlan.endDate}
                  </span>
                </div>
              )}
              {currentReminderPlan.destination && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="fa-solid fa-location-dot"></i>
                  <span>{currentReminderPlan.destination}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                到了出行日期，可以选择是否开始执行该行程。您也可以稍后在首页的行程卡片中再次查看。
              </p>
            </div>
          )}

          {updatingPlanStatus && (
            <p className="mt-3 text-xs text-blue-500">正在更新计划状态，请稍候...</p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="flex-1 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={handleReminderSkip}
              disabled={updatingPlanStatus}
            >
              暂不执行
            </button>
            <button
              type="button"
              className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              onClick={handleReminderConfirm}
              disabled={updatingPlanStatus}
            >
              开始执行
            </button>
          </div>
        </div>
      </div>
    )}

    {showPlanPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg p-4 w-80 shadow-lg">
          <h3 className="text-base font-semibold mb-2">当前执行中的行程</h3>

          {planLoading && <p className="text-sm text-gray-500">加载中...</p>}

          {!planLoading && planError && (
            <p className="text-sm text-red-500">{planError}</p>
          )}

          {!planLoading && !planError && !activePlan && (
            <p className="text-sm text-gray-500">当前没有正在执行中的旅行计划</p>
          )}

          {!planLoading && activePlan && (
            <div className="space-y-4 mt-2">
              {[activePlan].map((trip, index) => (
                <div
                  key={trip.id}
                  className={`${cardBgClasses ? cardBgClasses[index % cardBgClasses.length] : 'bg-white'} rounded-xl shadow-sm p-4 flex flex-col gap-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-base font-semibold text-gray-800">
                      {trip.title || `${trip.destination || ''}${trip.travelDays || ''}日游` || '未命名行程'}
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
                      {trip.status === 'active' ? '进行中' : '未执行'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <i className="fa-regular fa-calendar"></i>
                    <span>
                      {trip.startDate && trip.endDate
                        ? `${trip.startDate} ~ ${trip.endDate}`
                        : trip.date || ''}
                    </span>
                  </div>

                  {trip.destination && (
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <i className="fa-solid fa-location-dot"></i>
                      <span>{trip.destination}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            className="mt-4 w-full py-2 text-sm text-white bg-blue-500 rounded-lg"
            onClick={() => setShowPlanPopup(false)}
          >
            知道了
          </button>
        </div>
      </div>
    )}
  </>
  );
}

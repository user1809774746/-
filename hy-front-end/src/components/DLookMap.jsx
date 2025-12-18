import React, { useState, useEffect, useRef } from 'react';
import amapConfig from '../config/amapConfig';

export default function DLookMap({ onNavigateToDiscover, userLocation, treasureSpots = [], onPlanRoute }) {

  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationResult, setLocationResult] = useState('');
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(userLocation || null);
  const [selectedSpot, setSelectedSpot] = useState(null); // 选中的景点
  const [showSpotDetail, setShowSpotDetail] = useState(false); // 显示景点详情
  
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [markers, setMarkers] = useState([]);

  const getSpotCoordinates = (spot) => {
    if (!spot) {
      return null;
    }

    const toNumber = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const num = parseFloat(value);
        return Number.isNaN(num) ? null : num;
      }
      return null;
    };

    let lng = spot.lng ?? (spot.location && spot.location.lng);
    let lat = spot.lat ?? (spot.location && spot.location.lat);

    if ((lng == null || lat == null) && typeof spot.log_lat === 'string') {
      const parts = spot.log_lat.split(',');
      if (parts.length === 2) {
        const parsedLng = parseFloat(parts[0]);
        const parsedLat = parseFloat(parts[1]);
        if (!Number.isNaN(parsedLng) && !Number.isNaN(parsedLat)) {
          lng = parsedLng;
          lat = parsedLat;
        }
      }
    }

    const lngNum = toNumber(lng);
    const latNum = toNumber(lat);
    if (lngNum != null && latNum != null) {
      return { lng: lngNum, lat: latNum };
    }
    return null;
  };

  const handleNavigateToMapFromSpot = () => {
    if (!selectedSpot || !onPlanRoute) {
      return;
    }

    const endCoords = getSpotCoordinates(selectedSpot);
    const endName = selectedSpot.name || '目的地';

    let startCoords = null;
    let fromName = '';

    const startLocation = currentLocation || userLocation;

    if (startLocation && startLocation.lng != null && startLocation.lat != null) {
      startCoords = {
        lng: startLocation.lng,
        lat: startLocation.lat,
      };
      fromName = startLocation.address || '我的位置';
    } else {
      fromName = '起点';
    }

    const routeData = {
      from: fromName,
      to: endName,
    };

    if (startCoords && endCoords) {
      routeData.coordinates = {
        start: {
          lng: startCoords.lng,
          lat: startCoords.lat,
          address: fromName,
        },
        end: {
          lng: endCoords.lng,
          lat: endCoords.lat,
          address: endName,
        },
      };
    }

    onPlanRoute(routeData);
  };

  // 地图初始化逻辑（从 goHomePage 复制）
  useEffect(() => {

    const initMap = async () => {
      try {
        // 动态加载高德地图API
        if (!window.AMap) {
          const script = document.createElement('script');
          script.src = amapConfig.getApiUrl(['AMap.Geolocation']);
          script.onload = () => createMapWithGeolocation();
          script.onerror = () => {
            console.error('❌ 高德地图API加载失败');
            setLocationStatus('地图API加载失败');
            setLocationResult('请检查API Key配置');
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
          // 清除旧内容
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '';
          }
          
          // 创建地图实例
          const map = new window.AMap.Map(mapContainerRef.current, {
            zoom: 15,
            resizeEnable: true,
            dragEnable: true,
            zoomEnable: true,
            scrollWheel: true,
            touchZoom: true,
          });
          
          // 设置安全密钥
          window._AMapSecurityConfig = {
            securityJsCode: amapConfig.securityKey,
          };
          
          console.log('🚀 地图初始化成功');
          setLocationStatus('正在初始化地图...');
          
          // 地图加载完成
          map.on('complete', function() {
            console.log('✅ 地图加载完成');
            mapRef.current = map;
            setMapLoaded(true);
            setLocationStatus('地图加载成功');
            
            // 🔥 如果已有用户位置，直接定位
            if (userLocation && userLocation.lng && userLocation.lat) {
              addUserMarker(map, userLocation);
              if(treasureSpots&&treasureSpots.length>0){
                addTreasureMarkers(map, treasureSpots);
              }
              adjustMapView(map);
              setLocationStatus(`定位成功，共显示 ${treasureSpots.length} 个景点`);
              setLocationResult(`位置：${userLocation.address || `经度${userLocation.lng}, 纬度${userLocation.lat}`}`);
              // const position = [userLocation.lng, userLocation.lat];
              // map.setCenter(position);
              
              // // 添加标记点
              // const marker = new window.AMap.Marker({
              //   position: position,
              //   title: '当前位置'
              //});
              // map.add(marker);
              
              // setLocationStatus('定位成功（使用已保存位置）');
              // setLocationResult(`位置：${userLocation.address || `经度${userLocation.lng}, 纬度${userLocation.lat}`}`);
            } else {
              // 没有保存的位置，执行新的定位
              startGeolocation(map);
            }
          });
          
        } catch (error) {
          console.error('地图创建失败:', error);
          setLocationStatus('地图加载失败');
        }
      }
    };
    //用户位置标记
    const addUserMarker = (map, location) => {
      console.log('添加用户位置标记:', location);
      const position=[location.lng, location.lat];
      const userMarker=new window.AMap.Marker({
        position:position,
        title:'我的位置',
        icon:new window.AMap.Icon({
          size: new window.AMap.Size(32, 32),
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          imageSize: new window.AMap.Size(32, 32)
        }),
        offset: new window.AMap.Pixel(-16, -16),
        zIndex: 100
      })
      //点击显示信息窗口
      userMarker.on('click', () => {
        const infoWindow = new window.AMap.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #3B82F6; font-size: 16px; font-weight: bold;">
                📍 我的位置
              </h3>
              <p style="margin: 4px 0; color: #666; font-size: 14px;">
                ${location.address || '当前位置'}
              </p>
              // <p style="margin: 4px 0; color: #999; font-size: 12px;">
              //   经度: ${Number(location.lng).toFixed(6)}<br/>
              //   纬度: ${Number(location.lat).toFixed(6)}
              // </p>
            </div>
          `,
          offset: new window.AMap.Pixel(0, -30)
        });
        infoWindow.open(map, position);
      })
      
      map.add(userMarker);
      setMarkers(prev => [...prev, userMarker]);
      console.log('✅ 用户位置标记已添加');
    }
    const addTreasureMarkers = (map, spots) => {
      console.log('🎯 开始添加宝藏景点标记，共', spots.length, '个');
      
      const newMarkers = [];
      
      spots.forEach((spot, index) => {
        // 🔍 验证景点是否有有效的坐标（支持两种格式）
        const lng = spot.lng || spot.location?.lng;
        const lat = spot.lat || spot.location?.lat;
        
        if (!lng || !lat) {
          console.warn('⚠️ 景点缺少坐标，跳过:', spot.name, spot);
          return;
        }
        
        const position = [lng, lat];
        
        // 创建景点标记（红色）
        const marker = new window.AMap.Marker({
          position: position,
          title: spot.name,
          // 🎨 自定义景点图标（红色位置图标）
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(32, 32),
            image: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `),
            imageSize: new window.AMap.Size(32, 32)
          }),
          offset: new window.AMap.Pixel(-16, -32),
          zIndex: 90,
          // 🏷️ 添加文字标签
          label: {
            content: `<div style="background: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${index + 1}</div>`,
            offset: new window.AMap.Pixel(0, -35)
          }
        });
      
     // 🎯 点击景点标记显示详细信息
     marker.on('click', () => {
      // 显示底部详情面板
      setSelectedSpot(spot);
      setShowSpotDetail(true);
      // 地图居中到该景点
      map.setCenter(position);
    });
    
    map.add(marker);
    newMarkers.push(marker);
    
    console.log(`✅ 景点 ${index + 1}: ${spot.name} 已添加`);
  });
  
  setMarkers(prev => [...prev, ...newMarkers]);
  console.log(`🎉 共添加了 ${newMarkers.length} 个景点标记`);
};

       // 🔥 自动调整地图视野，显示所有标记
    // ═══════════════════════════════════════════════════════════════
    const adjustMapView = (map) => {
      console.log('🔍 调整地图视野...');
      
      // 等待所有标记添加完成后再调整视野
      setTimeout(() => {
        // 🎯 自动调整地图视野，包含所有标记点
        map.setFitView(null, false, [50, 50, 50, 150]); // 上右下左的padding
        console.log('✅ 地图视野已调整');
      }, 300);
    };

    // 🔥 开始定位
    const startGeolocation = (map) => {
      window.AMap.plugin('AMap.Geolocation', function() {
        try {
          const geolocation = new window.AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            zoomToAccuracy: true,
          });
          
          map.addControl(geolocation);
          setGeolocationLoading(true);
          setLocationStatus('正在定位...');
          
          geolocation.getCurrentPosition(function(status, result) {
            setGeolocationLoading(false);
            if (status === 'complete') {
              onLocationComplete(result);
            } else {
              onLocationError(result);
            }
          });
        } catch (error) {
          console.error('定位失败:', error);
          setGeolocationLoading(false);
          setLocationStatus('定位功能不可用');
        }
      });
    };

    // 定位成功回调
    const onLocationComplete = (data,map) => {
      setLocationStatus('定位成功');
      const str = [];
      str.push(`位置：${data.position}`);
      if (data.accuracy) {
        str.push(`精度：${data.accuracy} 米`);
      }
      setLocationResult(str.join(' | '));
      console.log('定位成功:', data);

      const locationData = {
        lng: data.position.lng,
        lat: data.position.lat,
        address: data.formattedAddress || '',
        accuracy: data.accuracy
      };
      setCurrentLocation(locationData);
      addUserMarker(map, locationData);
      //如果有景点数据，也添加景点标记
      if(treasureSpots&&treasureSpots.length>0){
        addTreasureMarkers(map, treasureSpots);
        adjustMapView(map);
      }
    };

    // 定位失败回调
    const onLocationError = (data) => {
      setLocationStatus('定位失败');
      setLocationResult(`原因：${data.message}`);
      console.error('定位失败:', data);
    };

    initMap();

    // 清理函数
    return () => {
      if(markers.length>0){
        markers.forEach(marker=>{
          try{
            marker.setMap(null);
          }catch(error){
            console.warn('标记清理错误:', error);
          }
        });
        setMarkers([]);
      }
      //销毁地图
      if(mapRef.current){
        try{
          mapRef.current.destroy();
        }catch(error){
          console.warn('地图销毁错误:', error);
        }finally{
          mapRef.current=null;
          setMapLoaded(false);
        }
      }
      // if (mapRef.current) {
      //   try {
      //     mapRef.current.destroy();
      //   } catch (error) {
      //     console.warn('地图销毁错误:', error);
      //   } finally {
      //     mapRef.current = null;
      //     setMapLoaded(false);
      //   }
      // }
    };
  }, [userLocation,treasureSpots]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onNavigateToDiscover} className="mr-3">
            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-800">附近地图</h1>
          {/* 🔥 显示景点数量 */}
          <div className="text-xs text-gray-500">
            {treasureSpots.length}个景点
          </div>
        </div>
      </div>

      {/* 地图容器 */}
      <div className="pt-14 flex-grow relative">
        <div 
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* 地图加载状态 */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
            <div className="text-center text-gray-500">
              <i className="fa-solid fa-map-location-dot text-4xl mb-2"></i>
              <p>地图加载中...</p>
            </div>
          </div>
        )}
        
        {/* 定位信息显示 */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
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
                  locationStatus.includes('成功') ? 'text-green-600' : 
                  locationStatus.includes('失败') ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {locationStatus || '等待定位'}
                </span>
              </div>
              
              {locationResult && (
                <div className="text-xs text-gray-600 break-all">
                  {locationResult}
                </div>
              )}
              {/* 景点列表 */}
              {treasureSpots.length>0&&(
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">
                    显示 {treasureSpots.length} 个宝藏景点
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {treasureSpots.slice(0, 3).map((spot, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full"
                      >
                        {spot.name}
                      </span>
                    ))}
                    {treasureSpots.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{treasureSpots.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 图例说明 */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-2 text-xs">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>我的位置</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 text-red-500">📍</div>
              <span>宝藏景点</span>
            </div>
          </div>
        </div>
        {/* 底部景点详情面板 */}
        {showSpotDetail && selectedSpot && (
          <div className="absolute bottom-0 ml-3 mr-3 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[60vh] overflow-y-auto">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowSpotDetail(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
            >
              <i className="fa-solid fa-times text-gray-600"></i>
            </button>

            {/* 景点图片 */}
            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
              {selectedSpot.photos && selectedSpot.photos.length > 0 ? (
                <img
                  src={selectedSpot.photos[0].url}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fa-solid fa-image text-white text-6xl opacity-50"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* 景点名称 */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                {selectedSpot.name}
              </h2>
            </div>
          </div>

          {/* 景点信息 */}
          <div className="p-4 space-y-4">
            {/* 评分和距离 */}
            <div className="flex items-center gap-4">
              {selectedSpot.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {selectedSpot.rating}
                  </span>
                  <span className="text-sm text-gray-500">分</span>
                </div>
              )}
              {selectedSpot.distance && (
                <div className="flex items-center gap-1 text-gray-600">
                  <i className="fa-solid fa-location-arrow text-blue-500"></i>
                  <span className="text-sm">{selectedSpot.distance}m</span>
                </div>
              )}
            </div>

            {/* 地址 */}
            {selectedSpot.address && (
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-map-marker-alt text-red-500 mt-1"></i>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{selectedSpot.address}</p>
                </div>
              </div>
            )}

            {/* 类型 */}
            {selectedSpot.type && (
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-tag text-purple-500"></i>
                <span className="text-sm text-gray-600">{selectedSpot.type}</span>
              </div>
            )}

            {/* 坐标信息 */}
            {/* <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>经度:</span>
                  <span className="font-mono">{Number(selectedSpot.lng || selectedSpot.location?.lng).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>纬度:</span>
                  <span className="font-mono">{Number(selectedSpot.lat || selectedSpot.location?.lat).toFixed(6)}</span>
                </div>
              </div>
            </div> */}

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2 mb-4">
              <button
                className="flex-1 bg-blue-300 text-white py-3 rounded-3xl font-medium hover:bg-blue-300 transition-colors"
                onClick={handleNavigateToMapFromSpot}
              >
                <i className="fa-solid fa-route mr-2"></i>
                导航
              </button>

              {/* <button className="flex-1 bg-yellow-200 text-white py-3 rounded-3xl font-medium hover:bg-yellow-600 transition-colors">
                <i className="fa-solid fa-star mr-2"></i>
                收藏
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
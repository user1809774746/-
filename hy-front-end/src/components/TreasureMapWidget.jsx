import React, { useEffect, useRef, useState } from 'react';
import amapConfig from '../config/amapConfig';

/**
 * 宝藏景点小地图组件
 * 显示用户附近的景点标记，支持拖拽、缩放
 */
const TreasureMapWidget = ({ onMapClick, onSpotClick }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [spots, setSpots] = useState([]);
  const spotsRef = useRef([]); // 使用ref保存景点数据，确保点击时能获取到最新值
  const userLocationRef = useRef(null); // 保存用户位置
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 加载高德地图
    const loadMap = async () => {
      try {
        console.log('🗺️ 开始加载小地图...');
        
        // 如果AMap未加载，动态加载脚本
        if (!window.AMap) {
          console.log('⏳ AMap未加载，开始动态加载...');
          const script = document.createElement('script');
          script.src = amapConfig.getApiUrl(['AMap.Geolocation', 'AMap.PlaceSearch']);
          script.async = true;
          
          await new Promise((resolve, reject) => {
            script.onload = () => {
              console.log('✅ AMap脚本加载成功');
              // 设置安全密钥
              window._AMapSecurityConfig = {
                securityJsCode: amapConfig.securityKey,
              };
              resolve();
            };
            script.onerror = () => {
              console.error('❌ AMap脚本加载失败');
              reject(new Error('地图脚本加载失败'));
            };
            document.head.appendChild(script);
          });
        } else {
          console.log('✅ AMap已加载');
          // 确保安全密钥已设置
          window._AMapSecurityConfig = {
            securityJsCode: amapConfig.securityKey,
          };
        }

        // 创建地图实例
        console.log('🗺️ 创建地图实例...');
        const map = new window.AMap.Map(mapContainerRef.current, {
          zoom: 14,
          center: [116.397428, 39.90923], // 默认北京
          viewMode: '2D',
          mapStyle: 'amap://styles/whitesmoke', // 清新风格
          features: ['bg', 'road', 'building'], // 只显示基础要素
        });

        mapRef.current = map;
        console.log('✅ 地图实例创建成功');

        // 添加地图点击事件
        map.on('click', () => {
          console.log('🖱️ 地图被点击，准备跳转到大地图');
          console.log('📍 当前景点数据:', spotsRef.current.length, '个');
          console.log('📍 用户位置:', userLocationRef.current);
          if (onMapClick) {
            // 使用ref保存的最新数据
            onMapClick({
              spots: spotsRef.current,
              userLocation: userLocationRef.current || {
                lng: map.getCenter().lng,
                lat: map.getCenter().lat
              }
            });
          }
        });

        // 获取用户位置
        map.plugin('AMap.Geolocation', function() {
          const geolocation = new window.AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            zoomToAccuracy: true,
          });

          geolocation.getCurrentPosition((status, result) => {
            if (status === 'complete') {
              const { lng, lat } = result.position;
              console.log('📍 定位成功:', lng, lat);
              // 保存用户位置
              userLocationRef.current = { lng, lat, address: result.formattedAddress || '' };
              map.setCenter([lng, lat]);
              
              // 添加当前位置标记（蓝色圆点）
              const userMarker = new window.AMap.Marker({
                position: [lng, lat],
                icon: new window.AMap.Icon({
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
                title: '我的位置',
                zIndex: 100,
                map: map
              });
              markersRef.current.push(userMarker);
              console.log('✅ 用户位置标记已添加');

              // 搜索附近景点
              searchNearbySpots(lng, lat, map);
            } else {
              console.error('❌ 定位失败:', result);
              setError('定位失败，使用默认位置');
              // 使用默认位置搜索
              searchNearbySpots(116.397428, 39.90923, map);
            }
          });
        });

        setLoading(false);
      } catch (err) {
        console.error('地图加载失败:', err);
        setError('地图加载失败');
        setLoading(false);
      }
    };

    loadMap();

    // 清理函数
    return () => {
      console.log('🧹 清理小地图资源...');
      // 清除所有标记
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          try {
            marker.setMap(null);
          } catch (e) {
            console.warn('标记清理错误:', e);
          }
        });
        markersRef.current = [];
      }
      // 销毁地图实例
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
          mapRef.current = null;
        } catch (e) {
          console.warn('地图销毁错误:', e);
        }
      }
      console.log('✅ 小地图资源清理完成');
    };
  }, []);

  // 搜索附近景点
  const searchNearbySpots = (lng, lat, map) => {
    window.AMap.plugin('AMap.PlaceSearch', function() {
      const placeSearch = new window.AMap.PlaceSearch({
        type: '风景名胜|公园广场|文化场馆', // 景点类型
        pageSize: 20,
        pageIndex: 1,
        city: '全国',
        citylimit: false,
        extensions: 'all'
      });

      console.log('🔍 开始搜索附近景点...');
      // 搜索附近景点
      placeSearch.searchNearBy('', [lng, lat], 5000, (status, result) => {
        console.log('搜索结果状态:', status);
        if (status === 'complete' && result.poiList) {
          const poiList = result.poiList.pois;
          console.log('✅ 搜索到景点:', poiList.length, '个', poiList);
          
          // 保存景点数据
          const spotsData = poiList.map(poi => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            location: poi.location,
            distance: poi.distance,
            type: poi.type,
            rating: poi.biz_ext?.rating || '暂无评分',
            photos: poi.photos || []
          }));
          
          setSpots(spotsData);
          spotsRef.current = spotsData; // 同步更新ref

          // 清除旧标记
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];

          // 添加景点标记
          console.log('📍 开始添加景点标记...');
          poiList.forEach((poi, index) => {
            const marker = new window.AMap.Marker({
              position: [poi.location.lng, poi.location.lat],
              title: poi.name,
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
              label: {
                content: `<div style="background: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; box-shadow: 0 1px 4px rgba(0,0,0,0.2); white-space: nowrap;">${index + 1}</div>`,
                offset: new window.AMap.Pixel(0, -38)
              },
              extData: spotsData[index],
              zIndex: 90,
              map: map
            });
            console.log(`✅ 景点 ${index + 1}: ${poi.name} 标记已添加`);

            // 点击标记
            marker.on('click', (e) => {
              const spotData = e.target.getExtData();
              if (onSpotClick) {
                onSpotClick(spotData);
              }
            });

            markersRef.current.push(marker);
          });
          
          // 调整地图视野，确保所有标记可见
          console.log('🔍 调整地图视野以显示所有标记...');
          setTimeout(() => {
            map.setFitView(null, false, [50, 50, 50, 50]);
            console.log('✅ 地图视野调整完成');
          }, 300);
        } else {
          console.error('❌ 景点搜索失败:', status, result);
          setError('景点搜索失败');
        }
      });
    });
  };

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden shadow-lg">
      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">正在加载地图...</p>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && !loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 z-10">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {/* 地图容器 */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full cursor-pointer"
      />

      {/* 点击查看大地图提示 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg z-10 pointer-events-none">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <i className="fa-solid fa-hand-pointer text-GuText"></i>
          <span>点击查看大地图</span>
        </div>
      </div>

      {/* 景点数量标签 */}
      {spots.length > 0 && (
        <div className="absolute top-4 right-4 bg-GuText text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg z-10">
          {spots.length} 个景点
        </div>
      )}
    </div>
  );
};

export default TreasureMapWidget;

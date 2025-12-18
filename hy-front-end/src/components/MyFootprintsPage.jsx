import React, { useEffect, useRef, useState } from 'react';
import amapConfig from '../config/amapConfig';
import { API_CONFIG, apiRequest, getCurrentUserId } from '../api/config';

const MyFootprintsPage = ({ onBack }) => {
  const mapContainerRef = useRef(null);
  const handleCityClickRef = useRef(null);
  const [visitedCities, setVisitedCities] = useState([]);
  const [footprintsLoading, setFootprintsLoading] = useState(false);
  const [footprintsError, setFootprintsError] = useState(null);
  
  // 城市照片弹窗状态
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityPhoto, setCityPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  // 调用高德POI v5 API获取城市照片
  const fetchCityPhoto = async (cityName) => {
    try {
      setPhotoLoading(true);
      setPhotoError(null);
      setCityPhoto(null);
      
      const webServiceKey = amapConfig.getRestKey();
      // 搜索城市的景点POI，获取照片
      const searchKeyword = `${cityName}景点`;
      const url = `https://restapi.amap.com/v5/place/text?keywords=${encodeURIComponent(searchKeyword)}&region=${encodeURIComponent(cityName)}&city_limit=true&show_fields=photos&page_size=10&key=${webServiceKey}`;
      
      console.log('🔍 搜索城市照片:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📸 POI搜索结果:', data);
      
      if (data.status === '1' && data.pois && data.pois.length > 0) {
        // 遍历POI找到第一个有照片的
        for (const poi of data.pois) {
          if (poi.photos && poi.photos.length > 0 && poi.photos[0].url) {
            setCityPhoto({
              url: poi.photos[0].url,
              title: poi.photos[0].title || poi.name,
              poiName: poi.name
            });
            return;
          }
        }
        // 没有找到带照片的POI
        setPhotoError('暂无该城市的照片');
      } else {
        setPhotoError('未找到该城市的相关信息');
      }
    } catch (error) {
      console.error('获取城市照片失败:', error);
      setPhotoError('获取照片失败，请稍后重试');
    } finally {
      setPhotoLoading(false);
    }
  };

  // 点击城市名称
  const handleCityClick = (cityName) => {
    setSelectedCity(cityName);
    setShowPhotoModal(true);
    fetchCityPhoto(cityName);
  };

  // 保存handleCityClick的引用，供地图覆盖物点击事件使用
  handleCityClickRef.current = handleCityClick;

  // 关闭弹窗
  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedCity(null);
    setCityPhoto(null);
    setPhotoError(null);
  };

  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: amapConfig.securityKey,
    };

    let map;
    let isUnmounted = false;

    const loadMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.AMap) {
          resolve(window.AMap);
          return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = amapConfig.getApiUrl(['AMap.DistrictSearch']);
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

    const initMap = (AMap) => {
      if (!mapContainerRef.current) {
        return null;
      }

      const chinaCenter = [104.195397, 35.86166];

      const createdMap = new AMap.Map(mapContainerRef.current, {
        resizeEnable: true,
        center: chinaCenter,
        zoom: 4,
        dragEnable: true,
        zoomEnable: true,
        scrollWheel: true,
        touchZoom: true,
        viewMode: '2D',
      });

      const bounds = new AMap.Bounds(
        new AMap.LngLat(73.5, 18),
        new AMap.LngLat(135.1, 53.6)
      );
      createdMap.setBounds(bounds);

      return createdMap;
    };

    const loadVisitedCitiesAndRender = async (AMapInstance, mapInstance) => {
      try {
        setFootprintsLoading(true);
        setFootprintsError(null);

        const userId = await getCurrentUserId();
        const plansEndpoint = `${API_CONFIG.ENDPOINTS.GET_USER_TRAVEL_PLANS}/${userId}`;
        const plansResponse = await apiRequest(plansEndpoint, { method: 'GET' });

        const travelPlans =
          plansResponse &&
          plansResponse.data &&
          Array.isArray(plansResponse.data.travelPlans)
            ? plansResponse.data.travelPlans
            : [];

        const activePlans = travelPlans.filter(
          (plan) => plan && (plan.status === 'active' || plan.status === 'completed')
        );

        if (!activePlans.length) {
          setVisitedCities([]);
          return;
        }

        const cityListPromises = activePlans
          .map((plan) => {
            const id = plan.id;
            if (!id) return null;
            const endpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_CITY_LIST.replace(
              '{id}',
              id
            );
            return apiRequest(endpoint, { method: 'GET' }).catch((error) => {
              console.error('获取旅行计划城市列表失败:', error);
              return null;
            });
          })
          .filter(Boolean);

        const cityListResponses = await Promise.all(cityListPromises);

        const allCityNames = [];
        cityListResponses.forEach((res) => {
          if (
            res &&
            res.data &&
            res.data.cities &&
            Array.isArray(res.data.cities)
          ) {
            res.data.cities.forEach((name) => {
              if (name && typeof name === 'string') {
                allCityNames.push(name);
              }
            });
          }
        });

        const uniqueCities = Array.from(new Set(allCityNames));
        setVisitedCities(uniqueCities);

        if (!uniqueCities.length) {
          return;
        }

        await new Promise((resolve) => {
          AMapInstance.plugin('AMap.DistrictSearch', () => {
            resolve();
          });
        });

        const districtSearch = new AMapInstance.DistrictSearch({
          extensions: 'all',
          level: 'city',
          subdistrict: 0
        });

        const overlays = [];

        const cleanCityName = (cityName) => {
          let cleaned = cityName.trim();
          cleaned = cleaned.replace(/^.*?省\s*/g, '');
          cleaned = cleaned.replace(/^.*?自治区\s*/g, '');
          cleaned = cleaned.replace(/^.*?特别行政区\s*/g, '');
          cleaned = cleaned.trim();
          return cleaned;
        };

        const searchDistrict = (cityName) =>
          new Promise((resolve) => {
            const originalName = cityName;
            const cleanedName = cleanCityName(cityName);
            const namesToTry = [
              cleanedName + '市',
              cleanedName,
              originalName,
              cleanedName + '地区'
            ];
            
            let currentIndex = 0;
            
            const trySearch = () => {
              if (currentIndex >= namesToTry.length) {
                console.warn(`所有格式都查询失败: ${originalName}`);
                resolve(null);
                return;
              }
              
              const searchName = namesToTry[currentIndex];
              console.log(`尝试查询: ${searchName} (原名: ${originalName})`);
              
              districtSearch.search(searchName, (status, result) => {
                if (
                  status === 'complete' &&
                  result &&
                  result.districtList &&
                  result.districtList.length > 0
                ) {
                  const district = result.districtList[0];
                  console.log(`✓ ${searchName} 查询成功！边界数据:`, {
                    name: district.name,
                    center: district.center,
                    boundariesCount: district.boundaries ? district.boundaries.length : 0
                  });
                  resolve(district);
                } else {
                  console.log(`✗ ${searchName} 查询失败，尝试下一个格式...`);
                  currentIndex++;
                  trySearch();
                }
              });
            };
            
            trySearch();
          });

        const districts = await Promise.all(
          uniqueCities.map((name) => searchDistrict(name))
        );

        if (isUnmounted || !mapInstance || !mapInstance.getStatus) {
          console.warn('地图已销毁或组件已卸载，停止渲染');
          return;
        }

        districts.forEach((district, index) => {
          const cityName = uniqueCities[index];
          
          if (!district) {
            console.warn(`${cityName}: district 对象为空`);
            return;
          }
          
          if (!district.boundaries || district.boundaries.length === 0) {
            console.warn(`${cityName}: 没有边界数据`, district);
            return;
          }

          console.log(`开始渲染 ${cityName}, 边界数量: ${district.boundaries.length}`);

          district.boundaries.forEach((boundary, bIndex) => {
            if (isUnmounted || !mapInstance) return;
            
            console.log(`${cityName} 边界 ${bIndex}:`, boundary);
            try {
              const polygon = new AMapInstance.Polygon({
                path: boundary,
                strokeColor: '#3B82F6',
                strokeWeight: 3,
                strokeOpacity: 1,
                fillColor: '#3B82F6',
                fillOpacity: 0.5,
                zIndex: 50,
                cursor: 'pointer'
              });
              // 点击点亮区域触发照片弹窗
              polygon.on('click', () => {
                if (handleCityClickRef.current) {
                  handleCityClickRef.current(cityName);
                }
              });
              polygon.setMap(mapInstance);
              overlays.push(polygon);
              console.log(`${cityName} 多边形已添加到地图`);
            } catch (error) {
              console.error(`${cityName} 多边形添加失败:`, error);
            }
          });

          if (district.center && !isUnmounted && mapInstance) {
            try {
              const text = new AMapInstance.Text({
                text: cityName,
                position: district.center,
                style: {
                  'background-color': 'rgba(59, 130, 246, 0.9)',
                  'border': 'none',
                  'border-radius': '8px',
                  'color': '#fff',
                  'font-size': '13px',
                  'font-weight': 'bold',
                  'padding': '5px 10px',
                  'box-shadow': '0 2px 8px rgba(0,0,0,0.2)',
                  'cursor': 'pointer'
                },
                zIndex: 100
              });
              // 点击城市标签触发照片弹窗
              text.on('click', () => {
                if (handleCityClickRef.current) {
                  handleCityClickRef.current(cityName);
                }
              });
              text.setMap(mapInstance);
              overlays.push(text);
              console.log(`${cityName} 文字标签已添加`);
            } catch (error) {
              console.error(`${cityName} 文字标签添加失败:`, error);
            }
          }
        });

        if (overlays.length && !isUnmounted && mapInstance) {
          try {
            mapInstance.setFitView(overlays);
          } catch (error) {
            console.error('设置地图视图失败:', error);
          }
        }
      } catch (error) {
        console.error('加载我的足迹失败:', error);
        setFootprintsError(
          (error && error.message) || '加载我的足迹失败，请稍后重试'
        );
      } finally {
        setFootprintsLoading(false);
      }
    };

    loadMapScript()
      .then((AMap) => {
        const createdMap = initMap(AMap);
        if (createdMap) {
          map = createdMap;
          loadVisitedCitiesAndRender(AMap, createdMap);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isUnmounted = true;
      if (map) {
        try {
          map.destroy();
        } catch (e) {
          console.error('销毁地图失败', e);
        }
      }
    };
  }, []);

  return (
    <div
      className="bg-white"
      style={{ position: 'relative', width: '100%', height: '100vh' }}
    >
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-800">
            我的足迹
          </h1>
          <div className="w-6" />
        </div>
      </div>

      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />

      <div className="absolute left-0 right-0 bottom-0 px-4 pb-6">
        <div className="bg-white/90 rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">已点亮中国</span>
            {footprintsLoading && (
              <span className="text-xs text-blue-500">加载中...</span>
            )}
          </div>
          <div className="text-lg font-bold text-gray-800">
            {visitedCities.length} 个城市
          </div>
          {footprintsError ? (
            <div className="mt-1 text-xs text-red-500">{footprintsError}</div>
          ) : visitedCities.length ? (
            <div className="mt-1 text-xs text-gray-600 max-h-10 overflow-hidden">
              {visitedCities.map((city, index) => (
                <span key={city}>
                  <span 
                    onClick={() => handleCityClick(city)}
                    className="cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    {city}
                  </span>
                  {index < visitedCities.length - 1 && '、'}
                </span>
              ))}
            </div>
          ) : (
            !footprintsLoading && (
              <div className="mt-1 text-xs text-gray-400">
                还没有点亮任何城市，去完成一段旅行吧～
              </div>
            )
          )}
        </div>
      </div>

      {/* 城市照片弹窗 */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={closePhotoModal}
        >
          <div 
            className="bg-white rounded-2xl overflow-hidden max-w-[90%] max-h-[80%] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{selectedCity}</h3>
              <button 
                onClick={closePhotoModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-gray-500"></i>
              </button>
            </div>
            
            {/* 弹窗内容 */}
            <div className="p-4">
              {photoLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-sm text-gray-500">加载中...</p>
                </div>
              ) : photoError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <i className="fa-solid fa-image text-4xl text-gray-300 mb-3"></i>
                  <p className="text-sm text-gray-500">{photoError}</p>
                </div>
              ) : cityPhoto ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={cityPhoto.url} 
                    alt={cityPhoto.title || selectedCity}
                    className="max-w-full max-h-[60vh] rounded-lg object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setPhotoError('图片加载失败');
                    }}
                  />
                  {cityPhoto.poiName && (
                    <p className="mt-3 text-sm text-gray-600 text-center">
                      📍 {cityPhoto.poiName}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFootprintsPage;

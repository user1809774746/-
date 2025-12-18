// import React, { useEffect, useRef, useState } from 'react'

// function AMapPage({ onBackToHome }) {
//   const mapContainerRef = useRef(null)
//   const mapRef = useRef(null)
//   const autoCompleteRef = useRef(null)
//   const placeSearchRef = useRef(null)
//   const geolocationRef = useRef(null)

//   const [searchInput, setSearchInput] = useState('')
//   const [suggestions, setSuggestions] = useState([])
//   const [showSuggestions, setShowSuggestions] = useState(false)
//   const [poiList, setPoiList] = useState([])
//   const [showPoiList, setShowPoiList] = useState(false)
//   const [toast, setToast] = useState({ show: false, message: '' })
//   const [countdown, setCountdown] = useState(0)

//   // 显示提示消息
//   const showToast = (msg, ms = 1800) => {
//     setToast({ show: true, message: msg })
//     setTimeout(() => {
//       setToast({ show: false, message: '' })
//     }, ms)
//   }

//   // 初始化地图
//   useEffect(() => {
//     if (!window.AMap) {
//       alert('高德地图 SDK 未加载，请检查网络或替换正确的 Key')
//       return
//     }

//     // 创建地图
//     const map = new window.AMap.Map(mapContainerRef.current, {
//       viewMode: '2D',
//       zoom: 14,
//       center: [116.397428, 39.90923], // 默认北京天安门
//     })
//     mapRef.current = map

//     // 加载插件
//     window.AMap.plugin(['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geolocation'], () => {
//       autoCompleteRef.current = new window.AMap.AutoComplete({ city: '全国' })
//       placeSearchRef.current = new window.AMap.PlaceSearch({ city: '全国', map })
//       geolocationRef.current = new window.AMap.Geolocation({
//         enableHighAccuracy: true,
//         timeout: 10000,
//         position: 'RB',
//       })

//       map.addControl(geolocationRef.current)
//       geolocationRef.current.getCurrentPosition((status, result) => {
//         if (status === 'complete' && result.position) {
//           map.setCenter(result.position)
//           showToast('已定位到当前位置')
//         } else {
//           showToast('定位失败，使用默认位置')
//         }
//       })
//     })

//     return () => {
//       if (map) {
//         map.destroy()
//       }
//     }
//   }, [])

//   // 搜索建议
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       const kw = searchInput.trim()
//       if (!kw) {
//         setShowSuggestions(false)
//         return
//       }

//       if (autoCompleteRef.current) {
//         autoCompleteRef.current.search(kw, (status, result) => {
//           if (status !== 'complete' || !result.tips) {
//             setShowSuggestions(false)
//             return
//           }
//           setSuggestions(result.tips.slice(0, 10))
//           setShowSuggestions(true)
//         })
//       }
//     }, 200)

//     return () => clearTimeout(timer)
//   }, [searchInput])

//   // 执行搜索
//   const doSearch = (keyword) => {
//     if (!keyword) {
//       showToast('请输入关键词')
//       return
//     }
//     if (placeSearchRef.current) {
//       placeSearchRef.current.search(keyword, (status, result) => {
//         if (status === 'complete' && result.poiList) {
//           setPoiList(result.poiList.pois)
//           setShowPoiList(true)
//           showToast(`为你找到 ${result.poiList.count} 条结果`)
//         } else {
//           setShowPoiList(false)
//           showToast('未找到相关结果')
//         }
//       })
//     }
//   }

//   // 点击搜索建议
//   const handleSuggestionClick = (suggestion) => {
//     setSearchInput(suggestion.name || '')
//     setShowSuggestions(false)
//     doSearch(suggestion.name)
//   }

//   // 点击POI
//   const handlePoiClick = (poi) => {
//     if (poi.location && mapRef.current) {
//       const { lng, lat } = poi.location
//       if (!isNaN(lng) && !isNaN(lat)) {
//         mapRef.current.setZoomAndCenter(16, [lng, lat])
//         new window.AMap.Marker({ position: [lng, lat], map: mapRef.current })
//       }
//     }
//   }

//   // 定位当前位置
//   const handleLocate = () => {
//     if (geolocationRef.current && mapRef.current) {
//       geolocationRef.current.getCurrentPosition((status, result) => {
//         if (status === 'complete' && result.position) {
//           mapRef.current.setCenter(result.position)
//           showToast('定位成功')
//         } else {
//           showToast('定位失败')
//         }
//       })
//     }
//   }

//   // 搜索附近景点
//   const handleNearby = () => {
//     if (mapRef.current && placeSearchRef.current) {
//       const center = mapRef.current.getCenter()
//       placeSearchRef.current.searchNearBy('景点', center, 2000, (status, result) => {
//         if (status === 'complete' && result.poiList) {
//           setPoiList(result.poiList.pois)
//           setShowPoiList(true)
//           showToast('已为你查找附近景点')
//         } else {
//           showToast('未找到附近景点')
//         }
//       })
//     }
//   }

//   // 探索附近餐饮
//   const handleExplore = () => {
//     if (mapRef.current && placeSearchRef.current) {
//       const center = mapRef.current.getCenter()
//       placeSearchRef.current.searchNearBy('餐饮', center, 1500, (status, result) => {
//         if (status === 'complete' && result.poiList) {
//           setPoiList(result.poiList.pois)
//           setShowPoiList(true)
//           showToast('探索：附近餐饮')
//         } else {
//           showToast('未找到附近餐饮')
//         }
//       })
//     }
//   }

//   // 分类搜索
//   const handleCategorySearch = (category) => {
//     setSearchInput(category)
//     doSearch(category)
//   }

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
//       {/* 顶部导航栏 */}
//       <header style={{
//         position: 'sticky',
//         top: 0,
//         zIndex: 10,
//         background: 'white',
//         borderBottom: '1px solid #e5e7eb',
//         padding: '10px 12px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between'
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ fontSize: '20px' }}>🗺️</span>
//           <span style={{ fontWeight: 600, fontSize: '16px' }}>好游地图</span>
//         </div>
//         {onBackToHome && (
//           <button
//             onClick={onBackToHome}
//             style={{
//               border: 'none',
//               background: 'transparent',
//               color: '#2a7cf0',
//               fontSize: '14px',
//               padding: '6px 8px',
//               cursor: 'pointer'
//             }}
//           >
//             返回首页
//           </button>
//         )}
//       </header>

//       {/* 搜索栏 */}
//       <div style={{ padding: '12px', background: 'white', position: 'relative', zIndex: 9 }}>
//         <div style={{ display: 'flex', gap: '8px' }}>
//           <input
//             type="text"
//             placeholder="搜索地点、景点、餐厅..."
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             style={{
//               flex: 1,
//               height: '40px',
//               padding: '8px 12px',
//               border: '1px solid #e5e7eb',
//               borderRadius: '8px',
//               fontSize: '14px'
//             }}
//           />
//           <button
//             onClick={() => doSearch(searchInput)}
//             style={{
//               height: '40px',
//               padding: '0 20px',
//               border: 'none',
//               borderRadius: '8px',
//               background: '#2a7cf0',
//               color: 'white',
//               fontWeight: 600,
//               cursor: 'pointer'
//             }}
//           >
//             搜索
//           </button>
//         </div>

//         {/* 搜索建议列表 */}
//         {showSuggestions && (
//           <div style={{
//             position: 'absolute',
//             top: '60px',
//             left: '12px',
//             right: '12px',
//             background: 'white',
//             border: '1px solid #e5e7eb',
//             borderRadius: '8px',
//             maxHeight: '300px',
//             overflowY: 'auto',
//             boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//             zIndex: 20
//           }}>
//             {suggestions.map((tip, idx) => (
//               <div
//                 key={idx}
//                 onClick={() => handleSuggestionClick(tip)}
//                 style={{
//                   padding: '12px',
//                   borderBottom: idx < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
//                   cursor: 'pointer'
//                 }}
//                 onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
//                 onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
//               >
//                 <div style={{ fontWeight: 500 }}>{tip.name || ''}</div>
//                 <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
//                   {tip.district || ''} {tip.address || ''}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* 分类快速搜索 */}
//         <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
//           {['景点', '餐厅', '酒店', '购物', '地铁'].map((cat) => (
//             <button
//               key={cat}
//               onClick={() => handleCategorySearch(cat)}
//               style={{
//                 padding: '6px 12px',
//                 border: '1px solid #e5e7eb',
//                 borderRadius: '999px',
//                 background: '#eef5ff',
//                 color: '#2a7cf0',
//                 fontSize: '13px',
//                 fontWeight: 500,
//                 cursor: 'pointer'
//               }}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* 地图容器 */}
//       <div
//         ref={mapContainerRef}
//         style={{
//           width: '100%',
//           height: 'calc(100vh - 180px)',
//           position: 'relative'
//         }}
//       />

//       {/* POI列表 */}
//       {showPoiList && (
//         <div style={{
//           position: 'fixed',
//           bottom: 0,
//           left: 0,
//           right: 0,
//           maxHeight: '40vh',
//           overflowY: 'auto',
//           background: 'white',
//           borderTop: '1px solid #e5e7eb',
//           zIndex: 8,
//           padding: '12px'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
//             <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>搜索结果</h3>
//             <button
//               onClick={() => setShowPoiList(false)}
//               style={{
//                 border: 'none',
//                 background: 'transparent',
//                 fontSize: '20px',
//                 cursor: 'pointer',
//                 padding: '4px'
//               }}
//             >
//               ×
//             </button>
//           </div>
//           {poiList.map((poi, idx) => (
//             <div
//               key={idx}
//               onClick={() => handlePoiClick(poi)}
//               style={{
//                 padding: '12px',
//                 borderBottom: idx < poiList.length - 1 ? '1px solid #f3f4f6' : 'none',
//                 cursor: 'pointer'
//               }}
//               onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
//               onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
//             >
//               <div style={{ fontWeight: 500, marginBottom: '4px' }}>{poi.name || ''}</div>
//               <div style={{ fontSize: '12px', color: '#6b7280' }}>{poi.address || ''}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* 浮动操作按钮 */}
//       <div style={{
//         position: 'fixed',
//         right: '16px',
//         bottom: '100px',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '12px',
//         zIndex: 9
//       }}>
//         <button
//           onClick={handleLocate}
//           title="定位"
//           style={{
//             width: '48px',
//             height: '48px',
//             borderRadius: '50%',
//             border: 'none',
//             background: 'white',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//             cursor: 'pointer',
//             fontSize: '20px'
//           }}
//         >
//           📍
//         </button>
//         <button
//           onClick={handleNearby}
//           title="附近景点"
//           style={{
//             width: '48px',
//             height: '48px',
//             borderRadius: '50%',
//             border: 'none',
//             background: 'white',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//             cursor: 'pointer',
//             fontSize: '20px'
//           }}
//         >
//           🏛️
//         </button>
//       </div>

//       {/* 底部导航栏 */}
//       <div style={{
//         position: 'fixed',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         height: '60px',
//         background: 'white',
//         borderTop: '1px solid #e5e7eb',
//         display: 'flex',
//         justifyContent: 'space-around',
//         alignItems: 'center',
//         zIndex: 10
//       }}>
//         <button
//           onClick={handleExplore}
//           style={{
//             border: 'none',
//             background: 'transparent',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: '4px',
//             cursor: 'pointer',
//             fontSize: '12px',
//             color: '#6b7280'
//           }}
//         >
//           <span style={{ fontSize: '20px' }}>🔍</span>
//           探索
//         </button>
//         <button
//           style={{
//             border: 'none',
//             background: 'transparent',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: '4px',
//             cursor: 'pointer',
//             fontSize: '12px',
//             color: '#6b7280'
//           }}
//         >
//           <span style={{ fontSize: '20px' }}>⭐</span>
//           收藏
//         </button>
//         <button
//           style={{
//             border: 'none',
//             background: 'transparent',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: '4px',
//             cursor: 'pointer',
//             fontSize: '12px',
//             color: '#6b7280'
//           }}
//         >
//           <span style={{ fontSize: '20px' }}>👤</span>
//           我的
//         </button>
//       </div>

//       {/* Toast提示 */}
//       {toast.show && (
//         <div style={{
//           position: 'fixed',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           background: 'rgba(0,0,0,0.7)',
//           color: 'white',
//           padding: '12px 24px',
//           borderRadius: '8px',
//           zIndex: 999,
//           fontSize: '14px'
//         }}>
//           {toast.message}
//         </div>
//       )}
//     </div>
//   )
// }

// export default AMapPage


import React, { useEffect, useRef } from 'react';
import amapConfig from '../config/amapConfig';

const AMapPage = () => {
  const mapContainer = useRef(null);
  const panelContainer = useRef(null);
  
  useEffect(() => {
    // 配置安全密钥（必须在加载API前配置）
    window._AMapSecurityConfig = {
      securityJsCode: amapConfig.securityKey,
    };

    // 加载高德地图JS API
    const loadMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.AMap) {
          resolve(window.AMap);
          return;
        }
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        // 注意：v2.0及以上版本必须配置安全密钥
        script.src = amapConfig.getApiUrl(['AMap.Driving', 'AMap.Adaptor']);
        script.onload = () => {
          if (window.AMap) {
            resolve(window.AMap);
          } else {
            reject(new Error('高德地图API加载失败'));
          }
        };
        script.onerror = () => reject(new Error('高德地图API加载出错'));
        document.head.appendChild(script);
        
        return () => {
          document.head.removeChild(script);
        };
      });
    };

    // 初始化地图（与之前保持一致）
    const initMap = (AMap) => {
      const map = new AMap.Map(mapContainer.current, {
        resizeEnable: true,
        center: [116.397428, 39.90923],
        zoom: 13
      });

      const driving = new AMap.Driving({
        map: map,
        panel: panelContainer.current
      });

      driving.search(
        new AMap.LngLat(116.379028, 39.865042), 
        new AMap.LngLat(116.427281, 39.903719), 
        (status, result) => {
          if (status === 'complete') {
            console.log('绘制驾车路线完成');
            map.setCenter([116.442581, 39.882498]);
          } else {
            console.error('获取驾车数据失败：', result);
          }
        }
      );
    };

    loadMapScript()
      .then(AMap => initMap(AMap))
      .catch(error => console.error(error));

  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      <div 
        ref={panelContainer}
        style={{
          position: 'fixed',
          backgroundColor: 'white',
          maxHeight: '90%',
          overflowY: 'auto',
          top: '10px',
          right: '10px',
          width: '280px',
          zIndex: 100
        }}
      />
      <link rel="stylesheet" href="https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css" />
      <script src="https://a.amap.com/jsapi_demos/static/demo-center/js/demoutils.js"></script>
      <script src="https://cache.amap.com/lbs/static/addToolbar.js"></script>
    </div>
  );
};

export default AMapPage;

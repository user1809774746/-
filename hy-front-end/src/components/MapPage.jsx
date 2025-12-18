// // import React, { useEffect, useState } from 'react'
// // import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
// // import L from 'leaflet'

// // // 修复 Leaflet 图标问题
// // import icon from 'leaflet/dist/images/marker-icon.png'
// // import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// // let DefaultIcon = L.divIcon({
// //   html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
// //   iconSize: [20, 20],
// //   iconAnchor: [10, 10]
// // })

// // L.Marker.prototype.options.icon = DefaultIcon

// // const MapPage = ({ routeData, onBackToHome }) => {
// //   const [mapCenter, setMapCenter] = useState([39.9042, 116.4074]) // 默认北京
// //   const [startCoords, setStartCoords] = useState(null)
// //   const [endCoords, setEndCoords] = useState(null)

// //   useEffect(() => {
// //     // 模拟地址解析为坐标
// //     const parseLocation = (location) => {
// //       // 这里应该调用地理编码API，现在用模拟数据
// //       if (location.includes(',')) {
// //         const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()))
// //         if (!isNaN(lat) && !isNaN(lng)) {
// //           return [lat, lng]
// //         }
// //       }
      
// //       // 模拟一些常见地点的坐标
// //       const mockLocations = {
// //         '北京': [39.9042, 116.4074],
// //         '上海': [31.2304, 121.4737],
// //         '广州': [23.1291, 113.2644],
// //         '深圳': [22.5431, 114.0579],
// //         '杭州': [30.2741, 120.1551],
// //         '南京': [32.0603, 118.7969],
// //       }
      
// //       for (const [city, coords] of Object.entries(mockLocations)) {
// //         if (location.includes(city)) {
// //           return coords
// //         }
// //       }
      
// //       // 默认返回北京附近的随机位置
// //       return [
// //         39.9042 + (Math.random() - 0.5) * 0.1,
// //         116.4074 + (Math.random() - 0.5) * 0.1
// //       ]
// //     }

// //     if (routeData) {
// //       const start = parseLocation(routeData.start)
// //       const end = parseLocation(routeData.end)
      
// //       setStartCoords(start)
// //       setEndCoords(end)
      
// //       // 设置地图中心为起点和终点的中点
// //       const centerLat = (start[0] + end[0]) / 2
// //       const centerLng = (start[1] + end[1]) / 2
// //       setMapCenter([centerLat, centerLng])
// //     }
// //   }, [routeData])

// //   return (
// //     <div className="h-screen flex flex-col">
// //       {/* 顶部导航栏 */}
// //       <div className="bg-white shadow-sm z-10 relative">
// //         <div className="flex items-center justify-between px-4 py-3">
// //           <button
// //             onClick={onBackToHome}
// //             className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
// //           >
// //             <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
// //             </svg>
// //             返回
// //           </button>
// //           <h1 className="text-lg font-semibold text-gray-800">路线规划</h1>
// //           <div className="w-12"></div>
// //         </div>
// //       </div>

// //       {/* 路线信息栏 */}
// //       {routeData && (
// //         <div className="bg-white border-b px-4 py-3 z-10 relative">
// //           <div className="space-y-2">
// //             <div className="flex items-center text-sm">
// //               <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
// //               <span className="text-gray-600">起点：</span>
// //               <span className="text-gray-800 ml-1">{routeData.start}</span>
// //             </div>
// //             <div className="flex items-center text-sm">
// //               <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
// //               <span className="text-gray-600">终点：</span>
// //               <span className="text-gray-800 ml-1">{routeData.end}</span>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* 地图容器 */}
// //       <div className="flex-1 relative">
// //         <MapContainer
// //           center={mapCenter}
// //           zoom={12}
// //           style={{ height: '100%', width: '100%' }}
// //           className="z-0"
// //         >
// //           <TileLayer
// //             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// //             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// //           />
          
// //           {/* 起点标记 */}
// //           {startCoords && (
// //             <Marker position={startCoords}>
// //               <Popup>
// //                 <div className="text-center">
// //                   <div className="font-semibold text-green-600">起点</div>
// //                   <div className="text-sm text-gray-600">{routeData?.start}</div>
// //                 </div>
// //               </Popup>
// //             </Marker>
// //           )}
          
// //           {/* 终点标记 */}
// //           {endCoords && (
// //             <Marker position={endCoords}>
// //               <Popup>
// //                 <div className="text-center">
// //                   <div className="font-semibold text-red-600">终点</div>
// //                   <div className="text-sm text-gray-600">{routeData?.end}</div>
// //                 </div>
// //               </Popup>
// //             </Marker>
// //           )}
// //         </MapContainer>
// //       </div>

// //       {/* 底部操作栏 */}
// //       <div className="bg-white border-t px-4 py-3 z-10 relative">
// //         <div className="flex space-x-3">
// //           <button className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors">
// //             开始导航
// //           </button>
// //           <button className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
// //             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
// //             </svg>
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // export default MapPage
// import React, { useEffect, useRef, useState } from 'react';
// import amapConfig from '../config/amapConfig';
// import { useSVGOverlay } from 'react-leaflet/SVGOverlay';

// const MapPage = ({ routeData, onBackToHome,onNavigateToMine,onNavigateToDiscover }) => {
//   const mapContainer = useRef(null);
//   const panelContainer = useRef(null);
//   const [isPanelVisible,setIsPanelVisible]=useState(true);//控制面板隐藏
  
//   // 获取坐标：优先使用AI返回的坐标，否则使用默认坐标或城市匹配
//   const getCoordinates = (data) => {
//     // 如果有AI返回的坐标，直接使用
//     if (data?.coordinates?.origin?.lngLat && data?.coordinates?.destination?.lngLat) {
//       return {
//         startCoords: {
//           lng: data.coordinates.origin.lngLat[0],
//           lat: data.coordinates.origin.lngLat[1]
//         },
//         endCoords: {
//           lng: data.coordinates.destination.lngLat[0],
//           lat: data.coordinates.destination.lngLat[1]
//         }
//       };
//     }
    
//     // 否则尝试根据地址名称匹配坐标
//     const locationMap = {
//       '北京': { lng: 116.4074, lat: 39.9042 },
//       '天安门': { lng: 116.397428, lat: 39.90923 },
//       '长城': { lng: 116.379028, lat: 40.359461 },
//       '故宫': { lng: 116.397128, lat: 39.917544 },
//       '上海': { lng: 121.4737, lat: 31.2304 },
//       '外滩': { lng: 121.490317, lat: 31.241039 },
//       '东方明珠': { lng: 121.499763, lat: 31.239666 },
//       '广州': { lng: 113.2644, lat: 23.1291 },
//       '深圳': { lng: 114.0579, lat: 22.5431 },
//       '杭州': { lng: 120.1551, lat: 30.2741 },
//       '西湖': { lng: 120.148969, lat: 30.242865 },
//       '南京': { lng: 118.7969, lat: 32.0603 }
//     };
    
//     // 尝试从地址中匹配关键词
//     const findCoords = (address) => {
//       for (const [key, coords] of Object.entries(locationMap)) {
//         if (address && address.includes(key)) {
//           return coords;
//         }
//       }
//       // 默认返回北京市中心
//       return { lng: 116.4074, lat: 39.9042 };
//     };
    
//     return {
//       startCoords: findCoords(data?.start),
//       endCoords: findCoords(data?.end)
//     };
//   };

//   useEffect(() => {
//     // 配置安全密钥（必须在加载API前配置）
//     window._AMapSecurityConfig = {
//       securityJsCode: amapConfig.securityKey,
//     };
//     console.log('初始化securityKey');

//     // 加载高德地图JS API
//     const loadMapScript = () => {
//       return new Promise((resolve, reject) => {
//         if (window.AMap) {
//           resolve(window.AMap);
//           return;
//         }
        
//         const script = document.createElement('script');
//         script.type = 'text/javascript';
//         script.src = amapConfig.getApiUrl(['AMap.Driving']);
//         script.onload = () => {
//           if (window.AMap) {
//             console.log('✅ 高德地图API加载成功');
//             resolve(window.AMap);
//           } else {
//             reject(new Error('高德地图API加载失败'));
//           }
//         };
//         script.onerror = () => {
//           console.error('❌ 高德地图API加载失败，请检查API Key是否正确');
//           console.error('配置文件位置: src/config/amapConfig.js');
//           console.error('获取API Key: https://lbs.amap.com/');
//           reject(new Error('高德地图API加载出错，请检查API Key配置'));
//         };
//         document.head.appendChild(script);
        
//         return () => {
//           document.head.removeChild(script);
//         };
//       });
//     };

//     // 初始化地图
//     const initMap = (AMap) => {
//       // 获取起点和终点坐标
//       const { startCoords, endCoords } = getCoordinates(routeData);
      
//       console.log('MapPage - 路线数据:', routeData);
//       console.log('MapPage - 起点坐标:', startCoords);
//       console.log('MapPage - 终点坐标:', endCoords);
      
//       // 计算地图中心点
//       const centerLng = (startCoords.lng + endCoords.lng) / 2;
//       const centerLat = (startCoords.lat + endCoords.lat) / 2;
      
//       // 清除可能存在的旧地图容器内容
//       if (mapContainer.current) {
//         mapContainer.current.innerHTML = '';
//       }
      
//       const map = new AMap.Map(mapContainer.current, {
//         center: [centerLng, centerLat],
//         zoom: 13,
//         resizeEnable: true,
//         dragEnable: true,
//         zoomEnable: true,
//         doubleClickZoom: false,      // 禁用双击缩放
//         keyboardEnable: false,       // 禁用键盘操作
//         jogEnable: false,            // 禁用地图惯性移动
//         scrollWheel: true,           // 启用滚轮缩放
//         touchZoom: true,             // 启用触摸缩放
//         animateEnable: false         // 禁用动画
//       });

//       // 等待地图完全加载后再初始化驾车路线
//       map.on('complete', () => {
        
//         AMap.plugin('AMap.Walking',function(){
//           const walking=new AMap.Walking({
//             map:map,
//             panel:panelContainer.current
//           });

//           walking.search(
//             new AMap.LngLat(startCoords.lng, startCoords.lat),
//             new AMap.LngLat(endCoords.lng, endCoords.lat),
//             (status,result)=>{
//               if(status==='complete'){
//                 console.log('✅ 步行路线规划成功', result);
//                 console.log('步行距离:', result.routes[0].distance, '米');
//                 console.log('预计时间:', Math.round(result.routes[0].time/60), '分钟');
//                 // 自动调整视野
//                 try {
//                   map.setFitView();
//                 } catch (error) {
//                   console.warn('地图视野调整失败:', error);
//                 }
//               } else {
//                 console.error('❌ 步行路线规划失败:', result);
//               }
//             }
//           )
//         })
//         //骑行
//         AMap.plugin('AMap.Riding',function(){
//           const riding=new AMap.Riding({
//             map:map,
//             panel:panelContainer.current
//           });
//           riding.search(
//             new AMap.LngLat(startCoords.lng,startCoords.lat),
//             new AMap.LngLat(endCoords.lng,endCoords.lat),
//             (status,result)=>{
//               if(status==='complete'){
//                 console.log('✅ 骑行规划路线成功');
//                 console.log('骑行距离',result.routes[0].distance,'米');
//                 console.log('预计时间',Math.round(result.routes[0].time/60),'分钟');
//                 try{
//                   map.setFitView();
//                 }catch(error){
//                   console.warn('地图视野调整失败:',error);
//                 }
//               }else{
//                 console.error('❌ 骑行规划路线失败:', result);
//               }
//             }
//           )
//         })

        
//         //公交车
//         AMap.plugin('AMap.Transfer',function(){
//           // 从起点地址中提取城市名称
//           //直接使用ai返回的城市名
//           const originCity=routeData?.coordinates?.origin?.city;
//           const destinationCity=routeData?.coordinates?.destination?.city;
//           console.log('🚌 公交规划 - 起点城市:', originCity);
//           console.log('🚌 公交规划 - 终点城市:', destinationCity);
          
//           const isCrossCity=originCity!==destinationCity;
//           if(isCrossCity){
//             console.log('跨城公交规划路线');
//           }else{
//             console.log('同城公交规划路线');
//           }
          
//           const transfer=new AMap.Transfer({
//             map:map,
//             panel:panelContainer.current,
//             city: originCity,
//             cityb:destinationCity // ⭐ 必须指定城市！
//           });
//           transfer.search(
//             new AMap.LngLat(startCoords.lng,startCoords.lat),
//             new AMap.LngLat(endCoords.lng,endCoords.lat),
//             (status,result)=>{
//               if(status==='complete'){
//                 console.log('✅ 公交地铁路线完成');
//                 console.log('地铁路线数据',result);
//                 try{
//                   map.setFitView();
//                 }catch(error){
//                   console.warn('地图视野调整失败',error);
//                 }
//               }else{
//                 console.error('❌ 公交地铁规划路线失败:', result);
//                 if(isCrossCity){
//                   console.log('💡 提示：跨城公交路线有限，建议考虑火车或飞机');
//                 }
//               }
//             }
//           )
//         })

//         // 先加载驾车路线插件
//         AMap.plugin('AMap.Driving', function() {
//           const driving = new AMap.Driving({
//             map: map,
//             panel: panelContainer.current
//           });

//           driving.search(
//             new AMap.LngLat(startCoords.lng, startCoords.lat), 
//             new AMap.LngLat(endCoords.lng, endCoords.lat), 
//             (status, result) => {
//               if (status === 'complete') {
//                 console.log('✅ 绘制驾车路线完成');
//                 try {
//                   // 自动调整视野以显示完整路线
//                   map.setFitView();
//                 } catch (error) {
//                   console.warn('地图视野调整失败:', error);
//                 }
//               } else {
//                 console.error('❌ 获取驾车数据失败：', result);
//               }
//             }
//           );
//         });
//       });
//     };

//     loadMapScript()
//       .then(AMap => initMap(AMap))
//       .catch(error => console.error(error));

//   }, []);

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
//       {/* 返回按钮 */}
//       {onBackToHome && (
//         <button
//           onClick={onBackToHome}
//           style={{
//             position: 'fixed',
//             top: '20px',
//             left: '10px',
//             zIndex: 1000,
//             backgroundColor: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             padding: '10px 20px',
//             fontSize: '16px',
//             cursor: 'pointer',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '8px'
//           }}
//         >
//           <span>←</span>
//           <span>返回</span>
//         </button>
//       )}
      
//       {/* 路线信息 */}
//       {routeData && (
//         <div style={{
//           position: 'fixed',
//           top: '20px',
//           left: '60%',
//           transform: 'translateX(-50%)',
//           zIndex: 1000,
//           width:'65%',
//           backgroundColor: 'white',
//           borderRadius: '8px',
//           padding: '15px 20px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//           fontSize: '14px'
//         }}>
//           <div style={{ marginBottom: '4px'}}>
//             <span style={{ color: '#22c55e', marginRight: '8px' }}>●</span>
//             起点: {routeData.start}
//           </div>
//           <div>
//             <span style={{ color: '#ef4444', marginRight: '8px' }}>●</span>
//             终点: {routeData.end}
//           </div>
//         </div>
//       )}
      
//       <div ref={mapContainer} style={{ width: '100%', height: '85%' }} />
//       <div style={{position:'fixed',top:'150px',right:isPanelVisible?'0':'-280px',backgroundColor:'white',width:'280px',transition:'right 0.3s ease-in-out',zIndex:100}}>
//         <button onClick={()=>setIsPanelVisible(!isPanelVisible)} 
//         style={{position:'absolute',
//         left:'-30px',
//         transform:'translateX(-30%)',
//         backgroundColor:'white',
//         border:'1px solid #ddd',
//         borderRadius:'8px 0 0 8px',
//         width:'40px',
//         height:'60px',
//         cursor:'pointer',
//         display:'flex',
//         alignItems:'center',
//         justifyContent:'center',
//         fontSize:'20px',
//         // fontWeight:'bold',
//         boxShadow:'-2px 2px 8px rgba(0,0,0,0.1)',
//         zIndex:101}}>
//           {isPanelVisible?'>':'<'}
//           </button>
//       <div 
//         ref={panelContainer}
//         style={{
//           position: 'relative',
//           backgroundColor: 'white',
//           maxHeight: '50vh',
//           overflowY: 'auto',
//           // top: '100px',
//           // right: '10px',
//           width: '100%',
//           padding:'10px'
//           // zIndex: 100
//         }}
//       /> 
//       </div>


//       {/* 底部 */}
//       <div style={{
//         position:'fixed',
//         bottom:'50px',
//         backgroundColor:'white',
//         width:'100%',
//         height:'80px'

//         }}>
//         <button className='fixed bg-blue-600 text-white w-[50%] h-[50px] left-[25%]'>开始导航</button>
//       </div>


//       {/* Bottom Navigation */}
//       <div className="fixed mt-10px bottom-0 left-0 right-0 z-20 flex items-center justify-around p-3 bg-white border-t border-gray-200">
//         <div className="flex flex-col items-center">
//           <i className="text-xl text-gray-400 fa-solid fa-house" onClick={onBackToHome}></i>
//           <span className="text-xs text-gray-400">首页</span>
//         </div>
//         {/* <div className="flex flex-col items-center">
//           <i className="text-xl text-blue-600 fa-solid fa-route"></i>
//           <span className="text-xs text-blue-600">路线</span>
//         </div> */}
//         <div className="flex flex-col items-center" onClick={onNavigateToDiscover}>
//           <i className="text-xl text-gray-400 fa-solid fa-map"></i>
//           <span className="text-xs text-gray-400">发现</span>
//         </div>
//         <div className="flex flex-col items-center" onClick={onNavigateToMine}>
//           <i className="text-xl text-gray-400 fa-solid fa-user"></i>
//           <span className="text-xs text-gray-400">我的</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapPage;


// import React, { useEffect, useState } from 'react'
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
// import L from 'leaflet'

// // 修复 Leaflet 图标问题
// import icon from 'leaflet/dist/images/marker-icon.png'
// import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// let DefaultIcon = L.divIcon({
//   html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
//   iconSize: [20, 20],
//   iconAnchor: [10, 10]
// })

// L.Marker.prototype.options.icon = DefaultIcon

// const MapPage = ({ routeData, onBackToHome }) => {
//   const [mapCenter, setMapCenter] = useState([39.9042, 116.4074]) // 默认北京
//   const [startCoords, setStartCoords] = useState(null)
//   const [endCoords, setEndCoords] = useState(null)

//   useEffect(() => {
//     // 模拟地址解析为坐标
//     const parseLocation = (location) => {
//       // 这里应该调用地理编码API，现在用模拟数据
//       if (location.includes(',')) {
//         const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()))
//         if (!isNaN(lat) && !isNaN(lng)) {
//           return [lat, lng]
//         }
//       }
      
//       // 模拟一些常见地点的坐标
//       const mockLocations = {
//         '北京': [39.9042, 116.4074],
//         '上海': [31.2304, 121.4737],
//         '广州': [23.1291, 113.2644],
//         '深圳': [22.5431, 114.0579],
//         '杭州': [30.2741, 120.1551],
//         '南京': [32.0603, 118.7969],
//       }
      
//       for (const [city, coords] of Object.entries(mockLocations)) {
//         if (location.includes(city)) {
//           return coords
//         }
//       }
      
//       // 默认返回北京附近的随机位置
//       return [
//         39.9042 + (Math.random() - 0.5) * 0.1,
//         116.4074 + (Math.random() - 0.5) * 0.1
//       ]
//     }

//     if (routeData) {
//       const start = parseLocation(routeData.start)
//       const end = parseLocation(routeData.end)
      
//       setStartCoords(start)
//       setEndCoords(end)
      
//       // 设置地图中心为起点和终点的中点
//       const centerLat = (start[0] + end[0]) / 2
//       const centerLng = (start[1] + end[1]) / 2
//       setMapCenter([centerLat, centerLng])
//     }
//   }, [routeData])

//   return (
//     <div className="h-screen flex flex-col">
//       {/* 顶部导航栏 */}
//       <div className="bg-white shadow-sm z-10 relative">
//         <div className="flex items-center justify-between px-4 py-3">
//           <button
//             onClick={onBackToHome}
//             className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
//           >
//             <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//             返回
//           </button>
//           <h1 className="text-lg font-semibold text-gray-800">路线规划</h1>
//           <div className="w-12"></div>
//         </div>
//       </div>

//       {/* 路线信息栏 */}
//       {routeData && (
//         <div className="bg-white border-b px-4 py-3 z-10 relative">
//           <div className="space-y-2">
//             <div className="flex items-center text-sm">
//               <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
//               <span className="text-gray-600">起点：</span>
//               <span className="text-gray-800 ml-1">{routeData.start}</span>
//             </div>
//             <div className="flex items-center text-sm">
//               <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
//               <span className="text-gray-600">终点：</span>
//               <span className="text-gray-800 ml-1">{routeData.end}</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 地图容器 */}
//       <div className="flex-1 relative">
//         <MapContainer
//           center={mapCenter}
//           zoom={12}
//           style={{ height: '100%', width: '100%' }}
//           className="z-0"
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
          
//           {/* 起点标记 */}
//           {startCoords && (
//             <Marker position={startCoords}>
//               <Popup>
//                 <div className="text-center">
//                   <div className="font-semibold text-green-600">起点</div>
//                   <div className="text-sm text-gray-600">{routeData?.start}</div>
//                 </div>
//               </Popup>
//             </Marker>
//           )}
          
//           {/* 终点标记 */}
//           {endCoords && (
//             <Marker position={endCoords}>
//               <Popup>
//                 <div className="text-center">
//                   <div className="font-semibold text-red-600">终点</div>
//                   <div className="text-sm text-gray-600">{routeData?.end}</div>
//                 </div>
//               </Popup>
//             </Marker>
//           )}
//         </MapContainer>
//       </div>

//       {/* 底部操作栏 */}
//       <div className="bg-white border-t px-4 py-3 z-10 relative">
//         <div className="flex space-x-3">
//           <button className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors">
//             开始导航
//           </button>
//           <button className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default MapPage
import React, { useEffect, useRef, useState } from 'react';
import amapConfig from '../config/amapConfig';
import { useSVGOverlay } from 'react-leaflet/SVGOverlay';

const MapPage = ({ routeData, onBackToHome,onNavigateToMine,onNavigateToDiscover,onNavigateToCommunity }) => {
  const mapContainer = useRef(null);
  const panelContainer = useRef(null);
  const [isPanelVisible,setIsPanelVisible]=useState(true);//控制面板隐藏
  // 新增：存储用户选择的出行方式和导航策略（根据你的实际交互逻辑修改默认值）
  const [travelMode, setTravelMode] = useState('car'); // car:驾车, bus:公交, walk:步行, ride:骑行
  // 导航策略：驾车(0最快/1最短/3躲避拥堵/4不走高速/5高速优先) 公交(0最快/1最少换乘/2最省钱/3步行最少)
  const [naviStrategy, setNaviStrategy] = useState(0); // 默认：最快路线

  // 监听出行方式变化，自动重置导航策略为默认值
  useEffect(() => {
    setNaviStrategy(0); // 切换出行方式时重置为"最快路线"
  }, [travelMode]);

  
  // 获取坐标：优先使用AI返回的坐标，否则使用默认坐标或城市匹配
  const getCoordinates = (data) => {
    console.log('🔍 MapPage getCoordinates - 接收到的数据:', data);
    console.log('🔍 MapPage getCoordinates - coordinates字段:', data?.coordinates);
    
    // 处理从goHomePage传递的数据结构
    if (data?.coordinates?.start && data?.coordinates?.end) {
      const result = {
        startCoords: {
          lng: data.coordinates.start.lng,
          lat: data.coordinates.start.lat,
          name: data.from // 起点名称
        },
        endCoords: {
          lng: data.coordinates.end.lng,
          lat: data.coordinates.end.lat,
          name: data.to // 终点名称
        }
      };
      console.log('✅ 使用AI返回的坐标 (start/end格式):', result);
      return result;
    }
    
    // 兼容原有的数据结构
    if (data?.coordinates?.origin?.lngLat && data?.coordinates?.destination?.lngLat) {
      return {
        startCoords: {
          lng: data.coordinates.origin.lngLat[0],
          lat: data.coordinates.origin.lngLat[1],
          name: data.start || data.from // 起点名称
        },
        endCoords: {
          lng: data.coordinates.destination.lngLat[0],
          lat: data.coordinates.destination.lngLat[1],
          name: data.end || data.to // 终点名称
        }
      };
    }
    
    // 否则尝试根据地址名称匹配坐标
    const locationMap = {
      '北京': { lng: 116.4074, lat: 39.9042 },
      '天安门': { lng: 116.397428, lat: 39.90923 },
      '长城': { lng: 116.379028, lat: 40.359461 },
      '故宫': { lng: 116.397128, lat: 39.917544 },
      '上海': { lng: 121.4737, lat: 31.2304 },
      '外滩': { lng: 121.490317, lat: 31.241039 },
      '东方明珠': { lng: 121.499763, lat: 31.239666 },
      '广州': { lng: 113.2644, lat: 23.1291 },
      '深圳': { lng: 114.0579, lat: 22.5431 },
      '杭州': { lng: 120.1551, lat: 30.2741 },
      '西湖': { lng: 120.148969, lat: 30.242865 },
      '南京': { lng: 118.7969, lat: 32.0603 }
    };
    
    // 尝试从地址中匹配关键词
    const findCoords = (address) => {
      for (const [key, coords] of Object.entries(locationMap)) {
        if (address && address.includes(key)) {
          return coords;
        }
      }
      // 默认返回北京市中心
      return { lng: 116.4074, lat: 39.9042 };
    };
    
    return {
      startCoords: findCoords(data?.from || data?.start),
      endCoords: findCoords(data?.to || data?.end)
    };
  };
   // 新增：点击开始导航的处理函数
   const handleStartNavigation = () => {
    if (!routeData) return;

    // 1. 获取起点、终点坐标和名称
    const { startCoords, endCoords } = getCoordinates(routeData);
    if (!startCoords || !endCoords) {
      alert('无法获取导航坐标，请检查地址');
      return;
    }

    // 2. 映射出行方式到高德参数（t参数：0=驾车，1=公交，2=步行，3=骑行）
    const modeMap = {
      'car': 0,
      'bus': 1,
      'walk': 2,
      'ride': 3
    };
    const amapMode = modeMap[travelMode] || 0;

    // 3. 映射导航策略到高德参数（policy参数：仅驾车/公交有效，步行/骑行忽略）
    // 驾车：0=最快 1=最短 3=躲避拥堵 4=不走高速 5=高速优先
    // 公交：0=最快 1=最少换乘 2=最省钱 3=步行最少
    const policyParam = naviStrategy;

    // 4. 构造高德App唤醒链接（URL Scheme）
    const appScheme = `amapuri://route/plan/?` +
      `sourceApplication=好游&` +           // 自定义应用名
      `slat=${startCoords.lat}&` +         // 起点纬度
      `slng=${startCoords.lng}&` +         // 起点经度
      `sname=${encodeURIComponent(startCoords.name)}&` + // 起点名称（编码中文）
      `dlat=${endCoords.lat}&` +           // 终点纬度
      `dlng=${endCoords.lng}&` +           // 终点经度
      `dname=${encodeURIComponent(endCoords.name)}&` + // 终点名称（编码中文）
      `dev=0&` +                            // 正式模式
      `t=${amapMode}&` +                    // 出行方式
      `policy=${policyParam}`;              // 导航策略

    // 5. 构造Web兜底链接（未安装App时跳转）
    // 注意：高德Web API坐标格式为 经度,纬度（lng,lat）
    const webUrl = `https://uri.amap.com/navigation?` +
      `from=${startCoords.lng},${startCoords.lat},${encodeURIComponent(startCoords.name)}&` +
      `to=${endCoords.lng},${endCoords.lat},${encodeURIComponent(endCoords.name)}&` +
      `mode=${travelMode}&` + // 出行方式（car/bus/walk/ride）
      `policy=${policyParam}&` + // 导航策略
      `src=好游`;

    // 6. 尝试唤醒高德App，失败则跳转Web页
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = appScheme;
      document.body.appendChild(iframe);

      // 300ms后检测是否唤醒成功，失败则跳转Web页
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.location.href = webUrl;
      }, 300);
    } else {
      // PC端直接跳转Web页
      window.location.href = webUrl;
    }
  };

  useEffect(() => {
    // 配置安全密钥（必须在加载API前配置）
    window._AMapSecurityConfig = {
      securityJsCode: amapConfig.securityKey,
    };
    console.log('初始化securityKey');

    // 加载高德地图JS API
    const loadMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.AMap) {
          resolve(window.AMap);
          return;
        }
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = amapConfig.getApiUrl(['AMap.Driving']);
        script.onload = () => {
          if (window.AMap) {
            console.log('✅ 高德地图API加载成功');
            resolve(window.AMap);
          } else {
            reject(new Error('高德地图API加载失败'));
          }
        };
        script.onerror = () => {
          console.error('❌ 高德地图API加载失败，请检查API Key是否正确');
          console.error('配置文件位置: src/config/amapConfig.js');
          console.error('获取API Key: https://lbs.amap.com/');
          reject(new Error('高德地图API加载出错，请检查API Key配置'));
        };
        document.head.appendChild(script);
        
        return () => {
          document.head.removeChild(script);
        };
      });
    };

    // 初始化地图
    const initMap = (AMap) => {
      // 获取起点和终点坐标
      const { startCoords, endCoords } = getCoordinates(routeData);
      
      console.log('MapPage - 路线数据:', routeData);
      console.log('MapPage - 起点坐标:', startCoords);
      console.log('MapPage - 终点坐标:', endCoords);
      
      // 计算地图中心点
      const centerLng = (startCoords.lng + endCoords.lng) / 2;
      const centerLat = (startCoords.lat + endCoords.lat) / 2;
      
      // 清除可能存在的旧地图容器内容
      if (mapContainer.current) {
        mapContainer.current.innerHTML = '';
      }
      
      const map = new AMap.Map(mapContainer.current, {
        center: [centerLng, centerLat],
        zoom: 13,
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

      // 等待地图完全加载后再初始化驾车路线
      map.on('complete', () => {
        
        AMap.plugin('AMap.Walking',function(){
          const walking=new AMap.Walking({
            map:map,
            panel:panelContainer.current
          });

          walking.search(
            new AMap.LngLat(startCoords.lng, startCoords.lat),
            new AMap.LngLat(endCoords.lng, endCoords.lat),
            (status,result)=>{
              if(status==='complete'){
                console.log('✅ 步行路线规划成功', result);
                console.log('步行距离:', result.routes[0].distance, '米');
                console.log('预计时间:', Math.round(result.routes[0].time/60), '分钟');
                // 自动调整视野
                try {
                  map.setFitView();
                } catch (error) {
                  console.warn('地图视野调整失败:', error);
                }
              } else {
                console.error('❌ 步行路线规划失败:', result);
              }
            }
          )
        })
        //骑行
        AMap.plugin('AMap.Riding',function(){
          const riding=new AMap.Riding({
            map:map,
            panel:panelContainer.current
          });
          riding.search(
            new AMap.LngLat(startCoords.lng,startCoords.lat),
            new AMap.LngLat(endCoords.lng,endCoords.lat),
            (status,result)=>{
              if(status==='complete'){
                console.log('✅ 骑行规划路线成功');
                console.log('骑行距离',result.routes[0].distance,'米');
                console.log('预计时间',Math.round(result.routes[0].time/60),'分钟');
                try{
                  map.setFitView();
                }catch(error){
                  console.warn('地图视野调整失败:',error);
                }
              }else{
                console.error('❌ 骑行规划路线失败:', result);
              }
            }
          )
        })

        
        //公交车
        AMap.plugin('AMap.Transfer',function(){
          // 从起点地址中提取城市名称
          //直接使用ai返回的城市名
          const originCity=routeData?.coordinates?.origin?.city;
          const destinationCity=routeData?.coordinates?.destination?.city;
          console.log('🚌 公交规划 - 起点城市:', originCity);
          console.log('🚌 公交规划 - 终点城市:', destinationCity);
          
          const isCrossCity=originCity!==destinationCity;
          if(isCrossCity){
            console.log('跨城公交规划路线');
          }else{
            console.log('同城公交规划路线');
          }
          
          const transfer=new AMap.Transfer({
            map:map,
            panel:panelContainer.current,
            city: originCity,
            cityb:destinationCity // ⭐ 必须指定城市！
          });
          transfer.search(
            new AMap.LngLat(startCoords.lng,startCoords.lat),
            new AMap.LngLat(endCoords.lng,endCoords.lat),
            (status,result)=>{
              if(status==='complete'){
                console.log('✅ 公交地铁路线完成');
                console.log('地铁路线数据',result);
                try{
                  map.setFitView();
                }catch(error){
                  console.warn('地图视野调整失败',error);
                }
              }else{
                console.error('❌ 公交地铁规划路线失败:', result);
                if(isCrossCity){
                  console.log('💡 提示：跨城公交路线有限，建议考虑火车或飞机');
                }
              }
            }
          )
        })

        // 先加载驾车路线插件
        AMap.plugin('AMap.Driving', function() {
          const driving = new AMap.Driving({
            map: map,
            panel: panelContainer.current
          });

          driving.search(
            new AMap.LngLat(startCoords.lng, startCoords.lat), 
            new AMap.LngLat(endCoords.lng, endCoords.lat), 
            (status, result) => {
              if (status === 'complete') {
                console.log('✅ 绘制驾车路线完成');
                try {
                  // 自动调整视野以显示完整路线
                  map.setFitView();
                } catch (error) {
                  console.warn('地图视野调整失败:', error);
                }
              } else {
                console.error('❌ 获取驾车数据失败：', result);
              }
            }
          );
        });
      });
    };

    loadMapScript()
      .then(AMap => initMap(AMap))
      .catch(error => console.error(error));

  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* 返回按钮 */}
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          style={{
            position: 'fixed',
            top: '20px',
            left: '10px',
            zIndex: 1000,
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>←</span>
          <span>返回</span>
        </button>
      )}
      
      {/* 路线信息 */}
      {routeData && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '60%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width:'65%',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '15px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '14px'
        }}>
          <div style={{ marginBottom: '4px'}}>
            <span style={{ color: '#22c55e', marginRight: '8px' }}>●</span>
            起点: {routeData.from || routeData.start}
          </div>
          <div>
            <span style={{ color: '#ef4444', marginRight: '8px' }}>●</span>
            终点: {routeData.to || routeData.end}
          </div>
        </div>
      )}
      
      <div ref={mapContainer} style={{ width: '100%', height: '85%' }} />
      <div style={{position:'fixed',top:'150px',right:isPanelVisible?'0':'-280px',backgroundColor:'white',width:'280px',transition:'right 0.3s ease-in-out',zIndex:100}}>
        <button onClick={()=>setIsPanelVisible(!isPanelVisible)} 
        style={{position:'absolute',
        left:'-30px',
        transform:'translateX(-30%)',
        backgroundColor:'white',
        border:'1px solid #ddd',
        borderRadius:'8px 0 0 8px',
        width:'40px',
        height:'60px',
        cursor:'pointer',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        fontSize:'20px',
        // fontWeight:'bold',
        boxShadow:'-2px 2px 8px rgba(0,0,0,0.1)',
        zIndex:101}}>
          {isPanelVisible?'>':'<'}
          </button>
      <div 
        ref={panelContainer}
        style={{
          position: 'relative',
          backgroundColor: 'white',
          maxHeight: '50vh',
          overflowY: 'auto',
          // top: '100px',
          // right: '10px',
          width: '100%',
          padding:'10px'
          // zIndex: 100
        }}
      /> 
      </div>


      {/* 底部导航控制面板 */}
      <div style={{
        position:'fixed',
        bottom:'50px',
        backgroundColor:'white',
        width:'100%',
        padding:'15px',
        boxShadow:'0 -2px 10px rgba(0,0,0,0.1)',
        zIndex:100
      }}>
        {/* 出行方式选择 */}
        <div style={{marginBottom:'10px'}}>
          <div style={{fontSize:'12px',color:'#666',marginBottom:'5px'}}>出行方式：</div>
          <div style={{display:'flex',gap:'8px'}}>
            <button
              onClick={() => setTravelMode('car')}
              style={{
                flex:1,
                padding:'8px',
                borderRadius:'6px',
                border:`2px solid ${travelMode === 'car' ? '#3b82f6' : '#ddd'}`,
                backgroundColor:travelMode === 'car' ? '#eff6ff' : 'white',
                color:travelMode === 'car' ? '#3b82f6' : '#666',
                fontSize:'13px',
                cursor:'pointer'
              }}
            >
              🚗 驾车
            </button>
            <button
              onClick={() => setTravelMode('bus')}
              style={{
                flex:1,
                padding:'8px',
                borderRadius:'6px',
                border:`2px solid ${travelMode === 'bus' ? '#3b82f6' : '#ddd'}`,
                backgroundColor:travelMode === 'bus' ? '#eff6ff' : 'white',
                color:travelMode === 'bus' ? '#3b82f6' : '#666',
                fontSize:'13px',
                cursor:'pointer'
              }}
            >
              🚌 公交
            </button>
            <button
              onClick={() => setTravelMode('walk')}
              style={{
                flex:1,
                padding:'8px',
                borderRadius:'6px',
                border:`2px solid ${travelMode === 'walk' ? '#3b82f6' : '#ddd'}`,
                backgroundColor:travelMode === 'walk' ? '#eff6ff' : 'white',
                color:travelMode === 'walk' ? '#3b82f6' : '#666',
                fontSize:'13px',
                cursor:'pointer'
              }}
            >
              🚶 步行
            </button>
            <button
              onClick={() => setTravelMode('ride')}
              style={{
                flex:1,
                padding:'8px',
                borderRadius:'6px',
                border:`2px solid ${travelMode === 'ride' ? '#3b82f6' : '#ddd'}`,
                backgroundColor:travelMode === 'ride' ? '#eff6ff' : 'white',
                color:travelMode === 'ride' ? '#3b82f6' : '#666',
                fontSize:'13px',
                cursor:'pointer'
              }}
            >
              🚴 骑行
            </button>
          </div>
        </div>

        {/* 导航策略选择（仅驾车和公交显示） */}
        {(travelMode === 'car' || travelMode === 'bus') && (
          <div style={{marginBottom:'10px'}}>
            <div style={{fontSize:'12px',color:'#666',marginBottom:'5px'}}>导航策略：</div>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
              {travelMode === 'car' && (
                <>
                  <button onClick={() => setNaviStrategy(0)} style={{flex:'1 1 30%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 0 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 0 ? '#eff6ff' : 'white',color:naviStrategy === 0 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>⚡最快</button>
                  <button onClick={() => setNaviStrategy(1)} style={{flex:'1 1 30%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 1 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 1 ? '#eff6ff' : 'white',color:naviStrategy === 1 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>📏最短</button>
                  <button onClick={() => setNaviStrategy(3)} style={{flex:'1 1 30%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 3 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 3 ? '#eff6ff' : 'white',color:naviStrategy === 3 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>🚦躲避拥堵</button>
                  <button onClick={() => setNaviStrategy(4)} style={{flex:'1 1 45%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 4 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 4 ? '#eff6ff' : 'white',color:naviStrategy === 4 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>🚫不走高速</button>
                  <button onClick={() => setNaviStrategy(5)} style={{flex:'1 1 45%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 5 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 5 ? '#eff6ff' : 'white',color:naviStrategy === 5 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>🛣️高速优先</button>
                </>
              )}
              {travelMode === 'bus' && (
                <>
                  <button onClick={() => setNaviStrategy(0)} style={{flex:'1 1 45%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 0 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 0 ? '#eff6ff' : 'white',color:naviStrategy === 0 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>⚡最快</button>
                  <button onClick={() => setNaviStrategy(1)} style={{flex:'1 1 45%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 1 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 1 ? '#eff6ff' : 'white',color:naviStrategy === 1 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>🔄最少换乘</button>
                  <button onClick={() => setNaviStrategy(2)} style={{flex:'1 1 45%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 2 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 2 ? '#eff6ff' : 'white',color:naviStrategy === 2 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>💰最省钱</button>
                  <button onClick={() => setNaviStrategy(3)} style={{flex:'1 1 45%',padding:'6px',borderRadius:'4px',border:`1px solid ${naviStrategy === 3 ? '#3b82f6' : '#ddd'}`,backgroundColor:naviStrategy === 3 ? '#eff6ff' : 'white',color:naviStrategy === 3 ? '#3b82f6' : '#666',fontSize:'12px',cursor:'pointer'}}>🚶步行最少</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 开始导航按钮 */}
        <button 
          onClick={handleStartNavigation}
          className='w-full bg-blue-600 text-white h-[45px] rounded-lg font-medium text-[15px] hover:bg-blue-700 transition-colors'
          style={{boxShadow:'0 2px 8px rgba(59,130,246,0.3)'}}
        >
          开始导航
        </button>
      </div>


      {/* Bottom Navigation */}
      {/* <div className="fixed mt-10px bottom-0 left-0 right-0 z-20 flex items-center justify-around p-3 bg-white border-t border-gray-200">
        <div className="flex flex-col items-center">
          <i className="text-xl text-gray-400 fa-solid fa-house" onClick={onBackToHome}></i>
          <span className="text-xs text-gray-400">首页</span>
        </div>
        <div className="flex flex-col items-center" onClick={onNavigateToCommunity}>
          <i className="text-xl text-gray-400 fa-solid fa-users"></i>
          <span className="text-xs text-gray-400">社区</span>
        </div>
        <div className="flex flex-col items-center" onClick={onNavigateToDiscover}>
          <i className="text-xl text-gray-400 fa-solid fa-map"></i>
          <span className="text-xs text-gray-400">发现</span>
        </div>
        <div className="flex flex-col items-center" onClick={onNavigateToMine}>
          <i className="text-xl text-gray-400 fa-solid fa-user"></i>
          <span className="text-xs text-gray-400">我的</span>
        </div>
      </div> */}
    </div>
  );
};

export default MapPage;
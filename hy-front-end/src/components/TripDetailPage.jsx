import React, { useState, useEffect } from 'react';
import { favoriteRoute, favoriteCustomRoute, unfavoriteRoute, getMyFavoriteRoutes, checkFavoriteStatus, savePopularTravelPlan, toggleFavoritePlan } from '../api/config';

export default function TripDetailPage({ tripData, onBack }) {
  const [expandedDay, setExpandedDay] = useState(null);
  //收藏状态
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [routeId, setRouteId] = useState(null); // 存储后端返回的路线 ID
  const [checkingFavorite, setCheckingFavorite] = useState(true); // 检查收藏状态

  // 🔥 组件加载时检查收藏状态
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!tripData) return;
      
      try {
        console.log('🔍 检查路线收藏状态...');
        const response = await getMyFavoriteRoutes();
        
        if (response.code === 200 && response.data) {
          const favoriteList = response.data.list || response.data || [];
          console.log('📦 我的收藏列表:', favoriteList);
          
          // 通过标题匹配查找是否已收藏
          const tripTitle = tripData.trip_title || tripData.title || '';
          const favoriteItem = favoriteList.find(item => 
            item.trip_title === tripTitle || item.title === tripTitle
          );
          
          if (favoriteItem) {
            console.log('✅ 找到收藏记录:', favoriteItem);
            console.log('📋 收藏记录的所有字段:', Object.keys(favoriteItem));
            
            // 🔥 尝试多种可能的ID字段名
            const possibleRouteId = favoriteItem.id 
              || favoriteItem.routeId 
              || favoriteItem.route_id 
              || favoriteItem.favoriteId 
              || favoriteItem.favorite_id;
            
            console.log('🆔 提取的routeId:', possibleRouteId);
            
            setIsFavorited(true);
            setRouteId(possibleRouteId);
            
            if (!possibleRouteId) {
              console.warn('⚠️ 警告：未找到有效的routeId字段！');
            }
          } else {
            console.log('📝 未收藏此路线');
            setIsFavorited(false);
            setRouteId(null);
          }
        }
      } catch (error) {
        console.error('❌ 检查收藏状态失败:', error);
      } finally {
        setCheckingFavorite(false);
      }
    };
    
    checkFavoriteStatus();
  }, [tripData]);

  if (!tripData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <i className="fa-solid fa-exclamation-circle text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">未找到路线数据</p>
          <button 
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const toggleDay = (dayIndex) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
  };

  //处理收藏
  const handleFavoriteClick = async () => {
    if(favoriteLoading) return;
    setFavoriteLoading(true);
    
    // 🔍 添加调试日志
    console.log('🔍 当前收藏状态:', { isFavorited, routeId, tripData });
    
    try{
      if(isFavorited){
        // 🔥 已收藏 → 取消收藏
        if(!routeId){
          console.error('❌ routeId为空，无法取消收藏');
          alert('收藏信息丢失，请刷新页面重试');
          setFavoriteLoading(false);
          return;
        }
        
        console.log('📝 取消收藏, routeId:',routeId);
        const response=await unfavoriteRoute(routeId);
        if(response.code===200){
          setIsFavorited(false);
          setRouteId(null);
          alert('取消收藏成功')
        }else{
          throw new Error(response.message||response.msg||'取消收藏失败');
        }
      }else{
        // 🔥 未收藏 → 收藏
        let result;
        
        // 检查是否有planId，决定调用哪个接口
        if (tripData.planId || tripData.plan_id) {
          // 如果有planId，说明是数据库中已存在的计划，使用toggle接口
          const existingPlanId = tripData.planId || tripData.plan_id;
          console.log('📝 收藏已有旅行计划, planId:', existingPlanId);
          result = await toggleFavoritePlan(existingPlanId);
        } else {
          // 如果没有planId，说明是前端规划的自定义路线，使用保存接口
          console.log('📝 保存新的旅行计划:', tripData.trip_title);
          console.log('📦 原始数据:', tripData);
          
          // 🔥 按照接口文档格式化数据
          const planData = {
            planId: null, // 新建计划
            trip_title: tripData.trip_title || tripData.title || '未命名路线',
            total_days: tripData.total_days || tripData.days?.length || 1,
            days: (tripData.days || []).map((day, index) => ({
              day: day.day || index + 1,
              theme: day.theme || '行程安排',
              routes_used: day.routes_used || [],
              spots: day.spots || [],
              highlights: day.highlights || '',
              photo: day.photo || ''
            })),
            summary: tripData.summary || tripData.highlights || '',
            is_favorited: false // 默认未收藏
          };
          
          console.log('📤 发送到后端的数据:', JSON.stringify(planData, null, 2));
          result = await savePopularTravelPlan(planData);
        }
        
        if(result.code===200){
          setIsFavorited(true);
          
          // 获取返回的计划ID
          const newPlanId = result.data?.plan_id || result.data?.planId || result.data?.id;
          if (newPlanId) {
            setRouteId(newPlanId);
            console.log('✅ 保存成功，获得plan_id:', newPlanId);
          } else {
            // 如果后端没返回ID，重新检查收藏状态获取ID
            console.log('⚠️ 后端未返回收藏ID，重新获取...');
            setTimeout(async () => {
              try {
                const historyResponse = await getMyFavoriteRoutes();
                if (historyResponse.code === 200 && historyResponse.data) {
                  const favoriteList = historyResponse.data.list || historyResponse.data || [];
                  const tripTitle = tripData.trip_title || tripData.title || '';
                  const favoriteItem = favoriteList.find(item => 
                    item.trip_title === tripTitle || item.title === tripTitle
                  );
                  if (favoriteItem) {
                    const possibleRouteId = favoriteItem.id || favoriteItem.routeId || favoriteItem.route_id;
                    setRouteId(possibleRouteId);
                    console.log('✅ 重新获取到收藏ID:', possibleRouteId);
                  }
                }
              } catch (error) {
                console.error('❌ 重新获取收藏ID失败:', error);
              }
            }, 500);
          }
          
          alert('收藏成功');
        }else{
          throw new Error(result.message||result.msg||'收藏失败');
        }
      }
    }catch(error){
      console.error('❌ 收藏操作失败:',error);
      alert('操作失败，请重试');
    }finally{
      setFavoriteLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-6 h-full">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800 flex-1 truncate">
            {tripData.trip_title || '旅游路线详情'}
          </h1>
          {/* <button className="text-gray-400">
            <i className="fa-solid fa-share-nodes text-xl"></i>
          </button> */}
        </div>
      </div>

      {/* 顶部封面图 */}
      {tripData.days && tripData.days[0]?.photo && (
        <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-500">
          <img 
            src={tripData.days[0].photo} 
            alt={tripData.trip_title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-2xl font-bold mb-2">{tripData.trip_title}</h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <i className="fa-solid fa-calendar-days mr-1"></i>
                {tripData.total_days}天
              </span>
              <span className="flex items-center">
                <i className="fa-solid fa-location-dot mr-1"></i>
                {tripData.days?.length || 0}个行程
              </span>
            </div>
          </div>
          {/* 右下角心形收藏按钮 */}
          <button
            onClick={handleFavoriteClick}
            disabled={favoriteLoading || checkingFavorite}
            className={`absolute bottom-4 right-4 transition-all ${
              (favoriteLoading || checkingFavorite) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-125'
            }`}
          >
            {(favoriteLoading || checkingFavorite) ? (
              <i className="fa-solid fa-spinner fa-spin text-white text-3xl drop-shadow-lg"></i>
            ) : (
              <i className={`fa-solid fa-heart text-3xl drop-shadow-lg ${
                isFavorited ? 'text-red-500' : 'text-white'
              }`}></i>
            )}
          </button>
        </div>
      )}

      {/* 路线概述 */}
      {(tripData.summary || tripData.highlights) && (
        <div className="mx-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">行程概述</h3>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-base text-gray-600 leading-loose" style={{ textIndent: '2em' }}>{tripData.summary||tripData.highlights}</p>
          </div>
        </div>
      )}

      {/* 每日行程 */}
      <div className="mx-4 mt-4 space-y-3 mb-16">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">详细行程</h3>
        
        {tripData.days && tripData.days.map((day, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 日期头部 - 可点击展开/收起 */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleDay(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    D{day.day || index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">
                      第{day.day || index + 1}天
                    </h4>
                    <p className="text-base text-gray-600 mt-2 leading-relaxed">{day.theme}</p>
                  </div>
                </div>
                <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform ${
                  expandedDay === index ? 'rotate-180' : ''
                }`}></i>
              </div>
            </div>

            {/* 展开的详细内容 */}
            {expandedDay === index && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {/* 日程图片 */}
                {day.photo && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <img 
                      src={day.photo} 
                      alt={day.theme}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* 亮点 */}
                {day.highlights && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <i className="fa-solid fa-star text-yellow-500 mr-3 mt-1"></i>
                      <p className="text-base text-gray-700 leading-loose" style={{ textIndent: '2em' }}>{day.highlights}</p>
                    </div>
                  </div>
                )}

                {/* 时间安排 */}
                {day.time_schedule && (
                  <div className="mt-4">
                    <div className="flex items-start">
                      <i className="fa-solid fa-clock text-blue-500 mr-3 mt-1 text-base"></i>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-semibold mb-2">时间安排</p>
                        <p className="text-base text-gray-700 leading-loose" style={{ textIndent: '2em' }}>{day.time_schedule}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 景点列表 */}
                {day.spots && day.spots.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">
                      <i className="fa-solid fa-map-pin mr-1"></i>
                      游览景点 ({day.spots.length})
                    </p>
                    <div className="space-y-2">
                      {day.spots.map((spot, spotIndex) => {
                        // 🔍 支持字符串和对象两种格式
                        const spotName = typeof spot === 'string' ? spot : (spot.name || '未知景点');
                        const spotPhoto = typeof spot === 'object' ? spot.photo : null;
                        
                        return (
                          <div 
                            key={spotIndex} 
                            className="flex items-center p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0">
                              {spotIndex + 1}
                            </div>
                            
                            {/* 景点图片（如果有） */}
                            {spotPhoto && (
                              <img 
                                src={spotPhoto} 
                                alt={spotName}
                                className="w-12 h-12 object-cover rounded-lg mr-3 flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            
                            <span className="text-base text-gray-700 flex-1 leading-relaxed">{spotName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 参考路线 */}
                {day.routes_used && day.routes_used.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">
                      <i className="fa-solid fa-route mr-1"></i>
                      参考路线
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {day.routes_used.map((route, routeIndex) => (
                        <span 
                          key={routeIndex}
                          className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                        >
                          {route}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 底部操作按钮 - 已注释 */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex space-x-3">
          <button 
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            返回列表
          </button>

          <button 
          onClick={handleFavoriteClick}
          disabled={favoriteLoading || checkingFavorite}
          className={`flex-1 px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors flex items-center justify-center ${
            isFavorited 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
          }${(favoriteLoading || checkingFavorite) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            
            {checkingFavorite ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                检查中...
              </>
            ) : favoriteLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                处理中...
              </>
            ) : (
              <>
                <i className={`fa-solid ${isFavorited ? 'fa-heart-broken' : 'fa-heart'} mr-2`}></i>
                {isFavorited ? '取消收藏' : '收藏路线'}
              </>
            )}
          </button>
        </div>
      </div> */}
    </div>
  );
}


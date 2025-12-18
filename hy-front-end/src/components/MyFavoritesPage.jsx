import React, { useState, useEffect } from 'react';
import { 
  getRouteFavorites, 
  getAttractionFavorites, 
  getPostFavorites, 
  getFavoriteStats, 
  getFavoriteOverview,
  removePostFavorite,
  getAttractionFavoritesCount,
  removeAttractionFavorite,
  getUserAttractionFavorites,
  unfavoriteRoute,
  getMyFavoriteRoutes
} from '../api/config';

const MyFavoritesPage = ({ onBack, onNavigateToPostDetail }) => {
  const [activeTab, setActiveTab] = useState('attractions'); // attractions, posts, routes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 数据状态
  const [attractionsData, setAttractionsData] = useState({ total: 0, list: [] });
  const [postsData, setPostsData] = useState({ total: 0, list: [] });
  const [routesData, setRoutesData] = useState({ total: 0, list: [] });
  const [stats, setStats] = useState({
    totalAttractions: 0,
    totalPosts: 0,
    totalFavorites: 0,
    attractionTypeStats: {},
    postTypeStats: {},
    destinationStats: {}
  });
  
  // 筛选状态
  const [attractionFilters, setAttractionFilters] = useState({
    attractionType: '',
    visitStatus: '',
    city: ''
  });
  const [postFilters, setPostFilters] = useState({
    postType: '',
    favoriteCategory: '',
    readStatus: '',
    destinationCity: '',
    priorityLevel: ''
  });

  // 标签页配置
  const tabs = [
    // { 
    //   key: 'attractions', 
    //   title: '景点', 
    //   icon: 'fa-solid fa-mountain-sun',
    //   color: 'text-green-600',
    //   bgColor: 'bg-green-100'
    // },
    { 
      key: 'posts', 
      title: '帖子', 
      icon: 'fa-solid fa-file-text',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      key: 'routes', 
      title: '路线', 
      icon: 'fa-solid fa-route',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  // 页面加载时获取数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 当切换标签时加载对应数据
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, attractionFilters, postFilters]);

  // 🔧 监听页面可见性变化，页面重新显示时刷新数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 页面重新可见，刷新收藏数据');
        // 刷新所有数据以确保统计卡片显示最新数据
        loadInitialData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 加载初始数据（直接获取实时数据）
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 开始加载收藏页面初始数据...');
      
      // 🔧 直接并行获取所有三种收藏的实时数据，而不是依赖概览API
      const [attractionsResult, postsResult, routesResult] = await Promise.allSettled([
        // 景点收藏数据
        Promise.all([
          getUserAttractionFavorites().catch(err => ({ code: 404, data: [] })),
          getAttractionFavoritesCount().catch(err => ({ code: 404, data: 0 }))
        ]),
        // 帖子收藏数据
        getPostFavorites().catch(err => ({ code: 404, data: { total: 0, list: [] } })),
        // 路线收藏数据
        getMyFavoriteRoutes().catch(err => ({ code: 404, data: { total: 0, list: [] } }))
      ]);
      
      // 处理景点收藏数据
      let attractionCount = 0;
      let attractionsList = [];
      if (attractionsResult.status === 'fulfilled') {
        const [favoritesRes, countRes] = attractionsResult.value;
        
        // 处理列表数据
        if (favoritesRes.code === 200 && favoritesRes.data) {
          const responseData = favoritesRes.data;
          if (Array.isArray(responseData)) {
            attractionsList = responseData;
          } else if (responseData && Array.isArray(responseData.list)) {
            attractionsList = responseData.list;
          }
        }
        
        // 处理总数数据
        if (countRes.code === 200) {
          const statsData = countRes.data;
          if (typeof statsData === 'number') {
            attractionCount = statsData;
          } else if (statsData && typeof statsData.totalAttractions === 'number') {
            attractionCount = statsData.totalAttractions;
          } else {
            attractionCount = attractionsList.length;
          }
        } else {
          attractionCount = attractionsList.length;
        }
        
        // 如果API失败，尝试从localStorage获取
        if (attractionCount === 0 && attractionsList.length === 0) {
          try {
            const localFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
            attractionsList = localFavorites.map((fav, index) => ({
              id: index + 1,
              name: fav.name,
              address: fav.address || '',
              lng: fav.lng,
              lat: fav.lat,
              rating: '未知',
              distance: '未知',
              favoriteTime: fav.timestamp ? new Date(fav.timestamp) : new Date(),
              icon: 'attraction'
            }));
            attractionCount = attractionsList.length;
            console.log('📋 使用本地景点收藏数据:', attractionCount, '个景点');
          } catch (localError) {
            console.warn('本地数据解析失败:', localError);
          }
        }
      }
      
      setAttractionsData({ 
        total: Number(attractionCount) || 0, 
        list: attractionsList 
      });
      
      // 处理帖子收藏数据
      let postCount = 0;
      let postsList = [];
      if (postsResult.status === 'fulfilled' && postsResult.value.code === 200) {
        const postsData = postsResult.value.data;
        postCount = postsData.total || 0;
        postsList = postsData.list || [];
      }
      
      setPostsData({ 
        total: Number(postCount) || 0, 
        list: postsList 
      });
      
      // 处理路线收藏数据
      let routeCount = 0;
      let routesList = [];
      if (routesResult.status === 'fulfilled' && routesResult.value.code === 200) {
        const routesData = routesResult.value.data;
        routeCount = routesData.total || 0;
        routesList = routesData.list || [];
      }
      
      setRoutesData({ 
        total: Number(routeCount) || 0, 
        list: routesList 
      });
      
      // 🔧 设置实时统计数据
      const totalFavorites = Number(attractionCount) + Number(postCount) + Number(routeCount);
      setStats({
        totalAttractions: Number(attractionCount) || 0,
        totalPosts: Number(postCount) || 0,
        totalFavorites: totalFavorites,
        attractionTypeStats: {},
        postTypeStats: {},
        destinationStats: {}
      });
      
      console.log('✅ 初始数据加载完成:', {
        景点: attractionCount,
        帖子: postCount, 
        路线: routeCount,
        总计: totalFavorites
      });
      
    } catch (error) {
      console.error('加载初始数据失败:', error);
      // 设置默认值而不是错误状态
      setAttractionsData({ total: 0, list: [] });
      setPostsData({ total: 0, list: [] });
      setRoutesData({ total: 0, list: [] });
      setStats({
        totalAttractions: 0,
        totalPosts: 0,
        totalFavorites: 0,
        attractionTypeStats: {},
        postTypeStats: {},
        destinationStats: {}
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载标签页数据
  const loadTabData = async (tab) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      switch (tab) {
        case 'attractions':
          await loadAttractions();
          break;
        case 'posts':
          await loadPosts();
          break;
        case 'routes':
          await loadRoutes();
          break;
      }
    } catch (error) {
      console.warn(`加载${tab}数据失败:`, error.message);
      // 不设置错误状态，而是显示空状态
      switch (tab) {
        case 'attractions':
          setAttractionsData({ total: 0, list: [] });
          break;
        case 'posts':
          setPostsData({ total: 0, list: [] });
          break;
        case 'routes':
          setRoutesData({ total: 0, list: [] });
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  // 加载景点收藏
  const loadAttractions = async () => {
    try {
      // 🔧 并行获取收藏列表和总数
      const [favoritesResponse, countResponse] = await Promise.allSettled([
        getUserAttractionFavorites(attractionFilters),
        getAttractionFavoritesCount()
      ]);
      
      let attractionsList = [];
      let totalCount = 0;
      
      // 处理收藏列表
      if (favoritesResponse.status === 'fulfilled' && favoritesResponse.value?.code === 200) {
        const responseData = favoritesResponse.value.data;
        // 🔧 处理不同的数据格式
        if (Array.isArray(responseData)) {
          attractionsList = responseData;
        } else if (responseData && Array.isArray(responseData.list)) {
          attractionsList = responseData.list;
        } else if (responseData && typeof responseData === 'object') {
          // 可能是单个对象，转换为数组
          attractionsList = [responseData];
        } else {
          attractionsList = [];
        }
      }
      
      // 🔧 处理总数 - 优先使用列表长度（最准确）
      if (countResponse.status === 'fulfilled' && countResponse.value?.code === 200) {
        const statsData = countResponse.value.data;
        // 检查返回的是对象还是数字
        if (typeof statsData === 'number') {
          totalCount = statsData;
        } else if (statsData && typeof statsData.totalAttractions === 'number') {
          totalCount = statsData.totalAttractions;
        } else {
          totalCount = attractionsList.length;
        }
      } else {
        totalCount = attractionsList.length;
      }
      
      // 🔧 确保 totalCount 是数字类型
      totalCount = Number(totalCount) || attractionsList.length;
      
      console.log('✅ 景点收藏数据加载完成:', { 总数: totalCount, 列表长度: attractionsList.length });
      
      setAttractionsData({ 
        total: totalCount, 
        list: attractionsList 
      });
      
      // 🔧 同步更新统计数据中的景点收藏数（确保所有值都是数字）
      setStats(prev => ({
        ...prev,
        totalAttractions: totalCount,
        totalFavorites: Number(prev.totalPosts || 0) + Number(totalCount) + Number(routesData.total || 0)
      }));
      
    } catch (error) {
      console.warn('景点收藏数据加载失败:', error.message);
      // 🔧 尝试从localStorage获取数据作为后备
      try {
        const localFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
        const attractionsList = localFavorites.map((fav, index) => ({
          id: index + 1,
          name: fav.name,
          address: fav.address || '',
          lng: fav.lng,
          lat: fav.lat,
          rating: '未知',
          distance: '未知',
          favoriteTime: fav.timestamp ? new Date(fav.timestamp) : new Date(),
          icon: 'attraction'
        }));
        
        setAttractionsData({ 
          total: attractionsList.length, 
          list: attractionsList 
        });
        
        // 🔧 同步更新统计数据（确保都是数字类型）
        setStats(prev => ({
          ...prev,
          totalAttractions: Number(attractionsList.length),
          totalFavorites: Number(prev.totalPosts || 0) + Number(attractionsList.length) + Number(routesData.total || 0)
        }));
        
        console.log('📋 使用本地收藏数据:', attractionsList.length, '个景点');
      } catch (localError) {
        console.warn('本地数据解析失败:', localError);
        setAttractionsData({ total: 0, list: [] });
      }
    }
  };

  // 加载帖子收藏
  const loadPosts = async () => {
    try {
      const response = await getPostFavorites(postFilters);
      if (response.code === 200) {
        setPostsData(response.data);
      } else {
        setPostsData({ total: 0, list: [] });
      }
    } catch (error) {
      console.warn('帖子收藏接口未实现:', error.message);
      setPostsData({ total: 0, list: [] });
    }
  };

  // 加载路线收藏
  const loadRoutes = async () => {
    try {
      console.log('🔄 开始加载路线收藏数据...');
      const response = await getMyFavoriteRoutes();
      
      if (response.code === 200 && response.data) {
        const routesData = response.data;
        console.log('✅ 路线收藏数据加载成功:', routesData);
        
        // 处理数据格式，确保兼容性
        const processedData = {
          total: routesData.total || (routesData.list ? routesData.list.length : 0),
          list: routesData.list || []
        };
        
        setRoutesData(processedData);
        
        // 🔧 同步更新统计数据中的路线收藏数
        setStats(prev => ({
          ...prev,
          totalFavorites: Number(prev.totalAttractions || 0) + Number(prev.totalPosts || 0) + Number(processedData.total)
        }));
        
      } else {
        console.warn('路线收藏数据为空或格式错误');
        setRoutesData({ total: 0, list: [] });
      }
    } catch (error) {
      console.warn('路线收藏数据加载失败:', error.message);
      setRoutesData({ total: 0, list: [] });
    }
  };

  // 处理筛选变化
  const handleAttractionFilterChange = (key, value) => {
    setAttractionFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePostFilterChange = (key, value) => {
    setPostFilters(prev => ({ ...prev, [key]: value }));
  };

  // 清空筛选
  const clearFilters = () => {
    if (activeTab === 'attractions') {
      setAttractionFilters({ attractionType: '', visitStatus: '', city: '' });
    } else if (activeTab === 'posts') {
      setPostFilters({ 
        postType: '', 
        favoriteCategory: '', 
        readStatus: '', 
        destinationCity: '', 
        priorityLevel: '' 
      });
    }
  };

  // 🌟 处理取消收藏景点
  const handleRemoveAttractionFavorite = async (attraction, e) => {
    e.stopPropagation(); // 防止触发卡片点击
    
    if (!confirm(`确定要取消收藏 "${attraction.name || attraction.attractionName}" 吗？`)) {
      return;
    }

    try {
      const spotData = {
        name: attraction.name || attraction.attractionName,
        lat: attraction.lat || attraction.attractionLat,
        lng: attraction.lng || attraction.attractionLng
      };
      
      const response = await removeAttractionFavorite(null, spotData);
      if (response.code === 200) {
        console.log('✅ 取消景点收藏成功');
        
        // 从列表中移除该景点
        setAttractionsData(prev => ({
          ...prev,
          list: prev.list.filter(a => a.id !== attraction.id),
          total: prev.total - 1
        }));
        
        // 同时从localStorage移除
        const currentFavorites = JSON.parse(localStorage.getItem('favoriteSpots') || '[]');
        const spotId = `${spotData.name}_${spotData.lat}_${spotData.lng}`;
        const updatedFavorites = currentFavorites.filter(fav => 
          `${fav.name}_${fav.lat}_${fav.lng}` !== spotId
        );
        localStorage.setItem('favoriteSpots', JSON.stringify(updatedFavorites));
        
        // 更新统计（确保使用数字类型）
        setStats(prev => ({
          ...prev,
          totalAttractions: Math.max(0, Number(prev.totalAttractions || 0) - 1),
          totalFavorites: Math.max(0, Number(prev.totalFavorites || 0) - 1)
        }));
        
      } else {
        alert('取消收藏失败：' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('❌ 取消景点收藏失败:', error);
      alert('取消收藏失败：' + error.message);
    }
  };

  // 🌟 处理取消收藏帖子
  const handleRemoveFavorite = async (postId, e) => {
    e.stopPropagation(); // 防止触发卡片点击
    
    if (!confirm('确定要取消收藏这篇帖子吗？')) {
      return;
    }

    try {
      const response = await removePostFavorite(postId);
      if (response.code === 200) {
        console.log('✅ 取消收藏成功');
        // 从列表中移除该帖子
        setPostsData(prev => ({
          ...prev,
          list: prev.list.filter(p => p.postId !== postId),
          total: prev.total - 1
        }));
        // 更新统计（确保使用数字类型）
        setStats(prev => ({
          ...prev,
          totalPosts: Math.max(0, Number(prev.totalPosts || 0) - 1),
          totalFavorites: Math.max(0, Number(prev.totalFavorites || 0) - 1)
        }));
      } else {
        alert('取消收藏失败：' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('❌ 取消收藏失败:', error);
      alert('取消收藏失败：' + error.message);
    }
  };

  // 🌟 处理查看帖子详情
  const handleViewPost = (post, e) => {
    e.stopPropagation(); // 防止触发卡片点击
    
    if (onNavigateToPostDetail) {
      // 传递帖子信息（需要转换为标准格式）
      onNavigateToPostDetail({
        id: post.postId,
        title: post.postTitle,
        postType: post.postType,
        // 其他需要的字段会在详情页重新加载
      }, 'favorites');
    } else {
      console.warn('⚠️ onNavigateToPostDetail 回调未定义');
    }
  };

  // 🌟 处理查看路线详情
  const handleViewRouteDetail = (route) => {
    console.log('🔍 查看路线详情:', route);
    // TODO: 实现路线详情页面导航
    // 可以通过props传入的回调函数来导航到路线详情页
    alert(`查看路线详情: ${route.trip_title || route.title}`);
  };

  // 🌟 处理取消路线收藏
  const handleRemoveRouteFavorite = async (route, e) => {
    if (e) {
      e.stopPropagation();
    }

    if (!confirm(`确定要取消收藏 "${route.trip_title || route.title}" 吗？`)) {
      return;
    }


    try {
      // 获取路线ID，优先使用收藏记录的ID
      const routeIdToRemove = route.id || route.routeId;
      
      if (!routeIdToRemove) {
        console.error('❌ 无法获取路线ID，无法取消收藏');
        alert('取消收藏失败：缺少路线标识');
        return;
      }

      console.log('📝 取消路线收藏, ID:', routeIdToRemove);
      const response = await unfavoriteRoute(routeIdToRemove);
      
      if (response.code === 200) {
        console.log('✅ 取消路线收藏成功');
        
        // 从列表中移除该路线
        setRoutesData(prev => ({
          ...prev,
          list: prev.list.filter(r => r.id !== route.id),
          total: Math.max(0, prev.total - 1)
        }));
        
        // 更新统计数据
        setStats(prev => ({
          ...prev,
          totalFavorites: Math.max(0, Number(prev.totalFavorites || 0) - 1)
        }));
        
        alert('取消收藏成功');
      } else {
        throw new Error(response.message || '取消收藏失败');
      }
    } catch (error) {
      console.error('❌ 取消路线收藏失败:', error);
      alert('取消收藏失败：' + error.message);
    }
  };

  // 渲染统计卡片
  const renderStatsCards = () => {
    // 🔧 确保所有统计数据都是数字类型
    const attractionCount = Number(stats?.totalAttractions) || 0;
    const postCount = Number(stats?.totalPosts) || 0;
    const routeCount = Number(routesData?.total) || 0;
    
    console.log('🔍 renderStatsCards - 景点:', attractionCount, '帖子:', postCount, '路线:', routeCount);
    
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* <div className="rounded-xl p-4 text-white  text-center" style={{backgroundImage:'url(/春3.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
          <div className="text-2xl font-bold">{attractionCount}</div>
          <div className="text-xs opacity-90">景点收藏</div>
        </div> */}
       <div className="rounded-xl p-4 text-white text-center" style={{backgroundImage:'url(/夏1.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
          <div className="text-2xl font-bold">{postCount}</div>
          <div className="text-xs opacity-90">帖子收藏</div>
        </div>
        <div className="rounded-xl p-4 text-white text-center" style={{backgroundImage:'url(/秋2.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
          <div className="text-2xl font-bold">{routeCount}</div>
          <div className="text-xs opacity-90">路线收藏</div>
        </div>
      </div>
    );
  };

  // 渲染筛选器
  const renderFilters = () => {
    // 不显示任何筛选器
    return null;
  };

  // 渲染景点列表
  const renderAttractionsList = () => {
    // 🔧 确保 list 是数组
    const attractionsList = Array.isArray(attractionsData.list) ? attractionsData.list : [];
    
    // return (
    //   <div className="space-y-4">
    //     {attractionsList.map((attraction) => (
    //       <div key={attraction.id || `${attraction.name}_${attraction.lat}`} className="bg-white rounded-xl p-4 shadow-sm">
    //         <div className="flex items-start space-x-3">
    //           {(attraction.attractionImageUrl || attraction.imageUrl) && (
    //             <img 
    //               src={attraction.attractionImageUrl || attraction.imageUrl} 
    //               alt={attraction.name || attraction.attractionName}
    //               className="w-16 h-16 rounded-lg object-cover"
    //             />
    //           )}
    //           <div className="flex-1">
    //             <div className="flex items-center justify-between mb-1">
    //               <h3 className="font-medium text-gray-800">{attraction.name || attraction.attractionName}</h3>
    //               <span className={`px-2 py-1 rounded-full text-xs ${
    //                 attraction.visitStatus === 'visited' ? 'bg-green-100 text-green-600' :
    //                 attraction.visitStatus === 'planned' ? 'bg-blue-100 text-blue-600' :
    //                 'bg-gray-100 text-gray-600'
    //               }`}>
    //                 {attraction.visitStatus === 'visited' ? '已游览' :
    //                  attraction.visitStatus === 'planned' ? '计划游览' : '未游览'}
    //               </span>
    //             </div>
    //             <p className="text-sm text-gray-600 mb-2">
    //               {attraction.address || attraction.attractionAddress || '地址未知'}
    //             </p>
    //             <div className="flex items-center justify-between">
    //               <div className="flex items-center space-x-2">
    //                 {(attraction.attractionLevel || attraction.level) && (
    //                   <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
    //                     {attraction.attractionLevel || attraction.level}
    //                   </span>
    //                 )}
    //                 <span className="text-xs text-yellow-600">
    //                   ⭐ {attraction.rating || attraction.attractionRating || '未知'}
    //                 </span>
    //                 {(attraction.distance) && (
    //                   <span className="text-xs text-blue-600">
    //                     📍 {attraction.distance}
    //                   </span>
    //                 )}
    //               </div>
    //               <span className="text-xs text-gray-500">
    //                 {attraction.favoriteTime ? 
    //                   new Date(attraction.favoriteTime).toLocaleDateString() : 
    //                   '收藏时间未知'}
    //               </span>
    //             </div>
    //             {(attraction.userNotes || attraction.notes) && (
    //               <p className="text-sm text-gray-500 mt-2 italic">"{attraction.userNotes || attraction.notes}"</p>
    //             )}
                
    //             {/* 🌟 操作按钮 */}
    //             <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
    //               <button
    //                 onClick={(e) => handleRemoveAttractionFavorite(attraction, e)}
    //                 className="flex items-center px-3 py-1.5 bg-yellow-500 text-white text-xs rounded-full hover:bg-yellow-600 transition-colors"
    //                 title="取消收藏"
    //               >
    //                 <i className="fa-solid fa-star mr-1"></i>
    //                 取消收藏
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // );
  };

  // 渲染帖子列表
  const renderPostsList = () => {
    // 🔧 确保 list 是数组
    const postsList = Array.isArray(postsData.list) ? postsData.list : [];
    
    return (
      <div className="space-y-4">
        {postsList.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={(e) => handleViewPost(post, e)}
          >
            <div className="flex items-start space-x-3">

              {post.coverImage && (
                <img 
                  src={post.coverImage} 
                  alt={post.postTitle}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-gray-800 pr-2">{post.postTitle}</h3>
                  <button
                    onClick={(e) => handleRemoveFavorite(post.postId, e)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-50 text-yellow-500 hover:bg-yellow-100 transition-colors"
                    title="取消收藏"
                  >
                    <i className="fa-solid fa-star"></i>
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {post.destinationName} · {post.travelDays}天 · ¥{post.travelBudget}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {post.postType === 'travel_note' ? '游记' :
                       post.postType === 'strategy' ? '攻略' :
                       post.postType === 'photo_share' ? '照片' :
                       post.postType === 'video_share' ? '视频' : '问答'}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {post.favoriteCategory === 'general' ? '通用' :
                       post.favoriteCategory === 'inspiration' ? '灵感' :
                       post.favoriteCategory === 'planning' ? '规划' : '经验'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(post.favoriteTime).toLocaleDateString()}
                  </span>
                </div>
                {post.userNotes && (
                  <p className="text-sm text-gray-500 mt-2 italic">"{post.userNotes}"</p>
                )}
                {post.reminderEnabled && post.reminderDate && (
                  <div className="flex items-center mt-2 text-xs text-orange-600">
                    <i className="fa-solid fa-bell mr-1"></i>
                    提醒: {new Date(post.reminderDate).toLocaleString()}
                  </div>
                )}
                
                {/* 操作按钮已移除：整张帖子卡片可点击查看详情，右上角星标可取消收藏 */}

              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染路线列表
  const renderRoutesList = () => {
    // 🔧 确保 list 是数组
    const routesList = Array.isArray(routesData.list) ? routesData.list : [];
    
    if (routesList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <i className="fa-solid fa-route text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-600 mb-2">暂无路线收藏</h3>
          <p className="text-gray-500 text-sm">
            去发现页面收藏一些精彩的旅游路线吧！
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {routesList.map((route) => {
          // 判断是自定义路线还是热门路线
          const isCustomRoute = !route.routeId || route.routeId === null;
          const routeType = isCustomRoute ? '自定义路线' : '热门路线';
          const routeTypeColor = isCustomRoute ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600';
          
          return (
            <div
              key={route.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewRouteDetail(route)}
            >
              {/* 标题和类型标签 */}

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fa-solid fa-route text-purple-600"></i>
                    <h3 className="font-semibold text-gray-800 text-base">
                      {route.trip_title || route.title || '未命名路线'}
                    </h3>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${routeTypeColor}`}>
                    {routeType}
                  </span>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-2">
                  <button
                    onClick={(e) => handleRemoveRouteFavorite(route, e)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-50 text-yellow-500 hover:bg-yellow-100 transition-colors"
                    title="取消收藏"
                  >
                    <i className="fa-solid fa-star"></i>
                  </button>
                  <span className="text-xs text-gray-500">
                    {route.createTime ? new Date(route.createTime).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>

              
              {/* 路线摘要 */}
              {route.summary && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {route.summary}
                </p>
              )}
              
              {/* 路线信息 */}
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <i className="fa-solid fa-calendar-days text-purple-500 text-sm"></i>
                  <span className="text-sm text-gray-700">
                    {route.total_days || route.totalDays || 0}天
                  </span>
                </div>
                
                {route.days && route.days.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <i className="fa-solid fa-map-location-dot text-green-500 text-sm"></i>
                    <span className="text-sm text-gray-700">
                      {route.days.length}个行程
                    </span>
                  </div>
                )}
              </div>
              
              {/* 行程亮点预览 */}
              {route.days && route.days.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-500 mb-1">行程预览</div>
                  <div className="space-y-1">
                    {route.days.slice(0, 2).map((day, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-xs font-medium text-purple-600 min-w-[40px]">
                          Day {day.day || index + 1}
                        </span>
                        <span className="text-xs text-gray-700 line-clamp-1">
                          {day.theme || day.highlights || '精彩行程'}
                        </span>
                      </div>
                    ))}
                    {route.days.length > 2 && (
                      <div className="text-xs text-gray-400 text-center pt-1">
                        还有 {route.days.length - 2} 天行程...
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 操作按钮已移除：整张路线卡片可点击查看详情，右上角星标可取消收藏 */}

            </div>
          );
        })}
      </div>
    );
  };

  // 渲染内容区域
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fa-solid fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => loadTabData(activeTab)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    const currentData = activeTab === 'attractions' ? attractionsData :
                       activeTab === 'posts' ? postsData : routesData;

    // 🔧 安全检查：确保 list 是数组且有长度
    const currentList = Array.isArray(currentData.list) ? currentData.list : [];
    if (currentList.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fa-solid fa-heart text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 mb-2">暂无收藏内容</p>
            <p className="text-sm text-gray-400">快去收藏一些感兴趣的内容吧！</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'attractions':
        return renderAttractionsList();
      case 'posts':
        return renderPostsList();
      case 'routes':
        return renderRoutesList();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-gray-600"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">我的收藏</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                console.log('🔄 手动刷新收藏数据');
                loadTabData(activeTab);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="刷新数据"
            >
              <i className="fa-solid fa-rotate-right text-gray-600"></i>
            </button>
            <div className="text-sm text-gray-500">
              共 {Number(stats?.totalAttractions || 0) + Number(stats?.totalPosts || 0) + Number(routesData?.total || 0)} 项
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-6">
        {/* Stats Cards */}
        <div className="px-4 mt-4">
          {renderStatsCards()}
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <i className={`${tab.icon} mr-2 ${activeTab === tab.key ? tab.color : ''}`}></i>
                <span className="font-medium">{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-4">
          {renderFilters()}
        </div>

        {/* Content */}
        <div className="px-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MyFavoritesPage;
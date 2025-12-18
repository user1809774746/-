import React from 'react';

/**
 * 首页骨架屏组件
 * 模拟首页加载时的UI结构
 */
const HomePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部省份背景图区域 */}
      <div className="relative h-[300px] bg-gray-300 animate-pulse">
        <div className="absolute bottom-6 left-4 right-4">
          <div className="h-8 w-48 bg-gray-400 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-400 rounded"></div>
        </div>
      </div>

      {/* AI助手入口区域 */}
      <div className="px-4 -mt-6 relative z-10 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 热门推荐骨架屏 */}
      <div className="mb-6 mt-10">
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 px-4 pb-2">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
              >
                {/* 图片区域 */}
                <div className="h-40 bg-gray-300"></div>
                
                {/* 内容区域 */}
                <div className="p-3">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  
                  {/* 作者信息 */}
                  <div className="flex items-center mb-2">
                    <div className="w-5 h-5 rounded-full bg-gray-300 mr-1"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </div>
                  
                  {/* 互动数据 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-8 bg-gray-200 rounded"></div>
                      <div className="h-3 w-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 我的旅行计划骨架屏 */}
      <div className="mb-20 px-4 mt-10">
        <div className="flex items-center mb-3">
          <div className="h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
            >
              {/* 顶部信息区域 */}
              <div className="bg-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-6 w-40 bg-gray-300 rounded"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                </div>
                <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
              
              {/* 图片区域 */}
              <div className="p-4">
                <div className="h-24 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部导航栏骨架 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 animate-pulse">
        <div className="flex justify-around items-center h-16 px-2">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="h-3 w-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePageSkeleton;

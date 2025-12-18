import React from 'react';

/**
 * 发现页面骨架屏组件
 * 模拟发现页加载时的UI结构
 */
const DiscoverPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部搜索栏 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* 城市选择和宝藏景点区域 */}
      <div className="bg-white p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-48 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>

      {/* 旅游路线标题 */}
      <div className="px-4 mb-3">
        <div className="h-7 w-40 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* 旅游路线列表骨架 */}
      <div className="px-4 space-y-4 mb-20">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
          >
            {/* 图片区域 */}
            <div className="h-48 bg-gray-300"></div>
            
            {/* 内容区域 */}
            <div className="p-4">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
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

export default DiscoverPageSkeleton;

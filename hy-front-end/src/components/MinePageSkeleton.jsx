import React from 'react';

/**
 * 我的页面骨架屏组件
 * 模拟我的页面加载时的UI结构
 */
const MinePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部背景和用户信息卡片 */}
      <div className="relative">
        {/* 背景图片区域 */}
        <div className="h-48 bg-gray-300 animate-pulse"></div>
        
        {/* 用户信息卡片 */}
        <div className="absolute -bottom-16 left-4 right-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              {/* 头像 */}
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              
              {/* 用户信息 */}
              <div className="flex-1">
                <div className="h-6 w-32 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
              
              {/* 设置按钮 */}
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="px-4 mt-20 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="text-center">
                <div className="h-8 w-16 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-4 w-12 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最新帖子 */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 w-24 bg-gray-300 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="flex space-x-3">
            <div className="w-20 h-20 bg-gray-300 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能列表 */}
      <div className="px-4 space-y-4 mb-20">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm animate-pulse">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="h-5 w-32 bg-gray-300 rounded"></div>
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
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

export default MinePageSkeleton;

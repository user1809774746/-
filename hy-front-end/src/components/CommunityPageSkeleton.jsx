import React from 'react';

/**
 * 社区/消息页面骨架屏组件
 * 模拟社区页加载时的UI结构
 */
const CommunityPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* 背景占位 */}
      <div className="fixed inset-0 z-0">
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      </div>

      {/* 顶部导航栏骨架：标题 + 搜索图标 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="h-6 w-20 bg-gray-300 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
        </div>
      </div>

      {/* 内容区域骨架：新的好友申请 / 群聊入口 / 我的好友列表 */}
      <div className="flex-1 pb-20 relative z-10">
        <div className="mt-3 space-y-3 flex flex-col items-center">
          {/* 新的好友申请卡片骨架 */}
          <div className="bg-white mt-1 w-[90%] rounded-3xl border-b border-gray-200 px-4 py-3 flex items-center justify-between opacity-80 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3" />
              <div>
                <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-3 h-5 bg-gray-200 rounded-full" />
          </div>

          {/* 群聊入口卡片骨架 */}
          <div className="bg-white mt-1 w-[90%] rounded-3xl border-b border-gray-200 px-4 py-3 flex items-center justify-between opacity-80 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3" />
              <div>
                <div className="h-4 w-20 bg-gray-300 rounded mb-2" />
                <div className="h-3 w-28 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-3 h-5 bg-gray-200 rounded-full" />
          </div>

          {/* 我的好友列表卡片骨架 */}
          <div className="bg-white mt-1 w-[90%] rounded-3xl border border-gray-200 opacity-80">
            {/* 标题行 */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* 好友项列表骨架 */}
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="w-full px-4 py-3 flex items-center animate-pulse"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-4 w-24 bg-gray-300 rounded" />
                      <div className="h-3 w-16 bg-gray-200 rounded ml-2 flex-shrink-0" />
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航栏骨架 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 animate-pulse">
        <div className="flex justify-around items-center h-16 px-2">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div className="w-6 h-6 bg-gray-300 rounded" />
              <div className="h-3 w-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPageSkeleton;

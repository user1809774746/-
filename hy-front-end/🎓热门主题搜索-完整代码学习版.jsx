/*
 * ═══════════════════════════════════════════════════════════════════
 * 📚 热门主题搜索功能 - 完整学习版
 * ═══════════════════════════════════════════════════════════════════
 * 
 * 功能说明：
 * 1. 点击"更多"按钮，展开/收起全部热门主题
 * 2. 点击任意主题，将主题文本传递到搜索功能
 * 3. 跳转到DSreachPage页面，调用Dify API获取搜索结果
 * 
 * 学习要点：
 * - useState的使用（管理展开/收起状态）
 * - 数组展示（显示部分或全部）
 * - 点击事件处理和页面跳转
 * - 数据传递（从主题到搜索页面）
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';

// ═══════════════════════════════════════════════════════════════════
// 第一步：定义完整的热门主题数据
// ═══════════════════════════════════════════════════════════════════

const HotTopicsExample = ({ 
  onNavigateToDSreach,  // 跳转到搜索页面的回调函数
  onBack,               // 返回上一页的回调函数
}) => {
  
  // 🌟 所有热门主题数据（包括隐藏的主题）
  const allHotTopics = [
    { id: 1, name: '亲子乐园', icon: 'fa-solid fa-child', color: 'bg-red-100 text-red-600' },
    { id: 2, name: '周末时光', icon: 'fa-solid fa-calendar', color: 'bg-green-100 text-green-600' },
    { id: 3, name: '历史人文', icon: 'fa-solid fa-landmark', color: 'bg-yellow-100 text-yellow-600' },
    { id: 4, name: '美食探索', icon: 'fa-solid fa-utensils', color: 'bg-blue-100 text-blue-600' },
    // ✨ 新增的主题（点击"更多"后显示）
    { id: 5, name: '红色旅游', icon: 'fa-solid fa-flag', color: 'bg-red-100 text-red-700' },
    { id: 6, name: '主题公园', icon: 'fa-solid fa-ticket', color: 'bg-purple-100 text-purple-600' },
    { id: 7, name: '自然探索', icon: 'fa-solid fa-mountain', color: 'bg-green-100 text-green-700' },
    { id: 8, name: '科普教育', icon: 'fa-solid fa-book', color: 'bg-indigo-100 text-indigo-600' },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // 第二步：状态管理 - 控制主题列表的展开/收起
  // ═══════════════════════════════════════════════════════════════════
  
  // 📝 使用useState管理展开状态
  // false = 收起（只显示前4个），true = 展开（显示全部）
  const [showAllTopics, setShowAllTopics] = useState(false);

  // ═══════════════════════════════════════════════════════════════════
  // 第三步：根据状态决定显示哪些主题
  // ═══════════════════════════════════════════════════════════════════
  
  // 🎯 如果showAllTopics为true，显示全部；否则只显示前4个
  const displayedTopics = showAllTopics 
    ? allHotTopics  // 展开时：显示全部8个主题
    : allHotTopics.slice(0, 4);  // 收起时：只显示前4个主题

  // ═══════════════════════════════════════════════════════════════════
  // 第四步：点击"更多"按钮的处理函数
  // ═══════════════════════════════════════════════════════════════════
  
  const handleMoreClick = () => {
    // 💡 切换状态：如果是展开的就收起，如果是收起的就展开
    setShowAllTopics(!showAllTopics);
    console.log('点击更多按钮，当前状态:', showAllTopics ? '收起' : '展开');
  };

  // ═══════════════════════════════════════════════════════════════════
  // 第五步：点击主题的处理函数
  // ═══════════════════════════════════════════════════════════════════
  
  const handleTopicClick = (topicName) => {
    console.log('点击主题:', topicName);
    
    // 🚀 调用父组件传入的跳转函数，将主题名称作为搜索关键词传递
    if (onNavigateToDSreach) {
      onNavigateToDSreach(topicName);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 第六步：渲染界面
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800">发现之旅 - 学习示例</h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-6 px-4">
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 热门主题区域 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <div className="mb-6">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">热门主题</h2>
            
            {/* 🎯 "更多" 按钮 - 点击后展开/收起 */}
            <button 
              onClick={handleMoreClick}
              className="text-sm text-blue-600 flex items-center hover:text-blue-700 transition-colors"
            >
              {showAllTopics ? (
                <>
                  收起 <i className="ml-1 fa-solid fa-angle-up"></i>
                </>
              ) : (
                <>
                  更多 <i className="ml-1 fa-solid fa-angle-down"></i>
                </>
              )}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 主题网格 - 使用grid布局，每行4个 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          
          <div className="grid grid-cols-4 gap-4">
            {displayedTopics.map((topic) => (
              <div 
                key={topic.id} 
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleTopicClick(topic.name)}
              >
                {/* 主题图标 */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${topic.color} shadow-sm`}>
                  <i className={`${topic.icon} text-xl`}></i>
                </div>
                
                {/* 主题名称 */}
                <span className="text-xs text-gray-700 text-center font-medium">
                  {topic.name}
                </span>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 提示信息 - 帮助用户理解当前状态 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 当前显示: {displayedTopics.length}/{allHotTopics.length} 个主题
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {showAllTopics ? '✓ 已展开全部主题' : '点击"更多"查看所有主题'}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 功能说明卡片 - 帮助理解代码逻辑 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
            <i className="fa-solid fa-lightbulb text-yellow-500 mr-2"></i>
            实现原理说明
          </h3>
          
          <div className="space-y-3 text-sm">
            {/* 步骤1 */}
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-800">定义完整主题数据</p>
                <p className="text-gray-600 text-xs mt-1">
                  创建包含所有8个主题的数组 <code className="bg-gray-100 px-1 py-0.5 rounded">allHotTopics</code>
                </p>
              </div>
            </div>

            {/* 步骤2 */}
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-800">状态管理</p>
                <p className="text-gray-600 text-xs mt-1">
                  使用 <code className="bg-gray-100 px-1 py-0.5 rounded">useState(false)</code> 管理展开/收起状态
                </p>
              </div>
            </div>

            {/* 步骤3 */}
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-800">条件显示</p>
                <p className="text-gray-600 text-xs mt-1">
                  根据状态决定显示前4个还是全部8个主题
                </p>
                <code className="block bg-gray-100 px-2 py-1 rounded text-xs mt-1 overflow-x-auto">
                  {showAllTopics ? 'allHotTopics' : 'allHotTopics.slice(0, 4)'}
                </code>
              </div>
            </div>

            {/* 步骤4 */}
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-medium text-gray-800">点击主题搜索</p>
                <p className="text-gray-600 text-xs mt-1">
                  调用 <code className="bg-gray-100 px-1 py-0.5 rounded">onNavigateToDSreach(主题名)</code> 跳转到搜索页
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 关键代码片段展示 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
            <i className="fa-solid fa-code text-green-400 mr-2"></i>
            关键代码片段
          </h3>
          
          <pre className="text-xs text-green-400 overflow-x-auto">
{`// 1. 状态管理
const [showAllTopics, setShowAllTopics] = useState(false);

// 2. 条件显示
const displayedTopics = showAllTopics 
  ? allHotTopics 
  : allHotTopics.slice(0, 4);

// 3. 切换展开/收起
const handleMoreClick = () => {
  setShowAllTopics(!showAllTopics);
};

// 4. 点击主题搜索
const handleTopicClick = (topicName) => {
  onNavigateToDSreach(topicName);
};`}
          </pre>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 数据流向图 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <i className="fa-solid fa-route text-purple-600 mr-2"></i>
            数据流向
          </h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white px-3 py-1 rounded">点击主题</div>
              <i className="fa-solid fa-arrow-right mx-2 text-gray-400"></i>
              <div className="bg-green-500 text-white px-3 py-1 rounded">handleTopicClick</div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-green-500 text-white px-3 py-1 rounded">传递主题名称</div>
              <i className="fa-solid fa-arrow-right mx-2 text-gray-400"></i>
              <div className="bg-purple-500 text-white px-3 py-1 rounded">onNavigateToDSreach</div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-purple-500 text-white px-3 py-1 rounded">跳转到DSreachPage</div>
              <i className="fa-solid fa-arrow-right mx-2 text-gray-400"></i>
              <div className="bg-orange-500 text-white px-3 py-1 rounded">调用Dify API</div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-orange-500 text-white px-3 py-1 rounded">获取搜索结果</div>
              <i className="fa-solid fa-arrow-right mx-2 text-gray-400"></i>
              <div className="bg-red-500 text-white px-3 py-1 rounded">展示到前端</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 导出组件
// ═══════════════════════════════════════════════════════════════════

export default HotTopicsExample;


// ═══════════════════════════════════════════════════════════════════
// 📚 如何在你的项目中使用
// ═══════════════════════════════════════════════════════════════════
/*

在 DiscoverPage.jsx 中集成：

1. 复制 allHotTopics 数组（第17-24行）替换原来的 hotTopics

2. 添加状态管理（在组件顶部）：
   const [showAllTopics, setShowAllTopics] = useState(false);

3. 添加条件显示逻辑：
   const displayedTopics = showAllTopics 
     ? allHotTopics 
     : allHotTopics.slice(0, 4);

4. 添加点击处理函数：
   const handleMoreClick = () => {
     setShowAllTopics(!showAllTopics);
   };
   
   const handleTopicClick = (topicName) => {
     onNavigateToDSreach(topicName);
   };

5. 修改渲染部分（第705-720行）：
   - 将 hotTopics.map 改为 displayedTopics.map
   - 添加"更多"按钮
   - 给主题添加点击事件

详细步骤：

第1步 - 在第512行附近，将原来的 hotTopics 数组替换为：
────────────────────────────────────────────────────────────────
const allHotTopics = [
  { id: 1, name: '亲子乐园', icon: 'fa-solid fa-child', color: 'bg-red-100 text-red-600' },
  { id: 2, name: '周末时光', icon: 'fa-solid fa-calendar', color: 'bg-green-100 text-green-600' },
  { id: 3, name: '历史人文', icon: 'fa-solid fa-landmark', color: 'bg-yellow-100 text-yellow-600' },
  { id: 4, name: '美食探索', icon: 'fa-solid fa-utensils', color: 'bg-blue-100 text-blue-600' },
  { id: 5, name: '红色旅游', icon: 'fa-solid fa-flag', color: 'bg-red-100 text-red-700' },
  { id: 6, name: '主题公园', icon: 'fa-solid fa-ticket', color: 'bg-purple-100 text-purple-600' },
  { id: 7, name: '自然探索', icon: 'fa-solid fa-mountain', color: 'bg-green-100 text-green-700' },
  { id: 8, name: '科普教育', icon: 'fa-solid fa-book', color: 'bg-indigo-100 text-indigo-600' },
];
────────────────────────────────────────────────────────────────

第2步 - 在第21行附近添加状态（在 const [searchText,setSearchText]=useState(''); 下面）：
────────────────────────────────────────────────────────────────
const [showAllTopics, setShowAllTopics] = useState(false);
────────────────────────────────────────────────────────────────

第3步 - 在热门主题数据定义后面添加：
────────────────────────────────────────────────────────────────
const displayedTopics = showAllTopics 
  ? allHotTopics 
  : allHotTopics.slice(0, 4);
────────────────────────────────────────────────────────────────

第4步 - 在 handleSearchKeyPress 函数后面添加：
────────────────────────────────────────────────────────────────
const handleMoreClick = () => {
  setShowAllTopics(!showAllTopics);
};

const handleTopicClick = (topicName) => {
  if (onNavigateToDSreach) {
    onNavigateToDSreach(topicName);
  }
};
────────────────────────────────────────────────────────────────

第5步 - 修改热门主题渲染部分（第704-720行）：
────────────────────────────────────────────────────────────────
<div className="px-4 mb-6">
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-lg font-semibold text-gray-800">热门主题</h2>
    <button 
      onClick={handleMoreClick}
      className="text-sm text-blue-600 flex items-center"
    >
      {showAllTopics ? '收起' : '更多'} 
      <i className={`ml-1 fa-solid ${showAllTopics ? 'fa-angle-up' : 'fa-angle-down'}`}></i>
    </button>
  </div>
  
  <div className="grid grid-cols-4 gap-4">
    {displayedTopics.map((topic) => (
      <div 
        key={topic.id} 
        className="flex flex-col items-center cursor-pointer"
        onClick={() => handleTopicClick(topic.name)}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${topic.color}`}>
          <i className={`${topic.icon} text-xl`}></i>
        </div>
        <span className="text-xs text-gray-700 text-center">{topic.name}</span>
      </div>
    ))}
  </div>
</div>
────────────────────────────────────────────────────────────────

完成！现在你的热门主题功能就可以：
✓ 点击"更多"展开/收起全部主题
✓ 点击任意主题跳转到搜索页面
✓ DSreachPage会接收主题名称并调用Dify API

测试步骤：
1. 刷新页面，应该只看到前4个主题
2. 点击"更多"，应该展开显示全部8个主题
3. 再次点击"收起"，应该恢复显示前4个
4. 点击任意主题（如"红色旅游"），应该跳转到搜索页面并显示搜索结果

*/


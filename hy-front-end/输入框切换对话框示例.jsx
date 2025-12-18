import React, { useState } from 'react';

/**
 * 输入框和对话框切换示例
 * 
 * 功能：
 * 1. 默认显示输入框模式（出发地和目的地输入框）
 * 2. 点击切换按钮，变成对话框模式
 * 3. 对话框有渐变边框（蓝色到紫色）
 * 4. 对话框左下角有"一键生成"按钮
 */

export default function InputDialogSwitchExample() {
  // 状态管理
  const [isDialogMode, setIsDialogMode] = useState(false); // false=输入框模式, true=对话框模式
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dialogText, setDialogText] = useState(''); // 对话框的文本内容

  // 切换模式
  const toggleMode = () => {
    setIsDialogMode(!isDialogMode);
  };

  // 处理搜索（输入框模式）
  const handleSearch = () => {
    if (!from || !to) {
      alert('请输入出发地和目的地');
      return;
    }
    console.log('搜索路线:', from, '到', to);
    // 这里调用你的路线规划功能
  };

  // 处理一键生成（对话框模式）
  const handleGenerate = () => {
    if (!dialogText.trim()) {
      alert('请输入您的需求');
      return;
    }
    console.log('一键生成，输入内容:', dialogText);
    // 这里调用AI接口生成路线
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-md mx-auto">
        
        {/* 标题和切换按钮 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">路线规划</h1>
          
          {/* 切换按钮 */}
          <button
            onClick={toggleMode}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <img 
              src="/imge/切换.png" 
              alt="切换" 
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">
              {isDialogMode ? '输入框模式' : '对话框模式'}
            </span>
          </button>
        </div>

        {/* 根据模式显示不同的内容 */}
        {!isDialogMode ? (
          /* ============ 输入框模式 ============ */
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">输入出发地和目的地</h2>
            
            {/* 出发地输入框 */}
            <div className="relative flex items-center mb-4">
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="出发地"
              />
              <i className="absolute right-3 text-gray-400 fa-solid fa-location-dot"></i>
            </div>
            
            {/* 目的地输入框 */}
            <div className="relative flex items-center mb-4">
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="目的地"
              />
              <i className="absolute right-3 text-gray-400 fa-solid fa-flag-checkered"></i>
            </div>
            
            {/* 搜索按钮 */}
            <button 
              onClick={handleSearch}
              className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🔍 一键规划路线
            </button>
          </div>
        ) : (
          /* ============ 对话框模式 ============ */
          <div 
            className="relative p-1 rounded-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #a855f7)', // 蓝色到紫色渐变边框
              padding: '3px' // 边框宽度
            }}
          >
            {/* 内部白色容器 */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                💬 智能对话规划
              </h2>
              
              {/* 对话框文本域 */}
              <textarea
                value={dialogText}
                onChange={(e) => setDialogText(e.target.value)}
                className="w-full h-40 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="请描述您的行程需求，例如：&#10;我想从北京到上海，希望最快到达&#10;或者&#10;帮我规划从公司到家的路线，避开拥堵"
              />
              
              {/* 左下角按钮 */}
              <div className="mt-4 flex justify-start">
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
                >
                  ✨ 一键生成
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>提示：</strong>
            {isDialogMode 
              ? '在对话框中描述您的需求，AI将为您智能规划路线'
              : '输入起点和终点，快速规划最佳路线'
            }
          </p>
        </div>

        {/* 示例代码说明 */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">📝 核心代码说明</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• 使用 useState 管理模式切换</p>
            <p>• 渐变边框使用 linear-gradient</p>
            <p>• 切换按钮带图标和文字</p>
            <p>• 对话框使用 textarea 支持多行输入</p>
            <p>• 按钮位置通过 flex justify-start 控制</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 方案二：更紧凑的实现（可以直接用在你的项目中）
// ============================================================

export function CompactSwitchExample() {
  const [isDialogMode, setIsDialogMode] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dialogText, setDialogText] = useState('');

  return (
    <div className="px-1 relative mt-2">
      {/* 切换按钮 */}
      <div className="flex justify-end px-5 mb-2">
        <button
          onClick={() => setIsDialogMode(!isDialogMode)}
          className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg shadow text-sm"
        >
          <img src="/imge/切换.png" alt="切换" className="w-4 h-4" />
          <span>{isDialogMode ? '输入框' : '对话框'}</span>
        </button>
      </div>

      {!isDialogMode ? (
        /* 输入框模式 */
        <div className="px-5 py-2 border-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 mx-5">
          <div className="relative flex items-center mb-3 mt-2">
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              placeholder="出发地"
            />
            <i className="absolute right-3 text-gray-400 fa-solid fa-location-dot"></i>
          </div>
          
          <div className="relative flex items-center mb-3">
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              placeholder="目的地"
            />
            <i className="absolute right-3 text-gray-400 fa-solid fa-flag-checkered"></i>
          </div>
          
          <button 
            className="w-full py-3 text-white bg-blue-600 rounded-lg mb-2"
          >
            一键规划路线
          </button>
        </div>
      ) : (
        /* 对话框模式 - 渐变边框 */
        <div 
          className="mx-5 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
            padding: '3px'
          }}
        >
          <div className="bg-white rounded-lg p-4">
            <textarea
              value={dialogText}
              onChange={(e) => setDialogText(e.target.value)}
              className="w-full h-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none resize-none"
              placeholder="请描述您的出行需求..."
            />
            
            {/* 左下角按钮 */}
            <div className="mt-3 flex justify-start">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium">
                一键生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 方案三：高级版本（带动画效果）
// ============================================================

export function AnimatedSwitchExample() {
  const [isDialogMode, setIsDialogMode] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dialogText, setDialogText] = useState('');

  return (
    <div className="px-1 relative mt-2">
      {/* 切换按钮（带动画） */}
      <div className="flex justify-end px-5 mb-3">
        <button
          onClick={() => setIsDialogMode(!isDialogMode)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"
        >
          <img 
            src="/imge/切换.png" 
            alt="切换" 
            className="w-5 h-5 transition-transform duration-300"
            style={{ transform: isDialogMode ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          <span className="text-sm font-medium">
            {isDialogMode ? '切换到输入框' : '切换到对话框'}
          </span>
        </button>
      </div>

      {/* 内容区域（带淡入淡出动画） */}
      <div 
        className="transition-all duration-300"
        style={{
          opacity: 1,
          transform: 'translateY(0)'
        }}
      >
        {!isDialogMode ? (
          /* 输入框模式 */
          <div className="px-5 py-4 border-2 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 mx-5 shadow-md">
            <div className="relative mb-3">
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="🚩 出发地"
              />
            </div>
            
            <div className="relative mb-3">
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="🏁 目的地"
              />
            </div>
            
            <button className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium">
              🔍 一键规划路线
            </button>
          </div>
        ) : (
          /* 对话框模式 - 渐变边框 + 阴影 */
          <div 
            className="mx-5 rounded-xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%)',
              padding: '3px'
            }}
          >
            <div className="bg-white rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💬</span>
                <h3 className="text-base font-semibold text-gray-700">智能对话规划</h3>
              </div>
              
              <textarea
                value={dialogText}
                onChange={(e) => setDialogText(e.target.value)}
                className="w-full h-36 px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 resize-none transition-all"
                placeholder="请描述您的出行需求，例如：&#10;&#10;• 我想从北京到上海，最快的方式&#10;• 从公司到家，避开拥堵&#10;• 周末去杭州西湖，经济实惠的方案"
              />
              
              {/* 左下角按钮 */}
              <div className="mt-4 flex justify-start">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg font-medium transform hover:scale-105">
                  ✨ 一键生成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="mt-4 px-5">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-gray-600 text-center">
            {isDialogMode 
              ? '💡 使用自然语言描述，AI为您智能规划' 
              : '💡 快速输入起点终点，即刻规划路线'}
          </p>
        </div>
      </div>
    </div>
  );
}



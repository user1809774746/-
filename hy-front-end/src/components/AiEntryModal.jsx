import React from 'react';

const AiEntryModal = ({ visible, onClose, onGeneratePlan, onChat }) => {
  if (!visible) return null;

  const handleWrapperClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleGeneratePlan = () => {
    if (onGeneratePlan) {
      onGeneratePlan();
    }
  };

  const handleChat = () => {
    if (onChat) {
      onChat();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleWrapperClick}
    >
      <div className="w-72 rounded-3xl text-white px-5 py-5 shadow-2xl relative"style={{backgroundImage:'url("/我的旅行计划卡片背景.jpg")',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
        {/* <div className="flex items-center justify-between mb-4">
          <div className="text-sm">创建新的行程</div>
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-black text-lg">
            +
          </div>
        </div> */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full bg-white rounded-2xl px-4 py-3 flex items-center justify-between text-left text-gray-900 active:scale-95 transition-transform"
            onClick={handleGeneratePlan}
          >
            <div>
              <div className="text-sm font-semibold">小精灵生成旅行规划</div>
              <div className="text-xs text-gray-500 mt-1">
                自动规划行程天数与玩法
              </div>
            </div>
            <span className="text-lg">➜</span>
          </button>
          <button
            type="button"
            className="w-full bg-white rounded-2xl px-4 py-3 flex items-center justify-between text-left text-gray-900 active:scale-95 transition-transform"
            onClick={handleChat}
          >
            <div>
              <div className="text-sm font-semibold">和小精灵聊天</div>
              <div className="text-xs text-gray-500 mt-1">
                随便聊聊旅途灵感和问题
              </div>
            </div>
            <span className="text-lg">➜</span>
          </button>
        </div>
        <button
          type="button"
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-md active:scale-95"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AiEntryModal;

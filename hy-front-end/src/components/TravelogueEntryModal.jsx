import React from 'react';

const TravelogueEntryModal = ({ visible, onClose, onWriteMyself, onAiWrite }) => {
  if (!visible) return null;

  const handleWrapperClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleWrapperClick}
    >
      <div className="w-72 rounded-3xl text-white px-5 py-5 shadow-2xl relative" style={{backgroundImage:'url("/我的旅行计划卡片背景.jpg")',backgroundSize:'cover',backgroundRepeat:'no-repeat',backgroundPosition:'center'}}>
        <div className="space-y-3">
          <button
            type="button"
            className="w-full bg-white rounded-2xl px-4 py-3 flex items-center justify-between text-left text-gray-900 active:scale-95 transition-transform"
            onClick={onWriteMyself}
          >
            <div>
              <div className="text-sm font-semibold">自己写游记</div>
              <div className="text-xs text-gray-500 mt-1">
                记录旅途中的美好回忆
              </div>
            </div>
            
          </button>
          <button
            type="button"
            className="w-full bg-white rounded-2xl px-4 py-3 flex items-center justify-between text-left text-gray-900 active:scale-95 transition-transform"
            onClick={onAiWrite}
          >
            <div>
              <div className="text-sm font-semibold">小精灵帮你写</div>
              <div className="text-xs text-gray-500 mt-1">
                智能生成精美的游记内容
              </div>
            </div>
           
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

export default TravelogueEntryModal;
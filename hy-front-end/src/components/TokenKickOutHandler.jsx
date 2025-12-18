import React, { useState, useEffect } from 'react'

const TokenKickOutHandler = ({ onConfirm }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [kickOutInfo, setKickOutInfo] = useState(null)

  // 显示顶号提示
  const showKickOutDialog = (error, url) => {
    setKickOutInfo({
      error,
      url,
      timestamp: new Date().toLocaleString()
    })
    setIsVisible(true)
  }

  // 确认处理
  const handleConfirm = () => {
    setIsVisible(false)
    setKickOutInfo(null)
    if (onConfirm) {
      onConfirm()
    }
  }

  // 暴露显示方法给外部调用
  useEffect(() => {
    // 将显示方法挂载到全局，供API配置调用
    window.showTokenKickOutDialog = showKickOutDialog
    
    return () => {
      // 清理
      delete window.showTokenKickOutDialog
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        {/* 图标 */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fa-solid fa-exclamation-triangle text-orange-500 text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-800">账号异地登录</h3>
        </div>

        {/* 提示内容 */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">
            您的账号在其他设备登录
          </p>
          <p className="text-gray-500 text-sm">
            为了保护账号安全，当前登录已失效
          </p>
          {kickOutInfo && (
            <p className="text-gray-400 text-xs mt-2">
              时间：{kickOutInfo.timestamp}
            </p>
          )}
        </div>

        {/* 安全提示 */}
        <div className="bg-blue-50 rounded-lg p-3 mb-6">
          <div className="flex items-start">
            <i className="fa-solid fa-shield-alt text-blue-500 text-sm mt-0.5 mr-2"></i>
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">安全提示：</p>
              <p>如果不是您本人操作，请立即修改密码</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fa-solid fa-sign-in-alt mr-2"></i>
            重新登录
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenKickOutHandler

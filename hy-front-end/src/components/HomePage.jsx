import React, { useState } from 'react'

const HomePage = ({ onPlanRoute, onNavigateToAMap, onLogout }) => {
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
  const userPhone = localStorage.getItem('user_phone') || '用户'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (startLocation.trim() && endLocation.trim()) {
      onPlanRoute(startLocation.trim(), endLocation.trim())
    }
  }

  const handleGetCurrentLocation = () => {
    // 配置安全密钥（必须在加载API前配置）
    window._AMapSecurityConfig = {
      securityJsCode: amapConfig.securityKey,
    };
    console.log('初始化securityKey');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setStartLocation(`${latitude}, ${longitude}`)
        },
        (error) => {
          console.error('获取位置失败:', error)
          alert('无法获取当前位置，请手动输入')
        }
      )
    } else {
      alert('浏览器不支持地理定位')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">👋 你好，{userPhone.substring(0, 3)}****{userPhone.substring(7)}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              退出
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            路线规划助手
          </h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            智能路线规划，让出行更便捷
          </p>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* 主要卡片 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 起点输入 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  我的位置
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="请输入起点地址或获取当前位置"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 目的地输入 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  目的地
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    placeholder="请输入目的地地址"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 一键规划按钮 */}
              <button
                type="submit"
                disabled={!startLocation.trim() || !endLocation.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-indigo-600 shadow-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>一键规划路线</span>
                </div>
              </button>
            </form>
          </div>

          {/* 功能特色 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-800">智能规划</h3>
                <p className="text-xs text-gray-500 mt-1">AI智能路线</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-800">实时导航</h3>
                <p className="text-xs text-gray-500 mt-1">实时路况</p>
              </div>
            </div>
            <button
              onClick={onNavigateToAMap}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🗺️</span>
                </div>
                <h3 className="text-sm font-medium text-gray-800">高德地图</h3>
                <p className="text-xs text-gray-500 mt-1">地点搜索</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage



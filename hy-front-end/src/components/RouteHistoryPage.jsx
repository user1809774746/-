import React, { useState, useEffect } from 'react'
import { getRouteHistory, deleteRouteHistory, toggleRouteFavorite } from '../api/config'

const RouteHistoryPage = ({ onBack, onSelectRoute }) => {
  const [historyList, setHistoryList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all' 或 'favorites'

  // 加载历史记录
  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getRouteHistory()
      
      if (response && response.code === 200) {
        setHistoryList(response.data.list || [])
      } else {
        throw new Error(response?.message || '获取历史记录失败')
      }
    } catch (err) {
      console.error('加载历史记录失败:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取历史记录
  useEffect(() => {
    loadHistory()
  }, [])

  // 删除历史记录
  const handleDelete = async (historyId) => {
    if (!confirm('确定要删除这条历史记录吗？')) {
      return
    }

    try {
      await deleteRouteHistory(historyId)
      // 重新加载历史记录
      await loadHistory()
      alert('删除成功')
    } catch (err) {
      console.error('删除失败:', err)
      alert('删除失败：' + err.message)
    }
  }

  // 切换收藏状态
  const handleToggleFavorite = async (historyId) => {
    try {
      await toggleRouteFavorite(historyId)
      // 重新加载历史记录
      await loadHistory()
    } catch (err) {
      console.error('收藏操作失败:', err)
      alert('操作失败：' + err.message)
    }
  }

  // 选择路线进行规划
  const handleSelectRoute = (history) => {
    if (onSelectRoute) {
      onSelectRoute({
        start: history.departure,
        end: history.destination,
        startLat: history.departureLat,
        startLng: history.departureLng,
        endLat: history.destinationLat,
        endLng: history.destinationLng
      })
    }
  }

  // 格式化时间
  const formatTime = (timeStr) => {
    try {
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else if (days === 1) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else if (days < 7) {
        return `${days}天前`
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    } catch (err) {
      return timeStr
    }
  }

  // 获取路线类型显示文本
  const getRouteTypeText = (routeType) => {
    const typeMap = {
      'driving': '🚗 驾车',
      'walking': '🚶 步行',
      'transit': '🚌 公交',
      'cycling': '🚴 骑行'
    }
    return typeMap[routeType] || '🚗 驾车'
  }

  // 过滤历史记录
  const filteredHistory = activeTab === 'favorites' 
    ? historyList.filter(item => item.isFavorite)
    : historyList

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-lg font-semibold text-gray-800">路线历史</h1>
            <div className="w-12"></div>
          </div>
          
          {/* 标签页 */}
          <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              全部记录
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              我的收藏
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-md mx-auto px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-gray-500">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>加载中...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
            <button
              onClick={loadHistory}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              重新加载
            </button>
          </div>
        )}

        {!loading && !error && filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              {activeTab === 'favorites' ? '暂无收藏的路线' : '暂无历史记录'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {activeTab === 'favorites' ? '收藏常用路线，方便快速查找' : '开始规划路线，记录将显示在这里'}
            </p>
          </div>
        )}

        {/* 历史记录列表 */}
        <div className="space-y-3">
          {filteredHistory.map((history) => (
            <div key={history.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* 路线信息 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                      {getRouteTypeText(history.routeType)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(history.searchTime)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-800 truncate">{history.departure}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-800 truncate">{history.destination}</span>
                    </div>
                  </div>
                  
                  {/* 距离和时长 */}
                  {(history.distance || history.duration) && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {history.distance && (
                        <span>📏 {history.distance}km</span>
                      )}
                      {history.duration && (
                        <span>⏱️ {history.duration}分钟</span>
                      )}
                    </div>
                  )}
                  
                  {/* 备注 */}
                  {history.notes && (
                    <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2">
                      💭 {history.notes}
                    </p>
                  )}
                </div>
                
                {/* 收藏按钮 */}
                <button
                  onClick={() => handleToggleFavorite(history.id)}
                  className={`ml-2 p-2 rounded-lg transition-colors ${
                    history.isFavorite
                      ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill={history.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSelectRoute(history)}
                  className="flex-1 bg-blue-500 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  重新规划
                </button>
                <button
                  onClick={() => handleDelete(history.id)}
                  className="px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RouteHistoryPage

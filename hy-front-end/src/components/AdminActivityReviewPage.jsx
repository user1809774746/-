import React, { useState, useEffect } from 'react'
import API_CONFIG, {
  getPendingActivities,
  getReportedActivities,
  auditActivity,
  getActivityDetail
} from '../api/config'


const AdminActivityReviewPage = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState('pending') // pending, reported, statistics
  const [pendingActivities, setPendingActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) // 后端使用0开始的页码
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)
  
  // 被举报活动列表
  const [reportedActivities, setReportedActivities] = useState([])
  const [reportedPage, setReportedPage] = useState(0)
  const [reportedTotalPages, setReportedTotalPages] = useState(1)
  const [reportedTotalElements, setReportedTotalElements] = useState(0)
  
  // 审核弹窗
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [currentActivityId, setCurrentActivityId] = useState(null)
  const [auditAction, setAuditAction] = useState('') // 'approve' or 'reject'
  const [auditReason, setAuditReason] = useState('')
  
  // 详情弹窗
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [currentActivityDetail, setCurrentActivityDetail] = useState(null)

  const DEFAULT_ACTIVITY_IMAGES = ['/活动图片1.jpg', '/活动图片2.jpg', '/活动图片3.jpg']

  const buildActivityMediaUrl = (url) => {
    if (!url || typeof url !== 'string') {
      return ''
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    if (url.startsWith('/api/')) {
      return `${API_CONFIG.BASE_URL || ''}${url}`
    }
    return url
  }

  const getMediaFromActivity = (activity) => {
    if (!activity) {
      return {
        imageUrls: [],
        videoUrls: [],
        coverImageUrl: DEFAULT_ACTIVITY_IMAGES[0]
      }
    }

    const rawImages = typeof activity.images === 'string' ? activity.images : ''
    const rawVideos = typeof activity.videos === 'string' ? activity.videos : ''

    const imageUrls = Array.from(new Set(
      rawImages
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
        .map((url) => buildActivityMediaUrl(url))
    ))

    const videoUrls = Array.from(new Set(
      rawVideos
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
        .map((url) => buildActivityMediaUrl(url))
    ))


    const defaultCover = DEFAULT_ACTIVITY_IMAGES[(activity.id || 0) % DEFAULT_ACTIVITY_IMAGES.length]

    const primaryCover =
      (activity.coverImage && activity.coverImage.trim().length > 0
        ? activity.coverImage.trim()
        : null) ||
      (imageUrls.length > 0 ? imageUrls[0] : null) ||
      defaultCover

    const coverImageUrl = buildActivityMediaUrl(primaryCover)

    return { imageUrls, videoUrls, coverImageUrl }
  }


  useEffect(() => {

    loadData()
  }, [activeTab, currentPage, reportedPage])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'pending') {
        await loadPendingActivities()
      } else if (activeTab === 'reported') {
        await loadReportedActivities()
      } else if (activeTab === 'statistics') {
        await loadPendingActivities()
        await loadReportedActivities()
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPendingActivities = async () => {
    try {
      const response = await getPendingActivities(currentPage, pageSize)
      if (response.code === 200) {
        setPendingActivities(response.data.content || [])
        setTotalPages(response.data.totalPages || 1)
        setTotalElements(response.data.totalElements || 0)
      } else {
        console.error('获取待审核活动失败:', response.message)
        setPendingActivities([])
      }
    } catch (error) {
      console.error('获取待审核活动失败:', error)
      setPendingActivities([])
    }
  }
  
  const loadReportedActivities = async () => {
    try {
      const response = await getReportedActivities(reportedPage, pageSize)
      if (response.code === 200) {
        setReportedActivities(response.data.content || [])
        setReportedTotalPages(response.data.totalPages || 1)
        setReportedTotalElements(response.data.totalElements || 0)
      } else {
        console.error('获取被举报活动失败:', response.message)
        setReportedActivities([])
      }
    } catch (error) {
      console.error('获取被举报活动失败:', error)
      setReportedActivities([])
    }
  }

  const handleAuditClick = (activityId, action) => {
    setCurrentActivityId(activityId)
    setAuditAction(action)
    setAuditReason('')
    setShowAuditDialog(true)
  }

  const handleAuditConfirm = async () => {
    if (!currentActivityId || !auditAction) return

    try {
      const approve = auditAction === 'approve'
      const response = await auditActivity(currentActivityId, approve, auditReason)
      
      if (response.code === 200) {
        alert(approve ? '活动已通过审核' : '活动已被拒绝')
        setShowAuditDialog(false)
        setCurrentActivityId(null)
        setAuditAction('')
        setAuditReason('')
        // 重新加载数据
        loadData()
      } else {
        alert('审核失败: ' + response.message)
      }
    } catch (error) {
      console.error('审核失败:', error)
      alert('审核失败: ' + error.message)
    }
  }

  const handleViewDetail = async (activityId) => {
    try {
      const response = await getActivityDetail(activityId)
      if (response.code === 200) {
        setCurrentActivityDetail(response.data)
        setShowDetailDialog(true)
      } else {
        alert('获取活动详情失败: ' + response.message)
      }
    } catch (error) {
      console.error('获取活动详情失败:', error)
      alert('获取活动详情失败: ' + error.message)
    }
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    return new Date(dateTimeString).toLocaleString('zh-CN')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'draft': { text: '草稿', class: 'bg-gray-100 text-gray-800' },
      'published': { text: '已发布', class: 'bg-green-100 text-green-800' },
      'ongoing': { text: '进行中', class: 'bg-blue-100 text-blue-800' },
      'completed': { text: '已完成', class: 'bg-purple-100 text-purple-800' },
      'cancelled': { text: '已取消', class: 'bg-red-100 text-red-800' },
      'postponed': { text: '已延期', class: 'bg-yellow-100 text-yellow-800' }
    }
    const config = statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.class}`}>
        {config.text}
      </span>
    )
  }

  const getAuditStatusBadge = (auditStatus) => {
    const statusMap = {
      'pending': { text: '待审核', class: 'bg-yellow-100 text-yellow-800' },
      'approved': { text: '已通过', class: 'bg-green-100 text-green-800' },
      'rejected': { text: '已拒绝', class: 'bg-red-100 text-red-800' }
    }
    const config = statusMap[auditStatus] || { text: auditStatus, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.class}`}>
        {config.text}
      </span>
    )
  }

  const mediaForDialog =
    currentActivityDetail && currentActivityDetail.activity
      ? getMediaFromActivity(currentActivityDetail.activity)
      : {
          imageUrls: [],
          videoUrls: [],
          coverImageUrl: DEFAULT_ACTIVITY_IMAGES[0]
        }

  return (

    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            <h1 className="text-2xl font-bold text-gray-800">活动审核管理系统</h1>
            <button
              onClick={() => {
                if (confirm('确定要退出管理后台吗？')) {
                  localStorage.clear()
                  window.location.reload()
                }
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              退出登录
            </button>

          </div>
        </div>
      </div>

      {/* 标签栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('pending')
                setCurrentPage(0)
              }}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              待审核活动
            </button>
            <button
              onClick={() => {
                setActiveTab('reported')
                setReportedPage(0)
              }}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'reported'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              被举报活动
            </button>

            <button
              onClick={() => {
                setActiveTab('statistics')
              }}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              统计信息
            </button>

          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'pending' && (
          <div>
            {/* 统计信息 */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">待审核活动</h2>
                  <p className="text-sm text-gray-500">共 {totalElements} 个活动待审核</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{totalElements}</div>
                  <div className="text-xs text-gray-500">待处理</div>
                </div>
              </div>
            </div>

            {/* 活动列表 */}
            <div className="bg-white rounded-lg shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  <span>加载中...</span>
                </div>
              ) : pendingActivities.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fa-solid fa-calendar-check text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">暂无待审核的活动</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingActivities.map((activity) => (
                    <div key={activity.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-medium text-gray-800 line-clamp-1">
                              {activity.title}
                            </h4>
                            {getStatusBadge(activity.status)}
                            {getAuditStatusBadge(activity.auditStatus)}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {activity.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">组织者：</span>
                              {activity.organizerName || '未知'}
                            </div>
                            <div>
                              <span className="font-medium">活动时间：</span>
                              {formatDateTime(activity.startTime)}
                            </div>
                            <div>
                              <span className="font-medium">地点：</span>
                              {activity.locationName || '未设置'}
                            </div>
                            <div>
                              <span className="font-medium">创建时间：</span>
                              {formatDateTime(activity.createdTime)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          <button
                            onClick={() => handleViewDetail(activity.id)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            查看详情
                          </button>
                          <button
                            onClick={() => handleAuditClick(activity.id, 'approve')}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleAuditClick(activity.id, 'reject')}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            拒绝
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    第 {currentPage + 1} 页，共 {totalPages} 页
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reported' && (
          <div>
            {/* 被举报活动统计信息 */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">被举报活动</h2>
                  <p className="text-sm text-gray-500">共 {reportedTotalElements} 个活动被举报</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{reportedTotalElements}</div>
                  <div className="text-xs text-gray-500">待处理举报</div>
                </div>
              </div>
            </div>

            {/* 被举报活动列表 */}
            <div className="bg-white rounded-lg shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  <span>加载中...</span>
                </div>
              ) : reportedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fa-solid fa-triangle-exclamation text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">暂无被举报的活动</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reportedActivities.map((activity) => (
                    <div key={activity.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-medium text-gray-800 line-clamp-1">
                              {activity.title}
                            </h4>
                            {getStatusBadge(activity.status)}
                            {getAuditStatusBadge(activity.auditStatus)}
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {activity.description}
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">组织者：</span>
                              {activity.organizerName || '未知'}
                            </div>
                            <div>
                              <span className="font-medium">活动时间：</span>
                              {formatDateTime(activity.startTime)}
                            </div>
                            <div>
                              <span className="font-medium">地点：</span>
                              {activity.locationName || '未设置'}
                            </div>
                            <div>
                              <span className="font-medium">创建时间：</span>
                              {formatDateTime(activity.createdTime)}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col space-y-2">
                          <button
                            onClick={() => handleViewDetail(activity.id)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            查看详情
                          </button>
                          <button
                            onClick={() => handleAuditClick(activity.id, 'approve')}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleAuditClick(activity.id, 'reject')}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            拒绝
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 分页 */}
              {reportedTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    第 {reportedPage + 1} 页，共 {reportedTotalPages} 页
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setReportedPage(Math.max(0, reportedPage - 1))}
                      disabled={reportedPage === 0}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setReportedPage(Math.min(reportedTotalPages - 1, reportedPage + 1))}
                      disabled={reportedPage >= reportedTotalPages - 1}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">统计信息</h2>
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-500 text-sm mb-2">待审核活动</div>
                  <div className="text-3xl font-bold text-yellow-600">{totalElements || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-500 text-sm mb-2">被举报活动</div>
                  <div className="text-3xl font-bold text-red-600">{reportedTotalElements || 0}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 审核确认弹窗 */}
      {showAuditDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold">
                {auditAction === 'approve' ? '通过审核' : '拒绝审核'}
              </h3>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {auditAction === 'approve' ? '审核意见（可选）' : '拒绝原因'}
                </label>
                <textarea
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder={auditAction === 'approve' ? '请输入审核意见...' : '请输入拒绝原因...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required={auditAction === 'reject'}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAuditDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAuditConfirm}
                  disabled={auditAction === 'reject' && !auditReason.trim()}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    auditAction === 'approve' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  确认{auditAction === 'approve' ? '通过' : '拒绝'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 活动详情弹窗 */}
      {showDetailDialog && currentActivityDetail && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">活动详情</h3>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-4">
              {currentActivityDetail.activity && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <div className="w-full h-48 bg-gray-200">
                      <img
                        src={mediaForDialog.coverImageUrl}
                        alt={currentActivityDetail.activity.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                    {(mediaForDialog.imageUrls.length > 1 || mediaForDialog.videoUrls.length > 0) && (
                      <div className="p-3 space-y-3">
                        {mediaForDialog.imageUrls.length > 1 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-800 mb-2">活动图片</h5>
                            <div className="grid grid-cols-3 gap-2">
                              {mediaForDialog.imageUrls.slice(1).map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`活动图片 ${index + 2}`}
                                  className="w-full h-20 object-cover rounded"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {mediaForDialog.videoUrls.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-800 mb-2">活动视频</h5>
                            <div className="space-y-2">
                              {mediaForDialog.videoUrls.map((url, index) => (
                                <video
                                  key={index}
                                  src={url}
                                  controls
                                  className="w-full max-h-40 bg-black rounded"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>

                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      {currentActivityDetail.activity.title}
                    </h4>
                    <div className="flex space-x-2">
                      {getStatusBadge(currentActivityDetail.activity.status)}
                      {getAuditStatusBadge(currentActivityDetail.activity.auditStatus)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">组织者：</span>
                      <span className="text-gray-600">{currentActivityDetail.activity.organizerName || '未知'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">开始时间：</span>
                      <span className="text-gray-600">{formatDateTime(currentActivityDetail.activity.startTime)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">结束时间：</span>
                      <span className="text-gray-600">{formatDateTime(currentActivityDetail.activity.endTime)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">地点：</span>
                      <span className="text-gray-600">{currentActivityDetail.activity.locationName || '未设置'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">参与人数：</span>
                      <span className="text-gray-600">
                        {currentActivityDetail.activity.currentParticipants || 0}
                        {currentActivityDetail.activity.maxParticipants > 0 ? `/${currentActivityDetail.activity.maxParticipants}` : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">活动描述</h5>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {currentActivityDetail.activity.description}
                    </p>
                  </div>
                  
                  {currentActivityDetail.activity.requirements && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">参与要求</h5>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {currentActivityDetail.activity.requirements}
                      </p>
                    </div>
                  )}
                  
                  {currentActivityDetail.activity.notes && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">注意事项</h5>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {currentActivityDetail.activity.notes}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">举报记录</h5>
                    {currentActivityDetail.reports && currentActivityDetail.reports.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {currentActivityDetail.reports.map((report, index) => (
                          <div key={index} className="p-2 rounded bg-red-50 border border-red-100">
                            <div className="text-gray-700">
                              <span className="font-medium">举报人：</span>
                              <span>{report.reporterName || '用户'}</span>
                            </div>
                            <div className="text-gray-700">
                              <span className="font-medium">举报时间：</span>
                              <span>{report.createdTime ? formatDateTime(report.createdTime) : '-'}</span>
                            </div>
                            <div className="text-gray-700">
                              <span className="font-medium">举报原因：</span>
                              <span className="whitespace-pre-wrap">{report.reason || '-'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无举报记录</p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowDetailDialog(false)
                        handleAuditClick(currentActivityDetail.activity.id, 'approve')
                      }}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      通过审核
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailDialog(false)
                        handleAuditClick(currentActivityDetail.activity.id, 'reject')
                      }}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      拒绝审核
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminActivityReviewPage

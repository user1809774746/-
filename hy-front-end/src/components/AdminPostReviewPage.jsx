import React, { useState, useEffect } from 'react'
import {
  getAdminPendingPosts,
  getAdminAllPosts,
  getAdminPostsStatistics,
  approvePost,
  rejectPost,
  deletePostByAdmin,
  setPostFeatured,
  unsetPostFeatured,
  setPostTop,
  unsetPostTop,
  getAdminPostDetail,
  getAdminCommentReports,
  handleAdminCommentReport,
  getAdminPostReports,
  handleAdminPostReport
} from '../api/config'

const AdminPostReviewPage = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState('pending') // pending, all, statistics, commentReports, postReports
  const [pendingPosts, setPendingPosts] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  
  // 筛选条件
  const [filterAuditStatus, setFilterAuditStatus] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [commentReports, setCommentReports] = useState([])
  const [commentReportStatus, setCommentReportStatus] = useState('pending')
  const [postReports, setPostReports] = useState([])
  const [postReportStatus, setPostReportStatus] = useState('pending')
  
  // 拒绝弹窗
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [currentPostId, setCurrentPostId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  
  // 详情弹窗
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [currentPostDetail, setCurrentPostDetail] = useState(null)

  useEffect(() => {
    loadData()
  }, [activeTab, currentPage, filterAuditStatus, filterStatus, commentReportStatus, postReportStatus])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'pending') {
        await loadPendingPosts()
      } else if (activeTab === 'all') {
        await loadAllPosts()
      } else if (activeTab === 'statistics') {
        await loadStatistics()
      } else if (activeTab === 'commentReports') {
        await loadCommentReports()
      } else if (activeTab === 'postReports') {
        await loadPostReports()
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      if (error.status === 403) {
        alert('需要管理员权限，即将返回登录页')
        // 清除登录信息
        localStorage.clear()
        // 刷新页面返回登录页
        window.location.reload()
      } else {
        alert('加载数据失败：' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadPendingPosts = async () => {
    console.log('🔍 开始加载待审核帖子...')
    const response = await getAdminPendingPosts(currentPage, pageSize)
    console.log('📦 待审核帖子响应:', response)
    if (response.code === 200) {
      console.log('✅ 待审核帖子数据:', response.data)
      setPendingPosts(response.data.posts || [])
      setTotalPages(response.data.totalPages || 1)
    } else {
      console.error('❌ 待审核帖子加载失败:', response)
    }
  }

  const loadAllPosts = async () => {
    const response = await getAdminAllPosts({
      auditStatus: filterAuditStatus,
      status: filterStatus,
      page: currentPage,
      pageSize: pageSize
    })
    if (response.code === 200) {
      const posts = response.data.posts || []

      const filteredPosts = posts.filter((post) => {
        // 默认情况下（发布状态=全部），不展示已删除的帖子
        if (!filterStatus) {
          return post.status !== 'deleted'
        }
        // 当管理员显式选择“已删除”时，只展示已删除状态的帖子
        if (filterStatus === 'deleted') {
          return post.status === 'deleted'
        }
        // 其他状态交给后端筛选
        return true
      })

      setAllPosts(filteredPosts)
      setTotalPages(response.data.totalPages || 1)
    }
  }


  const loadCommentReports = async () => {
    const response = await getAdminCommentReports({
      status: commentReportStatus,
      page: currentPage,
      pageSize: pageSize
    })
    if (response.code === 200) {
      setCommentReports(response.data.reports || [])
      setTotalPages(response.data.totalPages || 1)
    }
  }

  const loadPostReports = async () => {
    const response = await getAdminPostReports({
      status: postReportStatus,
      page: currentPage,
      pageSize: pageSize
    })
    if (response.code === 200) {
      const data = response.data || {}
      setPostReports(data.list || data.reports || [])
      setTotalPages(data.totalPages || 1)
    }
  }

  const loadStatistics = async () => {
    const response = await getAdminPostsStatistics()
    if (response.code === 200) {
      setStatistics(response.data || {})
    }
  }

  const handleViewDetail = async (postId) => {
    try {
      const response = await getAdminPostDetail(postId)
      if (response.code === 200) {
        setCurrentPostDetail(response.data)
        setShowDetailDialog(true)
      }
    } catch (error) {
      alert('获取帖子详情失败：' + error.message)
    }
  }

  const handleApprove = async (postId) => {
    if (!confirm('确认通过此帖子的审核？')) return
    
    try {
      const response = await approvePost(postId)
      if (response.code === 200) {
        alert('审核通过成功！')
        loadData()
      }
    } catch (error) {
      alert('审核通过失败：' + error.message)
    }
  }

  const handleReject = (postId) => {
    setCurrentPostId(postId)
    setRejectReason('')
    setShowRejectDialog(true)
  }

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      alert('请输入拒绝原因')
      return
    }
    
    try {
      const response = await rejectPost(currentPostId, rejectReason)
      if (response.code === 200) {
        alert('审核拒绝成功！')
        setShowRejectDialog(false)
        setRejectReason('')
        loadData()
      }
    } catch (error) {
      alert('审核拒绝失败：' + error.message)
    }
  }

  const handleDelete = async (postId) => {
    const reason = prompt('请输入删除原因（可选）：')
    if (reason === null) return // 用户取消
    
    if (!confirm('确认删除此帖子？删除后不可恢复！')) return
    
    try {
      const response = await deletePostByAdmin(postId, reason)
      if (response.code === 200) {
        alert('删除成功！')
        loadData()
      }
    } catch (error) {
      alert('删除失败：' + error.message)
    }
  }

  const handleCommentReportAction = async (reportId, action) => {
    if (!reportId || !action) return

    if (action === 'delete_comment') {
      if (!confirm('确认删除该评论并标记举报为已处理？')) return
    } else if (action === 'reject') {
      if (!confirm('确认驳回该举报？')) return
    }

    let handleResult = ''
    const defaultText = action === 'delete_comment' ? '评论已删除' : '举报不成立'
    const input = prompt('请输入处理说明（可选）：', defaultText)
    if (input !== null) {
      handleResult = input
    }

    try {
      const response = await handleAdminCommentReport(reportId, action, handleResult)
      if (response.code === 200) {
        alert('操作成功')
        loadData()
      }
    } catch (error) {
      alert('操作失败：' + error.message)
    }
  }

  const handlePostReportAction = async (reportId, action) => {
    if (!reportId || !action) return

    if (action === 'delete_post') {
      if (!confirm('确认根据举报删除该帖子并标记举报为已处理？')) return
    } else if (action === 'reject') {
      if (!confirm('确认驳回该帖子举报？')) return
    }

    let handleResult = ''
    const defaultText = action === 'delete_post' ? '帖子已删除' : '举报不成立'
    const input = prompt('请输入处理说明（可选）：', defaultText)
    if (input !== null) {
      handleResult = input
    }

    try {
      const response = await handleAdminPostReport(reportId, action, handleResult)
      if (response.code === 200) {
        alert('操作成功')
        loadData()
      }
    } catch (error) {
      alert('操作失败：' + error.message)
    }
  }

  const handleToggleFeatured = async (postId, isFeatured) => {
    try {
      const response = isFeatured 
        ? await unsetPostFeatured(postId)
        : await setPostFeatured(postId)
      
      if (response.code === 200) {
        alert(isFeatured ? '已取消精选' : '已设置为精选')
        loadData()
      }
    } catch (error) {
      alert('操作失败：' + error.message)
    }
  }

  const handleToggleTop = async (postId, isTop) => {
    try {
      const response = isTop 
        ? await unsetPostTop(postId)
        : await setPostTop(postId)
      
      if (response.code === 200) {
        alert(isTop ? '已取消置顶' : '已设置为置顶')
        loadData()
      }
    } catch (error) {
      alert('操作失败：' + error.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAuditStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '待审核', class: 'bg-yellow-500' },
      approved: { text: '已通过', class: 'bg-green-500' },
      rejected: { text: '已拒绝', class: 'bg-red-500' }
    }
    const info = statusMap[status] || { text: status, class: 'bg-gray-500' }
    return (
      <span className={`inline-block px-2 py-1 text-xs text-white rounded ${info.class}`}>
        {info.text}
      </span>
    )
  }

  const getReportStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '待处理', class: 'bg-yellow-500' },
      resolved: { text: '已处理', class: 'bg-green-500' },
      rejected: { text: '已驳回', class: 'bg-red-500' }
    }
    const info = statusMap[status] || { text: status, class: 'bg-gray-500' }
    return (
      <span className={`inline-block px-2 py-1 text-xs text-white rounded ${info.class}`}>
        {info.text}
      </span>
    )
  }

  const parseMediaList = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (!trimmed) return []
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {}
      return trimmed.split(',').map(s => s.trim()).filter(Boolean)
    }
    return []
  }

  const renderPostCard = (post) => (
    <div key={post.id} className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex gap-4">
        {/* 封面图 */}
        {post.coverImage && (
          <img 
            src={post.coverImage} 
            alt="封面" 
            className="w-32 h-32 object-cover rounded"
          />
        )}
        
        {/* 帖子信息 */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.summary}</p>
            </div>
            {getAuditStatusBadge(post.auditStatus)}
          </div>
          
          <div className="text-sm text-gray-500 space-y-1 mb-3">
            <div>发布者：{post.publisherPhone || post.publisherId}</div>
            <div>发布时间：{formatDate(post.publishedTime || post.createdTime)}</div>
            {post.auditTime && <div>审核时间：{formatDate(post.auditTime)}</div>}
            {post.auditReason && (
              <div className="text-red-600">拒绝原因：{post.auditReason}</div>
            )}
            <div className="flex gap-4">
              <span>浏览 {post.viewCount || 0}</span>
              <span>点赞 {post.likeCount || 0}</span>
              <span>评论 {post.commentCount || 0}</span>
            </div>
          </div>
          
          {/* 标签 */}
          <div className="flex gap-2 mb-3">
            {post.isFeatured && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                精选
              </span>
            )}
            {post.isTop && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                置顶
              </span>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleViewDetail(post.id)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              查看详情
            </button>
            
            {post.auditStatus === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(post.id)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  通过
                </button>
                <button
                  onClick={() => handleReject(post.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  拒绝
                </button>
              </>
            )}
            
            {post.auditStatus === 'approved' && (
              <>
                <button
                  onClick={() => handleToggleFeatured(post.id, post.isFeatured)}
                  className={`px-3 py-1 text-sm rounded ${
                    post.isFeatured 
                      ? 'bg-purple-500 text-white hover:bg-purple-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {post.isFeatured ? '取消精选' : '设为精选'}
                </button>
                <button
                  onClick={() => handleToggleTop(post.id, post.isTop)}
                  className={`px-3 py-1 text-sm rounded ${
                    post.isTop 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {post.isTop ? '取消置顶' : '设为置顶'}
                </button>
              </>
            )}
            
            <button
              onClick={() => handleDelete(post.id)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCommentReportCard = (report) => (
    <div key={report.id} className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            举报ID：{report.id} · 评论ID：{report.commentId} · 帖子ID：{report.postId}
          </div>
          <div className="text-base font-semibold">
            {report.postTitle || '帖子标题未知'}
          </div>
        </div>
        {getReportStatusBadge(report.status)}
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <div>评论内容：{report.commentContent || '评论已删除或无法加载'}</div>
        <div>举报原因：{report.reportReason || '-'}</div>
        <div>被举报用户ID：{report.reportedUserId}</div>
        <div>举报人ID：{report.reporterId}</div>
        <div>举报时间：{formatDate(report.createdTime)}</div>
        {report.handleTime && (
          <div>处理时间：{formatDate(report.handleTime)}</div>
        )}
        {report.handleResult && (
          <div className="text-gray-700">处理说明：{report.handleResult}</div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {report.status === 'pending' && (
          <>
            <button
              onClick={() => handleCommentReportAction(report.id, 'delete_comment')}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              删除评论
            </button>
            <button
              onClick={() => handleCommentReportAction(report.id, 'reject')}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              驳回举报
            </button>
          </>
        )}
      </div>
    </div>
  )

  const renderPostReportCard = (report) => (
    <div key={report.id} className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            举报ID：{report.id} · 帖子ID：{report.postId}
          </div>
          <div className="text-base font-semibold">
            {report.postTitle || '帖子标题未知'}
          </div>
        </div>
        {getReportStatusBadge(report.status)}
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <div>举报类型：{report.reportType || '-'}</div>
        <div>举报原因：{report.reportReason || '-'}</div>
        <div>举报人ID：{report.reporterId}</div>
        <div>举报时间：{formatDate(report.createdTime)}</div>
        {report.handleTime && (
          <div>处理时间：{formatDate(report.handleTime)}</div>
        )}
        {report.handleResult && (
          <div className="text-gray-700">处理说明：{report.handleResult}</div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {report.status === 'pending' && (
          <>
            <button
              onClick={() => handlePostReportAction(report.id, 'delete_post')}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              删除帖子
            </button>
            <button
              onClick={() => handlePostReportAction(report.id, 'reject')}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              驳回举报
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">帖子审核管理系统</h1>
            <button
              onClick={() => {
                if (confirm('确定要退出管理后台吗？')) {
                  // 清除登录信息并返回登录页
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

      {/* 标签页 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('pending')
                setCurrentPage(1)
              }}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              待审核帖子
            </button>
            <button
              onClick={() => {
                setActiveTab('all')
                setCurrentPage(1)
              }}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              所有帖子
            </button>
            <button
              onClick={() => {
                setActiveTab('commentReports')
                setCurrentPage(1)
              }}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'commentReports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              评论举报
            </button>
            <button
              onClick={() => {
                setActiveTab('postReports')
                setCurrentPage(1)
              }}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'postReports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              帖子举报
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
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
            <h2 className="text-xl font-semibold mb-4">待审核帖子列表</h2>
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : pendingPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无待审核帖子</div>
            ) : (
              <>
                {pendingPosts.map(renderPostCard)}
                
                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'commentReports' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">评论举报列表</h2>
              <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
                <div>
                  <label className="block text-sm font-medium mb-1">举报状态</label>
                  <select
                    value={commentReportStatus}
                    onChange={(e) => {
                      setCommentReportStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="pending">待处理</option>
                    <option value="resolved">已处理</option>
                    <option value="rejected">已驳回</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : commentReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无评论举报</div>
            ) : (
              <>
                {commentReports.map(renderCommentReportCard)}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'postReports' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">帖子举报列表</h2>
              <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
                <div>
                  <label className="block text-sm font-medium mb-1">举报状态</label>
                  <select
                    value={postReportStatus}
                    onChange={(e) => {
                      setPostReportStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="pending">待处理</option>
                    <option value="resolved">已处理</option>
                    <option value="rejected">已驳回</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : postReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无帖子举报</div>
            ) : (
              <>
                {postReports.map(renderPostReportCard)}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">所有帖子列表</h2>
              
              {/* 筛选条件 */}
              <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
                <div>
                  <label className="block text-sm font-medium mb-1">审核状态</label>
                  <select
                    value={filterAuditStatus}
                    onChange={(e) => {
                      setFilterAuditStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">全部</option>
                    <option value="pending">待审核</option>
                    <option value="approved">已通过</option>
                    <option value="rejected">已拒绝</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">发布状态</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">全部</option>
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="deleted">已删除</option>
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : allPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无帖子</div>
            ) : (
              <>
                {allPosts.map(renderPostCard)}
                
                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
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
                  <div className="text-gray-500 text-sm mb-2">待审核</div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {statistics.pendingCount || 0}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-500 text-sm mb-2">已通过</div>
                  <div className="text-3xl font-bold text-green-600">
                    {statistics.approvedCount || 0}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-500 text-sm mb-2">已拒绝</div>
                  <div className="text-3xl font-bold text-red-600">
                    {statistics.rejectedCount || 0}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-500 text-sm mb-2">总帖子数</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {statistics.totalCount || 0}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-500 text-sm mb-2">精选帖子</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {statistics.featuredCount || 0}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-500 text-sm mb-2">置顶帖子</div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {statistics.topCount || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 拒绝原因弹窗 */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">请输入拒绝原因</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请详细说明拒绝原因，以便用户修改..."
              className="w-full h-32 px-3 py-2 border rounded resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectReason('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={submitReject}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailDialog && currentPostDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{currentPostDetail.title}</h3>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {currentPostDetail.coverImage && (
                <img 
                  src={currentPostDetail.coverImage} 
                  alt="封面" 
                  className="w-full max-h-96 object-cover rounded"
                />
              )}
              
              <div className="flex gap-2">
                {getAuditStatusBadge(currentPostDetail.auditStatus)}
                {currentPostDetail.isFeatured && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                    精选
                  </span>
                )}
                {currentPostDetail.isTop && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    置顶
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <div>发布者ID：{currentPostDetail.publisherId}</div>
                <div>创建时间：{formatDate(currentPostDetail.createdTime)}</div>
                {currentPostDetail.publishedTime && (
                  <div>发布时间：{formatDate(currentPostDetail.publishedTime)}</div>
                )}
                {currentPostDetail.auditTime && (
                  <div>审核时间：{formatDate(currentPostDetail.auditTime)}</div>
                )}
              </div>
              
              {currentPostDetail.summary && (
                <div>
                  <h4 className="font-semibold mb-2">摘要</h4>
                  <p className="text-gray-700">{currentPostDetail.summary}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-2">内容</h4>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentPostDetail.content }}
                />
              </div>

              {parseMediaList(currentPostDetail.images).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">图片</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {parseMediaList(currentPostDetail.images).map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parseMediaList(currentPostDetail.videos).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">视频</h4>
                  <div className="space-y-4">
                    {parseMediaList(currentPostDetail.videos).map((video, index) => (
                      <div key={index} className="w-full rounded-lg overflow-hidden bg-black">
                        <video
                          src={video}
                          controls
                          className="w-full max-h-64 object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentPostDetail.auditReason && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="font-semibold text-red-700 mb-1">拒绝原因</div>
                  <div className="text-red-600">{currentPostDetail.auditReason}</div>
                </div>
              )}
              
              <div className="flex gap-4 text-sm text-gray-600">
                <span>浏览 {currentPostDetail.viewCount || 0}</span>
                <span>点赞 {currentPostDetail.likeCount || 0}</span>
                <span>评论 {currentPostDetail.commentCount || 0}</span>
                <span>收藏 {currentPostDetail.favoriteCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPostReviewPage


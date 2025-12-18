import React, { useState, useEffect } from 'react';
import { 
  getMyPosts, 
  getMyDrafts, 
  publishPost, 
  publishDraft,
  deletePost, 
  deleteDraft,
  getPostDetail 
} from '../api/config';

const MyPostsPage = ({ onBack, onNavigateToEditor, onNavigateToPostDetail }) => {
  const [activeTab, setActiveTab] = useState('published'); // published, draft, deleted
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 数据状态
  const [publishedPosts, setPublishedPosts] = useState({ total: 0, list: [] });
  const [draftPosts, setDraftPosts] = useState({ total: 0, list: [] });
  const [deletedPosts, setDeletedPosts] = useState({ total: 0, list: [] });
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });

  // 标签页配置
  const tabs = [
    { 
      key: 'published', 
      title: '已发布', 
      // icon: 'fa-solid fa-globe',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      key: 'draft', 
      title: '草稿', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    { 
      key: 'deleted', 
      title: '已删除', 
      // icon: 'fa-solid fa-trash',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  // 帖子类型映射
  const postTypeMap = {
    'travel_note': '游记',
    'strategy': '攻略',
    'photo_share': '照片分享',
    'video_share': '视频分享',
    'qa': '问答'
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 当切换标签时加载对应数据
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  // 加载初始数据
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 并行加载所有类型的帖子数据
      const [publishedResponse, draftResponse, deletedResponse] = await Promise.all([
        getMyPosts({ status: 'published' }).catch(err => {
          console.warn('获取已发布帖子失败:', err.message);
          return { code: 200, data: { total: 0, list: [] } };
        }),
        getMyDrafts().catch(err => {
          console.warn('获取草稿失败:', err.message);
          return { code: 200, data: { total: 0, list: [] } };
        }),
        getMyPosts({ status: 'deleted' }).catch(err => {
          console.warn('获取已删除帖子失败:', err.message);
          return { code: 200, data: { total: 0, list: [] } };
        })
      ]);
      
      if (publishedResponse.code === 200) {
        setPublishedPosts(publishedResponse.data);
        // 计算统计数据
        calculateStats(publishedResponse.data.list);
      }
      
      if (draftResponse.code === 200) {
        setDraftPosts(draftResponse.data);
      }
      
      if (deletedResponse.code === 200) {
        setDeletedPosts(deletedResponse.data);
      }
      
    } catch (error) {
      console.error('加载初始数据失败:', error);
      setError('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const calculateStats = (posts) => {
    const stats = posts.reduce((acc, post) => {
      acc.totalViews += post.viewCount || 0;
      acc.totalLikes += post.likeCount || 0;
      acc.totalComments += post.commentCount || 0;
      return acc;
    }, { totalPosts: posts.length, totalViews: 0, totalLikes: 0, totalComments: 0 });
    
    setStats(stats);
  };

  // 加载标签页数据
  const loadTabData = async (tab) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      switch (tab) {
        case 'published':
          await loadPublishedPosts();
          break;
        case 'draft':
          await loadDraftPosts();
          break;
        case 'deleted':
          await loadDeletedPosts();
          break;
      }
    } catch (error) {
      console.warn(`加载${tab}数据失败:`, error.message);
      // 不设置错误状态，而是显示空状态
      switch (tab) {
        case 'published':
          setPublishedPosts({ total: 0, list: [] });
          break;
        case 'draft':
          setDraftPosts({ total: 0, list: [] });
          break;
        case 'deleted':
          setDeletedPosts({ total: 0, list: [] });
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  // 加载已发布帖子
  const loadPublishedPosts = async () => {
    try {
      const response = await getMyPosts({ status: 'published' });
      if (response.code === 200) {
        setPublishedPosts(response.data);
        calculateStats(response.data.list);
      } else {
        setPublishedPosts({ total: 0, list: [] });
      }
    } catch (error) {
      console.warn('已发布帖子接口调用失败:', error.message);
      setPublishedPosts({ total: 0, list: [] });
    }
  };

  // 加载草稿
  const loadDraftPosts = async () => {
    try {
      const response = await getMyDrafts();
      if (response.code === 200) {
        setDraftPosts(response.data);
      } else {
        setDraftPosts({ total: 0, list: [] });
      }
    } catch (error) {
      console.warn('草稿接口调用失败:', error.message);
      setDraftPosts({ total: 0, list: [] });
    }
  };

  // 加载已删除帖子
  const loadDeletedPosts = async () => {
    try {
      const response = await getMyPosts({ status: 'deleted' });
      if (response.code === 200) {
        setDeletedPosts(response.data);
      } else {
        setDeletedPosts({ total: 0, list: [] });
      }
    } catch (error) {
      console.warn('已删除帖子接口调用失败:', error.message);
      setDeletedPosts({ total: 0, list: [] });
    }
  };

  // 发布草稿
  const handlePublishDraft = async (draftId) => {
    try {
      console.log('🚀 开始发布草稿，ID:', draftId);
      
      const response = await publishDraft(draftId);
      console.log('📝 发布草稿响应:', response);
      
      if (response.code === 200) {
        alert('发布成功！');
        console.log('✅ 草稿发布成功，帖子ID:', response.data.id);
        
        // 重新加载数据
        loadInitialData();
        // 切换到已发布标签
        setActiveTab('published');
      } else {
        console.error('❌ 发布失败:', response.message);
        alert('发布失败：' + response.message);
      }
    } catch (error) {
      console.error('💥 发布草稿异常:', error);
      alert('发布失败：' + error.message);
    }
  };

  // 删除帖子或草稿
  const handleDeletePost = async (postId, postTitle, isDraft = false) => {
    const itemType = isDraft ? '草稿' : '帖子';
    if (window.confirm(`确定要删除${itemType}"${postTitle}"吗？`)) {
      try {
        console.log(`🗑️ 开始删除${itemType}，ID:`, postId);
        
        const response = isDraft ? 
          await deleteDraft(postId) : 
          await deletePost(postId);
          
        console.log(`📝 删除${itemType}响应:`, response);
        
        if (response.code === 200) {
          alert(`${itemType}删除成功！`);
          console.log(`✅ ${itemType}删除成功`);
          
          // 重新加载当前标签数据
          loadTabData(activeTab);
        } else {
          console.error(`❌ 删除${itemType}失败:`, response.message);
          alert(`删除失败：${response.message}`);
        }
      } catch (error) {
        console.error(`💥 删除${itemType}异常:`, error);
        alert(`删除失败：${error.message}`);
      }
    }
  };

  // 查看帖子详情
  const handleViewPost = (post) => {
    if (onNavigateToPostDetail) {
      console.log('查看帖子详情:', post);
      onNavigateToPostDetail(post);
    } else {
      console.warn('未提供 onNavigateToPostDetail 回调函数');
    }
  };

  // 编辑帖子
  const handleEditPost = (post) => {
    // 跳转到编辑器页面
    if (onNavigateToEditor) {
      onNavigateToEditor(post);
    }
  };

  // 渲染统计卡片
  const renderStatsCards = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="rounded-xl p-4 text-white"style={{backgroundImage:'url(/春3.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
        <div className="text-2xl font-bold">{stats.totalPosts}</div>
        <div className="text-xs opacity-90">发布帖子</div>
      </div>
      <div className="rounded-xl p-4 text-white"style={{backgroundImage:'url(/夏1.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
        <div className="text-2xl font-bold">{stats.totalViews}</div>
        <div className="text-xs opacity-90">总浏览量</div>
      </div>
      <div className="rounded-xl p-4 text-white"style={{backgroundImage:'url(/秋2.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
        <div className="text-2xl font-bold">{stats.totalLikes}</div>
        <div className="text-xs opacity-90">获得点赞</div>
      </div>
      <div className="rounded-xl p-4 text-white"style={{backgroundImage:'url(/冬.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
        <div className="text-2xl font-bold">{stats.totalComments}</div>
        <div className="text-xs opacity-90">收到评论</div>
      </div>
    </div>
  );

  // 渲染已发布帖子列表
  const renderPublishedPosts = () => (
    <div className="space-y-4">
      {publishedPosts.list.map((post) => (
        <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-sm text-gray-800 mb-1">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{post.summary}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>
                  <i className="fa-solid fa-eye mr-1"></i>
                  {post.viewCount || 0}
                </span>
                <span>
                  <i className="fa-solid fa-heart mr-1"></i>
                  {post.likeCount || 0}
                </span>
                <span>
                  <i className="fa-solid fa-comment mr-1"></i>
                  {post.commentCount || 0}
                </span>
                <span>
                  <i className="fa-solid fa-calendar mr-1"></i>
                  {new Date(post.publishedTime).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <span className={`px-2 py-1 rounded-full text-xs ${
                post.postType ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {postTypeMap[post.postType] || '未分类'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                post.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {post.status === 'published' ? '已发布' : post.status}
              </span>
            </div>
          </div>
          
          {/* 审核状态提示 */}
          {post.auditStatus && (
            <div 
              className={`mb-3 p-3 rounded-lg ${
                post.auditStatus === 'approved' ? 'border border-green-200' :
                post.auditStatus === 'rejected' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}
              style={post.auditStatus === 'approved' ? { backgroundColor: 'rgb(243, 229, 225)' } : {}}
            >
              <div className="flex items-start">
                {/* 审核通过时不显示图标 */}
                {post.auditStatus !== 'approved' && (
                  <i className={`${
                    post.auditStatus === 'rejected' ? 'fa-solid fa-times-circle text-red-600' :
                    'fa-solid fa-clock text-yellow-600'
                  } mr-2 mt-0.5`}></i>
                )}
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    post.auditStatus === 'approved' ? 'text-white' :
                    post.auditStatus === 'rejected' ? 'text-red-800' :
                    'text-yellow-800'
                  }`}>
                    {post.auditStatus === 'approved' ? '审核通过，帖子已公开' :
                     post.auditStatus === 'rejected' ? '❌ 审核未通过' : '⏳ 等待管理员审核'}
                  </div>
                  {post.auditStatus === 'rejected' && post.auditReason && (
                    <div className="text-xs text-red-700 mt-1">
                      拒绝原因：{post.auditReason}
                    </div>
                  )}
                  {post.auditStatus === 'pending' && (
                    <div className="text-xs text-yellow-700 mt-1">
                      您的帖子正在审核中，审核通过后将对所有用户展示
                    </div>
                  )}
                  {post.auditTime && (
                    <div className="text-xs text-gray-500 mt-1">
                      审核时间：{new Date(post.auditTime).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleViewPost(post)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                <i className="fa-solid fa-eye mr-1"></i>
                查看
              </button>
              <button 
                onClick={() => handleEditPost(post)}
                className="text-sm text-green-600 hover:text-green-800"
              >
                <i className="fa-solid fa-edit mr-1"></i>
                编辑
              </button>
              <button 
                onClick={() => handleDeletePost(post.id, post.title)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                <i className="fa-solid fa-trash mr-1"></i>
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染草稿列表
  const renderDraftPosts = () => (
    <div className="space-y-4">
      {draftPosts.list.map((draft) => (
        <div key={draft.id} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className=" font-medium text-gray-800 mb-1">{draft.title || '无标题草稿'}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {draft.content ? draft.content.substring(0, 100) + '...' : '暂无内容'}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>
                  <i className="fa-solid fa-clock mr-1"></i>
                  更新于 {new Date(draft.updatedTime).toLocaleString()}
                </span>
                {draft.autoSaveTime && (
                  <span>
                    <i className="fa-solid fa-save mr-1"></i>
                    自动保存于 {new Date(draft.autoSaveTime).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-600 ml-4">
              草稿
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleEditPost(draft)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                <i className="fa-solid fa-edit mr-1"></i>
                继续编辑
              </button>
              {draft.draftData && (
                <button 
                  onClick={() => handlePublishDraft(draft.id)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  <i className="fa-solid fa-paper-plane mr-1"></i>
                  发布
                </button>
              )}
              <button 
                onClick={() => handleDeletePost(draft.id, draft.title || '无标题草稿', true)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                <i className="fa-solid fa-trash mr-1"></i>
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染已删除帖子列表
  const renderDeletedPosts = () => (
    <div className="space-y-4">
      {deletedPosts.list.map((post) => (
        <div key={post.id} className="bg-gray-50 rounded-xl p-4 shadow-sm opacity-75">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-600 mb-1">{post.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{post.summary}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>
                  <i className="fa-solid fa-trash mr-1"></i>
                  删除于 {new Date(post.deletedTime || post.updatedTime).toLocaleDateString()}
                </span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-600 ml-4">
              已删除
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleViewPost(post)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-eye mr-1"></i>
                查看
              </button>
              {/* TODO: 实现恢复功能 */}
              <button className="text-sm text-blue-600 hover:text-blue-800">
                <i className="fa-solid fa-undo mr-1"></i>
                恢复
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 骨架屏：统计卡片
  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 mb-6 animate-pulse">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-xl p-4 bg-gray-200"
        >
          <div className="h-6 w-16 bg-gray-300 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );

  // 骨架屏：帖子列表
  const renderPostsSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-1" />
              <div className="flex items-center space-x-4 mt-3">
                <div className="h-3 w-10 bg-gray-200 rounded" />
                <div className="h-3 w-10 bg-gray-200 rounded" />
                <div className="h-3 w-10 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-10 bg-gray-200 rounded" />
              <div className="h-4 w-10 bg-gray-200 rounded" />
              <div className="h-4 w-10 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染内容区域
  const renderContent = () => {
    if (loading) {
      return renderPostsSkeleton();
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fa-solid fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => loadTabData(activeTab)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    const currentData = activeTab === 'published' ? publishedPosts :
                       activeTab === 'draft' ? draftPosts : deletedPosts;

    if (currentData.list.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fa-solid fa-file-pen text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 mb-2">
              {activeTab === 'published' ? '暂无已发布的帖子' :
               activeTab === 'draft' ? '暂无草稿' : '暂无已删除的帖子'}
            </p>
            <p className="text-sm text-gray-400">
              {activeTab === 'published' ? '快去发布你的第一篇帖子吧！' :
               activeTab === 'draft' ? '开始创作你的第一篇帖子吧！' : ''}
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'published':
        return renderPublishedPosts();
      case 'draft':
        return renderDraftPosts();
      case 'deleted':
        return renderDeletedPosts();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-gray-600"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">我发布的</h1>
          </div>
          <button 
            onClick={() => onNavigateToEditor && onNavigateToEditor(null)}
            className="px-4 py-2 bg-GuText text-white rounded-lg text-sm hover:bg-GuText transition-colors"
          >
            <i className="fa-solid fa-plus mr-1"></i>
            写帖子
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-6">
        {/* Stats Cards */}
        <div className="px-4 mt-4">
          {loading ? renderStatsSkeleton() : renderStatsCards()}
        </div>


        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <i className={`${tab.icon} mr-2 ${activeTab === tab.key ? tab.color : ''}`}></i>
                <span className="font-medium">{tab.title}</span>
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {tab.key === 'published' ? publishedPosts.total :
                   tab.key === 'draft' ? draftPosts.total : deletedPosts.total}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;

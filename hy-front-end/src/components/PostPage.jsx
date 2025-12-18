import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from 'react-vant';
import {
  getPublicPosts,
  addPostFavorite,
  removePostFavorite,
  getPostFavorites,
  searchPosts
} from '../api/config';

const PostPage = ({
  onBack,
  onNavigateToEditor,
  onNavigateToPostDetail,
  onNavigateToUserCenter,
  onNavigateToPostCitySelect
}) => {
  // 帖子相关状态
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postSearchKeyword, setPostSearchKeyword] = useState('');
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const loadMoreRef = useRef(null);

  // 加载帖子数据（支持搜索 + 分页）
  const loadPosts = async (keyword, page = 1, append = false) => {
    const isFirstPage = !append || page === 1;

    try {
      if (isFirstPage) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      // 获取帖子列表：有关键字则搜索，否则获取全部公开帖子
      let response;
      const trimmedKeyword = keyword && keyword.trim ? keyword.trim() : '';
      if (trimmedKeyword) {
        response = await searchPosts(trimmedKeyword, page, pageSize);
        setIsSearchingPosts(true);
      } else {
        response = await getPublicPosts({ page, pageSize });
        setIsSearchingPosts(false);
      }
      
      if (response.code === 200) {
        const data = response.data || {};
        // 只显示审核通过的帖子
        const allPosts = data.list || data.posts || [];
        const approvedPosts = allPosts.filter(
          post => post.status === 'published' && post.auditStatus === 'approved'
        );
        
        console.log('📊 帖子统计:');
        console.log(`  - 总帖子数: ${allPosts.length}`);
        console.log(`  - 审核通过: ${approvedPosts.length}`);
        console.log(`  - 待审核/拒绝: ${allPosts.length - approvedPosts.length}`);
        
        // 标记是否为搜索结果，用于空状态文案
        setHasSearched(!!trimmedKeyword);

        // 获取用户的收藏列表
        try {
          const favoritesResponse = await getPostFavorites();
          if (favoritesResponse.code === 200) {
            const favoritePostIds = new Set(
              (favoritesResponse.data.list || []).map(fav => fav.postId)
            );
            
            console.log('⭐ 用户收藏的帖子:', Array.from(favoritePostIds));
            
            // 更新帖子的收藏状态
            const postsWithFavoriteStatus = approvedPosts.map(post => ({
              ...post,
              isFavorited: favoritePostIds.has(post.id)
            }));
            
            setPosts(prev => append ? [...prev, ...postsWithFavoriteStatus] : postsWithFavoriteStatus);
          } else {
            console.warn('⚠️ 获取收藏列表失败，收藏状态可能不准确');
            setPosts(prev => append ? [...prev, ...approvedPosts] : approvedPosts);
          }
        } catch (favErr) {
          console.warn('⚠️ 获取收藏列表失败:', favErr.message);
          setPosts(prev => append ? [...prev, ...approvedPosts] : approvedPosts);
        }

        const totalPages = data.totalPages || 1;
        const total = data.total || approvedPosts.length;
        const nextPage = data.currentPage || page || 1;
        setCurrentPage(nextPage);
        setHasMorePosts(nextPage < totalPages);
        setTotalPosts(total);
      } else {
        throw new Error(response.message || '获取帖子失败');
      }
    } catch (err) {
      console.error('加载帖子失败:', err);
      setError(err.message);
      if (!append) {
        setPosts([]);
      }
    } finally {
      if (isFirstPage) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // 处理帖子搜索
  const handlePostSearch = async () => {
    const keyword = postSearchKeyword.trim();
    setCurrentPage(1);
    setHasMorePosts(true);
    if (keyword) {
      await loadPosts(keyword, 1, false);
    } else {
      await loadPosts(undefined, 1, false);
    }
  };

  // 处理搜索输入回车
  const handlePostSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handlePostSearch();
    }
  };

  // 清空搜索
  const handleClearPostSearch = async () => {
    setPostSearchKeyword('');
    setCurrentPage(1);
    setHasMorePosts(true);
    setHasSearched(false);
    await loadPosts(undefined, 1, false);
  };

  // 处理帖子点击
  const handlePostClick = (post) => {
    if (onNavigateToPostDetail) {
      onNavigateToPostDetail(post, 'post-page');
    }
  };

  // 处理作者点击
  const handlePostAuthorClick = (e, post) => {
    e.stopPropagation();
    if (onNavigateToUserCenter && post.publisherId) {
      onNavigateToUserCenter({
        id: post.publisherId,
        nickname: post.publisherNickname,
        avatarUrl: post.publisherAvatarUrl
      });
    }
  };

  // 处理收藏
  const handleFavorite = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isFavorited) {
        const response = await removePostFavorite(postId);
        if (response.code === 200) {
          setPosts(posts.map(p => 
            p.id === postId ? { ...p, isFavorited: false } : p
          ));
          console.log('✅ 取消收藏成功');
        }
      } else {
        const response = await addPostFavorite(postId);
        if (response.code === 200) {
          setPosts(posts.map(p => 
            p.id === postId ? { ...p, isFavorited: true } : p
          ));
          console.log('✅ 收藏成功');
        }
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
      alert(err.message || '操作失败，请重试');
    }
  };

  // 初始加载
  useEffect(() => {
    loadPosts(undefined, 1, false);
  }, []);

  // 无限滚动加载更多
  useEffect(() => {
    if (!loadMoreRef.current || !hasMorePosts || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !isLoadingMore) {
          const nextPage = currentPage + 1;
          const keyword = isSearchingPosts ? postSearchKeyword.trim() : undefined;
          loadPosts(keyword, nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMorePosts, isLoadingMore, currentPage, isSearchingPosts, postSearchKeyword]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800">话题</h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-20 px-4">
                  {/* 帖子搜索框 */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative bordre rounded-2xl">
              <input
                type="text"
                value={postSearchKeyword}
                onChange={(e) => setPostSearchKeyword(e.target.value)}
                onKeyDown={handlePostSearchKeyDown}
                placeholder="搜索感兴趣的帖子（标题、内容）"
                className="w-full px-10 py-4 pl-11 pr-20 text-sm focus:outline-none"
                style={{ backgroundImage: 'url("/输入框.png")', backgroundSize: '105% 125%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              {postSearchKeyword && (
                <button
                  type="button"
                  onClick={handleClearPostSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            {/* <button
              type="button"
              onClick={handlePostSearch}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              搜索
            </button> */}
          </div>
          {isSearchingPosts && postSearchKeyword.trim() && (
            <div className="mt-1 text-xs text-gray-500">
              正在查看"{postSearchKeyword.trim()}"的搜索结果
            </div>
          )}
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <div className="flex items-center text-sm text-yellow-800">
              <i className="fa-solid fa-exclamation-triangle mr-2"></i>
              <span>加载失败，显示默认内容</span>
            </div>
          </div>
        )}
        
        {/* 写帖子按钮 + 帖子列表（交错布局） */}
        <div className="columns-2 gap-4">
          {(onNavigateToPostCitySelect || onNavigateToEditor) && (
            <div style={{ breakInside: 'avoid' }}>
              <button
                onClick={() => {
                  if (onNavigateToPostCitySelect) {
                    onNavigateToPostCitySelect();
                  } else if (onNavigateToEditor) {
                    onNavigateToEditor(null);
                  }
                }}
                className="w-full mb-4 py-6 text-sm font-semibold text-white rounded-xl shadow flex items-center justify-center transform transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundImage: 'url("/写帖子按钮背景.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <i className="fa-solid fa-pen mr-2"></i>
                写帖子
              </button>
            </div>
          )}

          {/* 加载中时：使用骨架帖子占位；加载完成后：使用真实帖子 */}
          {loading && posts.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="mb-4" style={{ breakInside: 'avoid' }}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col h-80">
                    {/* 封面骨架区域 */}
                    <div className="flex-[3] bg-gray-200">
                      <Skeleton row={0} />
                    </div>

                    {/* 内容骨架区域 */}
                    <div className="flex-[1] flex flex-col justify-between">
                      <div className="mt-2 ml-2 mr-2">
                        <Skeleton title row={2} />
                      </div>
                      <div className="mt-2 mb-3 ml-2 mr-2">
                        <Skeleton avatar title row={0} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : posts.map((post) => (
                <div key={post.id} className="mb-4" style={{ breakInside: 'avoid' }}>
                  <div
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-80"
                    onClick={() => handlePostClick(post)}
                  >
                    {/* 封面图片 */}
                    <div className="flex-[3] bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
                      {(post.coverImage || (post.images && post.images.length > 0)) ? (
                        <img 
                          src={post.coverImage || post.images[0]} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-white">
                          <i className="fa-solid fa-image text-2xl mb-1"></i>
                          <div className="text-xs opacity-80">
                            {post.postType === 'travel_note' ? '游记' :
                             post.postType === 'strategy' ? '攻略' :
                             post.postType === 'photo_share' ? '照片' :
                             post.postType === 'video_share' ? '视频' : '帖子'}
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                          {post.postType === 'travel_note' ? '游记' :
                           post.postType === 'strategy' ? '攻略' :
                           post.postType === 'photo_share' ? '照片分享' :
                           post.postType === 'video_share' ? '视频分享' :
                           post.postType === 'qa' ? '问答' : '帖子'}
                        </span>
                      </div>

                      <div className="absolute bottom-2 right-2 flex items-center space-x-3 text-white text-xs bg-black bg-opacity-40 px-2 py-1 rounded-full">
                        <div className="flex items-center">
                          <i className="fa-solid fa-eye mr-1"></i>
                          <span>{post.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fa-solid fa-comment mr-1"></i>
                          <span>{post.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 内容区域 */}
                    <div className="flex-[1] flex flex-col justify-between">
                      <h3 className="text-sm font-medium text-gray-800 mt-2 ml-2 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      {/* {post.summary && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {post.summary}
                        </p>
                      )} */}
                      
                      {/* 作者和互动数据 */}
                      <div className="flex items-center justify-between ml-2 mb-3">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={(e) => handlePostAuthorClick(e, post)}
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                            {post.publisherAvatarUrl ? (
                              <img
                                src={post.publisherAvatarUrl}
                                alt={post.publisherNickname}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 text-xs font-medium">
                                {post.publisherNickname ? post.publisherNickname.charAt(0) : 'U'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-600">
                            @{post.publisherNickname || '匿名用户'}
                          </span>
                        </div>
                        
                        <div className="flex items-center mr-2">
                          {/* 收藏按钮 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(post.id);
                            }}
                            className={`flex items-center text-xs transition-colors ${
                              post.isFavorited 
                                ? 'text-yellow-500' 
                                : 'text-gray-500 hover:text-yellow-500'
                            }`}
                            title={post.isFavorited ? '取消收藏' : '收藏'}
                          >
                            <i className={`fa-solid fa-star mr-1 ${post.isFavorited ? 'text-yellow-500' : ''}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* 加载更多指示器 */}
        {totalPosts > 0 && (
          <div
            ref={loadMoreRef}
            className="flex items-center justify-center mt-4 h-8 text-xs text-gray-400"
          >
            {hasMorePosts ? (
              isLoadingMore ? (
                <span>加载中...</span>
              ) : (
                <span>下拉加载更多</span>
              )
            ) : (
              <span>已经到底了</span>
            )}
          </div>
        )}

        {/* 空状态 */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <i className="fa-solid fa-file-pen text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 mb-2">
              {hasSearched ? '没有找到相关帖子' : '暂无帖子内容'}
            </p>
            <p className="text-sm text-gray-400">
              {hasSearched ? '试试其他关键词吧' : '快来发布第一篇旅行分享吧！'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;

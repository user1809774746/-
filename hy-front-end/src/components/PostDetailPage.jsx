import React, { useState, useEffect, useRef } from 'react';
import { 
  getPostDetail, 
  getPostComments, 
  addComment, 
  reportComment,
  addPostFavorite,
  removePostFavorite,
  checkPostFavoriteStatus,
  getFriendsList,
  sendMessage,
  reportPost
} from '../api/config';

const PostDetailPage = ({ postId, onBack, onNavigateToUserCenter }) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 评论相关状态
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  // 三个点菜单状态
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);
  const [sharingToFriend, setSharingToFriend] = useState(false);
  
  // 收藏状态
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // 轮播图状态
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const touchEndYRef = useRef(null);
  const isDraggingRef = useRef(false);

  // 加载帖子详情
  useEffect(() => {
    if (postId) {
      loadPostDetail();
      loadComments();
      loadFavoriteStatus();
    }
  }, [postId]);

  // 加载收藏状态
  const loadFavoriteStatus = async () => {
    try {
      const response = await checkPostFavoriteStatus(postId);
      if (response.code === 200) {
        setIsFavorited(response.data?.isFavorited || response.data === true);
      }
    } catch (err) {
      console.error('获取收藏状态失败:', err);
    }
  };

  // 🔄 自动轮播图片
  useEffect(() => {
    if (!post) return;
    
    // 合并所有图片
    const allImages = [];
    if (post.coverImage) allImages.push(post.coverImage);
    if (post.images && post.images.length > 0) allImages.push(...post.images);
    
    // 只有多张图片时才自动轮播
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000); // 每3秒切换
    
    return () => clearInterval(interval);
  }, [post]);

  const loadPostDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPostDetail(postId);
      if (response.code === 200) {
        setPost(response.data);
      } else {
        throw new Error(response.message || '获取帖子详情失败');
      }
    } catch (err) {
      console.error('加载帖子详情失败:', err);
      const rawMessage = err && err.message ? String(err.message) : '';
      let displayMessage = rawMessage;
      // 针对已删除或不可访问的帖子，给出更友好的提示
      if (rawMessage.includes('帖子不存在') || rawMessage.includes('帖子不可访问')) {
        displayMessage = '该帖子已被删除或暂时不可访问';
      } else if (!rawMessage || rawMessage.startsWith('HTTP ') || rawMessage.includes('服务器响应格式错误')) {
        // 兜底处理一些技术性文案
        displayMessage = '加载帖子详情失败，请稍后重试';
      }
      setError(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorClick = () => {
    if (!onNavigateToUserCenter || !post) return;

    const user = {
      id: post.publisherId,
      userId: post.publisherId,
      nickname: post.publisherNickname || '',
      username: post.publisherNickname || '',
      avatarUrl: post.publisherAvatarUrl || '',
      fromTopics: true
    };

    if (!user.id && !user.userId) {
      alert('暂时无法获取该作者的用户信息');
      return;
    }

    onNavigateToUserCenter(user);
  };

  const handleCommentUserClick = (userId, userNickname, userAvatarUrl) => {
    if (!onNavigateToUserCenter || !userId) return;

    const user = {
      id: userId,
      userId: userId,
      nickname: userNickname || '',
      username: userNickname || '',
      avatarUrl: userAvatarUrl || '',
      fromTopics: true
    };

    onNavigateToUserCenter(user);
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      
      const response = await getPostComments(postId);
      if (response.code === 200) {
        setComments(response.data.list || []);
      } else {
        console.warn('获取评论失败:', response.message);
        setComments([]);
      }
    } catch (err) {
      console.error('加载评论失败:', err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // 处理收藏
  const handleFavorite = async () => {
    if (!post || favoriteLoading) return;
    
    const originalState = isFavorited;
    // 乐观更新
    setIsFavorited(!originalState);
    setFavoriteLoading(true);
    
    try {
      let response;
      if (originalState) {
        // 当前是已收藏状态，执行取消收藏
        response = await removePostFavorite(post.id);
      } else {
        // 当前是未收藏状态，执行添加收藏
        response = await addPostFavorite(post.id, {
          favoriteCategory: 'general'
        });
      }
      
      if (response.code === 200) {
        console.log('✅ 收藏操作成功');
      } else {
        // API 返回失败，回滚状态
        console.error('❌ 收藏操作失败:', response.message);
        setIsFavorited(originalState);
        alert('操作失败：' + response.message);
      }
    } catch (err) {
      console.error('❌ 收藏失败:', err);
      // 回滚状态
      setIsFavorited(originalState);
      alert(err.message || '操作失败，请重试');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setSubmittingComment(true);
      
      // 如果是在回复一条回复，则依然挂在其顶层父评论下面，统一作为二级回复
      const parentCommentId = replyingTo
        ? (replyingTo.parentCommentId || replyingTo.id)
        : null;

      const commentData = {
        postId: post.id,
        commentContent: commentText.trim(),
        parentCommentId
      };
      
      const response = await addComment(commentData);
      if (response.code === 200) {
        // 重新加载评论列表
        await loadComments();
        setCommentText('');
        setReplyingTo(null);
        
        // 更新帖子的评论数量
        setPost({
          ...post,
          commentCount: (post.commentCount || 0) + 1
        });
      } else {
        alert('评论失败：' + response.message);
      }
    } catch (err) {
      console.error('提交评论失败:', err);
      alert('评论失败：' + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // 回复评论
  const handleReply = (comment) => {
    setReplyingTo(comment);
    setCommentText(`@${comment.userNickname} `);
  };

  // 取消回复
  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  // 格式化时间
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString();
  };

  const loadFriendsForShare = async () => {
    try {
      setFriendsLoading(true);
      setFriendsError(null);
      const response = await getFriendsList();
      if (response.code === 200) {
        const raw = (response.data && response.data.list) || response.data || [];
        const list = (raw || []).map((friend) => ({
          id: friend.userId || friend.id,
          nickname: friend.nickname || friend.username || '',
          phone: friend.phone,
          avatarUrl: friend.avatar || friend.avatarUrl
        }));
        setFriends(list);
      } else {
        setFriends([]);
        setFriendsError(response.message || '获取好友列表失败');
      }
    } catch (err) {
      setFriends([]);
      setFriendsError(err.message || '获取好友列表失败');
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleShareToFriend = async (friend) => {
    if (!post || !friend) return;
    const summarySource = post.summary || post.content || '';
    let coverImage =
      post.coverImage || (Array.isArray(post.images) && post.images.length > 0 ? post.images[0] : null);
    if (typeof coverImage === 'string' && coverImage.startsWith('data:')) {
      coverImage = null;
    }
    const payload = {
      postId: post.id,
      title: post.title,
      summary: summarySource ? summarySource.slice(0, 15) : '',
      coverImage
    };
    const content = '__POST_SHARE__' + JSON.stringify(payload);
    try {
      setSharingToFriend(true);
      const response = await sendMessage(friend.id, 'text', content, null);
      if (response.code === 200) {
        setShowShareModal(false);
        alert('已分享给好友');
      } else {
        alert('分享失败：' + (response.message || ''));
      }
    } catch (err) {
      alert('分享失败：' + err.message);
    } finally {
      setSharingToFriend(false);
    }
  };

  // 处理分享
  const handleShare = () => {
    setShowDropdown(false);
    // TODO: 实现分享功能
    setShowShareModal(true);
    if (!friends || friends.length === 0) {
      loadFriendsForShare();
    }
  };

  // 处理举报
  const handleReport = async () => {
    if (!post || !post.id) {
      alert('帖子信息异常，无法举报');
      setShowDropdown(false);
      return;
    }

    setShowDropdown(false);

    const reason = prompt('请输入举报原因：');
    if (!reason || !reason.trim()) {
      return;
    }

    const payload = {
      reportType: 'post_inappropriate',
      reportReason: reason.trim(),
      reportEvidence: []
    };

    try {
      const response = await reportPost(post.id, payload);
      if (response && response.code === 200) {
        alert('举报已提交，感谢您的反馈！');
      } else {
        alert('举报失败：' + ((response && response.message) || '请稍后重试'));
      }
    } catch (err) {
      console.error('举报帖子失败:', err);
      alert('举报失败：' + (err && err.message ? err.message : '网络错误，请稍后重试'));
    }
  };

  // 处理评论举报
  const handleCommentReport = async (comment) => {
    if (!comment || !comment.id) return;

    const reason = prompt('请输入举报原因：');
    if (!reason || !reason.trim()) {
      return;
    }

    const payload = {
      commentId: comment.id,
      reportType: 'comment_inappropriate',
      reportReason: reason.trim(),
      reportEvidence: []
    };

    try {
      // TODO: 这里可以调用API提交评论举报
      const response = await reportComment(payload);
      if (response && response.code === 200) {
        alert('举报已提交，感谢您的反馈！');
      } else {
        alert('举报失败：' + ((response && response.message) || '请稍后重试'));
      }
    } catch (err) {
      console.error('举报评论失败:', err);
      alert('举报失败：' + (err && err.message ? err.message : '网络错误，请稍后重试'));
    }
  };
  
  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
          <div className="flex items-center px-4 py-3">
            <button onClick={onBack} className="mr-3">
              <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">帖子详情</h1>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
          <div className="flex items-center px-4 py-3">
            <button onClick={onBack} className="mr-3">
              <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">帖子详情</h1>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <i className="fa-solid fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <p className="text-red-500 mb-2">{error || '帖子不存在'}</p>
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3">
              <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">帖子详情</h1>
          </div>
          
          <div className="flex items-center relative dropdown-container">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="text-xl fa-solid fa-ellipsis-vertical"></i>
            </button>
            
            {/* 下拉菜单 */}
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-24 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleShare}
                  className="w-full px-2 py-1 text-center text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <i className="fa-solid fa-share mr-1 text-gray-500 text-xs"></i>
                  分享
                </button>
                <button
                  onClick={handleReport}
                  className="w-full px-2 py-1 text-center text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <i className="fa-solid fa-flag mr-1 text-gray-500 text-xs"></i>
                  举报
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-16 pb-20">
         {/* 作者信息 */}
          
            
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center cursor-pointer"
                onClick={handleAuthorClick}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">

                  {post.publisherAvatarUrl ? (
                    <img 
                      src={post.publisherAvatarUrl} 
                      alt={post.publisherNickname}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-medium">
                      {(post.publisherNickname || 'U').slice(-2)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {post.publisherNickname || '未命名'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    <span>
                      游号: {String(post.publisherId || '') || '-'}
                    </span>
                    {post.publishedTime && (
                      <span className="ml-2">
                        · {formatTime(post.publishedTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 帖子类型标签 */}
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                {post.postType === 'travel_note' ? '游记' :
                 post.postType === 'strategy' ? '攻略' :
                 post.postType === 'photo_share' ? '照片分享' :
                 post.postType === 'video_share' ? '视频分享' :
                 post.postType === 'qa' ? '问答' : '帖子'}
              </span>
            </div>
        {/* 帖子内容 */}
        <div className="bg-white">
          {/* 轮播图 - 合并封面图片和图片展示 */}
          {(() => {
            // 合并封面图片和其他图片
            const allImages = [];
            if (post.coverImage) allImages.push(post.coverImage);
            if (post.images && post.images.length > 0) allImages.push(...post.images);
            
            if (allImages.length === 0) return null;
            
            const SWIPE_THRESHOLD = 40;

            // 处理触摸开始
            const handleTouchStart = (e) => {
              if (!e.touches || e.touches.length === 0) return;
              const touch = e.touches[0];
              isDraggingRef.current = true;
              touchStartXRef.current = touch.clientX;
              touchStartYRef.current = touch.clientY;
              touchEndXRef.current = null;
              touchEndYRef.current = null;
            };
            
            // 处理触摸移动
            const handleTouchMove = (e) => {
              if (!isDraggingRef.current || !e.touches || e.touches.length === 0) return;
              const touch = e.touches[0];
              touchEndXRef.current = touch.clientX;
              touchEndYRef.current = touch.clientY;
            };

            const finishSwipe = () => {
              if (
                !isDraggingRef.current ||
                touchStartXRef.current == null ||
                touchEndXRef.current == null ||
                touchStartYRef.current == null ||
                touchEndYRef.current == null
              ) {
                isDraggingRef.current = false;
                return;
              }

              const deltaX = touchStartXRef.current - touchEndXRef.current;
              const deltaY = touchStartYRef.current - touchEndYRef.current;

              // 垂直滑动交给页面滚动，不触发切换
              if (Math.abs(deltaY) > Math.abs(deltaX)) {
                isDraggingRef.current = false;
                return;
              }

              if (deltaX > SWIPE_THRESHOLD) {
                // 向左滑动 - 下一张
                setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
              } else if (deltaX < -SWIPE_THRESHOLD) {
                // 向右滑动 - 上一张
                setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
              }

              isDraggingRef.current = false;
              touchStartXRef.current = null;
              touchEndXRef.current = null;
              touchStartYRef.current = null;
              touchEndYRef.current = null;
            };
            
            // 处理触摸结束
            const handleTouchEnd = () => {
              finishSwipe();
            };
            
            // 处理鼠标拖拽（电脑端）
            const handleMouseDown = (e) => {
              isDraggingRef.current = true;
              touchStartXRef.current = e.clientX;
              touchStartYRef.current = e.clientY;
              touchEndXRef.current = null;
              touchEndYRef.current = null;
            };
            
            const handleMouseMove = (e) => {
              if (!isDraggingRef.current) return;
              touchEndXRef.current = e.clientX;
              touchEndYRef.current = e.clientY;
            };
            
            const handleMouseUp = () => {
              finishSwipe();
            };
            
            // 上一张
            const handlePrev = () => {
              setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
            };
            
            // 下一张
            const handleNext = () => {
              setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
            };
            
            return (
              <div className="relative w-full h-64 bg-gray-900 overflow-hidden">
                {/* 图片容器 */}
                <div 
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    isDraggingRef.current = false;
                    touchStartXRef.current = null;
                    touchEndXRef.current = null;
                    touchStartYRef.current = null;
                    touchEndYRef.current = null;
                  }}
                >
                  <img 
                    src={allImages[currentImageIndex]} 
                    alt={`图片 ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </div>
                
                {/* 左右切换按钮 */}
                {/* {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all z-10"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all z-10"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </>
                )} */}
                
                {/* 指示器 */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* 图片计数 */}
                {allImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full z-10">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>
            );
          })()}
          <h1 className="text-xl font-bold text-gray-800 mb-3 mt-5 ml-[2%]">
              {post.title}
            </h1>
          {/* 帖子信息 */}
          <div className="p-4">
            {/* 正文内容 */}
            <div className="prose max-w-none mb-6">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </div>
            {post.videos && post.videos.length > 0 && (
              <div className="mb-6 space-y-4">
                {post.videos.map((video, index) => (
                  <div key={index} className="w-full rounded-lg overflow-hidden bg-black">
                    <video
                      src={video}
                      controls
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* 摘要 */}
            {post.summary && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{post.summary}</p>
              </div>
            )}
            
            {/* 互动数据 */}
            <div className="flex items-center justify-between py-4 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-500">
                  <i className="fa-solid fa-eye mr-1"></i>
                  <span className="text-sm">{post.viewCount || 0}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <i className="fa-solid fa-comment mr-1"></i>
                  <span className="text-sm">{post.commentCount || 0}</span>
                </div>
              </div>
              
              <button
                onClick={handleFavorite}
                disabled={favoriteLoading}
                className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                  isFavorited 
                    ? 'text-yellow-600' 
                    : 'text-gray-600 hover:text-yellow-600'
                } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <i className={`fa-solid fa-star mr-2 ${isFavorited ? 'text-yellow-500' : ''}`}></i>
                {/* <span>{isFavorited ? '已收藏' : '收藏'}</span> */}
              </button>
            </div>
          </div>
        </div>
        
        {/* 评论区域 */}
        <div className="mt-2 bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-800">
              评论 ({comments.length})
            </h3>
          </div>
          
          {/* 评论列表 */}
          <div className="divide-y divide-gray-100">
            {commentsLoading ? (
              <div className="p-4 text-center">
                <i className="fa-solid fa-spinner fa-spin text-gray-400 mr-2"></i>
                <span className="text-gray-500">加载评论中...</span>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="p-4">
                  <div className="flex items-start">
                    <div
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden cursor-pointer"
                      onClick={() => handleCommentUserClick(comment.userId, comment.userNickname, comment.userAvatarUrl)}
                    >
                      {comment.userAvatarUrl ? (
                        <img 
                          src={comment.userAvatarUrl} 
                          alt={comment.userNickname}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-sm">
                          {(comment.userNickname || 'U').slice(-2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-800 mr-2">
                          {comment.userNickname || '未命名'}
                        </span>
                        {comment.isAuthorReply && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                            作者
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto text-right">
                          <span className="block">
                            游号: {String(comment.userId || '') || '-'}
                          </span>
                          <span className="block">
                            {formatTime(comment.createdTime)}
                          </span>
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">
                        {comment.commentContent}
                      </p>
                      
                      {/* 评论图片 */}
                      {comment.commentImages && comment.commentImages.length > 0 && (
                        <div className="flex space-x-2 mb-2">
                          {comment.commentImages.map((image, index) => (
                            <img 
                              key={index}
                              src={image} 
                              alt={`评论图片 ${index + 1}`}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => handleReply(comment)}
                            className="hover:text-blue-600"
                          >
                            回复
                          </button>
                          <div className="flex items-center">
                            <i className="fa-solid fa-heart mr-1"></i>
                            <span>{comment.likeCount || 0}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCommentReport(comment)}
                          className="hover:text-red-600 flex items-center"
                          title="举报评论"
                        >
                          <i className="fa-solid fa-flag mr-1"></i>
                          举报
                        </button>
                      </div>
                      
                      {/* 回复列表 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start">
                              <div
                                className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 overflow-hidden cursor-pointer"
                                onClick={() => handleCommentUserClick(reply.userId, reply.userNickname, reply.userAvatarUrl)}
                              >
                                {reply.userAvatarUrl ? (
                                  <img
                                    src={reply.userAvatarUrl}
                                    alt={reply.userNickname}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-600 text-xs">
                                    {(reply.userNickname || 'U').slice(-2)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <span className="font-medium text-gray-800 text-sm mr-2">
                                    {reply.userNickname || '未命名'}
                                  </span>
                                  {reply.isAuthorReply && (
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                      作者
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 ml-auto">
                                    {formatTime(reply.createdTime)}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm mb-2">
                                  {reply.commentContent}
                                </p>
                                
                                {/* 回复评论的操作按钮 */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center space-x-3">
                                    <button 
                                      onClick={() => handleReply(reply)}
                                      className="hover:text-blue-600"
                                    >
                                      回复
                                    </button>
                                    <div className="flex items-center">
                                      <i className="fa-solid fa-heart mr-1"></i>
                                      <span>{reply.likeCount || 0}</span>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleCommentReport(reply)}
                                    className="hover:text-red-600 flex items-center"
                                    title="举报回复"
                                  >
                                    <i className="fa-solid fa-flag mr-1"></i>
                                    举报
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <i className="fa-solid fa-comment text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 mb-2">暂无评论</p>
                <p className="text-sm text-gray-400">快来发表第一条评论吧！</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 评论输入框 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 p-2 bg-blue-50 rounded">
            <span className="text-sm text-blue-600">
              回复 @{replyingTo.userNickname}
            </span>
            <button 
              onClick={handleCancelReply}
              className="text-blue-600 hover:text-blue-800"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyingTo ? `回复 @${replyingTo.userNickname}` : "写下你的评论..."}
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:border-blue-500"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || submittingComment}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingComment ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              '发送'
            )}
          </button>
        </div>
      </div>

      {/* 分享给好友弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg w-80 max-h-[70vh] flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-800">选择好友分享</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {friendsLoading ? (
                <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  <span>正在加载好友列表...</span>
                </div>
              ) : friendsError ? (
                <div className="px-4 py-4 text-center text-sm text-red-500">
                  <p className="mb-2">{friendsError}</p>
                  <button
                    onClick={loadFriendsForShare}
                    className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    重新加载
                  </button>
                </div>
              ) : friends.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  暂无好友可以分享
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {friends.map((friend) => (
                    <li
                      key={friend.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => !sharingToFriend && handleShareToFriend(friend)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3">
                          {friend.avatarUrl ? (
                            <img
                              src={friend.avatarUrl}
                              alt={friend.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-blue-600">
                              {(friend.nickname || friend.phone || 'U').slice(-2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {friend.nickname || friend.phone || '未命名'}
                          </div>
                          {friend.phone && (
                            <div className="text-xs text-gray-400">{friend.phone}</div>
                          )}
                        </div>
                      </div>
                      <button
                        className="text-xs px-2 py-1 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50"
                        type="button"
                      >
                        {sharingToFriend ? '发送中...' : '发送'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;

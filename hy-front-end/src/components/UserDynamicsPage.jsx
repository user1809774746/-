import React, { useState, useEffect } from 'react';
import { getUserPosts, getUserParticipatedActivities } from '../api/config';
import PostDetailPage from './PostDetailPage';
import ActivityDetailPage from './ActivityDetailPage';

const UserDynamicsPage = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'activities'
  const [posts, setPosts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [activitiesError, setActivitiesError] = useState(null);

  const [privacyLimited, setPrivacyLimited] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  const userId = user?.id || user?.userId;
  const isFromTopics = !!user?.fromTopics;

  const displayName = user?.nickname || user?.username || user?.phone || '未设置用户名';
  const avatarText = displayName ? displayName.charAt(0) : 'U';

  useEffect(() => {
    if (!userId) return;

    const fetchUserPosts = async () => {
      try {
        setLoadingPosts(true);
        setPostsError(null);
        const response = await getUserPosts(userId, 'published');
        if (response && response.code === 200 && response.data) {
          const data = response.data;
          const list = Array.isArray(data.list)
            ? data.list
            : Array.isArray(data)
              ? data
              : [];
          setPosts(list);
        } else {
          setPosts([]);
          setPostsError(response?.message || '加载帖子失败');
        }
      } catch (error) {
        console.error('加载用户帖子失败:', error);
        const message = error && error.message ? error.message : '';

        // 只在“话题模块”进入的用户中心里应用隐私逻辑
        if (isFromTopics) {
          const isPrivacyError =
            (error && error.status === 403) ||
            message.includes('403') ||
            message.toLowerCase().includes('forbidden') ||
            message.includes('隐私保护') ||
            message.includes('隐私');

          if (isPrivacyError) {
            setPrivacyLimited(true);
            setPosts([]);
            setPostsError(null);
          } else {
            setPosts([]);
            setPostsError(message || '加载帖子失败');
          }
        } else {
          // 非话题入口（例如聊天中的好友用户中心）保持原有行为
          setPosts([]);
          setPostsError(message || '加载帖子失败');
        }
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        setActivitiesError(null);
        const response = await getUserParticipatedActivities(userId);
        if (response && response.code === 200 && Array.isArray(response.data)) {
          setActivities(response.data);
        } else {
          setActivities([]);
          setActivitiesError(response?.message || '加载活动失败');
        }
      } catch (error) {
        console.error('加载用户参与活动失败:', error);
        const message = error && error.message ? error.message : '';

        if (isFromTopics) {
          const isPrivacyError =
            (error && error.status === 403) ||
            message.includes('403') ||
            message.toLowerCase().includes('forbidden') ||
            message.includes('隐私保护') ||
            message.includes('隐私');

          if (isPrivacyError) {
            setPrivacyLimited(true);
            setActivities([]);
            setActivitiesError(null);
          } else {
            setActivities([]);
            setActivitiesError(message || '加载活动失败');
          }
        } else {
          setActivities([]);
          setActivitiesError(message || '加载活动失败');
        }
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部栏 */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center">
        <button
          className="mr-3 text-gray-600 hover:text-gray-800"
          onClick={onBack}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">用户动态</h1>
      </div>

      {/* 头部用户信息 */}
      <div className="bg-white px-4 py-4 flex items-center border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-5 overflow-hidden">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-blue-600">
              {avatarText}
            </span>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{displayName}</p>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="bg-white flex border-b border-gray-100">
        <button
          className={`flex-1 py-2 text-sm font-medium text-center ${
            activeTab === 'posts'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          帖子
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium text-center ${
            activeTab === 'activities'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('activities')}
        >
          活动
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {privacyLimited ? (
          <div className="text-center text-gray-500 text-sm mt-10">
            <i className="fa-solid fa-lock text-3xl mb-3 text-gray-300"></i>
            <p className="mb-1">该用户设置了隐私，您不能观看</p>
          </div>
        ) : activeTab === 'posts' ? (
          <div>
            {loadingPosts ? (
              <div className="text-center text-gray-500 text-sm mt-10">
                <p>正在加载该用户的帖子...</p>
              </div>
            ) : postsError ? (
              <div className="text-center text-red-500 text-sm mt-10">
                <p>加载帖子失败：{postsError}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-10">
                <i className="fa-regular fa-note-sticky text-3xl mb-3 text-gray-300"></i>
                <p className="mb-1">该用户还没有发布帖子</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg p-3 flex cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedPost(post);
                      setShowPostDetail(true);
                    }}
                  >
                    {post.coverImage && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={post.coverImage}
                          alt={post.title || '帖子封面'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {post.title || '未命名帖子'}
                      </p>
                      {post.summary && (
                        <p className="mt-1 text-xs text-gray-500">
                          {post.summary}
                        </p>
                      )}
                      <div className="mt-1 text-[11px] text-gray-400 flex items-center space-x-3">
                        {post.publishedTime && (
                          <span>{(post.publishedTime || '').slice(0, 10)}</span>
                        )}
                        <span>浏览 {post.viewCount || 0}</span>
                        <span>点赞 {post.likeCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingActivities ? (
              <div className="text-center text-gray-500 text-sm mt-10">
                <p>正在加载该用户参与的活动...</p>
              </div>
            ) : activitiesError ? (
              <div className="text-center text-red-500 text-sm mt-10">
                <p>加载活动失败：{activitiesError}</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-10">
                <i className="fa-regular fa-calendar-check text-3xl mb-3 text-gray-300"></i>
                <p className="mb-1">该用户还没有参加过活动</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-lg p-3 flex cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setShowActivityDetail(true);
                    }}
                  >
                    {activity.coverImage && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={activity.coverImage}
                          alt={activity.title || '活动封面'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {activity.title || '未命名活动'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {activity.locationName || activity.city || '地点待定'}
                      </p>
                      <div className="mt-1 text-[11px] text-gray-400 flex items-center space-x-3">
                        {activity.startTime && (
                          <span>{activity.startTime}</span>
                        )}
                        <span>浏览 {activity.viewCount || 0}</span>
                        <span>点赞 {activity.likeCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showPostDetail && selectedPost && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <PostDetailPage
            postId={selectedPost.id}
            onBack={() => {
              setShowPostDetail(false);
              setSelectedPost(null);
            }}
          />
        </div>
      )}

      {showActivityDetail && selectedActivity && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <ActivityDetailPage
            activityId={selectedActivity.id}
            onBack={() => {
              setShowActivityDetail(false);
              setSelectedActivity(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UserDynamicsPage;

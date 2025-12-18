import React, { useState, useEffect } from 'react';
import { createPost, publishPost, saveDraft, updatePost, getPostDetail, streamPolishTravelogue, getCurrentUserId } from '../api/config';

const PostEditorPage = ({ onBack, editingPost = null, generatedPost = null }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [polishing, setPolishing] = useState(false); // 🎨 AI润色状态
  const [polishContent, setPolishContent] = useState(''); // 🎨 润色后的内容
  const [showPolishDialog, setShowPolishDialog] = useState(false); // 🎨 显示润色确认弹窗

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  // 🚫 注释掉不再使用的状态变量
  // const [initialPostId, setInitialPostId] = useState(null);
  // const [initializingFromTravelPlan, setInitializingFromTravelPlan] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    contentType: 'richtext',
    postType: 'travel_note',
    category: 'domestic',
    coverImage: '',
    images: [],
    videos: [],
    destinationName: '',
    destinationCity: '',
    destinationProvince: '',
    destinationCountry: 'China',
    travelDays: '',
    travelBudget: '',
    actualCost: '',
    travelSeason: 'spring',
    travelStyle: 'solo',
    tags: '',
    keywords: '',
    isPublic: true,
    allowComments: true,
    allowShares: true
  });

  const [errors, setErrors] = useState({});
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // 帖子类型选项
  const postTypes = [
    { value: 'travel_note', label: '游记', icon: 'fa-book' },
    { value: 'strategy', label: '攻略', icon: 'fa-map' },
    { value: 'photo_share', label: '照片分享', icon: 'fa-camera' },
    { value: 'video_share', label: '视频分享', icon: 'fa-video' },
    { value: 'qa', label: '问答', icon: 'fa-question-circle' }
  ];

  // 分类选项
  const categories = [
    { value: 'domestic', label: '国内旅游' },
    { value: 'international', label: '国际旅游' },
    { value: 'city_walk', label: '城市漫步' },
    { value: 'adventure', label: '探险户外' }
  ];

  // 旅行季节选项
  const seasons = [
    { value: 'spring', label: '春季' },
    { value: 'summer', label: '夏季' },
    { value: 'autumn', label: '秋季' },
    { value: 'winter', label: '冬季' }
  ];

  // 旅行风格选项
  const travelStyles = [
    { value: 'solo', label: '独自旅行' },
    { value: 'couple', label: '情侣出行' },
    { value: 'family', label: '家庭旅游' },
    { value: 'backpack', label: '背包客' },
    { value: 'luxury', label: '奢华旅游' }
  ];

  // 如果是编辑模式，初始化表单数据
  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title || '',
        summary: editingPost.summary || '',
        content: editingPost.content || '',
        contentType: editingPost.contentType || 'richtext',
        postType: editingPost.postType || 'travel_note',
        category: editingPost.category || 'domestic',
        coverImage: editingPost.coverImage || '',
        images: editingPost.images || [],
        videos: editingPost.videos || [],
        destinationName: editingPost.destinationName || '',
        destinationCity: editingPost.destinationCity || '',
        destinationProvince: editingPost.destinationProvince || '',
        destinationCountry: editingPost.destinationCountry || 'China',
        travelDays: editingPost.travelDays || '',
        travelBudget: editingPost.travelBudget || '',
        actualCost: editingPost.actualCost || '',
        travelSeason: editingPost.travelSeason || 'spring',
        travelStyle: editingPost.travelStyle || 'solo',
        tags: editingPost.tags || '',
        keywords: editingPost.keywords || '',
        isPublic: editingPost.isPublic !== false,
        allowComments: editingPost.allowComments !== false,
        allowShares: editingPost.allowShares !== false
      });
    }
  }, [editingPost]);

  useEffect(() => {
    if (!editingPost && generatedPost) {
      setFormData(prev => ({
        ...prev,
        title: generatedPost.title || prev.title,
        summary: generatedPost.summary || prev.summary,
        content: generatedPost.content || prev.content,
        destinationName: generatedPost.destinationName || prev.destinationName,
        destinationCity: generatedPost.destinationCity || prev.destinationCity,
        images: generatedPost.images || prev.images // 🖼️ 添加图片列表
      }));
    }
  }, [generatedPost, editingPost]);

  // 全局提示（Toast）自动隐藏
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  // 🚫 注释掉旧的基于旅行计划自动创建帖子的逻辑 - 现在直接通过 generatedPost 初始化表单
  // useEffect(() => {
  //   let cancelled = false;

  //   const initFromTravelPlan = async () => {
  //     if (editingPost || !generatedPost) {
  //       return;
  //     }

  //     let travelPlanId = null;
  //     try {
  //       travelPlanId = localStorage.getItem('travelPlanIdForPost');
  //     } catch (e) {
  //       travelPlanId = null;
  //     }

  //     if (!travelPlanId) {
  //       return;
  //     }

  //     setInitializingFromTravelPlan(true);

  //     try {
  //       const basePayload = {
  //         ...formData,
  //         ...generatedPost,
  //       };

  //       const createResponse = await createPost(basePayload);
  //       if (!createResponse || createResponse.code !== 200 || !createResponse.data || !createResponse.data.id) {
  //         throw new Error((createResponse && createResponse.message) || '创建帖子失败');
  //       }

  //       const postId = createResponse.data.id;
  //       if (cancelled) {
  //         return;
  //       }

  //       setInitialPostId(postId);

  //       // 🚫 注释掉旧接口调用 - 现在直接在创建时就传递图片URL列表
  //       // try {
  //       //   await copyTravelPlanImagesToPost(travelPlanId, postId);
  //       // } catch (e) {}

  //       if (cancelled) {
  //         return;
  //       }

  //       const detailResponse = await getPostDetail(postId);
  //       if (cancelled) {
  //         return;
  //       }

  //       if (detailResponse && detailResponse.code === 200 && detailResponse.data) {
  //         const fullPost = detailResponse.data;
  //         setFormData(prev => ({
  //           ...prev,
  //           title: fullPost.title || prev.title,
  //           summary: fullPost.summary || prev.summary,
  //           content: fullPost.content || prev.content,
  //           coverImage: fullPost.coverImage || prev.coverImage,
  //           images: Array.isArray(fullPost.images) ? fullPost.images : prev.images,
  //           videos: Array.isArray(fullPost.videos) ? fullPost.videos : prev.videos,
  //         }));
  //       }

  //       try {
  //         localStorage.removeItem('travelPlanIdForPost');
  //       } catch (e) {}
  //     } catch (e) {
  //       console.error('基于旅行计划初始化帖子失败:', e);
  //     } finally {
  //       if (!cancelled) {
  //         setInitializingFromTravelPlan(false);
  //       }
  //     }
  //   };

  //   initFromTravelPlan();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [editingPost, generatedPost]);

  // 🎨 AI润色处理函数
  const handleAIPolish = async () => {
    if (polishing) return;

    // 构建游记内容 - 只有当字段有内容时才包含前缀
    const parts = [];
    if (formData.title && formData.title.trim()) {
      parts.push(`标题：${formData.title.trim()}`);
    }
    if (formData.summary && formData.summary.trim()) {
      parts.push(`摘要：${formData.summary.trim()}`);
    }
    if (formData.content && formData.content.trim()) {
      parts.push(`正文：${formData.content.trim()}`);
    }
    
    const travelogueContent = parts.join('\n');

    if (!travelogueContent.trim()) {
      alert('请先填写游记内容再进行润色');
      return;
    }

    try {
      setPolishing(true);
      setPolishContent('');
      setShowPolishDialog(true);

      let fullContent = '';
      
      // 获取当前用户ID
      const userId = await getCurrentUserId();
      console.log('🔍 获取到的用户ID:', userId);
      
      if (!userId) {
        throw new Error('无法获取用户ID，请先登录');
      }
      
      console.log('🚀 开始调用AI润色API:', {
        userId: String(userId),
        contentLength: travelogueContent.length,
        existingTravelogue: travelogueContent.substring(0, 100) + (travelogueContent.length > 100 ? '...' : '')
      });
      
      await streamPolishTravelogue({
        userId: String(userId),
        existingTravelogue: travelogueContent,
        onDelta: (delta, content) => {
          fullContent = content;
          setPolishContent(fullContent);
        }
      });

    } catch (error) {
      console.error('AI润色失败:', error);
      const errorMessage = error.message || '未知错误';
      if (errorMessage.includes('用户ID') || errorMessage.includes('登录')) {
        alert(`AI润色失败：${errorMessage}\n\n请确保您已登录后再使用AI润色功能。`);
      } else {
        alert(`AI润色失败：${errorMessage}\n\n请检查网络连接或稍后重试。`);
      }
      setShowPolishDialog(false);
    } finally {
      setPolishing(false);
    }
  };

  // 🎨 应用润色结果
  const applyPolishContent = () => {
    try {
      // 尝试解析润色后的内容，分别提取标题、摘要、正文
      const polishedTitle = extractField(polishContent, '标题：', '摘要：') || formData.title;
      const polishedSummary = extractField(polishContent, '摘要：', '正文：') || formData.summary;
      const polishedContentText = extractField(polishContent, '正文：', null) || formData.content;

      setFormData(prev => ({
        ...prev,
        title: polishedTitle.trim(),
        summary: polishedSummary.trim(),
        content: polishedContentText.trim()
      }));

      setShowPolishDialog(false);
      setToastMessage('AI润色内容已应用到您的游记中！');
      setShowToast(true);
    } catch (error) {
      console.error('应用润色内容失败:', error);
      alert('应用润色内容失败，请重试');
    }
  };

  // 🎨 辅助函数：提取字段内容
  const extractField = (content, startTag, endTag) => {
    const startIndex = content.indexOf(startTag);
    if (startIndex === -1) return '';
    
    const contentStart = startIndex + startTag.length;
    const endIndex = endTag ? content.indexOf(endTag, contentStart) : content.length;
    
    if (endIndex === -1) return '';
    
    return content.substring(contentStart, endIndex).trim();
  };

  // 自动保存草稿
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.title.trim() || formData.content.trim()) {
        handleSaveDraft(true); // 自动保存
      }
    }, 30000); // 每30秒自动保存

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // 处理表单字段变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入帖子标题';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '请输入帖子内容';
    }
    
    if (formData.travelDays && (isNaN(formData.travelDays) || formData.travelDays < 1)) {
      newErrors.travelDays = '旅行天数必须是大于0的数字';
    }
    
    if (formData.travelBudget && (isNaN(formData.travelBudget) || formData.travelBudget < 0)) {
      newErrors.travelBudget = '旅行预算必须是大于等于0的数字';
    }
    
    if (formData.actualCost && (isNaN(formData.actualCost) || formData.actualCost < 0)) {
      newErrors.actualCost = '实际花费必须是大于等于0的数字';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存草稿
  const handleSaveDraft = async (isAutoSave = false) => {
    if (!isAutoSave) setSaving(true);
    
    try {
      const draftData = {
        draftTitle: formData.title,
        draftContent: formData.content,
        draftData: formData,
        isAutoSave: isAutoSave
      };
      
      if (editingPost && editingPost.id) {
        draftData.draftId = editingPost.id;
      }
      
      const response = await saveDraft(draftData);
      
      if (response.code === 200) {
        setLastSaveTime(new Date());
        if (!isAutoSave) {
          alert('草稿保存成功！');
        }
      } else {
        if (!isAutoSave) {
          alert('保存失败：' + response.message);
        }
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      if (!isAutoSave) {
        alert('保存失败：' + error.message);
      }
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  // 发布帖子
  const handlePublish = async () => {
    if (!validateForm()) {
      alert('请检查表单填写是否正确');
      return;
    }

    // 旧的“基于旅行计划自动创建帖子”的初始化逻辑已下线，
    // 这里不再需要等待初始化状态，直接进入发布流程。

    setPublishing(true);

    
    try {
      let postId;

      if (editingPost && editingPost.id) {
        const updateResponse = await updatePost(editingPost.id, formData);
        if (updateResponse.code === 200) {
          postId = editingPost.id;
        } else {
          throw new Error(updateResponse.message || '更新帖子失败');
        }
      } else {
        const createResponse = await createPost(formData);
        if (createResponse.code === 200 && createResponse.data && createResponse.data.id) {
          postId = createResponse.data.id;
        } else {
          throw new Error(createResponse.message || '创建帖子失败');
        }
      }

      
      // 发布帖子
      const publishResponse = await publishPost(postId);
      
      if (publishResponse.code === 200) {
        alert('✅ 发布成功！\n\n📝 您的帖子已提交审核，审核通过后将对所有用户展示。\n您可以在"我发布的"页面查看审核状态。');
        onBack && onBack();
      } else {
        alert('发布失败：' + publishResponse.message);
      }
      
    } catch (error) {
      console.error('发布失败:', error);
      console.error('发布数据:', formData);
      alert('发布失败：' + error.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleCoverImageUpload = (event) => {
    const file = (event.target.files || [])[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('封面图大小不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target && e.target.result;
      if (result) {
        handleInputChange('coverImage', result);
      }
    };
    reader.onerror = () => {
      alert('封面图读取失败');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    handleInputChange('coverImage', '');
  };

  // 处理图片上传（模拟）
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    // TODO: 实现图片上传到服务器的逻辑
    console.log('上传图片:', files);

    if (!files.length) return;

    // 模拟上传成功，添加图片URL
    const maxSize = 5 * 1024 * 1024;
    const readers = files.map(file => new Promise((resolve, reject) => {
      if (file.size > maxSize) {
        reject(new Error('图片大小不能超过5MB'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    }));

    Promise.all(readers)
      .then(newImages => {
        const allImages = [...(formData.images || []), ...newImages];
        handleInputChange('images', allImages);
      })
      .catch(error => {
        alert(error.message);
      });
  };

  const handleVideoUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const maxSize = 20 * 1024 * 1024;
    const readers = files.map(file => new Promise((resolve, reject) => {
      if (file.size > maxSize) {
        reject(new Error('视频大小不能超过20MB'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('视频读取失败'));
      reader.readAsDataURL(file);
    }));

    Promise.all(readers)
      .then(newVideos => {
        handleInputChange('videos', [...(formData.videos || []), ...newVideos]);
      })
      .catch(error => {
        alert(error.message);
      });
  };

  // 删除图片
  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  const handleRemoveVideo = (index) => {
    const newVideos = (formData.videos || []).filter((_, i) => i !== index);
    handleInputChange('videos', newVideos);
  };

  return (
    <>
    {/* 全局提示 Toast */}
    {showToast && (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg bg-GuText text-white text-sm">
        {toastMessage}
      </div>
    )}
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-1 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-gray-600 text-xl"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {editingPost ? '编辑帖子' : '写帖子'}
            </h1>
          </div>
          {/* <div className='flex flex-col justify-center items-center'>
          <img src="./魔法棒.png" className='w-6 h-6'/>
          <div className=''>让ai润色</div>
          </div> */}
          
          <div className="flex items-center space-x-3">
            {/* {lastSaveTime && (
              <span className="text-xs text-gray-500">
                已保存 {lastSaveTime.toLocaleTimeString()}
              </span>
            )} */}
            <button 
              onClick={() => handleSaveDraft(false)}
              disabled={saving}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              {saving ? (
                <i className="fa-solid fa-spinner fa-spin text-xl"></i>
              ) : (
                <i className="fa-solid fa-save text-xl"></i>
              )}
            </button>
            <button 
              onClick={handlePublish}
              disabled={publishing || !formData.title.trim() || !formData.content.trim()}
              className="w-10 h-10 flex items-center justify-center bg-GuText text-white rounded-lg hover:bg-GuText disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? (
                <i className="fa-solid fa-spinner fa-spin text-lg"></i>
              ) : (
                <i className="fa-solid fa-paper-plane text-lg"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-6">
        <div className="w-full">
          {/* 审核说明提示
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <i className="fa-solid fa-info-circle text-blue-600 mr-3 mt-0.5"></i>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  📋 帖子审核说明
                </h3>
                <p className="text-sm text-blue-800">
                  为了维护社区内容质量，您发布的帖子需要经过管理员审核后才能对其他用户展示。
                  审核通过后，您的帖子将自动公开发布。您可以随时在"我发布的"页面查看审核状态和结果。
                </p>
              </div>
            </div>
          </div> */}

          {/* 内容 */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className='flex flex-row justify-between'>
            <h2 className="font-bold py-4 mb-4 text-GuText" style={{ fontFamily: '宋体, SimSun, serif' }}>内容</h2>
             {/* AI润色按钮 */}
          <button
            onClick={handleAIPolish}
            disabled={polishing}
            className="w-[80%] mb-4 py-4 font-semibold text-GuText rounded-xl shadow flex items-center justify-center transform transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              // backgroundImage: 'url("/写帖子按钮背景.png")',
              // backgroundSize: 'cover',
              // backgroundPosition: 'center',
              // backgroundRepeat: 'no-repeat'
              backgroundColor:'#d6e9ca'
            }}
          >
            <img src="./魔法棒.png" className='w-6 h-6'/>
            {polishing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin ml-2"></i>
                AI正在润色中...
              </>
            ) : (
              '让ai润色吧~'
            )}
          </button>

            </div>
             <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="请输入帖子标题"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

             {/* 摘要 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                摘要
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="请输入帖子摘要（可选）"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText"
              />
            </div>

            {/* 正文内容 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                正文内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="请输入帖子内容..."
                rows={15}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content}</p>
              )}
            </div>
          

          {/* AI润色按钮 */}
          {/* <button
            onClick={handleAIPolish}
            disabled={polishing}
            className="w-full mb-4 py-6 font-semibold text-GuText rounded-xl shadow flex items-center justify-center transform transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              backgroundImage: 'url("/写帖子按钮背景.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <img src="./魔法棒.png" className='w-6 h-6'/>
            {polishing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin ml-2"></i>
                AI正在润色中...
              </>
            ) : (
              '让ai润色吧~'
            )}
          </button> */}


            
            {/* 封面图片上传 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative overflow-hidden h-32">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                  id="cover-image-upload"
                />
                {formData.coverImage ? (
                  <label htmlFor="cover-image-upload" className="cursor-pointer block w-full h-full">
                    <img
                      src={formData.coverImage}
                      alt="封面预览"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <span className="text-white text-sm">点击更换封面</span>
                    </div>
                  </label>
                ) : (
                  <label
                    htmlFor="cover-image-upload"
                    className="cursor-pointer text-GuText hover:text-GuText flex flex-col items-center justify-center h-full"
                  >
                    <i className="fa-solid fa-cloud-upload-alt text-2xl mb-2"></i>
                    <span>选择一张作为首页封面</span>
                    <p className="mt-2 text-xs text-gray-500">
                      建议上传横向图片
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* 图片上传 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <div className="grid grid-cols-4 gap-3">
                  {/* 已上传的图片 */}
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative h-24">
                      <img
                        src={image}
                        alt={`上传图片 ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {/* 上传按钮 */}
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-GuText hover:border-GuText hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa-solid fa-plus text-xl mb-1"></i>
                    <span className="text-xs">上传图片</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 视频上传 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <div className="grid grid-cols-3 gap-3">
                  {/* 已上传的视频 */}
                  {formData.videos && formData.videos.map((video, index) => (
                    <div key={index} className="relative h-32">
                      <video
                        src={video}
                        controls
                        className="w-full h-full bg-black rounded-lg object-contain"
                      />
                      <button
                        onClick={() => handleRemoveVideo(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {/* 上传按钮 */}
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-GuText hover:border-GuText hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa-solid fa-plus text-xl mb-1"></i>
                    <span className="text-xs">上传视频</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 标题 */}
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="请输入帖子标题"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div> */}

            {/* 摘要
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                摘要
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="请输入帖子摘要（可选）"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText"
              /> */}


            {/* 正文内容 */}
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                正文内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="请输入帖子内容..."
                rows={15}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content}</p>
              )}
            </div>
          </div> */}

          {/* AI润色按钮 */}
          {/* <button
            onClick={handleAIPolish}
            disabled={polishing}
            className="w-full mb-4 py-6 font-semibold text-GuText rounded-xl shadow flex items-center justify-center transform transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              backgroundImage: 'url("/写帖子按钮背景.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <img src="./魔法棒.png" className='w-6 h-6'/>
            {polishing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin ml-2"></i>
                AI正在润色中...
              </>
            ) : (
              '让ai润色吧~'
            )}
          </button> */}

          {/* 信息 */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-bold mb-4 text-GuText" style={{ fontFamily: '宋体, SimSun, serif' }}>信息</h2>
            
            {/* 帖子类型和分类 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  帖子类型
                </label>
                <select
                  value={formData.postType}
                  onChange={(e) => handleInputChange('postType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText"
                >
                  {postTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 目的地和城市 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目的地
                </label>
                <input
                  type="text"
                  value={formData.destinationName}
                  onChange={(e) => handleInputChange('destinationName', e.target.value)}
                  placeholder="如：北京"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  城市
                </label>
                <input
                  type="text"
                  value={formData.destinationCity}
                  onChange={(e) => handleInputChange('destinationCity', e.target.value)}
                  placeholder="如：北京市"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText"
                />
              </div>
            </div>
          </div>

          {/* 其他 */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-bold mb-4 text-GuText" style={{ fontFamily: '宋体, SimSun, serif' }}>其他</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="用逗号分隔，如：旅游,攻略,北京"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关键词
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="用逗号分隔，如：北京旅游,三日游,攻略"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-GuText focus:border-GuText"
              />
            </div>

            {/* 发布设置（已临时隐藏） */}
            {false && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="w-4 h-4 text-GuText border-gray-300 rounded focus:ring-GuText"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                    公开发布（其他用户可以看到）
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowComments"
                    checked={formData.allowComments}
                    onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                    className="w-4 h-4 text-GuText border-gray-300 rounded focus:ring-GuText"
                  />
                  <label htmlFor="allowComments" className="ml-2 text-sm text-gray-700">
                    允许评论
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowShares"
                    checked={formData.allowShares}
                    onChange={(e) => handleInputChange('allowShares', e.target.checked)}
                    className="w-4 h-4 text-GuText border-gray-300 rounded focus:ring-GuText"
                  />
                  <label htmlFor="allowShares" className="ml-2 text-sm text-gray-700">
                    允许分享
                  </label>
                </div>
              </div>
            )}

          </div>
        </div>
         {/* 审核说明提示 */}
          <div className="border border-GuText rounded-xl p-4 mb-6" style={{backgroundColor:'#FDEED9'}}>
            <div className="flex items-start">
              <i className="fa-solid fa-info-circle text-GuText mr-3 mt-0.5"></i>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-GuText mb-1">
                  📋 帖子审核说明
                </h3>
                <p className="text-sm text-GuText">
                  为了维护社区内容质量，您发布的帖子需要经过管理员审核后才能对其他用户展示。
                  审核通过后，您的帖子将自动公开发布。您可以随时在"我发布的"页面查看审核状态和结果。
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
    </div>
    {/* 🎨 AI润色确认弹窗 */}
    {showPolishDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"style={{backgroundImage:'url(/润色弹窗.jpg)',backgroundRepeat:'no-repeat',backgroundSize:'cover'}}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-GuText" style={{fontFamily: '宋体, SimSun, serif' }}>ai润色结果</h3>
            <button 
              onClick={() => setShowPolishDialog(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            {polishing ? (
              <div className="flex items-center justify-center py-8">
                <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500 mr-3"></i>
                <span className="text-gray-600">AI正在润色您的游记，请稍候...</span>
              </div>
            ) : (
              <div>
                {/* <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    📝 以下是AI润色后的内容，您可以：
                  </p>
                  <ul className="text-sm text-gray-600 ml-4 space-y-1">
                    <li>✅ 直接应用到您的游记</li>
                    <li>✅ 手动复制需要的部分</li>
                    <li>✅ 关闭弹窗继续编辑原内容</li>
                  </ul>
                </div> */}
                
                <div className="bg-white p-4 mb-4">
                  {/* <h4 className="font-semibold text-GuText mb-2">润色结果：</h4> */}
                  <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                    {polishContent || '正在生成润色内容...'}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={applyPolishContent}
                    className="flex-1 bg-GuText text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fa-solid fa-check mr-2"></i>
                    应用润色内容
                  </button>
                  <button
                    onClick={handleAIPolish}
                    disabled={polishing}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-times mr-2"></i>
                    再润色
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  )
};

export default PostEditorPage;

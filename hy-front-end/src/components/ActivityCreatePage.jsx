import React, { useState, useEffect } from 'react';
import { createActivity, publishActivity, uploadActivityMedia } from '../api/config';



const ActivityCreatePage = ({ onBack, onSuccess }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    // 基本信息
    title: '',
    subtitle: '',
    description: '',
    summary: '',
    
    // 时间信息
    startTime: '',
    endTime: '',
    registrationStart: '',
    registrationEnd: '',
    durationHours: '',
    
    // 地点信息（目的地名称存储在locationName中）
    locationName: '', // 目的地名称
    address: '',
    city: '',
    province: '',
    country: 'China',
    latitude: null,
    longitude: null,
    
    // 参与设置
    maxParticipants: 0,
    minParticipants: 1,
    ageMin: 0,
    ageMax: 100,
    
    // 费用设置
    price: 0,
    originalPrice: 0,
    currency: 'CNY',
    paymentRequired: false,
    refundPolicy: '',
    
    // 媒体文件
    coverImage: '',
    images: '',
    videos: '',
    
    // 联系方式
    contactPhone: '',
    contactEmail: '',
    contactWechat: '',
    
    // 活动设置
    isPublic: true,
    autoApprove: true,
    allowWaitlist: true,
    
    // 其他信息
    tags: '',
    requirements: '',
    equipment: '',
    notes: '',
    customFields: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    
    // 处理数字类型字段
    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    } else if (type === 'checkbox') {
      processedValue = checked;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 获取当前位置
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationStatus('正在获取位置...');
    
    if (!navigator.geolocation) {
      setLocationStatus('浏览器不支持地理定位');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude,
          longitude: longitude
        }));
        setLocationStatus(`位置获取成功: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocationLoading(false);
      },
      (error) => {
        console.error('获取位置失败:', error);
        let errorMessage = '获取位置失败';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了地理定位请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '获取位置超时';
            break;
        }
        setLocationStatus(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // 页面加载时自动获取位置
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Toast自动隐藏
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleCoverImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setToast({
        show: true,
        message: '封面仅支持图片文件',
        type: 'error'
      });
      event.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setToast({
        show: true,
        message: '封面图片不能超过 5MB',
        type: 'error'
      });
      event.target.value = '';
      return;
    }

    setUploadingCoverImage(true);
    try {
      const response = await uploadActivityMedia(file, 'image');
      if (response.code === 200 && response.data && response.data.url) {
        const url = response.data.url;
        setCoverImageUrl(url);
        setFormData((form) => ({
          ...form,
          coverImage: url
        }));
      } else {
        setToast({
          show: true,
          message: '封面上传失败: ' + (response.message || '未知错误'),
          type: 'error'
        });
      }
    } catch (error) {
      console.error('上传封面失败:', error);
      setToast({
        show: true,
        message: '封面上传失败: ' + (error.message || '网络错误，请稍后重试'),
        type: 'error'
      });
    } finally {
      setUploadingCoverImage(false);
      event.target.value = '';
    }
  };

  const handleImageUpload = async (event) => {

    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const remainingSlots = 10 - imageUrls.length;
    if (remainingSlots <= 0) {
      setToast({
        show: true,
        message: '最多只能上传 10 张图片',
        type: 'error'
      });
      event.target.value = '';
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    setUploadingImage(true);
    try {
      const newUrls = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          setToast({
            show: true,
            message: '仅支持图片文件',
            type: 'error'
          });
          continue;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          setToast({
            show: true,
            message: '单张图片不能超过 5MB',
            type: 'error'
          });
          continue;
        }

        const response = await uploadActivityMedia(file, 'image');
        if (response.code === 200 && response.data && response.data.url) {
          newUrls.push(response.data.url);
        } else {
          setToast({
            show: true,
            message: '图片上传失败: ' + (response.message || '未知错误'),
            type: 'error'
          });
        }
      }

      if (newUrls.length > 0) {
        setImageUrls((prev) => {
          const merged = [...prev, ...newUrls];
          setFormData((form) => ({
            ...form,
            images: merged.join(',')
          }));
          return merged;
        });
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      setToast({
        show: true,
        message: '图片上传失败: ' + (error.message || '网络错误，请稍后重试'),
        type: 'error'
      });
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleVideoUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const remainingSlots = 5 - videoUrls.length;
    if (remainingSlots <= 0) {
      setToast({
        show: true,
        message: '最多只能上传 5 个视频',
        type: 'error'
      });
      event.target.value = '';
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    setUploadingVideo(true);
    try {
      const newUrls = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith('video/')) {
          setToast({
            show: true,
            message: '仅支持视频文件',
            type: 'error'
          });
          continue;
        }

        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
          setToast({
            show: true,
            message: '单个视频不能超过 20MB',
            type: 'error'
          });
          continue;
        }

        const response = await uploadActivityMedia(file, 'video');
        if (response.code === 200 && response.data && response.data.url) {
          newUrls.push(response.data.url);
        } else {
          setToast({
            show: true,
            message: '视频上传失败: ' + (response.message || '未知错误'),
            type: 'error'
          });
        }
      }

      if (newUrls.length > 0) {
        setVideoUrls((prev) => {
          const merged = [...prev, ...newUrls];
          setFormData((form) => ({
            ...form,
            videos: merged.join(',')
          }));
          return merged;
        });
      }
    } catch (error) {
      console.error('上传视频失败:', error);
      setToast({
        show: true,
        message: '视频上传失败: ' + (error.message || '网络错误，请稍后重试'),
        type: 'error'
      });
    } finally {
      setUploadingVideo(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setFormData((form) => ({
        ...form,
        images: next.join(',')
      }));
      return next;
    });
  };

  const handleRemoveVideo = (index) => {
    setVideoUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setFormData((form) => ({
        ...form,
        videos: next.join(',')
      }));
      return next;
    });
  };

  const validateForm = () => {

    const newErrors = {};

    // 必填字段验证
    if (!formData.title.trim()) {
      newErrors.title = '活动标题不能为空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '活动描述不能为空';
    }

    if (!formData.startTime) {
      newErrors.startTime = '开始时间不能为空';
    }

    if (!formData.endTime) {
      newErrors.endTime = '结束时间不能为空';
    }

    if (formData.startTime && formData.endTime && new Date(formData.startTime) >= new Date(formData.endTime)) {
      newErrors.endTime = '结束时间必须晚于开始时间';
    }

    // 报名时间验证：必须早于活动开始时间，且报名开始早于报名结束
    const hasRegistrationStart = !!formData.registrationStart;
    const hasRegistrationEnd = !!formData.registrationEnd;

    if ((hasRegistrationStart || hasRegistrationEnd) && !formData.startTime) {
      if (hasRegistrationStart) {
        newErrors.registrationStart = '请先设置活动开始时间';
      }
      if (hasRegistrationEnd) {
        newErrors.registrationEnd = '请先设置活动开始时间';
      }
    }

    if (formData.registrationStart && formData.startTime && new Date(formData.registrationStart) >= new Date(formData.startTime)) {
      newErrors.registrationStart = '报名开始时间必须早于活动开始时间';
    }

    if (formData.registrationEnd && formData.startTime && new Date(formData.registrationEnd) >= new Date(formData.startTime)) {
      newErrors.registrationEnd = '报名结束时间必须早于活动开始时间';
    }

    if (formData.registrationStart && formData.registrationEnd && new Date(formData.registrationStart) >= new Date(formData.registrationEnd)) {
      newErrors.registrationEnd = '报名结束时间必须晚于报名开始时间';
    }

    if (!formData.locationName.trim()) {
      newErrors.locationName = '目的地名称不能为空';
    }

    if (!formData.city.trim()) {
      newErrors.city = '所在城市不能为空';
    }

    // 数值验证
    if (formData.maxParticipants < 0) {
      newErrors.maxParticipants = '最大参与人数不能为负数';
    }

    if (formData.minParticipants < 1) {
      newErrors.minParticipants = '最小参与人数不能小于1';
    }

    // 注意：maxParticipants为0表示不限制，不需要验证
    if (formData.maxParticipants > 0 && formData.maxParticipants < formData.minParticipants) {
      newErrors.maxParticipants = '最大参与人数必须大于等于最小参与人数';
    }

    if (formData.ageMin < 0) {
      newErrors.ageMin = '最小年龄不能小于0';
    }

    if (formData.ageMax < 0) {
      newErrors.ageMax = '最大年龄不能小于0';
    }

    if (formData.ageMax < formData.ageMin) {
      newErrors.ageMax = '最大年龄必须大于等于最小年龄';
    }

    if (formData.price < 0) {
      newErrors.price = '价格不能为负数';
    }

    if (formData.originalPrice < 0) {
      newErrors.originalPrice = '原价不能为负数';
    }

    if (formData.durationHours && formData.durationHours < 0) {
      newErrors.durationHours = '活动时长不能为负数';
    }

    setErrors(newErrors);
    
    // 如果有错误，滚动到第一个错误字段
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔵 表单提交开始');
    
    const isValid = validateForm();
    if (!isValid) {
      console.log('❌ 表单验证失败', errors);
      // 显示验证失败提示
      setToast({ 
        show: true, 
        message: '❌ 请检查表单填写是否完整，已标红错误字段', 
        type: 'error' 
      });
      return;
    }

    console.log('✅ 表单验证通过');
    setLoading(true);
    try {
      // 处理日期时间格式和数据类型
      const processedFormData = {
        ...formData,
        startTime: formData.startTime ? formData.startTime + ':00' : null,
        endTime: formData.endTime ? formData.endTime + ':00' : null,
        registrationStart: formData.registrationStart ? formData.registrationStart + ':00' : null,
        registrationEnd: formData.registrationEnd ? formData.registrationEnd + ':00' : null,
        // 确保数值类型正确
        durationHours: formData.durationHours ? Number(formData.durationHours) : null,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        maxParticipants: Number(formData.maxParticipants),
        minParticipants: Number(formData.minParticipants),
        ageMin: Number(formData.ageMin),
        ageMax: Number(formData.ageMax)
      };
      
      // 移除空的可选字段（保留必填字段）
      Object.keys(processedFormData).forEach(key => {
        if (processedFormData[key] === '' || processedFormData[key] === null || processedFormData[key] === 0) {
          // 必填字段不删除：title, description, startTime, endTime, locationName, city
          const optionalFields = [
            'subtitle', 'summary', 'registrationStart', 'registrationEnd', 'durationHours',
            'address', 'province', 'country', 'latitude', 'longitude', 'originalPrice',
            'refundPolicy', 'coverImage', 'images', 'videos', 'contactPhone', 'contactEmail',
            'contactWechat', 'tags', 'requirements', 'equipment', 'notes', 'customFields'
          ];
          if (optionalFields.includes(key)) {
            delete processedFormData[key];
          }
        }
      });
      
      // 创建活动
      console.log('📤 发送创建请求:', processedFormData);
      const response = await createActivity(processedFormData);
      console.log('📥 收到响应:', response);
      
      if (response.code === 200) {
        // 显示成功提示
        setToast({ 
          show: true, 
          message: '🎉 创建活动成功！已提交审核，请等待管理员审核。', 
          type: 'success' 
        });
        
        // 2秒后跳转
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response.data);
          } else if (onBack) {
            onBack();
          }
        }, 2000);
      } else if (response.code === 403) {
        // 未实名认证提示
        setToast({
          show: true,
          message: response.message || '您还未完成实名认证，请先在“我的-实名认证”中完成实名后再发布活动。',
          type: 'error'
        });
      } else {
        setToast({ 
          show: true, 
          message: '❌ 创建失败: ' + (response.message || '未知错误'), 
          type: 'error' 
        });
      }

    } catch (error) {
      console.error('❌ 创建活动失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setToast({ 
        show: true, 
        message: '❌ 创建失败: ' + (error.message || '网络错误，请稍后重试'), 
        type: 'error' 
      });
    } finally {
      console.log('🔵 请求结束，loading设置为false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast通知 */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <span className="text-lg font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-4 text-white hover:text-gray-200"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800 flex-1">创建同城活动 🆕</h1>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="请输入活动标题"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活动副标题</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="请输入活动副标题（可选）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活动摘要</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="请输入活动摘要（可选）"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="请详细描述活动内容、安排等"
                  rows="4"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* 时间安排 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">时间安排</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">报名开始时间</label>
                <input
                  type="datetime-local"
                  name="registrationStart"
                  value={formData.registrationStart}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">报名结束时间</label>
                <input
                  type="datetime-local"
                  name="registrationEnd"
                  value={formData.registrationEnd}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活动时长（小时）</label>
                <input
                  type="number"
                  name="durationHours"
                  value={formData.durationHours}
                  onChange={handleInputChange}
                  placeholder="请输入活动时长"
                  min="0"
                  step="0.5"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.durationHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.durationHours && <p className="text-red-500 text-xs mt-1">{errors.durationHours}</p>}
              </div>
            </div>
          </div>

          {/* 地点信息 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">地点信息 📍</h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {locationLoading ? '定位中...' : '获取位置'}
              </button>
            </div>
            
            {locationStatus && (
              <div className={`mb-4 p-2 rounded-md text-sm ${
                locationStatus.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {locationStatus}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目的地名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleInputChange}
                  placeholder="请输入要去的地方名称，如：西湖、博物馆、公园等"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.locationName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.locationName && <p className="text-red-500 text-xs mt-1">{errors.locationName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所在城市 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="请输入所在城市"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">省份</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="请输入省份"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细地址</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="请输入详细地址（可选）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 显示经纬度信息 */}
              {formData.latitude && formData.longitude && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">当前位置：</span>
                    纬度 {formData.latitude.toFixed(6)}, 经度 {formData.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 参与设置 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">参与设置</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最大参与人数</label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="0表示不限制"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maxParticipants && <p className="text-red-500 text-xs mt-1">{errors.maxParticipants}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最小参与人数</label>
                <input
                  type="number"
                  name="minParticipants"
                  value={formData.minParticipants}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.minParticipants ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.minParticipants && <p className="text-red-500 text-xs mt-1">{errors.minParticipants}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最小年龄</label>
                <input
                  type="number"
                  name="ageMin"
                  value={formData.ageMin}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最大年龄</label>
                <input
                  type="number"
                  name="ageMax"
                  value={formData.ageMax}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoApprove"
                  name="autoApprove"
                  checked={formData.autoApprove}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="autoApprove" className="text-sm text-gray-700">
                  自动通过报名申请
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowWaitlist"
                  name="allowWaitlist"
                  checked={formData.allowWaitlist}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="allowWaitlist" className="text-sm text-gray-700">
                  允许候补报名
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  公开活动
                </label>
              </div>
            </div>
          </div>

          {/* 费用设置 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">费用设置</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">活动价格</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0表示免费"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">原价</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="原价（可选）"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="paymentRequired"
                  name="paymentRequired"
                  checked={formData.paymentRequired}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="paymentRequired" className="text-sm text-gray-700">
                  需要付费
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">退款政策</label>
                <textarea
                  name="refundPolicy"
                  value={formData.refundPolicy}
                  onChange={handleInputChange}
                  placeholder="请输入退款政策（可选）"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 活动媒体 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">活动媒体</h3>

            {/* 封面图片上传 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片（将作为列表和详情页封面）
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                  id="activity-cover-upload"
                />
                <label
                  htmlFor="activity-cover-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  <i className="fa-solid fa-image text-2xl mb-2 block"></i>
                  {uploadingCoverImage ? '封面上传中...' : '选择封面图片'}
                </label>
              </div>
              {(coverImageUrl || formData.coverImage) && (
                <div className="mt-3">
                  <img
                    src={coverImageUrl || formData.coverImage}
                    alt="活动封面预览"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* 图片上传 */}
            <div className="mb-4">

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  活动图片（最多 10 张）
                </label>
                <span className="text-xs text-gray-400">
                  {imageUrls.length}/10
                </span>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="activity-image-upload"
                />
                <label
                  htmlFor="activity-image-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  <i className="fa-solid fa-cloud-upload-alt text-2xl mb-2 block"></i>
                  {uploadingImage ? '图片上传中...' : '选择本地图片'}
                </label>
              </div>
              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`活动图片 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 视频上传 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  活动视频（最多 5 个）
                </label>
                <span className="text-xs text-gray-400">
                  {videoUrls.length}/5
                </span>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="activity-video-upload"
                />
                <label
                  htmlFor="activity-video-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  <i className="fa-solid fa-cloud-upload-alt text-2xl mb-2 block"></i>
                  {uploadingVideo ? '视频上传中...' : '选择本地视频'}
                </label>
              </div>
              {videoUrls.length > 0 && (
                <div className="mt-4 space-y-3">
                  {videoUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <video
                        src={url}
                        controls
                        className="w-full h-40 bg-black rounded-md object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 联系方式 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">

            <h3 className="text-lg font-medium text-gray-800 mb-4">联系方式</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="请输入联系电话"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系邮箱</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="请输入联系邮箱"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">好游号</label>
                <input
                  type="text"
                  name="contactWechat"
                  value={formData.contactWechat}
                  onChange={handleInputChange}
                  placeholder="请输入好游号"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 其他信息 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">其他信息</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="请输入标签，用逗号分隔"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参与要求</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="请输入参与要求"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">装备要求</label>
                <textarea
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  placeholder="请输入装备要求"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">注意事项</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="请输入注意事项"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '创建活动'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              活动创建后需要管理员审核通过才能正式发布
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityCreatePage;

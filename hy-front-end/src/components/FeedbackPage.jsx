import React, { useState } from 'react';
import { submitFeedback } from '../api/config';

const FeedbackPage = ({ onBack }) => {
  const [formData, setFormData] = useState({
    type: '建议',
    score: 0,
    title: '',
    detail: '',
    email: '',
    module: ''
  });
  
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 反馈类型选项
  const types = ['建议', '问题', '体验', '其他'];
  
  // 模块选项
  const modules = [
    '登录与注册',
    '个人中心',
    '发现页面',
    '地图导航',
    '帖子管理',
    '收藏功能',
    '通知系统',
    '其他'
  ];

  // 更新评分
  const handleScoreChange = (value) => {
    setFormData({ ...formData, score: value });
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      type: '建议',
      score: 0,
      title: '',
      detail: '',
      email: '',
      module: ''
    });
    setStatus('');
  };

  // 提交反馈
  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.title.trim() || !formData.detail.trim()) {
      setStatus('请填写标题与详细描述');
      return;
    }

    // 验证长度
    if (formData.title.length > 100) {
      setStatus('标题不能超过100个字符');
      return;
    }

    if (formData.detail.length > 600) {
      setStatus('详细描述不能超过600个字符');
      return;
    }

    setIsSubmitting(true);
    setStatus('');

    try {
      const payload = {
        type: formData.type,
        score: formData.score > 0 ? formData.score : null,
        title: formData.title.trim(),
        detail: formData.detail.trim(),
        email: formData.email.trim() || null,
        module: formData.module || null
      };

      const response = await submitFeedback(payload);

      if (response.code === 200) {
        setStatus('success');
        // 3秒后重置表单
        setTimeout(() => {
          handleReset();
        }, 3000);
      } else {
        setStatus(response.message || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      setStatus('网络错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      {/* 返回按钮 */}
      <div className="max-w-5xl mx-auto mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          返回
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* 左侧：表单区域 */}
          <div className="p-8 lg:p-10">
            {/* 标题 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">用户反馈</h1>
                <span className="text-sm text-gray-500">我们重视每一条建议</span>
              </div>
              <p className="text-sm text-gray-600">请花 1 分钟告诉我们您的感受与建议 🙌</p>
            </div>

            {/* 反馈类型和评分 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* 反馈类型 */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">反馈类型</label>
                <div className="flex flex-wrap gap-2">
                  {types.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.type === type
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 评分 */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">整体评分</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleScoreChange(value)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        formData.score >= value
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      title={`${value} 分`}
                    >
                      <i className={`fa-solid fa-star ${
                        formData.score >= value ? 'text-white' : 'text-blue-500'
                      }`}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 标题 */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="一句话概括您的反馈"
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 详细描述 */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">详细描述</label>
              <textarea
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                placeholder="请尽可能清晰地描述问题或建议，便于我们快速定位与改进"
                maxLength={600}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.detail.length} / 600
              </div>
            </div>

            {/* 邮箱和模块 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* 联系邮箱 */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">联系邮箱（可选）</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 所属模块 */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">所属模块（可选）</label>
                <select
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">未选择</option>
                  {modules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {status && (
                  <span className={`text-sm font-medium ${
                    status === 'success' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {status === 'success' 
                      ? '反馈提交成功！感谢您的建议 🙏' 
                      : status}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  重置
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '提交中...' : '提交反馈'}
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：预览区域 */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 lg:p-10 border-l border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">预览</h3>
              <p className="text-sm text-gray-600">提交前快速核对您的信息</p>
            </div>

            <div className="space-y-4">
              {/* 评分预览 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">当前评分</h4>
                    <p className="text-sm text-gray-600">
                      {formData.score > 0 ? `${formData.score} / 5` : '未评分'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <i
                        key={i}
                        className={`fa-solid fa-star text-sm ${
                          i <= formData.score ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>

              {/* 类型和模块 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">类型</h4>
                    <p className="text-sm text-gray-600">{formData.type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">模块</h4>
                    <p className="text-sm text-gray-600">{formData.module || '未选择'}</p>
                  </div>
                </div>
              </div>

              {/* 标题预览 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-900 mb-1">标题</h4>
                <p className="text-sm text-gray-600 break-words">
                  {formData.title || '-'}
                </p>
              </div>

              {/* 描述预览 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h4 className="text-sm font-medium text-gray-900 mb-1">描述</h4>
                <p className="text-sm text-gray-600 break-words whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {formData.detail || '-'}
                </p>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-info-circle text-blue-500 mt-0.5"></i>
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">温馨提示</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>标题和详细描述为必填项</li>
                    <li>您的反馈将帮助我们改进产品</li>
                    <li>我们会认真对待每一条反馈</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;


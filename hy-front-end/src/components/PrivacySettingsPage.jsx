import React, { useState, useEffect } from 'react';
import { getPrivacySettings, updatePrivacySettings } from '../api/config';

const PrivacySettingsPage = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allowStrangerViewDynamic, setAllowStrangerViewDynamic] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getPrivacySettings();
        if (response && response.code === 200 && response.data) {
          const value = response.data.allowStrangerViewDynamic;
          setAllowStrangerViewDynamic(typeof value === 'boolean' ? value : true);
        } else {
          setError(response?.message || '加载隐私设置失败');
        }
      } catch (err) {
        console.error('加载隐私设置失败:', err);
        setError(err.message || '加载隐私设置失败');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const response = await updatePrivacySettings(allowStrangerViewDynamic);
      if (response && response.code === 200) {
        alert(response.message || response.data || '隐私设置更新成功');
      } else {
        const msg = response?.message || '保存隐私设置失败';
        setError(msg);
        alert(msg);
      }
    } catch (err) {
      console.error('保存隐私设置失败:', err);
      const msg = err.message || '保存隐私设置失败';
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm px-4 py-4 flex items-center">
        <button
          className="mr-3 text-gray-600 hover:text-gray-800"
          onClick={onBack}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">隐私设置</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="text-base font-medium text-gray-900 mb-2">动态隐私</h2>
          <p className="text-sm text-gray-500 mb-4">
            控制是否允许陌生人在话题中查看你参与的活动和发布的帖子。
          </p>

          {loading ? (
            <div className="text-center text-gray-500 text-sm mt-4">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              正在加载隐私设置...
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setAllowStrangerViewDynamic(true)}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-base transition-colors ${
                  allowStrangerViewDynamic
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                <span>
                  <span className="font-medium mr-1">对陌生人展示动态</span>
                  <span className="text-sm text-gray-500">允许陌生人查看你的帖子和活动</span>
                </span>
                {allowStrangerViewDynamic && (
                  <i className="fa-solid fa-check text-blue-500"></i>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAllowStrangerViewDynamic(false)}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-base transition-colors ${
                  !allowStrangerViewDynamic
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                <span>
                  <span className="font-medium mr-1">不向陌生人展示动态</span>
                  <span className="text-sm text-gray-500">陌生人在话题中无法看到你的动态</span>
                </span>
                {!allowStrangerViewDynamic && (
                  <i className="fa-solid fa-check text-blue-500"></i>
                )}
              </button>
            </div>
          )}

          {error && !loading && (
            <div className="mt-4 text-sm text-red-500 text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full py-3 rounded-lg bg-blue-500 text-white text-base font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              正在保存...
            </>
          ) : (
            '保存设置'
          )}
        </button>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;

import React, { useState } from 'react';
import { verifyRealName } from '../api/config';

const RealNameVerificationPage = ({ onBack }) => {
  const [realName, setRealName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmedName = realName.trim();
    const trimmedIdCard = idCard.trim();

    if (!trimmedName) {
      alert('姓名不能为空');
      return;
    }
    if (!trimmedIdCard) {
      alert('身份证号不能为空');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await verifyRealName(trimmedName, trimmedIdCard);
      setResult(response.data || response.result || response);
      if (response.code === 200) {
        if (response.data && response.data.match === false) {
          alert(response.message || '身份证信息不匹配');
        } else {
          alert('实名认证成功');
        }
      } else {
        alert(response.message || '实名认证失败');
      }
    } catch (e) {
      console.error('实名认证失败:', e);
      const msg = e.message || '实名认证失败，请稍后重试';
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
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
        <h1 className="text-xl font-semibold text-gray-900">实名认证</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="text-base font-medium text-gray-900 mb-2">身份信息</h2>
          <p className="text-sm text-gray-500 mb-4">
            请填写本人真实姓名和身份证号码，用于实名认证。平台仅用于调用权威接口校验，不会对外泄露。
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">真实姓名</label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入您的姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身份证号</label>
              <input
                type="text"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入18位身份证号码"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}

            {result && (
              <div className="mt-2 text-sm text-gray-600">
                <div>匹配结果：{result.match ? '通过' : '不匹配'}</div>
                {result.orderId && (
                  <div>订单号：{result.orderId}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-top border-gray-100">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-blue-500 text-white text-base font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              正在实名认证...
            </>
          ) : (
            '立即认证'
          )}
        </button>
      </div>
    </div>
  );
};

export default RealNameVerificationPage;

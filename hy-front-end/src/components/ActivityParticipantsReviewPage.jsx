import React, { useState, useEffect } from 'react';
import { getPendingParticipants, approveParticipant } from '../api/config';

const ActivityParticipantsReviewPage = ({ onBack }) => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPending = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPendingParticipants();
      if (response.code === 200) {
        const data = response.data || [];
        setPendingList(Array.isArray(data) ? data : []);
      } else {
        setError(response.message || '获取待审核报名失败');
        setPendingList([]);
      }
    } catch (err) {
      console.error('获取待审核报名失败:', err);
      setError(err.message || '获取待审核报名失败');
      setPendingList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (participantId, approve) => {
    try {
      const response = await approveParticipant(participantId, approve);
      if (response.code === 200) {
        alert(approve ? '已通过该报名' : '已拒绝该报名');
        loadPending();
      } else {
        alert('操作失败: ' + response.message);
      }
    } catch (err) {
      console.error('操作失败:', err);
      alert('操作失败: ' + err.message);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800 flex-1">活动报名审核</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center text-sm text-gray-500">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            <span>加载中...</span>
          </div>
        )}

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        {!loading && pendingList.length === 0 && !error && (
          <div className="text-center py-12">
            <i className="fa-solid fa-user-check text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 mb-2">暂无待审核的报名</p>
            <p className="text-sm text-gray-400">当有用户报名你的活动且需要审核时，会出现在这里</p>
          </div>
        )}

        {pendingList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-1">
                  {item.activityTitle || '未命名活动'}
                </h2>
                <p className="text-xs text-gray-500">
                  活动时间：{formatDateTime(item.activityStartTime)} - {formatDateTime(item.activityEndTime)}
                </p>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                待审核
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">报名用户：</span>
                <span>{item.username || item.phone || '未知用户'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">报名时间：</span>
                <span>{formatDateTime(item.registrationTime)}</span>
              </div>
              {item.emergencyContact && (
                <div className="flex justify-between">
                  <span className="text-gray-500">紧急联系人：</span>
                  <span>{item.emergencyContact}</span>
                </div>
              )}
              {item.emergencyPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">紧急电话：</span>
                  <span>{item.emergencyPhone}</span>
                </div>
              )}
              {item.notes && (
                <div>
                  <span className="text-gray-500 block mb-1">备注：</span>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleApprove(item.id, true)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                通过
              </button>
              <button
                onClick={() => handleApprove(item.id, false)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                拒绝
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityParticipantsReviewPage;

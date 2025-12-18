import React, { useState, useEffect } from 'react';
import { getAdminReportedUsers, getAdminUserReports } from '../api/config';

const AdminReportedUsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getAdminReportedUsers();
        if (response && response.code === 200) {
          setUsers(response.data || []);
        } else {
          setError(response?.message || '加载被举报用户列表失败');
        }
      } catch (err) {
        console.error('获取被举报用户列表失败:', err);
        if (err.status === 401) {
          setError('未登录或登录已失效，请重新登录管理员账号');
        } else if (err.status === 403) {
          setError('权限不足，需要管理员权限');
        } else {
          setError(err.message || '加载被举报用户列表失败');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailData, setDetailData] = useState(null);

  const handleViewDetails = async (userId) => {
    if (!userId) return;
    setDetailVisible(true);
    setDetailLoading(true);
    setDetailError('');
    setDetailData(null);
    try {
      const response = await getAdminUserReports(userId);
      if (response && response.code === 200) {
        setDetailData(response.data || null);
      } else {
        setDetailError(response?.message || '加载举报详情失败');
      }
    } catch (err) {
      if (err.status === 401) {
        setDetailError('未登录或登录已失效，请重新登录管理员账号');
      } else if (err.status === 403) {
        setDetailError('权限不足，需要管理员权限');
      } else if (err.status === 404) {
        setDetailError('被举报用户不存在');
      } else {
        setDetailError(err.message || '加载举报详情失败');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '待处理', className: 'bg-yellow-100 text-yellow-800' },
      processing: { text: '处理中', className: 'bg-blue-100 text-blue-800' },
      resolved: { text: '已解决', className: 'bg-green-100 text-green-800' },
      rejected: { text: '已驳回', className: 'bg-red-100 text-red-800' }
    };
    const config = statusMap[status] || { text: status || '未知', className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${config.className}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">用户举报管理</h1>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">被举报用户列表</h2>
              <p className="text-sm text-gray-500 mt-1">
                按待处理举报数和最近举报时间排序，方便优先处理问题严重的用户。
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <i className="fa-solid fa-spinner fa-spin mr-2" />
              正在加载被举报用户...
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-center text-red-500">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-500">
              暂无被举报的用户。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      手机号
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总举报次数
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      待处理举报数
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最近举报时间
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.userId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.username || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {user.totalReports}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.pendingReports > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.pendingReports}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateTime(user.lastReportTime)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center space-x-2">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50"
                          onClick={() => handleViewDetails(user.userId)}
                        >
                          查看举报详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {detailVisible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">举报详情</h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setDetailVisible(false)}
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <i className="fa-solid fa-spinner fa-spin mr-2" />
                  正在加载举报详情...
                </div>
              ) : detailError ? (
                <div className="text-center text-red-500 py-4">{detailError}</div>
              ) : !detailData ? (
                <div className="text-center text-gray-500 py-4">暂无举报数据</div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <div className="font-medium mb-1">被举报用户信息</div>
                    <div>用户ID：{detailData.user?.userId}</div>
                    <div>用户名：{detailData.user?.username || '-'}</div>
                    <div>手机号：{detailData.user?.phone || '-'}</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-800">举报记录</h4>
                      <span className="text-xs text-gray-500">
                        共 {Array.isArray(detailData.reports) ? detailData.reports.length : 0} 条
                      </span>
                    </div>

                    {!detailData.reports || detailData.reports.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">暂无举报记录</div>
                    ) : (
                      <div className="space-y-3">
                        {detailData.reports.map((report) => (
                          <div
                            key={report.id}
                            className="border border-gray-200 rounded-lg p-3 text-sm text-gray-700"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium">
                                举报类型：{report.reportType || '-'}
                              </div>
                              {renderStatusBadge(report.status)}
                            </div>

                            <div className="text-xs text-gray-500 mb-2">
                              举报时间：{formatDateTime(report.createdTime)}
                            </div>

                            <div className="mb-1">
                              <span className="font-medium">举报人ID：</span>
                              <span>{report.reporterId || '-'}</span>
                            </div>

                            <div className="mb-1">
                              <span className="font-medium">举报理由：</span>
                              <span className="whitespace-pre-wrap">{report.reportReason || '-'}</span>
                            </div>

                            <div className="mb-1">
                              <span className="font-medium">举报证据(JSON)：</span>
                              <span className="break-all text-xs text-gray-600">
                                {report.reportEvidence || '[]'}
                              </span>
                            </div>

                            <div className="mt-2 border-t border-dashed border-gray-200 pt-2 space-y-1 text-xs text-gray-600">
                              <div>
                                <span className="font-medium">处理管理员ID：</span>
                                <span>{report.handlerId || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium">处理结果：</span>
                                <span className="whitespace-pre-wrap">{report.handleResult || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium">处理时间：</span>
                                <span>{formatDateTime(report.handleTime)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportedUsersPage;

import React, { useEffect, useState, useRef } from 'react';
import { getUserProfile, updateUserProfile, getAvatarBase64, uploadAvatar } from '../api/config';

const ProfileEditPage = ({ onBack }) => {
  const [form, setForm] = useState({ username: '', gender: '' });
  const [avatarImage, setAvatarImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, avatarRes] = await Promise.all([
          getUserProfile(),
          getAvatarBase64()
        ]);
        if (profileRes?.code === 200 && profileRes.data) {
          const data = profileRes.data;
          setForm({
            username: data.username || '',
            gender: data.gender || 'other'
          });
        }
        if (avatarRes?.code === 200 && avatarRes.data?.avatar) {
          setAvatarImage(avatarRes.data.avatar);
        }
      } catch (e) {
        console.warn('加载资料失败:', e.message);
      }
    };
    init();
  }, []);

  const handleUploadClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      if (res?.code === 200) {
        const avatarRes = await getAvatarBase64();
        if (avatarRes?.code === 200 && avatarRes.data?.avatar) {
          setAvatarImage(avatarRes.data.avatar);
        }
        alert('头像已更新');
      } else {
        alert('头像上传失败');
      }
    } catch (err) {
      alert('头像上传失败: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ username: form.username, gender: form.gender });
      alert('资料已保存');
      onBack?.();
    } catch (e) {
      alert('保存失败: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="text-gray-600" onClick={onBack}><i className="fa-solid fa-arrow-left"></i></button>
          <h1 className="text-base font-semibold">编辑资料</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatarImage ? (
                  <img src={avatarImage} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-regular fa-user text-3xl text-gray-400"></i>
                )}
              </div>
              <button onClick={handleUploadClick} className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 shadow">
                {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">点击相机图标更新头像</div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">昵称</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="请输入昵称"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">性别</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">保密</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl shadow disabled:opacity-60"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
};

export default ProfileEditPage;

import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 检测是否为iOS设备
    const checkIsIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    };

    // 检测是否已安装
    const checkIsInstalled = () => {
      return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone ||
             document.referrer.includes('android-app://');
    };

    setIsIOS(checkIsIOS());
    setIsInstalled(checkIsInstalled());

    // 监听PWA安装事件
    const handleBeforeInstallPrompt = (e) => {
      console.log('🚀 PWA: beforeinstallprompt 事件触发');
      e.preventDefault();
      setDeferredPrompt(e);

      // Android/其他设备：根据上次关闭时间控制再次提示间隔
      const dismissedTimeStr = localStorage.getItem('pwa_install_dismissed');
      let canShowPrompt = true;

      if (dismissedTimeStr) {
        const dismissedTime = parseInt(dismissedTimeStr, 10);
        if (!Number.isNaN(dismissedTime)) {
          const secondsSinceDismissed = (Date.now() - dismissedTime) / 1000;
          // 测试阶段：10 秒后可再次提示（后续你可以改回 7 天）
          if (secondsSinceDismissed < 10) {
            canShowPrompt = false;
          }
        }
      }

      // 显示安装提示（可以根据用户行为决定何时显示）
      if (!checkIsInstalled() && canShowPrompt) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // 3秒后显示安装提示
      }
    };


    const handleAppInstalled = () => {
      console.log('✅ PWA: 应用已安装');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // 添加事件监听器
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 检查Service Worker注册状态
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker 注册成功:', registration.scope);
        })
        .catch((error) => {
          console.error('❌ Service Worker 注册失败:', error);
        });
    }

    // 清理事件监听器
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 处理安装应用
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      // 显示安装对话框
      deferredPrompt.prompt();
      
      // 等待用户选择
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ 用户接受了安装提示');
      } else {
        console.log('❌ 用户拒绝了安装提示');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('❌ 安装失败:', error);
    }
  };

  // 关闭安装提示（Android/其他设备）
  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // 记录用户关闭时间，方便控制再次提示的时间间隔
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };


  // 显示iOS安装说明
  const handleShowIOSInstructions = () => {
    setShowIOSInstructions(true);
  };

  // 检查是否应该显示iOS提示
  const shouldShowIOSPrompt = () => {
    if (!isIOS || isInstalled) return false;
    
    const dismissedTime = localStorage.getItem('ios_install_dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      return daysSinceDismissed > 7; // 7天后再次显示
    }
    
    return true;
  };

  // 如果已安装，显示安装成功提示（仅在非 iOS 设备上显示，避免 iOS 端一直提示）
  if (isInstalled && !isIOS) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
        <i className="fa-solid fa-check-circle"></i>
        <span className="text-sm">应用已安装到桌面</span>
      </div>
    );
  }


  // iOS设备安装说明弹窗
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
        <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
          <div className="text-center mb-4">
            <i className="fa-brands fa-apple text-4xl text-gray-800 mb-2"></i>
            <h3 className="text-lg font-bold text-gray-800">安装应用到桌面</h3>
            <p className="text-sm text-gray-600">添加到主屏幕，像原生应用一样使用</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-GuText">点击浏览器底部的分享按钮</p>
                <div className="flex items-center mt-1">
                  <i className="fa-solid fa-share text-GuText mr-1"></i>
                  <span className="text-xs text-GuText">Safari浏览器分享图标</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-[#A8B78C] rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">选择"添加到主屏幕"</p>
                <div className="flex items-center mt-1">
                  <i className="fa-solid fa-plus-square text-[#A8B78C] mr-1"></i>
                  <span className="text-xs text-GuText">添加到主屏幕选项</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-[#e0c6c4] rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-GuText">点击"添加"完成安装</p>
                <div className="flex items-center mt-1">
                  <i className="fa-solid fa-mobile-screen text-[#e0c6c4] mr-1"></i>
                  <span className="text-xs text-GuText">应用将出现在桌面上</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowIOSInstructions(false);
                localStorage.setItem('ios_install_dismissed', Date.now().toString());
              }}
              className="flex-1 py-3 px-4 bg-gray-200 text-GuTrext rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              稍后再说
            </button>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="flex-1 py-3 px-4 bg-[#d5a495] text-white rounded-xl font-medium hover:bg-[#d5a495] transition-colors"
            >
              知道了
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/其他设备的安装提示
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 mx-auto max-w-sm animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-[#d5a495] rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-download text-white text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-GuText text-sm mb-1">安装应用到桌面</h3>
            <p className="text-xs text-GuText mb-3">获得更好的使用体验，支持离线访问</p>
            <div className="flex space-x-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 px-3 bg-gray-100 text-GuText rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                稍后
              </button>
              <button
                onClick={handleInstallApp}
                className="flex-1 py-2 px-3 bg-[#a8b78c] text-white rounded-lg text-xs font-medium hover:bg-[#a8b78c] transition-colors"
              >
                安装
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fa-solid fa-times text-sm"></i>
          </button>
        </div>
      </div>
    );
  }

  // iOS设备显示安装提示
  if (isIOS && shouldShowIOSPrompt() && !showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 mx-auto max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-[#d5a495] rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fa-brands fa-apple text-white text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-GuTextGuText text-sm mb-1">添加到主屏幕</h3>
            <p className="text-xs text-GuText mb-3">点击分享按钮，然后选择"添加到主屏幕"</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  localStorage.setItem('ios_install_dismissed', Date.now().toString());
                  // 关闭当前提示，等待下次满足时间间隔后再次出现
                  // （当前仍为 7 天逻辑，如需调试成 10 秒，可在 shouldShowIOSPrompt 中调整）
                }}
                className="flex-1 py-2 px-3 bg-gray-100 text-GuText rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                稍后
              </button>

              <button
                onClick={handleShowIOSInstructions}
                className="flex-1 py-2 px-3 bg-[#a8b78c] text-white rounded-lg text-xs font-medium hover:bg-[#a8b78c] transition-colors"
              >
                查看教程
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallPrompt;


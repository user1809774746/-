// Service Worker - PWA离线支持
const CACHE_NAME = 'travel-planner-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // 添加你的主要资源文件
];

// 安装Service Worker
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker: 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Service Worker: 缓存资源');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.error('❌ Service Worker: 缓存失败', error);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', function(event) {
  console.log('✅ Service Worker: 激活');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // 删除旧版本的缓存
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: 删除旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', function(event) {
  // 只处理GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 如果缓存中有资源，直接返回
        if (response) {
          return response;
        }

        // 否则从网络获取
        return fetch(event.request).then(function(response) {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应，因为响应流只能使用一次
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function() {
          // 网络请求失败时的后备方案
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// 处理后台同步
self.addEventListener('sync', function(event) {
  console.log('🔄 Service Worker: 后台同步', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 在这里处理后台同步逻辑
      console.log('执行后台同步任务')
    );
  }
});

// 处理推送通知
self.addEventListener('push', function(event) {
  console.log('🔔 Service Worker: 收到推送消息');
  
  const options = {
    body: '您有新的旅行推荐！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('旅行规划助手', options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', function(event) {
  console.log('🖱️ Service Worker: 通知被点击', event.notification.tag);
  
  event.notification.close();

  if (event.action === 'explore') {
    // 打开应用到特定页面
    event.waitUntil(
      clients.openWindow('/?from=notification')
    );
  } else if (event.action === 'close') {
    // 关闭通知
    console.log('用户关闭了通知');
  } else {
    // 默认行为：打开应用
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});


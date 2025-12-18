import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // 允许局域网访问
    strictPort: false,
    open: false,
    // HTTPS 配置 (如果证书文件存在则启用)
    https: (() => {
      const keyPath = path.resolve(__dirname, './certs/example.com+1-key.pem');
      const certPath = path.resolve(__dirname, './certs/example.com+1.pem');
      
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        };
      }
      
      console.log('⚠️  证书文件未找到，使用HTTP模式启动');
      return false;
    })(),
    // 配置代理解决跨域问题（仅开发环境使用）
    proxy: {
      '/api': {





        target: 'http://192.168.1.101:8082',// 后端API服务器地址




        
        changeOrigin: true,
        secure: false, // 使用HTTP时设为false
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🚨 代理连接错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 代理请求:', req.method, req.url, '→', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 代理响应:', req.url, '←', proxyRes.statusCode);
          });
        }
      },
      '/images': {




        target: 'http://192.168.1.101:8082', // 代理图片资源到后端服务器


        changeOrigin: true,
        secure: false
      },
      '/ws': {



        target: 'http://192.168.1.101:8082', // WebSocket 代理目标（HTTP对应ws://，HTTPS对应wss://）

        ws: true, // 启用 WebSocket 代理
        changeOrigin: true,
        secure: false, // 允许代理到非 HTTPS 后端
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🚨 WebSocket代理错误:', err);
          });
          proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
            console.log('🔄 WebSocket代理请求:', req.url);
          });
          proxy.on('open', (proxySocket) => {
            console.log('✅ WebSocket代理连接已建立');
          });
          proxy.on('close', (res, socket, head) => {
            console.log('🔌 WebSocket代理连接已关闭');
          });
        }
      },
      '/socket': {
        target: 'wss://www.amapmcpserver.xyz', // WebSocket 代理目标（必须使用 http:// 协议）
        changeOrigin: true,
        rewrite: path => path.replace(/^\/socket/, ''), // 移除 '/api' 前缀
        ws: true // 启用 WebSocket
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0' // 允许局域网访问预览服务器
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境不生成sourcemap
    minify: 'esbuild', // 使用esbuild压缩（更快）
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'leaflet': ['leaflet', 'react-leaflet']
        }
      }
    }
  }
})

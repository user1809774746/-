/**
 * 后端服务诊断脚本
 * 用于检测后端服务配置和连接状态
 */

const http = require('http');
const https = require('https');

console.log('🔍 开始诊断后端服务...\n');

// 配置
const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 8082;
const TEST_ENDPOINTS = [
  '/api/auth/profile',
  '/ws/chat/native?userId=1',
  '/',
  '/api/health' // 可能的健康检查端点
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. 检查端口连通性
function checkPortConnection() {
  return new Promise((resolve) => {
    log(`\n📡 1. 检查端口连通性`, 'cyan');
    log(`   尝试连接: ${BACKEND_HOST}:${BACKEND_PORT}`, 'blue');
    
    const socket = require('net').createConnection({
      host: BACKEND_HOST,
      port: BACKEND_PORT,
      timeout: 3000
    });

    socket.on('connect', () => {
      log(`   ✅ 端口 ${BACKEND_PORT} 可访问`, 'green');
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      log(`   ❌ 连接超时`, 'red');
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err) => {
      log(`   ❌ 连接失败: ${err.message}`, 'red');
      log(`   💡 建议: 检查后端服务是否在端口 ${BACKEND_PORT} 运行`, 'yellow');
      resolve(false);
    });
  });
}

// 2. 测试HTTP端点
function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: path,
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'Backend-Diagnostic-Tool',
        'Accept': '*/*'
      }
    };

    log(`\n   测试端点: ${path}`, 'blue');

    const req = http.request(options, (res) => {
      log(`   状态码: ${res.statusCode}`, res.statusCode === 200 ? 'green' : 'yellow');
      log(`   响应头:`, 'blue');
      
      // 检查CORS头
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      };

      let hasCors = false;
      for (const [key, value] of Object.entries(corsHeaders)) {
        if (value) {
          log(`      ${key}: ${value}`, 'green');
          hasCors = true;
        }
      }

      if (!hasCors) {
        log(`      ⚠️  未检测到CORS响应头`, 'yellow');
      }

      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          hasCors,
          headers: res.headers,
          bodyLength: body.length
        });
      });
    });

    req.on('timeout', () => {
      log(`   ❌ 请求超时`, 'red');
      req.destroy();
      resolve({ path, status: 'timeout', hasCors: false });
    });

    req.on('error', (err) => {
      log(`   ❌ 请求失败: ${err.message}`, 'red');
      resolve({ path, status: 'error', hasCors: false, error: err.message });
    });

    req.end();
  });
}

// 3. 测试OPTIONS请求（CORS预检）
function testCorsPreFlight(path) {
  return new Promise((resolve) => {
    log(`\n   测试CORS预检: ${path}`, 'blue');

    const options = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: path,
      method: 'OPTIONS',
      timeout: 5000,
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'content-type'
      }
    };

    const req = http.request(options, (res) => {
      log(`   OPTIONS状态码: ${res.statusCode}`, res.statusCode === 200 || res.statusCode === 204 ? 'green' : 'red');
      
      const allowOrigin = res.headers['access-control-allow-origin'];
      const allowMethods = res.headers['access-control-allow-methods'];
      
      if (allowOrigin) {
        log(`   ✅ CORS配置正常`, 'green');
        log(`      Allow-Origin: ${allowOrigin}`, 'green');
        if (allowMethods) {
          log(`      Allow-Methods: ${allowMethods}`, 'green');
        }
      } else {
        log(`   ❌ 后端未配置CORS`, 'red');
      }

      resolve({
        corsConfigured: !!allowOrigin,
        statusCode: res.statusCode
      });
    });

    req.on('error', (err) => {
      log(`   ❌ CORS预检失败: ${err.message}`, 'red');
      resolve({ corsConfigured: false, error: err.message });
    });

    req.end();
  });
}

// 主诊断流程
async function runDiagnostics() {
  try {
    // 步骤1: 检查端口
    const portAvailable = await checkPortConnection();
    
    if (!portAvailable) {
      log('\n❌ 诊断中止: 无法连接到后端服务', 'red');
      log('\n💡 请检查:', 'yellow');
      log('   1. 后端服务是否启动', 'yellow');
      log('   2. 端口号是否正确 (当前: 8082)', 'yellow');
      log('   3. 防火墙是否阻止连接', 'yellow');
      return;
    }

    // 步骤2: 测试HTTP端点
    log(`\n\n📋 2. 测试HTTP端点`, 'cyan');
    const results = [];
    for (const endpoint of TEST_ENDPOINTS) {
      const result = await testEndpoint(endpoint);
      results.push(result);
    }

    // 步骤3: 测试CORS预检
    log(`\n\n🔒 3. 测试CORS配置`, 'cyan');
    const corsResult = await testCorsPreFlight('/api/auth/profile');

    // 生成诊断报告
    log('\n\n📊 诊断报告', 'cyan');
    log('='.repeat(50), 'cyan');

    // 分析结果
    const hasWorkingEndpoint = results.some(r => r.status === 200);
    const has403Error = results.some(r => r.status === 403);
    const hasCorsIssue = !corsResult.corsConfigured;

    if (has403Error && hasCorsIssue) {
      log('\n⚠️  主要问题: CORS配置缺失', 'yellow');
      log('\n🔧 解决方案:', 'cyan');
      log('   1. 在后端添加CORS配置（推荐）', 'green');
      log('   2. 或确保通过Vite代理访问（开发环境）', 'green');
      log('\n📝 参考: CORS_TROUBLESHOOTING_GUIDE.md', 'blue');
    } else if (has403Error) {
      log('\n⚠️  主要问题: 403权限错误', 'yellow');
      log('\n💡 可能原因:', 'cyan');
      log('   - 需要身份认证的端点未提供token', 'yellow');
      log('   - 后端权限控制配置', 'yellow');
    }

    // 测试结果汇总
    log('\n📈 端点测试结果:', 'cyan');
    results.forEach(r => {
      const statusColor = r.status === 200 ? 'green' : 
                         r.status === 403 ? 'yellow' : 'red';
      const corsStatus = r.hasCors ? '✅' : '❌';
      log(`   ${r.path}`, 'blue');
      log(`      状态: ${r.status} | CORS: ${corsStatus}`, statusColor);
    });

    // WebSocket建议
    log('\n🔌 WebSocket连接建议:', 'cyan');
    if (hasCorsIssue) {
      log('   ⚠️  CORS问题可能影响WebSocket升级', 'yellow');
      log('   💡 建议先解决CORS配置问题', 'yellow');
    } else {
      log('   ✅ HTTP连接正常，可以测试WebSocket', 'green');
      log('   💡 WebSocket URL: ws://localhost:8082/ws/chat/native?userId=1', 'blue');
    }

    // 下一步建议
    log('\n🎯 建议的下一步操作:', 'cyan');
    if (hasCorsIssue) {
      log('   1. ✅ 使用Vite开发服务器的代理功能', 'green');
      log('      - 确保从 http://localhost:3000 访问前端', 'blue');
      log('      - API请求会自动代理到后端', 'blue');
      log('   2. 📝 或在后端添加CORS配置（用于生产环境）', 'yellow');
    } else {
      log('   ✅ 后端配置正常', 'green');
      log('   💡 可以继续测试WebSocket连接', 'blue');
    }

  } catch (error) {
    log(`\n❌ 诊断过程出错: ${error.message}`, 'red');
    console.error(error);
  }
}

// 运行诊断
log('='.repeat(50), 'cyan');
log('   后端服务诊断工具', 'cyan');
log('='.repeat(50), 'cyan');

runDiagnostics().then(() => {
  log('\n✨ 诊断完成\n', 'green');
});

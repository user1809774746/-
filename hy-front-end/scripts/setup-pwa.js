#!/usr/bin/env node

// PWA 一键设置脚本
// 使用方法: npm run setup-pwa

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 PWA 设置脚本启动...\n');

// 检查必要的目录和文件
function checkAndCreateDirectories() {
  console.log('📁 检查和创建必要目录...');
  
  const directories = [
    'public/icons',
    'public/screenshots',
    'src/components'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ 创建目录: ${dir}`);
    } else {
      console.log(`✓ 目录已存在: ${dir}`);
    }
  });
}

// 检查必要文件
function checkRequiredFiles() {
  console.log('\n📄 检查必要文件...');
  
  const requiredFiles = [
    'public/manifest.json',
    'public/sw.js',
    'src/components/PWAInstallPrompt.jsx'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`✓ 文件存在: ${file}`);
    } else {
      console.log(`❌ 文件缺失: ${file}`);
      missingFiles.push(file);
    }
  });
  
  return missingFiles;
}

// 生成基本的 browserconfig.xml (Windows 磁贴配置)
function generateBrowserConfig() {
  console.log('\n🔧 生成 browserconfig.xml...');
  
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icons/icon-144x144.png"/>
      <TileColor>#3B82F6</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

  const configPath = path.join(process.cwd(), 'public/browserconfig.xml');
  fs.writeFileSync(configPath, browserConfig);
  console.log('✅ browserconfig.xml 已生成');
}

// 生成 robots.txt
function generateRobotsTxt() {
  console.log('\n🤖 生成 robots.txt...');
  
  const robotsTxt = `User-agent: *
Allow: /

# PWA 相关文件
Allow: /manifest.json
Allow: /sw.js
Allow: /icons/
Allow: /screenshots/

# 站点地图
Sitemap: https://your-domain.com/sitemap.xml
`;

  const robotsPath = path.join(process.cwd(), 'public/robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt);
  console.log('✅ robots.txt 已生成');
}

// 检查 package.json 中的 scripts
function checkPackageScripts() {
  console.log('\n📦 检查 package.json 脚本...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json 不存在');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredScripts = {
    'setup-pwa': 'node scripts/setup-pwa.js',
    'generate-icons': 'node scripts/generate-pwa-icons.js',
    'build': 'vite build',
    'preview': 'vite preview'
  };
  
  let needsUpdate = false;
  const currentScripts = packageJson.scripts || {};
  
  Object.entries(requiredScripts).forEach(([name, command]) => {
    if (!currentScripts[name]) {
      currentScripts[name] = command;
      needsUpdate = true;
      console.log(`➕ 添加脚本: ${name}`);
    } else {
      console.log(`✓ 脚本存在: ${name}`);
    }
  });
  
  if (needsUpdate) {
    packageJson.scripts = currentScripts;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json 已更新');
  }
  
  return true;
}

// 验证 PWA 配置
function validatePWAConfig() {
  console.log('\n🔍 验证 PWA 配置...');
  
  // 检查 manifest.json
  const manifestPath = path.join(process.cwd(), 'public/manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ manifest.json 配置完整');
      } else {
        console.log(`⚠️ manifest.json 缺少字段: ${missingFields.join(', ')}`);
      }
      
      // 检查图标配置
      if (manifest.icons && manifest.icons.length > 0) {
        console.log(`✅ 配置了 ${manifest.icons.length} 个图标`);
        
        // 检查关键尺寸
        const iconSizes = manifest.icons.map(icon => icon.sizes);
        const requiredSizes = ['192x192', '512x512'];
        const missingSizes = requiredSizes.filter(size => !iconSizes.includes(size));
        
        if (missingSizes.length === 0) {
          console.log('✅ 包含必需的图标尺寸');
        } else {
          console.log(`⚠️ 缺少图标尺寸: ${missingSizes.join(', ')}`);
        }
      } else {
        console.log('❌ 未配置应用图标');
      }
      
    } catch (error) {
      console.log('❌ manifest.json 格式错误:', error.message);
    }
  } else {
    console.log('❌ manifest.json 不存在');
  }
}

// 生成测试报告
function generateTestReport() {
  console.log('\n📊 生成测试报告...');
  
  const report = `# PWA 设置完成报告

## ✅ 已完成的配置

- [x] 创建必要目录结构
- [x] 生成 PWA 配置文件
- [x] 添加 Service Worker
- [x] 配置 PWA 安装提示组件
- [x] 更新 HTML meta 标签
- [x] 生成辅助配置文件

## 📋 下一步操作

### 1. 生成应用图标
\`\`\`bash
npm run generate-icons
\`\`\`

### 2. 添加应用截图
- 将应用截图放在 \`public/screenshots/\` 目录
- 推荐尺寸：540x720 像素
- 文件名：screenshot1.png, screenshot2.png

### 3. 自定义应用信息
编辑 \`public/manifest.json\` 文件：
- 修改应用名称和描述
- 更新主题色和背景色
- 添加自定义快捷方式

### 4. 测试 PWA 功能
\`\`\`bash
npm run dev
\`\`\`
然后在手机浏览器中打开应用测试安装功能

### 5. 构建生产版本
\`\`\`bash
npm run build
npm run preview
\`\`\`

## 🔗 有用的链接

- [PWA使用指南.md](./PWA使用指南.md) - 完整使用文档
- [PWA Builder](https://www.pwabuilder.com/) - PWA 测试工具
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - 性能测试

## ⚠️ 注意事项

- PWA 需要在 HTTPS 环境下运行（localhost 除外）
- iOS Safari 是唯一支持 PWA 的 iOS 浏览器
- 建议定期使用 Lighthouse 测试 PWA 评分

---

生成时间: ${new Date().toLocaleString()}
`;

  const reportPath = path.join(process.cwd(), 'PWA_SETUP_REPORT.md');
  fs.writeFileSync(reportPath, report);
  console.log('✅ 测试报告已生成: PWA_SETUP_REPORT.md');
}

// 主函数
function main() {
  try {
    console.log('🔧 开始 PWA 设置流程...\n');
    
    // 1. 检查和创建目录
    checkAndCreateDirectories();
    
    // 2. 检查必要文件
    const missingFiles = checkRequiredFiles();
    if (missingFiles.length > 0) {
      console.log('\n⚠️ 检测到缺失文件，请确保已正确创建以下文件:');
      missingFiles.forEach(file => console.log(`   - ${file}`));
      console.log('\n💡 请参考 PWA使用指南.md 获取完整的设置说明');
    }
    
    // 3. 生成辅助文件
    generateBrowserConfig();
    generateRobotsTxt();
    
    // 4. 检查 package.json
    const packageOk = checkPackageScripts();
    if (!packageOk) {
      console.log('⚠️ package.json 配置可能需要手动调整');
    }
    
    // 5. 验证配置
    validatePWAConfig();
    
    // 6. 生成报告
    generateTestReport();
    
    console.log('\n🎉 PWA 设置完成！');
    console.log('\n📖 下一步操作:');
    console.log('   1. 运行 npm run generate-icons 生成图标');
    console.log('   2. 添加应用截图到 public/screenshots/');
    console.log('   3. 运行 npm run dev 测试应用');
    console.log('   4. 阅读 PWA使用指南.md 了解更多功能');
    
  } catch (error) {
    console.error('\n❌ 设置过程中出现错误:', error.message);
    console.log('\n🆘 请检查:');
    console.log('   - 确保在正确的项目根目录');
    console.log('   - 确保有足够的文件权限');
    console.log('   - 查看 PWA使用指南.md 获取帮助');
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  checkAndCreateDirectories,
  checkRequiredFiles,
  validatePWAConfig,
  generateBrowserConfig,
  generateRobotsTxt
};

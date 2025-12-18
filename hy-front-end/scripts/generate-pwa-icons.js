// PWA图标生成工具
// 使用方法: node scripts/generate-pwa-icons.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 所需的图标尺寸
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// 创建icons目录
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 创建screenshots目录
const screenshotsDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// 生成SVG图标内容（可以替换为你的应用图标）
const generateSVGIcon = (size) => {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圆角矩形 -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- 主背景 -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" ry="${size * 0.15}" fill="url(#grad1)" filter="url(#shadow)"/>
  
  <!-- 旅行图标 -->
  <g transform="translate(${size * 0.2}, ${size * 0.2}) scale(${size * 0.006})">
    <!-- 地图图标 -->
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
          fill="#ffffff" 
          opacity="0.9"
          transform="scale(3) translate(10, 10)"/>
    
    <!-- 装饰性元素 -->
    <circle cx="60" cy="40" r="6" fill="#ffffff" opacity="0.6"/>
    <circle cx="80" cy="60" r="4" fill="#ffffff" opacity="0.4"/>
    <circle cx="40" cy="70" r="5" fill="#ffffff" opacity="0.5"/>
  </g>
  
  <!-- 应用名称 (在较大尺寸时显示) -->
  ${size >= 192 ? `
  <text x="${size/2}" y="${size * 0.85}" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.08}" 
        font-weight="bold" 
        fill="#ffffff" 
        opacity="0.9">旅行</text>
  ` : ''}
</svg>`;
};

// 生成所有尺寸的图标
console.log('🎨 开始生成PWA图标...');

iconSizes.forEach(({ size, name }) => {
  const svgContent = generateSVGIcon(size);
  const svgPath = path.join(iconsDir, name.replace('.png', '.svg'));
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ 已生成: ${name} (${size}x${size})`);
});

// 生成快捷方式图标
const shortcuts = [
  { name: 'shortcut-favorites.svg', icon: '⭐', color: '#F59E0B' },
  { name: 'shortcut-ai.svg', icon: '🤖', color: '#8B5CF6' },
  { name: 'shortcut-discover.svg', icon: '🔍', color: '#10B981' }
];

shortcuts.forEach(({ name, icon, color }) => {
  const svgContent = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="20" ry="20" fill="${color}"/>
  <text x="48" y="60" text-anchor="middle" font-size="40">${icon}</text>
</svg>`;
  
  const filePath = path.join(iconsDir, name);
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ 已生成快捷方式图标: ${name}`);
});

// 生成示例截图说明
const screenshotReadme = `# PWA截图说明

## 如何添加应用截图

1. 使用手机打开应用的主要页面
2. 截取垂直方向的截图 (推荐尺寸: 540x720)
3. 将截图重命名为 screenshot1.png, screenshot2.png 等
4. 放置在 public/screenshots/ 目录下

## 截图建议

- **主页面**: 展示应用的主要功能和界面
- **核心功能**: 展示地图、收藏、AI助手等特色功能
- **用户体验**: 展示流畅的操作体验

## 注意事项

- 截图尺寸应为 540x720 像素（9:12 比例）
- 确保截图清晰，界面美观
- 避免包含个人隐私信息
- 截图将在应用商店和安装提示中显示
`;

fs.writeFileSync(path.join(screenshotsDir, 'README.md'), screenshotReadme);

// 创建图标使用说明
const iconReadme = `# PWA图标说明

## 自动生成的图标

本脚本已自动生成以下尺寸的图标：

${iconSizes.map(({ size, name }) => `- ${name} (${size}x${size})`).join('\n')}

## 自定义图标

如需使用自定义图标，请：

1. 准备一个高分辨率的正方形图标 (建议512x512或更高)
2. 使用在线工具或设计软件生成不同尺寸
3. 替换 public/icons/ 目录下的对应文件
4. 确保图标符合各平台的设计规范

## 图标设计建议

- **简洁明了**: 图标应该在小尺寸下仍然清晰可识别
- **品牌一致**: 与应用的整体设计风格保持一致
- **高对比度**: 确保在不同背景下都能清晰显示
- **圆角处理**: 考虑不同平台的圆角要求

## 平台特殊要求

- **iOS**: 系统会自动处理圆角，建议使用正方形图标
- **Android**: 支持自适应图标，可以使用带透明背景的图标
- **Windows**: 建议使用实色背景的图标
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), iconReadme);

console.log('\n🎉 PWA图标生成完成！');
console.log('\n📋 后续步骤:');
console.log('1. 检查生成的SVG图标');
console.log('2. 如需要，替换为自定义图标');
console.log('3. 转换SVG为PNG格式 (可使用在线工具)');
console.log('4. 添加应用截图到 public/screenshots/');
console.log('5. 测试PWA安装功能');

console.log('\n🔗 推荐工具:');
console.log('- SVG转PNG: https://svgtopng.com/');
console.log('- 图标生成: https://www.pwabuilder.com/imageGenerator');
console.log('- PWA测试: https://www.pwabuilder.com/');

/**
 * 高德地图API配置文件
 * 请在高德开放平台申请您自己的API Key
 * 网址: https://lbs.amap.com/
 */

const amapConfig = {
  // ⚠️ 重要：请替换为您自己的高德地图API Key
  // 获取步骤：
  // 1. 访问 https://lbs.amap.com/
  // 2. 注册/登录账号
  // 3. 进入控制台 -> 应用管理 -> 我的应用
  // 4. 创建新应用，添加Key（Web端（JS API））
  // 5. 将生成的Key替换下面的值
  
  // JS 地图与 PlaceSearch 使用的 Key（平台：Web端（JS API））
  apiKey: '04ff38653e77f97bb6c4ea1f24a37b92',

  // Web 服务（REST 接口，如 place/text、geocode）专用 Key（平台：Web服务）
  // 👉 请在高德控制台再创建一个「Web服务」类型的 Key，并填到下面这个字段
  // webServiceKey: '在这里填你的 Web服务 Key',
  webServiceKey: '7a00383d9345de7b8c4038a801bdcbf3',

  securityKey: '364f70398a0a9a37c5429c09ea82d9d7',
  
  // API版本配置
  version: '2.0',
  
  // 获取完整的 JS API URL（用于加载地图与插件）
  getApiUrl: (plugins = []) => {
    const pluginStr = plugins.length > 0 ? `&plugin=${plugins.join(',')}` : '';
    return `https://webapi.amap.com/maps?v=${amapConfig.version}&key=${amapConfig.apiKey}${pluginStr}`;
  },

  // 获取用于 REST 接口的 Key：优先使用 webServiceKey，未配置时回退到 apiKey
  getRestKey: () => {
    return amapConfig.webServiceKey || amapConfig.apiKey;
  },
  
  // 逆地理编码API URL（REST）
  getGeocoderApiUrl: () => {
    const key = amapConfig.getRestKey();
    return `https://restapi.amap.com/v3/geocode/regeo?key=${key}`;
  },
  
  // 通用地图配置
  defaultMapOptions: {
    zoom: 15,
    resizeEnable: true,
    dragEnable: true,
    zoomEnable: true,
    doubleClickZoom: false,
    keyboardEnable: false,
    jogEnable: false,
    scrollWheel: true,
    touchZoom: true,
    animateEnable: false
  }
};


export default amapConfig;


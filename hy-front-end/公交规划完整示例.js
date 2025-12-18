/**
 * 高德地图 - 公交地铁路线规划完整示例
 * 支持同城和跨城公交规划
 * 
 * API文档：https://lbs.amap.com/api/javascript-api/reference/route-search#m_AMap.Transfer
 */

// ========== 示例1：基础配置（支持同城和跨城） ==========
function basicTransferExample(routeData, map, panelContainer, startCoords, endCoords) {
  AMap.plugin('AMap.Transfer', function() {
    // 从AI接口获取城市信息
    const originCity = routeData?.coordinates?.origin?.city || '北京市';
    const destinationCity = routeData?.coordinates?.destination?.city || '上海市';
    
    console.log('起点城市:', originCity);
    console.log('终点城市:', destinationCity);
    
    const transfer = new AMap.Transfer({
      map: map,
      panel: panelContainer.current,
      city: originCity,        // ⭐ 起点城市（必填）
      cityd: destinationCity   // ⭐ 终点城市（跨城必填）
    });
    
    transfer.search(
      new AMap.LngLat(startCoords.lng, startCoords.lat),
      new AMap.LngLat(endCoords.lng, endCoords.lat),
      (status, result) => {
        if (status === 'complete') {
          console.log('✅ 规划成功', result);
          map.setFitView();
        } else {
          console.error('❌ 规划失败', result);
        }
      }
    );
  });
}

// ========== 示例2：带策略选择的配置 ==========
function advancedTransferExample(routeData, map, panelContainer, startCoords, endCoords) {
  AMap.plugin('AMap.Transfer', function() {
    const originCity = routeData?.coordinates?.origin?.city || '北京市';
    const destinationCity = routeData?.coordinates?.destination?.city || '上海市';
    
    const transfer = new AMap.Transfer({
      map: map,
      panel: panelContainer.current,
      city: originCity,
      cityd: destinationCity,
      policy: AMap.TransferPolicy.LEAST_TIME,  // ⭐ 最快捷策略
      nightflag: true  // ⭐ 考虑夜班车
    });
    
    transfer.search(
      new AMap.LngLat(startCoords.lng, startCoords.lat),
      new AMap.LngLat(endCoords.lng, endCoords.lat),
      (status, result) => {
        if (status === 'complete') {
          console.log('✅ 规划成功');
          // 获取路线详情
          if (result.plans && result.plans.length > 0) {
            const plan = result.plans[0];
            console.log('总距离:', plan.distance, '米');
            console.log('总时间:', Math.round(plan.time / 60), '分钟');
            console.log('总费用:', plan.cost, '元');
            console.log('换乘次数:', plan.transits.length - 1);
          }
          map.setFitView();
        } else {
          console.error('❌ 规划失败', result);
        }
      }
    );
  });
}

// ========== 示例3：多策略对比（同时规划多种方案） ==========
function multiStrategyExample(routeData, map, panelContainer, startCoords, endCoords) {
  const originCity = routeData?.coordinates?.origin?.city || '北京市';
  const destinationCity = routeData?.coordinates?.destination?.city || '上海市';
  
  const strategies = [
    { name: '最快捷', policy: AMap.TransferPolicy.LEAST_TIME },
    { name: '最经济', policy: AMap.TransferPolicy.LEAST_FEE },
    { name: '最少换乘', policy: AMap.TransferPolicy.LEAST_TRANSFER },
    { name: '最少步行', policy: AMap.TransferPolicy.LEAST_WALK },
    { name: '最舒适', policy: AMap.TransferPolicy.MOST_COMFORT }
  ];
  
  strategies.forEach(strategy => {
    AMap.plugin('AMap.Transfer', function() {
      const transfer = new AMap.Transfer({
        map: map,
        city: originCity,
        cityd: destinationCity,
        policy: strategy.policy
      });
      
      transfer.search(
        new AMap.LngLat(startCoords.lng, startCoords.lat),
        new AMap.LngLat(endCoords.lng, endCoords.lat),
        (status, result) => {
          if (status === 'complete' && result.plans && result.plans.length > 0) {
            const plan = result.plans[0];
            console.log(`${strategy.name}方案:`, {
              时间: Math.round(plan.time / 60) + '分钟',
              距离: plan.distance + '米',
              费用: plan.cost + '元',
              换乘: (plan.transits.length - 1) + '次'
            });
          }
        }
      );
    });
  });
}

// ========== 示例4：完整的MapPage.jsx中的实现 ==========
/*
在你的 MapPage.jsx 中，找到公交规划部分，替换成以下代码：

//公交地铁规划
AMap.plugin('AMap.Transfer', function() {
  // ⭐ 使用AI接口返回的城市参数
  const originCity = routeData?.coordinates?.origin?.city || '北京市';
  const destinationCity = routeData?.coordinates?.destination?.city || '上海市';
  
  console.log('🚌 公交规划');
  console.log('  起点城市:', originCity);
  console.log('  终点城市:', destinationCity);
  
  // 判断是否跨城
  const isCrossCity = originCity !== destinationCity;
  if (isCrossCity) {
    console.log('  类型: 跨城公交');
  } else {
    console.log('  类型: 同城公交');
  }
  
  const transfer = new AMap.Transfer({
    map: map,
    panel: panelContainer.current,
    city: originCity,        // 起点城市（必填）
    cityd: destinationCity,  // 终点城市（跨城时必填）
    policy: AMap.TransferPolicy.LEAST_TIME,  // 换乘策略：最快捷
    nightflag: false  // 不计算夜班车
  });
  
  transfer.search(
    new AMap.LngLat(startCoords.lng, startCoords.lat),
    new AMap.LngLat(endCoords.lng, endCoords.lat),
    (status, result) => {
      if (status === 'complete') {
        console.log('✅ 公交地铁路线规划完成');
        console.log('路线数据:', result);
        
        // 显示路线详情
        if (result.plans && result.plans.length > 0) {
          const plan = result.plans[0];
          console.log('-------- 路线详情 --------');
          console.log('总距离:', plan.distance, '米');
          console.log('总时间:', Math.round(plan.time / 60), '分钟');
          console.log('总费用:', plan.cost, '元');
          console.log('换乘次数:', plan.transits.length - 1, '次');
          console.log('------------------------');
        }
        
        try {
          map.setFitView();
        } catch (error) {
          console.warn('地图视野调整失败', error);
        }
      } else {
        console.error('❌ 公交地铁规划失败:', result);
        
        // 友好的错误提示
        if (result === 'NO_DATA') {
          console.log('💡 提示：未找到公交路线，请尝试其他交通方式');
        } else if (result === 'NO_CITY') {
          console.log('💡 提示：城市参数错误，请检查城市名称');
        } else if (isCrossCity) {
          console.log('💡 提示：跨城公交路线有限，建议考虑火车或飞机');
        }
      }
    }
  );
});
*/

// ========== 示例5：城市参数的不同格式 ==========
function cityFormatExamples() {
  // 高德地图支持的城市格式：
  
  // 1. 城市名称（推荐）
  const city1 = '北京';
  const city2 = '北京市';  // 带"市"也可以
  
  // 2. 城市编码（adcode）
  const city3 = '110000';  // 北京的adcode
  const city4 = '310000';  // 上海的adcode
  
  // 3. 电话区号
  const city5 = '010';  // 北京的电话区号
  const city6 = '021';  // 上海的电话区号
  
  // ⭐ 推荐使用AI接口返回的城市名（最准确）
  const bestChoice = routeData?.coordinates?.origin?.city;  // "北京市"
}

// ========== 示例6：错误处理 ==========
function errorHandlingExample(routeData, map, panelContainer, startCoords, endCoords) {
  AMap.plugin('AMap.Transfer', function() {
    const originCity = routeData?.coordinates?.origin?.city;
    const destinationCity = routeData?.coordinates?.destination?.city;
    
    // 检查城市参数是否存在
    if (!originCity || !destinationCity) {
      console.error('❌ 缺少城市信息，无法进行公交规划');
      alert('抱歉，无法获取城市信息，请重试');
      return;
    }
    
    const transfer = new AMap.Transfer({
      map: map,
      panel: panelContainer.current,
      city: originCity,
      cityd: destinationCity
    });
    
    transfer.search(
      new AMap.LngLat(startCoords.lng, startCoords.lat),
      new AMap.LngLat(endCoords.lng, endCoords.lat),
      (status, result) => {
        if (status === 'complete') {
          console.log('✅ 规划成功');
          map.setFitView();
        } else {
          // 详细的错误处理
          console.error('❌ 规划失败:', result);
          
          let errorMessage = '公交路线规划失败';
          
          switch (result) {
            case 'NO_DATA':
              errorMessage = '未找到合适的公交路线，请尝试其他交通方式';
              break;
            case 'NO_CITY':
              errorMessage = '城市信息错误，请检查起点和终点';
              break;
            case 'OVER_DIRECTION_RANGE':
              errorMessage = '距离过远，请尝试其他交通方式';
              break;
            default:
              errorMessage = '公交规划服务暂时不可用';
          }
          
          console.log('💡 提示:', errorMessage);
          // 可以在页面上显示错误提示
          // alert(errorMessage);
        }
      }
    );
  });
}

// ========== 常见城市的adcode对照表 ==========
const CITY_ADCODE = {
  '北京市': '110000',
  '上海市': '310000',
  '广州市': '440100',
  '深圳市': '440300',
  '杭州市': '330100',
  '南京市': '320100',
  '成都市': '510100',
  '重庆市': '500000',
  '武汉市': '420100',
  '西安市': '610100',
  '天津市': '120000',
  '苏州市': '320500'
};

// ========== 总结 ==========
/*
📋 关键要点：

1. ⭐ city 和 cityd 参数
   - city: 起点城市（必填）
   - cityd: 终点城市（跨城时必填）

2. ⭐ 使用AI接口返回的城市
   - routeData.coordinates.origin.city
   - routeData.coordinates.destination.city

3. ⭐ 支持同城和跨城
   - 同城：只需 city 参数也可以
   - 跨城：必须同时指定 city 和 cityd

4. ⭐ 换乘策略
   - LEAST_TIME: 最快捷
   - LEAST_FEE: 最经济
   - LEAST_TRANSFER: 最少换乘
   - LEAST_WALK: 最少步行
   - MOST_COMFORT: 最舒适

5. ⭐ 注意事项
   - 跨城公交路线可能很少或没有
   - 建议跨城时提供其他交通方式选择
   - 做好错误处理，提供友好提示
*/



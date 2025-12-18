import React, { useState, useEffect, useRef } from 'react';
import amapConfig from '../config/amapConfig';

const TRAVEL_PREFERENCE_TAGS = [
  '景点必玩',
  '吃吃喝喝',
  '小众探索',
  '出片拍照',
  '自然风光',
  '历史人文',
  '文艺展览',
  'citywalk',
  '经济型',
  '富豪型',
];

const CreatePlanAiPage = ({ onBackToHome, onNavigateToAi }) => {
  // 表单状态
  const [destination, setDestination] = useState('');
  const [destinationConfirmed, setDestinationConfirmed] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [currentStep, setCurrentStep] = useState('destination'); // destination, date, people, complete
  const [isGenerating, setIsGenerating] = useState(false); // 防止重复提交

  // 旅行偏好标签（多选）
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  
  // 日期选择相关状态
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectingStart, setSelectingStart] = useState(true);
  
  // 自动完成相关状态（高德模糊搜索）
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const placeSearchRef = useRef(null);
  const latestQueryRef = useRef('');
  
  // 当搜索结果变化时，自动控制下拉列表显示
  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions]);
  
  // 触摸滑动相关
  const touchStartX = useRef(0);

  const touchStartY = useRef(0);

  // 加载高德地图脚本并初始化 PlaceSearch（用于模糊搜索城市/景点）
  useEffect(() => {
    const loadMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.AMap) {
          resolve(window.AMap);
          return;
        }

        window._AMapSecurityConfig = {
          securityJsCode: amapConfig.securityKey,
        };

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = amapConfig.getApiUrl(['AMap.PlaceSearch', 'AMap.ToolBar']);
        script.onload = () => {

          if (window.AMap) {
            resolve(window.AMap);
          } else {
            reject(new Error('高德地图API加载失败'));
          }
        };
        script.onerror = () => {
          reject(new Error('高德地图API加载出错'));
        };
        document.head.appendChild(script);
      });
    };

    loadMapScript()
      .then((AMap) => {
        AMap.plugin('AMap.PlaceSearch', () => {
          if (!placeSearchRef.current) {
            placeSearchRef.current = new AMap.PlaceSearch({
              pageSize: 10,
              pageIndex: 1,
              city: '全国',
              citylimit: false,
            });
          }
        });
      })
      .catch((error) => {
        console.error('CreatePlanAiPage 高德地图初始化失败:', error);
      });
  }, []);

  // 检查是否是今天

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 检查是否被选中
  const isSelected = (date) => {
    if (selectingStart) {
      return isSameDay(date, new Date(startDate));
    } else {
      return isSameDay(date, new Date(endDate));
    }
  };

  // 检查是否在日期范围内
  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  };

  // 比较两个日期是否是同一天
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // 格式化月份
  const formatMonth = (year, month) => {
    return `${year}年${month + 1}月`;
  };

  // 生成日历天数
  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // 上一个月
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 下一个月
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 日期选择处理
  const handleDateSelect = (date) => {
    if (selectingStart) {
      setStartDate(date.toISOString().split('T')[0]);
      setSelectingStart(false);
    } else {
      // 确保结束日期不早于开始日期
      if (date >= new Date(startDate)) {
        setEndDate(date.toISOString().split('T')[0]);
        setShowCalendar(false);
      }
    }
  };

  // 触摸事件处理
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    // 可以在这里添加滑动反馈
  };

  const onTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // 水平滑动切换月份
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToPreviousMonth();
      } else {
        goToNextMonth();
      }
    }
  };

  // 使用高德 REST API 兜底搜索（在 PlaceSearch 不可用或返回空结果时）
  const searchPlacesWithRestApi = async (text) => {
    try {
      const restKey = amapConfig.getRestKey ? amapConfig.getRestKey() : amapConfig.webServiceKey || amapConfig.apiKey;
      const response = await fetch(
        `https://restapi.amap.com/v3/place/text?key=${restKey}&keywords=${encodeURIComponent(
          text
        )}&types=&city=&children=1&offset=10&page=1&extensions=all`
      );

      const data = await response.json();

      // 如果这次响应对应的不是当前最新查询，直接丢弃，避免旧请求覆盖新结果
      if (text !== latestQueryRef.current) {
        return;
      }

      if (data.status === '1' && Array.isArray(data.pois)) {
        const filteredSuggestions = data.pois
          // 放宽过滤条件：只要有名字或地址就展示
          .filter((poi) => poi && (poi.name || poi.address))
          .map((poi) => ({
            id: poi.id,
            name: poi.name || poi.address || '未知地点',
            address: poi.address || `${poi.province || ''}${poi.cityname || ''}${poi.adname || ''}`,
            city: poi.cityname || poi.adname || poi.province || '',
            location: poi.location,
          }))
          .slice(0,10);


        setSuggestions(filteredSuggestions);
      } else {
        // 不清空已有 suggestions，避免短暂的空结果把列表闪掉
        console.warn('CreatePlanAiPage REST 搜索无结果或状态异常:', data);
      }

    } catch (error) {
      console.error('CreatePlanAiPage REST 搜索失败:', error);
      // 即使失败也不强制清空已有 suggestions，避免用户看到的列表瞬间消失
      if (text === latestQueryRef.current) {
        // 这里保留原有的 suggestions，让用户自己决定是否修改输入
      }

    }

  };

  // 使用高德 PlaceSearch 进行模糊搜索，失败时自动回退到 REST 接口
  const searchPlaces = (query) => {
    const text = (query || '').trim();
    if (!text) {
      latestQueryRef.current = '';
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 记录本次查询文本，后续所有异步回调都以它为准，避免旧请求覆盖新结果
    latestQueryRef.current = text;

    const handlePois = (poisRaw) => {
      // 如果这一批结果不是当前最新查询的，就丢弃
      if (text !== latestQueryRef.current) {
        return;
      }
      const pois = Array.isArray(poisRaw) ? poisRaw : [];
      const filteredSuggestions = pois
        // 放宽过滤条件：只要有名字或地址就展示
        .filter((poi) => poi && (poi.name || poi.address))
        .map((poi) => ({
          id: poi.id,
          name: poi.name || poi.address || '未知地点',
          address: poi.address || `${poi.province || ''}${poi.cityname || ''}${poi.adname || ''}`,
          city: poi.cityname || poi.adname || poi.province || '',
          location: poi.location,
        }))
        .slice(0,10);


      setSuggestions(filteredSuggestions);

    };

    if (placeSearchRef.current) {
      placeSearchRef.current.search(text, (status, result) => {
        // 如果在请求过程中用户又输入了新的内容，则忽略这次回调
        if (text !== latestQueryRef.current) {
          return;
        }

        if (status === 'complete' && result && result.poiList && result.poiList.pois) {
          handlePois(result.poiList.pois);
        } else {
          // PlaceSearch 返回空或失败时，使用 REST API 兜底
          searchPlacesWithRestApi(text);
        }
      });
    } else {
      // PlaceSearch 尚未初始化，直接走 REST API
      searchPlacesWithRestApi(text);
    }
  };



  // 防抖函数
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedSearch = debounce(searchPlaces, 300);

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setDestinationConfirmed(false);
    debouncedSearch(value);
  };


  // 选择地点
  const selectDestination = (suggestion) => {
    if (!suggestion) return;
    setDestination(suggestion.name);
    setDestinationConfirmed(true);
    // 选中后清空结果并关闭下拉
    setSuggestions([]);
    setShowSuggestions(false);
    setCurrentStep('date');
  };



  // 切换旅行偏好标签
  const togglePreference = (tag) => {
    setSelectedPreferences((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }
      return [...prev, tag];
    });
  };

  // 处理开始生成
  const handleStartGenerate = () => {
    // 防止重复点击
    if (isGenerating) {
      return;
    }
    
    if (!destinationConfirmed || !destination || !startDate || !endDate || peopleCount <= 0) {
      return;
    }

    // 设置生成状态为true，防止重复提交
    setIsGenerating(true);

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    };
    
    let aiPrompt = `我想去${destination}旅行，旅行日期是${formatDate(startDate)}到${formatDate(endDate)}，共${peopleCount}个人，请帮我规划一个详细的旅行方案。`;

    if (selectedPreferences.length > 0) {
      aiPrompt += ` 我的旅行偏好是：${selectedPreferences.join('、')}。请在行程中重点考虑这些偏好。`;
    }
    
    // 使用setTimeout确保状态更新后再跳转，防止重复触发
    setTimeout(() => {
      // 跳转到AI聊天页面，并发送消息
      if (onNavigateToAi) {
        onNavigateToAi('chat', aiPrompt);
      }
      // 重置生成状态
      setIsGenerating(false);
    }, 100);
  };


  // 人数增减
  const increasePeople = () => setPeopleCount(peopleCount + 1);
  const decreasePeople = () => {
    if (peopleCount > 1) setPeopleCount(peopleCount - 1);
  };

  useEffect(() => {
    // 监听目的地选择变化，决定是否显示日期输入
    if (destinationConfirmed && destination.trim()) {
      setCurrentStep('date');
    } else {
      setCurrentStep('destination');
    }
  }, [destination, destinationConfirmed]);


  useEffect(() => {
    // 监听日期选择完整度，决定是否显示人数选择
    if (startDate && endDate) {
      setCurrentStep('people');
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // 监听所有信息完整性
    if (destination && startDate && endDate && peopleCount > 0) {
      setCurrentStep('complete');
    }
  }, [destination, startDate, endDate, peopleCount]);

  return (
   
    <div className="min-h-screen bg-gray-50" style={{backgroundImage: 'url(/ai古风图片4.jpg)',backgroundRepeat: 'no-repeat',backgroundSize: 'cover'}}>
      {/* 顶部导航栏 */}
      <div className="bg-white px-4 py-3 flex items-center">
        <button 
          onClick={() => onBackToHome && onBackToHome()}
          className="text-GuText hover:text-GuText mr-4"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="font-bold text-gray-800">AI旅行规划</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 目的地输入 */}
        <div className=" rounded-lg p-4">
          <label className="block font-bold text-GuText mb-2"style={{ fontFamily: '宋体, SimSun, serif' }}>
            你想去哪里？
          </label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={handleInputChange}
              placeholder="请输入城市或景点名称"
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-GuText focus:border-transparent"
            />
            
            {/* 搜索建议 */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 border rounded-3xl max-h-70 overflow-y-auto bg-white/90">

                {suggestions.map((suggestion, index) => (

                  <button
                    key={index}
                    onClick={() => selectDestination(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b bg-transparent"
                  >
                    <div className="font-bold text-GuText"style={{ fontFamily: '宋体, SimSun, serif' }}>{suggestion.name}</div>
                    <div className="text-sm text-gray-800">{suggestion.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 日期选择 */}
        {destinationConfirmed && (

          <div className="rounded-xl p-4">
            <label className="block font-bold text-GuText mb-2" style={{ fontFamily: '宋体, SimSun, serif' }}>
              出行日期
            </label>
            <div 
              className="flex space-x-2"
              onClick={() => setShowCalendar(true)}
            >
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">开始日期</div>
                <input
                  type="text"
                  value={startDate || ''}
                  readOnly
                  placeholder="选择开始日期"
                  className="w-full px-3 py-2 border border-gray-300 rounded-3xl bg-gray-50 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">结束日期</div>
                <input
                  type="text"
                  value={endDate || ''}
                  readOnly
                  placeholder="选择结束日期"
                  className="w-full px-3 py-2 border border-gray-300 rounded-3xl bg-gray-50 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 人数选择 */}
        {startDate && endDate && (
          <div className="rounded-lg p-4">
            <label className="block font-bold text-GuText mb-2" style={{ fontFamily: '宋体, SimSun, serif' }}>
              旅行人数
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={decreasePeople}
                className="w-7 h-7 rounded-full bg-GuText hover:bg-GuText flex items-center justify-center transition-colors"
                disabled={peopleCount <= 1}
              >
                <i className="fa-solid fa-minus text-white"></i>
              </button>
              <span className="text-xl font-bold text-gray-800 min-w-[60px] text-center">
                {peopleCount}
              </span>
              <button
                onClick={increasePeople}
                className="w-7 h-7 rounded-full bg-GuText hover:bg-GuText flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-plus text-white"></i>
              </button>
            </div>
          </div>
        )}

        {/* 旅行偏好标签（可选，多选） */}
        {destinationConfirmed && startDate && endDate && (
          <div className="rounded-lg p-4">
            <label className="block font-bold text-GuText mb-2" style={{ fontFamily: '宋体, SimSun, serif' }}>
              旅行偏好（可多选）
            </label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_PREFERENCE_TAGS.map((tag) => {
                const active = selectedPreferences.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePreference(tag)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      active
                        ? 'bg-[#a8b78c] text-white border-[#a8b78c]'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 生成按钮 */}
        {destinationConfirmed && startDate && endDate && peopleCount > 0 && (

          <div className="px-4 flex flex-col">
            <button
              onClick={handleStartGenerate}
              disabled={isGenerating}
              className={`w-full py-4 px-6 rounded-3xl font-medium transition-colors active:scale-95 ${
                isGenerating 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-[#e0c6c4] text-white hover:bg-GuText-dark'
              }`}
            >
              {isGenerating ? '生成中...' : '小精灵生成旅行规划'}
            </button>


             {/* <button
              onClick={handleStartGenerate}
              className="w-full mt-4 text-white py-4 px-6 rounded-3xl font-medium hover:bg-GuText-dark transition-colors active:scale-95" style={{backgroundColor:"#a58a5d"}}
            >
              自己生成计划
            </button> */}
          </div>

          
        )}
      </div>

      {/* 日历弹窗 */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-GuText"style={{fontFamily: '宋体, SimSun, serif' }}>
                选择{selectingStart ? '开始' : '结束'}日期
              </h3>
              <button 
                onClick={() => {
                  setShowCalendar(false);
                  setSelectingStart(true);
                }}
                className="text-GuText hover:text-GuText-dark"
              >
                ✕
              </button>
            </div>
            
            {/* 简化的日历组件 */}
            <div className="calendar-container" 
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* 月份导航 */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <div className="text-sm font-bold">
                  {formatMonth(currentYear, currentMonth)}
                </div>
                <button 
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
              
              {/* 星期标题 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays(currentYear, currentMonth).map((dayObj, i) => {
                  const { date, isCurrentMonth } = dayObj;
                  const todayFlag = isToday(date);
                  const selectedFlag = isSelected(date);
                  const inRangeFlag = isInRange(date);
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleDateSelect(date)}
                      disabled={!isCurrentMonth}
                      className={`
                        p-2 text-sm rounded transition-colors
                        ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'}
                        ${todayFlag ? 'bg-yellow-100 text-yellow-700 font-bold ring-2 ring-yellow-400' : ''}
                        ${selectedFlag ? 'bg-blue-500 text-white font-bold' : ''}
                        ${inRangeFlag && !selectedFlag ? 'bg-blue-100 text-blue-600' : ''}
                        ${!todayFlag && !selectedFlag && !inRangeFlag && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  
  );
};

export default CreatePlanAiPage;
import React, { useState, useEffect, useRef } from 'react';
import amapConfig from '../config/amapConfig';
import { apiRequest, API_CONFIG } from '../api/config';

const AddActivityPage = ({ onBack, onSelectPlace, selectedDailyItinerary }) => {
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState([]);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const placeSearchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // 选择时间相关状态
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('12');
  const [endMinute, setEndMinute] = useState('00');
  const [pendingSelection, setPendingSelection] = useState(null); // { finalPoi, requestBodyBase, dailyItineraryId }
  const [saving, setSaving] = useState(false);
  const [timeError, setTimeError] = useState('');

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

    const initMap = (AMap) => {
      if (!mapContainerRef.current) {
        return;
      }
      if (mapRef.current) {
        return;
      }

      const map = new AMap.Map(mapContainerRef.current, {
        ...amapConfig.defaultMapOptions,
        zoom: 13,
      });
      mapRef.current = map;

      AMap.plugin('AMap.PlaceSearch', () => {
        const ps = new AMap.PlaceSearch({
          map,
          pageSize: 10,
          pageIndex: 1,
          city: '全国',
          citylimit: false,
        });
        placeSearchRef.current = ps;
      });
    };

    loadMapScript()
      .then((AMap) => {
        initMap(AMap);
      })
      .catch((error) => {
        console.error(error);
        setSearchError(error.message || '地图加载失败');
      });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch (e) {
          console.warn('AddActivityPage 地图销毁失败:', e);
        } finally {
          mapRef.current = null;
        }
      }
    };
  }, []);

  // 输入时自动模糊搜索（防抖）
  useEffect(() => {
    const text = (keyword || '').trim();

    // 清空时重置结果和错误
    if (!text) {
      setResults([]);
      setSearchError('');
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      return;
    }

    if (!placeSearchRef.current) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 防抖：停顿 400ms 后自动搜索
    searchTimeoutRef.current = setTimeout(() => {
      // 这里复用现有的搜索逻辑
      const textNow = (keyword || '').trim();
      if (!textNow) return;

      setSearching(true);
      setSearchError('');
      setResults([]);

      placeSearchRef.current.search(textNow, (status, result) => {
        setSearching(false);
        if (status !== 'complete' || !result || !result.poiList || !result.poiList.pois) {
          setSearchError('未找到相关景点');
          return;
        }
        const pois = result.poiList.pois;
        const list = pois.map((poi) => {
          const loc = poi.location || {};
          return {
            id: poi.id,
            name: poi.name,
            address: poi.address,
            lng: loc.lng,
            lat: loc.lat,
            type: poi.type,
          };
        });
        setResults(list);
      });
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [keyword]);

  const handleSearch = () => {
    const text = (keyword || '').trim();
    if (!text || !placeSearchRef.current) {
      return;
    }
    setSearching(true);
    setSearchError('');
    setResults([]);

    placeSearchRef.current.search(text, (status, result) => {
      setSearching(false);
      if (status !== 'complete' || !result || !result.poiList || !result.poiList.pois) {
        setSearchError('未找到相关景点');
        return;
      }
      const pois = result.poiList.pois;
      const list = pois.map((poi) => {
        const loc = poi.location || {};
        return {
          id: poi.id,
          name: poi.name,
          address: poi.address,
          lng: loc.lng,
          lat: loc.lat,
          type: poi.type,
        };
      });
      setResults(list);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectPoi = (poi) => {
    if (!poi) {
      return;
    }

    if (!placeSearchRef.current || !poi.id) {
      if (onSelectPlace) {
        console.log('📌 选中的景点:', poi);
        onSelectPlace(poi);
      }
      return;
    }

    placeSearchRef.current.getDetails(poi.id, async (status, result) => {
      if (status === 'complete' && result && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
        const full = result.poiList.pois[0];
        const loc = full.location || {};
        const photos = full.photos || [];
        const photoUrl = photos.length > 0 ? photos[0].url : null;

        const finalPoi = {
          id: full.id,
          name: full.name,
          address: full.address,
          lng: loc.lng,
          lat: loc.lat,
          photo: photoUrl,
        };

        const dailyMeta = selectedDailyItinerary || {};
        const dailyItineraryId = dailyMeta.dailyItineraryId || dailyMeta.id || null;

        const rawCost =
          full.avg_price != null
            ? full.avg_price
            : full.cost != null
            ? full.cost
            : full.biz_ext && full.biz_ext.cost != null
            ? full.biz_ext.cost
            : null;
        const parsedCost =
          rawCost !== null && rawCost !== undefined && rawCost !== ''
            ? Number(rawCost)
            : null;
        const hasValidCost =
          parsedCost !== null && !Number.isNaN(parsedCost) && parsedCost > 0;

        const recommendation = full.recommendation || '';
        const reason = full.reason || '';
        let tips = '';
        if (recommendation) {
          tips = recommendation;
        }
        if (reason) {
          tips = tips ? `${tips}，${reason}` : reason;
        }

        const requestBodyBase = {
          name: full.name,
          longitude: loc.lng,
          latitude: loc.lat,
          openingHours:
            full.openingHours || full.businessTime || full.opentime || undefined,
          tips: tips || undefined,
          photoUrl: photoUrl || undefined,
        };

        if (hasValidCost) {
          requestBodyBase.ticketPriceAdult = parsedCost;
          requestBodyBase.ticketPriceStudent = parsedCost;
          requestBodyBase.ticketPriceElderly = parsedCost;
        }

        if (dailyItineraryId) {
          // 有具体行程日：先弹出时间选择器，确认后再调用后端保存
          setPendingSelection({
            finalPoi,
            requestBodyBase,
            dailyItineraryId,
          });
          // 使用一个合理的默认时间段
          setStartHour('09');
          setStartMinute('00');
          setEndHour('12');
          setEndMinute('00');
          setTimeError('');
          setShowTimePicker(true);
          return;
        }

        // 没有 dailyItineraryId 时，退化为原有行为：直接保存基础景点信息
        try {
          const response = await apiRequest(API_CONFIG.ENDPOINTS.CREATE_OR_UPDATE_ATTRACTION, {
            method: 'POST',
            body: JSON.stringify(requestBodyBase),
          });
          if (response && response.code === 200 && response.data) {
            const data = response.data;
            finalPoi.attractionId = data.id;
          }
        } catch (error) {
          console.error('保存景点信息到后端失败:', error);
        }

        console.log('📌 选中的景点详情:', finalPoi);
        if (onSelectPlace) {
          onSelectPlace(finalPoi);
        }
      } else {
        console.log('📌 选中的景点(无详情):', poi);
        if (onSelectPlace) {
          onSelectPlace(poi);
        }
      }
    });
  };

  const handleCancelTimePicker = () => {
    if (saving) return;
    setShowTimePicker(false);
    setPendingSelection(null);
    setTimeError('');
  };

  const handleConfirmTimePicker = async () => {
    if (!pendingSelection || saving) {
      setShowTimePicker(false);
      return;
    }

    const { finalPoi, requestBodyBase, dailyItineraryId } = pendingSelection;
    const activityTime = `${startHour}:${startMinute}-${endHour}:${endMinute}`;

    const requestBody = {
      ...requestBodyBase,
      dailyItineraryId,
      activityTime,
    };

    try {
      setSaving(true);
      setTimeError('');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.CREATE_OR_UPDATE_ATTRACTION, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      if (response && response.code === 200 && response.data) {
        const data = response.data;
        finalPoi.attractionId = data.id;
      }

      if (onSelectPlace) {
        onSelectPlace(finalPoi);
      }

      setShowTimePicker(false);
      setPendingSelection(null);
    } catch (error) {
      console.error('保存景点信息到后端失败:', error);
      setTimeError(error.message || '保存失败，请稍后重试');
      return;
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-scree bg-white">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
          <div className="flex items-center px-4 py-3">
            <button onClick={onBack} className="mr-3">
              <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">添加地点/活动</h1>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-4 pb-4">
          <div className="w-full h-auto flex flex-col border rounded-lg p-3 bg-white">
            <div className="w-full bg-white flex flex-row items-center space-x-3">
              <div className="bg-macaron-blue-300 w-10 h-10 border rounded-lg flex items-center justify-center">
                <img src="/搜索.png" className="w-6 h-6ml-2" />
              </div>
              <input
                className="flex-1 outline-none text-sm"
                placeholder="搜索景点"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="text-sm text-GuText px-2 py-1"
                onClick={handleSearch}
              >
                搜索
              </button>
            </div>
          </div>

          {searchError && (
            <div className="mt-3 text-sm text-red-500">
              {searchError}
            </div>
          )}

          {searching && (
            <div className="mt-3 text-sm text-gray-500">
              搜索中...
            </div>
          )}

          <div
            ref={mapContainerRef}
            className="mt-4 w-full h-48 bg-gray-200 rounded-lg overflow-hidden"
          ></div>

          {results && results.length > 0 && (
            <div className="mt-4 space-y-3"style={{backgroundImage:"url(/首页古风背景3.jpg)",backgroundRepeat:"no-repeat",backgroundSize:"cover"}}>
              {results.map((poi) => (
                <div
                  key={poi.id}
                  className="rounded-lg shadow-sm p-3 cursor-pointer text-GuText" style={{fontFamily: '宋体, SimSun, serif' }}
                  onClick={() => handleSelectPoi(poi)}
                >
                  <div className="text-sm font-semibold mb-1 text-GuText" style={{fontFamily: '宋体, SimSun, serif' }}>
                    {poi.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {poi.address}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTimePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md text-black p-4">
            <h3 className="text-base font-semibold mb-3">选择执行时间</h3>
            <div className="flex justify-center space-x-4">
              <div className="flex flex-col items-center flex-1">
                <div className="relative w-full h-24 overflow-y-auto rounded-lg bg-black/60 rounded-lg">
                  {/* 顶部渐变：让最上面的数字变淡 */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-8" />
                  {/* 底部渐变：让最下面的数字变淡 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" />
                  {/* 中间高亮横条：选中区域 */}
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-white/20 bg-white/5" />
                  <div className="relative">
                    {Array.from({ length: 24 }, (_, i) => {
                      const value = String(i).padStart(2, '0');
                      const active = value === startHour;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setStartHour(value)}
                          className={`w-full text-center py-1 text-lg ${
                            active
                              ? 'bg-white text-black font-bold'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center flex-1">
                <div className="relative w-full h-24 overflow-y-auto bg-black/60 rounded-lg">
                  {/* 顶部渐变：让最上面的数字变淡 */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-8 " />
                  {/* 底部渐变：让最下面的数字变淡 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" />
                  {/* 中间高亮横条：选中区域 */}
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-white/20 bg-white/5" />
                  <div className="relative">
                    {Array.from({ length: 60 }, (_, i) => {
                      const value = String(i).padStart(2, '0');
                      const active = value === startMinute;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setStartMinute(value)}
                          className={`w-full text-center py-1 text-lg ${
                            active
                              ? 'bg-white text-black font-bold'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="text-lg mt-[10%] font-bold text-black">至</div>

              <div className="flex flex-col items-center flex-1">
                <div className="relative w-full h-24 overflow-y-auto bg-black/60 rounded-lg">
                  {/* 顶部渐变：让最上面的数字变淡 */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-8" />
                  {/* 底部渐变：让最下面的数字变淡 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" />
                  {/* 中间高亮横条：选中区域 */}
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-white/20 bg-white/5" />
                  <div className="relative">
                    {Array.from({ length: 24 }, (_, i) => {
                      const value = String(i).padStart(2, '0');
                      const active = value === endHour;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setEndHour(value)}
                          className={`w-full text-center py-1 text-lg ${
                            active
                              ? 'bg-white text-black font-bold'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center flex-1">
                <div className="relative w-full h-24 overflow-y-auto bg-black/60 rounded-lg">
                  {/* 顶部渐变：让最上面的数字变淡 */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-8" />
                  {/* 底部渐变：让最下面的数字变淡 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" />
                  {/* 中间高亮横条：选中区域 */}
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-white/20 bg-white/5" />
                  <div className="relative">
                    {Array.from({ length: 60 }, (_, i) => {
                      const value = String(i).padStart(2, '0');
                      const active = value === endMinute;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setEndMinute(value)}
                          className={`w-full text-center py-1 text-lg ${
                            active
                              ? 'bg-white text-black font-bold'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {timeError && (
              <div className="mt-2 text-xs text-red-500">{timeError}</div>
            )}

            <div className="flex justify-end space-x-2 mt-3">
              <button
                type="button"
                className="px-3 py-1 text-xs text-gray-300 border border-gray-500 rounded-full hover:bg-white/10"
                onClick={handleCancelTimePicker}
                disabled={saving}
              >
                取消
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs bg-black text-white rounded-full hover:bg-gray-800 disabled:bg-gray-400"
                onClick={handleConfirmTimePicker}
                disabled={saving}
              >
                {saving ? '保存中...' : '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddActivityPage;


import React, { useEffect, useRef, useState } from "react";
import amapConfig from "../config/amapConfig";
import { API_CONFIG, apiRequest } from "../api/config";
import AiFloatingButton from "../components/AiFloatingButton";

const PlanPostDetailPage = ({ onNavigateToMytTravalPlan, activity, attraction_details, planId, onNavigateToAi }) => {
    const [loading, setLoading] = useState(false);
    const [detailedAttraction, setDetailedAttraction] = useState(null);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [sheetHeight, setSheetHeight] = useState(35);
    const isDraggingRef = useRef(false);
    const dragStartYRef = useRef(0);
    const dragStartHeightRef = useRef(35);

    const handleSheetDragStart = (event) => {
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        isDraggingRef.current = true;
        dragStartYRef.current = clientY;
        dragStartHeightRef.current = sheetHeight;
    };

    const handleSheetDragMove = (event) => {
        if (!isDraggingRef.current) {
            return;
        }
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        if (typeof window === "undefined") {
            return;
        }
        const viewportHeight = window.innerHeight || 0;
        if (!viewportHeight) {
            return;
        }
        const deltaY = dragStartYRef.current - clientY;
        const deltaPercent = (deltaY / viewportHeight) * 100;
        let nextHeight = dragStartHeightRef.current + deltaPercent;
        if (nextHeight < 0) {
            nextHeight = 0;
        }
        if (nextHeight > 100) {
            nextHeight = 100;
        }
        setSheetHeight(nextHeight);
    };

    const handleSheetDragEnd = () => {
        if (!isDraggingRef.current) {
            return;
        }
        isDraggingRef.current = false;
        if (sheetHeight < 15) {
            setSheetHeight(0);
        } else if (sheetHeight < 60) {
            setSheetHeight(35);
        } else {
            setSheetHeight(90);
        }
    };

    // 获取景点详细信息
    const fetchAttractionDetail = async () => {
        if (!activity) return;

        try {
            setLoading(true);

            // ① 优先：通过活动ID获取景点详情 /api/attractions/activity/{activityId}
            const activityId = activity.id || activity.activityId;
            if (activityId) {
                try {
                    const byActivityEndpoint = API_CONFIG.ENDPOINTS.GET_ATTRACTION_BY_ACTIVITY.replace('{activityId}', activityId);
                    const byActivityResp = await apiRequest(byActivityEndpoint, { method: 'GET' });

                    if (byActivityResp && byActivityResp.code === 200 && byActivityResp.data) {
                        const data = byActivityResp.data;
                        const mappedDetail = {
                            id: data.id,
                            name: data.name,
                            ticket_price: {
                                adult: data.ticketPriceAdult,
                                student: data.ticketPriceStudent,
                                elderly: data.ticketPriceElderly
                            },
                            opening_hours: data.openingHours,
                            tips: data.tips,
                            longitude: data.longitude,
                            latitude: data.latitude,
                            must_see_spots: data.mustSeeSpots
                        };
                        setDetailedAttraction(mappedDetail);
                        return;
                    }
                } catch (error) {
                    console.error('调用 GET_ATTRACTION_BY_ACTIVITY 接口失败:', error);
                }
            }

            // ② 其次：根据景点ID调用 /api/attractions/{id}
            const attractionId = activity.attractionId || activity.id;
            if (attractionId) {
                try {
                    const detailEndpoint = API_CONFIG.ENDPOINTS.GET_ATTRACTION_DETAIL.replace('{id}', attractionId);
                    const detailResponse = await apiRequest(detailEndpoint, { method: 'GET' });

                    if (detailResponse && detailResponse.code === 200 && detailResponse.data) {
                        const data = detailResponse.data;
                        const mappedDetail = {
                            id: data.id,
                            name: data.name,
                            ticket_price: {
                                adult: data.ticketPriceAdult,
                                student: data.ticketPriceStudent,
                                elderly: data.ticketPriceElderly
                            },
                            opening_hours: data.openingHours,
                            tips: data.tips,
                            longitude: data.longitude,
                            latitude: data.latitude,
                            must_see_spots: data.mustSeeSpots
                        };
                        setDetailedAttraction(mappedDetail);
                        return;
                    } else {
                        console.warn('获取景点详情失败，返回数据格式不符合预期:', detailResponse);
                    }
                } catch (error) {
                    console.error('调用 GET_ATTRACTION_DETAIL 接口失败:', error);
                }
            }

            // ③ 最后回退：如果没有可用ID或详情接口失败，则根据行程计划中的 attraction_details 查找
            if (planId) {
                try {
                    const fullPlanEndpoint = API_CONFIG.ENDPOINTS.GET_TRAVEL_PLAN_FULL.replace('{id}', planId);
                    const response = await apiRequest(fullPlanEndpoint, { method: 'GET' });

                    if (response.code === 200 && response.data && response.data.attraction_details) {
                        const attraction = response.data.attraction_details.find(
                            detail => detail.name === activity.location
                        );

                        if (attraction) {
                            setDetailedAttraction(attraction);
                        }
                    }
                } catch (error) {
                    console.error('从行程详情中获取景点详情失败:', error);
                }
            }
        } catch (error) {
            console.error('获取景点详情失败:', error);
            // 保留props中的attraction_details作为后备
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttractionDetail();
    }, [planId, activity]);

    useEffect(() => {
        // 新版后端：longitude 为经度(lng)，latitude 为纬度(lat)
        const rawDetailLng = detailedAttraction && (detailedAttraction.longitude ?? detailedAttraction.lng);  // 经度
        const rawDetailLat = detailedAttraction && (detailedAttraction.latitude ?? detailedAttraction.lat);   // 纬度
        const rawActivityLng = activity && (activity.lng ?? activity.longitude);  // 经度
        const rawActivityLat = activity && (activity.lat ?? activity.latitude);   // 纬度

        console.log('PlanPostDetailPage - 原始景点坐标与活动坐标:', {
            activity,
            detailedAttraction,
            rawDetailLng,
            rawDetailLat,
            rawActivityLng,
            rawActivityLat,
        });

        const centerLng =
            rawDetailLng !== undefined && rawDetailLng !== null && !Number.isNaN(Number(rawDetailLng))
                ? Number(rawDetailLng)
                : rawActivityLng !== undefined && rawActivityLng !== null && !Number.isNaN(Number(rawActivityLng))
                    ? Number(rawActivityLng)
                    : 120.108478;

        const centerLat =
            rawDetailLat !== undefined && rawDetailLat !== null && !Number.isNaN(Number(rawDetailLat))
                ? Number(rawDetailLat)
                : rawActivityLat !== undefined && rawActivityLat !== null && !Number.isNaN(Number(rawActivityLat))
                    ? Number(rawActivityLat)
                    : 30.220671;

        const initMap = () => {
            if (!window.AMap || !mapContainerRef.current) {
                return;
            }

            if (mapRef.current) {
                try {
                    mapRef.current.destroy();
                } catch (error) {
                    console.warn('地图销毁失败:', error);
                }
                mapRef.current = null;
            }

            const map = new window.AMap.Map(mapContainerRef.current, {
                ...amapConfig.defaultMapOptions,
                center: [centerLng, centerLat],
                zoom: 16,
                dragEnable: true,
                zoomEnable: true,
                scrollWheel: true,         // 鼠标滚轮缩放（PC）
                doubleClickZoom: true,     // 双击缩放
                keyboardEnable: true
            });

            // 再次通过 setStatus 显式开启交互，兼容 JSAPI 2.0
            if (map.setStatus) {
                map.setStatus({
                    dragEnable: true,
                    zoomEnable: true,
                    doubleClickZoom: true,
                    keyboardEnable: true,
                    scrollWheel: true,
                    touchZoom: true,
                });
            }

            // 添加中心点 Marker
            new window.AMap.Marker({
                position: [centerLng, centerLat],
                map
            });

            // 添加工具条控件（直接使用已加载的插件，避免再次异步加载导致内部 appendChild 报错）
            if (window.AMap && window.AMap.ToolBar && map && typeof map.addControl === 'function') {
                try {
                    const toolbar = new window.AMap.ToolBar();
                    map.addControl(toolbar);
                } catch (e) {
                    console.warn('PlanPostDetailPage 地图添加工具条控件失败:', e);
                }
            }

            mapRef.current = map;
        };

        if (window.AMap) {
            initMap();
        } else {
            window._AMapSecurityConfig = {
                securityJsCode: amapConfig.securityKey,
            };

            const script = document.createElement('script');
            script.type = 'text/javascript';
            // 主脚本中直接声明需要的 AMap.ToolBar 插件，避免后续 AMap.plugin 再次异步加载
            script.src = amapConfig.getApiUrl(['AMap.ToolBar']);
            script.onload = () => {
                if (window.AMap) {
                    initMap();
                } else {
                    console.error('高德地图API加载失败');
                }
            };
            script.onerror = () => {
                console.error('高德地图API加载出错');
            };
            document.head.appendChild(script);
        }


        return () => {
            if (mapRef.current) {
                try {
                    mapRef.current.destroy();
                } catch (error) {
                    console.warn('地图销毁失败:', error);
                } finally {
                    mapRef.current = null;
                }
            }
        };
    }, [activity, detailedAttraction]);

    return (
        <div className="w-full h-full">
            <AiFloatingButton onNavigateToAi={onNavigateToAi} />
            <div className="relative flex flex-col h-screen">

                {/* 背景是地图 */}
                <div
                    ref={mapContainerRef}
                    className="absolute bottom-0 w-full h-[95%]"
                ></div>

                <div className="ml-3 mr-3 relative z-10 flex flex-col h-full pointer-events-none">
                    <div className="flex items-center px-4 py-3 pointer-events-auto">
                        <button
                            onClick={() => onNavigateToMytTravalPlan(planId ? { id: planId } : undefined)}
                            className="mr-3"
                        >
                            <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
                        </button>
                        <div className="flex-1 text-center">
                            <h1 className="text-lg font-bold text-gray-800">
                                {activity && activity.location ? activity.location : '景点详情'}
                            </h1>
                        </div>
                    </div>

                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white w-full z-10 pointer-events-auto border-t border-gray-200 rounded-t-lg flex flex-col"
                        style={{ height: `${sheetHeight}vh` }}
                        onMouseMove={handleSheetDragMove}
                        onMouseUp={handleSheetDragEnd}
                        onMouseLeave={handleSheetDragEnd}
                        onTouchMove={handleSheetDragMove}
                        onTouchEnd={handleSheetDragEnd}
                    >
                        <div
                            className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-1 cursor-pointer"
                            onMouseDown={handleSheetDragStart}
                            onTouchStart={handleSheetDragStart}
                        ></div>

                        <div className="flex-1 flex flex-col overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="text-sm text-gray-500">加载中...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="font-bold text-center mt-3">
                                        {activity?.location || '景点详情'}
                                    </div>

                                    {(activity?.photo || activity?.photoUrl) && (
                                        <div
                                            className="ml-[5%] w-[90%] h-32 rounded-lg overflow-hidden flex-shrink-0 mt-2"
                                            style={{
                                                backgroundImage: `url(${activity.photo || activity.photoUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        ></div>
                                    )}

                                    {activity?.activity && (
                                        <div className="text-sm ml-[5%] mt-2">
                                            {activity.activity}
                                        </div>
                                    )}

                                    {(detailedAttraction || attraction_details) && (
                                        <>
                                            <div className="flex flex-col">
                                                <div className="ml-[6%] text-lg font-bold mt-5 mb-3">
                                                    景点详情：
                                                </div>
                                                <div className="flex flex-row">
                                                    <img
                                                        src="/旗帜.png"
                                                        className="ml-[10%] w-10 h-10"
                                                    />
                                                    <div className="text-sm mt-3 mb-5 flex flex-col bg-macaron-blue-100 w-[65%] h-35 border rounded-lg">
                                                        <div className="font-bold mt-2 ml-3">票价:</div>
                                                        <div className=" text-sm font-blod mt-2 ml-3">
                                                            成年人:
                                                            {(detailedAttraction || attraction_details)?.ticket_price?.adult || '免费'}元
                                                        </div>
                                                        <div className=" text-sm font-blod mt-2 ml-3">
                                                            学生:
                                                            {(detailedAttraction || attraction_details)?.ticket_price?.student || '免费'}元
                                                        </div>
                                                        <div className=" text-sm font-blod mt-2 mb-2 ml-3">
                                                            老年人:
                                                            {(detailedAttraction || attraction_details)?.ticket_price?.elderly || '免费'}元
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row">
                                                <img
                                                    src="/感叹号.png"
                                                    className="ml-[10%] w-10 h-10"
                                                />
                                                <div className="text-sm mt-5 mb-5 flex flex-col bg-macaron-yellow-200 w-[65%] h-35 border rounded-lg">
                                                    <div className="text-sm font-bold mt-2 ml-3">
                                                        开放时间:
                                                    </div>
                                                    <div className=" text-sm mt-2 ml-3 mb-2">
                                                        {(detailedAttraction || attraction_details)?.opening_hours || '全天开放'}
                                                    </div>
                                                </div>
                                            </div>

                                            {(detailedAttraction || attraction_details)?.tips && (
                                                <div className="flex flex-row mt-5">
                                                    <img
                                                        src="/实景酷-笑脸.png"
                                                        className="ml-[10%] w-10 h-10"
                                                    />
                                                    <div className="text-sm ml-3 mt-2 mb-10 flex flex-col">
                                                        <div className="text-sm font-bold">小贴士:</div>
                                                        <div
                                                            className=" text-sm"
                                                            style={{ textDecoration: 'underline wavy #FFF399' }}
                                                        >
                                                            {(detailedAttraction || attraction_details).tips}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PlanPostDetailPage;
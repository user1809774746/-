package com.example.auth.controller;

import com.example.auth.dto.ResponseDTO;
import com.example.auth.dto.TravelPlanDTO;
import com.example.auth.dto.TravelPlanDateUpdateDTO;
import com.example.auth.dto.ShareToAIRequest;
import com.example.auth.dto.UpdateTravelPlanStatusRequest;
import com.example.auth.dto.ReorderItineraryRequest;
import com.example.auth.dto.TravelPlanCityDTO;
import com.example.auth.entity.DailyItinerary;
import com.example.auth.entity.TravelPlan;
import com.example.auth.entity.Accommodation;
import com.example.auth.service.TravelPlanService;
import com.example.auth.service.ChatService;
import com.example.auth.service.CityProvinceService;
import com.example.auth.repository.DailyItineraryRepository;
import com.example.auth.repository.AccommodationRepository;
import com.example.auth.entity.TravelPlanImage;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/travel-plans")
@CrossOrigin(origins = "*")
public class TravelPlanController {

    @Autowired
    private TravelPlanService travelPlanService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private DailyItineraryRepository dailyItineraryRepository;

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private CityProvinceService cityProvinceService;

    /**
     * Webhook 接口（保留给 n8n 调用），沿用原有结构
     */
    @PostMapping("/webhook")
    public ResponseDTO receiveFromN8n(
            @RequestBody List<TravelPlanDTO> travelPlanDTOList,
            @RequestParam(required = false) Long userId) {

        Map<String, Object> data = new HashMap<>();

        try {
            if (travelPlanDTOList == null || travelPlanDTOList.isEmpty()) {
                return ResponseDTO.error(400, "No travel plan data received");
            }

            TravelPlanDTO travelPlanDTO = travelPlanDTOList.get(0);
            if (travelPlanDTO.getTravelPlan() == null) {
                return ResponseDTO.error(400, "Invalid travel plan structure");
            }

            Long targetUserId = userId != null ? userId : 1L;

            TravelPlan savedPlan = travelPlanService.saveTravelPlanFromN8n(
                    travelPlanDTO.getTravelPlan(),
                    targetUserId
            );

            data.put("success", true);
            data.put("travelPlanId", savedPlan.getId());
            data.put("title", savedPlan.getTitle());

            return ResponseDTO.success(data);
        } catch (Exception e) {
            return ResponseDTO.error(500, "Error saving travel plan: " + e.getMessage());
        }
    }

    /**
     * 1.0 获取用户最新的旅行计划（用于保存后跳转）：GET /api/travel-plans/user/{userId}/latest
     */
    @GetMapping("/user/{userId}/latest")
    public ResponseDTO getLatestTravelPlan(@PathVariable Long userId) {
        TravelPlan latestPlan = travelPlanService.getLatestTravelPlan(userId);
        
        if (latestPlan == null) {
            return ResponseDTO.error(404, "该用户还没有旅行计划");
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", latestPlan.getId());
        data.put("title", latestPlan.getTitle());
        data.put("destination", latestPlan.getDestination());
        data.put("createdAt", latestPlan.getCreatedAt());
        
        return ResponseDTO.success(data);
    }
    
    /**
     * 1.1 获取用户所有旅行方案：GET /api/travel-plans/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseDTO getUserTravelPlans(@PathVariable Long userId) {
        List<TravelPlan> plans = travelPlanService.getUserTravelPlans(userId);

        // 为每个旅行计划附加第一张图片作为封面（如有）
        List<Map<String, Object>> planList = new java.util.ArrayList<>();
        for (TravelPlan plan : plans) {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", plan.getId());
            item.put("userId", plan.getUserId());
            item.put("title", plan.getTitle());
            item.put("destination", plan.getDestination());
            item.put("travelDays", plan.getTravelDays());
            item.put("totalBudget", plan.getTotalBudget());
            item.put("totalTips", plan.getTotalTips());
            item.put("specialRequirements", plan.getSpecialRequirements());
            item.put("status", plan.getStatus());
            item.put("createdAt", plan.getCreatedAt());
            item.put("updatedAt", plan.getUpdatedAt());
            item.put("startDate", plan.getStartDate());
            item.put("endDate", plan.getEndDate());

            // 兼容原文档中的 "date" 字段（起止日期拼接）
            if (plan.getStartDate() != null && plan.getEndDate() != null) {
                item.put("date", plan.getStartDate() + "-" + plan.getEndDate());
            }

            // 获取第一张图片作为封面
            TravelPlanImage cover = travelPlanService.getFirstImageByPlan(plan.getId());
            if (cover != null) {
                item.put("coverImageId", cover.getId());
                item.put("coverImageUrl", "/api/travel-plans/images/" + cover.getId() + "/content");
            } else {
                // 如果没有上传行程图片，则从每日活动中取第一张非空 photoUrl 作为封面兜底
                String activityCoverUrl = travelPlanService.getFirstActivityPhotoUrl(plan.getId());
                if (activityCoverUrl != null && !activityCoverUrl.trim().isEmpty()) {
                    item.put("coverImageId", null);
                    item.put("coverImageUrl", activityCoverUrl);
                } else {
                    item.put("coverImageId", null);
                    item.put("coverImageUrl", null);
                }
            }

            planList.add(item);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("userId", userId);
        data.put("total", plans.size());
        data.put("travelPlans", planList);

        return ResponseDTO.success(data);
    }

    /**
     * 1.2 获取旅行计划详情：GET /api/travel-plans/{id}
     */
    @GetMapping("/{id}")
    public ResponseDTO getTravelPlanById(@PathVariable Long id) {
        TravelPlan plan = travelPlanService.getTravelPlanById(id);
        if (plan == null) {
            return ResponseDTO.error(404, "Travel plan not found");
        }
        return ResponseDTO.success(plan);
    }

    /**
     * 1.3 获取旅行计划完整详情：GET /api/travel-plans/{id}/full
     */
    @GetMapping("/{id}/full")
    public ResponseDTO getFullTravelPlan(@PathVariable Long id) {
        TravelPlan plan = travelPlanService.getTravelPlanById(id);
        if (plan == null) {
            return ResponseDTO.error(404, "Travel plan not found");
        }

        List<DailyItinerary> dailyItineraries = dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(id);
        List<Accommodation> accommodations = accommodationRepository.findByTravelPlanId(id);

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlan", plan);
        data.put("dailyItineraries", dailyItineraries);
        data.put("accommodations", accommodations);
        data.put("totalDays", dailyItineraries.size());
        data.put("totalAccommodations", accommodations.size());

        return ResponseDTO.success(data);
    }

    /**
     * 1.4 更新旅行计划状态：PUT /api/travel-plans/{id}/status?status=xxx
     */
    @PutMapping("/{id}/status")
    public ResponseDTO updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            TravelPlan plan = travelPlanService.updateStatus(id, status);
            if (plan == null) {
                return ResponseDTO.error(404, "Travel plan not found");
            }
            return ResponseDTO.success(plan);
        } catch (IllegalArgumentException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "Failed to update status: " + e.getMessage());
        }
    }

    /**
     * 1.7 更新旅行日期：PUT /api/travel-plans/{id}/dates
     */
    @PutMapping("/{id}/dates")
    public ResponseDTO updateDates(@PathVariable Long id, @RequestBody TravelPlanDateUpdateDTO request) {
        try {
            boolean hasStart = request.getStartDate() != null && !request.getStartDate().trim().isEmpty();
            boolean hasEnd = request.getEndDate() != null && !request.getEndDate().trim().isEmpty();

            if (!hasStart && !hasEnd) {
                return ResponseDTO.error(400, "startDate 和 endDate 不能同时为空");
            }

            TravelPlan plan = travelPlanService.updateTravelPlanDates(id, request.getStartDate(), request.getEndDate());
            if (plan == null) {
                return ResponseDTO.error(404, "Travel plan not found");
            }
            return ResponseDTO.success(plan);
        } catch (Exception e) {
            return ResponseDTO.error(500, "Failed to update dates: " + e.getMessage());
        }
    }

    /**
     * 1.5 按状态获取旅行计划：GET /api/travel-plans/user/{userId}/status/{status}
     */
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseDTO getTravelPlansByStatus(@PathVariable Long userId, @PathVariable String status) {
        List<TravelPlan> plans = travelPlanService.getUserTravelPlansByStatus(userId, status);

        Map<String, Object> data = new HashMap<>();
        data.put("userId", userId);
        data.put("status", status);
        data.put("total", plans.size());
        data.put("travelPlans", plans);

        return ResponseDTO.success(data);
    }

    /**
     * 1.6 删除旅行计划：DELETE /api/travel-plans/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseDTO deleteTravelPlan(@PathVariable Long id) {
        boolean deleted = travelPlanService.deleteTravelPlan(id);
        if (!deleted) {
            return ResponseDTO.error(404, "Travel plan not found");
        }
        return ResponseDTO.success(null);
    }

    /**
     * 1.8 获取需要提醒的旅行计划：GET /api/travel-plans/user/{userId}/reminders?currentDate=yyyy-MM-dd
     */
    @GetMapping("/user/{userId}/reminders")
    public ResponseDTO getReminderTravelPlans(@PathVariable Long userId,
                                              @RequestParam(required = false) String currentDate) {
        java.time.LocalDate date = null;
        if (currentDate != null && !currentDate.trim().isEmpty()) {
            try {
                date = java.time.LocalDate.parse(currentDate.trim());
            } catch (Exception e) {
                return ResponseDTO.error(400, "currentDate 格式错误，应为 yyyy-MM-dd");
            }
        }

        java.util.List<TravelPlan> plans = travelPlanService.getReminderTravelPlans(userId, date);

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("userId", userId);
        data.put("currentDate", date != null ? date.toString() : null);
        data.put("total", plans.size());
        data.put("travelPlans", plans);

        return ResponseDTO.success(data);
    }

    /**
     * 1.9 获取用户总的旅行计划数量：GET /api/travel-plans/user/{userId}/total
     */
    @GetMapping("/user/{userId}/total")
    public ResponseDTO getUserTotalTravel(@PathVariable Long userId) {
        long total = travelPlanService.getUserTotalTravel(userId);
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("userId", userId);
        data.put("totalTravel", total);
        return ResponseDTO.success(data);
    }

    /**
     * 1.10 为旅行计划上传图片：POST /api/travel-plans/{id}/images
     */
    @PostMapping(value = "/{id}/images", consumes = {"multipart/form-data"})
    public ResponseDTO uploadTravelPlanImage(@PathVariable Long id,
                                             @RequestParam("file") MultipartFile file,
                                             @RequestParam(value = "description", required = false) String description) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseDTO.error(400, "上传文件不能为空");
            }
            byte[] data = file.getBytes();
            String contentType = file.getContentType();
            TravelPlanImage image = travelPlanService.addImageToPlan(id, data, contentType, description);

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("id", image.getId());
            result.put("travelPlanId", id);
            result.put("contentType", image.getContentType());
            result.put("description", image.getDescription());
            result.put("createdAt", image.getCreatedAt());

            return ResponseDTO.success(result);
        } catch (IllegalArgumentException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "上传图片失败: " + e.getMessage());
        }
    }

    /**
     * 1.11 获取旅行计划的图片列表（仅元信息）：GET /api/travel-plans/{id}/images
     */
    @GetMapping("/{id}/images")
    public ResponseDTO getTravelPlanImages(@PathVariable Long id) {
        java.util.List<TravelPlanImage> images = travelPlanService.getImagesByPlan(id);

        java.util.List<java.util.Map<String, Object>> list = new java.util.ArrayList<>();
        for (TravelPlanImage image : images) {
            java.util.Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", image.getId());
            item.put("travelPlanId", id);
            item.put("contentType", image.getContentType());
            item.put("description", image.getDescription());
            item.put("createdAt", image.getCreatedAt());
            // 构建图片访问URL
            item.put("url", "/api/travel-plans/images/" + image.getId() + "/content");
            list.add(item);
        }

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("travelPlanId", id);
        data.put("total", list.size());
        data.put("images", list);

        return ResponseDTO.success(data);
    }

    /**
     * 1.11.1 获取适合发布游记使用的图片 URL 列表：GET /api/travel-plans/{id}/images/urls-for-post
     *
     * 用途：在“我的行程详情 > 我的图库”点击“一键游记”时，
     * 前端可以调用此接口，一次性获得该行程图库中所有图片的访问 URL，
     * 直接作为发布游记页面中 PostCreateRequest.images 的初始值。
     */
    @GetMapping("/{id}/images/urls-for-post")
    public ResponseDTO getTravelPlanImageUrlsForPost(@PathVariable Long id) {
        List<TravelPlanImage> images = travelPlanService.getImagesByPlan(id);
        List<String> imageUrls = new ArrayList<>();
        for (TravelPlanImage image : images) {
            if (image == null || image.getId() == null) {
                continue;
            }
            String url = "/api/travel-plans/images/" + image.getId() + "/content";
            imageUrls.add(url);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", id);
        data.put("imageUrls", imageUrls);
        data.put("total", imageUrls.size());

        return ResponseDTO.success(data);
    }


    /**
     * 1.12 获取图片内容：GET /api/travel-plans/images/{imageId}/content
     */
    @GetMapping("/images/{imageId}/content")
    public ResponseEntity<byte[]> getTravelPlanImageContent(@PathVariable Long imageId) {
        TravelPlanImage image = travelPlanService.getTravelPlanImageById(imageId);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, image.getContentType())
                .body(image.getImageData());
    }

    /**
     * 1.13 分享旅行计划给AI助手：POST /api/travel-plans/{id}/share-to-ai
     */
    @PostMapping("/{id}/share-to-ai")
    public ResponseDTO shareTravelPlanToAI(
            @PathVariable Long id,
            @RequestBody(required = false) ShareToAIRequest request) {
        
        try {
            TravelPlan plan = travelPlanService.getTravelPlanById(id);
            if (plan == null) {
                return ResponseDTO.error(404, "Travel plan not found");
            }

            // 设置默认值
            if (request == null) {
                request = new ShareToAIRequest();
            }
            if (request.getTravelPlanId() == null) {
                request.setTravelPlanId(id);
            }
            if (request.getUserId() == null) {
                request.setUserId(plan.getUserId().toString());
            }

            // 构建分享上下文
            String shareContext = travelPlanService.buildShareToAIContext(
                id,
                request.getPurpose(),
                request.getMessage()
            );

            if (shareContext == null) {
                return ResponseDTO.error(500, "Failed to build share context");
            }

            // 生成或使用现有会话ID
            String sessionId = request.getSessionId();
            if (sessionId == null || sessionId.trim().isEmpty()) {
                // 🔧 不再使用 share_plan_xxx，改为与前端 AiPage_N8N 一致的格式：userId_时间戳
                // 这样前端不会在初始化时清理掉该 sessionId，分享后的对话可以继续复用同一会话
                String userIdStr = request.getUserId();
                if (userIdStr == null || userIdStr.trim().isEmpty()) {
                    userIdStr = plan.getUserId() != null ? plan.getUserId().toString() : "guest";
                }
                sessionId = userIdStr + "_" + System.currentTimeMillis();
            }

            // 调用ChatService发送给AI
            com.example.auth.dto.ChatRequest chatRequest = new com.example.auth.dto.ChatRequest();
            chatRequest.setSessionId(sessionId);
            chatRequest.setUserId(request.getUserId());
            chatRequest.setChatInput(shareContext);
            chatRequest.setOriginalTravelPlanId(id); // 传递原始计划ID，用于更新

            com.example.auth.dto.ChatResponse chatResponse = chatService.sendMessage(chatRequest);

            // 构建返回数据
            Map<String, Object> data = new HashMap<>();
            data.put("travelPlanId", id);
            data.put("sessionId", sessionId);
            data.put("aiReply", chatResponse.getReply());
            data.put("sharedAt", java.time.LocalDateTime.now());
            
            // 如果AI返回了旅行计划（优化建议），也一并返回
            if (chatResponse.getTravelPlan() != null) {
                data.put("optimizedPlan", chatResponse.getTravelPlan());
                data.put("travelPlanId", chatResponse.getTravelPlanId());
            }

            data.put("message", "旅行计划已成功分享给AI助手");

            return ResponseDTO.success(data);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDTO.error(500, "分享失败: " + e.getMessage());
        }
    }

    /**
     * 1.15 重新排序行程活动：POST /api/travel-plans/{id}/reorder-itineraries
     * 支持同一天内排序和跨天移动
     */
    @PostMapping("/{id}/reorder-itineraries")
    public ResponseDTO reorderItineraries(
            @PathVariable Long id,
            @RequestBody ReorderItineraryRequest request) {
        
        try {
            // 验证参数
            if (request.getActivities() == null || request.getActivities().isEmpty()) {
                return ResponseDTO.error(400, "活动列表不能为空");
            }

            travelPlanService.reorderItineraries(id, request.getActivities());

            Map<String, Object> data = new HashMap<>();
            data.put("travelPlanId", id);
            data.put("updatedCount", request.getActivities().size());
            data.put("message", "行程活动排序已更新");

            return ResponseDTO.success(data);

        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDTO.error(500, "更新排序失败: " + e.getMessage());
        }
    }

    /**
     * 获取旅行计划的城市信息（省份+城市格式）
     * GET /api/travel-plans/{id}/cities
     * 
     * @param id 旅行计划ID
     * @return 包含每天访问的城市信息（省份+城市格式）
     */
    @GetMapping("/{id}/cities")
    public ResponseDTO getTravelPlanCities(@PathVariable Long id) {
        try {
            // 1. 获取旅行计划
            TravelPlan travelPlan = travelPlanService.getTravelPlanById(id);
            if (travelPlan == null) {
                return ResponseDTO.error(404, "旅行计划不存在");
            }

            // 2. 获取该旅行计划的所有日程
            List<DailyItinerary> dailyItineraries = dailyItineraryRepository
                    .findByTravelPlanIdOrderByDayNumberAsc(id);

            // 3. 构建城市信息列表
            List<TravelPlanCityDTO.CityInfo> cityInfoList = new ArrayList<>();
            
            for (DailyItinerary itinerary : dailyItineraries) {
                String city = itinerary.getCity();
                
                // 跳过空城市
                if (city == null || city.trim().isEmpty()) {
                    continue;
                }
                
                // 获取省份信息
                String province = cityProvinceService.getProvince(city);
                String fullLocation = cityProvinceService.getFullLocation(city);
                
                TravelPlanCityDTO.CityInfo cityInfo = new TravelPlanCityDTO.CityInfo(
                    itinerary.getDayNumber(),
                    city,
                    province,
                    fullLocation
                );
                
                cityInfoList.add(cityInfo);
            }

            // 4. 去重：同一个城市只保留第一次出现的记录
            List<TravelPlanCityDTO.CityInfo> uniqueCities = cityInfoList.stream()
                    .collect(Collectors.toMap(
                        TravelPlanCityDTO.CityInfo::getCity,
                        cityInfo -> cityInfo,
                        (existing, replacement) -> existing // 保留第一次出现的
                    ))
                    .values()
                    .stream()
                    .sorted((a, b) -> a.getDayNumber().compareTo(b.getDayNumber()))
                    .collect(Collectors.toList());

            // 5. 构建返回结果
            TravelPlanCityDTO result = new TravelPlanCityDTO(
                travelPlan.getId(),
                travelPlan.getTitle(),
                uniqueCities
            );

            return ResponseDTO.success(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDTO.error(500, "获取城市信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取旅行计划的城市列表（仅返回省份+城市字符串数组）
     * GET /api/travel-plans/{id}/city-list
     * 
     * @param id 旅行计划ID
     * @return 省份+城市格式的字符串数组
     */
    @GetMapping("/{id}/city-list")
    public ResponseDTO getTravelPlanCityList(@PathVariable Long id) {
        try {
            // 1. 获取旅行计划
            TravelPlan travelPlan = travelPlanService.getTravelPlanById(id);
            if (travelPlan == null) {
                return ResponseDTO.error(404, "旅行计划不存在");
            }

            // 2. 获取该旅行计划的所有日程
            List<DailyItinerary> dailyItineraries = dailyItineraryRepository
                    .findByTravelPlanIdOrderByDayNumberAsc(id);

            // 3. 提取城市并转换为"省份+城市"格式
            List<String> cityList = dailyItineraries.stream()
                    .map(DailyItinerary::getCity)
                    .filter(city -> city != null && !city.trim().isEmpty())
                    .distinct() // 去重
                    .map(city -> cityProvinceService.getFullLocation(city))
                    .collect(Collectors.toList());

            Map<String, Object> data = new HashMap<>();
            data.put("travelPlanId", id);
            data.put("title", travelPlan.getTitle());
            data.put("cities", cityList);
            data.put("totalCities", cityList.size());

            return ResponseDTO.success(data);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDTO.error(500, "获取城市列表失败: " + e.getMessage());
        }
    }

}

package com.example.auth.controller;

import com.example.auth.dto.ActivityCreateDTO;
import com.example.auth.dto.ActivitySortDTO;
import com.example.auth.dto.ActivityUpdateDTO;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.entity.DailyItinerary;
import com.example.auth.entity.ItineraryActivity;
import com.example.auth.repository.DailyItineraryRepository;
import com.example.auth.repository.ItineraryActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*")
public class ItineraryActivityController {

    @Autowired
    private ItineraryActivityRepository itineraryActivityRepository;

    @Autowired
    private DailyItineraryRepository dailyItineraryRepository;

    /**
     * 3.1 获取某天的所有活动：GET /api/activities/daily-itinerary/{dailyItineraryId}
     */
    @GetMapping("/daily-itinerary/{dailyItineraryId}")
    public ResponseDTO getByDailyItinerary(@PathVariable Long dailyItineraryId) {
        List<ItineraryActivity> list = itineraryActivityRepository.findByDailyItineraryIdOrderBySortOrderAsc(dailyItineraryId);

        Map<String, Object> data = new HashMap<>();
        data.put("dailyItineraryId", dailyItineraryId);
        data.put("total", list.size());
        data.put("activities", list);

        return ResponseDTO.success(data);
    }

    /**
     * 3.2 获取活动详情：GET /api/activities/{id}
     */
    @GetMapping("/itinerary/{id}")
    public ResponseDTO getById(@PathVariable Long id) {
        return itineraryActivityRepository.findById(id)
                .map(ResponseDTO::success)
                .orElseGet(() -> ResponseDTO.error(404, "Activity not found"));
    }

    /**
     * 3.3 创建新活动：POST /api/activities
     */
    @PostMapping
    public ResponseDTO createActivity(@RequestBody ActivityCreateDTO dto) {
        if (dto.getDailyItineraryId() == null) {
            return ResponseDTO.error(400, "dailyItineraryId is required");
        }

        DailyItinerary dailyItinerary = dailyItineraryRepository.findById(dto.getDailyItineraryId())
                .orElse(null);
        if (dailyItinerary == null) {
            return ResponseDTO.error(404, "DailyItinerary not found");
        }

        ItineraryActivity activity = new ItineraryActivity();
        activity.setDailyItinerary(dailyItinerary);
        activity.setActivityTime(dto.getActivityTime());
        activity.setActivityName(dto.getActivityName());
        activity.setLocation(dto.getLocation());
        activity.setDescription(dto.getDescription());
        activity.setCost(dto.getCost());
        activity.setTransportation(dto.getTransportation());
        activity.setPhotoUrl(dto.getPhotoUrl());
        activity.setSortOrder(dto.getSortOrder());
        activity.setIsCustomized(true);

        ItineraryActivity saved = itineraryActivityRepository.save(activity);

        Map<String, Object> data = new HashMap<>();
        data.put("activity", saved);
        data.put("message", "活动创建成功");

        return ResponseDTO.success(data);
    }

    /**
     * 3.4 更新活动信息：PUT /api/activities/{id}
     */
    @PutMapping("/{id}")
    public ResponseDTO updateActivity(@PathVariable Long id, @RequestBody ActivityUpdateDTO dto) {
        return itineraryActivityRepository.findById(id)
                .map(activity -> {
                    if (dto.getActivityTime() != null) {
                        activity.setActivityTime(dto.getActivityTime());
                    }
                    if (dto.getActivityName() != null) {
                        activity.setActivityName(dto.getActivityName());
                    }
                    if (dto.getLocation() != null) {
                        activity.setLocation(dto.getLocation());
                    }
                    if (dto.getDescription() != null) {
                        activity.setDescription(dto.getDescription());
                    }
                    if (dto.getCost() != null) {
                        activity.setCost(dto.getCost());
                    }
                    if (dto.getTransportation() != null) {
                        activity.setTransportation(dto.getTransportation());
                    }
                    if (dto.getPhotoUrl() != null) {
                        activity.setPhotoUrl(dto.getPhotoUrl());
                    }
                    if (dto.getSortOrder() != null) {
                        activity.setSortOrder(dto.getSortOrder());
                    }

                    ItineraryActivity saved = itineraryActivityRepository.save(activity);
                    return ResponseDTO.success(saved);
                })
                .orElseGet(() -> ResponseDTO.error(404, "Activity not found"));
    }

    /**
     * 3.5 删除活动：DELETE /api/activities/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseDTO deleteActivity(@PathVariable Long id) {
        return itineraryActivityRepository.findById(id)
                .map(activity -> {
                    itineraryActivityRepository.delete(activity);
                    return ResponseDTO.success(null);
                })
                .orElseGet(() -> ResponseDTO.error(404, "Activity not found"));
    }

    /**
     * 3.6 调整活动顺序：PUT /api/activities/daily-itinerary/{dailyItineraryId}/sort
     */
    @PutMapping("/daily-itinerary/{dailyItineraryId}/sort")
    public ResponseDTO sortActivities(@PathVariable Long dailyItineraryId, @RequestBody ActivitySortDTO dto) {
        DailyItinerary dailyItinerary = dailyItineraryRepository.findById(dailyItineraryId)
                .orElse(null);
        if (dailyItinerary == null) {
            return ResponseDTO.error(404, "DailyItinerary not found");
        }

        if (dto.getActivityIds() == null || dto.getActivityIds().isEmpty()) {
            return ResponseDTO.error(400, "activityIds is required");
        }

        List<ItineraryActivity> activities = itineraryActivityRepository.findByDailyItineraryIdOrderBySortOrderAsc(dailyItineraryId);

        Map<Long, ItineraryActivity> activityMap = new HashMap<>();
        for (ItineraryActivity activity : activities) {
            activityMap.put(activity.getId(), activity);
        }

        int sortOrder = 0;
        for (Long activityId : dto.getActivityIds()) {
            ItineraryActivity activity = activityMap.get(activityId);
            if (activity != null) {
                activity.setSortOrder(sortOrder++);
            }
        }

        itineraryActivityRepository.saveAll(activities);

        return ResponseDTO.success(null);
    }

    /**
     * 3.7 按时间段获取活动：GET /api/activities/daily-itinerary/{dailyItineraryId}/by-time
     */
    @GetMapping("/daily-itinerary/{dailyItineraryId}/by-time")
    public ResponseDTO getActivitiesByTime(@PathVariable Long dailyItineraryId) {
        List<ItineraryActivity> activities = itineraryActivityRepository.findByDailyItineraryIdOrderBySortOrderAsc(dailyItineraryId);

        Map<String, List<Map<String, Object>>> grouped = new HashMap<>();

        for (ItineraryActivity activity : activities) {
            String activityTime = activity.getActivityTime();
            String period = resolveTimePeriod(activityTime);

            List<Map<String, Object>> list = grouped.computeIfAbsent(period, k -> new java.util.ArrayList<>());

            Map<String, Object> simple = new HashMap<>();
            simple.put("id", activity.getId());
            simple.put("activityName", activity.getActivityName());
            simple.put("activityTime", activity.getActivityTime());
            list.add(simple);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("dailyItineraryId", dailyItineraryId);
        data.put("activitiesByTime", grouped);

        return ResponseDTO.success(data);
    }

    private String resolveTimePeriod(String activityTime) {
        if (activityTime == null || !activityTime.contains("-")) {
            return "其他";
        }

        try {
            String start = activityTime.split("-")[0];
            int hour = Integer.parseInt(start.split(":")[0]);

            if (hour < 12) {
                return "上午 (09:00-12:00)";
            } else if (hour < 18) {
                return "下午 (14:00-18:00)";
            } else {
                return "晚上";
            }
        } catch (Exception e) {
            return "其他";
        }
    }
}

package com.example.auth.service;

import com.example.auth.dto.TravelPlanDTO;
import com.example.auth.entity.*;
import com.example.auth.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TravelPlanService {

    @Autowired
    private TravelPlanRepository travelPlanRepository;

    @Autowired
    private DailyItineraryRepository dailyItineraryRepository;

    @Autowired
    private ItineraryActivityRepository itineraryActivityRepository;

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private AttractionRepository attractionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TravelPlanImageRepository travelPlanImageRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public TravelPlan saveTravelPlanFromN8n(TravelPlanDTO.TravelPlanData dto, Long userId) {
        // Create TravelPlan entity
        TravelPlan travelPlan = new TravelPlan();
        travelPlan.setUserId(userId);
        travelPlan.setTitle(dto.getTitle());
        travelPlan.setDestination(dto.getDestination());
        travelPlan.setTravelDays(extractInteger(dto.getTravelDays()));
        travelPlan.setTotalBudget(extractBigDecimal(dto.getTotalBudget()));
        travelPlan.setTotalTips(dto.getTotalTips());
        travelPlan.setSpecialRequirements(dto.getSpecialRequirements());
        travelPlan.setStatus(TravelPlan.TravelPlanStatus.draft);
        
        // Parse date range (format: "2025.01.02-2025.01.04") and set startDate/endDate
        if (dto.getDate() != null && !dto.getDate().isEmpty()) {
            String[] parts = dto.getDate().split("-");
            if (parts.length >= 1) {
                String startDateStr = parts[0].trim();
                travelPlan.setStartDate(parseLocalDate(startDateStr));
            }
            if (parts.length >= 2) {
                String endDateStr = parts[1].trim();
                travelPlan.setEndDate(parseLocalDate(endDateStr));
            } else if (parts.length == 1) {
                // 如果只有一个日期，则视为起止日期相同
                travelPlan.setEndDate(travelPlan.getStartDate());
            }
        }

        // Save travel plan first to get ID
        travelPlan = travelPlanRepository.save(travelPlan);

        List<ItineraryActivity> savedActivities = new java.util.ArrayList<>();

        // Save daily itineraries and activities
        if (dto.getDailyItinerary() != null) {
            for (TravelPlanDTO.DailyItineraryDTO dailyDTO : dto.getDailyItinerary()) {
                DailyItinerary dailyItinerary = new DailyItinerary();
                dailyItinerary.setTravelPlan(travelPlan);
                dailyItinerary.setDayNumber(dailyDTO.getDay());
                
                // Parse date (format: "2025.01.02")
                if (dailyDTO.getDate() != null && !dailyDTO.getDate().isEmpty()) {
                    try {
                        String rawDate = dailyDTO.getDate().trim();
                        if (rawDate.contains(".")) {
                            dailyItinerary.setDate(parseLocalDate(rawDate));
                        } else {
                            dailyItinerary.setDate(LocalDate.parse(rawDate));
                        }
                    } catch (Exception ignored) {
                    }
                }
                
                // Get city from first activity if available
                if (dailyDTO.getActivities() != null && !dailyDTO.getActivities().isEmpty()) {
                    dailyItinerary.setCity(dailyDTO.getActivities().get(0).getCity());
                }

                dailyItinerary = dailyItineraryRepository.save(dailyItinerary);

                // Save activities
                if (dailyDTO.getActivities() != null) {
                    int sortOrder = 0;
                    for (TravelPlanDTO.ActivityDTO activityDTO : dailyDTO.getActivities()) {
                        ItineraryActivity activity = new ItineraryActivity();
                        activity.setDailyItinerary(dailyItinerary);
                        activity.setActivityTime(activityDTO.getTime());
                        activity.setActivityName(activityDTO.getActivity());
                        activity.setLocation(activityDTO.getLocation());
                        activity.setDescription(activityDTO.getDescription());
                        activity.setCost(extractBigDecimal(activityDTO.getCost()));
                        activity.setTransportation(activityDTO.getTransportation());
                        activity.setPhotoUrl(activityDTO.getPhotoUrl());
                        activity.setSortOrder(sortOrder++);
                        activity.setIsCustomized(false);

                        ItineraryActivity savedActivity = itineraryActivityRepository.save(activity);
                        savedActivities.add(savedActivity);
                    }
                }
            }
        }

        // Save accommodations
        if (dto.getAccommodationRecommendations() != null) {
            for (TravelPlanDTO.AccommodationDTO accDTO : dto.getAccommodationRecommendations()) {
                Accommodation accommodation = new Accommodation();
                accommodation.setTravelPlan(travelPlan);
                accommodation.setName(accDTO.getName());
                
                // Map type string to enum
                Accommodation.AccommodationType type = mapAccommodationType(accDTO.getType());
                accommodation.setType(type);
                
                accommodation.setLocation(accDTO.getLocation());
                accommodation.setPricePerNight(extractBigDecimal(accDTO.getPricePerNight()));
                accommodation.setAdvantages(accDTO.getAdvantages());
                accommodation.setPhoto(accDTO.getPhoto());
                accommodation.setIsSelected(false);

                accommodationRepository.save(accommodation);
            }
        }

        if (dto.getAttractionDetails() != null && !savedActivities.isEmpty()) {
            for (TravelPlanDTO.AttractionDTO attractionDTO : dto.getAttractionDetails()) {
                ItineraryActivity matchedActivity = findMatchingActivity(savedActivities, attractionDTO);
                if (matchedActivity == null) {
                    continue;
                }

                Long activityId = matchedActivity.getId();
                if (activityId == null) {
                    continue;
                }

                Attraction attraction = attractionRepository.findById(activityId).orElse(new Attraction());
                if (attraction.getId() == null) {
                    attraction.setId(activityId);
                }

                attraction.setName(attractionDTO.getName());

                if (attractionDTO.getTicketPrice() != null) {
                    attraction.setTicketPriceAdult(extractBigDecimal(attractionDTO.getTicketPrice().getAdult()));
                    attraction.setTicketPriceStudent(extractBigDecimal(attractionDTO.getTicketPrice().getStudent()));
                    attraction.setTicketPriceElderly(extractBigDecimal(attractionDTO.getTicketPrice().getElderly()));
                }

                if (attractionDTO.getLogLat() != null && !attractionDTO.getLogLat().isEmpty()) {
                    String[] coords = attractionDTO.getLogLat().split(",");
                    if (coords.length == 2) {
                        attraction.setLongitude(new BigDecimal(coords[0].trim()));
                        attraction.setLatitude(new BigDecimal(coords[1].trim()));
                    }
                }

                attraction.setOpeningHours(attractionDTO.getOpeningHours());

                if (attractionDTO.getMustSeeSpots() != null) {
                    try {
                        attraction.setMustSeeSpots(objectMapper.writeValueAsString(attractionDTO.getMustSeeSpots()));
                    } catch (JsonProcessingException e) {
                        attraction.setMustSeeSpots("[]");
                    }
                }

                attraction.setTips(attractionDTO.getTips());
                attraction.setPhotoUrl(attractionDTO.getPhoto());
                
                // 如果 AttractionDTO 中有图片，同步更新 Activity 中的图片
                if (attractionDTO.getPhoto() != null && !attractionDTO.getPhoto().isEmpty()) {
                    matchedActivity.setPhotoUrl(attractionDTO.getPhoto());
                    itineraryActivityRepository.save(matchedActivity);
                }

                attractionRepository.save(attraction);
            }
        }

        updateUserTotalTravel(userId);

        return travelPlan;
    }

    /**
     * 更新现有旅行计划（从n8n返回的数据）
     * 会删除旧的行程和住宿数据，用新数据替换
     */
    @Transactional
    public TravelPlan updateTravelPlanFromN8n(TravelPlanDTO.TravelPlanData dto, Long userId, Long travelPlanId) {
        // 获取现有计划
        TravelPlan travelPlan = getTravelPlanById(travelPlanId);
        if (travelPlan == null) {
            throw new RuntimeException("旅行计划不存在: " + travelPlanId);
        }
        
        // 验证用户权限
        if (!travelPlan.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改此旅行计划");
        }
        
        // 删除旧的每日行程（级联删除会自动删除活动和景点）
        List<DailyItinerary> oldItineraries = dailyItineraryRepository.findByTravelPlan(travelPlan);
        dailyItineraryRepository.deleteAll(oldItineraries);
        
        // 删除旧的住宿推荐
        List<Accommodation> oldAccommodations = accommodationRepository.findByTravelPlan(travelPlan);
        accommodationRepository.deleteAll(oldAccommodations);
        
        // 更新基本信息
        // 标题可以使用AI优化后的标题
        if (dto.getTitle() != null && !dto.getTitle().trim().isEmpty()) {
            travelPlan.setTitle(dto.getTitle());
        }
        // 目的地保持原有值，避免AI错误地切换城市（例如把济南改成西安）
        // 如后续需要支持修改目的地，可在单独的业务流程中显式处理
        travelPlan.setTravelDays(extractInteger(dto.getTravelDays()));
        travelPlan.setTotalBudget(extractBigDecimal(dto.getTotalBudget()));
        travelPlan.setTotalTips(dto.getTotalTips());
        travelPlan.setSpecialRequirements(dto.getSpecialRequirements());
        
        // 解析日期范围
        if (dto.getDate() != null && !dto.getDate().isEmpty()) {
            String[] parts = dto.getDate().split("-");
            if (parts.length >= 1) {
                String startDateStr = parts[0].trim();
                travelPlan.setStartDate(parseLocalDate(startDateStr));
            }
            if (parts.length >= 2) {
                String endDateStr = parts[1].trim();
                travelPlan.setEndDate(parseLocalDate(endDateStr));
            } else if (parts.length == 1) {
                travelPlan.setEndDate(travelPlan.getStartDate());
            }
        }
        
        // 保存更新后的基本信息
        travelPlan = travelPlanRepository.save(travelPlan);
        
        List<ItineraryActivity> savedActivities = new java.util.ArrayList<>();
        
        // 保存新的每日行程和活动
        if (dto.getDailyItinerary() != null) {
            for (TravelPlanDTO.DailyItineraryDTO dailyDTO : dto.getDailyItinerary()) {
                DailyItinerary dailyItinerary = new DailyItinerary();
                dailyItinerary.setTravelPlan(travelPlan);
                dailyItinerary.setDayNumber(dailyDTO.getDay());
                
                if (dailyDTO.getDate() != null && !dailyDTO.getDate().isEmpty()) {
                    dailyItinerary.setDate(LocalDate.parse(dailyDTO.getDate().replace(".", "-")));
                }
                
                if (dailyDTO.getActivities() != null && !dailyDTO.getActivities().isEmpty()) {
                    dailyItinerary.setCity(dailyDTO.getActivities().get(0).getCity());
                }
                
                dailyItinerary = dailyItineraryRepository.save(dailyItinerary);
                
                // 保存活动
                if (dailyDTO.getActivities() != null) {
                    int sortOrder = 0;
                    for (TravelPlanDTO.ActivityDTO activityDTO : dailyDTO.getActivities()) {
                        ItineraryActivity activity = new ItineraryActivity();
                        activity.setDailyItinerary(dailyItinerary);
                        activity.setActivityTime(activityDTO.getTime());
                        activity.setActivityName(activityDTO.getActivity());
                        activity.setLocation(activityDTO.getLocation());
                        activity.setDescription(activityDTO.getDescription());
                        activity.setCost(extractBigDecimal(activityDTO.getCost()));
                        activity.setTransportation(activityDTO.getTransportation());
                        activity.setPhotoUrl(activityDTO.getPhotoUrl());
                        activity.setSortOrder(sortOrder++);
                        activity.setIsCustomized(false);
                        
                        ItineraryActivity savedActivity = itineraryActivityRepository.save(activity);
                        savedActivities.add(savedActivity);
                    }
                }
            }
        }
        
        // 保存新的住宿推荐
        if (dto.getAccommodationRecommendations() != null) {
            for (TravelPlanDTO.AccommodationDTO accDTO : dto.getAccommodationRecommendations()) {
                Accommodation accommodation = new Accommodation();
                accommodation.setTravelPlan(travelPlan);
                accommodation.setName(accDTO.getName());
                accommodation.setType(mapAccommodationType(accDTO.getType()));
                accommodation.setLocation(accDTO.getLocation());
                accommodation.setPricePerNight(extractBigDecimal(accDTO.getPricePerNight()));
                accommodation.setAdvantages(accDTO.getAdvantages());
                accommodation.setPhoto(accDTO.getPhoto());
                accommodation.setIsSelected(false);
                
                accommodationRepository.save(accommodation);
            }
        }
        
        // 保存景点详情
        if (dto.getAttractionDetails() != null && !savedActivities.isEmpty()) {
            for (TravelPlanDTO.AttractionDTO attractionDTO : dto.getAttractionDetails()) {
                ItineraryActivity matchedActivity = findMatchingActivity(savedActivities, attractionDTO);
                if (matchedActivity == null) {
                    continue;
                }
                
                Long activityId = matchedActivity.getId();
                if (activityId == null) {
                    continue;
                }
                
                // Attraction使用Activity的ID作为主键（共享主键）
                Attraction attraction = attractionRepository.findById(activityId).orElse(new Attraction());
                if (attraction.getId() == null) {
                    attraction.setId(activityId);
                }
                
                attraction.setName(attractionDTO.getName());
                
                if (attractionDTO.getTicketPrice() != null) {
                    attraction.setTicketPriceAdult(extractBigDecimal(attractionDTO.getTicketPrice().getAdult()));
                    attraction.setTicketPriceStudent(extractBigDecimal(attractionDTO.getTicketPrice().getStudent()));
                    attraction.setTicketPriceElderly(extractBigDecimal(attractionDTO.getTicketPrice().getElderly()));
                }
                
                if (attractionDTO.getLogLat() != null && !attractionDTO.getLogLat().isEmpty()) {
                    String[] coords = attractionDTO.getLogLat().split(",");
                    if (coords.length == 2) {
                        attraction.setLongitude(new BigDecimal(coords[0].trim()));
                        attraction.setLatitude(new BigDecimal(coords[1].trim()));
                    }
                }
                
                attraction.setOpeningHours(attractionDTO.getOpeningHours());
                
                if (attractionDTO.getMustSeeSpots() != null) {
                    try {
                        attraction.setMustSeeSpots(objectMapper.writeValueAsString(attractionDTO.getMustSeeSpots()));
                    } catch (JsonProcessingException e) {
                        attraction.setMustSeeSpots("[]");
                    }
                }
                
                attraction.setTips(attractionDTO.getTips());
                attraction.setPhotoUrl(attractionDTO.getPhoto());
                
                if (attractionDTO.getPhoto() != null && !attractionDTO.getPhoto().isEmpty()) {
                    matchedActivity.setPhotoUrl(attractionDTO.getPhoto());
                    itineraryActivityRepository.save(matchedActivity);
                }
                
                attractionRepository.save(attraction);
            }
        }
        
        System.out.println("✅ 旅行计划已更新，ID: " + travelPlan.getId());
        return travelPlan;
    }

    private ItineraryActivity findMatchingActivity(List<ItineraryActivity> activities,
                                                   TravelPlanDTO.AttractionDTO attractionDTO) {
        if (attractionDTO == null || activities == null || activities.isEmpty()) {
            return null;
        }
        String name = attractionDTO.getName();
        if (name == null || name.trim().isEmpty()) {
            return null;
        }

        for (ItineraryActivity activity : activities) {
            if (activity.getLocation() != null && activity.getLocation().equals(name)) {
                return activity;
            }
            if (activity.getActivityName() != null && activity.getActivityName().equals(name)) {
                return activity;
            }
        }

        for (ItineraryActivity activity : activities) {
            if (activity.getLocation() != null && activity.getLocation().contains(name)) {
                return activity;
            }
            if (activity.getActivityName() != null && activity.getActivityName().contains(name)) {
                return activity;
            }
        }

        return null;
    }

    private LocalDate parseLocalDate(String dateStr) {
        try {
            // Format: "2025.01.02"
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");
            return LocalDate.parse(dateStr, formatter);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private Accommodation.AccommodationType mapAccommodationType(String type) {
        if (type == null) {
            return Accommodation.AccommodationType.经济型;
        }
        switch (type) {
            case "舒适型":
                return Accommodation.AccommodationType.舒适型;
            case "豪华型":
                return Accommodation.AccommodationType.豪华型;
            default:
                return Accommodation.AccommodationType.经济型;
        }
    }

    public List<TravelPlan> getUserTravelPlans(Long userId) {
        // 按创建时间降序返回，最新的在最前面
        return travelPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * 获取用户最新的旅行计划
     */
    public TravelPlan getLatestTravelPlan(Long userId) {
        return travelPlanRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
    }

    public TravelPlan getTravelPlanById(Long id) {
        return travelPlanRepository.findById(id).orElse(null);
    }

    /**
     * 获取旅行计划的第一张图片（按创建时间排序）
     */
    public TravelPlanImage getFirstImageByPlan(Long travelPlanId) {
        if (travelPlanId == null) {
            return null;
        }
        return travelPlanImageRepository
                .findFirstByTravelPlan_IdOrderByCreatedAtAsc(travelPlanId)
                .orElse(null);
    }

    /**
     * 从行程的每日活动中获取第一张非空的活动图片 URL，作为封面兜底
     */
    public String getFirstActivityPhotoUrl(Long travelPlanId) {
        if (travelPlanId == null) {
            return null;
        }

        List<DailyItinerary> dailyItineraries =
                dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(travelPlanId);
        if (dailyItineraries == null || dailyItineraries.isEmpty()) {
            return null;
        }

        for (DailyItinerary daily : dailyItineraries) {
            if (daily == null || daily.getActivities() == null) {
                continue;
            }
            for (ItineraryActivity activity : daily.getActivities()) {
                if (activity == null) {
                    continue;
                }
                String photoUrl = activity.getPhotoUrl();
                if (photoUrl != null && !photoUrl.trim().isEmpty()) {
                    return photoUrl;
                }
            }
        }

        return null;
    }

    @Transactional
    public TravelPlan updateTravelPlanDates(Long id, String startDateStr, String endDateStr) {
        TravelPlan plan = travelPlanRepository.findById(id).orElse(null);
        if (plan == null) {
            return null;
        }

        LocalDate newStart = plan.getStartDate();
        LocalDate newEnd = plan.getEndDate();

        if (startDateStr != null && !startDateStr.trim().isEmpty()) {
            newStart = LocalDate.parse(startDateStr.trim());
            plan.setStartDate(newStart);
        }
        if (endDateStr != null && !endDateStr.trim().isEmpty()) {
            newEnd = LocalDate.parse(endDateStr.trim());
            plan.setEndDate(newEnd);
        }

        Integer newTravelDays = null;
        if (newStart != null && newEnd != null) {
            long days = ChronoUnit.DAYS.between(newStart, newEnd) + 1;
            if (days > 0 && days <= Integer.MAX_VALUE) {
                newTravelDays = (int) days;
                plan.setTravelDays(newTravelDays);
            }
        }

        // 如果日期范围变长，则自动补充对应数量的日程记录
        if (newTravelDays != null) {
            List<DailyItinerary> existing = dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(id);
            int existingCount = existing != null ? existing.size() : 0;
            if (newTravelDays > existingCount) {
                LocalDate startDate = plan.getStartDate();
                for (int day = existingCount + 1; day <= newTravelDays; day++) {
                    DailyItinerary dailyItinerary = new DailyItinerary();
                    dailyItinerary.setTravelPlan(plan);
                    dailyItinerary.setDayNumber(day);
                    if (startDate != null) {
                        dailyItinerary.setDate(startDate.plusDays(day - 1));
                    }
                    dailyItineraryRepository.save(dailyItinerary);
                }
            }
        }

        return travelPlanRepository.save(plan);
    }

    public TravelPlan updateStatus(Long id, String status) {
        TravelPlan plan = travelPlanRepository.findById(id).orElse(null);
        if (plan == null) {
            return null;
        }

        TravelPlan.TravelPlanStatus newStatus;
        try {
            newStatus = TravelPlan.TravelPlanStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            // 允许使用小写枚举名，例如 "draft" / "active" / "completed"
            try {
                newStatus = TravelPlan.TravelPlanStatus.valueOf(status.toLowerCase());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid status: " + status + ". 可用值: draft/active/completed");
            }
        }

        plan.setStatus(newStatus);
        return travelPlanRepository.save(plan);
    }

    public List<TravelPlan> getUserTravelPlansByStatus(Long userId, String status) {
        TravelPlan.TravelPlanStatus enumStatus;
        try {
            enumStatus = TravelPlan.TravelPlanStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            enumStatus = TravelPlan.TravelPlanStatus.valueOf(status.toLowerCase());
        }
        return travelPlanRepository.findByUserIdAndStatus(userId, enumStatus);
    }

    public boolean deleteTravelPlan(Long id) {
        TravelPlan plan = travelPlanRepository.findById(id).orElse(null);
        if (plan == null) {
            return false;
        }
        Long userId = plan.getUserId();
        travelPlanRepository.delete(plan);
        updateUserTotalTravel(userId);
        return true;
    }

    public List<TravelPlan> getReminderTravelPlans(Long userId, LocalDate currentDate) {
        LocalDate today = currentDate != null ? currentDate : LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        
        // 返回开始日期是今天或明天的计划（状态为draft，即未开始执行）
        List<TravelPlan> todayPlans = travelPlanRepository.findByUserIdAndStartDateAndStatus(
                userId,
                today,
                TravelPlan.TravelPlanStatus.draft
        );
        
        List<TravelPlan> tomorrowPlans = travelPlanRepository.findByUserIdAndStartDateAndStatus(
                userId,
                tomorrow,
                TravelPlan.TravelPlanStatus.draft
        );
        
        // 合并两个列表
        List<TravelPlan> allPlans = new java.util.ArrayList<>(todayPlans);
        allPlans.addAll(tomorrowPlans);
        
        return allPlans;
    }

    private void updateUserTotalTravel(Long userId) {
        if (userId == null) {
            return;
        }
        userRepository.findById(userId).ifPresent(user -> {
            long count = travelPlanRepository.countByUserId(userId);
            user.setTotalTravel((int) count);
            userRepository.save(user);
        });
    }

    public long getUserTotalTravel(Long userId) {
        if (userId == null) {
            return 0L;
        }
        return travelPlanRepository.countByUserId(userId);
    }

    @Transactional
    public TravelPlanImage addImageToPlan(Long travelPlanId,
                                          byte[] imageData,
                                          String contentType,
                                          String description) {
        if (imageData == null || imageData.length == 0) {
            throw new IllegalArgumentException("图片数据不能为空");
        }
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId).orElse(null);
        if (travelPlan == null) {
            throw new IllegalArgumentException("Travel plan not found");
        }

        TravelPlanImage image = new TravelPlanImage();
        image.setTravelPlan(travelPlan);
        image.setImageData(imageData);
        image.setContentType(contentType);
        image.setDescription(description);

        return travelPlanImageRepository.save(image);
    }

    public List<TravelPlanImage> getImagesByPlan(Long travelPlanId) {
        return travelPlanImageRepository.findByTravelPlan_Id(travelPlanId);
    }

    public TravelPlanImage getTravelPlanImageById(Long imageId) {
        return travelPlanImageRepository.findById(imageId).orElse(null);
    }

    /**
     * 构建分享给AI的旅行计划卡片内容
     */
    public String buildShareToAIContext(Long travelPlanId, String purpose, String userMessage) {
        TravelPlan plan = getTravelPlanById(travelPlanId);
        if (plan == null) {
            return null;
        }

        List<DailyItinerary> dailyItineraries = 
            dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(travelPlanId);
        List<Accommodation> accommodations = 
            accommodationRepository.findByTravelPlanId(travelPlanId);

        StringBuilder context = new StringBuilder();
        
        // 根据分享目的添加不同的开场白
        if (purpose != null && !purpose.isEmpty()) {
            switch (purpose) {
                case "discuss":
                    context.append("我想和你讨论一下我的旅行计划：\n\n");
                    break;
                case "optimize":
                    context.append("我想请你帮我优化这个旅行计划：\n\n");
                    break;
                case "question":
                    context.append("关于这个旅行计划，我有一些问题想咨询：\n\n");
                    break;
                default:
                    context.append("这是我的旅行计划：\n\n");
            }
        } else {
            context.append("这是我的旅行计划：\n\n");
        }

        // 旅行计划卡片信息
        context.append("📋 【旅行计划卡片】\n");
        context.append("━━━━━━━━━━━━━━━━━━━━\n");
        context.append("✈️ 标题：").append(plan.getTitle()).append("\n");
        context.append("📍 目的地：").append(plan.getDestination()).append("\n");
        context.append("📅 旅行天数：").append(plan.getTravelDays()).append("天\n");
        
        if (plan.getStartDate() != null && plan.getEndDate() != null) {
            context.append("🗓️ 日期：").append(plan.getStartDate())
                   .append(" 至 ").append(plan.getEndDate()).append("\n");
        }
        
        if (plan.getTotalBudget() != null) {
            context.append("💰 总预算：¥").append(plan.getTotalBudget()).append("\n");
        }
        
        context.append("📊 状态：");
        switch (plan.getStatus()) {
            case draft:
                context.append("草稿");
                break;
            case active:
                context.append("进行中");
                break;
            case completed:
                context.append("已完成");
                break;
        }
        context.append("\n");
        
        if (plan.getSpecialRequirements() != null && !plan.getSpecialRequirements().isEmpty()) {
            context.append("⚠️ 特殊要求：").append(plan.getSpecialRequirements()).append("\n");
        }
        
        context.append("━━━━━━━━━━━━━━━━━━━━\n\n");

        // 详细行程
        context.append("📅 【详细行程】\n\n");
        for (DailyItinerary daily : dailyItineraries) {
            context.append("▶ 第").append(daily.getDayNumber()).append("天");
            if (daily.getDate() != null) {
                context.append(" (").append(daily.getDate()).append(")");
            }
            if (daily.getCity() != null) {
                context.append(" - ").append(daily.getCity());
            }
            context.append("\n");
            
            List<ItineraryActivity> activities = daily.getActivities();
            if (activities != null && !activities.isEmpty()) {
                for (ItineraryActivity activity : activities) {
                    context.append("  ⏰ ").append(activity.getActivityTime())
                           .append(" - ").append(activity.getActivityName());
                    
                    if (activity.getLocation() != null) {
                        context.append("\n     📍 地点：").append(activity.getLocation());
                    }
                    
                    if (activity.getDescription() != null && !activity.getDescription().isEmpty()) {
                        context.append("\n     📝 ").append(activity.getDescription());
                    }
                    
                    if (activity.getCost() != null && activity.getCost().compareTo(BigDecimal.ZERO) > 0) {
                        context.append("\n     💵 费用：¥").append(activity.getCost());
                    }
                    
                    if (activity.getTransportation() != null) {
                        context.append("\n     🚗 交通：").append(activity.getTransportation());
                    }
                    
                    if (Boolean.TRUE.equals(activity.getIsCustomized())) {
                        context.append("\n     ⭐ [用户自定义]");
                    }
                    
                    context.append("\n\n");
                }
            } else {
                context.append("  （暂无活动安排）\n\n");
            }
        }

        // 住宿信息
        if (accommodations != null && !accommodations.isEmpty()) {
            context.append("🏨 【住宿安排】\n\n");
            for (Accommodation acc : accommodations) {
                context.append("  • ").append(acc.getName());
                if (acc.getType() != null) {
                    context.append(" (").append(acc.getType()).append(")");
                }
                context.append("\n");
                
                if (acc.getLocation() != null) {
                    context.append("    📍 位置：").append(acc.getLocation()).append("\n");
                }
                
                if (acc.getPricePerNight() != null) {
                    context.append("    💰 价格：¥").append(acc.getPricePerNight()).append("/晚\n");
                }
                
                if (acc.getAdvantages() != null && !acc.getAdvantages().isEmpty()) {
                    context.append("    ✨ 优势：").append(acc.getAdvantages()).append("\n");
                }
                
                if (Boolean.TRUE.equals(acc.getIsSelected())) {
                    context.append("    ✅ 已选择\n");
                }
                
                context.append("\n");
            }
        }

        // 总体提示
        if (plan.getTotalTips() != null && !plan.getTotalTips().isEmpty()) {
            context.append("💡 【旅行提示】\n");
            context.append(plan.getTotalTips()).append("\n\n");
        }

        // 用户附加消息
        if (userMessage != null && !userMessage.trim().isEmpty()) {
            context.append("━━━━━━━━━━━━━━━━━━━━\n");
            context.append("💬 【我的问题/需求】\n");
            context.append(userMessage).append("\n");
        }

        // 额外约束：目的地必须保持为当前计划的目的地
        if (plan.getDestination() != null && !plan.getDestination().trim().isEmpty()) {
            context.append("\n⚠️ 请务必保持本次旅行计划的目的地为：")
                   .append(plan.getDestination())
                   .append("，不要替换为其他城市，只在上述计划的基础上进行调整。\n");
        }

        return context.toString();
    }

    /**
     * 自动完成已过期的旅行计划
     * 将所有结束日期早于今天且状态为active的计划改为completed
     */
    @Transactional
    public int autoCompleteExpiredPlans() {
        LocalDate today = LocalDate.now();
        List<TravelPlan> activePlans = travelPlanRepository.findByStatus(TravelPlan.TravelPlanStatus.active);
        
        int count = 0;
        for (TravelPlan plan : activePlans) {
            if (plan.getEndDate() != null && plan.getEndDate().isBefore(today)) {
                plan.setStatus(TravelPlan.TravelPlanStatus.completed);
                travelPlanRepository.save(plan);
                count++;
                System.out.println("✅ 自动完成旅行计划: " + plan.getId() + " - " + plan.getTitle());
            }
        }
        
        return count;
    }

    /**
     * 重新排序行程活动
     * 支持同一天内排序和跨天移动
     */
    @Transactional
    public void reorderItineraries(Long travelPlanId, List<com.example.auth.dto.ReorderItineraryRequest.ActivityItem> activities) {
        // 验证旅行计划是否存在
        TravelPlan plan = getTravelPlanById(travelPlanId);
        if (plan == null) {
            throw new RuntimeException("旅行计划不存在");
        }

        // 批量更新活动的dailyItinerary和sortOrder
        for (com.example.auth.dto.ReorderItineraryRequest.ActivityItem item : activities) {
            ItineraryActivity activity = itineraryActivityRepository.findById(item.getActivityId())
                    .orElseThrow(() -> new RuntimeException("活动不存在: " + item.getActivityId()));
            
            // 验证活动所属的每日行程是否属于该旅行计划
            if (!activity.getDailyItinerary().getTravelPlan().getId().equals(travelPlanId)) {
                throw new RuntimeException("活动不属于该旅行计划");
            }
            
            // 获取新的每日行程
            DailyItinerary newDailyItinerary = dailyItineraryRepository.findById(item.getDailyItineraryId())
                    .orElseThrow(() -> new RuntimeException("每日行程不存在: " + item.getDailyItineraryId()));
            
            // 验证新的每日行程属于该旅行计划
            if (!newDailyItinerary.getTravelPlan().getId().equals(travelPlanId)) {
                throw new RuntimeException("目标每日行程不属于该旅行计划");
            }
            
            activity.setDailyItinerary(newDailyItinerary);
            activity.setSortOrder(item.getSortOrder());
            itineraryActivityRepository.save(activity);
        }
        
        System.out.println("✅ 行程活动排序已更新，共更新 " + activities.size() + " 个活动");
    }

    /**
     * 从字符串中提取整数
     * 支持格式: "3天" -> 3, "三天" -> 3, "5" -> 5, null -> 1 (默认值)
     */
    private Integer extractInteger(String str) {
        if (str == null || str.trim().isEmpty()) {
            return 1; // 返回默认值1天，避免数据库NOT NULL约束错误
        }
        try {
            // 先处理中文数字
            str = convertChineseNumberToDigit(str);
            
            // 提取字符串中的第一个数字
            String numStr = str.replaceAll("[^0-9]", "");
            if (numStr.isEmpty()) {
                System.err.println("⚠️ 无法从字符串中提取整数: " + str + "，使用默认值1");
                return 1; // 返回默认值
            }
            return Integer.parseInt(numStr);
        } catch (Exception e) {
            System.err.println("⚠️ 无法从字符串中提取整数: " + str + "，使用默认值1");
            return 1; // 返回默认值
        }
    }
    
    /**
     * 将中文数字转换为阿拉伯数字
     * 支持: 一->1, 二->2, 三->3, 四->4, 五->5, 六->6, 七->7, 八->8, 九->9, 十->10
     */
    private String convertChineseNumberToDigit(String str) {
        if (str == null) {
            return "";
        }
        str = str.replace("一", "1");
        str = str.replace("二", "2");
        str = str.replace("三", "3");
        str = str.replace("四", "4");
        str = str.replace("五", "5");
        str = str.replace("六", "6");
        str = str.replace("七", "7");
        str = str.replace("八", "8");
        str = str.replace("九", "9");
        str = str.replace("十", "10");
        return str;
    }

    /**
     * 从字符串中提取BigDecimal
     * 支持格式: "5000元" -> 5000, "约200元" -> 200, "150.5" -> 150.5, null -> null
     */
    private BigDecimal extractBigDecimal(String str) {
        if (str == null || str.trim().isEmpty()) {
            return null;
        }
        try {
            // 移除所有非数字和小数点的字符
            String numStr = str.replaceAll("[^0-9.]", "");
            if (numStr.isEmpty()) {
                return null;
            }
            return new BigDecimal(numStr);
        } catch (Exception e) {
            System.err.println("⚠️ 无法从字符串中提取数字: " + str);
            return null;
        }
    }

}

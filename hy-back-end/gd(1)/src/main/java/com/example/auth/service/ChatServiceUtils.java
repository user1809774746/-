package com.example.auth.service;

import com.example.auth.dto.TravelPlanDTO;
import com.example.auth.entity.TravelPlan;
import com.example.auth.repository.TravelPlanRepository;
import com.example.auth.repository.DailyItineraryRepository;
import com.example.auth.repository.AccommodationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatServiceUtils {

    private final TravelPlanService travelPlanService;

    public Long persistTravelPlan(TravelPlanDTO.TravelPlanData travelPlanData, String userId, Long originalTravelPlanId) {
        System.out.println("📦 persistTravelPlan 被调用");
        System.out.println("   - travelPlanData: " + (travelPlanData != null ? "存在" : "null"));
        System.out.println("   - userId: " + userId);
        System.out.println("   - originalTravelPlanId: " + originalTravelPlanId);

        if (travelPlanData == null) {
            System.err.println("❌ persistTravelPlan: travelPlanData为null，无法保存");
            return null;
        }

        try {
            Long targetUserId = parseUserId(userId);
            System.out.println("   - 解析后的targetUserId: " + targetUserId);

            TravelPlan savedPlan;

            if (originalTravelPlanId != null) {
                // 更新现有计划
                System.out.println("🔄 更新现有旅行计划，ID: " + originalTravelPlanId);
                savedPlan = travelPlanService.updateTravelPlanFromN8n(travelPlanData, targetUserId, originalTravelPlanId);
                System.out.println("✅ 旅行计划已更新，ID: " + savedPlan.getId());
            } else {
                // 创建新计划
                System.out.println("➕ 创建新旅行计划");
                System.out.println("   - 标题: " + travelPlanData.getTitle());
                System.out.println("   - 目的地: " + travelPlanData.getDestination());
                savedPlan = travelPlanService.saveTravelPlanFromN8n(travelPlanData, targetUserId);
                System.out.println("✅ 旅行计划已保存，ID: " + savedPlan.getId());
            }

            return savedPlan.getId();
        } catch (Exception e) {
            System.err.println("❌ 保存/更新旅行计划失败: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public Long parseUserId(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (Exception e) {
            return 1L;
        }
    }

    public boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        // 检查是否是占位符
        if (url.contains("your-n8n-domain") || url.contains("example.com")) {
            return false;
        }
        return url.startsWith("http://") || url.startsWith("https://");
    }

    public boolean isValidTravelPlan(TravelPlanDTO.TravelPlanData travelPlan) {
        if (travelPlan == null) {
            System.out.println("   - 验证失败：travelPlan为null");
            return false;
        }

        // 检查必填字段
        if (travelPlan.getTitle() == null || travelPlan.getTitle().trim().isEmpty()) {
            System.out.println("   - 验证失败：缺少标题");
            return false;
        }

        if (travelPlan.getDestination() == null || travelPlan.getDestination().trim().isEmpty()) {
            System.out.println("   - 验证失败：缺少目的地");
            return false;
        }

        if (travelPlan.getTravelDays() == null || travelPlan.getTravelDays().trim().isEmpty()) {
            System.out.println("   - 验证失败：缺少有效的旅行天数");
            return false;
        }

        // 检查是否有每日行程
        if (travelPlan.getDailyItinerary() == null || travelPlan.getDailyItinerary().isEmpty()) {
            System.out.println("   - 验证失败：缺少每日行程");
            return false;
        }

        System.out.println("   - 标题: " + travelPlan.getTitle());
        System.out.println("   - 目的地: " + travelPlan.getDestination());
        System.out.println("   - 天数: " + travelPlan.getTravelDays());
        System.out.println("   - 行程数: " + travelPlan.getDailyItinerary().size());

        return true;
    }
}

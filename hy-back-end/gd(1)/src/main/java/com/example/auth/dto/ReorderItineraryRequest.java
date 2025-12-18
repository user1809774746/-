package com.example.auth.dto;

import lombok.Data;
import java.util.List;

/**
 * 重新排序行程活动的请求DTO
 */
@Data
public class ReorderItineraryRequest {
    
    /**
     * 旅行计划ID
     */
    private Long travelPlanId;
    
    /**
     * 活动列表（按新的顺序）
     */
    private List<ActivityItem> activities;
    
    @Data
    public static class ActivityItem {
        /**
         * 活动ID
         */
        private Long activityId;
        
        /**
         * 新的每日行程ID（移动到哪一天）
         */
        private Long dailyItineraryId;
        
        /**
         * 新的排序索引
         */
        private Integer sortOrder;
    }
}

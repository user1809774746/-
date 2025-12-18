package com.example.auth.util;

import com.example.auth.dto.TravelPlanDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import java.util.Map;

/**
 * 内容过滤器
 * 用于过滤travel_plan字段，保留text字段
 */
@RequiredArgsConstructor
public class ContentFilter {
    private final ObjectMapper objectMapper;

    /**
     * 过滤content中的travel_plan字段
     * @param content 原始content JSON字符串
     * @return 过滤结果
     */
    public FilterResult filterContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            System.out.println("⚠️ ContentFilter: content为空");
            return FilterResult.empty();
        }

        System.out.println("🔍 ContentFilter: 开始解析content，长度=" + content.length());
        System.out.println("🔍 ContentFilter: content前200字符=" + (content.length() > 200 ? content.substring(0, 200) : content));

        // 快速检查：如果content不是JSON对象或数组，直接返回为文本
        String trimmed = content.trim();
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            System.out.println("🔍 ContentFilter: content不是JSON对象，直接返回为文本");
            return new FilterResult(content, true, null);
        }

        try {
            // 尝试解析content为JSON
            @SuppressWarnings("unchecked")
            Map<String, Object> contentData = objectMapper.readValue(content, Map.class);
            
            System.out.println("🔍 ContentFilter: JSON解析成功，keys=" + contentData.keySet());
            
            // 提取text字段
            Object textObj = contentData.get("text");
            String text = textObj != null ? textObj.toString() : null;
            
            System.out.println("🔍 ContentFilter: text字段=" + (text != null ? "存在，长度=" + text.length() : "不存在"));
            
            // 提取travel_plan字段
            TravelPlanDTO.TravelPlanData travelPlan = extractTravelPlanFromMap(contentData);
            
            System.out.println("🔍 ContentFilter: travel_plan=" + (travelPlan != null ? "存在" : "不存在"));
            
            // 如果有text，返回text；否则返回原始content
            if (text != null && !text.isEmpty()) {
                System.out.println("✅ ContentFilter: 返回text内容");
                return new FilterResult(text, true, travelPlan);
            } else if (travelPlan != null) {
                // 只有travel_plan没有text，返回空内容但保留travel_plan
                System.out.println("✅ ContentFilter: 只有travel_plan，返回空内容");
                return new FilterResult("", false, travelPlan);
            } else {
                // 既没有text也没有travel_plan，返回原始content
                System.out.println("⚠️ ContentFilter: 没有text和travel_plan，返回原始content");
                return new FilterResult(content, true, null);
            }
            
        } catch (Exception e) {
            // JSON解析失败，返回原始内容（流式传输中这是正常情况）
            System.out.println("🔍 ContentFilter: content不是有效JSON格式，返回为文本: " + e.getMessage());
            return new FilterResult(content, true, null);
        }
    }

    /**
     * 从Map中提取travel_plan数据
     */
    @SuppressWarnings("unchecked")
    private TravelPlanDTO.TravelPlanData extractTravelPlanFromMap(Map<String, Object> contentData) {
        Object travelPlanNode = contentData.containsKey("travel_plan") 
            ? contentData.get("travel_plan") 
            : contentData.get("travelPlan");
        
        if (travelPlanNode == null) {
            return null;
        }

        try {
            if (travelPlanNode instanceof String) {
                String jsonStr = ((String) travelPlanNode).trim();
                if (jsonStr.isEmpty()) {
                    return null;
                }
                return objectMapper.readValue(jsonStr, TravelPlanDTO.TravelPlanData.class);
            }
            
            TravelPlanDTO.TravelPlanData travelPlan = objectMapper.convertValue(
                travelPlanNode, TravelPlanDTO.TravelPlanData.class);
            
            // 验证是否为有效的旅行计划
            if (isValidTravelPlan(travelPlan)) {
                return travelPlan;
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("⚠️ 提取travel_plan失败: " + e.getMessage());
            return null;
        }
    }

    /**
     * 验证旅行计划数据是否有效
     */
    private boolean isValidTravelPlan(TravelPlanDTO.TravelPlanData travelPlan) {
        if (travelPlan == null) {
            return false;
        }
        
        // 检查必填字段
        if (travelPlan.getTitle() == null || travelPlan.getTitle().trim().isEmpty()) {
            return false;
        }
        
        if (travelPlan.getDestination() == null || travelPlan.getDestination().trim().isEmpty()) {
            return false;
        }
        
        // travelDays现在是String类型，检查是否为空
        if (travelPlan.getTravelDays() == null || travelPlan.getTravelDays().trim().isEmpty()) {
            return false;
        }
        
        // 检查是否有每日行程
        if (travelPlan.getDailyItinerary() == null || travelPlan.getDailyItinerary().isEmpty()) {
            return false;
        }
        
        return true;
    }

    /**
     * 过滤结果数据类
     */
    public static class FilterResult {
        private final String filteredContent;
        private final boolean hasContent;
        private final TravelPlanDTO.TravelPlanData travelPlan;

        public FilterResult(String filteredContent, boolean hasContent, TravelPlanDTO.TravelPlanData travelPlan) {
            this.filteredContent = filteredContent;
            this.hasContent = hasContent;
            this.travelPlan = travelPlan;
        }

        public String getFilteredContent() {
            return filteredContent;
        }

        public boolean hasContent() {
            return hasContent;
        }

        public TravelPlanDTO.TravelPlanData[] getTravelPlan() {
            return new TravelPlanDTO.TravelPlanData[]{travelPlan};
        }

        public static FilterResult empty() {
            return new FilterResult("", false, null);
        }

        public boolean hasTravelPlan() {
            return travelPlan != null;
        }
    }
}

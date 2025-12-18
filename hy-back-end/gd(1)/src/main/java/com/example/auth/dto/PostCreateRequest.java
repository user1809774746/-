package com.example.auth.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 帖子创建请求 DTO
 */
@Data
public class PostCreateRequest {
    private String title;
    private String summary;
    private String content;
    private String contentType = "richtext";
    private String postType = "travel_note";
    private String category;
    private String coverImage;
    private List<String> images;
    private List<String> videos;
    private List<String> attachments;
    
    // 目的地信息
    private String destinationName;
    private String destinationCity;
    private String destinationProvince;
    private String destinationCountry = "China";
    private List<LocationInfo> locations;
    
    // 旅行信息
    private Date travelStartDate;
    private Date travelEndDate;
    
    private Integer travelDays;
    private BigDecimal travelBudget;
    private BigDecimal actualCost;
    private String travelSeason;
    private String travelStyle;
    private String companionType;
    
    // 标签和关键词
    private String tags;
    private String keywords;
    
    // 发布设置
    private Boolean isPublic = true;
    private Boolean isOriginal = true;
    private Boolean allowComments = true;
    private Boolean allowShares = true;
    private String copyrightInfo;
    
    // 自定义setter方法处理空字符串
    public void setTravelDays(Object travelDays) {
        if (travelDays == null || (travelDays instanceof String && ((String) travelDays).trim().isEmpty())) {
            this.travelDays = null;
        } else if (travelDays instanceof String) {
            try {
                this.travelDays = Integer.parseInt(((String) travelDays).trim());
            } catch (NumberFormatException e) {
                this.travelDays = null;
            }
        } else if (travelDays instanceof Integer) {
            this.travelDays = (Integer) travelDays;
        }
    }
    
    public void setTravelBudget(Object travelBudget) {
        if (travelBudget == null || (travelBudget instanceof String && ((String) travelBudget).trim().isEmpty())) {
            this.travelBudget = null;
        } else if (travelBudget instanceof String) {
            try {
                this.travelBudget = new BigDecimal(((String) travelBudget).trim());
            } catch (NumberFormatException e) {
                this.travelBudget = null;
            }
        } else if (travelBudget instanceof BigDecimal) {
            this.travelBudget = (BigDecimal) travelBudget;
        }
    }
    
    public void setActualCost(Object actualCost) {
        if (actualCost == null || (actualCost instanceof String && ((String) actualCost).trim().isEmpty())) {
            this.actualCost = null;
        } else if (actualCost instanceof String) {
            try {
                this.actualCost = new BigDecimal(((String) actualCost).trim());
            } catch (NumberFormatException e) {
                this.actualCost = null;
            }
        } else if (actualCost instanceof BigDecimal) {
            this.actualCost = (BigDecimal) actualCost;
        }
    }

    // 内部类：位置信息
    @Data
    public static class LocationInfo {
        private String name;
        private Double latitude;
        private Double longitude;
        private String description;
    }
}

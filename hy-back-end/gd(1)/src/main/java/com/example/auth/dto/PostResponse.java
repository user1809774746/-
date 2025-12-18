package com.example.auth.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 帖子响应 DTO
 */
@Data
public class PostResponse {
    private Long id;
    private Long publisherId;
    private String publisherNickname;
    private String publisherAvatarUrl;
    private String title;
    private String summary;
    private String content;
    private String contentType;
    private String postType;
    private String category;
    private String coverImage;
    private List<String> images;
    private List<String> videos;
    private List<String> attachments;
    
    // 目的地信息
    private String destinationName;
    private String destinationCity;
    private String destinationProvince;
    private String destinationCountry;
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
    
    // 统计信息
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Integer shareCount;
    private Integer favoriteCount;
    private BigDecimal rating;
    private Integer ratingCount;
    
    // 状态信息
    private String status;
    private Boolean isFeatured;
    private Boolean isTop;
    private Boolean isOriginal;
    private Boolean isPublic;
    private String auditStatus;
    private Date auditTime;
    private String auditReason;
    
    // 设置信息
    private Boolean allowComments;
    private Boolean allowShares;
    private String copyrightInfo;
    
    // 时间信息
    private Date createdTime;
    private Date updatedTime;
    private Date publishedTime;
    
    // 用户相关（当前登录用户对此帖子的操作状态）
    private Boolean isLiked;
    private Boolean isFavorited;
    
    // 内部类：位置信息
    @Data
    public static class LocationInfo {
        private String name;
        private Double latitude;
        private Double longitude;
        private String description;
    }
}

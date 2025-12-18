package com.example.auth.dto;

import lombok.Data;
import java.util.Date;

/**
 * 旅游帖子收藏响应 DTO
 */
@Data
public class TravelPostFavoriteResponse {
    private Long id;
    private Long userId;
    private Long postId;
    private Long publisherId;
    private String postTitle;
    private String postType;
    private String coverImage;
    private String destinationName;
    private String destinationCity;
    private String destinationProvince;
    private String destinationCountry;
    private Integer travelDays;
    private Double travelBudget;
    private String travelSeason;
    private String travelStyle;
    private Date favoriteTime;
    private String favoriteCategory;
    private String favoriteTags;
    private String userNotes;
    private Integer priorityLevel;
    private String readStatus;
    private Boolean isArchived;
    private Boolean reminderEnabled;
    private Date reminderDate;
    private String reminderMessage;
    private Boolean isShared;
    private Integer shareCount;
    private String status;
    private Date createdTime;
    private Date updatedTime;
}

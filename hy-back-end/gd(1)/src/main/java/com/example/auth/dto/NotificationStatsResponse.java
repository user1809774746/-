package com.example.auth.dto;

import lombok.Data;

/**
 * 通知统计响应DTO
 */
@Data
public class NotificationStatsResponse {
    private Long totalCount; // 总通知数
    private Long unreadCount; // 未读通知数
    private Long commentCount; // 评论通知数
    private Long favoriteCount; // 收藏通知数
    private Long viewCount; // 浏览通知数
    private Long activityCount; // 活动相关通知数
}


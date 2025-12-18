package com.example.auth.dto;

import lombok.Data;
import java.util.Date;

/**
 * 通知响应DTO
 */
@Data
public class NotificationResponse {
    private Long id;
    private Long receiverId;
    private Long senderId;
    private String senderUsername;
    private String senderAvatarBase64; // Base64编码的头像
    private String notificationType;
    private String notificationTypeDesc; // 通知类型描述
    private Long postId;
    private String postTitle;
    private String postCoverImage;
    private Long activityId;
    private String activityTitle;
    private Long commentId;
    private String commentContent;
    private Boolean isRead;
    private Date readTime;
    private String status;
    private Date createdTime;
    private Date updatedTime;
    private String timeDesc; // 时间描述，如"5分钟前"
}


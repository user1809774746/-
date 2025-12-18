package com.example.auth.service;

import com.example.auth.dto.NotificationResponse;
import com.example.auth.dto.NotificationStatsResponse;
import com.example.auth.entity.Activity;
import com.example.auth.entity.TravelPost;
import com.example.auth.entity.User;
import com.example.auth.entity.UserNotification;
import com.example.auth.entity.UserPostComment;
import com.example.auth.repository.TravelPostRepository;
import com.example.auth.repository.UserNotificationRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 通知服务类
 */
@Service
public class NotificationService {

    @Autowired
    private UserNotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TravelPostRepository travelPostRepository;

    /**
     * 创建评论通知
     */
    @Transactional
    public void createCommentNotification(Long postId, Long commenterId, UserPostComment comment) {
        // 获取帖子信息
        Optional<TravelPost> postOpt = travelPostRepository.findById(postId);
        if (!postOpt.isPresent()) {
            return;
        }
        TravelPost post = postOpt.get();

        // 如果评论者是帖子作者，不创建通知
        if (commenterId.equals(post.getPublisherId())) {
            return;
        }

        // 检查是否已存在相同通知（避免重复）
        Long existingCount = notificationRepository.countExistingNotification(
            post.getPublisherId(), commenterId, "COMMENT", postId
        );
        if (existingCount > 0) {
            return; // 已存在相同通知，不重复创建
        }

        // 获取评论者信息
        Optional<User> commenterOpt = userRepository.findById(commenterId);
        if (!commenterOpt.isPresent()) {
            return;
        }
        User commenter = commenterOpt.get();

        // 创建通知
        UserNotification notification = new UserNotification();
        notification.setReceiverId(post.getPublisherId());
        notification.setSenderId(commenterId);
        notification.setSenderUsername(commenter.getUsername());
        notification.setSenderAvatar(commenter.getUserProfilePic());
        notification.setNotificationType("COMMENT");
        notification.setPostId(postId);
        notification.setPostTitle(post.getTitle());
        notification.setPostCoverImage(post.getCoverImage());
        notification.setCommentId(comment.getId());
        notification.setCommentContent(comment.getCommentContent());
        notification.setIsRead(false);
        notification.setStatus("active");
        notification.setIsDeleted(false);

        notificationRepository.save(notification);
    }

    /**
     * 创建活动报名通知
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createActivitySignupNotification(Activity activity, Long participantId) {
        if (activity == null || activity.getOrganizerId() == null || participantId == null) {
            return;
        }

        // 组织者自己报名不通知
        if (participantId.equals(activity.getOrganizerId())) {
            return;
        }

        // 检查是否已存在相同通知（避免重复）
        Long existingCount = notificationRepository.countExistingActivityNotification(
            activity.getOrganizerId(), participantId, "ACTIVITY_SIGNUP", activity.getId()
        );
        if (existingCount != null && existingCount > 0) {
            return;
        }

        // 获取报名用户信息
        Optional<User> participantOpt = userRepository.findById(participantId);
        if (!participantOpt.isPresent()) {
            return;
        }
        User participant = participantOpt.get();

        // 创建通知
        UserNotification notification = new UserNotification();
        notification.setReceiverId(activity.getOrganizerId());
        notification.setSenderId(participantId);
        notification.setSenderUsername(participant.getUsername());
        notification.setSenderAvatar(participant.getUserProfilePic());
        notification.setNotificationType("ACTIVITY_SIGNUP");
        notification.setActivityId(activity.getId());
        notification.setActivityTitle(activity.getTitle());
        notification.setIsRead(false);
        notification.setStatus("active");
        notification.setIsDeleted(false);

        notificationRepository.save(notification);
    }

    /**
     * 创建收藏通知
     */
    @Transactional
    public void createFavoriteNotification(Long postId, Long favoriterId) {
        // 获取帖子信息
        Optional<TravelPost> postOpt = travelPostRepository.findById(postId);
        if (!postOpt.isPresent()) {
            return;
        }
        TravelPost post = postOpt.get();

        // 如果收藏者是帖子作者，不创建通知
        if (favoriterId.equals(post.getPublisherId())) {
            return;
        }

        // 检查是否已存在相同通知（避免重复）
        Long existingCount = notificationRepository.countExistingNotification(
            post.getPublisherId(), favoriterId, "FAVORITE", postId
        );
        if (existingCount > 0) {
            return; // 已存在相同通知，不重复创建
        }

        // 获取收藏者信息
        Optional<User> favoriterOpt = userRepository.findById(favoriterId);
        if (!favoriterOpt.isPresent()) {
            return;
        }
        User favoriter = favoriterOpt.get();

        // 创建通知
        UserNotification notification = new UserNotification();
        notification.setReceiverId(post.getPublisherId());
        notification.setSenderId(favoriterId);
        notification.setSenderUsername(favoriter.getUsername());
        notification.setSenderAvatar(favoriter.getUserProfilePic());
        notification.setNotificationType("FAVORITE");
        notification.setPostId(postId);
        notification.setPostTitle(post.getTitle());
        notification.setPostCoverImage(post.getCoverImage());
        notification.setIsRead(false);
        notification.setStatus("active");
        notification.setIsDeleted(false);

        notificationRepository.save(notification);
    }

    /**
     * 创建浏览通知
     */
    @Transactional
    public void createViewNotification(Long postId, Long viewerId) {
        // 获取帖子信息
        Optional<TravelPost> postOpt = travelPostRepository.findById(postId);
        if (!postOpt.isPresent()) {
            return;
        }
        TravelPost post = postOpt.get();

        // 如果浏览者是帖子作者，不创建通知
        if (viewerId.equals(post.getPublisherId())) {
            return;
        }

        // 检查是否已存在相同通知（避免重复）
        Long existingCount = notificationRepository.countExistingNotification(
            post.getPublisherId(), viewerId, "VIEW", postId
        );
        if (existingCount > 0) {
            return; // 已存在相同通知，不重复创建
        }

        // 获取浏览者信息
        Optional<User> viewerOpt = userRepository.findById(viewerId);
        if (!viewerOpt.isPresent()) {
            return;
        }
        User viewer = viewerOpt.get();

        // 创建通知
        UserNotification notification = new UserNotification();
        notification.setReceiverId(post.getPublisherId());
        notification.setSenderId(viewerId);
        notification.setSenderUsername(viewer.getUsername());
        notification.setSenderAvatar(viewer.getUserProfilePic());
        notification.setNotificationType("VIEW");
        notification.setPostId(postId);
        notification.setPostTitle(post.getTitle());
        notification.setPostCoverImage(post.getCoverImage());
        notification.setIsRead(false);
        notification.setStatus("active");
        notification.setIsDeleted(false);

        notificationRepository.save(notification);
    }

    /**
     * 获取用户的所有通知
     */
    public List<NotificationResponse> getUserNotifications(Long userId) {
        List<UserNotification> notifications = notificationRepository
            .findByReceiverIdAndIsDeletedOrderByCreatedTimeDesc(userId, false);
        return convertToResponseList(notifications);
    }

    /**
     * 获取用户的未读通知
     */
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        List<UserNotification> notifications = notificationRepository
            .findByReceiverIdAndIsReadAndIsDeletedOrderByCreatedTimeDesc(userId, false, false);
        return convertToResponseList(notifications);
    }

    /**
     * 获取用户指定类型的通知
     */
    public List<NotificationResponse> getNotificationsByType(Long userId, String notificationType) {
        List<UserNotification> notifications = notificationRepository
            .findByReceiverIdAndNotificationTypeAndIsDeletedOrderByCreatedTimeDesc(userId, notificationType, false);
        return convertToResponseList(notifications);
    }

    /**
     * 获取通知统计信息
     */
    public NotificationStatsResponse getNotificationStats(Long userId) {
        List<UserNotification> allNotifications = notificationRepository
            .findByReceiverIdAndIsDeletedOrderByCreatedTimeDesc(userId, false);

        NotificationStatsResponse stats = new NotificationStatsResponse();
        stats.setTotalCount((long) allNotifications.size());
        stats.setUnreadCount(notificationRepository.countUnreadNotifications(userId));
        stats.setCommentCount(allNotifications.stream()
            .filter(n -> "COMMENT".equals(n.getNotificationType()))
            .count());
        stats.setFavoriteCount(allNotifications.stream()
            .filter(n -> "FAVORITE".equals(n.getNotificationType()))
            .count());
        stats.setViewCount(allNotifications.stream()
            .filter(n -> "VIEW".equals(n.getNotificationType()))
            .count());
        stats.setActivityCount(allNotifications.stream()
            .filter(n -> "ACTIVITY_SIGNUP".equals(n.getNotificationType()))
            .count());

        return stats;
    }

    /**
     * 标记通知为已读
     */
    @Transactional
    public boolean markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId);
        return updated > 0;
    }

    /**
     * 标记所有通知为已读
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    /**
     * 删除通知
     */
    @Transactional
    public boolean deleteNotification(Long notificationId, Long userId) {
        int deleted = notificationRepository.deleteNotification(notificationId, userId);
        return deleted > 0;
    }

    /**
     * 删除所有已读通知
     */
    @Transactional
    public int deleteAllReadNotifications(Long userId) {
        return notificationRepository.deleteAllReadNotifications(userId);
    }

    /**
     * 转换为响应DTO列表
     */
    private List<NotificationResponse> convertToResponseList(List<UserNotification> notifications) {
        return notifications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    /**
     * 转换为响应DTO
     */
    private NotificationResponse convertToResponse(UserNotification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setReceiverId(notification.getReceiverId());
        response.setSenderId(notification.getSenderId());
        response.setSenderUsername(notification.getSenderUsername());
        
        // 转换头像为Base64
        if (notification.getSenderAvatar() != null) {
            response.setSenderAvatarBase64(Base64.getEncoder().encodeToString(notification.getSenderAvatar()));
        }

        response.setNotificationType(notification.getNotificationType());
        response.setNotificationTypeDesc(getNotificationTypeDesc(notification.getNotificationType()));
        response.setPostId(notification.getPostId());
        response.setPostTitle(notification.getPostTitle());
        response.setPostCoverImage(notification.getPostCoverImage());
        response.setActivityId(notification.getActivityId());
        response.setActivityTitle(notification.getActivityTitle());
        response.setCommentId(notification.getCommentId());
        response.setCommentContent(notification.getCommentContent());
        response.setIsRead(notification.getIsRead());
        response.setReadTime(notification.getReadTime());
        response.setStatus(notification.getStatus());
        response.setCreatedTime(notification.getCreatedTime());
        response.setUpdatedTime(notification.getUpdatedTime());
        response.setTimeDesc(getTimeDesc(notification.getCreatedTime()));

        return response;
    }

    /**
     * 获取通知类型描述
     */
    private String getNotificationTypeDesc(String notificationType) {
        switch (notificationType) {
            case "COMMENT":
                return "评论了你的帖子";
            case "FAVORITE":
                return "收藏了你的帖子";
            case "VIEW":
                return "浏览了你的帖子";
            case "ACTIVITY_SIGNUP":
                return "报名了你的活动";
            default:
                return "互动了你的帖子";
        }
    }

    /**
     * 获取时间描述
     */
    private String getTimeDesc(Date date) {
        if (date == null) {
            return "";
        }

        long diff = System.currentTimeMillis() - date.getTime();
        long seconds = diff / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;

        if (seconds < 60) {
            return "刚刚";
        } else if (minutes < 60) {
            return minutes + "分钟前";
        } else if (hours < 24) {
            return hours + "小时前";
        } else if (days < 7) {
            return days + "天前";
        } else {
            return new java.text.SimpleDateFormat("yyyy-MM-dd").format(date);
        }
    }
}


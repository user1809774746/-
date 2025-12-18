package com.example.auth.repository;

import com.example.auth.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 用户通知Repository
 */
@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {

    /**
     * 查询用户的所有通知（按创建时间倒序）
     */
    List<UserNotification> findByReceiverIdAndIsDeletedOrderByCreatedTimeDesc(Long receiverId, Boolean isDeleted);

    /**
     * 查询用户的未读通知
     */
    List<UserNotification> findByReceiverIdAndIsReadAndIsDeletedOrderByCreatedTimeDesc(Long receiverId, Boolean isRead, Boolean isDeleted);

    /**
     * 查询用户指定类型的通知
     */
    List<UserNotification> findByReceiverIdAndNotificationTypeAndIsDeletedOrderByCreatedTimeDesc(Long receiverId, String notificationType, Boolean isDeleted);

    /**
     * 统计用户的未读通知数量
     */
    @Query("SELECT COUNT(n) FROM UserNotification n WHERE n.receiverId = :receiverId AND n.isRead = false AND n.isDeleted = false")
    Long countUnreadNotifications(@Param("receiverId") Long receiverId);

    /**
     * 标记单条通知为已读
     */
    @Modifying
    @Transactional
    @Query("UPDATE UserNotification n SET n.isRead = true, n.readTime = CURRENT_TIMESTAMP WHERE n.id = :notificationId AND n.receiverId = :receiverId")
    int markAsRead(@Param("notificationId") Long notificationId, @Param("receiverId") Long receiverId);

    /**
     * 标记所有通知为已读
     */
    @Modifying
    @Transactional
    @Query("UPDATE UserNotification n SET n.isRead = true, n.readTime = CURRENT_TIMESTAMP WHERE n.receiverId = :receiverId AND n.isRead = false AND n.isDeleted = false")
    int markAllAsRead(@Param("receiverId") Long receiverId);

    /**
     * 删除单条通知（软删除）
     */
    @Modifying
    @Transactional
    @Query("UPDATE UserNotification n SET n.isDeleted = true, n.status = 'deleted', n.deletedTime = CURRENT_TIMESTAMP WHERE n.id = :notificationId AND n.receiverId = :receiverId")
    int deleteNotification(@Param("notificationId") Long notificationId, @Param("receiverId") Long receiverId);

    /**
     * 删除所有已读通知（软删除）
     */
    @Modifying
    @Transactional
    @Query("UPDATE UserNotification n SET n.isDeleted = true, n.status = 'deleted', n.deletedTime = CURRENT_TIMESTAMP WHERE n.receiverId = :receiverId AND n.isRead = true AND n.isDeleted = false")
    int deleteAllReadNotifications(@Param("receiverId") Long receiverId);

    /**
     * 检查是否已存在相同的通知（避免重复通知）
     */
    @Query("SELECT COUNT(n) FROM UserNotification n WHERE n.receiverId = :receiverId AND n.senderId = :senderId AND n.notificationType = :notificationType AND n.postId = :postId AND n.isDeleted = false")
    Long countExistingNotification(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId, @Param("notificationType") String notificationType, @Param("postId") Long postId);

    /**
     * 检查是否已存在相同的活动通知（避免重复通知）
     */
    @Query("SELECT COUNT(n) FROM UserNotification n WHERE n.receiverId = :receiverId AND n.senderId = :senderId AND n.notificationType = :notificationType AND n.activityId = :activityId AND n.isDeleted = false")
    Long countExistingActivityNotification(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId, @Param("notificationType") String notificationType, @Param("activityId") Long activityId);
}


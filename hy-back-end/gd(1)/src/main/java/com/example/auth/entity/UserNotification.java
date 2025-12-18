package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.util.Date;

/**
 * 用户通知实体类
 */
@Entity
@Table(name = "user_notification")
@Data
public class UserNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "sender_username", length = 100)
    private String senderUsername;

    @Lob
    @Column(name = "sender_avatar", columnDefinition = "LONGBLOB")
    private byte[] senderAvatar;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType;

    @Column(name = "post_id")
    private Long postId;

    @Column(name = "post_title", length = 200)
    private String postTitle;

    @Column(name = "post_cover_image", length = 500)
    private String postCoverImage;

    @Column(name = "activity_id")
    private Long activityId;

    @Column(name = "activity_title", length = 200)
    private String activityTitle;

    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "comment_content", columnDefinition = "TEXT")
    private String commentContent;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "read_time")
    private Date readTime;

    @Column(name = "status", length = 20)
    private String status = "active";

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private Date createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private Date updatedTime;

    @Column(name = "deleted_time")
    private Date deletedTime;
}


package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 用户发布的旅游帖子实体类
 * 存储用户与帖子的关联关系和用户特定信息
 */
@Entity
@Table(name = "user_travel_post")
@Data
public class UserTravelPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "travel_post_id", nullable = false)
    private Long travelPostId; // 关联到travel_post表的ID

    @Column(name = "publisher_id", nullable = false)
    private Long publisherId;

    @Column(name = "publisher_nickname", length = 100)
    private String publisherNickname;

    @Column(name = "publisher_avatar_url", length = 500)
    private String publisherAvatarUrl;

    // 用户特定的状态和权限
    @Column(name = "user_status", length = 20)
    private String userStatus = "active"; // 用户对此帖子的状态：active, hidden, deleted

    @Column(name = "is_original")
    private Boolean isOriginal = true;

    @Column(name = "user_notes", columnDefinition = "LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String userNotes; // 用户对此帖子的私人备注

    @Column(name = "user_tags", length = 500)
    private String userTags; // 用户自定义标签

    @Column(name = "is_pinned")
    private Boolean isPinned = false; // 用户是否置顶此帖子

    @Column(name = "user_category", length = 50)
    private String userCategory; // 用户自定义分类

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private Date createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private Date updatedTime;

    @Column(name = "user_published_time")
    private Date userPublishedTime; // 用户发布时间

    @Column(name = "user_deleted_time")
    private Date userDeletedTime; // 用户删除时间
}

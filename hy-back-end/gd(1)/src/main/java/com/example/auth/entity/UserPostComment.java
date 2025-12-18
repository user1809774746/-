package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.util.Date;

/**
 * 帖子评论实体类
 */
@Entity
@Table(name = "user_post_comment")
@Data
public class UserPostComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "parent_comment_id")
    private Long parentCommentId;

    @Column(name = "comment_content", nullable = false, columnDefinition = "LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String commentContent;

    @Column(name = "comment_images", columnDefinition = "LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String commentImages; // JSON格式存储

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Column(name = "reply_count")
    private Integer replyCount = 0;

    @Column(name = "status", length = 20)
    private String status = "normal";

    @Column(name = "is_author_reply")
    private Boolean isAuthorReply = false;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private Date createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private Date updatedTime;
}

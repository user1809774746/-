package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.util.Date;

/**
 * 帖子草稿实体类
 */
@Entity
@Table(name = "user_post_draft")
@Data
public class UserPostDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "publisher_id", nullable = false)
    private Long publisherId;

    @Column(name = "draft_title", length = 200)
    private String draftTitle;

    @Column(name = "draft_content", columnDefinition = "LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String draftContent;

    @Column(name = "draft_data", columnDefinition = "LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String draftData; // JSON格式存储完整草稿数据

    @Column(name = "auto_save_time")
    private Date autoSaveTime;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private Date createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private Date updatedTime;
}

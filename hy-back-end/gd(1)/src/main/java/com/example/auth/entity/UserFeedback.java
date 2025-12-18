package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.util.Date;

/**
 * 用户反馈实体类
 */
@Entity
@Table(name = "user_feedback")
@Data
public class UserFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "feedback_type", nullable = false, length = 20)
    private String feedbackType;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "detail", nullable = false, columnDefinition = "TEXT")
    private String detail;

    @Column(name = "score")
    private Integer score;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "module", length = 50)
    private String module;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_ip", length = 50)
    private String userIp;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "pending";

    @Column(name = "priority", length = 20)
    private String priority = "normal";

    @Column(name = "handler_id")
    private Long handlerId;

    @Column(name = "handler_notes", columnDefinition = "TEXT")
    private String handlerNotes;

    @Column(name = "resolved_time")
    private Date resolvedTime;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private Date createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private Date updatedTime;
}


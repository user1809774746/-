package com.example.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 入群申请实体类
 */
@Entity
@Table(name = "group_join_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupJoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "applicant_id", nullable = false)
    private Long applicantId;

    @Column(name = "inviter_id")
    private Long inviterId;

    @Column(name = "request_type", length = 20)
    private String requestType = "apply"; // apply, invite

    @Column(name = "request_message", length = 200)
    private String requestMessage;

    @Column(name = "request_status", length = 20)
    private String requestStatus = "pending"; // pending, approved, rejected, expired

    @Column(name = "handler_id")
    private Long handlerId;

    @Column(name = "reject_reason", length = 200)
    private String rejectReason;

    @Column(name = "handled_time")
    private LocalDateTime handledTime;

    @Column(name = "expire_time")
    private LocalDateTime expireTime;

    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdTime = now;
        updatedTime = now;
        // 默认7天后过期
        if (expireTime == null) {
            expireTime = now.plusDays(7);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
    }
}

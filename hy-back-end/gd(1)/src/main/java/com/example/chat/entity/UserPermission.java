package com.example.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 用户权限管理实体，对应 user_permissions 表
 */
@Entity
@Table(name = "user_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 权限拥有者（谁设置的权限）
     */
    @Column(name = "permission_owner", nullable = false)
    private Long permissionOwner;

    /**
     * 被设置权限的用户
     */
    @Column(name = "target_user", nullable = false)
    private Long targetUser;

    /**
     * 权限级别：chat_only / full_access
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "permission_level", length = 20, nullable = false)
    private PermissionLevel permissionLevel = PermissionLevel.chat_only;

    @Column(name = "can_view_profile")
    private Boolean canViewProfile = false;

    @Column(name = "can_view_moments")
    private Boolean canViewMoments = false;

    @Column(name = "can_view_status")
    private Boolean canViewStatus = true;

    @Column(name = "can_send_files")
    private Boolean canSendFiles = true;

    @Column(name = "can_voice_call")
    private Boolean canVoiceCall = false;

    @Column(name = "can_video_call")
    private Boolean canVideoCall = false;

    @Column(name = "auto_accept_files")
    private Boolean autoAcceptFiles = false;

    @Column(name = "message_verification")
    private Boolean messageVerification = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum PermissionLevel {
        chat_only,
        full_access
    }
}

package com.example.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 群成员实体类
 */
@Entity
@Table(name = "group_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "group_id", nullable = false)
    private Long groupId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Builder.Default
    @Column(name = "member_role", length = 20)
    private String memberRole = "member"; // owner, admin, member
    
    @Column(name = "group_nickname", length = 50)
    private String groupNickname;
    
    @Builder.Default
    @Column(name = "is_muted", nullable = false)
    private Boolean isMuted = false;
    
    @Column(name = "mute_until")
    private LocalDateTime muteUntil;
    
    @Column(name = "join_time", nullable = false)
    private LocalDateTime joinTime;
    
    @Column(name = "last_read_time")
    private LocalDateTime lastReadTime;
    
    @Builder.Default
    @Column(name = "unread_count", nullable = false)
    private Integer unreadCount = 0;
    
    @Builder.Default
    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;
    
    @Builder.Default
    @Column(name = "is_disturb_free", nullable = false)
    private Boolean isDisturbFree = false;
    
    @Column(name = "chat_background", length = 500)
    private String chatBackground;
    
    @Column(name = "clear_history_time")
    private LocalDateTime clearHistoryTime;
    
    @Builder.Default
    @Column(name = "member_status", length = 20)
    private String memberStatus = "active"; // active, left, kicked, banned
    
    @Column(name = "inviter_id")
    private Long inviterId;
    
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;
    
    @Column(name = "updated_time")
    private LocalDateTime updatedTime;
    
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (joinTime == null) {
            joinTime = now;
        }
        createdTime = now;
        updatedTime = now;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
    }
}

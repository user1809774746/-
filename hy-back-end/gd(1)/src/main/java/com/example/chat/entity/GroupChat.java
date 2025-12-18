package com.example.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 群聊基础信息实体类
 */
@Entity
@Table(name = "group_chats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "group_name", nullable = false, length = 100)
    private String groupName;

    @Column(name = "group_avatar", length = 500)
    private String groupAvatar;

    @Lob
    @Column(name = "group_description", columnDefinition = "TEXT")
    private String groupDescription;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "max_members", nullable = false)
    private Integer maxMembers = 200;

    @Column(name = "current_members", nullable = false)
    private Integer currentMembers = 0;

    @Column(name = "group_type", length = 20)
    private String groupType = "normal"; // normal, announcement, private

    @Column(name = "join_approval", nullable = false)
    private Boolean joinApproval = true;

    @Column(name = "allow_member_invite", nullable = false)
    private Boolean allowMemberInvite = true;

    @Column(name = "mute_all", nullable = false)
    private Boolean muteAll = false;

    @Column(name = "status", length = 20)
    private String status = "active"; // active, disbanded, frozen

    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdTime = now;
        updatedTime = now;
        if (currentMembers == null) {
            currentMembers = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
    }
}

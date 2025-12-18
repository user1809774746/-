package com.example.chat.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 用户好友关系实体类
 */
@Entity
@Table(name = "user_friendships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFriendship {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "friend_id", nullable = false)
    private Long friendId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FriendshipStatus status;
    
    @Column(name = "request_message", columnDefinition = "TEXT")
    private String requestMessage;
    
    @Column(name = "request_source")
    private String requestSource;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    
    @Column(name = "reject_reason")
    private String rejectReason;
    
    public enum FriendshipStatus {
        pending, accepted, rejected, blocked, deleted
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

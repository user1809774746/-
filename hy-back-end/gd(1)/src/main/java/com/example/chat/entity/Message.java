package com.example.chat.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 消息实体类
 */
@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;
    
    @Column(name = "sender_id", nullable = false)
    private Long senderId;
    
    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;
    
    @Column(name = "message_type", nullable = false)
    private String messageType;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "travel_plan_id")
    private Long travelPlanId;

    @Column(name = "extra", columnDefinition = "TEXT")
    private String extra;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "reply_to_message_id")
    private Long replyToMessageId;
    
    @Column(name = "status", nullable = false)
    private String status = "sent";
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "recalled_at")
    private LocalDateTime recalledAt;
    
    // messageType和status改为String类型以匹配数据库varchar字段
    // 有效的message_type值: text, image, video, audio, file, location, link, system
    // 有效的status值: sent, delivered, read, recalled
    
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

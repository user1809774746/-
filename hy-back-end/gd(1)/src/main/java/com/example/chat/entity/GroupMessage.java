package com.example.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 群聊消息实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "group_messages")
public class GroupMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "message_type", nullable = false)
    private String messageType; // text, image, voice, video, file, location, link, system

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    // 媒体信息
    @Column(name = "media_url", length = 500)
    private String mediaUrl;

    @Column(name = "media_thumbnail", length = 500)
    private String mediaThumbnail;

    @Column(name = "media_duration")
    private Integer mediaDuration;

    @Column(name = "media_size")
    private Long mediaSize;

    @Column(name = "file_name", length = 255)
    private String fileName;

    // 位置信息
    @Column(name = "location_lat", precision = 10, scale = 8)
    private BigDecimal locationLat;

    @Column(name = "location_lng", precision = 11, scale = 8)
    private BigDecimal locationLng;

    @Column(name = "location_address", length = 500)
    private String locationAddress;

    // 链接信息
    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "link_title", length = 200)
    private String linkTitle;

    @Column(name = "link_description", columnDefinition = "TEXT")
    private String linkDescription;

    // 消息状态
    @Column(name = "reply_to_message_id")
    private Long replyToMessageId;

    @Column(name = "is_recalled", nullable = false)
    private Boolean isRecalled = false;

    @Column(name = "recalled_time")
    private LocalDateTime recalledTime;

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;

    // 时间信息
    @Column(name = "sent_time", nullable = false)
    private LocalDateTime sentTime;

    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    // 扩展字段
    @Column(name = "extra_data", columnDefinition = "JSON")
    private String extraData;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdTime = now;
        updatedTime = now;
        sentTime = now;
        if (isRecalled == null) {
            isRecalled = false;
        }
        if (isPinned == null) {
            isPinned = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
    }
}

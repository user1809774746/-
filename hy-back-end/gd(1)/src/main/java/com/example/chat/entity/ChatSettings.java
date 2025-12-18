package com.example.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;

    @Column(name = "is_muted", nullable = false)
    private Boolean isMuted = false;

    @Lob
    @Column(name = "background_image", columnDefinition = "MEDIUMTEXT")
    private String backgroundImage;

    @Column(name = "font_size")
    private Integer fontSize;

    @Column(name = "show_online_status")
    private Boolean showOnlineStatus;

    @Column(name = "auto_download_media")
    private Boolean autoDownloadMedia;

    @Column(name = "last_read_time")
    private LocalDateTime lastReadTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

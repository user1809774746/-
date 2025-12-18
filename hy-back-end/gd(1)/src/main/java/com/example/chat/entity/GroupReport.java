package com.example.chat.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 群聊举报实体类
 */
@Slf4j
@Entity
@Table(name = "group_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupReport {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "group_id", nullable = false)
    private Long groupId;
    
    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;
    
    @Column(name = "report_type", length = 20, nullable = false)
    private String reportType; // spam, fraud, pornography, violence, politics, harassment, other
    
    @Column(name = "report_reason", nullable = false, columnDefinition = "TEXT")
    private String reportReason;
    
    // 使用 String 存储 JSON，通过 getter/setter 转换
    @Column(name = "evidence_urls", columnDefinition = "TEXT")
    private String evidenceUrlsJson;
    
    @Transient
    private List<String> evidenceUrls;
    
    @Column(name = "report_status", length = 20)
    private String reportStatus = "pending"; // pending, processing, resolved, rejected
    
    @Column(name = "handler_id")
    private Long handlerId;
    
    @Column(name = "handle_result", columnDefinition = "TEXT")
    private String handleResult;
    
    @Column(name = "handled_time")
    private LocalDateTime handledTime;
    
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;
    
    @Column(name = "updated_time")
    private LocalDateTime updatedTime;
    
    /**
     * 获取证据URL列表
     */
    public List<String> getEvidenceUrls() {
        if (evidenceUrls == null && evidenceUrlsJson != null && !evidenceUrlsJson.isEmpty()) {
            try {
                evidenceUrls = objectMapper.readValue(evidenceUrlsJson, new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                log.error("解析证据URL JSON失败", e);
                evidenceUrls = new ArrayList<>();
            }
        }
        return evidenceUrls;
    }
    
    /**
     * 设置证据URL列表
     */
    public void setEvidenceUrls(List<String> evidenceUrls) {
        this.evidenceUrls = evidenceUrls;
        if (evidenceUrls != null) {
            try {
                this.evidenceUrlsJson = objectMapper.writeValueAsString(evidenceUrls);
            } catch (JsonProcessingException e) {
                log.error("序列化证据URL为JSON失败", e);
                this.evidenceUrlsJson = "[]";
            }
        } else {
            this.evidenceUrlsJson = null;
        }
    }
    
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdTime = now;
        updatedTime = now;
        // 确保 JSON 字段被序列化
        if (evidenceUrls != null && evidenceUrlsJson == null) {
            setEvidenceUrls(evidenceUrls);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
        // 确保 JSON 字段被序列化
        if (evidenceUrls != null && evidenceUrlsJson == null) {
            setEvidenceUrls(evidenceUrls);
        }
    }
    
    @PostLoad
    protected void onLoad() {
        // 加载后自动反序列化 JSON
        getEvidenceUrls();
    }
}

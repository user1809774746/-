package com.example.auth.dto;

import lombok.Data;
import java.util.Date;

/**
 * 反馈响应DTO
 */
@Data
public class FeedbackResponse {
    
    private Long id;
    private String feedbackType;
    private String title;
    private String detail;
    private Integer score;
    private String email;
    private String module;
    private Long userId;
    private String userIp;
    private String status;
    private String statusDesc;
    private String priority;
    private String priorityDesc;
    private Long handlerId;
    private String handlerNotes;
    private Date resolvedTime;
    private Date createdTime;
    private Date updatedTime;
}


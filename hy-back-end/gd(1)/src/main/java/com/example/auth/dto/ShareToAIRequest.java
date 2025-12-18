package com.example.auth.dto;

import lombok.Data;

/**
 * 分享旅行计划给AI助手的请求DTO
 */
@Data
public class ShareToAIRequest {
    
    /**
     * 旅行计划ID
     */
    private Long travelPlanId;
    
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 会话ID（可选，如果要在现有会话中分享）
     */
    private String sessionId;
    
    /**
     * 分享时的附加消息（可选）
     */
    private String message;
    
    /**
     * 分享目的：discuss(讨论), optimize(优化), question(提问)
     */
    private String purpose;
}

package com.example.auth.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class ChatRequest {
    @JsonProperty("userId")
    private String userId;  // JSON字段名改为userId
    
    private String sessionId;
    
    @JsonProperty("chatInput")
    private String chatInput;  // 对应前端的chatInput字段
    
    /**
     * 原始旅行计划ID（用于更新现有计划）
     */
    private Long originalTravelPlanId;
}

package com.example.auth.dto;

import lombok.Data;

/**
 * 更新旅行计划状态的请求DTO
 */
@Data
public class UpdateTravelPlanStatusRequest {
    
    /**
     * 旅行计划ID
     */
    private Long travelPlanId;
    
    /**
     * 新状态：draft(草稿), active(进行中), completed(已完成)
     */
    private String status;
}

package com.example.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
    private String reply;
    private TravelPlanDTO.TravelPlanData travelPlan;
    private Long travelPlanId;
}

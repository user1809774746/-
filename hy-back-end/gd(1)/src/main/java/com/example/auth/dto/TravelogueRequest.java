package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelogueRequest {
    private String userId;
    private String destination;
    private String travelPlan; // Can be a detailed plan or just a prompt
    private String existingTravelogue; // 用于润色已有的游记内容
}

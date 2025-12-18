package com.example.auth.dto;

import lombok.Data;

@Data
public class TravelPlanDateUpdateDTO {
    private String startDate; // 格式：yyyy-MM-dd
    private String endDate;   // 格式：yyyy-MM-dd
}

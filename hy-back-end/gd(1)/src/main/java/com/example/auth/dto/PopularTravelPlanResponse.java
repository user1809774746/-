package com.example.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PopularTravelPlanResponse {
    private Long planId;
    private Long userId;

    @JsonProperty("trip_title")
    private String tripTitle;
    
    @JsonProperty("total_days")
    private Integer totalDays;

    private List<DayInfo> days;

    private String summary;

    @JsonProperty("is_favorited")
    private Boolean isFavorited;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}

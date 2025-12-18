package com.example.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import java.util.List;

@Data
public class PopularTravelPlanSaveRequest {
    private Long planId; // 用于更新现有计划
    
    @NotNull(message = "旅行计划标题不能为空")
    @NotBlank(message = "旅行计划标题不能为空")
    @JsonProperty("trip_title")
    private String tripTitle;

    @NotNull(message = "旅行天数不能为空")
    @JsonProperty("total_days")
    private Integer totalDays;

    @NotNull(message = "每日行程不能为空")
    private List<DayInfo> days;

    private String summary;

    @JsonProperty("is_favorited")
    private Boolean isFavorited = false; // 默认为未收藏
}

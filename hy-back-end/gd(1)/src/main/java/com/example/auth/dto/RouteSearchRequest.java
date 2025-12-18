package com.example.auth.dto;

import lombok.Data;

/**
 * 路线查询请求 DTO
 */
@Data
public class RouteSearchRequest {
    private String departure;  // 出发地（必填）
    private String destination;  // 目的地（必填）
    private Double departureLat;  // 出发地纬度（可选）
    private Double departureLng;  // 出发地经度（可选）
    private Double destinationLat;  // 目的地纬度（可选）
    private Double destinationLng;  // 目的地经度（可选）
    private Double distance;  // 距离（可选）
    private Integer duration;  // 预计时长（可选）
    private String routeType;  // 路线类型（可选）：driving、walking、transit、cycling
    private String notes;  // 备注（可选）
}


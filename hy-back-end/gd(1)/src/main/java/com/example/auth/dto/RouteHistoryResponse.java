package com.example.auth.dto;

import lombok.Data;
import java.util.Date;

/**
 * 路线历史记录响应 DTO
 */
@Data
public class RouteHistoryResponse {
    private Long id;
    private Long userId;
    private String departure;
    private String destination;
    private Double departureLat;
    private Double departureLng;
    private Double destinationLat;
    private Double destinationLng;
    private Double distance;
    private Integer duration;
    private String routeType;
    private Date searchTime;
    private Boolean isFavorite;
    private String notes;
}


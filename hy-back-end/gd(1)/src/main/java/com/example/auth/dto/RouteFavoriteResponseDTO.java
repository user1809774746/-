package com.example.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 路由收藏响应 DTO
 * 组合了 RouteFavorite 和 TripScheme 的数据
 */
@Data
public class RouteFavoriteResponseDTO {
    // RouteFavorite 相关字段
    private Integer id;
    private Integer routeId;
    private Long userId;
    private LocalDateTime createTime;
    private Boolean isValid;
    
    // TripScheme 相关字段
    private String trip_title;
    private Integer total_days;
    private String summary;
    private List<DayDetailDTO> days;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getRouteId() {
        return routeId;
    }

    public void setRouteId(Integer routeId) {
        this.routeId = routeId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public Boolean getIsValid() {
        return isValid;
    }

    public void setIsValid(Boolean isValid) {
        this.isValid = isValid;
    }

    public String getTrip_title() {
        return trip_title;
    }

    public void setTrip_title(String trip_title) {
        this.trip_title = trip_title;
    }

    public Integer getTotal_days() {
        return total_days;
    }

    public void setTotal_days(Integer total_days) {
        this.total_days = total_days;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<DayDetailDTO> getDays() {
        return days;
    }

    public void setDays(List<DayDetailDTO> days) {
        this.days = days;
    }
}


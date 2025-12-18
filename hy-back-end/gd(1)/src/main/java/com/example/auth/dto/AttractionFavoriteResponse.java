package com.example.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttractionFavoriteResponse {
    private Integer index;
    private String name;
    private String icon;
    private String address;
    private Double lng;
    private Double lat;
    private Integer userId;
    private LocalDateTime createTime;
    private Integer isValid;
    private Float rating;
    private String distance;
}

package com.example.auth.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ActivityUpdateDTO {

    private String activityTime;

    private String activityName;

    private String location;

    private String description;

    private BigDecimal cost;

    private String transportation;

    private String photoUrl;

    private Integer sortOrder;
}

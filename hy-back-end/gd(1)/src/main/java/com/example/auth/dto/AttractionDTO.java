package com.example.auth.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AttractionDTO {

    private Long id;

    private String name;

    private BigDecimal ticketPriceAdult;

    private BigDecimal ticketPriceStudent;

    private BigDecimal ticketPriceElderly;

    private BigDecimal longitude;

    private BigDecimal latitude;

    private String openingHours;

    private List<String> mustSeeSpots;

    private String tips;

    private String photoUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long dailyItineraryId;

    private String activityTime;
}

package com.example.auth.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "popular_travel_plan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopularTravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "trip_title", nullable = false)
    private String tripTitle;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @Column(name = "days_data", columnDefinition = "json", nullable = false)
    private String daysData; // Store as JSON string

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "created_at", columnDefinition = "datetime default current_timestamp")
    private LocalDateTime createdAt;

    @Column(name = "is_favorited", columnDefinition = "tinyint(1) default 0")
    private Boolean isFavorited;
}

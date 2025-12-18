package com.example.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "travel_plans")
@Data
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "destination", nullable = false, length = 100)
    private String destination;

    @Column(name = "travel_days", nullable = false)
    private Integer travelDays;

    @Column(name = "title")
    private String title;

    @Column(name = "total_budget", precision = 10, scale = 2)
    private BigDecimal totalBudget;

    @Column(name = "total_tips", columnDefinition = "TEXT")
    private String totalTips;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TravelPlanStatus status = TravelPlanStatus.draft;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<DailyItinerary> dailyItineraries = new ArrayList<>();

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Accommodation> accommodations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TravelPlanStatus {
        draft, active, completed
    }
}

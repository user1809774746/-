package com.example.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "itinerary_activities")
@Data
public class ItineraryActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_itinerary_id", nullable = false)
    @JsonIgnore
    private DailyItinerary dailyItinerary;

    @Column(name = "activity_time", nullable = false, length = 50)
    private String activityTime;

    @Column(name = "activity_name", nullable = false, length = 200)
    private String activityName;

    @Column(name = "location", nullable = false, length = 200)
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(name = "transportation", length = 200)
    private String transportation;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_customized")
    private Boolean isCustomized = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

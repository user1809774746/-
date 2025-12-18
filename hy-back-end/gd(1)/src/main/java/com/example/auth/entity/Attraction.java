package com.example.auth.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attractions")
@Data
public class Attraction {

    @Id
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "ticket_price_adult", precision = 10, scale = 2)
    private BigDecimal ticketPriceAdult = BigDecimal.ZERO;

    @Column(name = "ticket_price_student", precision = 10, scale = 2)
    private BigDecimal ticketPriceStudent = BigDecimal.ZERO;

    @Column(name = "ticket_price_elderly", precision = 10, scale = 2)
    private BigDecimal ticketPriceElderly = BigDecimal.ZERO;

    @Column(name = "longitude", precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "latitude", precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(name = "opening_hours", length = 100)
    private String openingHours;

    @Column(name = "must_see_spots", columnDefinition = "JSON")
    private String mustSeeSpots;

    @Column(name = "tips", columnDefinition = "TEXT")
    private String tips;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

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

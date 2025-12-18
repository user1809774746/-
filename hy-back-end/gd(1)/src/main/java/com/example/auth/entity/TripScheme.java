package com.example.auth.entity;

import lombok.Data;
import javax.persistence.*;

@Data
@Entity
@Table(name = "trip_schemes")
public class TripScheme {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String tripTitle;
    private Integer totalDays;
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String routeContent; // Store days as JSON string

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTripTitle() {
        return tripTitle;
    }

    public void setTripTitle(String tripTitle) {
        this.tripTitle = tripTitle;
    }

    public Integer getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRouteContent() {
        return routeContent;
    }

    public void setRouteContent(String routeContent) {
        this.routeContent = routeContent;
    }
}

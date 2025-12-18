package com.example.auth.dto;

import lombok.Data;
import java.util.List;

@Data
public class DayDetailDTO {
    private Integer day;
    private String theme;
    private List<String> routes_used;
    private List<String> spots;
    private String time_schedule;
    private String highlights;
    private String photo;

    public Integer getDay() {
        return day;
    }

    public void setDay(Integer day) {
        this.day = day;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public List<String> getRoutes_used() {
        return routes_used;
    }

    public void setRoutes_used(List<String> routes_used) {
        this.routes_used = routes_used;
    }

    public List<String> getSpots() {
        return spots;
    }

    public void setSpots(List<String> spots) {
        this.spots = spots;
    }

    public String getTime_schedule() {
        return time_schedule;
    }

    public void setTime_schedule(String time_schedule) {
        this.time_schedule = time_schedule;
    }

    public String getHighlights() {
        return highlights;
    }

    public void setHighlights(String highlights) {
        this.highlights = highlights;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }
}

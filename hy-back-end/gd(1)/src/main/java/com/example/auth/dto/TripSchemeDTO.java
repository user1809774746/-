package com.example.auth.dto;

import lombok.Data;
import java.util.List;

@Data
public class TripSchemeDTO {
    private Integer id;
    private String trip_title;
    private Integer total_days;
    private List<DayDetailDTO> days;
    private String summary;

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

    public List<DayDetailDTO> getDays() {
        return days;
    }

    public void setDays(List<DayDetailDTO> days) {
        this.days = days;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}

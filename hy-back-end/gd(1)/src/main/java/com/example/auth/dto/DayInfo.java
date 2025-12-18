package com.example.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class DayInfo {
    private Integer day;
    private String theme;

    @JsonProperty("routes_used")
    private List<String> routesUsed;
    private List<String> spots; // Changed from List<SpotInfo> to List<String>
    private String highlights;
    private String photo; // Added new photo field
}

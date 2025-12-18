package com.example.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TravelPlanDTO {
    
    @JsonProperty("travel_plan")
    @JsonAlias({"travelPlan", "plan", "travelplan"})
    private TravelPlanData travelPlan;
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TravelPlanData {
        private String title;
        private String destination;
        
        @JsonProperty("travel_days")
        @JsonAlias({"travelDays", "traveldays"})
        private String travelDays;  // 改为String以兼容"3天"格式
        
        private String date;
        
        @JsonProperty("total_budget")
        @JsonAlias({"totalBudget", "totalbudget"})
        private String totalBudget;  // 改为String以兼容"5000元"格式
        
        @JsonProperty("budget_breakdown")
        @JsonAlias("budgetBreakdown")
        private BudgetBreakdown budgetBreakdown;
        
        @JsonProperty("daily_itinerary")
        @JsonAlias({"dailyItinerary", "itinerary"})
        private List<DailyItineraryDTO> dailyItinerary;
        
        @JsonProperty("accommodation_recommendations")
        @JsonAlias({"accommodationRecommendations", "accommodation"})
        private List<AccommodationDTO> accommodationRecommendations;
        
        @JsonProperty("attraction_details")
        @JsonAlias("attractionDetails")
        private List<AttractionDTO> attractionDetails;
        
        @JsonProperty("total_tips")
        @JsonAlias({"totalTips", "traveltips", "travelTips"})
        private String totalTips;
        
        @JsonProperty("special_requirements")
        @JsonAlias("specialRequirements")
        private String specialRequirements;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BudgetBreakdown {
        private String transportation;  // 改为String以兼容"约200元"格式
        private String accommodation;   // 改为String以兼容"约900元"格式
        private String tickets;         // 改为String以兼容"约300元"格式
        private String food;            // 改为String以兼容"约500元"格式
        private String other;           // 改为String以兼容"剩余可用于购物和应急"格式
    }
    
    @Data
    public static class DailyItineraryDTO {
        private Integer day;
        private String date;
        private List<ActivityDTO> activities;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ActivityDTO {
        private String time;
        private String activity;
        private String location;
        private String city;
        private String description;
        private String cost;  // 改为String以兼容"龙门石窟100元，洛阳博物馆免费"等格式
        private String transportation;

        @JsonProperty("photo")
        @JsonAlias({"photoUrl", "photo_url", "image", "imageUrl", "image_url"})
        private String photoUrl;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AccommodationDTO {
        private String name;
        private String type;
        private String location;
        
        @JsonProperty("price_per_night")
        @JsonAlias({"pricePerNight", "pricepernight"})
        private String pricePerNight;  // 改为String以兼容"150元"格式
        
        private String advantages;

        @JsonProperty("photo")
        @JsonAlias({"photoUrl", "photo_url", "image", "imageUrl", "image_url"})
        private String photo;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AttractionDTO {
        private String name;
        
        @JsonProperty("ticket_price")
        @JsonAlias("ticketPrice")
        private TicketPrice ticketPrice;
        
        @JsonProperty("log_lat")
        @JsonAlias({"logLat", "log_lat", "coordinates"})
        private String logLat;
        
        @JsonProperty("opening_hours")
        @JsonAlias("openingHours")
        private String openingHours;
        
        @JsonProperty("must_see_spots")
        @JsonAlias("mustSeeSpots")
        private List<String> mustSeeSpots;
        
        private String tips;
        
        @JsonProperty("photo")
        @JsonAlias({"photoUrl", "photo_url", "image", "imageUrl", "image_url"})
        private String photo;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TicketPrice {
        private String adult;    // 改为String以兼容"免费"、"100元"等格式
        private String student;  // 改为String以兼容"免费"、"优惠的价格"等格式
        private String elderly;  // 改为String以兼容"免费"、"优惠的价格"等格式
    }
}

package com.example.auth.repository;

import com.example.auth.entity.DailyItinerary;
import com.example.auth.entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailyItineraryRepository extends JpaRepository<DailyItinerary, Long> {
    
    List<DailyItinerary> findByTravelPlanIdOrderByDayNumberAsc(Long travelPlanId);
    
    List<DailyItinerary> findByTravelPlan(TravelPlan travelPlan);
}

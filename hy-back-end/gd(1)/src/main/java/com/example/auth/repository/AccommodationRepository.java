package com.example.auth.repository;

import com.example.auth.entity.Accommodation;
import com.example.auth.entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccommodationRepository extends JpaRepository<Accommodation, Long> {
    
    List<Accommodation> findByTravelPlanId(Long travelPlanId);
    
    List<Accommodation> findByTravelPlan(TravelPlan travelPlan);
}

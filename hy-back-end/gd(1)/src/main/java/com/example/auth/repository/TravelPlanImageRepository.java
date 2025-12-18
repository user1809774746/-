package com.example.auth.repository;

import com.example.auth.entity.TravelPlanImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TravelPlanImageRepository extends JpaRepository<TravelPlanImage, Long> {

    List<TravelPlanImage> findByTravelPlan_Id(Long travelPlanId);

    Optional<TravelPlanImage> findFirstByTravelPlan_IdOrderByCreatedAtAsc(Long travelPlanId);
}

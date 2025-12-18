package com.example.auth.repository;

import com.example.auth.entity.PopularTravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PopularTravelPlanRepository extends JpaRepository<PopularTravelPlan, Long> {
    Optional<PopularTravelPlan> findByPlanIdAndUserId(Long planId, Long userId);
}

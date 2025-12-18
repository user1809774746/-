package com.example.auth.repository;

import com.example.auth.entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {
    
    List<TravelPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    TravelPlan findTopByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<TravelPlan> findByUserId(Long userId);
    
    List<TravelPlan> findByUserIdAndStatus(Long userId, TravelPlan.TravelPlanStatus status);

    List<TravelPlan> findByUserIdAndStartDateLessThanEqualAndStatus(Long userId, LocalDate date, TravelPlan.TravelPlanStatus status);

    List<TravelPlan> findByUserIdAndStartDateLessThanEqualAndStatusNot(Long userId, LocalDate date, TravelPlan.TravelPlanStatus status);

    long countByUserId(Long userId);
    
    List<TravelPlan> findByStatus(TravelPlan.TravelPlanStatus status);
    
    List<TravelPlan> findByUserIdAndStartDateAndStatus(Long userId, LocalDate startDate, TravelPlan.TravelPlanStatus status);
}

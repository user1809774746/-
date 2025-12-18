package com.example.auth.repository;

import com.example.auth.entity.ItineraryActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryActivityRepository extends JpaRepository<ItineraryActivity, Long> {
    
    List<ItineraryActivity> findByDailyItineraryIdOrderBySortOrderAsc(Long dailyItineraryId);
}

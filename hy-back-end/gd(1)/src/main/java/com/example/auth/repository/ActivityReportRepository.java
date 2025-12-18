package com.example.auth.repository;

import com.example.auth.entity.ActivityReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityReportRepository extends JpaRepository<ActivityReport, Long> {

    List<ActivityReport> findByActivityIdOrderByCreatedTimeDesc(Long activityId);

    @Query("SELECT DISTINCT ar.activityId FROM ActivityReport ar WHERE ar.status = :status")
    List<Long> findDistinctActivityIdsByStatus(@Param("status") String status);
}

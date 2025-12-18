package com.example.auth.repository;

import com.example.auth.entity.UserPostReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPostReportRepository extends JpaRepository<UserPostReport, Long> {

    List<UserPostReport> findByPostIdOrderByCreatedTimeDesc(Long postId);

    List<UserPostReport> findByReporterIdOrderByCreatedTimeDesc(Long reporterId);

    List<UserPostReport> findByStatusOrderByCreatedTimeDesc(String status);

    Page<UserPostReport> findByStatus(String status, Pageable pageable);

    boolean existsByPostIdAndReporterIdAndStatus(Long postId, Long reporterId, String status);
}

package com.example.auth.repository;

import com.example.auth.entity.UserPostCommentReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPostCommentReportRepository extends JpaRepository<UserPostCommentReport, Long> {

    List<UserPostCommentReport> findByCommentIdOrderByCreatedTimeDesc(Long commentId);

    List<UserPostCommentReport> findByPostIdOrderByCreatedTimeDesc(Long postId);

    List<UserPostCommentReport> findByReporterIdOrderByCreatedTimeDesc(Long reporterId);

    List<UserPostCommentReport> findByReportedUserIdOrderByCreatedTimeDesc(Long reportedUserId);

    List<UserPostCommentReport> findByStatusOrderByCreatedTimeDesc(String status);

    Page<UserPostCommentReport> findByStatus(String status, Pageable pageable);
}

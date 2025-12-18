package com.example.auth.repository;

import com.example.auth.entity.UserReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserReportRepository extends JpaRepository<UserReport, Long> {

    /**
     * 根据被举报用户查询举报记录
     */
    List<UserReport> findByReportedUserIdOrderByCreatedTimeDesc(Long reportedUserId);

    /**
     * 根据举报人查询举报记录
     */
    List<UserReport> findByReporterIdOrderByCreatedTimeDesc(Long reporterId);

    /**
     * 统计某个用户指定状态的举报数量
     */
    Long countByReportedUserIdAndStatus(Long reportedUserId, String status);
}

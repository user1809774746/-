package com.example.chat.repository;

import com.example.chat.entity.GroupReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 群聊举报数据访问层
 */
@Repository
public interface GroupReportRepository extends JpaRepository<GroupReport, Long> {
    
    /**
     * 根据群ID查询所有举报记录
     */
    List<GroupReport> findByGroupIdOrderByCreatedTimeDesc(Long groupId);
    
    /**
     * 根据举报人ID查询举报记录
     */
    List<GroupReport> findByReporterIdOrderByCreatedTimeDesc(Long reporterId);
    
    /**
     * 根据举报状态查询
     */
    List<GroupReport> findByReportStatusOrderByCreatedTimeDesc(String reportStatus);
    
    /**
     * 查询用户是否已举报过某个群
     */
    @Query("SELECT COUNT(r) > 0 FROM GroupReport r WHERE r.groupId = :groupId AND r.reporterId = :reporterId")
    boolean existsByGroupIdAndReporterId(@Param("groupId") Long groupId, @Param("reporterId") Long reporterId);
    
    /**
     * 查询待处理的举报数量
     */
    @Query("SELECT COUNT(r) FROM GroupReport r WHERE r.reportStatus = 'pending'")
    long countPendingReports();
}

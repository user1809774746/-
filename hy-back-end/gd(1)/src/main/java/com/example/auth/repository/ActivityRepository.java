package com.example.auth.repository;

import com.example.auth.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    // 根据审核状态查询活动
    List<Activity> findByAuditStatusOrderByCreatedTimeDesc(Activity.AuditStatus auditStatus);
    
    // 根据城市查询已审核通过的活动
    @Query("SELECT a FROM Activity a WHERE a.city = :city AND a.auditStatus = 'approved' AND a.status = 'published' ORDER BY a.createdTime DESC")
    List<Activity> findByCityAndApproved(@Param("city") String city);
    
    // 查询所有已审核通过的活动（推荐页面）
    @Query("SELECT a FROM Activity a WHERE a.auditStatus = 'approved' AND a.status = 'published' ORDER BY a.createdTime DESC")
    List<Activity> findAllApproved();
    
    // 根据组织者ID查询活动
    List<Activity> findByOrganizerIdOrderByCreatedTimeDesc(Long organizerId);
    
    // 查询用户参与的活动ID列表
    @Query("SELECT DISTINCT ap.activityId FROM ActivityParticipant ap WHERE ap.userId = :userId AND ap.status IN ('approved', 'attended')")
    List<Long> findParticipatedActivityIds(@Param("userId") Long userId);
    
    // 根据活动ID列表查询活动
    List<Activity> findByIdInOrderByCreatedTimeDesc(List<Long> activityIds);
    
    // 查询待审核的活动
    @Query("SELECT a FROM Activity a WHERE a.auditStatus = 'pending' ORDER BY a.createdTime ASC")
    Page<Activity> findPendingActivities(Pageable pageable);
    
    // 查询被举报的活动（存在指定状态的举报记录）
    @Query("SELECT DISTINCT a FROM Activity a JOIN ActivityReport ar ON a.id = ar.activityId WHERE ar.status = :status ORDER BY a.createdTime DESC")
    Page<Activity> findReportedActivities(@Param("status") String status, Pageable pageable);
    
    // 根据ID和组织者ID查询活动（确保只能操作自己的活动）
    Optional<Activity> findByIdAndOrganizerId(Long id, Long organizerId);
    
    // 查询热门活动
    @Query("SELECT a FROM Activity a WHERE a.auditStatus = 'approved' AND a.status = 'published' AND a.isHot = true ORDER BY a.viewCount DESC, a.currentParticipants DESC")
    List<Activity> findHotActivities();
    
    // 查询推荐活动
    @Query("SELECT a FROM Activity a WHERE a.auditStatus = 'approved' AND a.status = 'published' AND a.isRecommended = true ORDER BY a.createdTime DESC")
    List<Activity> findRecommendedActivities();
    
    // 根据分类查询活动
    @Query("SELECT a FROM Activity a WHERE a.category = :category AND a.auditStatus = 'approved' AND a.status = 'published' ORDER BY a.createdTime DESC")
    List<Activity> findByCategory(@Param("category") Activity.ActivityCategory category);
    
    // 搜索活动
    @Query("SELECT a FROM Activity a WHERE (a.title LIKE %:keyword% OR a.description LIKE %:keyword% OR a.tags LIKE %:keyword%) AND a.auditStatus = 'approved' AND a.status = 'published' ORDER BY a.createdTime DESC")
    List<Activity> searchActivities(@Param("keyword") String keyword);
}

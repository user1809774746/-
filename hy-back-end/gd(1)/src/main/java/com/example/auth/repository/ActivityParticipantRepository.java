package com.example.auth.repository;

import com.example.auth.entity.ActivityParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, Long> {
    
    // 查询用户是否已报名某个活动
    Optional<ActivityParticipant> findByActivityIdAndUserId(Long activityId, Long userId);
    
    // 查询活动的所有参与者
    List<ActivityParticipant> findByActivityIdOrderByRegistrationTimeDesc(Long activityId);
    
    // 查询用户参与的所有活动
    List<ActivityParticipant> findByUserIdOrderByRegistrationTimeDesc(Long userId);
    
    // 查询活动的已通过参与者数量
    @Query("SELECT COUNT(ap) FROM ActivityParticipant ap WHERE ap.activityId = :activityId AND ap.status IN ('approved', 'attended')")
    Long countApprovedParticipants(@Param("activityId") Long activityId);
    
    // 查询活动的待审核参与者
    List<ActivityParticipant> findByActivityIdAndStatusOrderByRegistrationTimeAsc(Long activityId, ActivityParticipant.ParticipantStatus status);
    
    // 查询用户在某个活动中的参与状态
    @Query("SELECT ap.status FROM ActivityParticipant ap WHERE ap.activityId = :activityId AND ap.userId = :userId")
    Optional<ActivityParticipant.ParticipantStatus> findParticipantStatus(@Param("activityId") Long activityId, @Param("userId") Long userId);
    
    // 查询活动组织者需要审核的报名申请
    @Query("SELECT ap FROM ActivityParticipant ap JOIN Activity a ON ap.activityId = a.id WHERE a.organizerId = :organizerId AND ap.status = 'pending' ORDER BY ap.registrationTime ASC")
    List<ActivityParticipant> findPendingParticipantsByOrganizer(@Param("organizerId") Long organizerId);
    
    // 删除用户的活动参与记录
    void deleteByActivityIdAndUserId(Long activityId, Long userId);
    
    // 查询用户参与的不同状态的活动数量
    @Query("SELECT COUNT(ap) FROM ActivityParticipant ap WHERE ap.userId = :userId AND ap.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ActivityParticipant.ParticipantStatus status);
}

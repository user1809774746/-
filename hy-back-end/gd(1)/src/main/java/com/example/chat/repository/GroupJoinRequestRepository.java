package com.example.chat.repository;

import com.example.chat.entity.GroupJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 入群申请Repository
 */
@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {

    /**
     * 查找待处理的入群申请
     */
    List<GroupJoinRequest> findByGroupIdAndRequestStatusOrderByCreatedTimeDesc(Long groupId, String requestStatus);

    /**
     * 查找用户的入群申请
     */
    List<GroupJoinRequest> findByApplicantIdAndRequestStatusOrderByCreatedTimeDesc(Long applicantId, String requestStatus);

    /**
     * 检查是否存在待处理的申请
     */
    boolean existsByGroupIdAndApplicantIdAndRequestStatus(Long groupId, Long applicantId, String requestStatus);

    /**
     * 查找未过期的待处理申请
     */
    @Query("SELECT jr FROM GroupJoinRequest jr WHERE jr.groupId = :groupId AND jr.requestStatus = 'pending' AND (jr.expireTime IS NULL OR jr.expireTime > :now)")
    List<GroupJoinRequest> findPendingRequests(@Param("groupId") Long groupId, @Param("now") LocalDateTime now);

    /**
     * 查找指定用户和群的待处理申请
     */
    Optional<GroupJoinRequest> findByGroupIdAndApplicantIdAndRequestStatus(Long groupId, Long applicantId, String requestStatus);
}

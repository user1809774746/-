package com.example.auth.repository;

import com.example.auth.entity.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 用户反馈Repository
 */
@Repository
public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {

    /**
     * 查询所有未删除的反馈（按创建时间倒序）
     */
    List<UserFeedback> findByIsDeletedOrderByCreatedTimeDesc(Boolean isDeleted);

    /**
     * 按状态查询反馈
     */
    List<UserFeedback> findByStatusAndIsDeletedOrderByCreatedTimeDesc(String status, Boolean isDeleted);

    /**
     * 按反馈类型查询
     */
    List<UserFeedback> findByFeedbackTypeAndIsDeletedOrderByCreatedTimeDesc(String feedbackType, Boolean isDeleted);

    /**
     * 查询某个用户的反馈
     */
    List<UserFeedback> findByUserIdAndIsDeletedOrderByCreatedTimeDesc(Long userId, Boolean isDeleted);

    /**
     * 统计未处理的反馈数量
     */
    @Query("SELECT COUNT(f) FROM UserFeedback f WHERE f.status = 'pending' AND f.isDeleted = false")
    Long countPendingFeedback();

    /**
     * 按优先级和状态查询
     */
    List<UserFeedback> findByPriorityAndStatusAndIsDeletedOrderByCreatedTimeDesc(
            String priority, String status, Boolean isDeleted);
}


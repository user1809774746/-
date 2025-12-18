package com.example.auth.repository;

import com.example.auth.entity.UserPostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 帖子评论数据访问接口
 */
@Repository
public interface UserPostCommentRepository extends JpaRepository<UserPostComment, Long> {
    
    /**
     * 根据帖子ID查询评论，按创建时间升序排列
     */
    List<UserPostComment> findByPostIdAndStatusOrderByCreatedTimeAsc(Long postId, String status);
    
    /**
     * 根据父评论ID查询回复
     */
    List<UserPostComment> findByParentCommentIdAndStatusOrderByCreatedTimeAsc(Long parentCommentId, String status);
    
    /**
     * 查询帖子的顶级评论（没有父评论的评论）
     */
    List<UserPostComment> findByPostIdAndParentCommentIdIsNullAndStatusOrderByCreatedTimeAsc(Long postId, String status);
    
    /**
     * 根据用户ID查询评论
     */
    List<UserPostComment> findByUserIdAndStatusOrderByCreatedTimeDesc(Long userId, String status);
    
    /**
     * 根据ID和用户ID查询评论（用于权限验证）
     */
    Optional<UserPostComment> findByIdAndUserId(Long id, Long userId);
    
    /**
     * 统计帖子评论数（包括回复）
     */
    Long countByPostIdAndStatus(Long postId, String status);
    
    /**
     * 统计评论的回复数
     */
    Long countByParentCommentIdAndStatus(Long parentCommentId, String status);
    
    /**
     * 统计用户评论数
     */
    Long countByUserIdAndStatus(Long userId, String status);
    
    /**
     * 查询评论树结构
     */
    @Query("SELECT c FROM UserPostComment c WHERE c.postId = :postId AND c.status = :status " +
           "ORDER BY CASE WHEN c.parentCommentId IS NULL THEN c.id ELSE c.parentCommentId END, " +
           "c.parentCommentId ASC, c.createdTime ASC")
    List<UserPostComment> findCommentTree(@Param("postId") Long postId, @Param("status") String status);
}

package com.example.auth.repository;

import com.example.auth.entity.UserPostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 帖子点赞数据访问接口
 */
@Repository
public interface UserPostLikeRepository extends JpaRepository<UserPostLike, Long> {
    
    /**
     * 查询用户是否已点赞某帖子
     */
    Optional<UserPostLike> findByPostIdAndUserId(Long postId, Long userId);
    
    /**
     * 查询帖子的所有点赞记录
     */
    List<UserPostLike> findByPostIdOrderByCreatedTimeDesc(Long postId);
    
    /**
     * 查询用户点赞的所有帖子
     */
    List<UserPostLike> findByUserIdOrderByCreatedTimeDesc(Long userId);
    
    /**
     * 统计帖子点赞数
     */
    Long countByPostId(Long postId);
    
    /**
     * 统计用户点赞数
     */
    Long countByUserId(Long userId);
    
    /**
     * 检查用户是否已点赞帖子
     */
    Boolean existsByPostIdAndUserId(Long postId, Long userId);
}

package com.example.auth.repository;

import com.example.auth.entity.UserTravelPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户帖子关联表数据访问接口
 */
@Repository
public interface UserTravelPostRepository extends JpaRepository<UserTravelPost, Long> {
    
    /**
     * 根据travel_post_id和发布者ID查询用户帖子关联记录
     */
    Optional<UserTravelPost> findByTravelPostIdAndPublisherId(Long travelPostId, Long publisherId);
    
    /**
     * 根据travel_post_id查询用户帖子关联记录
     */
    Optional<UserTravelPost> findByTravelPostId(Long travelPostId);
    
    /**
     * 根据发布者ID和用户状态查询帖子，按用户发布时间降序排列
     */
    List<UserTravelPost> findByPublisherIdAndUserStatusOrderByUserPublishedTimeDesc(Long publisherId, String userStatus);
    
    /**
     * 根据发布者ID查询所有关联记录
     */
    List<UserTravelPost> findByPublisherId(Long publisherId);
    
    /**
     * 根据发布者ID和用户状态查询帖子数量
     */
    Long countByPublisherIdAndUserStatus(Long publisherId, String userStatus);
    
    /**
     * 根据用户状态查询所有关联记录
     */
    List<UserTravelPost> findByUserStatus(String userStatus);
}

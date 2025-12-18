package com.example.auth.repository;

import com.example.auth.entity.TravelPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 旅游帖子主表仓库接口
 */
@Repository
public interface TravelPostRepository extends JpaRepository<TravelPost, Long> {

    /**
     * 根据状态查找帖子
     */
    List<TravelPost> findByStatusOrderByPublishedTimeDesc(String status);

    /**
     * 根据帖子类型和状态查找帖子
     */
    List<TravelPost> findByPostTypeAndStatusOrderByPublishedTimeDesc(String postType, String status);

    /**
     * 根据目的地城市和状态查找帖子
     */
    List<TravelPost> findByDestinationCityAndStatusOrderByPublishedTimeDesc(String destinationCity, String status);

    /**
     * 搜索帖子（标题、内容、目的地）
     */
    @Query("SELECT p FROM TravelPost p WHERE " +
           "(p.title LIKE %:keyword% OR p.content LIKE %:keyword% OR " +
           "p.destinationName LIKE %:keyword% OR p.destinationCity LIKE %:keyword% OR " +
           "p.tags LIKE %:keyword% OR p.keywords LIKE %:keyword%) " +
           "AND p.status = :status " +
           "ORDER BY p.publishedTime DESC")
    Page<TravelPost> searchPosts(@Param("keyword") String keyword,
                                @Param("status") String status,
                                Pageable pageable);

    /**
     * 根据ID和状态查找帖子
     */
    Optional<TravelPost> findByIdAndStatus(Long id, String status);

    /**
     * 根据分类和状态查找帖子
     */
    List<TravelPost> findByCategoryAndStatusOrderByPublishedTimeDesc(String category, String status);

    /**
     * 获取热门帖子（按浏览量排序）
     */
    @Query("SELECT p FROM TravelPost p WHERE p.status = :status " +
           "ORDER BY p.viewCount DESC, p.likeCount DESC")
    List<TravelPost> findHotPosts(@Param("status") String status);

    /**
     * 获取推荐帖子（按点赞数和评论数排序）
     */
    @Query("SELECT p FROM TravelPost p WHERE p.status = :status " +
           "ORDER BY (p.likeCount + p.commentCount) DESC, p.publishedTime DESC")
    List<TravelPost> findRecommendedPosts(@Param("status") String status);

    /**
     * 根据发布者ID查找帖子
     */
    List<TravelPost> findByPublisherIdAndStatusOrderByPublishedTimeDesc(Long publisherId, String status);

    /**
     * 根据发布者ID查找帖子（分页）
     */
    Page<TravelPost> findByPublisherIdAndStatusOrderByPublishedTimeDesc(Long publisherId, String status, Pageable pageable);

    /**
     * 根据发布者ID查找所有帖子
     */
    List<TravelPost> findByPublisherIdOrderByCreatedTimeDesc(Long publisherId);

    /**
     * 根据发布者ID查找所有帖子（分页）
     */
    Page<TravelPost> findByPublisherIdOrderByCreatedTimeDesc(Long publisherId, Pageable pageable);

    // ========== 管理员审核相关方法 ==========

    /**
     * 根据审核状态查找帖子（分页）
     */
    Page<TravelPost> findByAuditStatus(String auditStatus, Pageable pageable);

    /**
     * 根据发布状态查找帖子（分页）
     */
    Page<TravelPost> findByStatus(String status, Pageable pageable);

    /**
     * 根据审核状态和发布状态查找帖子（分页）
     */
    Page<TravelPost> findByAuditStatusAndStatus(String auditStatus, String status, Pageable pageable);

    /**
     * 根据帖子类型和状态查找帖子（分页）
     */
    Page<TravelPost> findByPostTypeAndStatus(String postType, String status, Pageable pageable);

    /**
     * 根据目的地城市和状态查找帖子（分页）
     */
    Page<TravelPost> findByDestinationCityAndStatus(String destinationCity, String status, Pageable pageable);

    /**
     * 统计指定审核状态的帖子数量
     */
    long countByAuditStatus(String auditStatus);

    /**
     * 统计指定发布状态的帖子数量
     */
    long countByStatus(String status);

    /**
     * 统计精选帖子数量
     */
    long countByIsFeatured(Boolean isFeatured);

    /**
     * 统计置顶帖子数量
     */
    long countByIsTop(Boolean isTop);

    /**
     * 获取用户最近一次发布的帖子
     */
    @Query("SELECT p FROM TravelPost p WHERE p.publisherId = :publisherId AND p.status = 'published' " +
           "ORDER BY p.publishedTime DESC")
    List<TravelPost> findLatestPublishedByPublisherId(@Param("publisherId") Long publisherId, Pageable pageable);
}

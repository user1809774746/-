package com.example.auth.repository;

import com.example.auth.entity.TravelPostFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 旅游帖子收藏数据访问接口
 */
@Repository
public interface TravelPostFavoriteRepository extends JpaRepository<TravelPostFavorite, Long> {
    
    /**
     * 根据用户ID查询收藏的帖子，按收藏时间降序排列
     */
    List<TravelPostFavorite> findByUserIdAndStatusAndIsDeletedOrderByFavoriteTimeDesc(
            Long userId, String status, Boolean isDeleted);
    
    /**
     * 根据用户ID和帖子类型查询收藏
     */
    List<TravelPostFavorite> findByUserIdAndPostTypeAndStatusAndIsDeletedOrderByFavoriteTimeDesc(
            Long userId, String postType, String status, Boolean isDeleted);
    
    /**
     * 根据用户ID和收藏分类查询收藏
     */
    List<TravelPostFavorite> findByUserIdAndFavoriteCategoryAndStatusAndIsDeletedOrderByFavoriteTimeDesc(
            Long userId, String favoriteCategory, String status, Boolean isDeleted);
    
    /**
     * 根据用户ID和阅读状态查询收藏
     */
    List<TravelPostFavorite> findByUserIdAndReadStatusAndStatusAndIsDeletedOrderByFavoriteTimeDesc(
            Long userId, String readStatus, String status, Boolean isDeleted);
    
    /**
     * 根据用户ID和目的地城市查询收藏
     */
    List<TravelPostFavorite> findByUserIdAndDestinationCityAndStatusAndIsDeletedOrderByFavoriteTimeDesc(
            Long userId, String destinationCity, String status, Boolean isDeleted);
    
    /**
     * 根据用户ID和优先级查询收藏（按优先级和收藏时间排序）
     */
    List<TravelPostFavorite> findByUserIdAndPriorityLevelAndStatusAndIsDeletedOrderByPriorityLevelDescFavoriteTimeDesc(
            Long userId, Integer priorityLevel, String status, Boolean isDeleted);
    
    /**
     * 统计用户收藏的帖子数量
     */
    Long countByUserIdAndStatusAndIsDeleted(Long userId, String status, Boolean isDeleted);
    
    /**
     * 查询用户收藏的帖子类型统计
     */
    @Query("SELECT tpf.postType, COUNT(tpf) FROM TravelPostFavorite tpf " +
           "WHERE tpf.userId = :userId AND tpf.status = :status AND tpf.isDeleted = :isDeleted " +
           "GROUP BY tpf.postType")
    List<Object[]> countByUserIdAndStatusGroupByPostType(
            @Param("userId") Long userId, 
            @Param("status") String status, 
            @Param("isDeleted") Boolean isDeleted);
    
    /**
     * 查询用户收藏的目的地统计
     */
    @Query("SELECT tpf.destinationCity, COUNT(tpf) FROM TravelPostFavorite tpf " +
           "WHERE tpf.userId = :userId AND tpf.status = :status AND tpf.isDeleted = :isDeleted " +
           "GROUP BY tpf.destinationCity")
    List<Object[]> countByUserIdAndStatusGroupByDestination(
            @Param("userId") Long userId, 
            @Param("status") String status, 
            @Param("isDeleted") Boolean isDeleted);
    
    /**
     * 多条件组合查询收藏的帖子
     * 支持同时使用多个筛选条件
     */
    @Query("SELECT tpf FROM TravelPostFavorite tpf WHERE tpf.userId = :userId " +
           "AND tpf.status = 'active' AND tpf.isDeleted = false " +
           "AND (:postType IS NULL OR :postType = '' OR tpf.postType = :postType) " +
           "AND (:favoriteCategory IS NULL OR :favoriteCategory = '' OR tpf.favoriteCategory = :favoriteCategory) " +
           "AND (:readStatus IS NULL OR :readStatus = '' OR tpf.readStatus = :readStatus) " +
           "AND (:destinationCity IS NULL OR :destinationCity = '' OR tpf.destinationCity = :destinationCity) " +
           "AND (:priorityLevel IS NULL OR tpf.priorityLevel = :priorityLevel) " +
           "ORDER BY tpf.favoriteTime DESC")
    List<TravelPostFavorite> findByMultipleConditions(
            @Param("userId") Long userId,
            @Param("postType") String postType,
            @Param("favoriteCategory") String favoriteCategory,
            @Param("readStatus") String readStatus,
            @Param("destinationCity") String destinationCity,
            @Param("priorityLevel") Integer priorityLevel);
    
    /**
     * 根据用户ID和帖子ID查询收藏记录
     */
    Optional<TravelPostFavorite> findByUserIdAndPostId(Long userId, Long postId);
    
    /**
     * 检查用户是否已收藏某个帖子
     */
    boolean existsByUserIdAndPostIdAndStatusAndIsDeleted(
            Long userId, Long postId, String status, Boolean isDeleted);
}

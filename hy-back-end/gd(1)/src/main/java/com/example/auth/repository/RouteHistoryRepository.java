package com.example.auth.repository;

import com.example.auth.entity.RouteHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 路线历史记录数据访问接口
 */
@Repository
public interface RouteHistoryRepository extends JpaRepository<RouteHistory, Long> {
    
    /**
     * 根据用户ID查询历史记录，按查询时间降序排列
     */
    List<RouteHistory> findByUserIdOrderBySearchTimeDesc(Long userId);
    
    /**
     * 根据用户ID和收藏状态查询历史记录
     */
    List<RouteHistory> findByUserIdAndIsFavoriteOrderBySearchTimeDesc(Long userId, Boolean isFavorite);
    
    /**
     * 根据用户ID统计历史记录数量
     */
    Long countByUserId(Long userId);
}


package com.example.auth.repository;

import com.example.auth.entity.UserPostDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 帖子草稿数据访问接口
 */
@Repository
public interface UserPostDraftRepository extends JpaRepository<UserPostDraft, Long> {
    
    /**
     * 根据发布者ID查询草稿，按更新时间降序排列
     */
    List<UserPostDraft> findByPublisherIdOrderByUpdatedTimeDesc(Long publisherId);
    
    /**
     * 根据ID和发布者ID查询草稿（用于权限验证）
     */
    Optional<UserPostDraft> findByIdAndPublisherId(Long id, Long publisherId);
    
    /**
     * 统计用户草稿数量
     */
    Long countByPublisherId(Long publisherId);
}

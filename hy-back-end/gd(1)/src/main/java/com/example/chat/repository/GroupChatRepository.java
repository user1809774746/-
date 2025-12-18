package com.example.chat.repository;

import com.example.chat.entity.GroupChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 群聊Repository
 */
@Repository
public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {

    /**
     * 根据群ID和状态查找群聊
     */
    Optional<GroupChat> findByGroupIdAndStatus(Long groupId, String status);

    /**
     * 根据创建者ID查找群聊
     */
    List<GroupChat> findByCreatorIdAndStatus(Long creatorId, String status);

    /**
     * 搜索群聊（按群名称模糊查询）
     */
    @Query("SELECT g FROM GroupChat g WHERE g.groupName LIKE %:keyword% AND g.status = 'active'")
    List<GroupChat> searchByGroupName(@Param("keyword") String keyword);

    /**
     * 统计用户创建的群聊数量
     */
    Long countByCreatorIdAndStatus(Long creatorId, String status);
}

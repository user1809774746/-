package com.example.chat.repository;

import com.example.chat.entity.GroupMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 群聊消息Repository
 */
@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    /**
     * 分页获取群聊消息（不包含已撤回的消息）
     */
    Page<GroupMessage> findByGroupIdAndIsRecalledFalseOrderBySentTimeDesc(Long groupId, Pageable pageable);

    /**
     * 获取群聊消息（包含已撤回的消息）
     */
    Page<GroupMessage> findByGroupIdOrderBySentTimeDesc(Long groupId, Pageable pageable);

    /**
     * 搜索群聊消息（模糊搜索内容）
     */
    @Query("SELECT gm FROM GroupMessage gm WHERE gm.groupId = :groupId " +
           "AND gm.messageType = 'text' " +
           "AND gm.isRecalled = false " +
           "AND gm.content LIKE %:keyword% " +
           "ORDER BY gm.sentTime DESC")
    Page<GroupMessage> searchGroupMessages(@Param("groupId") Long groupId, 
                                           @Param("keyword") String keyword, 
                                           Pageable pageable);

    /**
     * 获取某个时间之后的消息数量（用于未读统计）
     */
    @Query("SELECT COUNT(gm) FROM GroupMessage gm WHERE gm.groupId = :groupId " +
           "AND gm.sentTime > :afterTime " +
           "AND gm.senderId != :userId " +
           "AND gm.isRecalled = false")
    Long countUnreadMessages(@Param("groupId") Long groupId, 
                            @Param("afterTime") LocalDateTime afterTime,
                            @Param("userId") Long userId);

    /**
     * 获取群聊的最新一条消息
     */
    GroupMessage findFirstByGroupIdAndIsRecalledFalseOrderBySentTimeDesc(Long groupId);

    /**
     * 根据消息ID获取消息（用于回复引用）
     */
    GroupMessage findByMessageId(Long messageId);

    /**
     * 获取某条消息的所有回复
     */
    List<GroupMessage> findByReplyToMessageIdOrderBySentTimeAsc(Long replyToMessageId);

    /**
     * 批量删除群聊消息（群解散时使用）
     */
    void deleteByGroupId(Long groupId);

    /**
     * 撤回消息
     */
    @Query("UPDATE GroupMessage gm SET gm.isRecalled = true, gm.recalledTime = :recallTime " +
           "WHERE gm.messageId = :messageId AND gm.senderId = :senderId")
    int recallMessage(@Param("messageId") Long messageId, 
                     @Param("senderId") Long senderId,
                     @Param("recallTime") LocalDateTime recallTime);

    /**
     * 置顶/取消置顶消息
     */
    @Query("UPDATE GroupMessage gm SET gm.isPinned = :isPinned " +
           "WHERE gm.messageId = :messageId")
    int pinMessage(@Param("messageId") Long messageId, @Param("isPinned") Boolean isPinned);

    /**
     * 获取群聊的置顶消息
     */
    List<GroupMessage> findByGroupIdAndIsPinnedTrueOrderBySentTimeDesc(Long groupId);
}

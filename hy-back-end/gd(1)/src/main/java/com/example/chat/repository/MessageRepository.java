package com.example.chat.repository;

import com.example.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 消息Repository
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    /**
     * 根据会话ID查询所有消息（按时间倒序）
     */
    List<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId);
    
    /**
     * 根据会话ID分页查询消息
     */
    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);
    
    /**
     * 搜索会话中的消息
     */
    @Query("SELECT m FROM Message m WHERE m.conversationId = :conversationId " +
           "AND m.content LIKE %:keyword% AND m.status != 'RECALLED' " +
           "ORDER BY m.createdAt DESC")
    Page<Message> searchMessagesInConversation(@Param("conversationId") Long conversationId, 
                                             @Param("keyword") String keyword, 
                                             Pageable pageable);
    
    /**
     * 获取会话的最新消息
     */
    Message findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);
    
    /**
     * 统计会话中的消息数量
     */
    long countByConversationId(Long conversationId);
    
    /**
     * 删除会话中的所有消息
     */
    void deleteByConversationId(Long conversationId);
    
    /**
     * 查找用户在会话中发送的消息
     */
    List<Message> findByConversationIdAndSenderIdOrderByCreatedAtDesc(Long conversationId, Long senderId);

    /**
     * 查询与指定用户相关的所有消息（他作为发送者或接收者），按时间倒序
     */
    @Query("SELECT m FROM Message m WHERE (m.senderId = :userId OR m.receiverId = :userId) ORDER BY m.createdAt DESC")
    List<Message> findUserMessagesOrderByCreatedAtDesc(@Param("userId") Long userId);

    /**
     * 统计指定会话中，发给某个用户且未读的消息数量
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :conversationId " +
           "AND m.receiverId = :userId AND LOWER(m.status) <> 'read'")
    long countUnreadByConversationIdAndUserId(@Param("conversationId") Long conversationId,
                                             @Param("userId") Long userId);

    /**
     * 查询某个用户在指定会话中收到的所有消息
     */
    List<Message> findByConversationIdAndReceiverId(Long conversationId, Long receiverId);

    /**
     * 根据ID列表和接收者ID查询消息
     */
    List<Message> findByIdInAndReceiverId(List<Long> ids, Long receiverId);

    /**
     * 统计某个用户的未读消息总数
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND LOWER(m.status) <> 'read'")
    long countUnreadByUserId(@Param("userId") Long userId);

    /**
     * 按会话统计某个用户的未读消息数
     * 返回结果中每一行: [conversationId, unreadCount]
     */
    @Query("SELECT m.conversationId, COUNT(m) FROM Message m " +
           "WHERE m.receiverId = :userId AND LOWER(m.status) <> 'read' " +
           "GROUP BY m.conversationId")
    List<Object[]> countUnreadGroupByConversation(@Param("userId") Long userId);
}

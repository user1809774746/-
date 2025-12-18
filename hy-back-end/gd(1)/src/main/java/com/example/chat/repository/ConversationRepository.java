package com.example.chat.repository;

import com.example.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 会话Repository
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    /**
     * 查找用户的所有会话
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.conversationType = 'PRIVATE' AND (c.participant1Id = :userId OR c.participant2Id = :userId)) OR " +
           "(c.conversationType = 'GROUP' AND c.groupId IN " +
           "(SELECT gm.groupId FROM GroupMember gm WHERE gm.userId = :userId))")
    List<Conversation> findUserConversations(@Param("userId") Long userId);
    
    /**
     * 查找两个用户之间的私聊会话
     */
    @Query("SELECT c FROM Conversation c WHERE c.conversationType = 'PRIVATE' AND " +
           "((c.participant1Id = :userId1 AND c.participant2Id = :userId2) OR " +
           "(c.participant1Id = :userId2 AND c.participant2Id = :userId1))")
    Optional<Conversation> findPrivateConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    /**
     * 查找群聊会话
     */
    Optional<Conversation> findByConversationTypeAndGroupId(Conversation.ConversationType conversationType, Long groupId);
    
    /**
     * 查找用户参与的私聊会话
     */
    @Query("SELECT c FROM Conversation c WHERE c.conversationType = 'PRIVATE' AND " +
           "(c.participant1Id = :userId OR c.participant2Id = :userId)")
    List<Conversation> findPrivateConversationsByUserId(@Param("userId") Long userId);
}

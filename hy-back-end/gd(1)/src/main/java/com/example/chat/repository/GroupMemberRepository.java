package com.example.chat.repository;

import com.example.chat.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 群成员Repository
 */
@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    /**
     * 查找群的所有活跃成员
     */
    List<GroupMember> findByGroupIdAndMemberStatus(Long groupId, String memberStatus);

    /**
     * 查找用户加入的所有群聊
     */
    List<GroupMember> findByUserIdAndMemberStatus(Long userId, String memberStatus);
    
    /**
     * 查找用户最近加入的群聊（按加入时间过滤）
     */
    List<GroupMember> findByUserIdAndMemberStatusAndJoinTimeAfter(Long userId, String memberStatus, LocalDateTime joinTimeAfter);

    /**
     * 查找用户在某个群的成员信息
     */
    Optional<GroupMember> findByGroupIdAndUserIdAndMemberStatus(Long groupId, Long userId, String memberStatus);

    /**
     * 检查用户是否为群成员
     */
    boolean existsByGroupIdAndUserIdAndMemberStatus(Long groupId, Long userId, String memberStatus);

    /**
     * 查找群主
     */
    Optional<GroupMember> findByGroupIdAndMemberRoleAndMemberStatus(Long groupId, String memberRole, String memberStatus);

    /**
     * 统计群的活跃成员数
     */
    Long countByGroupIdAndMemberStatus(Long groupId, String memberStatus);

    /**
     * 获取群中的所有管理员（包括群主）
     */
    @Query("SELECT gm FROM GroupMember gm WHERE gm.groupId = :groupId AND gm.memberRole IN ('owner', 'admin') AND gm.memberStatus = 'active'")
    List<GroupMember> findAdminsAndOwner(@Param("groupId") Long groupId);

    /**
     * 批量更新未读消息数
     */
    @Modifying
    @Query("UPDATE GroupMember gm SET gm.unreadCount = gm.unreadCount + 1 WHERE gm.groupId = :groupId AND gm.userId != :senderId AND gm.memberStatus = 'active'")
    void incrementUnreadCountForMembers(@Param("groupId") Long groupId, @Param("senderId") Long senderId);

    /**
     * 清空用户在某个群的未读消息数
     */
    @Modifying
    @Query("UPDATE GroupMember gm SET gm.unreadCount = 0, gm.lastReadTime = :readTime WHERE gm.groupId = :groupId AND gm.userId = :userId")
    void clearUnreadCount(@Param("groupId") Long groupId, @Param("userId") Long userId, @Param("readTime") LocalDateTime readTime);
}

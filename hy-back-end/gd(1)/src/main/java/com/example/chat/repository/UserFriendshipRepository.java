package com.example.chat.repository;

import com.example.chat.entity.UserFriendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户好友关系Repository
 */
@Repository
public interface UserFriendshipRepository extends JpaRepository<UserFriendship, Long> {
    
    /**
     * 查找用户的所有好友
     */
    @Query("SELECT f FROM UserFriendship f WHERE " +
           "(f.userId = :userId OR f.friendId = :userId) AND f.status = 'accepted'")
    List<UserFriendship> findAcceptedFriendsByUserId(@Param("userId") Long userId);
    
    /**
     * 查找两个用户之间的好友关系（返回列表，处理可能的重复记录）
     */
    @Query("SELECT f FROM UserFriendship f WHERE " +
           "(f.userId = :userId AND f.friendId = :friendId) OR " +
           "(f.userId = :friendId AND f.friendId = :userId) " +
           "ORDER BY f.createdAt DESC")
    List<UserFriendship> findFriendshipsBetweenUsers(@Param("userId") Long userId, @Param("friendId") Long friendId);
    
    /**
     * 查找用户收到的好友申请
     */
    List<UserFriendship> findByFriendIdAndStatus(Long friendId, UserFriendship.FriendshipStatus status);
    
    /**
     * 查找用户发出的好友申请
     */
    List<UserFriendship> findByUserIdAndStatus(Long userId, UserFriendship.FriendshipStatus status);
    
    /**
     * 检查两个用户是否已经是好友
     */
    @Query("SELECT COUNT(f) > 0 FROM UserFriendship f WHERE " +
           "((f.userId = :userId AND f.friendId = :friendId) OR " +
           "(f.userId = :friendId AND f.friendId = :userId)) AND f.status = 'accepted'")
    boolean areUsersFriends(@Param("userId") Long userId, @Param("friendId") Long friendId);
}

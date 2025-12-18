package com.example.auth.repository;

import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByNumber(String number);
    Optional<User> findByNumber(String number);
    
    /**
     * 根据关键词搜索用户（用户名或手机号）
     */
    @Query("SELECT u FROM User u WHERE u.username LIKE %:keyword% OR u.number LIKE %:keyword%")
    List<User> searchByKeyword(@Param("keyword") String keyword);
}
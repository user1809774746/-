package com.example.auth.repository;

import com.example.auth.entity.UserBackgroundImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserBackgroundImageRepository extends JpaRepository<UserBackgroundImage, Long> {
    
    /**
     * 根据用户ID查找背景图片
     */
    Optional<UserBackgroundImage> findByUserId(Long userId);
    
    /**
     * 根据用户ID删除背景图片
     */
    void deleteByUserId(Long userId);
    
    /**
     * 检查用户是否已设置背景图片
     */
    boolean existsByUserId(Long userId);
}

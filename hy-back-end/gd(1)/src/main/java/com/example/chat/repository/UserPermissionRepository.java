package com.example.chat.repository;

import com.example.chat.entity.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 用户权限管理 Repository，对应 user_permissions 表
 */
@Repository
public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {

    /**
     * 根据权限拥有者和目标用户查询权限设置
     */
    Optional<UserPermission> findByPermissionOwnerAndTargetUser(Long permissionOwner, Long targetUser);
}

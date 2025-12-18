/*
 用户权限管理表设计
 创建日期: 2025-11-18
 功能说明: 管理用户之间的聊天权限设置
 使用场景: 当A用户与B用户成为好友后，A用户可以设置B用户对自己的权限级别
 权限类型: 
   - chat_only: 仅聊天权限（只能发送消息）
   - full_access: 完整权限（可以查看详细资料、朋友圈等）
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 表结构: user_permissions (用户权限管理表)
-- 功能: 管理用户之间的权限设置
-- 设计要点: 
--   1. 每对好友关系都有两条记录（A对B的权限设置，B对A的权限设置）
--   2. 权限设置者是permission_owner，被设置权限的是target_user
--   3. 默认权限为chat_only，用户可以主动调整为full_access
-- =====================================================
DROP TABLE IF EXISTS `user_permissions`;
CREATE TABLE `user_permissions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `permission_owner` BIGINT NOT NULL COMMENT '权限设置者的UserID（谁设置的权限）',
  `target_user` BIGINT NOT NULL COMMENT '被设置权限的用户UserID（对谁设置权限）',
  `permission_level` ENUM('chat_only', 'full_access') 
    DEFAULT 'chat_only' COMMENT '权限级别：chat_only-仅聊天权限, full_access-完整权限',
  `can_view_profile` TINYINT(1) NULL DEFAULT 0 COMMENT '是否可以查看详细资料（0-否, 1-是）',
  `can_view_moments` TINYINT(1) NULL DEFAULT 0 COMMENT '是否可以查看朋友圈/动态（0-否, 1-是）',
  `can_view_status` TINYINT(1) NULL DEFAULT 1 COMMENT '是否可以查看在线状态（0-否, 1-是）',
  `can_send_files` TINYINT(1) NULL DEFAULT 1 COMMENT '是否可以发送文件（0-否, 1-是）',
  `can_voice_call` TINYINT(1) NULL DEFAULT 0 COMMENT '是否可以语音通话（0-否, 1-是）',
  `can_video_call` TINYINT(1) NULL DEFAULT 0 COMMENT '是否可以视频通话（0-否, 1-是）',
  `auto_accept_files` TINYINT(1) NULL DEFAULT 0 COMMENT '是否自动接收文件（0-否, 1-是）',
  `message_verification` TINYINT(1) NULL DEFAULT 0 COMMENT '是否需要消息验证（0-否, 1-是）',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_owner_target` (`permission_owner`, `target_user`) USING BTREE,
  INDEX `idx_permission_owner` (`permission_owner`) USING BTREE,
  INDEX `idx_target_user` (`target_user`) USING BTREE,
  INDEX `idx_permission_level` (`permission_level`) USING BTREE,
  
  -- 外键关联到 user_info 表
  CONSTRAINT `fk_permissions_owner` FOREIGN KEY (`permission_owner`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_permissions_target` FOREIGN KEY (`target_user`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
    
  -- 检查约束：确保不能给自己设置权限
  CONSTRAINT `chk_not_self_permission` CHECK (`permission_owner` != `target_user`)
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户权限管理表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 触发器: 自动设置权限详细项
-- 功能: 当permission_level改变时，自动更新相关的权限详细项
-- =====================================================
DELIMITER //
CREATE TRIGGER `tr_update_permission_details` 
BEFORE UPDATE ON `user_permissions`
FOR EACH ROW
BEGIN
    -- 如果设置为仅聊天权限，则关闭大部分权限
    IF NEW.permission_level = 'chat_only' THEN
        SET NEW.can_view_profile = 0;
        SET NEW.can_view_moments = 0;
        SET NEW.can_voice_call = 0;
        SET NEW.can_video_call = 0;
        SET NEW.auto_accept_files = 0;
    END IF;
    
    -- 如果设置为完整权限，则开启大部分权限
    IF NEW.permission_level = 'full_access' THEN
        SET NEW.can_view_profile = 1;
        SET NEW.can_view_moments = 1;
        SET NEW.can_voice_call = 1;
        SET NEW.can_video_call = 1;
        SET NEW.auto_accept_files = 1;
    END IF;
END//

CREATE TRIGGER `tr_insert_permission_details` 
BEFORE INSERT ON `user_permissions`
FOR EACH ROW
BEGIN
    -- 如果设置为仅聊天权限，则关闭大部分权限
    IF NEW.permission_level = 'chat_only' THEN
        SET NEW.can_view_profile = 0;
        SET NEW.can_view_moments = 0;
        SET NEW.can_voice_call = 0;
        SET NEW.can_video_call = 0;
        SET NEW.auto_accept_files = 0;
    END IF;
    
    -- 如果设置为完整权限，则开启大部分权限
    IF NEW.permission_level = 'full_access' THEN
        SET NEW.can_view_profile = 1;
        SET NEW.can_view_moments = 1;
        SET NEW.can_voice_call = 1;
        SET NEW.can_video_call = 1;
        SET NEW.auto_accept_files = 1;
    END IF;
END//
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 常用查询示例
-- =====================================================

-- 示例1: 查询A用户对B用户设置的权限
-- 参数: ? = A用户的UserID, ? = B用户的UserID
/*
SELECT 
    permission_level,
    can_view_profile,
    can_view_moments,
    can_view_status,
    can_send_files,
    can_voice_call,
    can_video_call,
    auto_accept_files,
    message_verification
FROM user_permissions 
WHERE permission_owner = ? AND target_user = ?;
*/

-- 示例2: 查询B用户对A用户是否有某项权限
-- 用法: 后端根据这个查询结果来判断B用户是否可以对A用户执行某项操作
-- 参数: ? = A用户的UserID, ? = B用户的UserID
/*
SELECT 
    CASE 
        WHEN up.can_view_profile = 1 THEN 'allowed'
        ELSE 'denied'
    END AS profile_access,
    CASE 
        WHEN up.can_view_moments = 1 THEN 'allowed'
        ELSE 'denied'
    END AS moments_access,
    CASE 
        WHEN up.can_voice_call = 1 THEN 'allowed'
        ELSE 'denied'
    END AS voice_call_access
FROM user_permissions up
WHERE up.permission_owner = ? AND up.target_user = ?;
*/

-- 示例3: A用户设置B用户的权限为仅聊天
-- 参数: ? = A用户的UserID, ? = B用户的UserID
/*
INSERT INTO user_permissions (permission_owner, target_user, permission_level)
VALUES (?, ?, 'chat_only')
ON DUPLICATE KEY UPDATE 
    permission_level = 'chat_only',
    updated_at = NOW();
*/

-- 示例4: A用户设置B用户的权限为完整权限
-- 参数: ? = A用户的UserID, ? = B用户的UserID
/*
INSERT INTO user_permissions (permission_owner, target_user, permission_level)
VALUES (?, ?, 'full_access')
ON DUPLICATE KEY UPDATE 
    permission_level = 'full_access',
    updated_at = NOW();
*/

-- 示例5: 批量创建权限记录（当两人成为好友时）
-- 参数: ? = A用户的UserID, ? = B用户的UserID
/*
INSERT INTO user_permissions (permission_owner, target_user, permission_level)
VALUES 
    (?, ?, 'chat_only'),  -- A对B的权限设置
    (?, ?, 'chat_only');  -- B对A的权限设置
*/

-- 示例6: 查询用户的权限设置列表（查看我给哪些好友设置了什么权限）
-- 参数: ? = 当前用户的UserID
/*
SELECT 
    up.target_user,
    u.username AS friend_username,
    u.UserProfilePic AS friend_avatar,
    uf.remark_name,
    up.permission_level,
    up.can_view_profile,
    up.can_view_moments,
    up.can_voice_call,
    up.can_video_call,
    up.updated_at
FROM user_permissions up
JOIN user_info u ON u.UserID = up.target_user
LEFT JOIN user_friendships uf ON uf.user_id = up.permission_owner AND uf.friend_id = up.target_user
WHERE up.permission_owner = ?
ORDER BY up.updated_at DESC;
*/

-- 示例7: 检查B用户是否可以查看A用户的详细资料
-- 返回结果: 如果有记录且can_view_profile=1则允许，否则拒绝
-- 参数: ? = A用户的UserID, ? = B用户的UserID
/*
SELECT 
    CASE 
        WHEN COUNT(*) > 0 AND MAX(can_view_profile) = 1 THEN 1
        ELSE 0
    END AS can_access_profile
FROM user_permissions 
WHERE permission_owner = ? AND target_user = ?;
*/

-- =====================================================
-- 数据初始化建议
-- =====================================================
/*
当用户成为好友时，建议在后端代码中执行以下操作：

1. 在user_friendships表中插入好友关系记录
2. 在user_permissions表中为双方创建默认权限记录（chat_only）
3. 如果需要，在conversations表中创建会话记录

示例代码逻辑：
BEGIN TRANSACTION;

-- 1. 更新好友关系状态
UPDATE user_friendships 
SET status = 'accepted', accept_time = NOW()
WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?);

-- 2. 创建默认权限设置
INSERT IGNORE INTO user_permissions (permission_owner, target_user, permission_level)
VALUES 
    (?, ?, 'chat_only'),
    (?, ?, 'chat_only');

-- 3. 创建会话（如果不存在）
INSERT IGNORE INTO conversations (user1_id, user2_id, type)
VALUES (LEAST(?, ?), GREATEST(?, ?), 'private');

COMMIT;
*/

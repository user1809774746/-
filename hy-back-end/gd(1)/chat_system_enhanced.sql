/*
 聊天系统增强数据库设计
 创建日期: 2025-11-18
 功能说明: 补充聊天系统缺失的数据库表
 包含表:
   1. group_chats - 群聊表
   2. group_members - 群成员表
   3. chat_settings - 聊天设置表
   4. chat_reports - 举报表
   5. message_read_status - 消息已读状态表
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 表结构: group_chats (群聊表)
-- =====================================================
DROP TABLE IF EXISTS `group_chats`;
CREATE TABLE `group_chats` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '群聊ID',
  `group_name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '群名称',
  `group_avatar` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '群头像URL',
  `group_description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '群描述',
  `creator_id` BIGINT NOT NULL COMMENT '群创建者ID',
  `max_members` INT DEFAULT 200 COMMENT '最大成员数',
  `current_members` INT DEFAULT 0 COMMENT '当前成员数',
  `group_type` ENUM('normal', 'announcement', 'private') DEFAULT 'normal' COMMENT '群类型',
  `join_approval` TINYINT(1) DEFAULT 1 COMMENT '加群是否需要审批',
  `allow_invite` TINYINT(1) DEFAULT 1 COMMENT '是否允许普通成员邀请',
  `mute_all` TINYINT(1) DEFAULT 0 COMMENT '是否全员禁言',
  `status` ENUM('active', 'disbanded', 'frozen') DEFAULT 'active' COMMENT '群状态',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_creator`(`creator_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_created_time`(`created_time`) USING BTREE,
  
  CONSTRAINT `fk_group_creator` FOREIGN KEY (`creator_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群聊表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: group_members (群成员表)
-- =====================================================
DROP TABLE IF EXISTS `group_members`;
CREATE TABLE `group_members` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `group_id` BIGINT NOT NULL COMMENT '群聊ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `role` ENUM('owner', 'admin', 'member') DEFAULT 'member' COMMENT '群内角色',
  `nickname` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '群内昵称',
  `is_muted` TINYINT(1) DEFAULT 0 COMMENT '是否被禁言',
  `mute_until` DATETIME NULL COMMENT '禁言到期时间',
  `join_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加群时间',
  `last_read_time` DATETIME NULL COMMENT '最后阅读时间',
  `status` ENUM('active', 'left', 'kicked') DEFAULT 'active' COMMENT '成员状态',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_group_user` (`group_id`, `user_id`) USING BTREE,
  INDEX `idx_user_id` (`user_id`) USING BTREE,
  INDEX `idx_role` (`role`) USING BTREE,
  INDEX `idx_status` (`status`) USING BTREE,
  
  CONSTRAINT `fk_group_member_group` FOREIGN KEY (`group_id`) 
    REFERENCES `group_chats` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_group_member_user` FOREIGN KEY (`user_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群成员表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: chat_settings (聊天设置表)
-- =====================================================
DROP TABLE IF EXISTS `chat_settings`;
CREATE TABLE `chat_settings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '设置ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `target_id` BIGINT NOT NULL COMMENT '目标ID（好友ID或群ID）',
  `target_type` ENUM('user', 'group') NOT NULL COMMENT '目标类型',
  `is_pinned` TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
  `is_muted` TINYINT(1) DEFAULT 0 COMMENT '是否免打扰',
  `background_image` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '聊天背景图',
  `font_size` INT DEFAULT 16 COMMENT '字体大小',
  `show_online_status` TINYINT(1) DEFAULT 1 COMMENT '是否显示在线状态',
  `auto_download_media` TINYINT(1) DEFAULT 1 COMMENT '是否自动下载媒体文件',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_target` (`user_id`, `target_id`, `target_type`) USING BTREE,
  INDEX `idx_user_pinned` (`user_id`, `is_pinned`) USING BTREE,
  INDEX `idx_user_muted` (`user_id`, `is_muted`) USING BTREE,
  
  CONSTRAINT `fk_chat_settings_user` FOREIGN KEY (`user_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天设置表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: chat_reports (举报表)
-- =====================================================
DROP TABLE IF EXISTS `chat_reports`;
CREATE TABLE `chat_reports` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '举报ID',
  `reporter_id` BIGINT NOT NULL COMMENT '举报人ID',
  `reported_user_id` BIGINT NULL COMMENT '被举报用户ID',
  `reported_group_id` BIGINT NULL COMMENT '被举报群ID',
  `message_id` BIGINT NULL COMMENT '被举报消息ID',
  `report_type` ENUM('spam', 'harassment', 'inappropriate', 'fraud', 'other') NOT NULL COMMENT '举报类型',
  `report_reason` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '举报原因',
  `evidence_images` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '举报证据图片(JSON)',
  `status` ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending' COMMENT '处理状态',
  `admin_id` BIGINT NULL COMMENT '处理管理员ID',
  `admin_note` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '管理员备注',
  `processed_time` DATETIME NULL COMMENT '处理时间',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_reporter` (`reporter_id`) USING BTREE,
  INDEX `idx_reported_user` (`reported_user_id`) USING BTREE,
  INDEX `idx_reported_group` (`reported_group_id`) USING BTREE,
  INDEX `idx_status` (`status`) USING BTREE,
  INDEX `idx_created_time` (`created_time`) USING BTREE,
  
  CONSTRAINT `fk_report_reporter` FOREIGN KEY (`reporter_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_report_reported_user` FOREIGN KEY (`reported_user_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_report_group` FOREIGN KEY (`reported_group_id`) 
    REFERENCES `group_chats` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_report_message` FOREIGN KEY (`message_id`) 
    REFERENCES `messages` (`MessageID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: message_read_status (消息已读状态表)
-- =====================================================
DROP TABLE IF EXISTS `message_read_status`;
CREATE TABLE `message_read_status` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `message_id` BIGINT NOT NULL COMMENT '消息ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  `read_time` DATETIME NULL COMMENT '阅读时间',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_message_user` (`message_id`, `user_id`) USING BTREE,
  INDEX `idx_user_read` (`user_id`, `is_read`) USING BTREE,
  INDEX `idx_message_read` (`message_id`, `is_read`) USING BTREE,
  
  CONSTRAINT `fk_read_status_message` FOREIGN KEY (`message_id`) 
    REFERENCES `messages` (`MessageID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_read_status_user` FOREIGN KEY (`user_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息已读状态表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 触发器: 自动更新群成员数量
-- =====================================================
DELIMITER //
CREATE TRIGGER `tr_update_group_member_count_insert` 
AFTER INSERT ON `group_members`
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE `group_chats` SET 
            `current_members` = (
                SELECT COUNT(*) FROM `group_members` 
                WHERE `group_id` = NEW.`group_id` AND `status` = 'active'
            )
        WHERE `id` = NEW.`group_id`;
    END IF;
END//

CREATE TRIGGER `tr_update_group_member_count_update` 
AFTER UPDATE ON `group_members`
FOR EACH ROW
BEGIN
    UPDATE `group_chats` SET 
        `current_members` = (
            SELECT COUNT(*) FROM `group_members` 
            WHERE `group_id` = NEW.`group_id` AND `status` = 'active'
        )
    WHERE `id` = NEW.`group_id`;
END//

CREATE TRIGGER `tr_update_group_member_count_delete` 
AFTER DELETE ON `group_members`
FOR EACH ROW
BEGIN
    UPDATE `group_chats` SET 
        `current_members` = (
            SELECT COUNT(*) FROM `group_members` 
            WHERE `group_id` = OLD.`group_id` AND `status` = 'active'
        )
    WHERE `id` = OLD.`group_id`;
END//
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 示例数据和查询
-- =====================================================

-- 示例1: 创建群聊
/*
INSERT INTO group_chats (group_name, group_description, creator_id)
VALUES ('旅行爱好者群', '分享旅行经验和攻略', 1);

SET @group_id = LAST_INSERT_ID();

-- 添加群主
INSERT INTO group_members (group_id, user_id, role)
VALUES (@group_id, 1, 'owner');
*/

-- 示例2: 查询用户的聊天列表（包含群聊和私聊）
/*
SELECT 
    'user' as chat_type,
    uf.UserID as target_id,
    uf.UserName as target_name,
    uf.Avatar as target_avatar,
    cs.is_pinned,
    cs.is_muted,
    (SELECT Content FROM messages WHERE 
     ConversationID IN (SELECT ConversationID FROM conversations WHERE 
     (User1ID = ? AND User2ID = uf.UserID) OR (User1ID = uf.UserID AND User2ID = ?))
     ORDER BY SentTime DESC LIMIT 1) as last_message,
    (SELECT SentTime FROM messages WHERE 
     ConversationID IN (SELECT ConversationID FROM conversations WHERE 
     (User1ID = ? AND User2ID = uf.UserID) OR (User1ID = uf.UserID AND User2ID = ?))
     ORDER BY SentTime DESC LIMIT 1) as last_message_time
FROM user_friendships uf
LEFT JOIN chat_settings cs ON cs.user_id = ? AND cs.target_id = uf.UserID AND cs.target_type = 'user'
WHERE uf.FriendID = ? AND uf.Status = 'accepted'

UNION ALL

SELECT 
    'group' as chat_type,
    gc.id as target_id,
    gc.group_name as target_name,
    gc.group_avatar as target_avatar,
    cs.is_pinned,
    cs.is_muted,
    (SELECT Content FROM messages WHERE 
     ConversationID IN (SELECT ConversationID FROM conversations WHERE GroupID = gc.id)
     ORDER BY SentTime DESC LIMIT 1) as last_message,
    (SELECT SentTime FROM messages WHERE 
     ConversationID IN (SELECT ConversationID FROM conversations WHERE GroupID = gc.id)
     ORDER BY SentTime DESC LIMIT 1) as last_message_time
FROM group_chats gc
JOIN group_members gm ON gc.id = gm.group_id
LEFT JOIN chat_settings cs ON cs.user_id = ? AND cs.target_id = gc.id AND cs.target_type = 'group'
WHERE gm.user_id = ? AND gm.status = 'active' AND gc.status = 'active'

ORDER BY is_pinned DESC, last_message_time DESC;
*/

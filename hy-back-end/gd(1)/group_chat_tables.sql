/*
 群聊系统数据库设计
 创建日期: 2025-12-10
 功能说明: 完整的群聊功能数据库表设计
 包含表:
   1. group_chats - 群聊基础信息表
   2. group_members - 群成员关系表
   3. group_join_requests - 入群申请表
   4. group_announcements - 群公告表
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 表结构: group_chats (群聊基础信息表)
-- =====================================================
DROP TABLE IF EXISTS `group_chats`;
CREATE TABLE `group_chats` (
  `group_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '群聊ID',
  `group_name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '群名称',
  `group_avatar` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '群头像URL',
  `group_description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '群描述/群公告',
  `creator_id` BIGINT NOT NULL COMMENT '群创建者ID（群主）',
  `max_members` INT NOT NULL DEFAULT 200 COMMENT '最大成员数',
  `current_members` INT NOT NULL DEFAULT 0 COMMENT '当前成员数',
  `group_type` ENUM('normal', 'announcement', 'private') DEFAULT 'normal' COMMENT '群类型：normal-普通群，announcement-公告群，private-私密群',
  `join_approval` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '加群是否需要审批：0-不需要，1-需要',
  `allow_member_invite` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否允许普通成员邀请：0-不允许，1-允许',
  `mute_all` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否全员禁言：0-否，1-是',
  `status` ENUM('active', 'disbanded', 'frozen') DEFAULT 'active' COMMENT '群状态：active-正常，disbanded-已解散，frozen-已冻结',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`group_id`) USING BTREE,
  INDEX `idx_creator_id`(`creator_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_created_time`(`created_time`) USING BTREE,
  INDEX `idx_group_name`(`group_name`) USING BTREE,
  
  CONSTRAINT `fk_group_creator` FOREIGN KEY (`creator_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='群聊基础信息表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: group_members (群成员关系表)
-- =====================================================
DROP TABLE IF EXISTS `group_members`;
CREATE TABLE `group_members` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `group_id` BIGINT NOT NULL COMMENT '群聊ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `member_role` ENUM('owner', 'admin', 'member') DEFAULT 'member' COMMENT '群内角色：owner-群主，admin-管理员，member-普通成员',
  `group_nickname` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '群内昵称',
  `is_muted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否被禁言：0-否，1-是',
  `mute_until` DATETIME NULL DEFAULT NULL COMMENT '禁言到期时间',
  `join_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加群时间',
  `last_read_time` DATETIME NULL DEFAULT NULL COMMENT '最后阅读时间（用于未读消息统计）',
  `unread_count` INT NOT NULL DEFAULT 0 COMMENT '未读消息数',
  `member_status` ENUM('active', 'left', 'kicked', 'banned') DEFAULT 'active' COMMENT '成员状态：active-正常，left-主动退出，kicked-被踢出，banned-被封禁',
  `inviter_id` BIGINT NULL DEFAULT NULL COMMENT '邀请人ID',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_group_user` (`group_id`, `user_id`) USING BTREE,
  INDEX `idx_user_id` (`user_id`) USING BTREE,
  INDEX `idx_member_role` (`member_role`) USING BTREE,
  INDEX `idx_member_status` (`member_status`) USING BTREE,
  INDEX `idx_join_time` (`join_time`) USING BTREE,
  
  CONSTRAINT `fk_group_member_group` FOREIGN KEY (`group_id`) 
    REFERENCES `group_chats` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_group_member_user` FOREIGN KEY (`user_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='群成员关系表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: group_join_requests (入群申请表)
-- =====================================================
DROP TABLE IF EXISTS `group_join_requests`;
CREATE TABLE `group_join_requests` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `group_id` BIGINT NOT NULL COMMENT '群聊ID',
  `applicant_id` BIGINT NOT NULL COMMENT '申请人ID',
  `inviter_id` BIGINT NULL DEFAULT NULL COMMENT '邀请人ID（如果是邀请入群）',
  `request_type` ENUM('apply', 'invite') DEFAULT 'apply' COMMENT '请求类型：apply-申请入群，invite-邀请入群',
  `request_message` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '申请/邀请消息',
  `request_status` ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending' COMMENT '请求状态：pending-待处理，approved-已同意，rejected-已拒绝，expired-已过期',
  `handler_id` BIGINT NULL DEFAULT NULL COMMENT '处理人ID（群主或管理员）',
  `reject_reason` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '拒绝理由',
  `handled_time` DATETIME NULL DEFAULT NULL COMMENT '处理时间',
  `expire_time` DATETIME NULL DEFAULT NULL COMMENT '过期时间（默认7天后过期）',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_group_id`(`group_id`) USING BTREE,
  INDEX `idx_applicant_id`(`applicant_id`) USING BTREE,
  INDEX `idx_request_status`(`request_status`) USING BTREE,
  INDEX `idx_created_time`(`created_time`) USING BTREE,
  
  CONSTRAINT `fk_join_request_group` FOREIGN KEY (`group_id`) 
    REFERENCES `group_chats` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_join_request_applicant` FOREIGN KEY (`applicant_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='入群申请表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: group_announcements (群公告表)
-- =====================================================
DROP TABLE IF EXISTS `group_announcements`;
CREATE TABLE `group_announcements` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `group_id` BIGINT NOT NULL COMMENT '群聊ID',
  `publisher_id` BIGINT NOT NULL COMMENT '发布者ID',
  `title` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '公告标题',
  `content` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公告内容',
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶：0-否，1-是',
  `announcement_status` ENUM('active', 'deleted') DEFAULT 'active' COMMENT '公告状态',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_group_id`(`group_id`) USING BTREE,
  INDEX `idx_is_pinned`(`is_pinned`) USING BTREE,
  INDEX `idx_created_time`(`created_time`) USING BTREE,
  
  CONSTRAINT `fk_announcement_group` FOREIGN KEY (`group_id`) 
    REFERENCES `group_chats` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_announcement_publisher` FOREIGN KEY (`publisher_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='群公告表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 触发器: 自动更新群成员数量
-- =====================================================
DELIMITER //

-- 插入新成员时更新群成员数
CREATE TRIGGER `tr_group_member_insert` 
AFTER INSERT ON `group_members`
FOR EACH ROW
BEGIN
    IF NEW.member_status = 'active' THEN
        UPDATE `group_chats` 
        SET `current_members` = (
            SELECT COUNT(*) FROM `group_members` 
            WHERE `group_id` = NEW.`group_id` AND `member_status` = 'active'
        )
        WHERE `group_id` = NEW.`group_id`;
    END IF;
END//

-- 更新成员状态时更新群成员数
CREATE TRIGGER `tr_group_member_update` 
AFTER UPDATE ON `group_members`
FOR EACH ROW
BEGIN
    UPDATE `group_chats` 
    SET `current_members` = (
        SELECT COUNT(*) FROM `group_members` 
        WHERE `group_id` = NEW.`group_id` AND `member_status` = 'active'
    )
    WHERE `group_id` = NEW.`group_id`;
END//

-- 删除成员时更新群成员数
CREATE TRIGGER `tr_group_member_delete` 
AFTER DELETE ON `group_members`
FOR EACH ROW
BEGIN
    UPDATE `group_chats` 
    SET `current_members` = (
        SELECT COUNT(*) FROM `group_members` 
        WHERE `group_id` = OLD.`group_id` AND `member_status` = 'active'
    )
    WHERE `group_id` = OLD.`group_id`;
END//

DELIMITER ;

-- =====================================================
-- 初始化示例数据（可选）
-- =====================================================

-- 示例1: 创建一个测试群聊
/*
INSERT INTO group_chats (group_name, group_description, creator_id, max_members)
VALUES ('技术交流群', '分享技术经验，共同进步', 1, 200);

SET @group_id = LAST_INSERT_ID();

-- 添加群主
INSERT INTO group_members (group_id, user_id, member_role)
VALUES (@group_id, 1, 'owner');
*/

-- =====================================================
-- 常用查询示例
-- =====================================================

-- 查询1: 获取用户加入的所有群聊
/*
SELECT 
    gc.group_id,
    gc.group_name,
    gc.group_avatar,
    gc.current_members,
    gm.member_role,
    gm.unread_count,
    gc.created_time
FROM group_chats gc
INNER JOIN group_members gm ON gc.group_id = gm.group_id
WHERE gm.user_id = ? 
  AND gm.member_status = 'active'
  AND gc.status = 'active'
ORDER BY gc.created_time DESC;
*/

-- 查询2: 获取群成员列表
/*
SELECT 
    gm.id,
    gm.user_id,
    ui.UserName,
    ui.Avatar,
    gm.group_nickname,
    gm.member_role,
    gm.is_muted,
    gm.join_time
FROM group_members gm
INNER JOIN user_info ui ON gm.user_id = ui.UserID
WHERE gm.group_id = ?
  AND gm.member_status = 'active'
ORDER BY 
    CASE gm.member_role
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 3
    END,
    gm.join_time ASC;
*/

-- 查询3: 获取待处理的入群申请
/*
SELECT 
    jr.id,
    jr.group_id,
    jr.applicant_id,
    ui.UserName,
    ui.Avatar,
    jr.request_message,
    jr.created_time
FROM group_join_requests jr
INNER JOIN user_info ui ON jr.applicant_id = ui.UserID
WHERE jr.group_id = ?
  AND jr.request_status = 'pending'
  AND jr.request_type = 'apply'
  AND (jr.expire_time IS NULL OR jr.expire_time > NOW())
ORDER BY jr.created_time DESC;
*/

-- 查询4: 检查用户是否为群成员
/*
SELECT COUNT(*) > 0 as is_member
FROM group_members
WHERE group_id = ? 
  AND user_id = ?
  AND member_status = 'active';
*/

-- 查询5: 获取群聊统计信息
/*
SELECT 
    gc.group_id,
    gc.group_name,
    gc.current_members,
    gc.max_members,
    (SELECT COUNT(*) FROM messages m 
     INNER JOIN conversations c ON m.ConversationID = c.ConversationID
     WHERE c.GroupID = gc.group_id) as total_messages,
    (SELECT COUNT(*) FROM group_join_requests 
     WHERE group_id = gc.group_id 
     AND request_status = 'pending') as pending_requests
FROM group_chats gc
WHERE gc.group_id = ?;
*/

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 表设计说明
-- =====================================================
/*
1. group_chats 表
   - 存储群聊的基础信息
   - 支持三种群类型：普通群、公告群、私密群
   - 可配置加群审批、成员邀请权限等
   
2. group_members 表
   - 存储群成员关系
   - 支持三种角色：群主、管理员、普通成员
   - 支持群内昵称、禁言功能
   - 记录未读消息数和最后阅读时间
   
3. group_join_requests 表
   - 管理入群申请和邀请
   - 支持申请入群和邀请入群两种类型
   - 自动过期机制（7天后过期）
   
4. group_announcements 表
   - 存储群公告信息
   - 支持公告置顶功能
   - 记录发布者和发布时间

核心特性：
- 外键约束确保数据一致性
- 触发器自动维护群成员数量
- 完善的索引优化查询性能
- 支持软删除（通过状态标记）
- UTF-8MB4字符集支持emoji表情
*/

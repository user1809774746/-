/*
 私聊功能数据库表设计
 创建日期: 2025-11-17
 功能说明: 实现类似QQ的私聊功能
 包含表: 
   1. user_friendships - 好友关系表
   2. conversations - 会话表
   3. conversation_settings - 会话用户设置表
   4. messages - 消息表
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 表结构: user_friendships (好友关系表)
-- 功能: 管理用户之间的好友关系
-- 特点: 双向记录（A加B需要两条记录）
-- =====================================================
DROP TABLE IF EXISTS `user_friendships`;
CREATE TABLE `user_friendships` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT NOT NULL COMMENT '用户A的UserID',
  `friend_id` BIGINT NOT NULL COMMENT '好友B的UserID',
  `status` ENUM('pending', 'accepted', 'rejected', 'blocked', 'deleted') 
    DEFAULT 'pending' COMMENT '关系状态：pending-待确认, accepted-已接受, rejected-已拒绝, blocked-已拉黑, deleted-已删除',
  `remark_name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注名',
  `source` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '添加来源（search-搜索添加, qrcode-扫码添加, recommend-推荐等）',
  `request_message` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '好友申请附言',
  `request_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `accept_time` TIMESTAMP NULL DEFAULT NULL COMMENT '接受时间',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_friend` (`user_id`, `friend_id`) USING BTREE,
  INDEX `idx_user_id` (`user_id`) USING BTREE,
  INDEX `idx_friend_id` (`friend_id`) USING BTREE,
  INDEX `idx_status` (`status`) USING BTREE,
  
  -- 外键关联到 user_info 表
  CONSTRAINT `fk_friendships_user` FOREIGN KEY (`user_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_friendships_friend` FOREIGN KEY (`friend_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友关系表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: conversations (会话表)
-- 功能: 管理私聊会话（每对用户只有一个会话）
-- 设计要点: user1_id < user2_id 保证唯一性
-- =====================================================
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `type` ENUM('private', 'group') DEFAULT 'private' COMMENT '会话类型：private-私聊, group-群聊',
  `user1_id` BIGINT NOT NULL COMMENT '参与者1的UserID（私聊时使用，较小的ID）',
  `user2_id` BIGINT NOT NULL COMMENT '参与者2的UserID（私聊时使用，较大的ID）',
  `last_message_id` BIGINT NULL DEFAULT NULL COMMENT '最后一条消息ID',
  `last_message_time` TIMESTAMP NULL DEFAULT NULL COMMENT '最后一条消息时间（用于聊天列表排序）',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_private_conversation` (`user1_id`, `user2_id`) USING BTREE,
  INDEX `idx_user1` (`user1_id`) USING BTREE,
  INDEX `idx_user2` (`user2_id`) USING BTREE,
  INDEX `idx_last_message_time` (`last_message_time`) USING BTREE,
  
  -- 外键关联到 user_info 表
  CONSTRAINT `fk_conversations_user1` FOREIGN KEY (`user1_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_conversations_user2` FOREIGN KEY (`user2_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: conversation_settings (会话用户设置表)
-- 功能: 每个用户对会话的个性化设置（置顶、免打扰、删除等）
-- =====================================================
DROP TABLE IF EXISTS `conversation_settings`;
CREATE TABLE `conversation_settings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `conversation_id` BIGINT NOT NULL COMMENT '会话ID',
  `user_id` BIGINT NOT NULL COMMENT 'UserID',
  `is_pinned` TINYINT(1) NULL DEFAULT 0 COMMENT '是否置顶（0-否, 1-是）',
  `is_muted` TINYINT(1) NULL DEFAULT 0 COMMENT '是否免打扰（0-否, 1-是）',
  `is_deleted` TINYINT(1) NULL DEFAULT 0 COMMENT '是否删除会话/软删除（0-否, 1-是）',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_conversation_user` (`conversation_id`, `user_id`) USING BTREE,
  INDEX `idx_user_id` (`user_id`) USING BTREE,
  INDEX `idx_conversation_id` (`conversation_id`) USING BTREE,
  
  CONSTRAINT `fk_settings_conversation` FOREIGN KEY (`conversation_id`) 
    REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_settings_user` FOREIGN KEY (`user_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话用户设置表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: messages (消息表)
-- 功能: 存储所有私聊消息
-- 支持: 文本、图片、视频、音频、文件、位置、链接、系统消息
-- 特性: 消息撤回、引用回复
-- =====================================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `conversation_id` BIGINT NOT NULL COMMENT '所属会话ID',
  `sender_id` BIGINT NOT NULL COMMENT '发送者UserID',
  `receiver_id` BIGINT NOT NULL COMMENT '接收者UserID',
  `message_type` ENUM('text', 'image', 'video', 'audio', 'file', 'location', 'link', 'system') 
    DEFAULT 'text' COMMENT '消息类型：text-文本, image-图片, video-视频, audio-音频, file-文件, location-位置, link-链接, system-系统消息',
  `content` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '消息内容（文本消息的内容）',
  `media_url` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '媒体文件URL（图片/视频/音频/文件）',
  `media_thumbnail` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '媒体缩略图URL',
  `media_duration` INT NULL DEFAULT NULL COMMENT '音频/视频时长（秒）',
  `media_size` BIGINT NULL DEFAULT NULL COMMENT '文件大小（字节）',
  `file_name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '文件名',
  `location_lat` DECIMAL(10, 8) NULL DEFAULT NULL COMMENT '位置纬度',
  `location_lng` DECIMAL(11, 8) NULL DEFAULT NULL COMMENT '位置经度',
  `location_address` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '位置地址',
  `link_url` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '链接URL',
  `link_title` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '链接标题',
  `link_description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '链接描述',
  `reply_to_message_id` BIGINT NULL DEFAULT NULL COMMENT '回复的消息ID（引用回复功能）',
  `is_recalled` TINYINT(1) NULL DEFAULT 0 COMMENT '是否已撤回（0-否, 1-是）',
  `recalled_at` TIMESTAMP NULL DEFAULT NULL COMMENT '撤回时间',
  `sent_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_conversation_id` (`conversation_id`) USING BTREE,
  INDEX `idx_sender_id` (`sender_id`) USING BTREE,
  INDEX `idx_receiver_id` (`receiver_id`) USING BTREE,
  INDEX `idx_sent_at` (`sent_at`) USING BTREE,
  INDEX `idx_reply_to` (`reply_to_message_id`) USING BTREE,
  
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) 
    REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_messages_reply` FOREIGN KEY (`reply_to_message_id`) 
    REFERENCES `messages` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表' ROW_FORMAT=DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 常用查询示例
-- =====================================================

-- 示例1: 查询用户的聊天列表（带用户信息）
-- 参数: ? = 当前用户的UserID
/*
SELECT 
    c.id AS conversation_id,
    IF(c.user1_id = ?, c.user2_id, c.user1_id) AS friend_id,
    u.username,
    u.UserProfilePic AS avatar,
    c.last_message_time,
    COALESCE(cs.is_pinned, 0) AS is_pinned,
    COALESCE(cs.is_muted, 0) AS is_muted
FROM conversations c
LEFT JOIN conversation_settings cs ON cs.conversation_id = c.id AND cs.user_id = ?
JOIN user_info u ON u.UserID = IF(c.user1_id = ?, c.user2_id, c.user1_id)
WHERE (c.user1_id = ? OR c.user2_id = ?)
  AND (cs.is_deleted = 0 OR cs.is_deleted IS NULL)
ORDER BY COALESCE(cs.is_pinned, 0) DESC, c.last_message_time DESC;
*/

-- 示例2: 查询两人的聊天记录
-- 参数: ? = conversation_id
/*
SELECT 
    m.*,
    sender.username AS sender_username,
    sender.UserProfilePic AS sender_avatar
FROM messages m
JOIN user_info sender ON sender.UserID = m.sender_id
WHERE m.conversation_id = ?
  AND m.is_recalled = 0
ORDER BY m.sent_at DESC
LIMIT 20 OFFSET 0;
*/

-- 示例3: 发送消息（需要在事务中执行）
-- 步骤1: 插入消息
/*
INSERT INTO messages (conversation_id, sender_id, receiver_id, message_type, content, sent_at)
VALUES (?, ?, ?, 'text', '你好', NOW());
*/

-- 步骤2: 更新会话的最后消息
/*
UPDATE conversations 
SET last_message_id = LAST_INSERT_ID(), 
    last_message_time = NOW()
WHERE id = ?;
*/

-- 示例4: 查询好友列表
-- 参数: ? = 当前用户的UserID
/*
SELECT 
    uf.friend_id,
    u.username,
    u.UserProfilePic AS avatar,
    uf.remark_name,
    uf.status,
    uf.accept_time
FROM user_friendships uf
JOIN user_info u ON u.UserID = uf.friend_id
WHERE uf.user_id = ?
  AND uf.status = 'accepted'
ORDER BY uf.accept_time DESC;
*/

-- 示例5: 发送好友申请
/*
-- 插入双向记录
INSERT INTO user_friendships (user_id, friend_id, status, request_message, source)
VALUES 
  (?, ?, 'pending', '我是XXX，想加你为好友', 'search'),
  (?, ?, 'pending', '我是XXX，想加你为好友', 'search');
*/

-- 示例6: 接受好友申请
/*
UPDATE user_friendships 
SET status = 'accepted', accept_time = NOW()
WHERE (user_id = ? AND friend_id = ?) 
   OR (user_id = ? AND friend_id = ?);
*/

-- =====================================================
-- 数据迁移说明
-- =====================================================
/*
如果已有旧的聊天数据需要迁移，请按以下步骤操作：

1. 备份现有数据
2. 创建新表（执行本文件）
3. 编写数据迁移脚本
4. 验证数据完整性
5. 切换到新表
*/

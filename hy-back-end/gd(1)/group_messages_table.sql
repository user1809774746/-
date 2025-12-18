/*
 群聊消息表设计
 创建日期: 2025-12-10
 功能说明: 存储群聊消息记录，支持各种消息类型和特殊功能
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 表结构: group_messages (群聊消息表)
-- =====================================================
DROP TABLE IF EXISTS `group_messages`;
CREATE TABLE `group_messages` (
  `message_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `group_id` BIGINT NOT NULL COMMENT '群聊ID',
  `sender_id` BIGINT NOT NULL COMMENT '发送者用户ID',
  
  -- 消息内容
  `message_type` ENUM('text', 'image', 'voice', 'video', 'file', 'location', 'link', 'system') 
    DEFAULT 'text' COMMENT '消息类型：text-文本, image-图片, voice-语音, video-视频, file-文件, location-位置, link-链接, system-系统消息',
  `content` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '消息内容（文本消息或消息描述）',
  
  -- 媒体信息
  `media_url` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '媒体文件URL（图片/视频/音频/文件）',
  `media_thumbnail` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '媒体缩略图URL',
  `media_duration` INT NULL DEFAULT NULL COMMENT '音频/视频时长（秒）',
  `media_size` BIGINT NULL DEFAULT NULL COMMENT '文件大小（字节）',
  `file_name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '文件名',
  
  -- 位置信息
  `location_lat` DECIMAL(10, 8) NULL DEFAULT NULL COMMENT '位置纬度',
  `location_lng` DECIMAL(11, 8) NULL DEFAULT NULL COMMENT '位置经度',
  `location_address` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '位置地址描述',
  
  -- 链接信息
  `link_url` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '链接URL',
  `link_title` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '链接标题',
  `link_description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '链接描述',
  
  -- 消息状态
  `reply_to_message_id` BIGINT NULL DEFAULT NULL COMMENT '回复的消息ID（引用回复功能）',
  `is_recalled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已撤回：0-否，1-是',
  `recalled_time` DATETIME NULL DEFAULT NULL COMMENT '撤回时间',
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶：0-否，1-是',
  
  -- 时间信息
  `sent_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 扩展字段
  `extra_data` JSON NULL COMMENT '扩展数据（JSON格式，用于存储特殊消息的额外信息）',
  
  PRIMARY KEY (`message_id`) USING BTREE,
  INDEX `idx_group_id` (`group_id`) USING BTREE,
  INDEX `idx_sender_id` (`sender_id`) USING BTREE,
  INDEX `idx_sent_time` (`sent_time`) USING BTREE,
  INDEX `idx_message_type` (`message_type`) USING BTREE,
  INDEX `idx_is_recalled` (`is_recalled`) USING BTREE,
  INDEX `idx_reply_to` (`reply_to_message_id`) USING BTREE,
  INDEX `idx_group_time` (`group_id`, `sent_time`) USING BTREE COMMENT '群聊消息时间复合索引，用于分页查询',
  
  CONSTRAINT `fk_group_message_group` FOREIGN KEY (`group_id`) 
    REFERENCES `group_chats` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_group_message_sender` FOREIGN KEY (`sender_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_group_message_reply` FOREIGN KEY (`reply_to_message_id`) 
    REFERENCES `group_messages` (`message_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='群聊消息表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 创建全文索引（用于消息搜索）
-- =====================================================
-- 注意：FULLTEXT 索引只支持 MyISAM 和 InnoDB 引擎
-- 需要 MySQL 5.6+ 版本
ALTER TABLE `group_messages` ADD FULLTEXT INDEX `ft_content` (`content`) WITH PARSER ngram;

-- =====================================================
-- 示例数据（可选，用于测试）
-- =====================================================
/*
-- 假设已有 group_id=1 的群聊和 user_id=1,2,3 的用户

-- 文本消息
INSERT INTO group_messages (group_id, sender_id, message_type, content)
VALUES (1, 1, 'text', '大家好，欢迎加入技术交流群！');

-- 图片消息
INSERT INTO group_messages (group_id, sender_id, message_type, content, media_url, media_thumbnail)
VALUES (1, 2, 'image', '[图片]', 'https://example.com/images/photo.jpg', 'https://example.com/images/photo_thumb.jpg');

-- 文件消息
INSERT INTO group_messages (group_id, sender_id, message_type, content, media_url, file_name, media_size)
VALUES (1, 3, 'file', '[文件]', 'https://example.com/files/document.pdf', '技术文档.pdf', 2048000);

-- 回复消息
INSERT INTO group_messages (group_id, sender_id, message_type, content, reply_to_message_id)
VALUES (1, 1, 'text', '同意！我们一起学习。', 1);

-- 系统消息
INSERT INTO group_messages (group_id, sender_id, message_type, content)
VALUES (1, 1, 'system', '用户"张三"加入了群聊');
*/

-- =====================================================
-- 查询示例
-- =====================================================
/*
-- 获取某个群的最新消息（分页）
SELECT 
    gm.message_id,
    gm.group_id,
    gm.sender_id,
    u.UserName as sender_name,
    u.Avatar as sender_avatar,
    gm.message_type,
    gm.content,
    gm.media_url,
    gm.file_name,
    gm.sent_time,
    gm.is_recalled,
    gm.reply_to_message_id
FROM group_messages gm
LEFT JOIN user_info u ON gm.sender_id = u.UserID
WHERE gm.group_id = 1 AND gm.is_recalled = 0
ORDER BY gm.sent_time DESC
LIMIT 20 OFFSET 0;

-- 搜索群消息
SELECT 
    gm.message_id,
    gm.content,
    gm.sender_id,
    gm.sent_time
FROM group_messages gm
WHERE gm.group_id = 1 
  AND gm.message_type = 'text'
  AND gm.is_recalled = 0
  AND MATCH(gm.content) AGAINST('关键词' IN NATURAL LANGUAGE MODE)
ORDER BY gm.sent_time DESC
LIMIT 20;

-- 获取回复链
SELECT 
    gm.*,
    reply.content as reply_content,
    reply.sender_id as reply_sender_id
FROM group_messages gm
LEFT JOIN group_messages reply ON gm.reply_to_message_id = reply.message_id
WHERE gm.group_id = 1
ORDER BY gm.sent_time DESC;
*/

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 聊天图片存储表补丁
-- 创建日期: 2025-12-11
-- 功能说明: 为聊天系统添加图片上传和管理功能
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 创建聊天图片存储表
-- =====================================================

DROP TABLE IF EXISTS `chat_images`;

CREATE TABLE `chat_images` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uploader_id` BIGINT NOT NULL COMMENT '上传者用户ID',
  `image_type` ENUM('chat_background', 'group_avatar', 'user_avatar', 'chat_message', 'other') 
    DEFAULT 'other' COMMENT '图片类型：chat_background-聊天背景, group_avatar-群头像, user_avatar-用户头像, chat_message-聊天消息图片, other-其他',
  `original_filename` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始文件名',
  `stored_filename` VARCHAR(255) NOT NULL COMMENT '存储的文件名（UUID重命名后）',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件存储路径',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件访问URL',
  `file_size` BIGINT NOT NULL COMMENT '文件大小（字节）',
  `file_extension` VARCHAR(20) NOT NULL COMMENT '文件扩展名（如：jpg, png）',
  `mime_type` VARCHAR(100) NOT NULL COMMENT 'MIME类型（如：image/jpeg）',
  `image_width` INT NULL COMMENT '图片宽度（像素）',
  `image_height` INT NULL COMMENT '图片高度（像素）',
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已删除：0-否，1-是（软删除）',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_uploader_id`(`uploader_id`) USING BTREE,
  INDEX `idx_image_type`(`image_type`) USING BTREE,
  INDEX `idx_created_time`(`created_time`) USING BTREE,
  INDEX `idx_stored_filename`(`stored_filename`) USING BTREE,
  
  CONSTRAINT `fk_chat_image_uploader` FOREIGN KEY (`uploader_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='聊天图片存储表' ROW_FORMAT=DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 补丁执行完成
-- =====================================================
-- 说明：
-- 1. 创建了 chat_images 表用于存储图片元信息
-- 2. 图片文件本身存储在服务器文件系统中，数据库只存储路径和URL
-- 3. 支持多种图片类型：聊天背景、群头像、用户头像、聊天消息图片等
-- 4. 包含图片的详细信息：尺寸、大小、MIME类型等
-- 5. 支持软删除，便于数据恢复和审计
-- =====================================================

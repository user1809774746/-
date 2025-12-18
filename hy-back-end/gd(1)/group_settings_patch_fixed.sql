-- =====================================================
-- 群聊设置功能数据库补丁
-- 创建日期: 2025-12-11
-- 功能说明: 为群聊系统添加置顶、免打扰、背景设置、清空记录、举报等功能
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 扩展 group_members 表，添加群聊设置相关字段
-- =====================================================

-- 添加置顶字段
ALTER TABLE `group_members` 
ADD COLUMN `is_pinned` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶该群聊：0-否，1-是' AFTER `unread_count`;

-- 添加消息免打扰字段
ALTER TABLE `group_members` 
ADD COLUMN `is_disturb_free` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '消息免打扰：0-关闭，1-开启' AFTER `is_pinned`;

-- 添加群聊背景字段（用户可以为自己设置每个群的背景）
ALTER TABLE `group_members` 
ADD COLUMN `chat_background` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '群聊背景图片URL（用户自定义）' AFTER `is_disturb_free`;

-- 添加清空聊天记录时间点字段
ALTER TABLE `group_members` 
ADD COLUMN `clear_history_time` DATETIME NULL DEFAULT NULL COMMENT '清空聊天记录的时间点（只显示该时间之后的消息）' AFTER `chat_background`;

-- 为新字段创建索引
CREATE INDEX `idx_is_pinned` ON `group_members`(`user_id`, `is_pinned`) USING BTREE COMMENT '用户置顶群聊索引';

-- =====================================================
-- 2. 创建群聊举报表
-- =====================================================

DROP TABLE IF EXISTS `group_reports`;

CREATE TABLE `group_reports` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `group_id` BIGINT NOT NULL COMMENT '被举报的群聊ID',
  `reporter_id` BIGINT NOT NULL COMMENT '举报人ID',
  `report_type` ENUM('spam', 'fraud', 'pornography', 'violence', 'politics', 'harassment', 'other') 
    DEFAULT 'other' COMMENT '举报类型：spam-垃圾广告, fraud-欺诈, pornography-色情, violence-暴力, politics-政治敏感, harassment-骚扰, other-其他',
  `report_reason` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '举报详细原因',
  `evidence_urls` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '证据截图URL列表（JSON数组格式，存储为TEXT）',
  `report_status` ENUM('pending', 'processing', 'resolved', 'rejected') 
    DEFAULT 'pending' COMMENT '处理状态：pending-待处理, processing-处理中, resolved-已解决, rejected-已驳回',
  `handler_id` BIGINT NULL DEFAULT NULL COMMENT '处理人ID（管理员）',
  `handle_result` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '处理结果说明',
  `handled_time` DATETIME NULL DEFAULT NULL COMMENT '处理时间',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_group_id`(`group_id`) USING BTREE,
  INDEX `idx_reporter_id`(`reporter_id`) USING BTREE,
  INDEX `idx_report_status`(`report_status`) USING BTREE,
  INDEX `idx_report_type`(`report_type`) USING BTREE,
  INDEX `idx_created_time`(`created_time`) USING BTREE,
  
  CONSTRAINT `fk_group_report_group` FOREIGN KEY (`group_id`) 
    REFERENCES `group_chats` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_group_report_reporter` FOREIGN KEY (`reporter_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='群聊举报表' ROW_FORMAT=DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 补丁执行完成
-- =====================================================
-- 说明：
-- 1. group_members 表新增字段：is_pinned, is_disturb_free, chat_background, clear_history_time
-- 2. 创建了 group_reports 表用于存储举报记录
-- 3. evidence_urls 以 JSON 格式存储在 TEXT 字段中
-- =====================================================

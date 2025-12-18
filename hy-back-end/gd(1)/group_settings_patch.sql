/*
 群聊设置功能数据库补丁
 创建日期: 2025-12-11
 功能说明: 为群聊系统添加置顶、免打扰、背景设置、清空记录、举报等功能
*/

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
-- 查询示例
-- =====================================================

/*
-- 1. 查询用户的置顶群聊列表
SELECT 
    gc.group_id,
    gc.group_name,
    gc.group_avatar,
    gm.is_pinned,
    gm.is_disturb_free,
    gm.unread_count
FROM group_members gm
INNER JOIN group_chats gc ON gm.group_id = gc.group_id
WHERE gm.user_id = ? 
  AND gm.member_status = 'active'
  AND gm.is_pinned = 1
ORDER BY gc.updated_time DESC;

-- 2. 查询群聊消息（考虑清空历史记录时间）
SELECT 
    gm.message_id,
    gm.sender_id,
    gm.message_type,
    gm.content,
    gm.sent_time
FROM group_messages gm
INNER JOIN group_members mem ON gm.group_id = mem.group_id
WHERE gm.group_id = ? 
  AND mem.user_id = ?
  AND gm.is_recalled = 0
  AND (mem.clear_history_time IS NULL OR gm.sent_time > mem.clear_history_time)
ORDER BY gm.sent_time DESC
LIMIT 50;

-- 3. 查询用户对群聊的设置
SELECT 
    is_pinned,
    is_disturb_free,
    chat_background,
    clear_history_time
FROM group_members
WHERE group_id = ? AND user_id = ? AND member_status = 'active';

-- 4. 查询待处理的群聊举报
SELECT 
    gr.id,
    gr.group_id,
    gc.group_name,
    gr.reporter_id,
    ui.UserName as reporter_name,
    gr.report_type,
    gr.report_reason,
    gr.created_time
FROM group_reports gr
INNER JOIN group_chats gc ON gr.group_id = gc.group_id
INNER JOIN user_info ui ON gr.reporter_id = ui.UserID
WHERE gr.report_status = 'pending'
ORDER BY gr.created_time DESC;
*/

-- =====================================================
-- 补丁说明
-- =====================================================
/*
1. group_members 表新增字段：
   - is_pinned: 是否置顶该群聊（用户维度）
   - is_disturb_free: 消息免打扰开关（用户维度）
   - chat_background: 群聊背景图片URL（用户维度，每个用户可以为同一个群设置不同背景）
   - clear_history_time: 清空聊天记录的时间点（查询时只显示该时间之后的消息）

2. group_reports 表：
   - 记录用户对群聊的举报信息
   - 支持多种举报类型
   - 可上传证据截图（evidence_urls 以 JSON 格式存储在 TEXT 字段中）
   - 完整的处理流程追踪

使用说明：
1. 置顶群聊：修改 group_members.is_pinned 为 1
2. 消息免打扰：修改 group_members.is_disturb_free 为 1
3. 设置背景：更新 group_members.chat_background 为图片URL
4. 清空记录：更新 group_members.clear_history_time 为当前时间，查询时过滤该时间之前的消息
5. 举报群聊：在 group_reports 表插入新记录
*/

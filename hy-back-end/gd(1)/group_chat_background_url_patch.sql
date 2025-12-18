/*
 群聊背景URL支持 - 数据库补丁
 创建日期: 2025-12-11
 功能说明: 
   - 为group_members表添加chat_background字段，存储用户自定义的群聊背景图片URL
   - 每个用户可以为同一个群聊设置不同的背景图
   - 此脚本可以安全地重复执行
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 检查并添加 chat_background 字段
-- =====================================================

-- 检查字段是否存在
SET @exist_chat_background = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'group_members' 
    AND COLUMN_NAME = 'chat_background'
);

-- 如果字段不存在则添加
SET @sql_add_chat_background = IF(
    @exist_chat_background = 0,
    'ALTER TABLE `group_members` ADD COLUMN `chat_background` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT ''群聊背景图片URL（用户自定义，支持任意图片URL）'' AFTER `is_disturb_free`;',
    'SELECT ''chat_background 字段已存在，跳过创建'' AS result;'
);

PREPARE stmt FROM @sql_add_chat_background;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 使用说明
-- =====================================================
/*
1. 字段用途：
   - chat_background 字段用于存储用户为群聊设置的背景图片URL
   - 用户可以使用任意图片URL（来自网络、图床、CDN等）
   - 每个用户可以为同一个群聊设置不同的背景图

2. API调用示例：
   PUT /api/group/{groupId}/settings/background
   {
     "backgroundUrl": "https://example.com/images/background.jpg"
   }

3. 前端使用建议：
   - 用户可以粘贴任意图片URL
   - 前端可以提供图片选择器，从图床或CDN选择图片
   - 建议验证URL格式和图片可访问性

4. 查询背景设置：
   SELECT chat_background 
   FROM group_members 
   WHERE group_id = ? AND user_id = ? AND member_status = 'active';

5. 更新背景设置：
   UPDATE group_members 
   SET chat_background = 'https://example.com/images/new-background.jpg'
   WHERE group_id = ? AND user_id = ? AND member_status = 'active';

6. 清除背景设置（恢复默认）：
   UPDATE group_members 
   SET chat_background = NULL
   WHERE group_id = ? AND user_id = ? AND member_status = 'active';
*/

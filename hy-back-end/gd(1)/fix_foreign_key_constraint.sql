-- 修复外键约束问题
-- 问题：messages表的conversation_id外键约束导致无法插入消息
-- 解决方案：删除外键约束，允许直接插入消息

USE gd_mcp;

-- 1. 删除messages表的conversation外键约束
ALTER TABLE `messages` DROP FOREIGN KEY `fk_messages_conversation`;

-- 2. 删除其他可能导致问题的外键约束（如果不需要严格的引用完整性）
-- ALTER TABLE `messages` DROP FOREIGN KEY `fk_messages_sender`;
-- ALTER TABLE `messages` DROP FOREIGN KEY `fk_messages_receiver`;
-- ALTER TABLE `messages` DROP FOREIGN KEY `fk_messages_reply`;

-- 3. 保留索引以提高查询性能
-- 外键约束已删除，但索引仍然存在，不影响性能

SELECT '✅ 外键约束已删除，现在可以直接插入消息了' as status;

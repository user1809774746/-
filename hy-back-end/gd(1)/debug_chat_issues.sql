-- 聊天功能问题诊断SQL脚本

-- 1. 检查用户表中是否存在用户ID 1和3
SELECT '=== 检查用户是否存在 ===' as info;
SELECT user_id, username, number, created_at 
FROM user_info 
WHERE user_id IN (1, 3);

-- 2. 检查所有用户
SELECT '=== 所有用户列表 ===' as info;
SELECT user_id, username, number, created_at 
FROM user_info 
ORDER BY user_id 
LIMIT 10;

-- 3. 检查消息表结构
SELECT '=== 消息表结构检查 ===' as info;
DESCRIBE messages;

-- 4. 检查消息表是否存在
SELECT '=== 检查消息表 ===' as info;
SELECT COUNT(*) as message_count FROM messages;

-- 5. 检查好友关系
SELECT '=== 好友关系检查 ===' as info;
SELECT * FROM friendship 
WHERE (user_id = 1 AND friend_id = 3) 
   OR (user_id = 3 AND friend_id = 1);

-- 6. 检查数据库连接和基本信息
SELECT '=== 数据库基本信息 ===' as info;
SELECT DATABASE() as current_database, NOW() as current_time;

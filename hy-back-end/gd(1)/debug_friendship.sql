-- 调试好友关系表的SQL脚本

-- 1. 查看所有好友关系记录
SELECT * FROM user_friendships ORDER BY created_at DESC;

-- 2. 查看用户1和用户3之间的关系
SELECT * FROM user_friendships 
WHERE (userId = 1 AND friendId = 3) OR (userId = 3 AND friendId = 1)
ORDER BY created_at DESC;

-- 3. 查看是否有重复记录
SELECT 
    LEAST(userId, friendId) as user1,
    GREATEST(userId, friendId) as user2,
    COUNT(*) as count,
    GROUP_CONCAT(id) as ids,
    GROUP_CONCAT(status) as statuses
FROM user_friendships 
GROUP BY LEAST(userId, friendId), GREATEST(userId, friendId)
HAVING COUNT(*) > 1;

-- 4. 查看用户表中是否存在用户1和用户3
SELECT userId, username, number FROM user_info WHERE userId IN (1, 3);

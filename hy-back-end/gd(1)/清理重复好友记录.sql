-- 清理重复好友记录的SQL脚本

-- 1. 查看重复记录
SELECT 
    LEAST(userId, friendId) as user1,
    GREATEST(userId, friendId) as user2,
    COUNT(*) as count
FROM user_friendships 
GROUP BY LEAST(userId, friendId), GREATEST(userId, friendId)
HAVING COUNT(*) > 1;

-- 2. 删除重复记录，保留最新的一条
DELETE f1 FROM user_friendships f1
INNER JOIN user_friendships f2 
WHERE f1.id < f2.id 
AND (
    (f1.userId = f2.userId AND f1.friendId = f2.friendId) OR
    (f1.userId = f2.friendId AND f1.friendId = f2.userId)
);

-- 3. 验证清理结果
SELECT 
    LEAST(userId, friendId) as user1,
    GREATEST(userId, friendId) as user2,
    COUNT(*) as count
FROM user_friendships 
GROUP BY LEAST(userId, friendId), GREATEST(userId, friendId)
HAVING COUNT(*) > 1;

-- 4. 查看当前所有好友关系
SELECT * FROM user_friendships ORDER BY createdAt DESC;

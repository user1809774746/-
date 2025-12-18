-- 🔍 检查收藏表中的重复记录问题
-- 用于诊断和修复 travel_post_favorite 表的数据问题

-- ========================================
-- 1. 检查是否有重复的收藏记录（同一用户对同一帖子的多条记录）
-- ========================================
SELECT 
    user_id, 
    post_id, 
    COUNT(*) as record_count,
    GROUP_CONCAT(id) as record_ids,
    GROUP_CONCAT(status) as statuses,
    GROUP_CONCAT(is_deleted) as is_deleted_flags
FROM travel_post_favorite
GROUP BY user_id, post_id
HAVING COUNT(*) > 1;

-- ========================================
-- 2. 查看具体的重复记录详情
-- ========================================
SELECT 
    tpf.id,
    tpf.user_id,
    tpf.post_id,
    tpf.status,
    tpf.is_deleted,
    tpf.favorite_time,
    tpf.deleted_time
FROM travel_post_favorite tpf
WHERE (tpf.user_id, tpf.post_id) IN (
    SELECT user_id, post_id
    FROM travel_post_favorite
    GROUP BY user_id, post_id
    HAVING COUNT(*) > 1
)
ORDER BY tpf.user_id, tpf.post_id, tpf.favorite_time;

-- ========================================
-- 3. 🔧 修复方案 1：删除重复的已删除记录，保留最新的记录
-- ========================================
-- 注意：执行前请先备份数据！
-- 这个脚本会删除旧的已删除记录，只保留每个 (user_id, post_id) 组合的最新一条记录

-- 查看将要删除的记录（预览）
SELECT tpf1.*
FROM travel_post_favorite tpf1
WHERE EXISTS (
    SELECT 1
    FROM travel_post_favorite tpf2
    WHERE tpf2.user_id = tpf1.user_id
      AND tpf2.post_id = tpf1.post_id
      AND tpf2.id > tpf1.id
);

-- 执行删除（取消注释下面这行来执行）
-- DELETE tpf1
-- FROM travel_post_favorite tpf1
-- WHERE EXISTS (
--     SELECT 1
--     FROM travel_post_favorite tpf2
--     WHERE tpf2.user_id = tpf1.user_id
--       AND tpf2.post_id = tpf1.post_id
--       AND tpf2.id > tpf1.id
-- );

-- ========================================
-- 4. 🔧 修复方案 2：保留活跃记录，删除其他记录
-- ========================================
-- 如果同一个 (user_id, post_id) 有多条记录，保留活跃的，删除已删除的

-- 查看将要删除的记录（预览）
SELECT tpf1.*
FROM travel_post_favorite tpf1
WHERE tpf1.is_deleted = TRUE
  AND EXISTS (
    SELECT 1
    FROM travel_post_favorite tpf2
    WHERE tpf2.user_id = tpf1.user_id
      AND tpf2.post_id = tpf1.post_id
      AND tpf2.is_deleted = FALSE
      AND tpf2.status = 'active'
  );

-- 执行删除（取消注释下面这行来执行）
-- DELETE tpf1
-- FROM travel_post_favorite tpf1
-- WHERE tpf1.is_deleted = TRUE
--   AND EXISTS (
--     SELECT 1
--     FROM travel_post_favorite tpf2
--     WHERE tpf2.user_id = tpf1.user_id
--       AND tpf2.post_id = tpf1.post_id
--       AND tpf2.is_deleted = FALSE
--       AND tpf2.status = 'active'
--   );

-- ========================================
-- 5. 🔧 修复方案 3：针对特定帖子 ID（如帖子 2）的修复
-- ========================================
-- 如果你知道具体是哪个帖子出问题，可以针对性修复

-- 查看帖子 2 的收藏记录
SELECT * FROM travel_post_favorite WHERE post_id = 2 ORDER BY favorite_time DESC;

-- 如果有重复记录，保留最新的一条，删除其他
-- 执行前请先确认！
-- DELETE FROM travel_post_favorite 
-- WHERE post_id = 2 
--   AND id NOT IN (
--     SELECT id FROM (
--       SELECT MAX(id) as id 
--       FROM travel_post_favorite 
--       WHERE post_id = 2 
--       GROUP BY user_id
--     ) as temp
--   );

-- ========================================
-- 6. 验证修复结果
-- ========================================
-- 确保每个 (user_id, post_id) 组合只有一条记录
SELECT 
    user_id, 
    post_id, 
    COUNT(*) as record_count
FROM travel_post_favorite
GROUP BY user_id, post_id
HAVING COUNT(*) > 1;

-- 应该返回空结果，表示没有重复记录

-- ========================================
-- 7. 查看收藏表的统计信息
-- ========================================
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT post_id) as unique_posts,
    SUM(CASE WHEN status = 'active' AND is_deleted = FALSE THEN 1 ELSE 0 END) as active_favorites,
    SUM(CASE WHEN is_deleted = TRUE THEN 1 ELSE 0 END) as deleted_favorites
FROM travel_post_favorite;

-- ========================================
-- 使用说明
-- ========================================
/*
1. 先运行第 1、2 步查看是否有重复记录
2. 如果有重复，根据情况选择修复方案：
   - 方案 1：删除旧记录，保留最新的
   - 方案 2：保留活跃记录，删除已删除的
   - 方案 3：针对特定帖子修复
3. 执行修复前，先运行预览查询确认要删除的记录
4. 取消注释 DELETE 语句执行删除
5. 运行第 6 步验证修复结果
6. 重启后端服务使代码修复生效
*/


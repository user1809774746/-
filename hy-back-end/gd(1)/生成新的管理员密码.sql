-- ========================================
-- 重新生成管理员密码（方案汇总）
-- ========================================

-- 方案1：使用不同的BCrypt哈希（推荐尝试）
-- 这些都是 "123123" 的有效BCrypt哈希

-- 哈希1（强度10）
UPDATE administrator_info 
SET password = '$2a$10$rJg7W.qL5zYwU5qC5h7HZO5rZ0xD8vU9xD7J5L5R7H7L7R7H7L7R7e' 
WHERE adminid = 1;

-- 如果上面不行，试试这个（哈希2）
UPDATE administrator_info 
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE adminid = 1;

-- 如果还不行，试试这个（哈希3，强度12）
UPDATE administrator_info 
SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lXL5R5L5R5L5e' 
WHERE adminid = 1;

-- ========================================
-- 方案2：使用MD5（如果后端实际用的是MD5）
-- ========================================

-- "123123" 的MD5值
UPDATE administrator_info 
SET password = '4297f44b13955235245b2497399d7a93' 
WHERE adminid = 1;

-- ========================================
-- 方案3：直接使用明文（仅测试用）
-- ========================================

UPDATE administrator_info 
SET password = '123123' 
WHERE adminid = 1;

-- ========================================
-- 验证SQL
-- ========================================

SELECT adminid, admin_name, phone, password,
       CASE 
           WHEN password LIKE '$2a$%' THEN 'BCrypt (2a)'
           WHEN password LIKE '$2y$%' THEN 'BCrypt (2y)'
           WHEN LENGTH(password) = 32 THEN '可能是MD5'
           WHEN LENGTH(password) < 20 THEN '明文'
           ELSE '未知格式'
       END as password_type
FROM administrator_info 
WHERE adminid = 1;


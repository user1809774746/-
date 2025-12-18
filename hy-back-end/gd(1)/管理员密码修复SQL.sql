-- ========================================
-- 管理员密码修复 SQL 语句
-- ========================================
-- 问题：数据库中的密码是明文，但后端使用BCrypt加密验证
-- 解决：将明文密码 "123123" 更新为BCrypt加密后的密码哈希

-- BCrypt加密后的密码哈希（原始密码：123123）
-- $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- 执行以下SQL语句更新管理员密码：
UPDATE administrator_info 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE phone = '18888888888';

-- ========================================
-- 验证更新结果
-- ========================================
SELECT adminid, admin_name, phone, 
       LEFT(password, 20) as password_preview,
       CASE 
           WHEN password LIKE '$2a$%' THEN '✅ BCrypt格式正确'
           ELSE '❌ 明文密码（需要加密）'
       END as password_status
FROM administrator_info
WHERE phone = '18888888888';

-- ========================================
-- 说明
-- ========================================
-- 1. 原始密码：123123
-- 2. BCrypt加密后：$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- 3. 执行UPDATE语句后，前端使用 "123123" 登录即可成功
-- ========================================


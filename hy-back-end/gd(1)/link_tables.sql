-- 关联travel_post和user_travel_post两个表的MySQL语句
-- 假设travel_post表已经存在

-- 1. 首先备份现有的user_travel_post表
CREATE TABLE user_travel_post_backup AS SELECT * FROM user_travel_post;

-- 2. 为user_travel_post表添加travel_post_id字段（如果不存在）
ALTER TABLE user_travel_post 
ADD COLUMN travel_post_id BIGINT COMMENT '关联的travel_post表ID' AFTER id;

-- 3. 添加索引
ALTER TABLE user_travel_post 
ADD INDEX idx_travel_post_id (travel_post_id);

-- 4. 添加外键约束（可选，如果需要强制引用完整性）
-- ALTER TABLE user_travel_post 
-- ADD CONSTRAINT fk_user_travel_post_travel_post 
-- FOREIGN KEY (travel_post_id) REFERENCES travel_post(id) ON DELETE CASCADE;

-- 5. 查看修改后的表结构
DESCRIBE user_travel_post;

-- 6. 验证表关联
SELECT 'user_travel_post表已添加travel_post_id字段' as status;

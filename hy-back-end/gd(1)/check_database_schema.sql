-- 检查数据库表结构的SQL脚本

-- 1. 检查travel_post表是否存在
SHOW TABLES LIKE 'travel_post';

-- 2. 如果存在，查看表结构
DESCRIBE travel_post;

-- 3. 检查user_travel_post表结构
DESCRIBE user_travel_post;

-- 4. 查看所有表
SHOW TABLES;

-- 5. 检查travel_post表的创建语句（如果存在）
SHOW CREATE TABLE travel_post;

-- 6. 检查user_travel_post表的创建语句
SHOW CREATE TABLE user_travel_post;

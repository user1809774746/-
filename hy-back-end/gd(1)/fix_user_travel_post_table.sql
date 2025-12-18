-- 修复user_travel_post表结构
-- 这个表应该只存储用户与帖子的关联关系，不应该有帖子内容字段

-- 1. 备份现有数据
CREATE TABLE user_travel_post_backup AS SELECT * FROM user_travel_post;

-- 2. 删除旧表
DROP TABLE IF EXISTS user_travel_post;

-- 3. 创建正确的表结构（只包含关联关系和用户特定信息）
CREATE TABLE user_travel_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    
    -- 关联信息
    travel_post_id BIGINT NOT NULL COMMENT '关联的travel_post表ID',
    publisher_id BIGINT NOT NULL COMMENT '发布者用户ID',
    
    -- 发布者信息
    publisher_nickname VARCHAR(100) COMMENT '发布者昵称',
    publisher_avatar_url VARCHAR(500) COMMENT '发布者头像URL',
    
    -- 用户特定的状态和权限
    user_status VARCHAR(20) DEFAULT 'active' COMMENT '用户对此帖子的状态：active, hidden, deleted, draft, published',
    is_original BOOLEAN DEFAULT TRUE COMMENT '是否原创',
    user_notes LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '用户对此帖子的私人备注',
    user_tags VARCHAR(500) COMMENT '用户自定义标签',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT '用户是否置顶此帖子',
    user_category VARCHAR(50) COMMENT '用户自定义分类',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    user_published_time DATETIME COMMENT '用户发布时间',
    user_deleted_time DATETIME COMMENT '用户删除时间',
    
    -- 外键约束
    FOREIGN KEY (travel_post_id) REFERENCES travel_post(id) ON DELETE CASCADE,
    FOREIGN KEY (publisher_id) REFERENCES user_info(UserID) ON DELETE CASCADE,
    
    -- 索引
    UNIQUE INDEX idx_travel_post_publisher (travel_post_id, publisher_id),
    INDEX idx_publisher_status (publisher_id, user_status),
    INDEX idx_published_time (user_published_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户帖子关联表';

-- 4. 验证表结构
DESCRIBE user_travel_post;

SELECT 'user_travel_post表已重建完成' as status;


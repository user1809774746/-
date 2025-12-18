-- 删除已存在的表（如果需要重新创建）
-- DROP TABLE IF EXISTS user_post_comment;
-- DROP TABLE IF EXISTS user_post_like;
-- DROP TABLE IF EXISTS user_post_draft;
-- DROP TABLE IF EXISTS user_travel_post;

-- 创建用户发布帖子主表（与实体类完全匹配）
CREATE TABLE user_travel_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    publisher_id BIGINT NOT NULL,
    publisher_nickname VARCHAR(100),
    publisher_avatar_url VARCHAR(500),
    
    title VARCHAR(200) NOT NULL,
    summary LONGTEXT,
    content LONGTEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'richtext',
    
    post_type VARCHAR(50) DEFAULT 'travel_note',
    category VARCHAR(50),
    
    cover_image VARCHAR(500),
    images LONGTEXT,
    videos LONGTEXT,
    attachments LONGTEXT,
    
    destination_name VARCHAR(200),
    destination_city VARCHAR(100),
    destination_province VARCHAR(100),
    destination_country VARCHAR(100) DEFAULT 'China',
    locations LONGTEXT,
    
    travel_start_date DATE,
    travel_end_date DATE,
    travel_days INT,
    travel_budget DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    travel_season VARCHAR(50),
    travel_style VARCHAR(100),
    companion_type VARCHAR(50),
    
    tags VARCHAR(500),
    keywords VARCHAR(300),
    
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_top BOOLEAN DEFAULT FALSE,
    is_original BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    
    audit_status VARCHAR(20) DEFAULT 'pending',
    audit_time DATETIME,
    audit_reason LONGTEXT,
    auditor_id BIGINT,
    
    allow_comments BOOLEAN DEFAULT TRUE,
    allow_shares BOOLEAN DEFAULT TRUE,
    copyright_info VARCHAR(200),
    
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_time DATETIME,
    deleted_time DATETIME
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建帖子草稿表
CREATE TABLE user_post_draft (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    publisher_id BIGINT NOT NULL,
    draft_title VARCHAR(200),
    draft_content LONGTEXT,
    draft_data LONGTEXT,
    auto_save_time DATETIME,
    
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建帖子点赞表
CREATE TABLE user_post_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    like_type VARCHAR(20) DEFAULT 'like',
    
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_post_user (post_id, user_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建帖子评论表
CREATE TABLE user_post_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_comment_id BIGINT,
    
    comment_content LONGTEXT NOT NULL,
    comment_images LONGTEXT,
    
    like_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'normal',
    is_author_reply BOOLEAN DEFAULT FALSE,
    
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建基础索引
CREATE INDEX idx_publisher_id ON user_travel_post (publisher_id);
CREATE INDEX idx_status ON user_travel_post (status);
CREATE INDEX idx_post_type ON user_travel_post (post_type);
CREATE INDEX idx_created_time ON user_travel_post (created_time);

CREATE INDEX idx_publisher_id_draft ON user_post_draft (publisher_id);
CREATE INDEX idx_post_id_like ON user_post_like (post_id);
CREATE INDEX idx_user_id_like ON user_post_like (user_id);
CREATE INDEX idx_post_id_comment ON user_post_comment (post_id);
CREATE INDEX idx_user_id_comment ON user_post_comment (user_id);

-- 插入测试数据
INSERT INTO user_travel_post (
    publisher_id, publisher_nickname, title, summary, content, post_type,
    destination_name, destination_city, status, audit_status, is_public
) VALUES 
(1, '测试用户', '测试帖子', '这是测试摘要', '这是测试内容', 'travel_note',
 '测试目的地', '测试城市', 'draft', 'pending', true);

-- 验证创建结果
SELECT 'Tables created successfully' as message;
SELECT COUNT(*) as post_count FROM user_travel_post;
DESCRIBE user_travel_post;

-- 创建用户发布帖子相关的数据库表

-- 用户发布帖子主表
CREATE TABLE user_travel_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '帖子ID',
    publisher_id BIGINT NOT NULL COMMENT '发布者用户ID',
    publisher_nickname VARCHAR(100) COMMENT '发布者昵称',
    publisher_avatar_url VARCHAR(500) COMMENT '发布者头像URL',
    
    title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    summary TEXT COMMENT '帖子摘要',
    content LONGTEXT NOT NULL COMMENT '帖子完整内容',
    content_type VARCHAR(20) DEFAULT 'richtext' COMMENT '内容类型',
    
    post_type VARCHAR(50) DEFAULT 'travel_note' COMMENT '帖子类型',
    category VARCHAR(50) COMMENT '帖子分类',
    
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    images TEXT COMMENT '图片集合（JSON格式）',
    videos TEXT COMMENT '视频集合（JSON格式）',
    attachments TEXT COMMENT '附件信息（JSON格式）',
    
    destination_name VARCHAR(200) COMMENT '目的地名称',
    destination_city VARCHAR(100) COMMENT '目的地城市',
    destination_province VARCHAR(100) COMMENT '目的地省份',
    destination_country VARCHAR(100) DEFAULT 'China' COMMENT '目的地国家',
    locations TEXT COMMENT '具体位置信息（JSON格式）',
    
    travel_start_date DATE COMMENT '旅行开始日期',
    travel_end_date DATE COMMENT '旅行结束日期',
    travel_days INT COMMENT '旅行天数',
    travel_budget DECIMAL(10,2) COMMENT '旅行预算',
    actual_cost DECIMAL(10,2) COMMENT '实际花费',
    travel_season VARCHAR(50) COMMENT '旅行季节',
    travel_style VARCHAR(100) COMMENT '旅行风格',
    companion_type VARCHAR(50) COMMENT '同行人类型',
    
    tags VARCHAR(500) COMMENT '标签',
    keywords VARCHAR(300) COMMENT '关键词',
    
    view_count INT DEFAULT 0 COMMENT '浏览量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    rating DECIMAL(3,1) DEFAULT 0.0 COMMENT '评分',
    rating_count INT DEFAULT 0 COMMENT '评分人数',
    
    status VARCHAR(20) DEFAULT 'draft' COMMENT '帖子状态',
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否精选',
    is_top BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    is_original BOOLEAN DEFAULT TRUE COMMENT '是否原创',
    is_public BOOLEAN DEFAULT TRUE COMMENT '是否公开',
    
    audit_status VARCHAR(20) DEFAULT 'pending' COMMENT '审核状态',
    audit_time DATETIME COMMENT '审核时间',
    audit_reason TEXT COMMENT '审核意见',
    auditor_id BIGINT COMMENT '审核员ID',
    
    allow_comments BOOLEAN DEFAULT TRUE COMMENT '是否允许评论',
    allow_shares BOOLEAN DEFAULT TRUE COMMENT '是否允许分享',
    copyright_info VARCHAR(200) COMMENT '版权信息',
    
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    published_time DATETIME COMMENT '发布时间',
    deleted_time DATETIME COMMENT '删除时间'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户发布的旅游帖子表';

-- 帖子草稿表
CREATE TABLE user_post_draft (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '草稿ID',
    publisher_id BIGINT NOT NULL COMMENT '发布者用户ID',
    draft_title VARCHAR(200) COMMENT '草稿标题',
    draft_content LONGTEXT COMMENT '草稿内容',
    draft_data TEXT COMMENT '草稿的完整数据（JSON格式）',
    auto_save_time DATETIME COMMENT '自动保存时间',
    
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子草稿表';

-- 帖子点赞表
CREATE TABLE user_post_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞记录ID',
    post_id BIGINT NOT NULL COMMENT '帖子ID',
    user_id BIGINT NOT NULL COMMENT '点赞用户ID',
    like_type VARCHAR(20) DEFAULT 'like' COMMENT '点赞类型',
    
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    
    UNIQUE KEY uk_post_user (post_id, user_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子点赞表';

-- 帖子评论表
CREATE TABLE user_post_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
    post_id BIGINT NOT NULL COMMENT '帖子ID',
    user_id BIGINT NOT NULL COMMENT '评论用户ID',
    parent_comment_id BIGINT COMMENT '父评论ID',
    
    comment_content TEXT NOT NULL COMMENT '评论内容',
    comment_images TEXT COMMENT '评论图片（JSON格式）',
    
    like_count INT DEFAULT 0 COMMENT '评论点赞数',
    reply_count INT DEFAULT 0 COMMENT '回复数量',
    
    status VARCHAR(20) DEFAULT 'normal' COMMENT '评论状态',
    is_author_reply BOOLEAN DEFAULT FALSE COMMENT '是否为作者回复',
    
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子评论表';

-- 创建索引
CREATE INDEX idx_publisher_id ON user_travel_post (publisher_id);
CREATE INDEX idx_status ON user_travel_post (status);
CREATE INDEX idx_post_type ON user_travel_post (post_type);
CREATE INDEX idx_destination_city ON user_travel_post (destination_city);
CREATE INDEX idx_published_time ON user_travel_post (published_time);

CREATE INDEX idx_publisher_id ON user_post_draft (publisher_id);
CREATE INDEX idx_updated_time ON user_post_draft (updated_time);

CREATE INDEX idx_post_id ON user_post_like (post_id);
CREATE INDEX idx_user_id ON user_post_like (user_id);

CREATE INDEX idx_post_id ON user_post_comment (post_id);
CREATE INDEX idx_user_id ON user_post_comment (user_id);
CREATE INDEX idx_parent_comment ON user_post_comment (parent_comment_id);

-- 插入测试数据（可选）
INSERT INTO user_travel_post (
    publisher_id, publisher_nickname, title, summary, content, post_type,
    destination_name, destination_city, destination_province, travel_days,
    travel_budget, status, audit_status, is_public, published_time
) VALUES 
(1, '测试用户', '测试帖子标题', '这是一个测试帖子的摘要', '# 测试帖子内容\n\n这是帖子的详细内容...', 'travel_note',
 '北京', '北京市', '北京市', 3, 1500.00, 'published', 'approved', true, NOW());

-- 验证数据
SELECT '帖子表数据验证' as info;
SELECT COUNT(*) as post_count FROM user_travel_post;
SELECT id, title, status, publisher_id FROM user_travel_post;

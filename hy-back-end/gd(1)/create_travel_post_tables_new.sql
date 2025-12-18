-- 创建新的帖子系统数据库表结构
-- 包含travel_post主表和更新后的user_travel_post关联表

-- 1. 创建旅游帖子主表
CREATE TABLE travel_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- 帖子基本信息
    title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    summary LONGTEXT COMMENT '帖子摘要',
    content LONGTEXT NOT NULL COMMENT '帖子完整内容',
    content_type VARCHAR(20) DEFAULT 'richtext' COMMENT '内容类型：richtext, markdown, plain_text',
    
    -- 帖子分类
    post_type VARCHAR(50) DEFAULT 'travel_note' COMMENT '帖子类型：travel_note, strategy, photo_share, video_share, qa',
    category VARCHAR(50) COMMENT '帖子分类：domestic, international, city_walk, adventure',
    
    -- 媒体内容
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    images LONGTEXT COMMENT '图片集合（JSON格式）',
    videos LONGTEXT COMMENT '视频集合（JSON格式）',
    attachments LONGTEXT COMMENT '附件信息（JSON格式）',
    
    -- 目的地信息
    destination_name VARCHAR(200) COMMENT '目的地名称',
    destination_city VARCHAR(100) COMMENT '目的地城市',
    destination_province VARCHAR(100) COMMENT '目的地省份',
    destination_country VARCHAR(100) DEFAULT 'China' COMMENT '目的地国家',
    locations LONGTEXT COMMENT '具体位置信息（JSON格式）',
    
    -- 旅行信息
    travel_start_date DATE COMMENT '旅行开始日期',
    travel_end_date DATE COMMENT '旅行结束日期',
    travel_days INT COMMENT '旅行天数',
    travel_budget DECIMAL(10,2) COMMENT '旅行预算',
    actual_cost DECIMAL(10,2) COMMENT '实际花费',
    travel_season VARCHAR(50) COMMENT '旅行季节：spring, summer, autumn, winter',
    travel_style VARCHAR(100) COMMENT '旅行风格：backpack, luxury, family, couple, solo',
    companion_type VARCHAR(50) COMMENT '同行人类型',
    
    -- SEO和标签
    tags VARCHAR(500) COMMENT '标签',
    keywords VARCHAR(300) COMMENT '关键词',
    
    -- 统计信息
    view_count INT DEFAULT 0 COMMENT '浏览量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    rating DECIMAL(3,1) DEFAULT 0.0 COMMENT '评分',
    rating_count INT DEFAULT 0 COMMENT '评分人数',
    
    -- 状态管理
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态：draft, published, deleted',
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否精选',
    is_top BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    is_original BOOLEAN DEFAULT TRUE COMMENT '是否原创',
    is_public BOOLEAN DEFAULT TRUE COMMENT '是否公开',
    
    -- 审核信息
    audit_status VARCHAR(20) DEFAULT 'pending' COMMENT '审核状态：pending, approved, rejected',
    audit_time DATETIME COMMENT '审核时间',
    audit_reason LONGTEXT COMMENT '审核原因',
    auditor_id BIGINT COMMENT '审核员ID',
    
    -- 权限设置
    allow_comments BOOLEAN DEFAULT TRUE COMMENT '是否允许评论',
    allow_shares BOOLEAN DEFAULT TRUE COMMENT '是否允许分享',
    copyright_info VARCHAR(200) COMMENT '版权信息',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    published_time DATETIME COMMENT '发布时间',
    deleted_time DATETIME COMMENT '删除时间',
    
    -- 索引
    INDEX idx_status_public_published (status, is_public, published_time),
    INDEX idx_post_type_status (post_type, status),
    INDEX idx_destination_city (destination_city),
    INDEX idx_created_time (created_time),
    INDEX idx_view_count (view_count),
    INDEX idx_like_count (like_count),
    FULLTEXT INDEX idx_search (title, content, tags, keywords)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='旅游帖子主表';

-- 2. 更新用户帖子关联表结构
-- 首先备份现有数据（如果需要）
-- CREATE TABLE user_travel_post_backup AS SELECT * FROM user_travel_post;

-- 删除现有表（谨慎操作）
-- DROP TABLE IF EXISTS user_travel_post;

-- 创建新的用户帖子关联表
CREATE TABLE user_travel_post_new (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- 关联信息
    travel_post_id BIGINT NOT NULL COMMENT '关联的travel_post表ID',
    publisher_id BIGINT NOT NULL COMMENT '发布者用户ID',
    
    -- 发布者信息
    publisher_nickname VARCHAR(100) COMMENT '发布者昵称',
    publisher_avatar_url VARCHAR(500) COMMENT '发布者头像URL',
    
    -- 用户特定的状态和权限
    user_status VARCHAR(20) DEFAULT 'active' COMMENT '用户对此帖子的状态：active, hidden, deleted, published',
    is_original BOOLEAN DEFAULT TRUE COMMENT '是否原创',
    user_notes LONGTEXT COMMENT '用户对此帖子的私人备注',
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
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_user_status (user_status),
    INDEX idx_created_time (created_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户帖子关联表';

-- 3. 数据迁移脚本（如果需要从旧表迁移数据）
/*
-- 迁移现有数据的示例脚本
INSERT INTO travel_post (
    title, summary, content, content_type, post_type, category,
    cover_image, images, videos, attachments,
    destination_name, destination_city, destination_province, destination_country, locations,
    travel_start_date, travel_end_date, travel_days, travel_budget, actual_cost,
    travel_season, travel_style, companion_type, tags, keywords,
    view_count, like_count, comment_count, share_count, favorite_count,
    rating, rating_count, status, is_featured, is_top, is_original, is_public,
    audit_status, audit_time, audit_reason, auditor_id,
    allow_comments, allow_shares, copyright_info,
    created_time, updated_time, published_time, deleted_time
)
SELECT 
    title, summary, content, content_type, post_type, category,
    cover_image, images, videos, attachments,
    destination_name, destination_city, destination_province, destination_country, locations,
    travel_start_date, travel_end_date, travel_days, travel_budget, actual_cost,
    travel_season, travel_style, companion_type, tags, keywords,
    view_count, like_count, comment_count, share_count, favorite_count,
    rating, rating_count, status, is_featured, is_top, is_original, is_public,
    audit_status, audit_time, audit_reason, auditor_id,
    allow_comments, allow_shares, copyright_info,
    created_time, updated_time, published_time, deleted_time
FROM user_travel_post;

-- 然后插入关联数据
INSERT INTO user_travel_post_new (
    travel_post_id, publisher_id, publisher_nickname, publisher_avatar_url,
    user_status, is_original, created_time, updated_time, user_published_time
)
SELECT 
    tp.id, utp.publisher_id, utp.publisher_nickname, utp.publisher_avatar_url,
    CASE WHEN utp.status = 'published' THEN 'published' ELSE 'active' END,
    utp.is_original, utp.created_time, utp.updated_time, utp.published_time
FROM user_travel_post utp
JOIN travel_post tp ON tp.title = utp.title AND tp.created_time = utp.created_time;
*/

-- 4. 更新相关表的外键引用
-- 更新点赞表
ALTER TABLE user_post_like 
ADD COLUMN travel_post_id BIGINT COMMENT '关联的travel_post表ID',
ADD INDEX idx_travel_post_id (travel_post_id);

-- 更新评论表
ALTER TABLE user_post_comment 
ADD COLUMN travel_post_id BIGINT COMMENT '关联的travel_post表ID',
ADD INDEX idx_travel_post_id (travel_post_id);

-- 更新收藏表
ALTER TABLE travel_post_favorite 
MODIFY COLUMN post_id BIGINT NOT NULL COMMENT '关联的travel_post表ID';

-- 5. 创建视图以便兼容现有查询（可选）
CREATE VIEW v_user_travel_post AS
SELECT 
    tp.id,
    utp.publisher_id,
    utp.publisher_nickname,
    utp.publisher_avatar_url,
    tp.title,
    tp.summary,
    tp.content,
    tp.content_type,
    tp.post_type,
    tp.category,
    tp.cover_image,
    tp.images,
    tp.videos,
    tp.attachments,
    tp.destination_name,
    tp.destination_city,
    tp.destination_province,
    tp.destination_country,
    tp.locations,
    tp.travel_start_date,
    tp.travel_end_date,
    tp.travel_days,
    tp.travel_budget,
    tp.actual_cost,
    tp.travel_season,
    tp.travel_style,
    tp.companion_type,
    tp.tags,
    tp.keywords,
    tp.view_count,
    tp.like_count,
    tp.comment_count,
    tp.share_count,
    tp.favorite_count,
    tp.rating,
    tp.rating_count,
    tp.status,
    tp.is_featured,
    tp.is_top,
    utp.is_original,
    tp.is_public,
    tp.audit_status,
    tp.audit_time,
    tp.audit_reason,
    tp.auditor_id,
    tp.allow_comments,
    tp.allow_shares,
    tp.copyright_info,
    tp.created_time,
    tp.updated_time,
    tp.published_time,
    tp.deleted_time,
    utp.user_status,
    utp.user_notes,
    utp.user_tags,
    utp.is_pinned,
    utp.user_category,
    utp.user_published_time,
    utp.user_deleted_time
FROM travel_post tp
JOIN user_travel_post_new utp ON tp.id = utp.travel_post_id;

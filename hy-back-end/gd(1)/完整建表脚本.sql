-- ==========================================
-- 完整的帖子系统表结构脚本
-- ==========================================
-- 使用双表架构：travel_post（主表）+ user_travel_post（关联表）
-- 执行前请备份数据库！
-- ==========================================

USE gd_mcp;

-- ==========================================
-- 1. 删除旧表（如果存在）
-- ==========================================
DROP TABLE IF EXISTS user_post_comment;
DROP TABLE IF EXISTS user_post_like;
DROP TABLE IF EXISTS user_post_draft;
DROP TABLE IF EXISTS user_travel_post;
DROP TABLE IF EXISTS travel_post;

-- ==========================================
-- 2. 创建 travel_post 主表（存储帖子完整内容）
-- ==========================================
CREATE TABLE travel_post (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '帖子ID',
    
    -- 基本信息
    title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    summary LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '帖子摘要',
    content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '帖子完整内容',
    content_type VARCHAR(20) DEFAULT 'richtext' COMMENT '内容类型：richtext/markdown/plain',
    
    -- 分类信息
    post_type VARCHAR(50) DEFAULT 'travel_note' COMMENT '帖子类型：travel_note/guide/experience',
    category VARCHAR(50) COMMENT '帖子分类：domestic/international/city/nature等',
    
    -- 媒体资源
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    images LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图片集合（JSON格式）',
    videos LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '视频集合（JSON格式）',
    attachments LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '附件信息（JSON格式）',
    
    -- 目的地信息
    destination_name VARCHAR(200) COMMENT '目的地名称',
    destination_city VARCHAR(100) COMMENT '目的地城市',
    destination_province VARCHAR(100) COMMENT '目的地省份',
    destination_country VARCHAR(100) DEFAULT 'China' COMMENT '目的地国家',
    locations LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '具体位置信息（JSON格式）',
    
    -- 旅行信息
    travel_start_date DATE COMMENT '旅行开始日期',
    travel_end_date DATE COMMENT '旅行结束日期',
    travel_days INT DEFAULT 0 COMMENT '旅行天数',
    travel_budget DECIMAL(10,2) DEFAULT 0.00 COMMENT '旅行预算',
    actual_cost DECIMAL(10,2) DEFAULT 0.00 COMMENT '实际花费',
    travel_season VARCHAR(50) COMMENT '旅行季节：spring/summer/autumn/winter',
    travel_style VARCHAR(50) COMMENT '旅行方式：solo/couple/family/friends/group',
    companion_type VARCHAR(50) COMMENT '同行人类型',
    
    -- 标签和关键词
    tags VARCHAR(500) COMMENT '标签（逗号分隔）',
    keywords VARCHAR(500) COMMENT '关键词（逗号分隔）',
    
    -- 统计信息
    rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分（0-5）',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    view_count INT DEFAULT 0 COMMENT '浏览量',
    rating_count INT DEFAULT 0 COMMENT '评分人数',
    
    -- 发布者信息
    publisher_id BIGINT NOT NULL COMMENT '发布者用户ID',
    is_original BOOLEAN DEFAULT TRUE COMMENT '是否原创',
    
    -- 状态信息
    status VARCHAR(20) DEFAULT 'draft' COMMENT '帖子状态：draft/published/deleted',
    audit_status VARCHAR(20) DEFAULT 'pending' COMMENT '审核状态：pending/approved/rejected',
    audit_reason VARCHAR(500) COMMENT '审核原因',
    audit_time DATETIME COMMENT '审核时间',
    
    -- 推荐和置顶
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否精选',
    is_top BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    published_time DATETIME COMMENT '发布时间',
    deleted_time DATETIME COMMENT '删除时间',
    
    -- 索引
    INDEX idx_publisher (publisher_id),
    INDEX idx_status (status),
    INDEX idx_post_type (post_type),
    INDEX idx_destination_city (destination_city),
    INDEX idx_published_time (published_time),
    INDEX idx_audit_status (audit_status),
    FULLTEXT INDEX idx_fulltext_search (title, content, summary, tags, keywords)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='旅游帖子主表';

-- ==========================================
-- 3. 创建 user_travel_post 关联表（存储用户与帖子的关联关系）
-- ==========================================
CREATE TABLE user_travel_post (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    
    -- 关联信息
    travel_post_id BIGINT NOT NULL COMMENT '关联的travel_post表ID',
    publisher_id BIGINT NOT NULL COMMENT '发布者用户ID',
    
    -- 发布者信息（冗余存储，提高查询性能）
    publisher_nickname VARCHAR(100) COMMENT '发布者昵称',
    publisher_avatar_url VARCHAR(500) COMMENT '发布者头像URL',
    
    -- 用户特定的状态和权限
    user_status VARCHAR(20) DEFAULT 'active' COMMENT '用户对此帖子的状态：active/hidden/deleted/draft/published',
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

-- ==========================================
-- 4. 创建 user_post_draft 草稿表
-- ==========================================
CREATE TABLE user_post_draft (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '草稿ID',
    
    -- 发布者信息
    publisher_id BIGINT NOT NULL COMMENT '发布者用户ID',
    
    -- 草稿内容
    draft_title VARCHAR(200) COMMENT '草稿标题',
    draft_content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '草稿内容',
    draft_data LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '完整草稿数据（JSON格式）',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    auto_save_time DATETIME COMMENT '自动保存时间',
    
    -- 外键约束
    FOREIGN KEY (publisher_id) REFERENCES user_info(UserID) ON DELETE CASCADE,
    
    -- 索引
    INDEX idx_publisher (publisher_id),
    INDEX idx_updated_time (updated_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户帖子草稿表';

-- ==========================================
-- 5. 创建 user_post_like 点赞表
-- ==========================================
CREATE TABLE user_post_like (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
    
    -- 关联信息
    post_id BIGINT NOT NULL COMMENT '帖子ID（关联travel_post表）',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    
    -- 点赞信息
    like_type VARCHAR(20) DEFAULT 'like' COMMENT '点赞类型：like/love/wow等',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    
    -- 外键约束
    FOREIGN KEY (post_id) REFERENCES travel_post(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_info(UserID) ON DELETE CASCADE,
    
    -- 索引
    UNIQUE INDEX idx_post_user (post_id, user_id),
    INDEX idx_user (user_id),
    INDEX idx_created_time (created_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子点赞表';

-- ==========================================
-- 6. 创建 user_post_comment 评论表
-- ==========================================
CREATE TABLE user_post_comment (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
    
    -- 关联信息
    post_id BIGINT NOT NULL COMMENT '帖子ID（关联travel_post表）',
    user_id BIGINT NOT NULL COMMENT '评论用户ID',
    parent_comment_id BIGINT COMMENT '父评论ID（用于回复）',
    
    -- 评论内容
    comment_content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
    comment_images LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '评论图片（JSON格式）',
    
    -- 评论信息
    is_author_reply BOOLEAN DEFAULT FALSE COMMENT '是否为作者回复',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    reply_count INT DEFAULT 0 COMMENT '回复数',
    
    -- 状态信息
    status VARCHAR(20) DEFAULT 'normal' COMMENT '评论状态：normal/hidden/deleted',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_time DATETIME COMMENT '删除时间',
    
    -- 外键约束
    FOREIGN KEY (post_id) REFERENCES travel_post(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_info(UserID) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES user_post_comment(id) ON DELETE CASCADE,
    
    -- 索引
    INDEX idx_post (post_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_comment_id),
    INDEX idx_created_time (created_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子评论表';

-- ==========================================
-- 验证表创建
-- ==========================================
SHOW TABLES LIKE '%post%';

-- 查看travel_post表结构
DESCRIBE travel_post;

-- 查看user_travel_post表结构
DESCRIBE user_travel_post;

-- 查看user_post_draft表结构
DESCRIBE user_post_draft;

-- 查看user_post_like表结构
DESCRIBE user_post_like;

-- 查看user_post_comment表结构
DESCRIBE user_post_comment;

SELECT '✅ 所有帖子相关表创建完成！' AS status;


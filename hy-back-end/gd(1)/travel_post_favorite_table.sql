-- ==========================================
-- 帖子收藏表结构
-- ==========================================

USE gd_mcp;

-- 创建帖子收藏表
CREATE TABLE IF NOT EXISTS travel_post_favorite (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏ID',
    
    -- 关联信息
    user_id BIGINT NOT NULL COMMENT '用户ID',
    post_id BIGINT NOT NULL COMMENT '帖子ID',
    publisher_id BIGINT NOT NULL COMMENT '帖子发布者ID',
    
    -- 帖子基本信息（冗余存储，提高查询性能）
    post_title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    post_type VARCHAR(50) COMMENT '帖子类型',
    cover_image VARCHAR(500) COMMENT '封面图片',
    
    -- 目的地信息
    destination_name VARCHAR(200) COMMENT '目的地名称',
    destination_city VARCHAR(100) COMMENT '目的地城市',
    destination_province VARCHAR(100) COMMENT '目的地省份',
    destination_country VARCHAR(100) DEFAULT 'China' COMMENT '目的地国家',
    
    -- 旅行信息
    travel_days INT COMMENT '旅行天数',
    travel_budget DOUBLE COMMENT '旅行预算',
    travel_season VARCHAR(50) COMMENT '旅行季节',
    travel_style VARCHAR(100) COMMENT '旅行方式',
    
    -- 收藏时间
    favorite_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    
    -- 用户自定义信息
    favorite_category VARCHAR(50) DEFAULT 'general' COMMENT '收藏分类：general/strategy/food/accommodation',
    favorite_tags VARCHAR(500) COMMENT '用户自定义标签',
    user_notes LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '用户备注',
    priority_level INT DEFAULT 3 COMMENT '优先级：1-高，2-中，3-低',
    
    -- 阅读状态
    read_status VARCHAR(20) DEFAULT 'unread' COMMENT '阅读状态：unread/reading/read',
    
    -- 归档和提醒
    is_archived BOOLEAN DEFAULT FALSE COMMENT '是否已归档',
    reminder_enabled BOOLEAN DEFAULT FALSE COMMENT '是否启用提醒',
    reminder_date DATETIME COMMENT '提醒日期',
    reminder_message VARCHAR(200) COMMENT '提醒消息',
    
    -- 分享信息
    is_shared BOOLEAN DEFAULT FALSE COMMENT '是否已分享',
    share_count INT DEFAULT 0 COMMENT '分享次数',
    
    -- 状态信息
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active/inactive',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否已删除',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_time DATETIME COMMENT '删除时间',
    
    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES user_info(UserID) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES travel_post(id) ON DELETE CASCADE,
    
    -- 索引
    UNIQUE INDEX idx_user_post (user_id, post_id),
    INDEX idx_user_status (user_id, status, is_deleted),
    INDEX idx_favorite_time (favorite_time),
    INDEX idx_post_type (post_type),
    INDEX idx_destination_city (destination_city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子收藏表';

-- 查看表结构
DESCRIBE travel_post_favorite;

SELECT '✅ 帖子收藏表创建完成！' AS status;


-- 创建travel_post表的SQL脚本
-- 基于用户提供的表结构

CREATE TABLE IF NOT EXISTS travel_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '帖子ID',
    publisher_id BIGINT NOT NULL COMMENT '发布者用户ID',
    
    -- 帖子基本信息
    title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    summary TEXT COMMENT '帖子摘要/简介',
    content LONGTEXT NOT NULL COMMENT '帖子完整内容（富文本/Markdown）',
    content_type VARCHAR(20) DEFAULT 'richtext' COMMENT '内容类型：richtext(富文本)、markdown、plain_text',
    
    -- 帖子分类
    post_type VARCHAR(50) DEFAULT 'travel_note' COMMENT '帖子类型：travel_note(游记)、strategy(攻略)、photo_share(照片分享)、video_share(视频分享)、qa(问答)',
    category VARCHAR(50) COMMENT '帖子分类：domestic(国内)、international(国际)、city_walk(城市漫步)、adventure(探险)等',
    
    -- 媒体资源
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    images JSON COMMENT '图片集合（JSON数组）',
    videos JSON COMMENT '视频集合（JSON数组）',
    attachments JSON COMMENT '附件信息（PDF、文档等）',
    
    -- 地理位置信息
    destination_name VARCHAR(200) COMMENT '目的地名称',
    destination_city VARCHAR(100) COMMENT '目的地城市',
    destination_province VARCHAR(100) COMMENT '目的地省份',
    destination_country VARCHAR(100) DEFAULT 'China' COMMENT '目的地国家',
    locations JSON COMMENT '具体位置信息（景点坐标等）',
    
    -- 旅行信息
    travel_start_date DATE COMMENT '旅行开始日期',
    travel_end_date DATE COMMENT '旅行结束日期',
    travel_days INT COMMENT '旅行天数',
    travel_budget DECIMAL(10,2) COMMENT '旅行预算',
    actual_cost DECIMAL(10,2) COMMENT '实际花费',
    travel_season VARCHAR(50) COMMENT '旅行季节：spring(春季)、summer(夏季)、autumn(秋季)、winter(冬季)',
    travel_style VARCHAR(100) COMMENT '旅行风格：backpack(背包客)、luxury(豪华游)、family(家庭游)、couple(情侣游)、solo(独自旅行)',
    companion_type VARCHAR(50) COMMENT '同行人类型：solo(独自)、couple(情侣)、family(家庭)、friends(朋友)、group(团队)',
    
    -- 标签和关键词
    tags VARCHAR(500) COMMENT '标签（用逗号分隔）',
    keywords VARCHAR(300) COMMENT '关键词（用于搜索）',
    
    -- 统计数据
    view_count INT DEFAULT 0 COMMENT '浏览量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    rating DECIMAL(3,1) DEFAULT 0.0 COMMENT '评分（1.0-5.0）',
    rating_count INT DEFAULT 0 COMMENT '评分人数',
    
    -- 帖子状态
    status VARCHAR(20) DEFAULT 'published' COMMENT '帖子状态：draft(草稿)、published(已发布)、hidden(隐藏)、deleted(已删除)',
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否精选',
    is_top BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    is_original BOOLEAN DEFAULT TRUE COMMENT '是否原创',
    
    -- 审核相关
    audit_status VARCHAR(20) DEFAULT 'pending' COMMENT '审核状态：pending(待审核)、approved(已通过)、rejected(已拒绝)',
    audit_time DATETIME COMMENT '审核时间',
    audit_reason TEXT COMMENT '审核意见',
    
    -- 时间戳
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    published_time DATETIME COMMENT '发布时间',
    deleted_time DATETIME COMMENT '删除时间',
    
    -- 索引
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_status (status),
    INDEX idx_post_type (post_type),
    INDEX idx_destination_city (destination_city),
    INDEX idx_created_time (created_time),
    INDEX idx_published_time (published_time)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='旅游帖子主表';

-- 显示创建结果
SELECT 'travel_post表创建完成' as message;

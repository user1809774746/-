/*
 旅游帖子表 - 增强多媒体支持版本
 创建日期: 2025-11-18
 功能说明: 支持图片、音频、视频等多种媒体格式上传
 增强功能:
   1. 新增音频支持 (audios字段)
   2. 增强媒体文件管理 (media_files表)
   3. 支持多种文件格式
   4. 媒体文件元数据管理
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for travel_post (增强版)
-- ----------------------------
DROP TABLE IF EXISTS `travel_post`;
CREATE TABLE `travel_post`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '帖子标题',
  `summary` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '帖子摘要',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '帖子完整内容',
  `content_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'richtext' COMMENT '内容类型：richtext/markdown/plain',
  `post_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'travel_note' COMMENT '帖子类型：travel_note/guide/experience',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '帖子分类：domestic/international/city/nature等',
  `cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '封面图片URL',
  
  -- 多媒体文件字段 (JSON格式存储)
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '图片集合（JSON格式）',
  `videos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '视频集合（JSON格式）',
  `audios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '音频集合（JSON格式）',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '其他附件信息（JSON格式）',
  
  -- 媒体统计信息
  `media_count` int NULL DEFAULT 0 COMMENT '媒体文件总数',
  `image_count` int NULL DEFAULT 0 COMMENT '图片数量',
  `video_count` int NULL DEFAULT 0 COMMENT '视频数量',
  `audio_count` int NULL DEFAULT 0 COMMENT '音频数量',
  `total_media_size` bigint NULL DEFAULT 0 COMMENT '媒体文件总大小（字节）',
  
  -- 目的地信息
  `destination_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地名称',
  `destination_city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地城市',
  `destination_province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地省份',
  `destination_country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'China' COMMENT '目的地国家',
  `locations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '具体位置信息（JSON格式）',
  
  -- 旅行信息
  `travel_start_date` date NULL DEFAULT NULL COMMENT '旅行开始日期',
  `travel_end_date` date NULL DEFAULT NULL COMMENT '旅行结束日期',
  `travel_days` int NULL DEFAULT 0 COMMENT '旅行天数',
  `travel_budget` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '旅行预算',
  `actual_cost` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '实际花费',
  `travel_season` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '旅行季节：spring/summer/autumn/winter',
  `travel_style` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '旅行方式：solo/couple/family/friends/group',
  `companion_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '同行人类型',
  
  -- 标签和关键词
  `tags` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '标签（逗号分隔）',
  `keywords` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关键词（逗号分隔）',
  
  -- 统计信息
  `rating` decimal(3, 2) NULL DEFAULT 0.00 COMMENT '评分（0-5）',
  `like_count` int NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` int NULL DEFAULT 0 COMMENT '评论数',
  `favorite_count` int NULL DEFAULT 0 COMMENT '收藏数',
  `share_count` int NULL DEFAULT 0 COMMENT '分享数',
  `view_count` int NULL DEFAULT 0 COMMENT '浏览量',
  `rating_count` int NULL DEFAULT 0 COMMENT '评分人数',
  
  -- 发布信息
  `publisher_id` bigint NOT NULL COMMENT '发布者用户ID',
  `is_original` tinyint(1) NULL DEFAULT 1 COMMENT '是否原创',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'draft' COMMENT '帖子状态：draft/published/deleted',
  `audit_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '审核状态：pending/approved/rejected',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '审核原因',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `is_featured` tinyint(1) NULL DEFAULT 0 COMMENT '是否精选',
  `is_top` tinyint(1) NULL DEFAULT 0 COMMENT '是否置顶',
  
  -- 时间信息
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `published_time` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `deleted_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_publisher`(`publisher_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_post_type`(`post_type` ASC) USING BTREE,
  INDEX `idx_destination_city`(`destination_city` ASC) USING BTREE,
  INDEX `idx_published_time`(`published_time` ASC) USING BTREE,
  INDEX `idx_audit_status`(`audit_status` ASC) USING BTREE,
  INDEX `idx_media_count`(`media_count` ASC) USING BTREE,
  FULLTEXT INDEX `idx_fulltext_search`(`title`, `content`, `summary`, `tags`, `keywords`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '旅游帖子主表（增强多媒体支持）' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- 新增媒体文件详细信息表
-- ----------------------------
DROP TABLE IF EXISTS `travel_post_media`;
CREATE TABLE `travel_post_media` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '媒体文件ID',
  `post_id` bigint NOT NULL COMMENT '关联的帖子ID',
  `media_type` enum('image', 'video', 'audio', 'document', 'other') NOT NULL COMMENT '媒体类型',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件名',
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '原始文件名',
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件URL',
  `thumbnail_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '缩略图URL',
  `file_size` bigint NULL DEFAULT 0 COMMENT '文件大小（字节）',
  `file_format` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '文件格式（jpg/mp4/mp3等）',
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'MIME类型',
  `width` int NULL DEFAULT 0 COMMENT '宽度（图片/视频）',
  `height` int NULL DEFAULT 0 COMMENT '高度（图片/视频）',
  `duration` int NULL DEFAULT 0 COMMENT '时长（视频/音频，秒）',
  `quality` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '质量：low/medium/high/ultra',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '媒体描述',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `upload_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_post_id`(`post_id` ASC) USING BTREE,
  INDEX `idx_media_type`(`media_type` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  
  CONSTRAINT `fk_media_post` FOREIGN KEY (`post_id`) 
    REFERENCES `travel_post` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '旅游帖子媒体文件表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- 触发器：自动更新媒体统计信息
-- ----------------------------
DELIMITER //
CREATE TRIGGER `tr_update_media_stats_on_insert` 
AFTER INSERT ON `travel_post_media`
FOR EACH ROW
BEGIN
    UPDATE `travel_post` SET 
        `media_count` = (SELECT COUNT(*) FROM `travel_post_media` WHERE `post_id` = NEW.`post_id`),
        `image_count` = (SELECT COUNT(*) FROM `travel_post_media` WHERE `post_id` = NEW.`post_id` AND `media_type` = 'image'),
        `video_count` = (SELECT COUNT(*) FROM `travel_post_media` WHERE `post_id` = NEW.`post_id` AND `media_type` = 'video'),
        `audio_count` = (SELECT COUNT(*) FROM `travel_post_media` WHERE `post_id` = NEW.`post_id` AND `media_type` = 'audio'),
        `total_media_size` = (SELECT COALESCE(SUM(`file_size`), 0) FROM `travel_post_media` WHERE `post_id` = NEW.`post_id`)
    WHERE `id` = NEW.`post_id`;
END//

CREATE TRIGGER `tr_update_media_stats_on_delete` 
AFTER DELETE ON `travel_post_media`
FOR EACH ROW
BEGIN
    UPDATE `travel_post` SET 
        `media_count` = (SELECT COUNT(*) FROM `travel_post_media` WHERE `post_id` = OLD.`post_id`),
        `image_count` = (SELECT COUNT(*) FROM `travel_post_media` WHERE `post_id` = OLD.`post_id` AND `media_type` = 'image'),
        `video_count` = (SELECT COUNT(*) FROM `travel_post_media` WHERE `post_id` = OLD.`post_id` AND `media_type` = 'video'),
        `audio_count` = (SELECT COUNT(*) FROM `travel_post_media` WHERE `post_id` = OLD.`post_id` AND `media_type` = 'audio'),
        `total_media_size` = (SELECT COALESCE(SUM(`file_size`), 0) FROM `travel_post_media` WHERE `post_id` = OLD.`post_id`)
    WHERE `id` = OLD.`post_id`;
END//
DELIMITER ;

-- ----------------------------
-- 保留原有触发器
-- ----------------------------
DROP TRIGGER IF EXISTS `trg_update_user_center_on_post_insert`;
DELIMITER //
CREATE TRIGGER `trg_update_user_center_on_post_insert` AFTER INSERT ON `travel_post` FOR EACH ROW 
BEGIN
  CALL `update_user_center_statistics`(NEW.`publisher_id`);
END//
DELIMITER ;

DROP TRIGGER IF EXISTS `trg_update_user_center_on_post_update`;
DELIMITER //
CREATE TRIGGER `trg_update_user_center_on_post_update` AFTER UPDATE ON `travel_post` FOR EACH ROW 
BEGIN
  IF OLD.`publisher_id` != NEW.`publisher_id` OR 
     OLD.`status` != NEW.`status` OR 
     OLD.`like_count` != NEW.`like_count` OR 
     OLD.`comment_count` != NEW.`comment_count` OR 
     OLD.`view_count` != NEW.`view_count` THEN
    CALL `update_user_center_statistics`(NEW.`publisher_id`);
    IF OLD.`publisher_id` != NEW.`publisher_id` THEN
      CALL `update_user_center_statistics`(OLD.`publisher_id`);
    END IF;
  END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS `trg_update_user_center_on_post_delete`;
DELIMITER //
CREATE TRIGGER `trg_update_user_center_on_post_delete` AFTER DELETE ON `travel_post` FOR EACH ROW 
BEGIN
  CALL `update_user_center_statistics`(OLD.`publisher_id`);
END//
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 常用查询示例
-- =====================================================

-- 示例1: 查询帖子及其所有媒体文件
/*
SELECT 
    tp.*,
    tpm.media_type,
    tpm.file_url,
    tpm.thumbnail_url,
    tpm.file_size,
    tpm.duration,
    tpm.description
FROM travel_post tp
LEFT JOIN travel_post_media tpm ON tp.id = tpm.post_id
WHERE tp.id = ?
ORDER BY tpm.sort_order ASC;
*/

-- 示例2: 插入帖子和媒体文件（事务）
/*
BEGIN;

-- 插入帖子
INSERT INTO travel_post (title, content, publisher_id, status) 
VALUES ('我的旅行日记', '这是一次美妙的旅行...', 1, 'published');

SET @post_id = LAST_INSERT_ID();

-- 插入媒体文件
INSERT INTO travel_post_media (post_id, media_type, file_name, file_url, file_size, sort_order)
VALUES 
    (@post_id, 'image', 'photo1.jpg', '/uploads/images/photo1.jpg', 1024000, 1),
    (@post_id, 'video', 'video1.mp4', '/uploads/videos/video1.mp4', 10240000, 2),
    (@post_id, 'audio', 'audio1.mp3', '/uploads/audios/audio1.mp3', 5120000, 3);

COMMIT;
*/

-- 示例3: 查询包含特定媒体类型的帖子
/*
SELECT DISTINCT tp.*
FROM travel_post tp
JOIN travel_post_media tpm ON tp.id = tpm.post_id
WHERE tpm.media_type = 'audio'  -- 查询包含音频的帖子
  AND tp.status = 'published'
ORDER BY tp.published_time DESC;
*/

-- 示例4: 统计用户的媒体使用情况
/*
SELECT 
    tp.publisher_id,
    COUNT(DISTINCT tp.id) as post_count,
    SUM(tp.media_count) as total_media_files,
    SUM(tp.image_count) as total_images,
    SUM(tp.video_count) as total_videos,
    SUM(tp.audio_count) as total_audios,
    SUM(tp.total_media_size) as total_size_bytes
FROM travel_post tp
WHERE tp.publisher_id = ?
  AND tp.status = 'published'
GROUP BY tp.publisher_id;
*/

-- =====================================================
-- 支持的媒体格式说明
-- =====================================================
/*
图片格式: jpg, jpeg, png, gif, webp, bmp, svg
视频格式: mp4, avi, mov, wmv, flv, webm, mkv
音频格式: mp3, wav, aac, ogg, flac, m4a, wma
文档格式: pdf, doc, docx, txt, rtf
其他格式: zip, rar, 7z

建议的文件大小限制:
- 图片: 最大 10MB
- 音频: 最大 50MB
- 视频: 最大 500MB
- 文档: 最大 20MB
*/

/*
 活动管理系统数据库设计
 创建日期: 2025-11-18
 功能说明: 完整的生产级活动管理系统
 包含表:
   1. activities - 活动主表
   2. activity_participants - 活动参与者表
   3. activity_media - 活动媒体文件表
   4. activity_comments - 活动评论表
   5. activity_tags - 活动标签表
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 表结构: activities (活动主表)
-- =====================================================
DROP TABLE IF EXISTS `activities`;
CREATE TABLE `activities` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '活动ID',
  `title` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '活动标题',
  `subtitle` VARCHAR(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '活动副标题',
  `description` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '活动详细描述',
  `summary` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '活动摘要',
  
  -- 活动分类
  `category` ENUM('travel', 'outdoor', 'cultural', 'sports', 'social', 'educational', 'entertainment', 'business') 
    DEFAULT 'travel' COMMENT '活动类别',
  `type` ENUM('free', 'paid', 'membership', 'invitation') 
    DEFAULT 'free' COMMENT '活动类型',
  `level` ENUM('beginner', 'intermediate', 'advanced', 'expert') 
    DEFAULT 'beginner' COMMENT '难度等级',
  
  -- 活动时间
  `start_time` DATETIME NOT NULL COMMENT '活动开始时间',
  `end_time` DATETIME NOT NULL COMMENT '活动结束时间',
  `registration_start` DATETIME NULL COMMENT '报名开始时间',
  `registration_end` DATETIME NULL COMMENT '报名结束时间',
  `duration_hours` DECIMAL(5,2) NULL DEFAULT 0 COMMENT '活动时长(小时)',
  
  -- 地点信息
  `location_name` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '地点名称',
  `address` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '详细地址',
  `city` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '城市',
  `province` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '省份',
  `country` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'China' COMMENT '国家',
  `latitude` DECIMAL(10, 8) NULL COMMENT '纬度',
  `longitude` DECIMAL(11, 8) NULL COMMENT '经度',
  
  -- 参与者限制
  `max_participants` INT NULL DEFAULT 0 COMMENT '最大参与人数(0为不限制)',
  `min_participants` INT NULL DEFAULT 1 COMMENT '最小参与人数',
  `current_participants` INT NULL DEFAULT 0 COMMENT '当前参与人数',
  `age_min` INT NULL DEFAULT 0 COMMENT '最小年龄限制',
  `age_max` INT NULL DEFAULT 100 COMMENT '最大年龄限制',
  
  -- 费用信息
  `price` DECIMAL(10, 2) NULL DEFAULT 0.00 COMMENT '活动价格',
  `original_price` DECIMAL(10, 2) NULL DEFAULT 0.00 COMMENT '原价',
  `currency` VARCHAR(10) DEFAULT 'CNY' COMMENT '货币单位',
  `payment_required` TINYINT(1) DEFAULT 0 COMMENT '是否需要付费',
  `refund_policy` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '退款政策',
  
  -- 媒体文件
  `cover_image` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '封面图片',
  `images` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '图片集合(JSON)',
  `videos` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '视频集合(JSON)',
  
  -- 组织者信息
  `organizer_id` BIGINT NOT NULL COMMENT '组织者用户ID',
  `organizer_name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '组织者名称',
  `contact_phone` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '联系电话',
  `contact_email` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '联系邮箱',
  `contact_wechat` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '微信号',
  
  -- 活动状态
  `status` ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled', 'postponed') 
    DEFAULT 'draft' COMMENT '活动状态',
  `audit_status` ENUM('pending', 'approved', 'rejected') 
    DEFAULT 'pending' COMMENT '审核状态',
  `audit_reason` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '审核原因',
  `audit_time` DATETIME NULL COMMENT '审核时间',
  
  -- 活动设置
  `is_public` TINYINT(1) DEFAULT 1 COMMENT '是否公开',
  `auto_approve` TINYINT(1) DEFAULT 1 COMMENT '是否自动通过报名',
  `allow_waitlist` TINYINT(1) DEFAULT 1 COMMENT '是否允许候补',
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT '是否精选',
  `is_hot` TINYINT(1) DEFAULT 0 COMMENT '是否热门',
  `is_recommended` TINYINT(1) DEFAULT 0 COMMENT '是否推荐',
  
  -- 统计信息
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  `share_count` INT DEFAULT 0 COMMENT '分享数',
  `comment_count` INT DEFAULT 0 COMMENT '评论数',
  `rating` DECIMAL(3, 2) DEFAULT 0.00 COMMENT '评分(0-5)',
  `rating_count` INT DEFAULT 0 COMMENT '评分人数',
  
  -- 扩展字段
  `tags` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标签(逗号分隔)',
  `requirements` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '参与要求',
  `equipment` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '装备要求',
  `notes` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '注意事项',
  `custom_fields` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '自定义字段(JSON)',
  
  -- 时间戳
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `published_time` DATETIME NULL COMMENT '发布时间',
  `deleted_time` DATETIME NULL COMMENT '删除时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_organizer`(`organizer_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE,
  INDEX `idx_start_time`(`start_time`) USING BTREE,
  INDEX `idx_city`(`city`) USING BTREE,
  INDEX `idx_published_time`(`published_time`) USING BTREE,
  INDEX `idx_location`(`latitude`, `longitude`) USING BTREE,
  FULLTEXT INDEX `idx_search`(`title`, `description`, `tags`)
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动主表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 表结构: activity_participants (活动参与者表)
-- =====================================================
DROP TABLE IF EXISTS `activity_participants`;
CREATE TABLE `activity_participants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `activity_id` BIGINT NOT NULL COMMENT '活动ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `status` ENUM('pending', 'approved', 'rejected', 'cancelled', 'attended', 'absent') 
    DEFAULT 'pending' COMMENT '参与状态',
  `registration_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `approval_time` DATETIME NULL COMMENT '审核时间',
  `payment_status` ENUM('unpaid', 'paid', 'refunded', 'partial_refund') 
    DEFAULT 'unpaid' COMMENT '付款状态',
  `payment_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '支付金额',
  `payment_time` DATETIME NULL COMMENT '支付时间',
  `notes` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '备注',
  `emergency_contact` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '紧急联系人',
  `emergency_phone` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '紧急联系电话',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_activity_user` (`activity_id`, `user_id`) USING BTREE,
  INDEX `idx_user_id` (`user_id`) USING BTREE,
  INDEX `idx_status` (`status`) USING BTREE,
  INDEX `idx_registration_time` (`registration_time`) USING BTREE,
  
  CONSTRAINT `fk_participants_activity` FOREIGN KEY (`activity_id`) 
    REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_participants_user` FOREIGN KEY (`user_id`) 
    REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动参与者表' ROW_FORMAT=DYNAMIC;

-- =====================================================
-- 触发器: 自动更新参与人数
-- =====================================================
DELIMITER //
CREATE TRIGGER `tr_update_participant_count_insert` 
AFTER INSERT ON `activity_participants`
FOR EACH ROW
BEGIN
    UPDATE `activities` SET 
        `current_participants` = (
            SELECT COUNT(*) FROM `activity_participants` 
            WHERE `activity_id` = NEW.`activity_id` AND `status` IN ('approved', 'attended')
        )
    WHERE `id` = NEW.`activity_id`;
END//

CREATE TRIGGER `tr_update_participant_count_update` 
AFTER UPDATE ON `activity_participants`
FOR EACH ROW
BEGIN
    UPDATE `activities` SET 
        `current_participants` = (
            SELECT COUNT(*) FROM `activity_participants` 
            WHERE `activity_id` = NEW.`activity_id` AND `status` IN ('approved', 'attended')
        )
    WHERE `id` = NEW.`activity_id`;
END//

CREATE TRIGGER `tr_update_participant_count_delete` 
AFTER DELETE ON `activity_participants`
FOR EACH ROW
BEGIN
    UPDATE `activities` SET 
        `current_participants` = (
            SELECT COUNT(*) FROM `activity_participants` 
            WHERE `activity_id` = OLD.`activity_id` AND `status` IN ('approved', 'attended')
        )
    WHERE `id` = OLD.`activity_id`;
END//
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 常用查询示例
-- =====================================================

-- 示例1: 查询即将开始的活动
/*
SELECT * FROM activities 
WHERE status = 'published' 
  AND start_time > NOW() 
  AND start_time <= DATE_ADD(NOW(), INTERVAL 7 DAY)
ORDER BY start_time ASC;
*/

-- 示例2: 用户报名活动
/*
INSERT INTO activity_participants (activity_id, user_id, status)
VALUES (?, ?, 'pending')
ON DUPLICATE KEY UPDATE 
    status = 'pending',
    registration_time = NOW();
*/

-- 示例3: 查询用户参与的活动
/*
SELECT a.*, ap.status as participation_status, ap.registration_time
FROM activities a
JOIN activity_participants ap ON a.id = ap.activity_id
WHERE ap.user_id = ?
ORDER BY ap.registration_time DESC;
*/

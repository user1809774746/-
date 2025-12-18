/*
 Navicat Premium Data Transfer

 Source Server         : 159
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : gd_mcp

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 18/11/2025 10:19:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for travel_post
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
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '图片集合（JSON格式）',
  `videos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '视频集合（JSON格式）',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '附件信息（JSON格式）',
  `destination_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地名称',
  `destination_city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地城市',
  `destination_province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地省份',
  `destination_country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'China' COMMENT '目的地国家',
  `locations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '具体位置信息（JSON格式）',
  `travel_start_date` date NULL DEFAULT NULL COMMENT '旅行开始日期',
  `travel_end_date` date NULL DEFAULT NULL COMMENT '旅行结束日期',
  `travel_days` int NULL DEFAULT 0 COMMENT '旅行天数',
  `travel_budget` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '旅行预算',
  `actual_cost` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '实际花费',
  `travel_season` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '旅行季节：spring/summer/autumn/winter',
  `travel_style` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '旅行方式：solo/couple/family/friends/group',
  `companion_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '同行人类型',
  `tags` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '标签（逗号分隔）',
  `keywords` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关键词（逗号分隔）',
  `rating` decimal(3, 2) NULL DEFAULT 0.00 COMMENT '评分（0-5）',
  `like_count` int NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` int NULL DEFAULT 0 COMMENT '评论数',
  `favorite_count` int NULL DEFAULT 0 COMMENT '收藏数',
  `share_count` int NULL DEFAULT 0 COMMENT '分享数',
  `view_count` int NULL DEFAULT 0 COMMENT '浏览量',
  `rating_count` int NULL DEFAULT 0 COMMENT '评分人数',
  `publisher_id` bigint NOT NULL COMMENT '发布者用户ID',
  `is_original` tinyint(1) NULL DEFAULT 1 COMMENT '是否原创',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'draft' COMMENT '帖子状态：draft/published/deleted',
  `audit_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '审核状态：pending/approved/rejected',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '审核原因',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `is_featured` tinyint(1) NULL DEFAULT 0 COMMENT '是否精选',
  `is_top` tinyint(1) NULL DEFAULT 0 COMMENT '是否置顶',
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
  FULLTEXT INDEX `idx_fulltext_search`(`title`, `content`, `summary`, `tags`, `keywords`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '旅游帖子主表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of travel_post
-- ----------------------------
INSERT INTO `travel_post` VALUES (1, '65345', '', '345345', 'richtext', 'travel_note', 'domestic', '', NULL, NULL, NULL, '', '', '', 'China', NULL, NULL, NULL, NULL, NULL, NULL, 'spring', 'solo', NULL, '', '', 0.00, 1, 0, 0, 0, 9, 0, 1, 1, 'published', 'pending', NULL, NULL, 0, 0, '2025-10-29 07:59:52', '2025-11-17 09:01:05', '2025-10-29 08:10:26', NULL);
INSERT INTO `travel_post` VALUES (2, '65345', '', '345345', 'richtext', 'travel_note', 'domestic', '', NULL, NULL, NULL, '', '', '', 'China', NULL, NULL, NULL, NULL, NULL, NULL, 'spring', 'solo', NULL, '', '', 0.00, 1, 4, 2, 0, 76, 0, 1, 1, 'published', 'approved', '审核通过', '2025-10-31 03:41:28', 0, 0, '2025-10-29 08:21:06', '2025-11-18 00:50:36', '2025-10-29 08:21:06', NULL);

-- ----------------------------
-- Triggers structure for table travel_post
-- ----------------------------
DROP TRIGGER IF EXISTS `trg_update_user_center_on_post_insert`;
delimiter ;;
CREATE TRIGGER `trg_update_user_center_on_post_insert` AFTER INSERT ON `travel_post` FOR EACH ROW BEGIN
  CALL `update_user_center_statistics`(NEW.`publisher_id`);
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table travel_post
-- ----------------------------
DROP TRIGGER IF EXISTS `trg_update_user_center_on_post_update`;
delimiter ;;
CREATE TRIGGER `trg_update_user_center_on_post_update` AFTER UPDATE ON `travel_post` FOR EACH ROW BEGIN
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
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table travel_post
-- ----------------------------
DROP TRIGGER IF EXISTS `trg_update_user_center_on_post_delete`;
delimiter ;;
CREATE TRIGGER `trg_update_user_center_on_post_delete` AFTER DELETE ON `travel_post` FOR EACH ROW BEGIN
  CALL `update_user_center_statistics`(OLD.`publisher_id`);
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;

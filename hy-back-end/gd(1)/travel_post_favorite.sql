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

 Date: 03/11/2025 15:40:49
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for travel_post_favorite
-- ----------------------------
DROP TABLE IF EXISTS `travel_post_favorite`;
CREATE TABLE `travel_post_favorite`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '收藏记录ID',
  `user_id` bigint NOT NULL COMMENT '收藏用户ID（关联user_info表的UserID）',
  `post_id` bigint NOT NULL COMMENT '帖子ID（关联travel_post表的id）',
  `publisher_id` bigint NOT NULL COMMENT '帖子发布者ID',
  `post_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '帖子标题',
  `post_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '帖子类型：travel_note(游记)、strategy(攻略)、photo_share(照片分享)、video_share(视频分享)、qa(问答)',
  `cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '帖子封面图片URL',
  `destination_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地名称',
  `destination_city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地城市',
  `destination_province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目的地省份',
  `destination_country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'China' COMMENT '目的地国家',
  `travel_days` int NULL DEFAULT NULL COMMENT '旅行天数',
  `travel_budget` decimal(10, 2) NULL DEFAULT NULL COMMENT '旅行预算',
  `travel_season` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '旅行季节',
  `travel_style` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '旅行风格',
  `favorite_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  `favorite_category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'general' COMMENT '收藏分类：general(通用)、inspiration(灵感)、planning(规划参考)、experience(经验分享)',
  `favorite_tags` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '个人标签（用逗号分隔）：如\"美食,摄影,亲子,省钱\"',
  `user_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '用户备注（收藏理由、个人想法等）',
  `priority_level` tinyint NULL DEFAULT 3 COMMENT '优先级（1-5，5最高）',
  `read_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'unread' COMMENT '阅读状态：unread(未读)、read(已读)、reading(阅读中)',
  `is_archived` tinyint(1) NULL DEFAULT 0 COMMENT '是否已归档',
  `reminder_enabled` tinyint(1) NULL DEFAULT 0 COMMENT '是否启用提醒',
  `reminder_date` datetime NULL DEFAULT NULL COMMENT '提醒时间',
  `reminder_message` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '提醒消息',
  `is_shared` tinyint(1) NULL DEFAULT 0 COMMENT '是否已分享给其他人',
  `share_count` int NULL DEFAULT 0 COMMENT '个人分享次数',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '收藏状态：active(活跃)、archived(已归档)、deleted(已删除)',
  `is_deleted` tinyint(1) NULL DEFAULT 0 COMMENT '是否已删除（软删除）',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_post`(`user_id` ASC, `post_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_post_id`(`post_id` ASC) USING BTREE,
  INDEX `idx_publisher_id`(`publisher_id` ASC) USING BTREE,
  INDEX `idx_favorite_time`(`favorite_time` ASC) USING BTREE,
  INDEX `idx_post_type`(`post_type` ASC) USING BTREE,
  INDEX `idx_destination_city`(`destination_city` ASC) USING BTREE,
  INDEX `idx_destination_province`(`destination_province` ASC) USING BTREE,
  INDEX `idx_favorite_category`(`favorite_category` ASC) USING BTREE,
  INDEX `idx_read_status`(`read_status` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE,
  INDEX `idx_is_archived`(`is_archived` ASC) USING BTREE,
  INDEX `idx_priority_level`(`priority_level` ASC) USING BTREE,
  INDEX `idx_reminder_date`(`reminder_date` ASC) USING BTREE,
  INDEX `idx_user_favorite_time`(`user_id` ASC, `favorite_time` ASC) USING BTREE,
  INDEX `idx_user_post_type`(`user_id` ASC, `post_type` ASC) USING BTREE,
  INDEX `idx_user_category`(`user_id` ASC, `favorite_category` ASC) USING BTREE,
  INDEX `idx_user_status`(`user_id` ASC, `status` ASC) USING BTREE,
  INDEX `idx_user_read_status`(`user_id` ASC, `read_status` ASC) USING BTREE,
  INDEX `idx_user_destination`(`user_id` ASC, `destination_city` ASC) USING BTREE,
  INDEX `idx_user_archived`(`user_id` ASC, `is_archived` ASC) USING BTREE,
  INDEX `idx_post_publisher`(`post_id` ASC, `publisher_id` ASC) USING BTREE,
  INDEX `idx_destination_type`(`destination_city` ASC, `post_type` ASC) USING BTREE,
  INDEX `idx_user_priority_time`(`user_id` ASC, `priority_level` ASC, `favorite_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '旅游帖子收藏表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of travel_post_favorite
-- ----------------------------
INSERT INTO `travel_post_favorite` VALUES (4, 1, 1, 1, '65345', 'travel_note', '', '', '', '', 'China', NULL, NULL, 'spring', 'solo', '2025-10-29 09:21:07', 'general', NULL, NULL, 3, 'unread', 0, 0, NULL, NULL, 0, 0, 'deleted', 1, '2025-10-29 09:21:07', '2025-11-03 02:05:46', '2025-11-03 02:05:46');
INSERT INTO `travel_post_favorite` VALUES (5, 5, 2, 1, '65345', 'travel_note', '', '', '', '', 'China', NULL, NULL, 'spring', 'solo', '2025-11-03 00:54:23', 'general', NULL, NULL, 3, 'unread', 0, 0, NULL, NULL, 0, 0, 'active', 0, '2025-11-03 00:54:23', '2025-11-03 00:54:23', NULL);
INSERT INTO `travel_post_favorite` VALUES (6, 1, 2, 1, '65345', 'travel_note', '', '', '', '', 'China', NULL, NULL, 'spring', 'solo', '2025-11-03 01:38:39', 'general', NULL, NULL, 3, 'unread', 0, 0, NULL, NULL, 0, 0, 'deleted', 1, '2025-11-03 01:38:39', '2025-11-03 02:05:22', '2025-11-03 02:05:22');
INSERT INTO `travel_post_favorite` VALUES (16, 1, 3, 1, '59864652641', 'travel_note', '', '', '', '', 'China', NULL, NULL, 'spring', 'solo', '2025-11-03 02:42:03', 'general', NULL, NULL, 3, 'unread', 0, 0, NULL, NULL, 0, 0, 'active', 0, '2025-11-03 02:42:03', '2025-11-03 02:42:03', NULL);

SET FOREIGN_KEY_CHECKS = 1;

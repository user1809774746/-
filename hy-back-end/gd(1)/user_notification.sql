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

 Date: 03/11/2025 16:00:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_notification
-- ----------------------------
DROP TABLE IF EXISTS `user_notification`;
CREATE TABLE `user_notification`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `receiver_id` bigint NOT NULL COMMENT '接收者用户ID（收到通知的用户）',
  `sender_id` bigint NOT NULL COMMENT '触发者用户ID（产生此通知的用户）',
  `sender_username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '触发者用户名',
  `sender_avatar` longblob NULL COMMENT '触发者头像',
  `notification_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知类型：COMMENT(评论)、FAVORITE(收藏)、VIEW(浏览)',
  `post_id` bigint NOT NULL COMMENT '关联的帖子ID',
  `post_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '帖子标题',
  `post_cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '帖子封面图',
  `comment_id` bigint NULL DEFAULT NULL COMMENT '评论ID（仅评论通知有值）',
  `comment_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '评论内容（仅评论通知有值）',
  `is_read` tinyint(1) NULL DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `read_time` datetime NULL DEFAULT NULL COMMENT '阅读时间',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '通知状态：active(活跃)、deleted(已删除)',
  `is_deleted` tinyint(1) NULL DEFAULT 0 COMMENT '是否已删除（软删除）',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_receiver_id`(`receiver_id` ASC) USING BTREE,
  INDEX `idx_sender_id`(`sender_id` ASC) USING BTREE,
  INDEX `idx_notification_type`(`notification_type` ASC) USING BTREE,
  INDEX `idx_post_id`(`post_id` ASC) USING BTREE,
  INDEX `idx_is_read`(`is_read` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE,
  INDEX `idx_created_time`(`created_time` ASC) USING BTREE,
  INDEX `idx_receiver_read`(`receiver_id` ASC, `is_read` ASC) USING BTREE,
  INDEX `idx_receiver_type`(`receiver_id` ASC, `notification_type` ASC) USING BTREE,
  INDEX `idx_receiver_time`(`receiver_id` ASC, `created_time` ASC) USING BTREE,
  CONSTRAINT `user_notification_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_notification_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_notification_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `travel_post` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户通知表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;


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

 Date: 03/11/2025 15:40:01
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_post_comment
-- ----------------------------
DROP TABLE IF EXISTS `user_post_comment`;
CREATE TABLE `user_post_comment`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `post_id` bigint NOT NULL COMMENT '帖子ID（关联travel_post表）',
  `user_id` bigint NOT NULL COMMENT '评论用户ID',
  `parent_comment_id` bigint NULL DEFAULT NULL COMMENT '父评论ID（用于回复）',
  `comment_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `comment_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '评论图片（JSON格式）',
  `is_author_reply` tinyint(1) NULL DEFAULT 0 COMMENT '是否为作者回复',
  `like_count` int NULL DEFAULT 0 COMMENT '点赞数',
  `reply_count` int NULL DEFAULT 0 COMMENT '回复数',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'normal' COMMENT '评论状态：normal/hidden/deleted',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_post`(`post_id` ASC) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_parent`(`parent_comment_id` ASC) USING BTREE,
  INDEX `idx_created_time`(`created_time` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  CONSTRAINT `user_post_comment_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `travel_post` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_post_comment_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_post_comment_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `user_post_comment` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '帖子评论表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_post_comment
-- ----------------------------
INSERT INTO `user_post_comment` VALUES (1, 2, 1, NULL, '15616556', NULL, 1, 0, 0, 'normal', '2025-10-30 03:45:52', '2025-10-30 03:45:52', NULL);
INSERT INTO `user_post_comment` VALUES (2, 2, 5, NULL, '1234567890', NULL, 0, 0, 0, 'normal', '2025-11-03 00:50:16', '2025-11-03 00:50:16', NULL);

SET FOREIGN_KEY_CHECKS = 1;

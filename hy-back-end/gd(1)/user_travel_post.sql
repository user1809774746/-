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

 Date: 31/10/2025 08:47:46
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_travel_post
-- ----------------------------
DROP TABLE IF EXISTS `user_travel_post`;
CREATE TABLE `user_travel_post`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `travel_post_id` bigint NOT NULL COMMENT '关联的travel_post表ID',
  `publisher_id` bigint NOT NULL COMMENT '发布者用户ID',
  `publisher_nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '发布者昵称',
  `publisher_avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '发布者头像URL',
  `user_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '用户对此帖子的状态：active/hidden/deleted/draft/published',
  `is_original` tinyint(1) NULL DEFAULT 1 COMMENT '是否原创',
  `user_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '用户对此帖子的私人备注',
  `user_tags` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户自定义标签',
  `is_pinned` tinyint(1) NULL DEFAULT 0 COMMENT '用户是否置顶此帖子',
  `user_category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户自定义分类',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `user_published_time` datetime NULL DEFAULT NULL COMMENT '用户发布时间',
  `user_deleted_time` datetime NULL DEFAULT NULL COMMENT '用户删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_travel_post_publisher`(`travel_post_id` ASC, `publisher_id` ASC) USING BTREE,
  INDEX `idx_publisher_status`(`publisher_id` ASC, `user_status` ASC) USING BTREE,
  INDEX `idx_published_time`(`user_published_time` ASC) USING BTREE,
  CONSTRAINT `user_travel_post_ibfk_1` FOREIGN KEY (`travel_post_id`) REFERENCES `travel_post` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_travel_post_ibfk_2` FOREIGN KEY (`publisher_id`) REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户帖子关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_travel_post
-- ----------------------------
INSERT INTO `user_travel_post` VALUES (1, 1, 1, '18831231517', NULL, 'published', 1, NULL, NULL, 0, NULL, '2025-10-29 07:59:52', '2025-10-29 08:10:26', '2025-10-29 08:10:26', NULL);
INSERT INTO `user_travel_post` VALUES (2, 2, 1, '18831231517', NULL, 'published', 1, NULL, NULL, 0, NULL, '2025-10-29 08:21:06', '2025-10-29 08:21:06', '2025-10-29 08:21:06', NULL);

SET FOREIGN_KEY_CHECKS = 1;

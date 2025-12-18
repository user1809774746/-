/*
 Navicat Premium Data Transfer

 Source Server         : first
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : gd_mcp

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 05/11/2025 14:36:21
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for attraction_favorite
-- ----------------------------
DROP TABLE IF EXISTS `attraction_favorite`;
CREATE TABLE `attraction_favorite`  (
  `index` int NOT NULL AUTO_INCREMENT COMMENT '收藏记录ID',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '景点名称',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '景点类型（park，museum，landmark）',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '景点具体的地址',
  `lng` double NULL DEFAULT NULL COMMENT '景点经度',
  `lat` double NULL DEFAULT NULL COMMENT '景点纬度',
  `user_id` bigint NOT NULL COMMENT '用户ID（外键，关联user_info表主键）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间，默认当前时间',
  `total_attraction` int NULL DEFAULT NULL COMMENT '收藏景点总数',
  `is_valid` int NULL DEFAULT NULL COMMENT '收藏有效性：1=有效，0=已取消（软删除）',
  `rating` float NULL DEFAULT NULL COMMENT '景点评分',
  `distance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '景点离用户的距离',
  PRIMARY KEY (`index`) USING BTREE,
  UNIQUE INDEX `uk_user_attraction`(`user_id` ASC, `name` ASC, `lat` ASC, `lng` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_attraction_name`(`name` ASC) USING BTREE,
  INDEX `idx_favorite_time`(`create_time` ASC) USING BTREE,
  INDEX `idx_user_favorite_time`(`user_id` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_user_visit_status`(`user_id` ASC) USING BTREE,
  CONSTRAINT `attraction-id` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '景点收藏表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of attraction_favorite
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;

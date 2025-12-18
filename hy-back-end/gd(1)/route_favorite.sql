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

 Date: 05/11/2025 17:09:35
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for route_favorite
-- ----------------------------
DROP TABLE IF EXISTS `route_favorite`;
CREATE TABLE `route_favorite`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '收藏记录唯一标识',
  `user_id` int NOT NULL COMMENT '收藏用户ID（外键，关联用户表主键）',
  `route_id` int NOT NULL COMMENT '被收藏路线ID（外键，关联trip_schemes表的id）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间，默认当前时间',
  `is_valid` tinyint NOT NULL DEFAULT 1 COMMENT '收藏有效性：1=有效，0=已取消（软删除）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_route_unique`(`user_id` ASC, `route_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_route_id`(`route_id` ASC) USING BTREE,
  CONSTRAINT `route_favorite_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `trip_schemes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '路线收藏关联表，关联用户与旅游方案' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of route_favorite
-- ----------------------------
INSERT INTO `route_favorite` VALUES (1, 4, 1, '2025-11-03 08:07:43', 1);
INSERT INTO `route_favorite` VALUES (2, 1, 2, '2025-11-04 00:43:10', 1);
INSERT INTO `route_favorite` VALUES (3, 3, 3, '2025-11-05 07:22:02', 0);
INSERT INTO `route_favorite` VALUES (4, 3, 4, '2025-11-05 07:22:25', 1);

SET FOREIGN_KEY_CHECKS = 1;

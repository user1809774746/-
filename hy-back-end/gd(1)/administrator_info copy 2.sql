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

 Date: 31/10/2025 11:13:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for administrator_info
-- ----------------------------
DROP TABLE IF EXISTS `administrator_info`;
CREATE TABLE `administrator_info`  (
  `adminid` bigint NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `admin_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '管理员用户名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '手机号',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（BCrypt加密）',
  `creation_date` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `last_login_date` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `active_token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '当前活跃的token',
  `token_created_at` datetime NULL DEFAULT NULL COMMENT 'token创建时间',
  `token_expires_at` datetime NULL DEFAULT NULL COMMENT 'token过期时间',
  PRIMARY KEY (`adminid`) USING BTREE,
  INDEX `idx_active_token`(`active_token`(255) ASC) USING BTREE,
  UNIQUE INDEX `UK_admin_name`(`admin_name` ASC) USING BTREE,
  UNIQUE INDEX `UK_phone`(`phone` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '管理员信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of administrator_info
-- ----------------------------
INSERT INTO `administrator_info` VALUES (1, '18888888888', '18888888888', '$2a$10$dLxApnzILICY6oYmJ1anVuV7fcWkAX5hzeotVOA5tk6naDoBdVokW', '2025-10-31 03:11:08', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;

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

 Date: 31/10/2025 09:13:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for administrator_info
-- ----------------------------
DROP TABLE IF EXISTS `administrator_info`;
CREATE TABLE `administrator_info`  (
  `adminid` bigint NOT NULL AUTO_INCREMENT,
  `admin_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `creation_date` datetime(6) NULL DEFAULT NULL,
  `last_login_date` datetime(6) NULL DEFAULT NULL,
  `active_token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '当前活跃的token',
  `token_created_at` datetime NULL DEFAULT NULL COMMENT 'token创建时间',
  `token_expires_at` datetime NULL DEFAULT NULL COMMENT 'token过期时间',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`adminid`) USING BTREE,
  UNIQUE INDEX `UK_p7exh8m4xi9a0cffyrhvc87k3`(`admin_name` ASC) USING BTREE,
  INDEX `idx_active_token`(`active_token`(255) ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of administrator_info
-- ----------------------------
INSERT INTO `administrator_info` VALUES (1, '156156', NULL, NULL, NULL, NULL, NULL, '123123', '18888888888');

SET FOREIGN_KEY_CHECKS = 1;

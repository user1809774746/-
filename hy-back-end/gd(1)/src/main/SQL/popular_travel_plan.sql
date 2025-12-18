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

 Date: 10/12/2025 17:16:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for popular_travel_plan
-- ----------------------------
DROP TABLE IF EXISTS `popular_travel_plan`;
CREATE TABLE `popular_travel_plan`  (
  `plan_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `trip_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_days` int NOT NULL,
  `days_data` json NOT NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `is_favorited` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`plan_id`) USING BTREE,
  INDEX `UserID`(`user_id` ASC) USING BTREE,
  CONSTRAINT `popular_travel_plan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of popular_travel_plan
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;

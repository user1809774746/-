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

 Date: 02/12/2025 11:02:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for travel_plans
-- ----------------------------
DROP TABLE IF EXISTS `travel_plans`;
CREATE TABLE `travel_plans`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `date` datetime(6) NULL DEFAULT NULL,
  `destination` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `special_requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `total_budget` decimal(10, 2) NULL DEFAULT NULL,
  `total_tips` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `travel_days` int NOT NULL,
  `updated_at` datetime(6) NULL DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `end_date` date NULL DEFAULT NULL,
  `start_date` date NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of travel_plans
-- ----------------------------
INSERT INTO `travel_plans` VALUES (1, '2025-12-02 02:36:03.073492', NULL, '洛阳', '', 'draft', '洛阳三日游', 5000.00, '推荐提前查阅天气，调整行程计划。', 3, '2025-12-02 02:36:03.073492', 1, '2025-01-04', '2025-01-02');
INSERT INTO `travel_plans` VALUES (2, '2025-12-02 02:56:29.414552', NULL, '邯郸', '', 'draft', '邯郸三日游', 5000.00, '推荐提前查阅天气，合理安排行程。', 3, '2025-12-02 02:56:29.414552', 1, '2025-01-04', '2025-01-02');

SET FOREIGN_KEY_CHECKS = 1;

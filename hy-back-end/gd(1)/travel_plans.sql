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

 Date: 12/12/2025 11:31:36
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
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of travel_plans
-- ----------------------------
INSERT INTO `travel_plans` VALUES (3, '2025-12-02 03:10:26.241555', NULL, '北京', NULL, 'draft', '北京经济游', 1300.00, '建议使用地铁出行，快速且方便。', 2, '2025-12-02 03:10:26.241555', 4, '2023-10-05', '2023-10-04');
INSERT INTO `travel_plans` VALUES (21, '2025-12-05 01:19:11.369110', NULL, '玉龙雪山', '无特殊要求', 'draft', '玉龙雪山旅行', 1080.00, '推荐住在正定古城旁边的民宿。', 3, '2025-12-05 01:19:11.369110', 4, '2025-12-12', '2025-12-10');
INSERT INTO `travel_plans` VALUES (22, '2025-12-05 01:53:00.002687', NULL, '西安', '无', 'draft', '西安经济游', 5000.00, '推荐住在西安青年旅舍，方便快捷。', 5, '2025-12-06 12:21:44.678960', 1, '2025-12-19', '2025-12-15');
INSERT INTO `travel_plans` VALUES (23, '2025-12-06 12:34:44.556591', NULL, '洛阳', '无', 'draft', '洛阳深度游', 1600.00, '建议选择洛阳古城或者市中心附近住宿，交通便利，服务设施完善，方便每日出行。', 5, '2025-12-06 12:36:50.259728', 1, '2025-12-10', '2025-12-06');

SET FOREIGN_KEY_CHECKS = 1;

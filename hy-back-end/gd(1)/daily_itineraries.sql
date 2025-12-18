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

 Date: 12/12/2025 10:45:31
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for daily_itineraries
-- ----------------------------
DROP TABLE IF EXISTS `daily_itineraries`;
CREATE TABLE `daily_itineraries`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `date` date NULL DEFAULT NULL,
  `day_number` int NOT NULL,
  `updated_at` datetime(6) NULL DEFAULT NULL,
  `travel_plan_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKe1fdro1sfx3icmo43tphvx8g7`(`travel_plan_id` ASC) USING BTREE,
  CONSTRAINT `FKe1fdro1sfx3icmo43tphvx8g7` FOREIGN KEY (`travel_plan_id`) REFERENCES `travel_plans` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 72 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of daily_itineraries
-- ----------------------------
INSERT INTO `daily_itineraries` VALUES (7, '北京', '2025-12-02 03:10:26.248342', '2023-10-04', 1, '2025-12-02 03:10:26.248342', 3);
INSERT INTO `daily_itineraries` VALUES (8, '北京', '2025-12-02 03:10:26.262740', '2023-10-05', 2, '2025-12-02 03:10:26.262740', 3);
INSERT INTO `daily_itineraries` VALUES (59, '丽江', '2025-12-05 01:19:11.379624', '2025-12-10', 1, '2025-12-05 01:19:11.379624', 21);
INSERT INTO `daily_itineraries` VALUES (60, '丽江', '2025-12-05 01:19:11.391839', '2025-12-11', 2, '2025-12-05 01:19:11.391839', 21);
INSERT INTO `daily_itineraries` VALUES (61, '丽江', '2025-12-05 01:19:11.397563', '2025-12-12', 3, '2025-12-05 01:19:11.397563', 21);
INSERT INTO `daily_itineraries` VALUES (62, '西安', '2025-12-05 01:53:00.019819', '2025-12-15', 1, '2025-12-05 01:53:00.019819', 22);
INSERT INTO `daily_itineraries` VALUES (63, '西安', '2025-12-05 01:53:00.040683', '2025-12-16', 2, '2025-12-05 01:53:00.040683', 22);
INSERT INTO `daily_itineraries` VALUES (64, '西安', '2025-12-05 01:53:00.052519', '2025-12-17', 3, '2025-12-05 01:53:00.052519', 22);
INSERT INTO `daily_itineraries` VALUES (65, NULL, '2025-12-06 12:21:34.837245', '2025-12-18', 4, '2025-12-06 12:21:34.837245', 22);
INSERT INTO `daily_itineraries` VALUES (66, NULL, '2025-12-06 12:21:44.684008', '2025-12-19', 5, '2025-12-06 12:21:44.684008', 22);
INSERT INTO `daily_itineraries` VALUES (67, '洛阳', '2025-12-06 12:34:44.559608', '2025-12-06', 1, '2025-12-06 12:34:44.559608', 23);
INSERT INTO `daily_itineraries` VALUES (68, '洛阳', '2025-12-06 12:34:44.566922', '2025-12-07', 2, '2025-12-06 12:34:44.566922', 23);
INSERT INTO `daily_itineraries` VALUES (69, '洛阳', '2025-12-06 12:34:44.572608', '2025-12-08', 3, '2025-12-06 12:34:44.572608', 23);
INSERT INTO `daily_itineraries` VALUES (70, '洛阳', '2025-12-06 12:34:44.575305', '2025-12-09', 4, '2025-12-06 12:34:44.575305', 23);
INSERT INTO `daily_itineraries` VALUES (71, NULL, '2025-12-06 12:36:50.264257', '2025-12-10', 5, '2025-12-06 12:36:50.264257', 23);

SET FOREIGN_KEY_CHECKS = 1;

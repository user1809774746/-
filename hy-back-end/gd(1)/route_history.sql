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

 Date: 13/11/2025 08:34:47
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for route_history
-- ----------------------------
DROP TABLE IF EXISTS `route_history`;
CREATE TABLE `route_history`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `departure` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '出发地',
  `destination` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目的地',
  `departure_lat` double NULL DEFAULT NULL COMMENT '出发地纬度',
  `departure_lng` double NULL DEFAULT NULL COMMENT '出发地经度',
  `destination_lat` double NULL DEFAULT NULL COMMENT '目的地纬度',
  `destination_lng` double NULL DEFAULT NULL COMMENT '目的地经度',
  `distance` double NULL DEFAULT NULL COMMENT '距离（单位：千米）',
  `duration` int NULL DEFAULT NULL COMMENT '预计时长（单位：分钟）',
  `route_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '路线类型：driving(驾车)、walking(步行)、transit(公交)、cycling(骑行)',
  `search_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '查询时间',
  `is_favorite` tinyint(1) NULL DEFAULT 0 COMMENT '是否收藏',
  `notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注信息',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_search_time`(`search_time` ASC) USING BTREE,
  INDEX `idx_user_favorite`(`user_id` ASC, `is_favorite` ASC) USING BTREE,
  INDEX `idx_user_search_time`(`user_id` ASC, `search_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '路线历史记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of route_history
-- ----------------------------
INSERT INTO `route_history` VALUES (1, 1, '上海大学', '河北大学', NULL, NULL, NULL, NULL, NULL, 960, 'driving', '2025-10-28 02:27:41', 1, '最快路线 - 自驾');
INSERT INTO `route_history` VALUES (2, 4, '河北科技大学', '北京故宫', NULL, NULL, NULL, NULL, NULL, 240, 'driving', '2025-11-05 07:08:53', 0, '最快路线 - 驾车');
INSERT INTO `route_history` VALUES (3, 1, '河北大学', '河北师范大学', NULL, NULL, NULL, NULL, NULL, 120, 'driving', '2025-11-05 07:13:31', 1, '最快路线 - 自驾');
INSERT INTO `route_history` VALUES (4, 3, '石家庄', '北京', NULL, NULL, NULL, NULL, NULL, 30, 'driving', '2025-11-05 07:14:26', 0, '最省钱路线 - 自驾');
INSERT INTO `route_history` VALUES (5, 3, '河北师范大学', '河北科技大学', NULL, NULL, NULL, NULL, NULL, 39, 'walking', '2025-11-05 07:17:17', 0, '最省钱路线 - 步行');
INSERT INTO `route_history` VALUES (6, 4, '河北师范大学', '北京故宫', NULL, NULL, NULL, NULL, NULL, 20, 'driving', '2025-11-05 10:26:51', 0, '最快路线 - 驾车');
INSERT INTO `route_history` VALUES (7, 4, '河北师范大学', '河北科技大学', NULL, NULL, NULL, NULL, NULL, 15, 'driving', '2025-11-05 10:28:33', 0, '最快路线 - 驾车');

SET FOREIGN_KEY_CHECKS = 1;

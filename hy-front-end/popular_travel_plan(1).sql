/*
 Navicat Premium Data Transfer

 Source Server         : n8n
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : gd_mcp

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 11/12/2025 11:42:22
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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of popular_travel_plan
-- ----------------------------
INSERT INTO `popular_travel_plan` VALUES (1, 3, '北京3日经典文化深度游', 3, '[{\"day\": 1, \"photo\": \"http://store.is.autonavi.com/showpic/2f968490d105bb2741e17f90b85c6b79\", \"spots\": [\"天安门广场\", \"天安门\", \"毛主席纪念堂\", \"中国国家博物馆\", \"故宫博物院\", \"故宫博物院-午门\", \"景山公园\"], \"theme\": \"天安门广场与故宫皇家文化之旅\", \"highlights\": \"感受中国政治文化的心脏地带，参观象征国家权力的天安门广场及毛主席纪念堂，深入了解中华历史文明的故宫博物院，登临景山公园俯瞰紫禁城全景。\", \"routes_used\": [\"天安门广场-故宫文化游\"]}, {\"day\": 2, \"photo\": \"http://store.is.autonavi.com/showpic/68a92863a790f69d2221f7c53906c8c2\", \"spots\": [\"北海公园\", \"中山公园\", \"太庙\", \"天坛公园\"], \"theme\": \"皇家园林与古都风情体验\", \"highlights\": \"游览北京古代皇家园林的典范北海公园和中山公园，感受古代皇家宗教祭祀场所太庙的庄严神圣，最后在天坛公园体验古代祭天文化与现代城市休闲的完美结合。\", \"routes_used\": [\"皇家园林经典游\"]}, {\"day\": 3, \"photo\": \"http://store.is.autonavi.com/showpic/6aa94c24640267a56c22af0b9629030a\", \"spots\": [\"南锣鼓巷\", \"什刹海\", \"老舍故居\", \"前门大街\", \"王府井步行街\", \"国家大剧院\"], \"theme\": \"老北京胡同文化与现代商业结合之旅\", \"highlights\": \"体验北京老胡同的浓厚历史氛围与人文气息，参观著名作家老舍故居；随后游览前门大街和王府井步行街感受北京商业繁华与现代文化，最后欣赏国家大剧院的现代建筑艺术。\", \"routes_used\": [\"北京胡同风情游\", \"北京地标深度游\"]}]', '此行程合理串联北京核心文化地标、皇家园林及传统胡同文化，适合首次来北京的游客，交通便利，游览节奏适中。建议乘坐地铁出行，春秋季节天气宜人最佳旅游时间。', '2025-12-11 03:31:24', 0);

SET FOREIGN_KEY_CHECKS = 1;

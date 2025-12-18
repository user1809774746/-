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

 Date: 05/12/2025 08:53:35
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for province_info
-- ----------------------------
DROP TABLE IF EXISTS `province_info`;
CREATE TABLE `province_info`  (
  `province_id` bigint NOT NULL AUTO_INCREMENT COMMENT '省份ID',
  `province_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '省份名称',
  `province_photo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '省份照片URL',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`province_id`) USING BTREE,
  UNIQUE INDEX `uk_province_name`(`province_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '省份信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of province_info
-- ----------------------------
INSERT INTO `province_info` VALUES (1, '安徽', '/images/provinces/AnHui.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (2, '北京', '/images/provinces/BeiJing.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (3, '重庆', '/images/provinces/ChongQing.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (4, '福建', '/images/provinces/FuJian.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (5, '甘肃', '/images/provinces/GanSu.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (6, '广西', '/images/provinces/GuangXi.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (7, '贵州', '/images/provinces/GuiZhou.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (8, '海南', '/images/provinces/HaiNan.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (9, '河北', '/images/provinces/HeBei.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (10, '河南', '/images/provinces/HeNan.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (11, '黑龙江', '/images/provinces/HeiLongJiang.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (12, '湖北', '/images/provinces/HuBei.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (13, '湖南', '/images/provinces/HuNan.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (14, '吉林', '/images/provinces/JiLin.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (15, '江苏', '/images/provinces/JiangSu.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (16, '江西', '/images/provinces/JiangXi.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (17, '内蒙古', '/images/provinces/NeiMengGu.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (18, '宁夏', '/images/provinces/NingXia.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (19, '山东', '/images/provinces/ShanDong.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (20, '陕西', '/images/provinces/ShanXII.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (21, '山西', '/images/provinces/ShanXi.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (22, '上海', '/images/provinces/ShangHai.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (23, '天津', '/images/provinces/TianJin.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (24, '西藏', '/images/provinces/XiZang.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (25, '浙江', '/images/provinces/ZheJiang.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (26, '珠海', '/images/provinces/ZhuHai.jpg', '2025-12-04 09:19:21', '2025-12-04 09:19:21');
INSERT INTO `province_info` VALUES (27, '台湾', '/images/provinces/TaiWan.jpg', '2025-12-05 08:54:00', '2025-12-05 08:54:00');
INSERT INTO `province_info` VALUES (28, '香港', '/images/provinces/XiangGang.jpg', '2025-12-05 08:54:00', '2025-12-05 08:54:00');

SET FOREIGN_KEY_CHECKS = 1;

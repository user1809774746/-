/*
 User Background Image Table
 用户背景图片表
 
 Date: 05/12/2025
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_background_image
-- ----------------------------
DROP TABLE IF EXISTS `user_background_image`;
CREATE TABLE `user_background_image` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '背景图片记录ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `background_image` longblob NOT NULL COMMENT '背景图片数据',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_id` (`user_id`) USING BTREE COMMENT '每个用户只能有一张背景图',
  CONSTRAINT `fk_user_background_image_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户背景图片表' ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;

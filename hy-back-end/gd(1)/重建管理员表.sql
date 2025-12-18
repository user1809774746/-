/*
 重建管理员表 - 包含token字段
 执行此SQL将删除旧表并创建新表
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 删除旧表
-- ----------------------------
DROP TABLE IF EXISTS `administrator_info`;

-- ----------------------------
-- 创建新表（包含token相关字段）
-- ----------------------------
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
  UNIQUE INDEX `UK_admin_name`(`admin_name` ASC) USING BTREE,
  UNIQUE INDEX `UK_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_active_token`(`active_token`(255) ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '管理员信息表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- 说明
-- ----------------------------
-- 1. 表已清空，无默认数据
-- 2. 请使用注册接口创建管理员账号
-- 3. 密码将自动使用BCrypt加密
-- 4. phone字段添加了唯一索引，防止重复注册

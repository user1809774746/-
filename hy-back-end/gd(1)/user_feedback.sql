/*
 用户反馈表
 根据前端反馈表单设计
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_feedback
-- ----------------------------
DROP TABLE IF EXISTS `user_feedback`;
CREATE TABLE `user_feedback` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '反馈ID',
  `feedback_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '建议' COMMENT '反馈类型：建议/问题/体验/其他',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '反馈标题',
  `detail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '详细描述',
  `score` tinyint NULL DEFAULT NULL COMMENT '用户评分：1-5星',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系邮箱',
  `module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属模块',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID（如果已登录）',
  `user_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '提交者IP地址',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '处理状态：pending(待处理)/processing(处理中)/resolved(已解决)/closed(已关闭)',
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'normal' COMMENT '优先级：low(低)/normal(普通)/high(高)/urgent(紧急)',
  `handler_id` bigint NULL DEFAULT NULL COMMENT '处理人员ID',
  `handler_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '处理备注',
  `resolved_time` datetime NULL DEFAULT NULL COMMENT '解决时间',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已删除（软删除）',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_feedback_type` (`feedback_type` ASC) USING BTREE,
  INDEX `idx_status` (`status` ASC) USING BTREE,
  INDEX `idx_module` (`module` ASC) USING BTREE,
  INDEX `idx_user_id` (`user_id` ASC) USING BTREE,
  INDEX `idx_priority` (`priority` ASC) USING BTREE,
  INDEX `idx_created_time` (`created_time` ASC) USING BTREE,
  INDEX `idx_is_deleted` (`is_deleted` ASC) USING BTREE,
  INDEX `idx_status_created` (`status` ASC, `created_time` DESC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户反馈表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;


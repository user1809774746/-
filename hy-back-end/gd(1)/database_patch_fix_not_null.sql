-- ========================================
-- 数据库补丁：修复NOT NULL字段的默认值问题
-- 执行方式：mysql -u root -p gd_mcp < database_patch_fix_not_null.sql
-- ========================================

USE gd_mcp;

-- ========================================
-- 修复 group_chats 表
-- ========================================

-- 为 group_chats 表的 NOT NULL 字段添加默认值
ALTER TABLE group_chats 
  MODIFY COLUMN current_members INT NOT NULL DEFAULT 0 COMMENT '当前成员数',
  MODIFY COLUMN max_members INT NOT NULL DEFAULT 200 COMMENT '最大成员数',
  MODIFY COLUMN group_type VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT '群类型：normal/announcement/private',
  MODIFY COLUMN join_approval TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否需要加群审批',
  MODIFY COLUMN allow_member_invite TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否允许成员邀请',
  MODIFY COLUMN mute_all TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否全员禁言',
  MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '群状态：active/disbanded/frozen';

-- ========================================
-- 修复 group_members 表
-- ========================================

-- 为 group_members 表的 NOT NULL 字段添加默认值
ALTER TABLE group_members
  MODIFY COLUMN member_role VARCHAR(20) NOT NULL DEFAULT 'member' COMMENT '成员角色：owner/admin/member',
  MODIFY COLUMN is_muted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否被禁言',
  MODIFY COLUMN unread_count INT NOT NULL DEFAULT 0 COMMENT '未读消息数',
  MODIFY COLUMN member_status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '成员状态：active/left/kicked/banned';

-- ========================================
-- 修复 group_join_requests 表
-- ========================================

-- 为 group_join_requests 表的 NOT NULL 字段添加默认值
ALTER TABLE group_join_requests
  MODIFY COLUMN request_type VARCHAR(20) NOT NULL DEFAULT 'apply' COMMENT '请求类型：apply/invite',
  MODIFY COLUMN request_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '请求状态：pending/approved/rejected/expired';

-- ========================================
-- 修复 group_announcements 表
-- ========================================

-- 为 group_announcements 表的 NOT NULL 字段添加默认值
ALTER TABLE group_announcements
  MODIFY COLUMN is_pinned TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶',
  MODIFY COLUMN announcement_status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '公告状态：active/deleted';

-- ========================================
-- 验证修改
-- ========================================

-- 查看 group_chats 表结构
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'gd_mcp'
  AND TABLE_NAME = 'group_chats'
  AND COLUMN_NAME IN ('current_members', 'max_members', 'group_type', 'join_approval', 
                      'allow_member_invite', 'mute_all', 'status')
ORDER BY ORDINAL_POSITION;

-- 查看 group_members 表结构
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'gd_mcp'
  AND TABLE_NAME = 'group_members'
  AND COLUMN_NAME IN ('member_role', 'is_muted', 'unread_count', 'member_status')
ORDER BY ORDINAL_POSITION;

-- ========================================
-- 完成提示
-- ========================================
SELECT '✅ 数据库补丁执行成功！所有NOT NULL字段已添加默认值。' AS '执行结果';

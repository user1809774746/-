-- 修复user_travel_post表 - 删除多余的帖子内容字段
-- 这些字段应该在travel_post表中，而不是在关联表中

-- 检查当前表结构
DESCRIBE user_travel_post;

-- 删除帖子内容相关的字段
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS title;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS summary;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS content;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS content_type;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS post_type;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS category;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS cover_image;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS images;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS videos;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS attachments;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS destination_name;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS destination_city;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS destination_province;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS destination_country;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS locations;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS travel_start_date;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS travel_end_date;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS travel_days;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS travel_budget;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS actual_cost;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS travel_season;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS travel_style;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS companion_type;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS tags;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS keywords;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS rating;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS like_count;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS comment_count;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS favorite_count;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS share_count;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS view_count;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS rating_count;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS status;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS audit_status;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS audit_reason;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS audit_time;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS published_time;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS deleted_time;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS is_featured;
ALTER TABLE user_travel_post DROP COLUMN IF EXISTS is_top;

-- 再次检查表结构（应该只剩下关联字段）
DESCRIBE user_travel_post;

SELECT 'user_travel_post表字段清理完成' as status;


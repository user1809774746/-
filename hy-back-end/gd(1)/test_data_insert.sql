-- 测试数据插入脚本
-- 请先确保数据库表已创建，然后执行此脚本插入测试数据

-- 插入景点收藏测试数据
INSERT INTO attraction_favorite (
    user_id, attraction_name, attraction_name_en, attraction_address, 
    attraction_lat, attraction_lng, attraction_type, attraction_level, 
    attraction_rating, attraction_description, attraction_image_url, 
    ticket_price, opening_hours, contact_phone, official_website,
    visit_status, user_rating, user_notes, tags, is_public, 
    view_count, share_count, data_source, status
) VALUES 
-- 用户ID为1的测试数据（请根据实际用户ID修改）
(1, '故宫博物院', 'Forbidden City', '北京市东城区景山前街4号', 
 39.9163, 116.3972, 'historical', '5A', 4.8, 
 '中国明清两朝的皇家宫殿，世界文化遗产', 'https://example.com/images/forbidden-city.jpg',
 60.00, '08:30-17:00', '010-85007421', 'https://www.dpm.org.cn',
 'visited', 5, '一定要提前网上预约门票！建议游览4-6小时', '历史,文化,摄影,必游,世界遗产', false,
 0, 0, 'user_input', 'active'),

(1, '天安门广场', 'Tiananmen Square', '北京市东城区东长安街', 
 39.9042, 116.4074, 'cultural', '无等级', 4.7,
 '世界上最大的城市广场之一，中华人民共和国的象征', 'https://example.com/images/tiananmen.jpg',
 0.00, '全天开放', NULL, NULL,
 'not_visited', 4, '早上可以看升旗仪式，建议5点到达', '历史,文化,免费,必游,升旗仪式', true,
 2, 1, 'user_input', 'active'),

(1, '颐和园', 'Summer Palace', '北京市海淀区新建宫门路19号',
 39.9999, 116.2755, 'cultural', '5A', 4.6,
 '中国古典园林之首，清朝皇家园林', 'https://example.com/images/summer-palace.jpg',
 30.00, '06:30-18:00', '010-62881144', 'https://www.summerpalace-china.com',
 'planned', NULL, '春秋季节最美，可以划船游昆明湖', '园林,文化,摄影,世界遗产,划船', false,
 0, 0, 'user_input', 'active'),

(1, '张家界国家森林公园', 'Zhangjiajie National Forest Park', '湖南省张家界市武陵源区',
 29.3167, 110.4833, 'natural', '5A', 4.9,
 '世界自然遗产，以奇特的石英砂岩峰林地貌著称', 'https://example.com/images/zhangjiajie.jpg',
 248.00, '07:00-18:00', '0744-5712189', 'https://www.zjj.gov.cn',
 'not_visited', NULL, '《阿凡达》取景地，建议游览2-3天', '自然,世界遗产,摄影,徒步,阿凡达', false,
 0, 0, 'user_input', 'active'),

(1, '西湖', 'West Lake', '浙江省杭州市西湖区龙井路1号',
 30.2467, 120.1500, 'natural', '5A', 4.7,
 '杭州著名的风景名胜区，世界文化遗产', 'https://example.com/images/westlake.jpg',
 0.00, '全天开放', '0571-87179617', 'https://www.westlake.com.cn',
 'visited', 5, '免费景区，春天最美，可以坐船游湖', '自然,免费,世界遗产,划船,摄影', true,
 3, 2, 'user_input', 'active');

-- 插入帖子收藏测试数据
INSERT INTO travel_post_favorite (
    user_id, post_id, publisher_id, post_title, post_type, cover_image,
    destination_name, destination_city, destination_province, destination_country,
    travel_days, travel_budget, travel_season, travel_style,
    favorite_category, favorite_tags, user_notes, priority_level, read_status,
    is_archived, reminder_enabled, is_shared, share_count, status, is_deleted
) VALUES 
-- 用户ID为1的测试数据（请根据实际用户ID修改）
(1, 1001, 2001, '北京三日游完美攻略', 'strategy', 'https://example.com/images/beijing-cover.jpg',
 '北京', '北京市', '北京市', 'China', 3, 1500.00, 'autumn', 'family',
 'planning', '攻略,家庭游,经典路线,省钱', '准备国庆带家人去北京，这个攻略很实用', 5, 'unread',
 false, true, false, 0, 'active', false),

(1, 1002, 2002, '西藏自驾游记：追寻心中的净土', 'travel_note', 'https://example.com/images/tibet-cover.jpg',
 '西藏', '拉萨市', '西藏自治区', 'China', 15, 8000.00, 'summer', 'solo',
 'inspiration', '自驾,西藏,摄影,心灵之旅', '梦想中的西藏之旅，先收藏学习经验', 4, 'reading',
 false, false, true, 2, 'active', false),

(1, 1003, 2003, '厦门鼓浪屿美食探店', 'photo_share', 'https://example.com/images/xiamen-cover.jpg',
 '鼓浪屿', '厦门市', '福建省', 'China', 2, 800.00, 'spring', 'couple',
 'general', '美食,厦门,情侣游,小众', '下次和女朋友去厦门可以参考', 3, 'read',
 false, false, false, 0, 'active', false),

(1, 1004, 2004, '云南大理洱海环游攻略', 'strategy', 'https://example.com/images/dali-cover.jpg',
 '大理', '大理市', '云南省', 'China', 5, 2500.00, 'spring', 'couple',
 'planning', '攻略,云南,洱海,情侣游,摄影', '计划蜜月旅行，大理很适合', 5, 'unread',
 false, true, false, 0, 'active', false),

(1, 1005, 2005, '日本东京7日深度游', 'travel_note', 'https://example.com/images/tokyo-cover.jpg',
 '东京', '东京都', '东京都', 'Japan', 7, 12000.00, 'spring', 'solo',
 'experience', '日本,东京,樱花,美食,购物', '第一次去日本的经验分享，很详细', 4, 'read',
 false, false, true, 1, 'active', false),

(1, 1006, 2006, '成都美食48小时不完全指南', 'photo_share', 'https://example.com/images/chengdu-cover.jpg',
 '成都', '成都市', '四川省', 'China', 2, 600.00, 'winter', 'friends',
 'general', '成都,美食,火锅,小吃,朋友聚会', '成都美食太多了，这个总结很全面', 3, 'unread',
 false, false, false, 0, 'active', false);

-- 验证插入的数据
SELECT '景点收藏数据验证' as info;
SELECT COUNT(*) as attraction_count FROM attraction_favorite WHERE user_id = 1;
SELECT attraction_name, attraction_type, visit_status FROM attraction_favorite WHERE user_id = 1;

SELECT '帖子收藏数据验证' as info;
SELECT COUNT(*) as post_count FROM travel_post_favorite WHERE user_id = 1 AND is_deleted = false;
SELECT post_title, post_type, read_status FROM travel_post_favorite WHERE user_id = 1 AND is_deleted = false;

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

 Date: 05/11/2025 17:09:15
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for trip_schemes
-- ----------------------------
DROP TABLE IF EXISTS `trip_schemes`;
CREATE TABLE `trip_schemes`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键，自动递增',
  `trip_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '旅游方案标题，如“北京4日经典文化游”',
  `total_days` int NOT NULL COMMENT '旅游总天数，如4或3',
  `route_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '路线内容，存储每日行程、景点等JSON结构化数据',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '旅游方案总结，描述行程特点和适合人群',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '旅游方案表，存储路线核心信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of trip_schemes
-- ----------------------------
INSERT INTO `trip_schemes` VALUES (1, '天津3日经典文化游', 3, '[{\"day\":1,\"theme\":\"欧式风情与历史建筑\",\"routes_used\":[\"五大道文化旅游区\",\"小白楼欧式风情\"],\"spots\":[\"天津五大道文化旅游区\",\"民园广场\",\"庆王府\",\"五大道公园\",\"小白楼\",\"小白楼1902欧式风情街\"],\"time_schedule\":\"上午：五大道区域游览 → 下午：小白楼欧式风情 → 晚上：津湾广场夜景\",\"highlights\":\"漫步五大道，感受万国建筑博览会的魅力，体验天津独特的欧陆风情\",\"photo\":\"http://store.is.autonavi.com/showpic/3138223e49d8298d3b62d0b2105acc6b\"},{\"day\":2,\"theme\":\"文化博览与自然休闲\",\"routes_used\":[\"博物馆文化之旅\",\"水上公园休闲游\"],\"spots\":[\"天津博物馆\",\"天津自然博物馆\",\"天津文化中心海底世界\",\"天津水上公园\",\"天津动物园\"],\"time_schedule\":\"上午：博物馆参观 → 下午：水上公园休闲 → 晚上：天塔湖夜景\",\"highlights\":\"深度了解天津历史文化，同时享受自然风光与休闲时光\",\"photo\":\"http://store.is.autonavi.com/showpic/abc650f219f65099c11c966ef4c7290b\"},{\"day\":3,\"theme\":\"名人故居与宗教建筑\",\"routes_used\":[\"名人故居巡礼\",\"意大利风情体验\"],\"spots\":[\"瓷房子\",\"张学良故居\",\"天主教天津教区西开总堂\",\"天津意大利风情旅游区\",\"周恩来邓颖超纪念馆\"],\"time_schedule\":\"上午：名人故居参观 → 下午：意大利风情区 → 晚上：人民公园休闲\",\"highlights\":\"探访历史名人足迹，感受多元文化交融的天津特色\",\"photo\":\"http://aos-cdn-image.amap.com/sns/ugccomment/3f36409c-8095-41a3-ae32-2f661142a871.jpg\"}]', '此行程全面覆盖天津历史文化、欧式建筑与自然风光，节奏舒缓，适合初次来津游客深度体验。');
INSERT INTO `trip_schemes` VALUES (2, '呼伦贝尔海拉尔3日文化自然之旅', 3, '[{\"day\":1,\"theme\":\"历史文化探索日\",\"routes_used\":[\"博物馆文化线路\"],\"spots\":[\"呼伦贝尔历史博物馆\",\"呼伦贝尔自然博物馆\",\"鄂温克博物馆\",\"苏炳文广场\"],\"time_schedule\":\"上午：呼伦贝尔历史博物馆 → 中午：休息 → 下午：呼伦贝尔自然博物馆 → 鄂温克博物馆 → 傍晚：苏炳文广场散步\",\"highlights\":\"深度了解呼伦贝尔地区的历史沿革、自然生态和鄂温克民族文化的完美一日\",\"photo\":\"http://store.is.autonavi.com/showpic/6b2fcd625ecf651a25ad27805212e923\"},{\"day\":2,\"theme\":\"自然风光与宗教文化\",\"routes_used\":[\"森林公园与宗教建筑线路\"],\"spots\":[\"海拉尔国家森林公园\",\"海拉尔西山公园驯鹿部落\",\"一塔两寺\",\"广慧寺\"],\"time_schedule\":\"上午：海拉尔国家森林公园徒步 → 驯鹿部落体验 → 中午：公园内休息 → 下午：一塔两寺参观 → 广慧寺 → 傍晚：返回市区\",\"highlights\":\"从原始森林到宗教圣地，感受自然与信仰的完美融合\",\"photo\":\"http://store.is.autonavi.com/showpic/d8fd843634fe2910250e35858fa47292\"},{\"day\":3,\"theme\":\"城市休闲与民族风情\",\"routes_used\":[\"城市公园与民族特色线路\"],\"spots\":[\"呼伦贝尔古城\",\"成吉思汗公园-天骄园\",\"伊敏河民族公园\",\"桥头公园\"],\"time_schedule\":\"上午：呼伦贝尔古城游览 → 成吉思汗公园 → 中午：当地美食体验 → 下午：伊敏河民族公园漫步 → 桥头公园休闲 → 傍晚：整理行装\",\"highlights\":\"体验海拉尔城市魅力，感受蒙古族文化底蕴的休闲一日\",\"photo\":\"http://store.is.autonavi.com/showpic/24a719b1c481991d20c57d9b4e575926\"}]', '此行程涵盖海拉尔主要文化场馆、自然景观和城市特色，节奏舒缓，适合文化爱好者和家庭游客。');
INSERT INTO `trip_schemes` VALUES (3, '沈阳3日历史文化与休闲之旅', 3, '[{\"day\":1,\"theme\":\"历史文化探索\",\"routes_used\":[\"沈阳故宫文化游\",\"少帅府历史游\"],\"spots\":[\"沈阳故宫博物院\",\"张学良旧居陈列馆\",\"沈阳中街步行街\"],\"time_schedule\":null,\"highlights\":\"深入感受清朝发源地的皇家气派与民国历史风云，晚上体验繁华的商业街区。\",\"photo\":\"http://store.is.autonavi.com/showpic/2d15219b6a147017203952563a011a3a\"},{\"day\":2,\"theme\":\"博物馆与公园休闲\",\"routes_used\":[\"辽宁省博物馆文化游\",\"中央公园休闲游\"],\"spots\":[\"辽宁省博物馆\",\"氏族聚落\",\"中央公园音乐喷泉\",\"荷花池\",\"浑南之夏夜市\"],\"time_schedule\":null,\"highlights\":\"上午探索丰富的历史文物，下午享受公园的自然美景，晚上感受热闹的夜市氛围。\",\"photo\":\"http://store.is.autonavi.com/showpic/98113510b8aa19d6e7cdb4d7c88dbd03\"},{\"day\":3,\"theme\":\"自然风光与城市漫步\",\"routes_used\":[\"白塔公园文化游\",\"浑南市民公园休闲游\"],\"spots\":[\"白塔公园\",\"弥陀寺\",\"浑南市民公园\",\"五里河公园\",\"老北市\"],\"time_schedule\":null,\"highlights\":\"漫步古塔公园与现代滨水绿地，体验沈阳的自然与人文融合之美，晚上品味老北市的传统风情。\",\"photo\":\"http://store.is.autonavi.com/showpic/744e0b4cf67c65570a0bf4d8bf96f506\"}]', '此行程涵盖沈阳的历史文化、博物馆探索与自然休闲，节奏舒缓，适合家庭及文化爱好者。出行建议：春秋季为最佳旅游季节，使用地铁和公交便捷出行；适合喜欢深度游的游客。');
INSERT INTO `trip_schemes` VALUES (4, '沈阳3日历史文化与休闲之旅', 3, '[{\"day\":1,\"theme\":\"历史文化探索\",\"routes_used\":[\"沈阳故宫文化游\",\"少帅府历史游\"],\"spots\":[\"沈阳故宫博物院\",\"张学良旧居陈列馆\",\"沈阳中街步行街\"],\"time_schedule\":null,\"highlights\":\"深入感受清朝发源地的皇家气派与民国历史风云，晚上体验繁华的商业街区。\",\"photo\":\"http://store.is.autonavi.com/showpic/2d15219b6a147017203952563a011a3a\"},{\"day\":2,\"theme\":\"博物馆与公园休闲\",\"routes_used\":[\"辽宁省博物馆文化游\",\"中央公园休闲游\"],\"spots\":[\"辽宁省博物馆\",\"氏族聚落\",\"中央公园音乐喷泉\",\"荷花池\",\"浑南之夏夜市\"],\"time_schedule\":null,\"highlights\":\"上午探索丰富的历史文物，下午享受公园的自然美景，晚上感受热闹的夜市氛围。\",\"photo\":\"http://store.is.autonavi.com/showpic/98113510b8aa19d6e7cdb4d7c88dbd03\"},{\"day\":3,\"theme\":\"自然风光与城市漫步\",\"routes_used\":[\"白塔公园文化游\",\"浑南市民公园休闲游\"],\"spots\":[\"白塔公园\",\"弥陀寺\",\"浑南市民公园\",\"五里河公园\",\"老北市\"],\"time_schedule\":null,\"highlights\":\"漫步古塔公园与现代滨水绿地，体验沈阳的自然与人文融合之美，晚上品味老北市的传统风情。\",\"photo\":\"http://store.is.autonavi.com/showpic/744e0b4cf67c65570a0bf4d8bf96f506\"}]', '此行程涵盖沈阳的历史文化、博物馆探索与自然休闲，节奏舒缓，适合家庭及文化爱好者。出行建议：春秋季为最佳旅游季节，使用地铁和公交便捷出行；适合喜欢深度游的游客。');

SET FOREIGN_KEY_CHECKS = 1;

package com.example.auth.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 城市-省份映射服务
 * 用于将城市名称映射到对应的省份
 */
@Service
public class CityProvinceService {
    
    private static final Map<String, String> CITY_PROVINCE_MAP = new HashMap<>();
    
    static {
        // 直辖市
        CITY_PROVINCE_MAP.put("北京", "北京市");
        CITY_PROVINCE_MAP.put("上海", "上海市");
        CITY_PROVINCE_MAP.put("天津", "天津市");
        CITY_PROVINCE_MAP.put("重庆", "重庆市");
        
        // 河北省
        CITY_PROVINCE_MAP.put("石家庄", "河北省");
        CITY_PROVINCE_MAP.put("唐山", "河北省");
        CITY_PROVINCE_MAP.put("秦皇岛", "河北省");
        CITY_PROVINCE_MAP.put("邯郸", "河北省");
        CITY_PROVINCE_MAP.put("邢台", "河北省");
        CITY_PROVINCE_MAP.put("保定", "河北省");
        CITY_PROVINCE_MAP.put("张家口", "河北省");
        CITY_PROVINCE_MAP.put("承德", "河北省");
        CITY_PROVINCE_MAP.put("沧州", "河北省");
        CITY_PROVINCE_MAP.put("廊坊", "河北省");
        CITY_PROVINCE_MAP.put("衡水", "河北省");
        
        // 山西省
        CITY_PROVINCE_MAP.put("太原", "山西省");
        CITY_PROVINCE_MAP.put("大同", "山西省");
        CITY_PROVINCE_MAP.put("阳泉", "山西省");
        CITY_PROVINCE_MAP.put("长治", "山西省");
        CITY_PROVINCE_MAP.put("晋城", "山西省");
        CITY_PROVINCE_MAP.put("朔州", "山西省");
        CITY_PROVINCE_MAP.put("晋中", "山西省");
        CITY_PROVINCE_MAP.put("运城", "山西省");
        CITY_PROVINCE_MAP.put("忻州", "山西省");
        CITY_PROVINCE_MAP.put("临汾", "山西省");
        CITY_PROVINCE_MAP.put("吕梁", "山西省");
        
        // 内蒙古自治区
        CITY_PROVINCE_MAP.put("呼和浩特", "内蒙古自治区");
        CITY_PROVINCE_MAP.put("包头", "内蒙古自治区");
        CITY_PROVINCE_MAP.put("乌海", "内蒙古自治区");
        CITY_PROVINCE_MAP.put("赤峰", "内蒙古自治区");
        CITY_PROVINCE_MAP.put("通辽", "内蒙古自治区");
        CITY_PROVINCE_MAP.put("鄂尔多斯", "内蒙古自治区");
        CITY_PROVINCE_MAP.put("呼伦贝尔", "内蒙古自治区");
        CITY_PROVINCE_MAP.put("巴彦淖尔", "内蒙古自治区");
        CITY_PROVINCE_MAP.put("乌兰察布", "内蒙古自治区");
        
        // 辽宁省
        CITY_PROVINCE_MAP.put("沈阳", "辽宁省");
        CITY_PROVINCE_MAP.put("大连", "辽宁省");
        CITY_PROVINCE_MAP.put("鞍山", "辽宁省");
        CITY_PROVINCE_MAP.put("抚顺", "辽宁省");
        CITY_PROVINCE_MAP.put("本溪", "辽宁省");
        CITY_PROVINCE_MAP.put("丹东", "辽宁省");
        CITY_PROVINCE_MAP.put("锦州", "辽宁省");
        CITY_PROVINCE_MAP.put("营口", "辽宁省");
        CITY_PROVINCE_MAP.put("阜新", "辽宁省");
        CITY_PROVINCE_MAP.put("辽阳", "辽宁省");
        CITY_PROVINCE_MAP.put("盘锦", "辽宁省");
        CITY_PROVINCE_MAP.put("铁岭", "辽宁省");
        CITY_PROVINCE_MAP.put("朝阳", "辽宁省");
        CITY_PROVINCE_MAP.put("葫芦岛", "辽宁省");
        
        // 吉林省
        CITY_PROVINCE_MAP.put("长春", "吉林省");
        CITY_PROVINCE_MAP.put("吉林", "吉林省");
        CITY_PROVINCE_MAP.put("四平", "吉林省");
        CITY_PROVINCE_MAP.put("辽源", "吉林省");
        CITY_PROVINCE_MAP.put("通化", "吉林省");
        CITY_PROVINCE_MAP.put("白山", "吉林省");
        CITY_PROVINCE_MAP.put("松原", "吉林省");
        CITY_PROVINCE_MAP.put("白城", "吉林省");
        
        // 黑龙江省
        CITY_PROVINCE_MAP.put("哈尔滨", "黑龙江省");
        CITY_PROVINCE_MAP.put("齐齐哈尔", "黑龙江省");
        CITY_PROVINCE_MAP.put("鸡西", "黑龙江省");
        CITY_PROVINCE_MAP.put("鹤岗", "黑龙江省");
        CITY_PROVINCE_MAP.put("双鸭山", "黑龙江省");
        CITY_PROVINCE_MAP.put("大庆", "黑龙江省");
        CITY_PROVINCE_MAP.put("伊春", "黑龙江省");
        CITY_PROVINCE_MAP.put("佳木斯", "黑龙江省");
        CITY_PROVINCE_MAP.put("七台河", "黑龙江省");
        CITY_PROVINCE_MAP.put("牡丹江", "黑龙江省");
        CITY_PROVINCE_MAP.put("黑河", "黑龙江省");
        CITY_PROVINCE_MAP.put("绥化", "黑龙江省");
        
        // 江苏省
        CITY_PROVINCE_MAP.put("南京", "江苏省");
        CITY_PROVINCE_MAP.put("无锡", "江苏省");
        CITY_PROVINCE_MAP.put("徐州", "江苏省");
        CITY_PROVINCE_MAP.put("常州", "江苏省");
        CITY_PROVINCE_MAP.put("苏州", "江苏省");
        CITY_PROVINCE_MAP.put("南通", "江苏省");
        CITY_PROVINCE_MAP.put("连云港", "江苏省");
        CITY_PROVINCE_MAP.put("淮安", "江苏省");
        CITY_PROVINCE_MAP.put("盐城", "江苏省");
        CITY_PROVINCE_MAP.put("扬州", "江苏省");
        CITY_PROVINCE_MAP.put("镇江", "江苏省");
        CITY_PROVINCE_MAP.put("泰州", "江苏省");
        CITY_PROVINCE_MAP.put("宿迁", "江苏省");
        
        // 浙江省
        CITY_PROVINCE_MAP.put("杭州", "浙江省");
        CITY_PROVINCE_MAP.put("宁波", "浙江省");
        CITY_PROVINCE_MAP.put("温州", "浙江省");
        CITY_PROVINCE_MAP.put("嘉兴", "浙江省");
        CITY_PROVINCE_MAP.put("湖州", "浙江省");
        CITY_PROVINCE_MAP.put("绍兴", "浙江省");
        CITY_PROVINCE_MAP.put("金华", "浙江省");
        CITY_PROVINCE_MAP.put("衢州", "浙江省");
        CITY_PROVINCE_MAP.put("舟山", "浙江省");
        CITY_PROVINCE_MAP.put("台州", "浙江省");
        CITY_PROVINCE_MAP.put("丽水", "浙江省");
        
        // 安徽省
        CITY_PROVINCE_MAP.put("合肥", "安徽省");
        CITY_PROVINCE_MAP.put("芜湖", "安徽省");
        CITY_PROVINCE_MAP.put("蚌埠", "安徽省");
        CITY_PROVINCE_MAP.put("淮南", "安徽省");
        CITY_PROVINCE_MAP.put("马鞍山", "安徽省");
        CITY_PROVINCE_MAP.put("淮北", "安徽省");
        CITY_PROVINCE_MAP.put("铜陵", "安徽省");
        CITY_PROVINCE_MAP.put("安庆", "安徽省");
        CITY_PROVINCE_MAP.put("黄山", "安徽省");
        CITY_PROVINCE_MAP.put("滁州", "安徽省");
        CITY_PROVINCE_MAP.put("阜阳", "安徽省");
        CITY_PROVINCE_MAP.put("宿州", "安徽省");
        CITY_PROVINCE_MAP.put("六安", "安徽省");
        CITY_PROVINCE_MAP.put("亳州", "安徽省");
        CITY_PROVINCE_MAP.put("池州", "安徽省");
        CITY_PROVINCE_MAP.put("宣城", "安徽省");
        
        // 福建省
        CITY_PROVINCE_MAP.put("福州", "福建省");
        CITY_PROVINCE_MAP.put("厦门", "福建省");
        CITY_PROVINCE_MAP.put("莆田", "福建省");
        CITY_PROVINCE_MAP.put("三明", "福建省");
        CITY_PROVINCE_MAP.put("泉州", "福建省");
        CITY_PROVINCE_MAP.put("漳州", "福建省");
        CITY_PROVINCE_MAP.put("南平", "福建省");
        CITY_PROVINCE_MAP.put("龙岩", "福建省");
        CITY_PROVINCE_MAP.put("宁德", "福建省");
        
        // 江西省
        CITY_PROVINCE_MAP.put("南昌", "江西省");
        CITY_PROVINCE_MAP.put("景德镇", "江西省");
        CITY_PROVINCE_MAP.put("萍乡", "江西省");
        CITY_PROVINCE_MAP.put("九江", "江西省");
        CITY_PROVINCE_MAP.put("新余", "江西省");
        CITY_PROVINCE_MAP.put("鹰潭", "江西省");
        CITY_PROVINCE_MAP.put("赣州", "江西省");
        CITY_PROVINCE_MAP.put("吉安", "江西省");
        CITY_PROVINCE_MAP.put("宜春", "江西省");
        CITY_PROVINCE_MAP.put("抚州", "江西省");
        CITY_PROVINCE_MAP.put("上饶", "江西省");
        
        // 山东省
        CITY_PROVINCE_MAP.put("济南", "山东省");
        CITY_PROVINCE_MAP.put("青岛", "山东省");
        CITY_PROVINCE_MAP.put("淄博", "山东省");
        CITY_PROVINCE_MAP.put("枣庄", "山东省");
        CITY_PROVINCE_MAP.put("东营", "山东省");
        CITY_PROVINCE_MAP.put("烟台", "山东省");
        CITY_PROVINCE_MAP.put("潍坊", "山东省");
        CITY_PROVINCE_MAP.put("济宁", "山东省");
        CITY_PROVINCE_MAP.put("泰安", "山东省");
        CITY_PROVINCE_MAP.put("威海", "山东省");
        CITY_PROVINCE_MAP.put("日照", "山东省");
        CITY_PROVINCE_MAP.put("临沂", "山东省");
        CITY_PROVINCE_MAP.put("德州", "山东省");
        CITY_PROVINCE_MAP.put("聊城", "山东省");
        CITY_PROVINCE_MAP.put("滨州", "山东省");
        CITY_PROVINCE_MAP.put("菏泽", "山东省");
        
        // 河南省
        CITY_PROVINCE_MAP.put("郑州", "河南省");
        CITY_PROVINCE_MAP.put("开封", "河南省");
        CITY_PROVINCE_MAP.put("洛阳", "河南省");
        CITY_PROVINCE_MAP.put("平顶山", "河南省");
        CITY_PROVINCE_MAP.put("安阳", "河南省");
        CITY_PROVINCE_MAP.put("鹤壁", "河南省");
        CITY_PROVINCE_MAP.put("新乡", "河南省");
        CITY_PROVINCE_MAP.put("焦作", "河南省");
        CITY_PROVINCE_MAP.put("濮阳", "河南省");
        CITY_PROVINCE_MAP.put("许昌", "河南省");
        CITY_PROVINCE_MAP.put("漯河", "河南省");
        CITY_PROVINCE_MAP.put("三门峡", "河南省");
        CITY_PROVINCE_MAP.put("南阳", "河南省");
        CITY_PROVINCE_MAP.put("商丘", "河南省");
        CITY_PROVINCE_MAP.put("信阳", "河南省");
        CITY_PROVINCE_MAP.put("周口", "河南省");
        CITY_PROVINCE_MAP.put("驻马店", "河南省");
        
        // 湖北省
        CITY_PROVINCE_MAP.put("武汉", "湖北省");
        CITY_PROVINCE_MAP.put("黄石", "湖北省");
        CITY_PROVINCE_MAP.put("十堰", "湖北省");
        CITY_PROVINCE_MAP.put("宜昌", "湖北省");
        CITY_PROVINCE_MAP.put("襄阳", "湖北省");
        CITY_PROVINCE_MAP.put("鄂州", "湖北省");
        CITY_PROVINCE_MAP.put("荆门", "湖北省");
        CITY_PROVINCE_MAP.put("孝感", "湖北省");
        CITY_PROVINCE_MAP.put("荆州", "湖北省");
        CITY_PROVINCE_MAP.put("黄冈", "湖北省");
        CITY_PROVINCE_MAP.put("咸宁", "湖北省");
        CITY_PROVINCE_MAP.put("随州", "湖北省");
        
        // 湖南省
        CITY_PROVINCE_MAP.put("长沙", "湖南省");
        CITY_PROVINCE_MAP.put("株洲", "湖南省");
        CITY_PROVINCE_MAP.put("湘潭", "湖南省");
        CITY_PROVINCE_MAP.put("衡阳", "湖南省");
        CITY_PROVINCE_MAP.put("邵阳", "湖南省");
        CITY_PROVINCE_MAP.put("岳阳", "湖南省");
        CITY_PROVINCE_MAP.put("常德", "湖南省");
        CITY_PROVINCE_MAP.put("张家界", "湖南省");
        CITY_PROVINCE_MAP.put("益阳", "湖南省");
        CITY_PROVINCE_MAP.put("郴州", "湖南省");
        CITY_PROVINCE_MAP.put("永州", "湖南省");
        CITY_PROVINCE_MAP.put("怀化", "湖南省");
        CITY_PROVINCE_MAP.put("娄底", "湖南省");
        
        // 广东省
        CITY_PROVINCE_MAP.put("广州", "广东省");
        CITY_PROVINCE_MAP.put("韶关", "广东省");
        CITY_PROVINCE_MAP.put("深圳", "广东省");
        CITY_PROVINCE_MAP.put("珠海", "广东省");
        CITY_PROVINCE_MAP.put("汕头", "广东省");
        CITY_PROVINCE_MAP.put("佛山", "广东省");
        CITY_PROVINCE_MAP.put("江门", "广东省");
        CITY_PROVINCE_MAP.put("湛江", "广东省");
        CITY_PROVINCE_MAP.put("茂名", "广东省");
        CITY_PROVINCE_MAP.put("肇庆", "广东省");
        CITY_PROVINCE_MAP.put("惠州", "广东省");
        CITY_PROVINCE_MAP.put("梅州", "广东省");
        CITY_PROVINCE_MAP.put("汕尾", "广东省");
        CITY_PROVINCE_MAP.put("河源", "广东省");
        CITY_PROVINCE_MAP.put("阳江", "广东省");
        CITY_PROVINCE_MAP.put("清远", "广东省");
        CITY_PROVINCE_MAP.put("东莞", "广东省");
        CITY_PROVINCE_MAP.put("中山", "广东省");
        CITY_PROVINCE_MAP.put("潮州", "广东省");
        CITY_PROVINCE_MAP.put("揭阳", "广东省");
        CITY_PROVINCE_MAP.put("云浮", "广东省");
        
        // 广西壮族自治区
        CITY_PROVINCE_MAP.put("南宁", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("柳州", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("桂林", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("梧州", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("北海", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("防城港", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("钦州", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("贵港", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("玉林", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("百色", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("贺州", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("河池", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("来宾", "广西壮族自治区");
        CITY_PROVINCE_MAP.put("崇左", "广西壮族自治区");
        
        // 海南省
        CITY_PROVINCE_MAP.put("海口", "海南省");
        CITY_PROVINCE_MAP.put("三亚", "海南省");
        CITY_PROVINCE_MAP.put("三沙", "海南省");
        CITY_PROVINCE_MAP.put("儋州", "海南省");
        
        // 四川省
        CITY_PROVINCE_MAP.put("成都", "四川省");
        CITY_PROVINCE_MAP.put("自贡", "四川省");
        CITY_PROVINCE_MAP.put("攀枝花", "四川省");
        CITY_PROVINCE_MAP.put("泸州", "四川省");
        CITY_PROVINCE_MAP.put("德阳", "四川省");
        CITY_PROVINCE_MAP.put("绵阳", "四川省");
        CITY_PROVINCE_MAP.put("广元", "四川省");
        CITY_PROVINCE_MAP.put("遂宁", "四川省");
        CITY_PROVINCE_MAP.put("内江", "四川省");
        CITY_PROVINCE_MAP.put("乐山", "四川省");
        CITY_PROVINCE_MAP.put("南充", "四川省");
        CITY_PROVINCE_MAP.put("眉山", "四川省");
        CITY_PROVINCE_MAP.put("宜宾", "四川省");
        CITY_PROVINCE_MAP.put("广安", "四川省");
        CITY_PROVINCE_MAP.put("达州", "四川省");
        CITY_PROVINCE_MAP.put("雅安", "四川省");
        CITY_PROVINCE_MAP.put("巴中", "四川省");
        CITY_PROVINCE_MAP.put("资阳", "四川省");
        
        // 贵州省
        CITY_PROVINCE_MAP.put("贵阳", "贵州省");
        CITY_PROVINCE_MAP.put("六盘水", "贵州省");
        CITY_PROVINCE_MAP.put("遵义", "贵州省");
        CITY_PROVINCE_MAP.put("安顺", "贵州省");
        CITY_PROVINCE_MAP.put("毕节", "贵州省");
        CITY_PROVINCE_MAP.put("铜仁", "贵州省");
        
        // 云南省
        CITY_PROVINCE_MAP.put("昆明", "云南省");
        CITY_PROVINCE_MAP.put("曲靖", "云南省");
        CITY_PROVINCE_MAP.put("玉溪", "云南省");
        CITY_PROVINCE_MAP.put("保山", "云南省");
        CITY_PROVINCE_MAP.put("昭通", "云南省");
        CITY_PROVINCE_MAP.put("丽江", "云南省");
        CITY_PROVINCE_MAP.put("普洱", "云南省");
        CITY_PROVINCE_MAP.put("临沧", "云南省");
        CITY_PROVINCE_MAP.put("大理", "云南省");
        CITY_PROVINCE_MAP.put("香格里拉", "云南省");
        
        // 西藏自治区
        CITY_PROVINCE_MAP.put("拉萨", "西藏自治区");
        CITY_PROVINCE_MAP.put("日喀则", "西藏自治区");
        CITY_PROVINCE_MAP.put("昌都", "西藏自治区");
        CITY_PROVINCE_MAP.put("林芝", "西藏自治区");
        CITY_PROVINCE_MAP.put("山南", "西藏自治区");
        CITY_PROVINCE_MAP.put("那曲", "西藏自治区");
        
        // 陕西省
        CITY_PROVINCE_MAP.put("西安", "陕西省");
        CITY_PROVINCE_MAP.put("铜川", "陕西省");
        CITY_PROVINCE_MAP.put("宝鸡", "陕西省");
        CITY_PROVINCE_MAP.put("咸阳", "陕西省");
        CITY_PROVINCE_MAP.put("渭南", "陕西省");
        CITY_PROVINCE_MAP.put("延安", "陕西省");
        CITY_PROVINCE_MAP.put("汉中", "陕西省");
        CITY_PROVINCE_MAP.put("榆林", "陕西省");
        CITY_PROVINCE_MAP.put("安康", "陕西省");
        CITY_PROVINCE_MAP.put("商洛", "陕西省");
        
        // 甘肃省
        CITY_PROVINCE_MAP.put("兰州", "甘肃省");
        CITY_PROVINCE_MAP.put("嘉峪关", "甘肃省");
        CITY_PROVINCE_MAP.put("金昌", "甘肃省");
        CITY_PROVINCE_MAP.put("白银", "甘肃省");
        CITY_PROVINCE_MAP.put("天水", "甘肃省");
        CITY_PROVINCE_MAP.put("武威", "甘肃省");
        CITY_PROVINCE_MAP.put("张掖", "甘肃省");
        CITY_PROVINCE_MAP.put("平凉", "甘肃省");
        CITY_PROVINCE_MAP.put("酒泉", "甘肃省");
        CITY_PROVINCE_MAP.put("庆阳", "甘肃省");
        CITY_PROVINCE_MAP.put("定西", "甘肃省");
        CITY_PROVINCE_MAP.put("陇南", "甘肃省");
        
        // 青海省
        CITY_PROVINCE_MAP.put("西宁", "青海省");
        CITY_PROVINCE_MAP.put("海东", "青海省");
        
        // 宁夏回族自治区
        CITY_PROVINCE_MAP.put("银川", "宁夏回族自治区");
        CITY_PROVINCE_MAP.put("石嘴山", "宁夏回族自治区");
        CITY_PROVINCE_MAP.put("吴忠", "宁夏回族自治区");
        CITY_PROVINCE_MAP.put("固原", "宁夏回族自治区");
        CITY_PROVINCE_MAP.put("中卫", "宁夏回族自治区");
        
        // 新疆维吾尔自治区
        CITY_PROVINCE_MAP.put("乌鲁木齐", "新疆维吾尔自治区");
        CITY_PROVINCE_MAP.put("克拉玛依", "新疆维吾尔自治区");
        CITY_PROVINCE_MAP.put("吐鲁番", "新疆维吾尔自治区");
        CITY_PROVINCE_MAP.put("哈密", "新疆维吾尔自治区");
        CITY_PROVINCE_MAP.put("喀什", "新疆维吾尔自治区");
        CITY_PROVINCE_MAP.put("阿克苏", "新疆维吾尔自治区");
        
        // 香港、澳门、台湾
        CITY_PROVINCE_MAP.put("香港", "香港特别行政区");
        CITY_PROVINCE_MAP.put("澳门", "澳门特别行政区");
        CITY_PROVINCE_MAP.put("台北", "台湾省");
        CITY_PROVINCE_MAP.put("高雄", "台湾省");
        CITY_PROVINCE_MAP.put("台中", "台湾省");
        
        // 添加常见景点作为特殊处理
        CITY_PROVINCE_MAP.put("玉龙雪山", "云南省");
        CITY_PROVINCE_MAP.put("泸沽湖", "云南省");
        CITY_PROVINCE_MAP.put("洱海", "云南省");
    }
    
    /**
     * 根据城市名称获取省份
     * @param city 城市名称
     * @return 省份名称，如果找不到则返回"未知省份"
     */
    public String getProvince(String city) {
        if (city == null || city.trim().isEmpty()) {
            return "未知省份";
        }
        
        // 去除城市名称中可能存在的"市"字
        String cleanCity = city.replace("市", "").trim();
        
        // 先尝试精确匹配
        String province = CITY_PROVINCE_MAP.get(cleanCity);
        if (province != null) {
            return province;
        }
        
        // 如果找不到，尝试模糊匹配（包含关系）
        for (Map.Entry<String, String> entry : CITY_PROVINCE_MAP.entrySet()) {
            if (cleanCity.contains(entry.getKey()) || entry.getKey().contains(cleanCity)) {
                return entry.getValue();
            }
        }
        
        return "未知省份";
    }
    
    /**
     * 获取省份+城市的完整地址
     * @param city 城市名称
     * @return 省份+城市格式的完整地址
     */
    public String getFullLocation(String city) {
        if (city == null || city.trim().isEmpty()) {
            return "未知地区";
        }
        
        String province = getProvince(city);
        
        // 如果是直辖市，只返回城市名
        if (province.equals("北京市") || province.equals("上海市") || 
            province.equals("天津市") || province.equals("重庆市")) {
            return province;
        }
        
        return province + " " + city;
    }
}

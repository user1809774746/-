package com.example.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class LocationService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    /**
     * 根据IP地址获取城市信息
     * 使用高德地图IP定位API
     */
    public String getCityFromIp(String ip) {
        try {
            // 如果是本地IP，返回默认城市
            if (ip == null || ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1") || ip.startsWith("192.168.")) {
                return "石家庄"; // 默认城市
            }
            
            // 调用高德地图IP定位API
            String url = "https://restapi.amap.com/v3/ip?ip=" + ip + "&key=YOUR_AMAP_KEY";
            
            // 这里需要配置高德地图API Key
            // 暂时返回默认城市，实际使用时需要申请API Key
            
            /*
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "1".equals(response.get("status"))) {
                return (String) response.get("city");
            }
            */
            
            return "石家庄"; // 默认城市
            
        } catch (Exception e) {
            System.err.println("IP定位失败: " + e.getMessage());
            return "石家庄"; // 默认城市
        }
    }
    
    /**
     * 根据经纬度获取城市信息
     */
    public String getCityFromLocation(double latitude, double longitude) {
        try {
            // 调用高德地图逆地理编码API
            String url = String.format("https://restapi.amap.com/v3/geocode/regeo?location=%f,%f&key=YOUR_AMAP_KEY", 
                longitude, latitude);
            
            // 这里需要配置高德地图API Key
            // 暂时返回默认城市
            
            /*
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "1".equals(response.get("status"))) {
                Map<String, Object> regeocode = (Map<String, Object>) response.get("regeocode");
                Map<String, Object> addressComponent = (Map<String, Object>) regeocode.get("addressComponent");
                return (String) addressComponent.get("city");
            }
            */
            
            return "石家庄"; // 默认城市
            
        } catch (Exception e) {
            System.err.println("逆地理编码失败: " + e.getMessage());
            return "石家庄"; // 默认城市
        }
    }
}
